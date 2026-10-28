import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
export function detectProvider(rawUrl) {
    try {
        const url = new URL(rawUrl.trim());
        const host = url.hostname.toLowerCase();
        if (host.includes("youtube.com") ||
            host.includes("youtu.be") ||
            host.includes("music.youtube.com")) {
            return "youtube";
        }
        if (host.includes("tiktok.com")) {
            return "tiktok";
        }
        if (host.includes("soundcloud.com")) {
            return "soundcloud";
        }
        if (host.includes("spotify.com")) {
            return "spotify";
        }
        return "direct";
    }
    catch {
        return "direct";
    }
}
export function cleanAudioFilename(name) {
    let clean = name.replace(/\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)$/i, "");
    clean = clean.split("?")[0].split("#")[0];
    clean = clean.replace(/[_-]+/g, " ");
    clean = clean.replace(/\s+/g, " ").trim();
    return clean || "Audio Track";
}
export async function resolveMediaMetadata(rawUrl) {
    const provider = detectProvider(rawUrl);
    const trimmed = rawUrl.trim();
    const fallbackTitle = (() => {
        try {
            const u = new URL(trimmed);
            const lastSegment = u.pathname.split("/").filter(Boolean).pop() || "audio";
            return cleanAudioFilename(decodeURIComponent(lastSegment));
        }
        catch {
            return "Audio Track";
        }
    })();
    if (provider === "youtube") {
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`, { cache: "no-store", headers: { Accept: "application/json" } });
            if (res.ok) {
                const data = (await res.json());
                const title = typeof data.title === "string" ? data.title.trim() : "";
                const author = typeof data.author_name === "string" ? data.author_name.trim() : undefined;
                const thumbnail = typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
                if (title) {
                    return {
                        provider: "youtube",
                        providerLabel: "YouTube",
                        title,
                        author,
                        thumbnailUrl: thumbnail,
                        rawUrl: trimmed,
                    };
                }
            }
        }
        catch { }
    }
    if (provider === "soundcloud") {
        try {
            const res = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`, { cache: "no-store", headers: { Accept: "application/json" } });
            if (res.ok) {
                const data = (await res.json());
                const title = typeof data.title === "string" ? data.title.trim() : "";
                const author = typeof data.author_name === "string" ? data.author_name.trim() : undefined;
                const thumbnail = typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
                if (title) {
                    return {
                        provider: "soundcloud",
                        providerLabel: "SoundCloud",
                        title,
                        author,
                        thumbnailUrl: thumbnail,
                        rawUrl: trimmed,
                    };
                }
            }
        }
        catch { }
    }
    if (provider === "tiktok") {
        try {
            const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(trimmed)}`, { cache: "no-store", headers: { Accept: "application/json" } });
            if (res.ok) {
                const data = (await res.json());
                const title = typeof data.title === "string" ? data.title.trim() : "";
                const author = typeof data.author_name === "string" ? data.author_name.trim() : undefined;
                const thumbnail = typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
                if (title) {
                    return {
                        provider: "tiktok",
                        providerLabel: "TikTok",
                        title,
                        author,
                        thumbnailUrl: thumbnail,
                        rawUrl: trimmed,
                    };
                }
            }
        }
        catch { }
    }
    if (provider === "spotify") {
        try {
            const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`, { cache: "no-store", headers: { Accept: "application/json" } });
            if (res.ok) {
                const data = (await res.json());
                const title = typeof data.title === "string" ? data.title.trim() : "";
                const thumbnail = typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
                if (title) {
                    return {
                        provider: "spotify",
                        providerLabel: "Spotify",
                        title,
                        thumbnailUrl: thumbnail,
                        rawUrl: trimmed,
                    };
                }
            }
        }
        catch { }
    }
    try {
        const { stdout } = await execFileAsync("python", [
            "-m",
            "yt_dlp",
            "--no-playlist",
            "--no-warnings",
            "--print",
            "%(title)s",
            "--socket-timeout",
            "10",
            trimmed,
        ], { timeout: 12000 });
        const ytdlpTitle = stdout.trim().split("\n")[0]?.trim();
        if (ytdlpTitle && !ytdlpTitle.startsWith("http")) {
            return {
                provider,
                providerLabel: provider === "youtube"
                    ? "YouTube"
                    : provider === "tiktok"
                        ? "TikTok"
                        : provider === "soundcloud"
                            ? "SoundCloud"
                            : provider === "spotify"
                                ? "Spotify"
                                : "Direct Audio",
                title: ytdlpTitle,
                rawUrl: trimmed,
            };
        }
    }
    catch { }
    return {
        provider,
        providerLabel: provider === "youtube"
            ? "YouTube"
            : provider === "tiktok"
                ? "TikTok"
                : provider === "soundcloud"
                    ? "SoundCloud"
                    : provider === "spotify"
                        ? "Spotify"
                        : "Direct Audio",
        title: fallbackTitle,
        rawUrl: trimmed,
    };
}
