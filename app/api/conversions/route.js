import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { getExpiredConversions, deleteConversion, insertConversion, listConversions, getConversion, } from "@/lib/db";
import { fileExists, deleteFileSafe } from "@/lib/storage";
const RETENTION_DAYS = {
    free: 7,
    Weekly: 7,
    monthly: 30,
    lifetime: null,
};
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    try {
        const plan = await getEffectiveUserPlan({ id: user.id, discordUserId: user.discord_user_id });
        const days = plan.plan.historyDays;
        if (days !== null) {
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
            const expired = getExpiredConversions(cutoff, 200).filter((row) => row.user_id === user.id);
            for (const row of expired) {
                if (row.output_file_path)
                    await deleteFileSafe(row.output_file_path).catch(() => undefined);
                deleteConversion(row.id, user.id);
            }
        }
    }
    catch {
    }
    const conversions = listConversions(user.id, 100);
    return NextResponse.json({ conversions }, { headers: { "Cache-Control": "no-store" } });
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
    const outputName = String(body.outputName || "").slice(0, 180);
    const originalName = String(body.originalName || "audio").slice(0, 300);
    const bytes = Number(body.bytes);
    const duration = Number(body.durationSeconds);
    if (!storagePath.startsWith(`${user.id}/`) || storagePath.includes("..")) {
        return NextResponse.json({ error: "Invalid file location." }, { status: 400 });
    }
    const entitlement = await getEffectiveUserPlan({ id: user.id, discordUserId: user.discord_user_id });
    const maxMb = entitlement.plan.maxFileSizeMb;
    const maxBytes = maxMb * 1024 * 1024;
    const maxDuration = entitlement.plan.maxDurationSeconds;
    if (!outputName.toLowerCase().endsWith(".wav") ||
        !Number.isFinite(bytes) ||
        bytes < 44 ||
        bytes > maxBytes ||
        !Number.isFinite(duration) ||
        duration <= 0 ||
        duration > maxDuration) {
        const fileMb = Number.isFinite(bytes) ? (bytes / (1024 * 1024)).toFixed(1) : "0";
        const durationMin = Number.isFinite(duration) ? (duration / 60).toFixed(1) : "0";
        return NextResponse.json({
            error: `Audio melebihi batas paket ${entitlement.plan.label}: Maksimal ${maxMb} MB dan ${Math.round(maxDuration / 60)} menit (File: ${fileMb} MB, Durasi: ${durationMin} menit). Silakan upgrade paket untuk batas lebih tinggi.`,
            planLimitMb: maxMb,
            planMaxDurationSeconds: maxDuration,
        }, { status: 400 });
    }
    if (entitlement.plan.conversions24h !== null) {
        if (entitlement.dailyConversionsUsed >= entitlement.plan.conversions24h) {
            return NextResponse.json({
                error: `Kuota konversi 24 jam telah habis (${entitlement.dailyConversionsUsed}/${entitlement.plan.conversions24h}). Perpanjang atau upgrade paket kamu untuk kuota lebih besar.`,
                limit: entitlement.plan.conversions24h,
                used: entitlement.dailyConversionsUsed,
            }, { status: 429 });
        }
    }
    if (!fileExists(storagePath)) {
        return NextResponse.json({
            error: "Audio file not found in storage. Ensure the file has been uploaded first.",
        }, { status: 404 });
    }
    const requestedSpeed = Number(body.speed);
    const speed = Number.isFinite(requestedSpeed) && requestedSpeed >= 0.25 && requestedSpeed <= 4
        ? Math.round(requestedSpeed * 100) / 100
        : 2.3;
    const id = insertConversion({
        userId: user.id,
        originalName,
        outputName,
        outputFilePath: storagePath,
        bytes,
        durationSeconds: duration,
        speed,
        status: "prepared",
    });
    const conversion = getConversion(id, user.id);
    if (!conversion) {
        return NextResponse.json({ error: "Failed to save conversion history." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, conversion }, { status: 201 });
}
export async function DELETE(request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Conversion ID is required." }, { status: 400 });
    }
    try {
        const conversion = getConversion(id, user.id);
        if (!conversion) {
            return NextResponse.json({ error: "Conversion record not found." }, { status: 404 });
        }
        if (conversion.output_file_path) {
            await deleteFileSafe(conversion.output_file_path).catch(() => undefined);
        }
        const removed = deleteConversion(id, user.id);
        if (!removed) {
            return NextResponse.json({ error: "Failed to delete conversion record." }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    }
    catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete conversion record." }, { status: 503 });
    }
}
