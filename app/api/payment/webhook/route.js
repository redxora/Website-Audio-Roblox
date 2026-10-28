import { NextResponse } from "next/server";
import { verifyTakoWebhookSignature } from "@/lib/tako";
import { getPlanConfig, normalizePlanCode } from "@/lib/plans";
import { sendDiscordPurchaseEmbed, syncUserDiscordSubscriptionRole, revokeExpiredDiscordSubscriptionRole, } from "@/lib/discord-sync";
import { getOrderByProviderRef, getOrderByTransactionId, markOrderPaid, getSubscriptionByUserId, upsertSubscription, getUserById, updateSubscriptionSync, insertAuditLog, setOrderRefunded, } from "@/lib/db";
export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-tako-signature");
        const isValid = verifyTakoWebhookSignature(rawBody, signature);
        if (!isValid) {
            console.warn("[Tako Webhook] Invalid signature rejected.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
        let payload;
        try {
            payload = JSON.parse(rawBody);
        }
        catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        if (payload.event === "payment.refunded" ||
            payload.event === "payment.cancelled" ||
            payload.event === "payment.expired") {
            return await handleReversal(payload.data ?? {});
        }
        if (payload.event !== "payment.success" || !payload.data) {
            return NextResponse.json({ ok: true, message: "Event ignored" });
        }
        const { id: transactionId, status, relatedGiftId, amount } = payload.data;
        if (status !== "success") {
            return NextResponse.json({ ok: true, message: `Status is not success (${status})` });
        }
        let matchedOrder = null;
        if (relatedGiftId) {
            matchedOrder = getOrderByProviderRef(relatedGiftId);
        }
        if (!matchedOrder && transactionId) {
            matchedOrder = getOrderByTransactionId(transactionId);
        }
        if (!matchedOrder) {
            console.error(`[Tako Webhook] Order not found for relatedGiftId: ${relatedGiftId}, transactionId: ${transactionId}`);
            insertAuditLog({
                userId: null,
                event: "payment.unmatched_webhook",
                payload: { payload: payload.data, receivedAt: new Date().toISOString() },
            });
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (matchedOrder.status === "paid") {
            return NextResponse.json({
                ok: true,
                message: "Order already processed and paid (idempotent).",
            });
        }
        const planCode = normalizePlanCode(matchedOrder.plan_code);
        const planConfig = getPlanConfig(planCode);
        const now = new Date();
        const paidAt = now.toISOString();
        markOrderPaid(matchedOrder.id, paidAt, transactionId || null, relatedGiftId || null);
        const existingSub = getSubscriptionByUserId(matchedOrder.user_id);
        let startsAt = paidAt;
        let expiresAt = null;
        let eventType = "subscription_activated";
        let customConfigStr = null;
        let customDays = null;
        try {
            if (matchedOrder.metadata) {
                const meta = JSON.parse(matchedOrder.metadata);
                if (meta.customConfig) {
                    customConfigStr = JSON.stringify(meta.customConfig);
                    if (meta.customConfig.days) {
                        customDays = Number(meta.customConfig.days);
                    }
                }
            }
        }
        catch { }
        const effectiveDurationDays = customDays ?? planConfig.durationDays;
        if (effectiveDurationDays !== null) {
            const durationMs = effectiveDurationDays * 24 * 60 * 60 * 1000;
            if (existingSub &&
                existingSub.status === "active" &&
                existingSub.expires_at &&
                new Date(existingSub.expires_at).getTime() > now.getTime()) {
                eventType = "subscription_renewed";
                startsAt = existingSub.starts_at;
                const currentExp = new Date(existingSub.expires_at).getTime();
                expiresAt = new Date(currentExp + durationMs).toISOString();
            }
            else {
                expiresAt = new Date(now.getTime() + durationMs).toISOString();
            }
        }
        else {
            expiresAt = null;
        }
        upsertSubscription({
            userId: matchedOrder.user_id,
            planCode,
            status: "active",
            startsAt,
            expiresAt,
            lastOrderId: matchedOrder.id,
            updatedAt: paidAt,
            custom_config: customConfigStr,
        });
        const profile = getUserById(matchedOrder.user_id);
        const discordUserId = profile?.discord_user_id || null;
        let roleSyncStatus = "skipped_no_discord_id";
        let roleSyncError;
        if (discordUserId) {
            const syncResult = await syncUserDiscordSubscriptionRole(discordUserId, planCode);
            if (syncResult.success) {
                roleSyncStatus = "success";
                updateSubscriptionSync(matchedOrder.user_id, true, null);
            }
            else {
                roleSyncStatus = "failed";
                roleSyncError = syncResult.error;
                updateSubscriptionSync(matchedOrder.user_id, false, syncResult.error ?? null);
            }
        }
        await sendDiscordPurchaseEmbed({
            event: eventType,
            orderId: matchedOrder.id,
            userId: matchedOrder.user_id,
            userName: profile?.display_name || "Cilaaa Customer",
            discordUserId,
            planCode,
            planLabel: planConfig.label,
            amountIdr: amount || matchedOrder.amount_idr,
            takoTransactionId: transactionId,
            takoGiftId: relatedGiftId,
            startsAt,
            expiresAt,
            roleSyncStatus,
            errorMessage: roleSyncError,
        });
        insertAuditLog({
            userId: matchedOrder.user_id,
            event: "payment.success",
            payload: {
                orderId: matchedOrder.id,
                planCode,
                amount: amount || matchedOrder.amount_idr,
                takoTransactionId: transactionId,
                takoGiftId: relatedGiftId,
                roleSyncStatus,
                roleSyncError,
                startsAt,
                expiresAt,
            },
        });
        return NextResponse.json({
            ok: true,
            orderId: matchedOrder.id,
            status: "active",
            plan: planConfig.label,
            startsAt,
            expiresAt,
            roleSyncStatus,
        });
    }
    catch (err) {
        console.error("[Tako Webhook Exception]:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Internal webhook processing error" }, { status: 500 });
    }
}
async function handleReversal(data) {
    const { id: transactionId, relatedGiftId } = data;
    let matchedOrder = null;
    if (relatedGiftId)
        matchedOrder = getOrderByProviderRef(relatedGiftId);
    if (!matchedOrder && transactionId)
        matchedOrder = getOrderByTransactionId(transactionId);
    if (!matchedOrder) {
        return NextResponse.json({ ok: true, message: "No order to reverse" });
    }
    setOrderRefunded(matchedOrder.id);
    const sub = getSubscriptionByUserId(matchedOrder.user_id);
    let roleRevoked = false;
    if (sub) {
        upsertSubscription({
            userId: matchedOrder.user_id,
            planCode: sub.plan_code,
            status: "cancelled",
            startsAt: sub.starts_at,
            expiresAt: sub.expires_at,
            lastOrderId: sub.last_order_id,
            updatedAt: new Date().toISOString(),
        });
        const profile = getUserById(matchedOrder.user_id);
        const discordUserId = profile?.discord_user_id || null;
        if (discordUserId) {
            const r = await revokeExpiredDiscordSubscriptionRole(discordUserId).catch(() => ({
                success: false,
            }));
            roleRevoked = Boolean(r.success);
        }
        const planConfig = getPlanConfig(matchedOrder.plan_code);
        await sendDiscordPurchaseEmbed({
            event: "subscription_expired",
            orderId: matchedOrder.id,
            userId: matchedOrder.user_id,
            userName: profile?.display_name || "Subscriber",
            discordUserId,
            planCode: matchedOrder.plan_code,
            planLabel: planConfig.label,
            amountIdr: matchedOrder.amount_idr,
            roleSyncStatus: roleRevoked ? "success" : "skipped_no_discord_id",
        }).catch(() => { });
    }
    return NextResponse.json({ ok: true, reversed: true, roleRevoked });
}
