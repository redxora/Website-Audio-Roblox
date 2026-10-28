import crypto from "crypto";
export async function createTakoPayment(params) {
    const apiKey = process.env.TAKO_API_KEY?.trim();
    const username = (params.username || process.env.TAKO_CREATOR_USERNAME || "").trim();
    const userAgent = process.env.TAKO_USER_AGENT?.trim() || "CilaaaCommunity/1.0";
    if (!apiKey || !username) {
        return {
            success: false,
            error: "configuration missing (TAKO_API_KEY or TAKO_CREATOR_USERNAME).",
        };
    }
    const endpoint = `https://tako.id/api/v1/gift/${encodeURIComponent(username)}`;
    const rawMethod = params.paymentMethod || "qris";
    const gatewayMethod = rawMethod === "gopay"
        ? "gopay"
        : rawMethod === "paypal"
            ? "paypal"
            : rawMethod === "touchngo"
                ? "touchngo"
                : "qris";
    const bodyPayload = {
        name: params.name.slice(0, 50),
        email: params.email.slice(0, 100),
        amount: Math.round(params.amount),
        paymentMethod: gatewayMethod,
        message: (params.message || "Cilaaa Community Subscription").slice(0, 200),
    };
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "User-Agent": userAgent,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(bodyPayload),
            cache: "no-store",
        });
        const data = (await res.json().catch(() => ({})));
        if (res.status === 206 || res.status === 200 || (data.result && data.result.success)) {
            return {
                success: true,
                statusCode: res.status,
                giftId: data.result?.giftId,
                transactionId: data.result?.transactionId,
                paymentUrl: data.result?.paymentUrl,
                qrCode: data.result?.qrCode,
                qrString: data.result?.qrString,
            };
        }
        return {
            success: false,
            statusCode: res.status,
            error: data.message || data.error || `Tako API responded with status ${res.status}`,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to connect to Tako API",
        };
    }
}
export async function getTakoGiftStatus(giftId) {
    const apiKey = process.env.TAKO_API_KEY?.trim();
    const userAgent = process.env.TAKO_USER_AGENT?.trim() || "CilaaaCommunity/1.0";
    if (!apiKey || !giftId) {
        return { success: false, error: "Missing API Key or giftId." };
    }
    try {
        const res = await fetch(`https://tako.id/api/v1/gift/${encodeURIComponent(giftId)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "User-Agent": userAgent,
                Accept: "application/json",
            },
            cache: "no-store",
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => "");
            return { success: false, error: `Tako API status ${res.status}: ${errText}` };
        }
        const json = (await res.json().catch(() => ({})));
        const details = json.result || json.data || json;
        return { success: true, data: details };
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to fetch gift status",
        };
    }
}
export function verifyTakoWebhookSignature(rawBody, headerSignature) {
    const secret = process.env.TAKO_CALLBACK_SECRET?.trim();
    if (!secret) {
        console.warn("[Tako] TAKO_CALLBACK_SECRET tidak diset — webhook ditolak.");
        return false;
    }
    if (!headerSignature)
        return false;
    try {
        const computedSignature = crypto
            .createHmac("sha256", secret)
            .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
            .digest("hex");
        const a = Buffer.from(computedSignature, "hex");
        const b = Buffer.from(headerSignature.trim(), "hex");
        if (a.length !== b.length)
            return false;
        return crypto.timingSafeEqual(a, b);
    }
    catch {
        return false;
    }
}
export function generateTakoSignature(rawBody, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
        .digest("hex");
}
