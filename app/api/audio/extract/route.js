import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth/session";
import { getDiscordMemberDetails } from "@/lib/discord-plan";
import { resolveMediaMetadata } from "@/lib/media-resolver";
const execFileAsync = promisify(execFile);
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
function sanitizeFilename(name) {
    return name.replace(/[^\w\s.-]/gi, "").trim().slice(0, 80) || "audio";
}
async function tryCobaltFallback(rawUrl) {
    const instances = [
        "https://api.cobalt.tools/api/json",
        "https://cobalt-api.kwiatekm.tokyo/api/json",
    ];
    for (const endpoint of instances) {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: rawUrl,
                    isAudioOnly: true,
                    aFormat: "mp3",
                }),
                cache: "no-store",
            });
            if (!res.ok)
                continue;
            const data = (await res.json().catch(() => ({})));
            const streamUrl = typeof data.url === "string" ? data.url : null;
            if (!streamUrl)
                continue;
            const mediaRes = await fetch(streamUrl, { cache: "no-store" });
            if (!mediaRes.ok)
                continue;
            const arrayBuffer = await mediaRes.arrayBuffer();
            return { buffer: Buffer.from(arrayBuffer), ext: "mp3" };
        }
        catch {
        }
    }
    return null;
}
export async function POST(request) {
    let body;
    try {
        body = (await request.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
    }
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    if (!rawUrl) {
        return NextResponse.json({ error: "Audio URL is required." }, { status: 400 });
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(rawUrl);
        if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
            throw new Error("Protocol tidak didukung");
        }
    }
    catch {
        return NextResponse.json({ error: "Masukkan URL yang valid (https://...)." }, { status: 400 });
    }
    let maxDurationSeconds = 600;
    try {
        const sessionUser = await getSessionUser();
        if (sessionUser?.discord_user_id) {
            const details = await getDiscordMemberDetails(sessionUser.discord_user_id);
            if (details.plan?.name === "LIFETIME" || details.plan?.name === "unlimited") {
                maxDurationSeconds = 1800;
            }
            else if (details.plan?.name === "30days") {
                maxDurationSeconds = 1200;
            }
            else if (details.plan?.name === "7days") {
                maxDurationSeconds = 900;
            }
        }
    }
    catch {
        maxDurationSeconds = 600;
    }
    const metadata = await resolveMediaMetadata(rawUrl).catch(() => null);
    const resolvedTitle = metadata?.title || sanitizeFilename(parsedUrl.pathname.split("/").pop() || "audio");
    const safeName = sanitizeFilename(resolvedTitle);
    const tempId = `cilaaa-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const outPattern = path.join(os.tmpdir(), `${tempId}.%(ext)s`).replace(/\\/g, "/");
    try {
        await execFileAsync("python", [
            "-m",
            "yt_dlp",
            "--no-playlist",
            "--no-warnings",
            "--no-check-certificates",
            "--socket-timeout",
            "25",
            "--extractor-args",
            "youtube:player_client=android,web",
            "-f",
            "bestaudio/best",
            "--max-filesize",
            "100M",
            "-o",
            outPattern,
            parsedUrl.toString(),
        ], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
        const tmpFiles = await fs.promises.readdir(os.tmpdir());
        const matchedFile = tmpFiles.find((f) => f.startsWith(`${tempId}.`));
        if (matchedFile) {
            const fullPath = path.join(os.tmpdir(), matchedFile);
            const ext = path.extname(matchedFile).toLowerCase().replace(".", "");
            const stats = await fs.promises.stat(fullPath);
            if (stats.size > 80 * 1024 * 1024) {
                await fs.promises.unlink(fullPath).catch(() => { });
                return NextResponse.json({ error: "Ukuran audio melebihi batas maksimal 80 MB." }, { status: 413 });
            }
            const buffer = await fs.promises.readFile(fullPath);
            await fs.promises.unlink(fullPath).catch(() => { });
            let mimeType = "audio/webm";
            if (ext === "mp3")
                mimeType = "audio/mpeg";
            else if (ext === "m4a" || ext === "aac")
                mimeType = "audio/aac";
            else if (ext === "ogg")
                mimeType = "audio/ogg";
            else if (ext === "wav")
                mimeType = "audio/wav";
            return new NextResponse(new Uint8Array(buffer), {
                status: 200,
                headers: {
                    "Content-Type": mimeType,
                    "Content-Length": String(buffer.byteLength),
                    "x-audio-name": `${safeName}.${ext}`,
                    "x-audio-title": encodeURIComponent(resolvedTitle),
                    "x-audio-provider": metadata?.provider || "direct",
                    "x-audio-thumbnail": metadata?.thumbnailUrl || "",
                    "x-max-duration": String(maxDurationSeconds),
                    "Cache-Control": "no-store",
                },
            });
        }
    }
    catch (err) {
        console.warn("[yt-dlp warning, attempting fallback]:", err instanceof Error ? err.message : err);
    }
    finally {
        try {
            const tmpFiles = await fs.promises.readdir(os.tmpdir());
            for (const f of tmpFiles) {
                if (f.startsWith(`${tempId}.`)) {
                    await fs.promises.unlink(path.join(os.tmpdir(), f)).catch(() => { });
                }
            }
        }
        catch { }
    }
    const cobaltResult = await tryCobaltFallback(parsedUrl.toString());
    if (cobaltResult) {
        return new NextResponse(new Uint8Array(cobaltResult.buffer), {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": String(cobaltResult.buffer.byteLength),
                "x-audio-name": `${safeName}.${cobaltResult.ext}`,
                "x-audio-title": encodeURIComponent(resolvedTitle),
                "x-audio-provider": metadata?.provider || "direct",
                "x-audio-thumbnail": metadata?.thumbnailUrl || "",
                "x-max-duration": String(maxDurationSeconds),
                "Cache-Control": "no-store",
            },
        });
    }
    try {
        const directRes = await fetch(parsedUrl.toString(), { cache: "no-store" });
        const cType = directRes.headers.get("content-type") || "";
        if (directRes.ok && cType.toLowerCase().startsWith("audio/")) {
            const arr = await directRes.arrayBuffer();
            return new NextResponse(new Uint8Array(arr), {
                status: 200,
                headers: {
                    "Content-Type": cType,
                    "Content-Length": String(arr.byteLength),
                    "x-audio-name": `${safeName}.wav`,
                    "x-audio-title": encodeURIComponent(resolvedTitle),
                    "x-audio-provider": metadata?.provider || "direct",
                    "x-audio-thumbnail": metadata?.thumbnailUrl || "",
                    "x-max-duration": String(maxDurationSeconds),
                    "Cache-Control": "no-store",
                },
            });
        }
    }
    catch { }
    return NextResponse.json({
        error: "Failed to download audio from this link. Ensure the public YouTube, SoundCloud, or TikTok link is valid and accessible.",
    }, { status: 502 });
}
