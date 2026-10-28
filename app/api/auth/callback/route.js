import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeNextPath } from "@/lib/i18n";
import { exchangeCodeForToken, fetchDiscordUser, discordAvatarUrl, } from "@/lib/auth/discord";
import { createUserSession } from "@/lib/auth/session";
import { upsertUserFromDiscord } from "@/lib/db";
import { getDiscordMemberDetails } from "@/lib/discord-plan";
export const dynamic = "force-dynamic";
export async function GET(request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const store = await cookies();
    const savedState = store.get("oauth_state")?.value;
    const next = store.get("oauth_next")?.value || "/id/dashboard";
    store.delete("oauth_state");
    store.delete("oauth_next");
    if (!code || !state || !savedState || state !== savedState) {
        return NextResponse.redirect(new URL("/id?auth=callback_error", requestUrl.origin));
    }
    try {
        const token = await exchangeCodeForToken(code);
        const profile = await fetchDiscordUser(token.access_token);
        const user = upsertUserFromDiscord({
            discordUserId: profile.id,
            email: profile.email,
            displayName: profile.global_name || profile.username,
            avatarUrl: discordAvatarUrl(profile),
        });
        await createUserSession(user.id);
        const locale = next.startsWith("/en") ? "en" : "id";
        if (profile.id) {
            const member = await getDiscordMemberDetails(profile.id);
            if (!member.isMember) {
                return NextResponse.redirect(new URL(`/${locale}/join-discord`, requestUrl.origin));
            }
        }
        return NextResponse.redirect(new URL(safeNextPath(next, locale), requestUrl.origin));
    }
    catch (err) {
        console.error("[Discord OAuth Callback Error]:", err);
        return NextResponse.redirect(new URL("/id?auth=callback_error", requestUrl.origin));
    }
}
