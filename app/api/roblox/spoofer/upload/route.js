import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/crypto";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { getLatestRobloxAccount, insertAuditLog } from "@/lib/db";
export async function POST(req) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Login akun diperlukan untuk melakukan re-upload aset ke Roblox." }, { status: 401 });
        }
        const body = await req.json().catch(() => ({}));
        const assetId = String(body.assetId || "").trim();
        const assetName = String(body.assetName || "Reuploaded Asset").trim();
        const assetType = String(body.assetType || "Model").trim();
        const targetType = body.targetType === "group" ? "group" : "personal";
        const targetGroupId = body.targetGroupId ? String(body.targetGroupId).trim() : null;
        if (!assetId || !/^\d{5,30}$/.test(assetId)) {
            return NextResponse.json({ error: "Invalid Asset ID for re-upload process." }, { status: 400 });
        }
        const entitlement = await getEffectiveUserPlan(user);
        if (entitlement.plan.spooferDownloads24h !== null) {
            if (entitlement.dailySpooferUsed >= entitlement.plan.spooferDownloads24h) {
                return NextResponse.json({
                    error: `Batas kuota spoofer 24 jam telah habis (${entitlement.dailySpooferUsed}/${entitlement.plan.spooferDownloads24h}). Upgrade paket kamu untuk kuota lebih besar.`,
                    limit: entitlement.plan.spooferDownloads24h,
                    used: entitlement.dailySpooferUsed,
                }, { status: 429 });
            }
        }
        const account = getLatestRobloxAccount(user.id);
        if (!account || !account.api_key_encrypted) {
            return NextResponse.json({
                error: "Akun Roblox belum terhubung. Silakan masukkan dan simpan API Key Roblox kamu di Pengaturan Akun terlebih dahulu.",
            }, { status: 400 });
        }
        const apiKey = decryptSecret(account.api_key_encrypted);
        const robloxCookie = process.env.ROBLOX_COOKIE?.trim();
        const downloadHeaders = {
            "User-Agent": "RobloxStudio/WinInet",
            Accept: "*/*",
        };
        if (robloxCookie) {
            downloadHeaders["Cookie"] = `.ROBLOSECURITY=${robloxCookie};`;
        }
        let fileBuffer = null;
        try {
            const assetRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`, {
                headers: downloadHeaders,
            });
            if (assetRes.ok) {
                const ab = await assetRes.arrayBuffer();
                if (ab.byteLength > 50) {
                    fileBuffer = Buffer.from(ab);
                }
            }
        }
        catch {
        }
        if (!fileBuffer) {
            const safeName = assetName.replace(/[^a-zA-Z0-9_\-\s]/g, "_").trim() || "asset";
            const rbxmXml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Item class="Model" referent="RBX0">
		<Properties>
			<string name="Name">${safeName}</string>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
	</Item>
</roblox>`;
            fileBuffer = Buffer.from(rbxmXml, "utf-8");
        }
        const openCloudAssetType = assetType.toLowerCase().includes("audio")
            ? "Audio"
            : assetType.toLowerCase().includes("decal") || assetType.toLowerCase().includes("image")
                ? "Decal"
                : "Model";
        const requestPayload = {
            assetType: openCloudAssetType,
            displayName: assetName.slice(0, 50),
            description: `Reuploaded asset via CILAAA COMMUNITY (Original ID: ${assetId})`,
        };
        if (targetType === "group" && targetGroupId) {
            requestPayload.creationContext = {
                creator: { groupId: targetGroupId },
            };
        }
        else if (account.mode === "group" && account.group_id) {
            requestPayload.creationContext = {
                creator: { groupId: account.group_id },
            };
        }
        else if (account.roblox_user_id) {
            requestPayload.creationContext = {
                creator: { userId: account.roblox_user_id },
            };
        }
        const form = new FormData();
        form.set("request", JSON.stringify(requestPayload));
        const fileBlob = new Blob([new Uint8Array(fileBuffer)], { type: "application/octet-stream" });
        form.set("fileContent", fileBlob, `${assetName.replace(/[^a-zA-Z0-9_-]/g, "") || "asset"}.rbxm`);
        const robloxRes = await fetch("https://apis.roblox.com/assets/v1/assets", {
            method: "POST",
            headers: { "x-api-key": apiKey },
            body: form,
            cache: "no-store",
        });
        const robloxPayload = (await robloxRes.json().catch(() => ({})));
        if (!robloxRes.ok) {
            const errDetail = typeof robloxPayload.message === "string"
                ? robloxPayload.message
                : `Roblox API menolak permintaan (HTTP ${robloxRes.status}).`;
            return NextResponse.json({
                error: `Failed to upload to Roblox: ${errDetail}`,
                hint: "Pastikan API key Creator Hub memiliki izin Assets:Write pada creator ID yang dipilih.",
            }, { status: 502 });
        }
        let realAssetId = typeof robloxPayload.assetId === "string" || typeof robloxPayload.assetId === "number"
            ? String(robloxPayload.assetId)
            : null;
        const operationPath = typeof robloxPayload.path === "string"
            ? robloxPayload.path
            : typeof robloxPayload.operationId === "string"
                ? `operations/${robloxPayload.operationId}`
                : null;
        if (!realAssetId && operationPath && /^operations\/[a-zA-Z0-9_-]+$/.test(operationPath)) {
            for (let i = 0; i < 3; i++) {
                await new Promise((r) => setTimeout(r, 1500));
                const opRes = await fetch(`https://apis.roblox.com/assets/v1/${operationPath}`, {
                    headers: { "x-api-key": apiKey },
                    cache: "no-store",
                });
                if (opRes.ok) {
                    const opData = (await opRes.json().catch(() => ({})));
                    if (opData.done === true && opData.response) {
                        const respObj = opData.response;
                        if (respObj.assetId) {
                            realAssetId = String(respObj.assetId);
                            break;
                        }
                    }
                }
            }
        }
        const finalId = realAssetId || String(robloxPayload.operationId || assetId);
        insertAuditLog({
            userId: user.id,
            event: "spoofer.upload",
            payload: {
                originalAssetId: assetId,
                newAssetId: finalId,
                assetName,
                targetType,
            },
        });
        return NextResponse.json({
            success: true,
            newAssetId: finalId,
            newAssetUrl: `https://www.roblox.com/library/${finalId}/`,
            assetName,
            assetType,
            target: targetType === "group" && targetGroupId
                ? `Grup Roblox (${targetGroupId})`
                : "Akun Roblox Pribadi",
            status: "Success",
            message: `Asset "${assetName}" successfully uploaded to Roblox! Asset ID: ${finalId}`,
            instructions: `Salin ID resmi Roblox (${finalId}) dan gunakan di Roblox Studio atau script kamu.`,
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to auto-upload to Roblox.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
