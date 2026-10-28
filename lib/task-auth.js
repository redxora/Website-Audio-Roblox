import crypto from "crypto";
import { NextResponse } from "next/server";
export function authorizeTask(request) {
    const secret = process.env.TASK_SECRET?.trim();
    if (!secret) {
        return NextResponse.json({ error: "Task secret not configured on server." }, { status: 503 });
    }
    const authHeader = request.headers.get("authorization") || "";
    const provided = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : new URL(request.url).searchParams.get("key") || "";
    if (!provided) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
