import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { readFileSafe, deleteFileSafe, resolveStoragePath } from "@/lib/storage";
export const dynamic = "force-dynamic";
function contentTypeFor(name) {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "wav" || ext === "wave")
        return "audio/wav";
    if (ext === "mp3")
        return "audio/mpeg";
    if (ext === "ogg")
        return "audio/ogg";
    if (ext === "flac")
        return "audio/flac";
    if (ext === "m4a" || ext === "mp4")
        return "audio/mp4";
    return "application/octet-stream";
}
export async function GET(request, { params }) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    const { path } = await params;
    const relativePath = path.map((s) => decodeURIComponent(s)).join("/");
    const absPath = resolveStoragePath(user.id, relativePath);
    if (!absPath) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    const data = readFileSafe(relativePath, user.id);
    if (!data) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(data), {
        headers: {
            "Content-Type": contentTypeFor(relativePath),
            "Cache-Control": "private, max-age=300",
        },
    });
}
export async function DELETE(request, { params }) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    const { path } = await params;
    const relativePath = path.map((s) => decodeURIComponent(s)).join("/");
    const absPath = resolveStoragePath(user.id, relativePath);
    if (!absPath) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    const removed = await deleteFileSafe(relativePath, user.id);
    if (!removed) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
