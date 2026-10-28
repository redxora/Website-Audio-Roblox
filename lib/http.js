export function jsonError(message, status = 400, extra) {
    return Response.json({
        error: message,
        ...(extra || {}),
    }, { status });
}
export function requiredString(value, label, max = 300) {
    if (typeof value !== "string") {
        throw new Error(`${label} is required.`);
    }
    const result = value.trim();
    if (!result || result.length > max) {
        throw new Error(`${label} is required and must not exceed ${max} characters.`);
    }
    return result;
}
export function numericId(value, label, maxDigits = 22) {
    const valueString = requiredString(value, label, maxDigits);
    if (!/^\d+$/.test(valueString)) {
        throw new Error(`${label} harus berupa angka.`);
    }
    return valueString;
}
