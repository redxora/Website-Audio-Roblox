import dns from "node:dns";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
dns.setDefaultResultOrder("verbatim");
const execFileAsync = promisify(execFile);
const TYPE_MAPPING = {
    3: { typeName: "Audio", ext: "mp3", contentType: "audio/mpeg" },
    24: { typeName: "Animation", ext: "rbxm", contentType: "application/octet-stream" },
    61: { typeName: "Emote", ext: "rbxm", contentType: "application/octet-stream" },
    1: { typeName: "Image", ext: "png", contentType: "image/png" },
    13: { typeName: "Decal", ext: "png", contentType: "image/png" },
    10: { typeName: "Model", ext: "rbxm", contentType: "application/octet-stream" },
};
function formatSize(bytes) {
    const kb = bytes / 1024;
    if (kb >= 1024)
        return `${(kb / 1024).toFixed(2)}MB`;
    return `${kb.toFixed(2)}KB`;
}
function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
const TRANSPARENT_PNG_BUFFER = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
const SILENT_MP3_FRAME = Buffer.from([
    0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);
export async function fetchRobloxAsset(assetId) {
    const cleanId = assetId.replace(/\D/g, "");
    if (!cleanId)
        return null;
    let detailsData = null;
    let toolboxItem = null;
    let thumbData = null;
    await Promise.allSettled([
        (async () => {
            try {
                const res = await fetch(`https://economy.roblox.com/v2/assets/${cleanId}/details`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "application/json",
                    },
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok)
                    detailsData = await res.json();
            }
            catch { }
        })(),
        (async () => {
            try {
                const res = await fetch(`https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${cleanId}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "application/json",
                    },
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok) {
                    const d = await res.json();
                    toolboxItem = d?.data?.[0];
                }
            }
            catch { }
        })(),
        (async () => {
            try {
                const res = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${cleanId}&size=420x420&format=Png&isCircular=false`, {
                    headers: { Accept: "application/json" },
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok)
                    thumbData = await res.json();
            }
            catch { }
        })(),
    ]);
    const rawName = detailsData?.Name ||
        toolboxItem?.asset?.audioDetails?.title ||
        toolboxItem?.asset?.name ||
        `Roblox_Asset_${cleanId}`;
    const safeName = rawName.replace(/[/\\?%*:|"<>]/g, "_").trim() || `Asset_${cleanId}`;
    const typeId = Number(detailsData?.AssetTypeId || toolboxItem?.asset?.typeId || 3);
    const typeInfo = TYPE_MAPPING[typeId] || { typeName: "Asset", ext: "rbxm", contentType: "application/octet-stream" };
    const creatorName = toolboxItem?.asset?.audioDetails?.artist ||
        detailsData?.Creator?.Name ||
        toolboxItem?.creator?.name ||
        "Roblox Creator";
    const creatorId = String(detailsData?.Creator?.Id || toolboxItem?.creator?.id || "1");
    const creatorType = (detailsData?.Creator?.CreatorType === "Group" || toolboxItem?.creator?.type === 2) ? "Group" : "User";
    const privacy = detailsData?.IsPublicDomain ? "Public" : "Private";
    const description = (toolboxItem?.asset?.description || detailsData?.Description || "Uploaded via BLOKMARKET Audio").slice(0, 200);
    let durationSeconds = null;
    if (typeof toolboxItem?.asset?.duration === "number") {
        durationSeconds = Math.round(toolboxItem.asset.duration);
    }
    else if (typeof detailsData?.Duration === "number") {
        durationSeconds = Math.round(detailsData.Duration);
    }
    let durationFormatted = durationSeconds ? formatDuration(durationSeconds) : null;
    const imageUrl = thumbData?.data?.[0]?.imageUrl || `https://tr.rbxcdn.com/180DAY-${cleanId}/420/420/Image/Png/noFilter`;
    let fileBuffer = null;
    let ext = typeInfo.ext;
    let contentType = typeInfo.contentType;
    let isRestricted = false;
    if (typeInfo.typeName === "Image" || typeInfo.typeName === "Decal") {
        ext = "png";
        contentType = "image/png";
        if (imageUrl) {
            try {
                const imgRes = await fetch(imageUrl, {
                    headers: { "User-Agent": "Mozilla/5.0" },
                    signal: AbortSignal.timeout(8000),
                });
                if (imgRes.ok) {
                    const ab = await imgRes.arrayBuffer();
                    if (ab.byteLength > 64) {
                        fileBuffer = Buffer.from(ab);
                    }
                }
            }
            catch { }
        }
        if (!fileBuffer) {
            try {
                const assetRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${cleanId}`, {
                    headers: { "User-Agent": "RobloxStudio/WinInet" },
                    signal: AbortSignal.timeout(6000),
                });
                if (assetRes.ok) {
                    const ab = await assetRes.arrayBuffer();
                    if (ab.byteLength > 64) {
                        fileBuffer = Buffer.from(ab);
                    }
                }
            }
            catch { }
        }
        if (!fileBuffer) {
            fileBuffer = TRANSPARENT_PNG_BUFFER;
        }
    }
    else if (typeInfo.typeName === "Audio") {
        ext = "mp3";
        contentType = "audio/mpeg";
        const robloxCookie = process.env.ROBLOX_COOKIE?.trim();
        const headers = {
            "User-Agent": "RobloxStudio/WinInet",
            Accept: "*/*",
        };
        if (robloxCookie) {
            headers["Cookie"] = `.ROBLOSECURITY=${robloxCookie};`;
        }
        try {
            const assetRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${cleanId}`, {
                headers,
                signal: AbortSignal.timeout(8000),
            });
            if (assetRes.ok) {
                const ab = await assetRes.arrayBuffer();
                if (ab.byteLength > 1000) {
                    fileBuffer = Buffer.from(ab);
                }
            }
        }
        catch { }
        if (!fileBuffer) {
            const cleanTitle = rawName.replace(/[^\w\s]/gi, " ").replace(/\s+/g, " ").trim();
            const cleanArtist = creatorName.replace(/[^\w\s]/gi, " ").replace(/\s+/g, " ").trim();
            const query = cleanTitle.length >= 3
                ? cleanTitle
                : (cleanArtist.length >= 3 ? `${cleanArtist} ${cleanTitle}` : cleanId);
            const tempId = `roblox-audio-${Date.now()}-${cleanId}`;
            const outPattern = path.join(os.tmpdir(), `${tempId}.%(ext)s`).replace(/\\/g, "/");
            try {
                await execFileAsync("python", [
                    "-m", "yt_dlp",
                    "--no-playlist",
                    "--no-warnings",
                    "--no-check-certificates",
                    "--socket-timeout", "20",
                    "-f", "ba/b",
                    "--max-filesize", "50M",
                    "-o", outPattern,
                    `ytsearch1:${query}`,
                ], { timeout: 45000 });
                const tmpFiles = await fs.promises.readdir(os.tmpdir());
                const matched = tmpFiles.find((f) => f.startsWith(`${tempId}.`));
                if (matched) {
                    const fullPath = path.join(os.tmpdir(), matched);
                    fileBuffer = await fs.promises.readFile(fullPath);
                    await fs.promises.unlink(fullPath).catch(() => { });
                }
            }
            catch (dlErr) {
                console.warn(`[Roblox Audio Resolver] yt-dlp search fallback failed for asset ${cleanId}:`, dlErr);
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
        }
        if (!fileBuffer) {
            fileBuffer = SILENT_MP3_FRAME;
            isRestricted = true;
        }
        if (!durationSeconds && fileBuffer && fileBuffer.length > 1000) {
            durationSeconds = Math.max(1, Math.round(fileBuffer.length / 16000));
            durationFormatted = formatDuration(durationSeconds);
        }
    }
    else {
        ext = "rbxm";
        contentType = "application/octet-stream";
        let xmlContent = "";
        if (typeInfo.typeName === "Animation" || typeInfo.typeName === "Emote") {
            xmlContent = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<Item class="KeyframeSequence" referent="RBX0">
		<Properties>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<bool name="Loop">true</bool>
			<string name="Name">${safeName}</string>
			<Content name="AnimationId"><url>rbxassetid://${cleanId}</url></Content>
			<int64 name="SourceAssetId">${cleanId}</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
	</Item>
</roblox>`;
        }
        else {
            xmlContent = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Item class="Model" referent="RBX0">
		<Properties>
			<string name="Name">${safeName}</string>
			<int64 name="SourceAssetId">${cleanId}</int64>
		</Properties>
	</Item>
</roblox>`;
        }
        fileBuffer = Buffer.from(xmlContent, "utf-8");
    }
    const fileName = `${safeName}.${ext}`;
    const fileSizeFormatted = formatSize(fileBuffer.length);
    return {
        id: cleanId,
        name: rawName,
        title: rawName,
        typeId,
        typeName: typeInfo.typeName,
        creatorName,
        creatorId,
        creatorTargetId: creatorId,
        creatorType,
        privacy,
        audioPrivacy: privacy,
        durationSeconds,
        durationFormatted,
        audioDuration: durationFormatted,
        description,
        fileSizeFormatted,
        fileBuffer,
        fileName,
        ext,
        contentType,
        imageUrl,
        isRestricted,
    };
}
