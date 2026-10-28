import rawPlansConfig from "../plans.config.json";
export const FREE_CONVERSIONS_PER_24H = Math.max(0, Number.parseInt(process.env.FREE_CONVERSIONS_PER_24H || "5", 10) || 5);
const rawPlans = rawPlansConfig.plans;
export const COMPARISON_CONFIG = rawPlansConfig.comparison;
export const PLAN_CONFIGS = {
    free: {
        ...rawPlans.free,
        code: "free",
        conversions24h: FREE_CONVERSIONS_PER_24H,
        descriptionEn: "Essential audio conversion & basic Roblox asset tools.",
        descriptionId: "Masa aktif selamanya. Konversi 5x/24h, Roblox upload 5x/24h, max 10MB.",
    },
    daily: {
        ...rawPlans.daily,
        code: "daily",
        descriptionEn: "Unlimited conversions, unlimited audio parts, and Audio Studio for 24 hours.",
        descriptionId: "Akses 24 jam penuh! Unlimited konversi, audio parts tanpa batas, & Audio Studio.",
    },
    Weekly: {
        ...rawPlans.weekly,
        code: "Weekly",
        descriptionEn: "7-day access: Unlimited conversions, audio parts, 10 bulk conversions, and priority queue.",
        descriptionId: "Masa aktif 7 hari. Unlimited konversi, 10 bulk conversions sekaligus, & antrean prioritas.",
    },
    weekly: {
        ...rawPlans.weekly,
        code: "weekly",
        descriptionEn: "7-day access: Unlimited conversions, audio parts, 10 bulk conversions, and priority queue.",
        descriptionId: "Masa aktif 7 hari. Unlimited konversi, 10 bulk conversions sekaligus, & antrean prioritas.",
    },
    monthly: {
        ...rawPlans.monthly,
        code: "monthly",
        descriptionEn: "30-day ultimate studio: Unlimited bulk conversions, full group uploads, & instant support.",
        descriptionId: "Paket 30 hari terbaik! Unlimited bulk conversions, upload grup Roblox, & support prioritas.",
    },
    lifetime: {
        ...rawPlans.lifetime,
        code: "lifetime",
        descriptionEn: "Permanent access, unlimited conversions, highest priority queue, and Discord role.",
        descriptionId: "Sekali bayar aktif seumur hidup. Akses tanpa batas, batch tak terbatas, & Discord.",
    },
};
export function normalizePlanCode(raw) {
    if (!raw)
        return "free";
    const s = raw.toLowerCase().trim();
    if (s === "daily" || s === "1day" || s === "one-day" || s === "one_day" || s === "1_day" || s === "1_hari")
        return "daily";
    if (s === "weekly" || s === "7days" || s === "seven-days" || s === "seven_days" || s === "7_days" || s === "7_hari")
        return "weekly";
    if (s === "monthly" || s === "30days" || s === "thirty-days" || s === "thirty_days" || s === "30_days" || s === "30_hari" || s === "6months")
        return "monthly";
    if (s === "lifetime" || s === "unlimited" || s === "three-months" || s === "three_months" || s === "vip")
        return "lifetime";
    return "free";
}
export function getPlanConfig(code) {
    const normalized = normalizePlanCode(code);
    return PLAN_CONFIGS[normalized] || PLAN_CONFIGS.free;
}
