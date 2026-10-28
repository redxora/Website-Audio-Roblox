import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({
        user: {
            id: user.id,
            discordUserId: user.discord_user_id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            isAuthenticated: true,
        },
    }, { headers: { "Cache-Control": "no-store" } });
}
