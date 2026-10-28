export function getTeamMembersConfig() {
    const list = [];
    const ownerId = process.env.DISCORD_TEAM_OWNER_ID?.trim();
    if (ownerId)
        list.push({ id: ownerId, role: "Owner" });
    const creatorId = process.env.DISCORD_TEAM_CREATOR_ID?.trim();
    if (creatorId)
        list.push({ id: creatorId, role: "Creator" });
    const devIds = process.env.DISCORD_TEAM_DEVELOPER_IDS?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    for (const id of devIds) {
        list.push({ id, role: "Developer" });
    }
    const handleIds = process.env.DISCORD_TEAM_HANDLE_IDS?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    for (const id of handleIds) {
        list.push({ id, role: "Handle" });
    }
    return list;
}
let cachedTeamData = null;
const CACHE_TTL_MS = 20 * 1000;
export async function getTeamMembers() {
    const now = Date.now();
    if (cachedTeamData && now - cachedTeamData.timestamp < CACHE_TTL_MS) {
        return cachedTeamData.data;
    }
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const teamConfig = getTeamMembersConfig();
    const members = await Promise.all(teamConfig.map(async (item) => {
        let username = "User";
        let globalName = "Team Member";
        let avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
        let decorationUrl = null;
        let bannerUrl = null;
        let bannerColor = null;
        let accentColor = null;
        let clanTag = null;
        let clanBadgeUrl = null;
        let bio = null;
        try {
            const defaultIdx = Number((BigInt(item.id) >> 22n) % 6n);
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
        }
        catch { }
        if (botToken) {
            try {
                const res = await fetch(`https://discord.com/api/v10/users/${item.id}`, {
                    headers: { Authorization: `Bot ${botToken}` },
                    next: { revalidate: 20 },
                });
                if (res.ok) {
                    const data = await res.json();
                    username = data.username || username;
                    globalName = data.global_name || data.username || globalName;
                    bio = data.bio || null;
                    if (data.avatar) {
                        const isGif = data.avatar.startsWith("a_");
                        avatarUrl = `https://cdn.discordapp.com/avatars/${item.id}/${data.avatar}.${isGif ? "gif" : "png"}?size=256`;
                    }
                    if (data.avatar_decoration_data?.asset) {
                        decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${data.avatar_decoration_data.asset}.png?size=256`;
                    }
                    if (data.banner) {
                        const isGif = data.banner.startsWith("a_");
                        bannerUrl = `https://cdn.discordapp.com/banners/${item.id}/${data.banner}.${isGif ? "gif" : "png"}?size=600`;
                    }
                    if (data.banner_color) {
                        bannerColor = data.banner_color;
                    }
                    else if (typeof data.accent_color === "number") {
                        bannerColor = `#${data.accent_color.toString(16).padStart(6, "0")}`;
                    }
                    if (typeof data.accent_color === "number") {
                        accentColor = `#${data.accent_color.toString(16).padStart(6, "0")}`;
                    }
                    if (data.clan?.tag) {
                        clanTag = data.clan.tag;
                        if (data.clan.badge) {
                            clanBadgeUrl = `https://cdn.discordapp.com/clan-badges/${data.clan.identity_guild_id}/${data.clan.badge}.png?size=32`;
                        }
                    }
                }
            }
            catch {
            }
        }
        return {
            id: item.id,
            name: globalName,
            customRole: item.role,
            username,
            globalName,
            avatarUrl,
            decorationUrl,
            bannerUrl,
            bannerColor,
            accentColor,
            clanTag,
            clanBadgeUrl,
            bio,
        };
    }));
    cachedTeamData = { data: members, timestamp: now };
    return members;
}
