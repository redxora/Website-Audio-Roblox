import { PLAN_CONFIGS, getPlanConfig } from "./plans";
export function isLifetimeOrFullAccess(plan, roleName) {
    if (!plan)
        return false;
    if (plan.name === "lifetime")
        return true;
    if (plan.dailyLimit === null)
        return true;
    if (roleName) {
        const rn = roleName.toUpperCase();
        if (rn.includes("OWNER") ||
            rn.includes("ADMIN") ||
            rn.includes("STAF")) {
            return true;
        }
    }
    return false;
}
let cachedGuildRoles = null;
const ROLES_CACHE_TTL_MS = 60 * 1000;
export async function getDiscordGuildRoles() {
    const now = Date.now();
    if (cachedGuildRoles && now < cachedGuildRoles.expiresAt) {
        return cachedGuildRoles.data;
    }
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const map = new Map();
    if (!botToken || !guildId)
        return map;
    try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/roles`, {
            headers: { Authorization: `Bot ${botToken}` },
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
            const roles = await res.json();
            if (Array.isArray(roles)) {
                for (const r of roles) {
                    const hexColor = r.color ? `#${r.color.toString(16).padStart(6, "0")}` : "#ffffff";
                    map.set(r.id, {
                        id: r.id,
                        name: r.name,
                        color: r.color,
                        hexColor,
                        position: r.position,
                    });
                }
                cachedGuildRoles = { data: map, expiresAt: now + ROLES_CACHE_TTL_MS };
            }
        }
        else {
            cachedGuildRoles = { data: map, expiresAt: now + 10 * 1000 };
        }
    }
    catch (err) {
        console.warn("Failed to fetch role data from Discord API (timed out or network error)");
        cachedGuildRoles = { data: map, expiresAt: now + 10 * 1000 };
    }
    return map;
}
function getEnvRolePlanMap() {
    const map = {};
    const ownerRole = process.env.DISCORD_ROLE_OWNER?.trim();
    if (ownerRole)
        map[ownerRole] = "lifetime";
    const adminRole = process.env.DISCORD_ROLE_ADMIN?.trim();
    if (adminRole)
        map[adminRole] = "lifetime";
    const staffRole = process.env.DISCORD_ROLE_STAFF?.trim();
    if (staffRole)
        map[staffRole] = "lifetime";
    const lifetimeRole = process.env.DISCORD_ROLE_LIFETIME?.trim();
    if (lifetimeRole)
        map[lifetimeRole] = "lifetime";
    const monthlyRole = process.env.DISCORD_ROLE_MONTHLY?.trim();
    if (monthlyRole)
        map[monthlyRole] = "monthly";
    const boosterRole = process.env.DISCORD_ROLE_BOOSTER?.trim();
    if (boosterRole)
        map[boosterRole] = "monthly";
    const weeklyRole = process.env.DISCORD_ROLE_WEEKLY?.trim();
    if (weeklyRole)
        map[weeklyRole] = "weekly";
    const memberRole = process.env.DISCORD_ROLE_MEMBER?.trim();
    if (memberRole)
        map[memberRole] = "free";
    try {
        const raw = process.env.DISCORD_ROLE_PLAN_MAP || "{}";
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
            Object.assign(map, data);
        }
    }
    catch {
    }
    return map;
}
export function getHighestRoleInfo(roles, guildRolesMap) {
    const rolesMap = guildRolesMap || cachedGuildRoles?.data;
    if (rolesMap && rolesMap.size > 0) {
        const userRoles = roles
            .map((id) => rolesMap.get(id))
            .filter((r) => Boolean(r && r.name !== "@everyone"))
            .sort((a, b) => b.position - a.position);
        if (userRoles.length > 0) {
            const highest = userRoles[0];
            return {
                roleName: highest.name,
                roleColor: highest.color ? highest.hexColor : null,
            };
        }
    }
    return { roleName: roles.length > 0 ? "Member" : "Guest", roleColor: null };
}
const memberDetailsMemoryCache = new Map();
const MEMBER_CACHE_TTL_MS = 300 * 1000;
export function invalidateDiscordMemberCache(discordUserId) {
    if (discordUserId) {
        memberDetailsMemoryCache.delete(discordUserId);
    }
    else {
        memberDetailsMemoryCache.clear();
    }
}
export async function getDiscordMemberDetails(discordUserId) {
    if (discordUserId) {
        const cached = memberDetailsMemoryCache.get(discordUserId);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }
    }
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const freeCfg = PLAN_CONFIGS.free;
    const fallbackPlan = {
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
    if (!botToken || !guildId || !discordUserId) {
        return {
            isMember: false,
            discordUserId,
            roles: [],
            plan: fallbackPlan,
            roleName: "Guest",
            status: "online",
            error: "Discord configuration (DISCORD_BOT_TOKEN or DISCORD_GUILD_ID) is not set in environment.",
        };
    }
    try {
        const [memberRes, userRes, guildRolesMap] = await Promise.all([
            fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}`, {
                headers: { Authorization: `Bot ${botToken}` },
                cache: "no-store",
                signal: AbortSignal.timeout(8000),
            }),
            fetch(`https://discord.com/api/v10/users/${encodeURIComponent(discordUserId)}`, {
                headers: { Authorization: `Bot ${botToken}` },
                cache: "no-store",
                signal: AbortSignal.timeout(8000),
            }).catch(() => null),
            getDiscordGuildRoles(),
        ]);
        let uData = null;
        if (userRes && userRes.ok) {
            try {
                uData = await userRes.json();
            }
            catch { }
        }
        if (memberRes.status === 404) {
            let nonMemberAvatar = null;
            if (uData?.avatar) {
                const ext = uData.avatar.startsWith("a_") ? "gif" : "png";
                nonMemberAvatar = `https://cdn.discordapp.com/avatars/${discordUserId}/${uData.avatar}.${ext}?size=256`;
            }
            else {
                const defaultIdx = Number((BigInt(discordUserId) >> 22n) % 6n);
                nonMemberAvatar = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
            }
            const nonMemberDec = uData?.avatar_decoration_data?.asset
                ? `https://cdn.discordapp.com/avatar-decoration-presets/${uData.avatar_decoration_data.asset}.png?size=240&passthrough=true`
                : null;
            const nonMemberBanner = uData?.banner
                ? `https://cdn.discordapp.com/banners/${discordUserId}/${uData.banner}.${uData.banner.startsWith("a_") ? "gif" : "png"}?size=600`
                : null;
            const nonMemberNameplate = uData?.collectibles?.nameplate?.asset
                ? `https://cdn.discordapp.com/assets/collectibles/${uData.collectibles.nameplate.asset}static.png`
                : null;
            const nonMemberNameplateVideo = uData?.collectibles?.nameplate?.asset
                ? `https://cdn.discordapp.com/assets/collectibles/${uData.collectibles.nameplate.asset}asset.webm`
                : null;
            const nonMemberHasMonster = Boolean(uData?.collectibles?.nameplate?.asset?.includes("trapped_souls") ||
                uData?.avatar_decoration_data?.asset?.includes("bec26d0726a0f2eb7491a7cd40ac9c73"));
            const nonMemberResult = {
                isMember: false,
                hasRole: false,
                discordUserId,
                roles: [],
                plan: fallbackPlan,
                roleName: "Not Member",
                status: "online",
                username: uData?.username || undefined,
                globalName: uData?.global_name || uData?.username || undefined,
                bio: uData?.bio?.trim() || null,
                avatarUrl: nonMemberAvatar,
                avatarDecorationUrl: nonMemberDec,
                nameplateUrl: nonMemberNameplate,
                nameplateVideoUrl: nonMemberNameplateVideo,
                nameplateLabel: uData?.collectibles?.nameplate?.label || null,
                profileEffectUrl: null,
                profileEffectVideoUrl: null,
                bannerUrl: nonMemberBanner,
                bannerColor: uData?.banner_color || null,
                accentColor: uData?.accent_color ? `#${uData.accent_color.toString(16).padStart(6, "0")}` : uData?.banner_color || null,
                clanTag: uData?.clan?.tag || null,
                clanBadge: uData?.clan?.badge && uData?.clan?.identity_guild_id
                    ? `https://cdn.discordapp.com/clan-badges/${uData.clan.identity_guild_id}/${uData.clan.badge}.png?size=32`
                    : null,
            };
            memberDetailsMemoryCache.set(discordUserId, {
                data: nonMemberResult,
                expiresAt: Date.now() + 30 * 1000,
            });
            return nonMemberResult;
        }
        if (!memberRes.ok) {
            const errText = await memberRes.text().catch(() => "");
            return {
                isMember: false,
                hasRole: false,
                discordUserId,
                roles: [],
                plan: fallbackPlan,
                roleName: "Unknown",
                status: "online",
                error: `Discord API status ${memberRes.status}: ${errText}`,
            };
        }
        const member = (await memberRes.json());
        const roles = member.roles || [];
        const combinedMapping = getEnvRolePlanMap();
        const plans = roles.map((r) => combinedMapping[r]).filter(Boolean);
        const priority = [
            "lifetime",
            "unlimited",
            "LIFETIME",
            "monthly",
            "30days",
            "6months",
            "Weekly",
            "7days",
            "daily",
            "1day",
            "free",
        ];
        const rawPlan = priority.find((p) => plans.some((x) => String(x).toLowerCase() === p.toLowerCase())) || "free";
        const normalized = rawPlan.toLowerCase();
        const planName = normalized === "lifetime" || normalized === "unlimited"
            ? "lifetime"
            : normalized === "monthly" || normalized === "30days" || normalized === "6months"
                ? "monthly"
                : normalized === "weekly" || normalized === "7days"
                    ? "weekly"
                    : normalized === "daily" || normalized === "1day"
                        ? "daily"
                        : "free";
        const { roleName, roleColor } = getHighestRoleInfo(roles, guildRolesMap);
        let planLabel = "Free";
        let planPeriod = "FREE FOREVER";
        if (planName === "lifetime") {
            planLabel = "Lifetime";
            planPeriod = "LIFETIME ACCESS";
        }
        else if (planName === "monthly") {
            planLabel = "30 Days";
            planPeriod = "30 DAYS";
        }
        else if (planName === "weekly") {
            planLabel = "7 Days";
            planPeriod = "7 DAYS";
        }
        else if (planName === "daily") {
            planLabel = "1 Day";
            planPeriod = "24 HOURS";
        }
        else {
            planLabel = "Free";
            planPeriod = "FREE FOREVER";
        }
        const planCfg = getPlanConfig(planName);
        const planInfo = {
            name: planName,
            label: planLabel,
            period: planPeriod,
            source: plans.length > 0 ? "discord-role" : "free-fallback",
            dailyLimit: planCfg.conversions24h,
            speedControl: planCfg.speedControl,
            maxBatch: planCfg.maxBatch,
            spooferLimit: planCfg.spooferDownloads24h,
            autoUploadLimit: planCfg.autoUploads24h,
            prioritySupport: planCfg.prioritySupport,
            maxFileSizeMb: planCfg.maxFileSizeMb,
            maxDurationSeconds: planCfg.maxDurationSeconds,
            robloxGroupUpload: planCfg.robloxGroupUpload,
            speedRange: planCfg.speedRange,
            historyDays: planCfg.historyDays,
        };
        let avatarUrl = null;
        if (member.avatar) {
            const ext = member.avatar.startsWith("a_") ? "gif" : "png";
            avatarUrl = `https://cdn.discordapp.com/guilds/${guildId}/users/${discordUserId}/avatars/${member.avatar}.${ext}?size=256`;
        }
        else if (member.user?.avatar || uData?.avatar) {
            const av = member.user?.avatar || uData?.avatar;
            const ext = av?.startsWith("a_") ? "gif" : "png";
            avatarUrl = `https://cdn.discordapp.com/avatars/${discordUserId}/${av}.${ext}?size=256`;
        }
        else {
            try {
                const defaultIdx = Number((BigInt(discordUserId) >> 22n) % 6n);
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
            }
            catch {
                avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
            }
        }
        const decAsset = member.avatar_decoration_data?.asset ||
            member.user?.avatar_decoration_data?.asset ||
            uData?.avatar_decoration_data?.asset;
        const avatarDecorationUrl = decAsset
            ? `https://cdn.discordapp.com/avatar-decoration-presets/${decAsset}.png?size=240&passthrough=true`
            : null;
        const nameplateAsset = uData?.collectibles?.nameplate?.asset;
        const nameplateLabel = uData?.collectibles?.nameplate?.label || null;
        const nameplateUrl = nameplateAsset
            ? `https://cdn.discordapp.com/assets/collectibles/${nameplateAsset}static.png`
            : null;
        const nameplateVideoUrl = nameplateAsset
            ? `https://cdn.discordapp.com/assets/collectibles/${nameplateAsset}asset.webm`
            : null;
        const profileEffectAsset = uData?.collectibles?.profile_effect?.asset;
        const profileEffectVideoUrl = profileEffectAsset
            ? `https://cdn.discordapp.com/assets/collectibles/${profileEffectAsset}asset.webm`
            : null;
        const profileEffectUrl = null;
        const bannerHash = member.banner || member.user?.banner || uData?.banner;
        const bannerUrl = bannerHash
            ? `https://cdn.discordapp.com/banners/${discordUserId}/${bannerHash}.${bannerHash.startsWith("a_") ? "gif" : "png"}?size=600`
            : null;
        const bannerColor = member.user?.banner_color || uData?.banner_color || null;
        const accentColor = member.user?.accent_color || uData?.accent_color
            ? `#${(member.user?.accent_color || uData?.accent_color).toString(16).padStart(6, "0")}`
            : bannerColor;
        const clanTag = member.user?.clan?.tag || uData?.clan?.tag || null;
        const clanBadge = (member.user?.clan?.badge && member.user?.clan?.identity_guild_id) ||
            (uData?.clan?.badge && uData?.clan?.identity_guild_id)
            ? `https://cdn.discordapp.com/clan-badges/${member.user?.clan?.identity_guild_id || uData?.clan?.identity_guild_id}/${member.user?.clan?.badge || uData?.clan?.badge}.png?size=32`
            : null;
        const username = member.user?.username || uData?.username || undefined;
        const globalName = member.nick || member.user?.global_name || uData?.global_name || username || "User";
        const bio = (member.bio || member.user?.bio || uData?.bio || "").trim() || null;

        let liveStatus = "online";
        try {
            const lanyardRes = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`, {
                signal: AbortSignal.timeout(600),
                next: { revalidate: 15 },
            }).catch(() => null);
            if (lanyardRes && lanyardRes.ok) {
                const lData = (await lanyardRes.json().catch(() => null));
                if (lData?.success && lData.data?.discord_status) {
                    liveStatus = lData.data.discord_status;
                }
            }
        }
        catch {
        }
        const hasRole = Boolean(
            roleName &&
            roleName !== "Not Member" &&
            roleName !== "Guest" &&
            roleName !== "Error"
        );
        const result = {
            isMember: true,
            hasRole,
            discordUserId,
            roles,
            username,
            globalName,
            bio,
            status: liveStatus,
            avatarUrl,
            avatarDecorationUrl,
            nameplateUrl,
            nameplateVideoUrl,
            nameplateLabel,
            profileEffectUrl,
            profileEffectVideoUrl,
            bannerUrl,
            bannerColor,
            accentColor,
            clanTag,
            clanBadge,
            roleName,
            roleColor,
            plan: planInfo,
        };
        memberDetailsMemoryCache.set(discordUserId, {
            data: result,
            expiresAt: Date.now() + MEMBER_CACHE_TTL_MS,
        });
        return result;
    }
    catch (err) {
        console.warn("[Discord API Check Error]:", err?.message || err);
        const errorFallback = {
            isMember: true,
            hasRole: true,
            discordUserId,
            roles: [],
            plan: fallbackPlan,
            roleName: "Member",
            status: "online",
            error: err instanceof Error ? err.message : "Failed to connect to Discord API",
        };
        if (discordUserId) {
            memberDetailsMemoryCache.set(discordUserId, {
                data: errorFallback,
                expiresAt: Date.now() + 5 * 1000,
            });
        }
        return errorFallback;
    }
}
export async function getDiscordPlan(discordUserId) {
    const details = await getDiscordMemberDetails(discordUserId);
    return details.plan;
}
