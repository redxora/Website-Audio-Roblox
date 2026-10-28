import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDiscordMemberDetails } from "@/lib/discord-plan";
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login Discord diperlukan." }, { status: 401 });
    }
    const discordId = user.discord_user_id;
    if (!discordId) {
        return NextResponse.json({ error: "Discord ID not found in session. Please sign in using Discord OAuth." }, { status: 422 });
    }
    const details = await getDiscordMemberDetails(discordId);
    return NextResponse.json({
        isMember: details.isMember,
        hasRole: Boolean(details.hasRole),
        discordUserId: details.discordUserId,
        roles: details.roles,
        plan: details.plan,
        username: details.username,
        globalName: details.globalName,
        status: details.status || "online",
        avatarUrl: details.avatarUrl,
        avatarDecorationUrl: details.avatarDecorationUrl,
        nameplateUrl: details.nameplateUrl,
        nameplateLabel: details.nameplateLabel,
        bannerUrl: details.bannerUrl,
        bannerColor: details.bannerColor,
        accentColor: details.accentColor,
        clanTag: details.clanTag,
        clanBadge: details.clanBadge,
        roleName: details.roleName,
        roleColor: details.roleColor,
        error: details.error,
    }, {
        headers: { "Cache-Control": "no-store" },
    });
}
