import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getTakoGiftStatus } from "@/lib/tako";
import { getPlanConfig, normalizePlanCode } from "@/lib/plans";
import { sendDiscordPurchaseEmbed, syncUserDiscordSubscriptionRole, } from "@/lib/discord-sync";
import { getOrderById, markOrderPaid, getSubscriptionByUserId, upsertSubscription, getUserById, updateSubscriptionSync, insertAuditLog, expireStalePendingOrders, } from "@/lib/db";
export async function GET(request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");
        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId query parameter" }, { status: 400 });
        }
        const order = getOrderById(orderId);
        if (!order || order.user_id !== user.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        expireStalePendingOrders(5);
        const refreshedOrder = getOrderById(orderId);
        if (!refreshedOrder || refreshedOrder.user_id !== user.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (refreshedOrder.status === "cancelled") {
            return NextResponse.json({
                status: "cancelled",
                plan: getPlanConfig(refreshedOrder.plan_code).label,
                amount: refreshedOrder.amount_idr,
                paidAt: null,
                paymentUrl: refreshedOrder.payment_url,
                createdAt: refreshedOrder.created_at,
                expired: true,
            });
        }
        if (refreshedOrder.status === "pending" && refreshedOrder.provider_reference) {
            try {
                const takoCheck = await getTakoGiftStatus(refreshedOrder.provider_reference);
                if (takoCheck.success && takoCheck.data?.status === "success") {
                    const planCode = normalizePlanCode(refreshedOrder.plan_code);
                    const planConfig = getPlanConfig(planCode);
                    const now = new Date();
                    const paidAt = now.toISOString();
                    markOrderPaid(refreshedOrder.id, paidAt, refreshedOrder.provider_transaction_id, refreshedOrder.provider_reference);
                    const existingSub = getSubscriptionByUserId(user.id);
                    let startsAt = paidAt;
                    let expiresAt = null;
                    let eventType = "subscription_activated";
                    let customConfigStr = null;
                    let customDays = null;
                    try {
                        if (refreshedOrder.metadata) {
                            const meta = JSON.parse(refreshedOrder.metadata);
                            if (meta.customConfig) {
                                customConfigStr = JSON.stringify(meta.customConfig);
                                if (meta.customConfig.days)
                                    customDays = Number(meta.customConfig.days);
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
                            expiresAt = new Date(new Date(existingSub.expires_at).getTime() + durationMs).toISOString();
                        }
                        else {
                            expiresAt = new Date(now.getTime() + durationMs).toISOString();
                        }
                    }
                    upsertSubscription({
                        userId: user.id,
                        planCode,
                        status: "active",
                        startsAt,
                        expiresAt,
                        lastOrderId: refreshedOrder.id,
                        updatedAt: paidAt,
                        custom_config: customConfigStr,
                    });
                    const profile = getUserById(user.id);
                    const discordUserId = profile?.discord_user_id || null;
                    let roleSyncStatus = "skipped_no_discord_id";
                    let roleSyncError;
                    if (discordUserId) {
                        const syncResult = await syncUserDiscordSubscriptionRole(discordUserId, planCode);
                        if (syncResult.success) {
                            roleSyncStatus = "success";
                            updateSubscriptionSync(user.id, true, null);
                        }
                        else {
                            roleSyncStatus = "failed";
                            roleSyncError = syncResult.error;
                            updateSubscriptionSync(user.id, false, syncResult.error ?? null);
                        }
                    }
                    await sendDiscordPurchaseEmbed({
                        event: eventType,
                        orderId: refreshedOrder.id,
                        userId: user.id,
                        userName: profile?.display_name || user.email || "Customer",
                        discordUserId,
                        planCode,
                        planLabel: planConfig.label,
                        amountIdr: refreshedOrder.amount_idr,
                        takoGiftId: refreshedOrder.provider_reference,
                        startsAt,
                        expiresAt,
                        roleSyncStatus,
                        errorMessage: roleSyncError,
                    });
                    insertAuditLog({
                        userId: user.id,
                        event: "payment.success",
                        payload: {
                            orderId: refreshedOrder.id,
                            planCode,
                            amount: refreshedOrder.amount_idr,
                            takoGiftId: refreshedOrder.provider_reference,
                            roleSyncStatus,
                            startsAt,
                            expiresAt,
                            source: "polling",
                        },
                    });
                    return NextResponse.json({
                        status: "paid",
                        plan: planConfig.label,
                        amount: order.amount_idr,
                        paidAt,
                        startsAt,
                        expiresAt,
                        paymentUrl: order.payment_url,
                    });
                }
            }
            catch { }
        }
        return NextResponse.json({
            status: order.status,
            plan: getPlanConfig(order.plan_code).label,
            amount: order.amount_idr,
            paidAt: order.paid_at,
            paymentUrl: order.payment_url,
            createdAt: order.created_at,
        });
    }
    catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Error checking payment status" }, { status: 500 });
    }
}
