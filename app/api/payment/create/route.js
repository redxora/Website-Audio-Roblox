import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getPlanConfig, normalizePlanCode } from "@/lib/plans";
import { createTakoPayment } from "@/lib/tako";
import { createOrder, setOrderFailed, updateOrderProviderInfo, insertAuditLog, } from "@/lib/db";
export async function POST(request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required to purchase a plan." }, { status: 401 });
        }
        let body;
        try {
            body = (await request.json());
        }
        catch {
            return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
        }
        const rawPlan = typeof body.plan === "string" ? body.plan : "";
        const planCode = normalizePlanCode(rawPlan);
        if (planCode === "free") {
            return NextResponse.json({ error: "Cannot create paid order for free tier." }, { status: 400 });
        }
        const planConfig = getPlanConfig(planCode);
        const amount = planConfig.priceIdr;
        const allowedMethods = ["qris", "gopay", "paypal", "touchngo"];
        const paymentMethod = typeof body.paymentMethod === "string" && allowedMethods.includes(body.paymentMethod)
            ? body.paymentMethod
            : "qris";
        const userMetadata = typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {};
        const orderId = createOrder({
            userId: user.id,
            planCode,
            amountIdr: amount,
            paymentMethod,
            metadata: {
                planLabel: planConfig.label,
                userEmail: user.email,
                discordId: user.discord_user_id,
                ...userMetadata,
            },
        });
        const discordId = user.discord_user_id;
        const displayName = user.display_name || user.email?.split("@")[0] || "Cilaaa User";
        const takoResult = await createTakoPayment({
            name: displayName,
            email: user.email || "customer@cilaaa.com",
            amount,
            paymentMethod,
            message: `Order #${orderId.slice(0, 8)} - ${planConfig.label} (${discordId ? `Discord: ${discordId}` : "Web"})`,
        });
        if (!takoResult.success || !takoResult.paymentUrl) {
            console.error("[Tako Payment Error]:", takoResult);
            setOrderFailed(orderId, takoResult.error);
            return NextResponse.json({
                error: takoResult.error || "Failed to initialize payment gateway with Tako.id.",
                hint: "Ensure TAKO_API_KEY and TAKO_CREATOR_USERNAME are correctly configured in environment.",
            }, { status: 502 });
        }
        updateOrderProviderInfo(orderId, takoResult.giftId || null, takoResult.transactionId || null, takoResult.paymentUrl);
        insertAuditLog({
            userId: user.id,
            event: "payment.created",
            payload: {
                orderId,
                planCode,
                amount,
                takoGiftId: takoResult.giftId,
                takoTransactionId: takoResult.transactionId,
                paymentUrl: takoResult.paymentUrl,
            },
        });
        return NextResponse.json({
            ok: true,
            orderId,
            plan: planConfig,
            amount,
            paymentUrl: takoResult.paymentUrl,
            qrCode: takoResult.qrCode,
            qrString: takoResult.qrString,
            giftId: takoResult.giftId,
            transactionId: takoResult.transactionId,
        });
    }
    catch (err) {
        console.error("[Payment Init Exception]:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Internal payment creation error." }, { status: 500 });
    }
}
