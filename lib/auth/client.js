
let cache = null;
export async function getClientSessionUser(force = false) {
    if (!force && cache && Date.now() - cache.t < 5000)
        return cache.user;
    try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
            cache = { user: null, t: Date.now() };
            return null;
        }
        const data = (await res.json());
        cache = { user: data.user ?? null, t: Date.now() };
        return cache.user;
    }
    catch {
        cache = { user: null, t: Date.now() };
        return null;
    }
}
export function clearClientSessionCache() {
    cache = null;
}
export function startDiscordLogin(next) {
    const target = `/api/auth/discord?next=${encodeURIComponent(next)}`;
    if (typeof window !== "undefined") {
        window.location.assign(target);
    }
}
