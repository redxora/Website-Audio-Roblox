import { NextResponse } from "next/server";
import { getTeamMembers } from "@/lib/team";
export const dynamic = "force-dynamic";
export async function GET() {
    const members = await getTeamMembers();
    return NextResponse.json(members, {
        headers: { "Cache-Control": "no-store, max-age=0" },
    });
}
