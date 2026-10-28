import { redirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getSessionUser } from "@/lib/auth/session";
import { getDiscordMemberDetails } from "@/lib/discord-plan";
import { PLAN_CONFIGS } from "@/lib/plans";
const freeCfg = PLAN_CONFIGS.free;
const defaultPlan = {
    name: "free",
    label: "Free",
    period: "FREE FOREVER",
    source: "free-fallback",
    dailyLimit: freeCfg.conversions24h,
    speedControl: freeCfg.speedControl,
    maxBatch: freeCfg.maxBatch,
    spooferLimit: freeCfg.spooferDownloads24h,
    autoUploadLimit: freeCfg.autoUploads24h,
    prioritySupport: freeCfg.prioritySupport,
    maxFileSizeMb: freeCfg.maxFileSizeMb,
    maxDurationSeconds: freeCfg.maxDurationSeconds,
    robloxGroupUpload: freeCfg.robloxGroupUpload,
    speedRange: freeCfg.speedRange,
    historyDays: freeCfg.historyDays,
};
const viewerSessionCache = new Map();
const VIEWER_CACHE_TTL_MS = 30 * 1000;
export function invalidateViewerCache(userId) {
    if (userId) {
        for (const key of viewerSessionCache.keys()) {
            if (key.includes(userId))
                viewerSessionCache.delete(key);
        }
    }
    else {
        viewerSessionCache.clear();
    }
}
export async function getViewer(localeValue, protect) {
    if (!isLocale(localeValue))
        return notFound();
    const locale = localeValue;
    const guestName = locale === "id" ? "Tamu" : "Guest";
    const user = await getSessionUser();
    const guest = () => ({
        locale,
        userName: guestName,
        globalName: guestName,
        bio: null,
        status: "online",
        avatarUrl: null,
        avatarDecorationUrl: null,
        nameplateUrl: null,
        nameplateVideoUrl: null,
        nameplateLabel: null,
        profileEffectUrl: null,
        profileEffectVideoUrl: null,
        bannerUrl: null,
        bannerColor: null,
        accentColor: null,
        clanTag: null,
        clanBadge: null,
        roleName: "Guest",
        roleColor: null,
        isAuthenticated: false,
        isMember: false,
        hasRole: false,
        discordUserId: null,
        roles: [],
        plan: defaultPlan,
    });
    if (!user) {
        if (protect)
            redirect(`/${locale}?auth=required`);
        return guest();
    }
    try {
        const discordUserId = user.discord_user_id;
        const fallbackName = user.display_name || user.email?.split("@")[0] || "User";
        let fallbackAvatar = user.avatar_url || null;
        if (!discordUserId) {
            if (protect)
                redirect(`/${locale}/join-discord`);
            return {
                ...guest(),
                locale,
                userName: fallbackName,
                globalName: fallbackName,
                avatarUrl: fallbackAvatar,
                isAuthenticated: true,
                roleName: "Account",
            };
        }
        const cacheKey = `${locale}:${user.id}`;
        const cachedViewer = viewerSessionCache.get(cacheKey);
        if (cachedViewer && Date.now() < cachedViewer.expiresAt) {
            if (protect && !cachedViewer.data.isMember) {
                redirect(`/${locale}/join-discord`);
            }
            return cachedViewer.data;
        }
        const memberDetails = await getDiscordMemberDetails(discordUserId);
        const hasRole = Boolean(memberDetails.hasRole || memberDetails.isMember);
        if (protect && !memberDetails.isMember) {
            redirect(`/${locale}/join-discord`);
        }
        let finalPlan = memberDetails.plan;
        let finalRoleName = memberDetails.roleName || memberDetails.plan.label;
        try {
            const { getActiveDatabaseSubscription } = await import("@/lib/entitlement");
            const dbSub = await getActiveDatabaseSubscription(user.id);
            if (dbSub && dbSub.status === "active") {
                const { getPlanConfig } = await import("@/lib/plans");
                const priority = ["lifetime", "monthly", "weekly", "daily", "free"];
                const currentIdx = priority.indexOf(finalPlan.name.toLowerCase());
                const dbIdx = priority.indexOf(dbSub.plan_code.toLowerCase());
                if (dbIdx !== -1 && (currentIdx === -1 || dbIdx < currentIdx)) {
                    const cfg = getPlanConfig(dbSub.plan_code);
                    finalPlan = {
                        name: dbSub.plan_code.toLowerCase(),
                        label: cfg.label,
                        period: dbSub.plan_code.toLowerCase() === "lifetime"
                            ? "LIFETIME ACCESS"
                            : dbSub.plan_code.toLowerCase() === "monthly"
                                ? "30 DAYS"
                                : dbSub.plan_code.toLowerCase() === "weekly"
                                    ? "7 DAYS"
                                    : "24 HOURS",
                        source: "discord-role",
                        dailyLimit: cfg.conversions24h,
                        speedControl: cfg.speedControl,
                        maxBatch: cfg.maxBatch,
                        spooferLimit: cfg.spooferDownloads24h,
                        autoUploadLimit: cfg.autoUploads24h,
                        prioritySupport: cfg.prioritySupport,
                        maxFileSizeMb: cfg.maxFileSizeMb,
                        maxDurationSeconds: cfg.maxDurationSeconds,
                        robloxGroupUpload: cfg.robloxGroupUpload,
                        speedRange: cfg.speedRange,
                        historyDays: cfg.historyDays,
                    };
                    finalRoleName = cfg.label;
                }
            }
        }
        catch { }
        const viewerResult = {
            locale,
            userName: memberDetails.username || fallbackName,
            globalName: memberDetails.globalName || memberDetails.username || fallbackName,
            bio: memberDetails.bio || null,
            status: memberDetails.status || "online",
            avatarUrl: memberDetails.avatarUrl || fallbackAvatar,
            avatarDecorationUrl: memberDetails.avatarDecorationUrl || null,
            nameplateUrl: memberDetails.nameplateUrl || null,
            nameplateVideoUrl: memberDetails.nameplateVideoUrl || null,
            nameplateLabel: memberDetails.nameplateLabel || null,
            profileEffectUrl: memberDetails.profileEffectUrl || null,
            profileEffectVideoUrl: memberDetails.profileEffectVideoUrl || null,
            bannerUrl: memberDetails.bannerUrl || null,
            bannerColor: memberDetails.bannerColor || null,
            accentColor: memberDetails.accentColor || null,
            clanTag: memberDetails.clanTag || null,
            clanBadge: memberDetails.clanBadge || null,
            roleName: finalRoleName,
            roleColor: memberDetails.roleColor || null,
            isAuthenticated: true,
            isMember: memberDetails.isMember,
            hasRole,
            discordUserId,
            roles: memberDetails.roles,
            plan: finalPlan,
        };
        viewerSessionCache.set(cacheKey, {
            data: viewerResult,
            expiresAt: Date.now() + VIEWER_CACHE_TTL_MS,
        });
        return viewerResult;
    }
    catch (error) {
        if (error &&
            typeof error === "object" &&
            "digest" in error &&
            String(error.digest).startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        if (protect)
            redirect(`/${locale}?auth=required`);
        return guest();
    }
}
