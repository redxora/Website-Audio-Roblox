import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { countConversionsSince, countAuditEventSince, getRecentOrders, } from "@/lib/db";
const OLDEST = "1970-01-01T00:00:00.000Z";
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const entitlement = await getEffectiveUserPlan({
            id: user.id,
            discordUserId: user.discord_user_id,
        });
        const totalConversions = countConversionsSince(user.id, OLDEST, "neq:failed");
        const totalUploads = countConversionsSince(user.id, OLDEST, "uploaded");
        const totalSpooferDownloads = countAuditEventSince(user.id, "spoofer.download", OLDEST);
        const recentOrders = getRecentOrders(user.id, 5);
        let daysRemaining = null;
        if (entitlement.subscription?.expires_at) {
            const msLeft = new Date(entitlement.subscription.expires_at).getTime() - Date.now();
            daysRemaining = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
        }
        return NextResponse.json({
            plan: {
                code: entitlement.plan.code,
                label: entitlement.plan.label,
                source: entitlement.source,
                isLifetime: entitlement.plan.code === "lifetime",
            },
            subscription: entitlement.subscription
                ? {
                    status: entitlement.subscription.status,
                    startsAt: entitlement.subscription.starts_at,
                    expiresAt: entitlement.subscription.expires_at,
                    daysRemaining,
                    discordRoleSynced: entitlement.subscription.discord_role_synced,
                }
                : null,
            quotas: {
                conversions: {
                    limit: entitlement.plan.conversions24h,
                    usedToday: entitlement.dailyConversionsUsed,
                    remaining: entitlement.dailyConversionsRemaining,
                    totalAllTime: totalConversions,
                },
                autoUploads: {
                    limit: entitlement.plan.autoUploads24h,
                    usedToday: entitlement.dailyAutoUploadUsed,
                    remaining: entitlement.dailyAutoUploadRemaining,
                    totalAllTime: totalUploads,
                },
                spoofer: {
                    limit: entitlement.plan.spooferDownloads24h,
                    usedToday: entitlement.dailySpooferUsed,
                    remaining: entitlement.dailySpooferRemaining,
                    totalAllTime: totalSpooferDownloads,
                },
            },
            recentOrders,
        }, { headers: { "Cache-Control": "no-store" } });
    }
    catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load account statistics" }, { status: 500 });
    }
}
