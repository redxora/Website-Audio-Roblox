import { NextResponse } from "next/server";
import { resolveMediaMetadata } from "@/lib/media-resolver";
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    try {
        const meta = await resolveMediaMetadata(url);
        return NextResponse.json(meta, {
            headers: {
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    }
    catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch metadata" }, { status: 500 });
    }
}
