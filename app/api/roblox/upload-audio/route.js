import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/crypto";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { getConversion, getLatestRobloxAccount, updateConversionStatus, claimConversion, } from "@/lib/db";
import { readFileSafe } from "@/lib/storage";
function robloxErrorText(value) {
    if (!value || typeof value !== "object") {
        return "Roblox processing failed.";
    }
    const candidate = value;
    if (typeof candidate.message === "string") {
        return candidate.message.slice(0, 240);
    }
    return "Roblox rejected the request.";
}
export async function GET(request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    const conversionId = new URL(request.url).searchParams.get("conversionId");
    if (!conversionId) {
        return NextResponse.json({ error: "conversionId is required." }, { status: 400 });
    }
    try {
        const conversion = getConversion(conversionId, user.id);
        if (!conversion) {
            return NextResponse.json({ error: "Conversion record not found." }, { status: 404 });
        }
        if (conversion.status !== "roblox_processing" || !conversion.roblox_operation_path) {
            return NextResponse.json({
                status: conversion.status,
                assetId: conversion.roblox_asset_id,
            });
        }
        const account = getLatestRobloxAccount(user.id);
        if (!account?.api_key_encrypted) {
            return NextResponse.json({ error: "API key Roblox tidak tersedia untuk memeriksa status." }, { status: 409 });
        }
        const path = String(conversion.roblox_operation_path);
        if (!/^operations\/[a-zA-Z0-9_-]+$/.test(path)) {
            return NextResponse.json({ error: "Invalid Roblox operation path format." }, { status: 500 });
        }
        const response = await fetch(`https://apis.roblox.com/assets/v1/${path}`, {
            headers: {
                "x-api-key": decryptSecret(account.api_key_encrypted),
            },
            cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({})));
        if (!response.ok) {
            return NextResponse.json({ error: `Roblox status check failed (HTTP ${response.status}).` }, { status: 502 });
        }
        if (payload.done !== true) {
            return NextResponse.json({ status: "roblox_processing", done: false }, { status: 202 });
        }
        if (payload.error) {
            const message = robloxErrorText(payload.error);
            updateConversionStatus(conversion.id, user.id, "failed");
            return NextResponse.json({ status: "failed", error: message });
        }
        const result = (payload.response && typeof payload.response === "object" ? payload.response : {});
        const assetId = typeof result.assetId === "number" || typeof result.assetId === "string"
            ? String(result.assetId)
            : null;
        if (assetId) {
            updateConversionStatus(conversion.id, user.id, "uploaded", { robloxAssetId: assetId });
        }
        return NextResponse.json({
            status: assetId ? "uploaded" : "roblox_processing",
            assetId,
            done: true,
        });
    }
    catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Tidak dapat memeriksa status Roblox." }, { status: 503 });
    }
}
export async function POST(request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const storagePath = String(body.storagePath || "");
    const displayName = String(body.displayName || "Converted audio")
        .replace(/[\r\n\u0000]/g, " ")
        .slice(0, 50);
    const durationSeconds = Number(body.durationSeconds);
    const conversionId = typeof body.conversionId === "string" ? body.conversionId : "";
    if (!storagePath.startsWith(`${user.id}/`) || storagePath.includes("..")) {
        return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
    }
    if (!conversionId) {
        return NextResponse.json({ error: "conversionId is required." }, { status: 400 });
    }
    const entitlement = await getEffectiveUserPlan({
        id: user.id,
        discordUserId: user.discord_user_id,
    });
    if (entitlement.plan.autoUploads24h !== null) {
        if (entitlement.dailyAutoUploadUsed >= entitlement.plan.autoUploads24h) {
            return NextResponse.json({
                error: `Batas upload audio Roblox 24 jam telah habis (${entitlement.dailyAutoUploadUsed}/${entitlement.plan.autoUploads24h}). Perpanjang atau upgrade paket kamu untuk kuota lebih besar.`,
                limit: entitlement.plan.autoUploads24h,
                used: entitlement.dailyAutoUploadUsed,
            }, { status: 429 });
        }
    }
    const maxAllowedSeconds = entitlement.plan.maxDurationSeconds;
    if (!Number.isFinite(durationSeconds) ||
        durationSeconds <= 0 ||
        durationSeconds > maxAllowedSeconds) {
        return NextResponse.json({
            error: `Durasi audio maksimal ${Math.round(maxAllowedSeconds / 60)} menit untuk paket kamu (${entitlement.plan.label}).`,
        }, { status: 400 });
    }
    let claimed = false;
    try {
        const account = getLatestRobloxAccount(user.id);
        if (!account?.api_key_encrypted) {
            return NextResponse.json({ error: "Belum ada akun Roblox Personal atau Group dengan API key yang tersimpan." }, { status: 409 });
        }
        const conversion = getConversion(conversionId, user.id);
        if (!conversion || conversion.output_file_path !== storagePath) {
            return NextResponse.json({ error: "Conversion not found or file path mismatch." }, { status: 404 });
        }
        if (conversion.status !== "prepared") {
            return NextResponse.json({ error: "This conversion has already been submitted or is no longer ready for upload." }, { status: 409 });
        }
        if (!claimConversion(conversionId, user.id)) {
            return NextResponse.json({ error: "Konversi sudah diproses oleh permintaan lain." }, { status: 409 });
        }
        claimed = true;
        const maxBytes = Math.max(1, Number.parseInt(process.env.MAX_UPLOAD_SIZE_MB || "50", 10) || 50) *
            1024 *
            1024;
        const fileBuffer = readFileSafe(storagePath);
        if (!fileBuffer) {
            throw new Error("Audio file not found in local storage.");
        }
        if (fileBuffer.byteLength > maxBytes) {
            throw new Error(`Audio melebihi batas ${Math.round(maxBytes / (1024 * 1024))} MB.`);
        }
        const key = decryptSecret(account.api_key_encrypted);
        const requestPayload = {
            assetType: "Audio",
            displayName,
            description: "Audio prepared by CILAAA COMMUNITY for Roblox. Upload is subject to Roblox moderation.",
        };
        if (account.mode === "group" && account.group_id) {
            requestPayload.creationContext = { creator: { groupId: account.group_id } };
        }
        else if (account.roblox_user_id) {
            requestPayload.creationContext = { creator: { userId: account.roblox_user_id } };
        }
        const form = new FormData();
        form.set("request", JSON.stringify(requestPayload));
        form.set("fileContent", new Blob([new Uint8Array(fileBuffer)], { type: "application/octet-stream" }), `${displayName.replace(/[^a-zA-Z0-9 _-]/g, "") || "audio"}.wav`);
        const response = await fetch("https://apis.roblox.com/assets/v1/assets", {
            method: "POST",
            headers: { "x-api-key": key },
            body: form,
            cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({})));
        if (!response.ok) {
            updateConversionStatus(conversionId, user.id, "failed");
            claimed = false;
            const safeMessage = robloxErrorText(payload) || `Roblox Asset API mengembalikan HTTP ${response.status}.`;
            return NextResponse.json({
                error: safeMessage,
                hint: "Periksa Assets:Write, creator ID, verifikasi akun kreator, batas unggahan, dan moderasi Roblox. Kunci API tidak ditampilkan.",
            }, { status: response.status === 429 ? 429 : 502 });
        }
        const operationPathRaw = typeof payload.path === "string"
            ? payload.path
            : typeof payload.operationId === "string"
                ? `operations/${payload.operationId}`
                : null;
        const operationPath = operationPathRaw && /^operations\/[a-zA-Z0-9_-]+$/.test(operationPathRaw)
            ? operationPathRaw
            : null;
        const assetId = typeof payload.assetId === "string" || typeof payload.assetId === "number"
            ? String(payload.assetId)
            : null;
        updateConversionStatus(conversionId, user.id, assetId ? "uploaded" : "roblox_processing", {
            robloxAssetId: assetId,
            robloxOperationPath: operationPath,
        });
        claimed = false;
        return NextResponse.json({
            ok: true,
            status: assetId ? "uploaded" : "processing",
            assetId,
            operationPath,
            message: assetId
                ? `Roblox asset ${assetId} created. It is still subject to Roblox moderation.`
                : "Roblox accepted the upload request. The asset may still be processing and is subject to moderation.",
        }, { status: 201 });
    }
    catch (error) {
        if (claimed) {
            updateConversionStatus(conversionId, user.id, "failed");
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : "Roblox upload failed." }, { status: 503 });
    }
}
