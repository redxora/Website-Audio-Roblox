import { getActiveSubscription, getUserById, getUserByDiscordId, countConversionsSince, countAuditEventSince, updateSubscriptionSync, insertAuditEvent, getDb, } from "@/lib/db";
export { getUserByDiscordId, insertAuditEvent, getDb };
import { getPlanConfig, normalizePlanCode } from "@/lib/plans";
import { getDiscordMemberDetails } from "@/lib/discord-plan";
import { syncUserDiscordSubscriptionRole, } from "@/lib/discord-sync";
function resolveDiscordId(user) {
    return user.discordUserId ?? user.discord_user_id ?? null;
}
function toRecord(sub) {
    return {
        id: sub.id,
        user_id: sub.user_id,
        plan_code: normalizePlanCode(sub.plan_code),
        status: sub.status,
        starts_at: sub.starts_at,
        expires_at: sub.expires_at,
        last_order_id: sub.last_order_id,
        discord_role_synced: Boolean(sub.discord_role_synced),
        custom_config: sub.custom_config,
    };
}
export async function getActiveDatabaseSubscription(userId) {
    try {
        const sub = getActiveSubscription(userId);
        if (!sub)
            return null;
        const discordUserId = getUserById(userId)?.discord_user_id || null;
        if (discordUserId && sub.discord_role_synced !== 1) {
            const syncResult = await syncUserDiscordSubscriptionRole(discordUserId, normalizePlanCode(sub.plan_code)).catch(() => ({ success: false, error: "sync failed" }));
            updateSubscriptionSync(userId, Boolean(syncResult.success), syncResult.success ? null : syncResult.error || null);
        }
        return toRecord(sub);
    }
    catch {
        return null;
    }
}
export async function getEffectiveUserPlan(user) {
    const discordId = resolveDiscordId(user);
    const now = Date.now();
    const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const dbSub = await getActiveDatabaseSubscription(user.id);
    let discordPlanCode = "free";
    if (discordId) {
        try {
            const details = await getDiscordMemberDetails(discordId);
            discordPlanCode = normalizePlanCode(details.plan?.name);
        }
        catch { }
    }
    const priority = ["lifetime", "monthly", "weekly", "Weekly", "daily", "free"];
    let finalPlanCode = "free";
    let source = "free-fallback";
    const dbCode = dbSub ? dbSub.plan_code : "free";
    const dbIdx = priority.indexOf(dbCode);
    const discIdx = priority.indexOf(discordPlanCode);
    if (dbIdx !== -1 && (discIdx === -1 || dbIdx <= discIdx) && dbCode !== "free") {
        finalPlanCode = dbCode;
        source = "database-subscription";
    }
    else if (discordPlanCode !== "free") {
        finalPlanCode = discordPlanCode;
        source = "discord-role";
    }
    else {
        finalPlanCode = "free";
        source = "free-fallback";
    }
    let plan = getPlanConfig(finalPlanCode);
    if (dbSub?.custom_config) {
        try {
            const parsed = JSON.parse(dbSub.custom_config);
            plan = {
                ...plan,
                conversions24h: parsed.conversions24h !== undefined ? parsed.conversions24h : plan.conversions24h,
                autoUploads24h: parsed.autoUploads24h !== undefined ? parsed.autoUploads24h : plan.autoUploads24h,
                spooferDownloads24h: parsed.spooferDownloads24h !== undefined ? parsed.spooferDownloads24h : plan.spooferDownloads24h,
                maxFileSizeMb: parsed.maxFileSizeMb ?? plan.maxFileSizeMb,
                maxDurationSeconds: parsed.maxDurationSeconds ?? plan.maxDurationSeconds,
                maxBatch: parsed.maxBatch ?? plan.maxBatch,
                robloxGroupUpload: parsed.robloxGroupUpload ?? plan.robloxGroupUpload,
                speedControl: parsed.speedControl ?? plan.speedControl,
                historyDays: parsed.historyDays !== undefined ? parsed.historyDays : plan.historyDays,
                label: parsed.label || "Custom Plan",
            };
        }
        catch { }
    }
    let dailyConversionsUsed = 0;
    let dailyAutoUploadUsed = 0;
    let dailySpooferUsed = 0;
    try {
        dailyConversionsUsed = countConversionsSince(user.id, since24h, "neq:failed");
        dailyAutoUploadUsed = countConversionsSince(user.id, since24h, "uploaded");
        dailySpooferUsed = countAuditEventSince(user.id, "spoofer.download", since24h);
    }
    catch { }
    const dailyConversionsRemaining = plan.conversions24h === null
        ? null
        : Math.max(0, plan.conversions24h - dailyConversionsUsed);
    const dailySpooferRemaining = plan.spooferDownloads24h === null
        ? null
        : Math.max(0, plan.spooferDownloads24h - dailySpooferUsed);
    const dailyAutoUploadRemaining = plan.autoUploads24h === null
        ? null
        : Math.max(0, plan.autoUploads24h - dailyAutoUploadUsed);
    return {
        plan,
        source,
        subscription: dbSub,
        dailyConversionsUsed,
        dailyConversionsRemaining,
        dailySpooferUsed,
        dailySpooferRemaining,
        dailyAutoUploadUsed,
        dailyAutoUploadRemaining,
        dailyRobloxUsed: dailyAutoUploadUsed,
        discordId,
    };
}
export async function getQuotaSnapshot(user) {
    const e = await getEffectiveUserPlan(user);
    return {
        conversions: {
            limit: e.plan.conversions24h,
            used: e.dailyConversionsUsed,
            remaining: e.dailyConversionsRemaining,
        },
        spoofer: {
            limit: e.plan.spooferDownloads24h,
            used: e.dailySpooferUsed,
            remaining: e.dailySpooferRemaining,
        },
        autoUpload: {
            limit: e.plan.autoUploads24h,
            used: e.dailyAutoUploadUsed,
            remaining: e.dailyAutoUploadRemaining,
        },
        plan: { code: e.plan.code, label: e.plan.label, source: e.source },
    };
}
