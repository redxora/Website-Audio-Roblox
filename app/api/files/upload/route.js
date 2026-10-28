import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEffectiveUserPlan } from "@/lib/entitlement";
import { writeFileSafe, ensureStorageDir } from "@/lib/storage";
export const dynamic = "force-dynamic";
const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
function isValidAudioMagicBytes(buf) {
    if (buf.length < 4)
        return false;
    if (buf.subarray(0, 4).toString("ascii") === "RIFF")
        return true;
    if (buf.subarray(0, 4).toString("ascii") === "OggS")
        return true;
    if (buf.subarray(0, 4).toString("ascii") === "fLaC")
        return true;
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33)
        return true;
    if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)
        return true;
    if (buf.length >= 8 && buf.subarray(4, 8).toString("ascii") === "ftyp")
        return true;
    return false;
}
export async function POST(request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    const relativePath = request.headers.get("x-file-path");
    if (!relativePath || !relativePath.startsWith(`${user.id}/`) || relativePath.includes("..")) {
        return NextResponse.json({ error: "Invalid file location." }, { status: 400 });
    }
    const lowerPath = relativePath.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));
    if (!hasValidExt) {
        return NextResponse.json({
            error: `Format file tidak diizinkan. Hanya file audio yang didukung (${ALLOWED_EXTENSIONS.join(", ")}).`,
        }, { status: 400 });
    }
    const arrayBuffer = await request.arrayBuffer();
    if (!arrayBuffer.byteLength) {
        return NextResponse.json({ error: "File kosong." }, { status: 400 });
    }
    const buffer = Buffer.from(arrayBuffer);
    if (!isValidAudioMagicBytes(buffer)) {
        return NextResponse.json({
            error: "Isi file tidak terdeteksi sebagai format audio valid (didukung: MP3, WAV, OGG, FLAC, M4A).",
        }, { status: 400 });
    }
    const entitlement = await getEffectiveUserPlan({
        id: user.id,
        discordUserId: user.discord_user_id,
    });
    const maxMb = entitlement.plan.maxFileSizeMb;
    const maxBytes = maxMb * 1024 * 1024;
    if (buffer.length > maxBytes) {
        const uploadedMb = (buffer.length / (1024 * 1024)).toFixed(1);
        return NextResponse.json({
            error: `File terlalu besar (${uploadedMb} MB). Paket kamu (${entitlement.plan.label}) memiliki batas maksimal ${maxMb} MB per file. Silakan upgrade paket untuk kapasitas hingga 50 MB.`,
            planLimitMb: maxMb,
            uploadedMb: Number(uploadedMb),
        }, { status: 413 });
    }
    const contentType = request.headers.get("content-type") || "audio/wav";
    ensureStorageDir();
    try {
        const saved = await writeFileSafe(user.id, relativePath, buffer);
        return NextResponse.json({ ok: true, path: saved, contentType, size: buffer.length }, { status: 201 });
    }
    catch {
        return NextResponse.json({ error: "Gagal menyimpan file ke storage." }, { status: 500 });
    }
}
