import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEffectiveUserPlan } from "@/lib/entitlement";
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Login diperlukan." }, { status: 401 });
    }
    try {
        const entitlement = await getEffectiveUserPlan({
            id: user.id,
            discordUserId: user.discord_user_id,
        });
        return NextResponse.json({
            plan: {
                name: entitlement.plan.code,
                label: entitlement.plan.label,
                source: entitlement.source,
                dailyLimit: entitlement.plan.conversions24h,
                speedControl: entitlement.plan.speedControl,
                maxBatch: entitlement.plan.maxBatch,
                spooferLimit: entitlement.plan.spooferDownloads24h,
                autoUploadLimit: entitlement.plan.autoUploads24h,
            },
            dailyLimit: entitlement.plan.conversions24h,
            conversionsToday: entitlement.dailyConversionsUsed,
            dailyRemaining: entitlement.dailyConversionsRemaining,
            subscription: entitlement.subscription,
        }, { headers: { "Cache-Control": "no-store" } });
    }
    catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Tidak dapat memeriksa kuota akun." }, { status: 500 });
    }
}
