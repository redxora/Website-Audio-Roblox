import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { insertAuditLog } from "@/lib/db";
export async function GET(req) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required to download spoofed assets." }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const assetId = searchParams.get("assetId")?.trim();
        const rawName = searchParams.get("name")?.trim() || "Roblox_Asset";
        const ext = searchParams.get("ext")?.trim() || "rbxm";
        if (!assetId || !/^\d{5,30}$/.test(assetId)) {
            return NextResponse.json({ error: "Invalid Asset ID" }, { status: 400 });
        }
        const entitlement = await getEffectiveUserPlan({
            id: user.id,
            discordUserId: user.discord_user_id,
        });
        if (entitlement.plan.spooferDownloads24h !== null) {
            if (entitlement.dailySpooferUsed >= entitlement.plan.spooferDownloads24h) {
                return NextResponse.json({
                    error: `Batas unduhan spoofer 24 jam telah habis (${entitlement.dailySpooferUsed}/${entitlement.plan.spooferDownloads24h}). Upgrade ke Monthly atau Lifetime untuk kuota lebih besar.`,
                    limit: entitlement.plan.spooferDownloads24h,
                    used: entitlement.dailySpooferUsed,
                }, { status: 429 });
            }
        }
        const safeName = rawName.replace(/[^a-zA-Z0-9_\-\s]/g, "_").trim() || "asset";
        const filename = `${safeName}.${ext}`;
        const robloxCookie = process.env.ROBLOX_COOKIE?.trim();
        const headers = {
            "User-Agent": "RobloxStudio/WinInet",
            Accept: "*/*",
        };
        if (robloxCookie) {
            headers["Cookie"] = `.ROBLOSECURITY=${robloxCookie};`;
        }
        let fileBuffer = null;
        let mimeType = ext === "mp3" ? "audio/mpeg" : ext === "png" ? "image/png" : "application/octet-stream";
        try {
            const assetRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`, {
                headers,
            });
            if (assetRes.ok) {
                const buffer = await assetRes.arrayBuffer();
                if (buffer.byteLength > 100) {
                    fileBuffer = buffer;
                }
            }
        }
        catch {
        }
        if (!fileBuffer) {
            let rbxmXml = "";
            if (ext === "rbxm") {
                rbxmXml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<Item class="KeyframeSequence" referent="RBX0">
		<Properties>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<bool name="Loop">true</bool>
			<string name="Name">${safeName}</string>
			<Content name="AnimationId"><url>rbxassetid://${assetId}</url></Content>
			<int64 name="SourceAssetId">${assetId}</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
	</Item>
</roblox>`;
            }
            else {
                rbxmXml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Item class="Sound" referent="RBX0">
		<Properties>
			<string name="Name">${safeName}</string>
			<Content name="SoundId"><url>rbxassetid://${assetId}</url></Content>
			<int64 name="SourceAssetId">${assetId}</int64>
		</Properties>
	</Item>
</roblox>`;
            }
            const enc = new TextEncoder();
            fileBuffer = enc.encode(rbxmXml).buffer;
            mimeType = "application/octet-stream";
        }
        insertAuditLog({
            userId: user.id,
            event: "spoofer.download",
            payload: {
                assetId,
                filename,
                ext,
                sizeBytes: fileBuffer.byteLength,
            },
        });
        return new Response(fileBuffer, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Type": mimeType,
                "Content-Length": String(fileBuffer.byteLength),
            },
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Download failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
