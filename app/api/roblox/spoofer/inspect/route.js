import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
const ASSET_TYPE_MAP = {
    24: { typeName: "Animation", ext: "rbxm" },
    61: { typeName: "Emote Animation", ext: "rbxm" },
    3: { typeName: "Audio", ext: "mp3" },
    1: { typeName: "Image", ext: "png" },
    13: { typeName: "Decal", ext: "png" },
    10: { typeName: "Model", ext: "rbxm" },
    4: { typeName: "Mesh", ext: "mesh" },
    38: { typeName: "Plugin", ext: "rbxm" },
    8: { typeName: "Hat", ext: "rbxm" },
    9: { typeName: "Place", ext: "rbxl" },
};
function formatBytes(bytes) {
    const kb = bytes / 1024;
    return kb >= 1024 ? `${(kb / 1024).toFixed(2)}MB` : `${kb.toFixed(1)}KB`;
}
async function probeAssetSize(assetId) {
    try {
        const res = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`, {
            method: "HEAD",
            headers: { "User-Agent": "RobloxStudio/WinInet", Accept: "*/*" },
            signal: AbortSignal.timeout(4000),
        });
        const len = res.headers.get("content-length");
        if (!res.ok || !len)
            return null;
        const bytes = Number(len);
        return Number.isFinite(bytes) && bytes > 0 ? formatBytes(bytes) : null;
    }
    catch {
        return null;
    }
}
export async function POST(req) {
    const startTime = performance.now();
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required to inspect Roblox assets." }, { status: 401 });
        }
        const body = await req.json().catch(() => ({}));
        const rawInput = String(body.assetIdOrUrl || "").trim();
        if (!rawInput) {
            return NextResponse.json({ error: "Mohon masukkan Asset ID atau URL Roblox yang valid." }, { status: 400 });
        }
        const match = rawInput.match(/\d{5,30}/);
        if (!match) {
            return NextResponse.json({ error: "Invalid ID. Please enter a valid numeric Asset ID (e.g., )." }, { status: 400 });
        }
        const assetId = match[0];
        const robloxRes = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Accept: "application/json",
            },
            next: { revalidate: 60 },
        }).catch(() => null);
        if (!robloxRes || !robloxRes.ok) {
            return NextResponse.json({ error: `Roblox asset [${assetId}] not found or is private.` }, { status: 404 });
        }
        const data = await robloxRes.json();
        const assetName = data.Name || "Roblox Asset";
        const typeId = Number(data.AssetTypeId || 0);
        const mapped = ASSET_TYPE_MAP[typeId] || { typeName: "Roblox Asset", ext: "rbxm" };
        const creator = data.Creator || {};
        const creatorName = creator.Name || "Roblox Creator";
        const creatorId = creator.Id ? String(creator.Id) : "1";
        const creatorType = creator.CreatorType === "Group" ? "groups" : "users";
        const fileSize = await probeAssetSize(assetId);
        const elapsedSeconds = Math.max(0.2, (performance.now() - startTime) / 1000).toFixed(1);
        return NextResponse.json({
            success: true,
            assetId,
            assetName,
            assetType: mapped.typeName,
            assetTypeId: typeId,
            fileExt: mapped.ext,
            fileName: `${assetName}.${mapped.ext}`,
            fileSize,
            creatorName,
            creatorId,
            creatorProfileUrl: `https://www.roblox.com/${creatorType}/${creatorId}/profile`,
            libraryUrl: `https://www.roblox.com/library/${assetId}/`,
            elapsedSeconds,
            instructions: 'Drag the attached file into Roblox Studio, then right click, choose "Save/Export", and then choose "Save to Roblox". Copy the new ID and replace the old ID with the new one.',
            instructionsId: 'Drag file yang diunduh ke dalam Roblox Studio, klik kanan lalu pilih "Save/Export", dan pilih "Save to Roblox". Salin ID baru yang didapat dan gantikan ID lama dengan ID baru tersebut.',
            downloadUrl: `/api/roblox/spoofer/download?assetId=${assetId}&name=${encodeURIComponent(assetName)}&ext=${mapped.ext}`,
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "An error occurred while inspecting the asset.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
