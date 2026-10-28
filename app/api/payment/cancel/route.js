import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { cancelOrder, getOrderById, insertAuditLog } from "@/lib/db";
export async function POST(request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required to cancel payment." }, { status: 401 });
        }
        let body;
        try {
            body = (await request.json());
        }
        catch {
            return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
        }
        const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
        if (!orderId) {
            return NextResponse.json({ error: "Missing or invalid orderId parameter." }, { status: 400 });
        }
        const order = getOrderById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found." }, { status: 404 });
        }
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized to cancel this order." }, { status: 403 });
        }
        if (order.status === "paid") {
            return NextResponse.json({ error: "Order has already been completed and paid, cannot be cancelled." }, { status: 400 });
        }
        const success = cancelOrder(orderId, user.id);
        if (!success) {
            return NextResponse.json({ error: "Failed to cancel order or order is no longer in pending status." }, { status: 400 });
        }
        insertAuditLog({
            userId: user.id,
            event: "payment.cancelled",
            payload: {
                orderId,
                previousStatus: order.status,
                planCode: order.plan_code,
                amountIdr: order.amount_idr,
            },
        });
        return NextResponse.json({
            ok: true,
            message: "Order successfully cancelled.",
            orderId,
            status: "cancelled",
        });
    }
    catch (err) {
        console.error("[Cancel Payment Route Error]:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error cancelling order." }, { status: 500 });
    }
}
