export const CILAAA_LOGO = "/asset/image/logo/logo.webp";
const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;
export function parseYouTubeId(input) {
    const value = input.trim();
    if (!value)
        return null;
    const short = value.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short)
        return short[1];
    const watch = value.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch)
        return watch[1];
    const path = value.match(/youtube\.com\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
    if (path)
        return path[1];
    if (YOUTUBE_ID.test(value))
        return value;
    return null;
}
export function youtubeThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
export function resolveCover(originalName, customThumbnail) {
    if (customThumbnail && /^https?:\/\//.test(customThumbnail)) {
        return { src: customThumbnail, kind: "image" };
    }
    const videoId = parseYouTubeId(originalName);
    if (videoId) {
        return { src: youtubeThumbnailUrl(videoId), kind: "youtube" };
    }
    return { src: CILAAA_LOGO, kind: "default" };
}
