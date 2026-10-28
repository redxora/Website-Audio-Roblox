import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { encryptSecret } from "@/lib/crypto";
import { getRobloxAccount, upsertRobloxAccount } from "@/lib/db";
const isNumeric = (value) => typeof value === "string" && /^\d{1,32}$/.test(value);
export async function POST(request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login Discord diperlukan." }, { status: 401 });
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const mode = String(body.mode || "");
    if (!["personal", "group"].includes(mode)) {
        return NextResponse.json({ error: "Mode Roblox harus personal atau group." }, { status: 400 });
    }
    const robloxUserId = body.robloxUserId === undefined ? "" : String(body.robloxUserId);
    const groupId = body.groupId === undefined ? "" : String(body.groupId);
    const rawKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    if (mode === "personal" && !isNumeric(robloxUserId)) {
        return NextResponse.json({ error: "Roblox User ID harus berisi angka." }, { status: 400 });
    }
    if (mode === "group" && !isNumeric(groupId)) {
        return NextResponse.json({ error: "Group ID harus berisi angka." }, { status: 400 });
    }
    if (rawKey.length > 512) {
        return NextResponse.json({ error: "API key terlalu panjang." }, { status: 400 });
    }
    try {
        const existing = getRobloxAccount(user.id, mode);
        const existingKey = existing?.api_key_encrypted || null;
        if (!rawKey && !existingKey) {
            return NextResponse.json({ error: "Masukkan API key Roblox yang dibuat di Creator Hub." }, { status: 400 });
        }
        let encrypted = existingKey;
        if (rawKey) {
            encrypted = encryptSecret(rawKey);
        }
        upsertRobloxAccount({
            userId: user.id,
            mode: mode,
            robloxUserId: isNumeric(robloxUserId) ? robloxUserId : null,
            groupId: mode === "group" ? groupId : null,
            universeId: null,
            apiKeyEncrypted: encrypted,
        });
        return NextResponse.json({
            ok: true,
            message: "Roblox configuration saved securely. API key encrypted.",
        });
    }
    catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Tidak dapat menyimpan akun Roblox." }, { status: 503 });
    }
}
