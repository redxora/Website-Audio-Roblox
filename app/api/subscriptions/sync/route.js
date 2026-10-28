import { NextResponse } from "next/server";
import crypto from "crypto";
import { syncUserDiscordSubscriptionRole, revokeExpiredDiscordSubscriptionRole, sendDiscordPurchaseEmbed, } from "@/lib/discord-sync";
import { getPlanConfig, normalizePlanCode } from "@/lib/plans";
import { getSubscriptionByUserId, updateSubscriptionSync, getUserById, insertAuditLog, } from "@/lib/db";
export const dynamic = "force-dynamic";
function verifySignature(rawBody, headerSignature) {
    const secret = process.env.INTERNAL_WEBHOOK_SECRET?.trim();
    if (!secret)
        return false;
    if (!headerSignature)
        return false;
    const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
    const a = Buffer.from(computed);
    const b = Buffer.from(headerSignature.trim());
    if (a.length !== b.length)
        return false;
    return crypto.timingSafeEqual(a, b);
}
async function reconcile(userId, record) {
    const sub = getSubscriptionByUserId(userId);
    const profile = getUserById(userId);
    const discordUserId = profile?.discord_user_id || null;
    const isActive = record.status === "active";
    const notExpired = !record.expires_at || new Date(record.expires_at).getTime() > Date.now();
    if (isActive && notExpired) {
        if (discordUserId) {
            const r = await syncUserDiscordSubscriptionRole(discordUserId, normalizePlanCode(record.plan_code || "free")).catch(() => ({ success: false, error: "sync failed" }));
            updateSubscriptionSync(userId, Boolean(r.success), r.success ? null : r.error || null);
            return { action: r.success ? "granted" : "grant_failed" };
        }
        return { action: "skipped_no_discord_id" };
    }
    if (discordUserId) {
        const r = await revokeExpiredDiscordSubscriptionRole(discordUserId).catch(() => ({
            success: false,
        }));
        const planConfig = getPlanConfig(record.plan_code || "free");
        await sendDiscordPurchaseEmbed({
            event: "subscription_expired",
            userId,
            userName: profile?.display_name || "Subscriber",
            discordUserId,
            planCode: normalizePlanCode(record.plan_code || "free"),
            planLabel: planConfig.label,
            amountIdr: planConfig.priceIdr,
            expiresAt: record.expires_at || undefined,
            roleSyncStatus: r.success ? "success" : "failed",
        }).catch(() => { });
        return { action: r.success ? "revoked" : "revoke_failed" };
    }
    return { action: "skipped_no_discord_id" };
}
export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-internal-signature");
        if (!verifySignature(rawBody, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
        let payload;
        try {
            payload = JSON.parse(rawBody);
        }
        catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        if (payload.table && payload.table !== "subscriptions") {
            return NextResponse.json({ ok: true, message: "Ignored table" });
        }
        const record = payload.record ?? payload.old_record;
        const userId = record?.user_id || payload.record?.user_id;
        if (!userId) {
            return NextResponse.json({ ok: true, message: "No user_id in payload" });
        }
        const result = await reconcile(userId, record || {});
        insertAuditLog({ userId, event: "subscription.sync", payload: { ...result, type: payload.type } });
        return NextResponse.json({ ok: true, event: payload.type, ...result });
    }
    catch (err) {
        console.error("[Subscription Sync Webhook Exception]:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Internal sync error" }, { status: 500 });
    }
}
