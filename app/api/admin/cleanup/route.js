import { NextResponse } from "next/server";
import { authorizeTask } from "@/lib/task-auth";
import { runStorageCleanup } from "@/lib/storage-cleanup";
export const dynamic = "force-dynamic";
async function handleCleanup(request) {
    const unauthorized = authorizeTask(request);
    if (unauthorized)
        return unauthorized;
    try {
        const result = await runStorageCleanup();
        return NextResponse.json({ ok: true, ...result });
    }
    catch (err) {
        return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Cleanup failed" }, { status: 500 });
    }
}
export async function GET(request) {
    return handleCleanup(request);
}
export async function POST(request) {
    return handleCleanup(request);
}
