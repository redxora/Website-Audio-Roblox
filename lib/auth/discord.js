const DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_ME_URL = "https://discord.com/api/users/@me";
export function getDiscordConfig() {
    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
    const redirectUri = process.env.DISCORD_REDIRECT_URI?.trim() ||
        `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/api/auth/callback`;
    if (!clientId || !clientSecret) {
        throw new Error("DISCORD_CLIENT_ID dan DISCORD_CLIENT_SECRET harus dikonfigurasi di environment.");
    }
    return { clientId, clientSecret, redirectUri };
}
export function isDiscordConfigured() {
    return Boolean(process.env.DISCORD_CLIENT_ID?.trim() && process.env.DISCORD_CLIENT_SECRET?.trim());
}
export function buildAuthorizeUrl(state) {
    const { clientId, redirectUri } = getDiscordConfig();
    const url = new URL(DISCORD_AUTHORIZE_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify email guilds");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "consent");
    return url.toString();
}
export async function exchangeCodeForToken(code) {
    const { clientId, clientSecret, redirectUri } = getDiscordConfig();
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
    });
    const res = await fetch(DISCORD_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Discord token exchange failed: ${res.status} ${text}`);
    }
    return (await res.json());
}
export async function fetchDiscordUser(accessToken) {
    const res = await fetch(DISCORD_ME_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch Discord profile: ${res.status}`);
    }
    return (await res.json());
}
export function discordAvatarUrl(profile) {
    if (!profile.avatar) {
        const idx = Number((BigInt(profile.id) >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    }
    const ext = profile.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${ext}?size=256`;
}
