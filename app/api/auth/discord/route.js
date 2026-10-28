import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { buildAuthorizeUrl, isDiscordConfigured } from "@/lib/auth/discord";
export const dynamic = "force-dynamic";
export async function GET(request) {
    if (!isDiscordConfigured()) {
        return NextResponse.redirect(new URL("/id?auth=discord_not_configured", request.url));
    }
    const next = request.nextUrl.searchParams.get("next") || "/id/dashboard";
    const state = randomBytes(24).toString("hex");
    const store = await cookies();
    store.set("oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600,
    });
    store.set("oauth_next", next, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600,
    });
    return NextResponse.redirect(buildAuthorizeUrl(state));
}
