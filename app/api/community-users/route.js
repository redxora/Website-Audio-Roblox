import { NextResponse } from "next/server";
let cachedCommunity = null;
const CACHE_DURATION_MS = 5 * 60 * 1000;
export async function GET() {
    const now = Date.now();
    if (cachedCommunity && now - cachedCommunity.timestamp < CACHE_DURATION_MS) {
        return NextResponse.json({
            subscribers: cachedCommunity.subscribers,
            registeredUsers: cachedCommunity.registeredUsers,
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
            },
        });
    }
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const roleOwner = process.env.DISCORD_ROLE_OWNER?.trim() || "";
    const roleAdmin = process.env.DISCORD_ROLE_ADMIN?.trim() || "";
    const roleStaff = process.env.DISCORD_ROLE_STAFF?.trim() || "";
    const roleLifetime = process.env.DISCORD_ROLE_LIFETIME?.trim() || "";
    const roleMonthly = process.env.DISCORD_ROLE_MONTHLY?.trim() || "";
    const roleWeekly = process.env.DISCORD_ROLE_WEEKLY?.trim() || "";
    const roleBooster = process.env.DISCORD_ROLE_BOOSTER?.trim() || "";
    const ROLE_PRIORITY_LIST = [
        { id: roleOwner, label: "Owner", isSub: true },
        { id: roleAdmin, label: "Admin", isSub: true },
        { id: roleStaff, label: "Staff", isSub: true },
        { id: roleLifetime, label: "Lifetime", isSub: true },
        { id: roleMonthly, label: "Bulanan", isSub: true },
        { id: roleWeekly, label: "Mingguan", isSub: true },
        { id: roleBooster, label: "Booster", isSub: true },
    ].filter((p) => Boolean(p.id));
    try {
        const membersMap = new Map();
        if (botToken && guildId) {
            const searchQueries = ["a", "e", "i", "o", "u", "s", "r", "c", "m"];
            await Promise.allSettled(searchQueries.map(async (q) => {
                try {
                    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/search?query=${encodeURIComponent(q)}&limit=100`, {
                        headers: { Authorization: `Bot ${botToken}` },
                        cache: "no-store",
                    });
                    if (res.ok) {
                        const list = await res.json();
                        if (Array.isArray(list)) {
                            for (const m of list) {
                                if (m.user && !m.user.bot && !membersMap.has(m.user.id)) {
                                    membersMap.set(m.user.id, m);
                                }
                            }
                        }
                    }
                }
                catch {
                }
            }));
        }
        let liveSubscribers = [];
        let liveRegistered = [];
        if (membersMap.size > 0) {
            for (const m of membersMap.values()) {
                if (!m.user)
                    continue;
                const roles = m.roles || [];
                let role = "Member";
                let isSubscriber = false;
                for (const p of ROLE_PRIORITY_LIST) {
                    if (roles.includes(p.id)) {
                        role = p.label;
                        isSubscriber = p.isSub;
                        break;
                    }
                }
                const name = m.nick || m.user.global_name || m.user.username;
                const avatar = m.user.avatar
                    ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=128`
                    : `https://cdn.discordapp.com/embed/avatars/${(BigInt(m.user.id) >> 22n) % 6n}.png`;
                const userObj = {
                    id: m.user.id,
                    name,
                    avatar,
                    role,
                    isSubscriber,
                };
                if (isSubscriber) {
                    liveSubscribers.push(userObj);
                }
                else {
                    liveRegistered.push(userObj);
                }
            }
        }
        const subscribers = liveSubscribers.length >= 5
            ? liveSubscribers
            : [
                ...liveSubscribers,
                ...REAL_COMMUNITY_SUBSCRIBERS.filter((r) => !liveSubscribers.some((l) => l.name === r.name)),
            ];
        const registeredUsers = liveRegistered.length >= 10
            ? liveRegistered
            : [
                ...liveRegistered,
                ...REAL_COMMUNITY_REGISTERED.filter((r) => !liveRegistered.some((l) => l.name === r.name)),
            ];
        cachedCommunity = {
            subscribers,
            registeredUsers,
            timestamp: Date.now(),
        };
        return NextResponse.json({
            subscribers,
            registeredUsers,
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
            },
        });
    }
    catch (error) {
        console.error("[Community Users API Error]:", error);
        return NextResponse.json({
            subscribers: REAL_COMMUNITY_SUBSCRIBERS,
            registeredUsers: REAL_COMMUNITY_REGISTERED,
        }, { status: 200 });
    }
}
