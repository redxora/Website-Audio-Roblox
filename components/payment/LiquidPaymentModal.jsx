"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import CustomIcon from "@/components/ui/CustomIcon";
import { startDiscordLogin } from "@/lib/auth/client";
import { PLAN_CONFIGS } from "@/lib/plans";
import { getMessages } from "@/lib/messages";
import notify from "@/lib/notify";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import SaturnPricingCards from "@/components/design/SaturnPricingCards";
const PLANS_DATA = {
    daily: {
        code: "daily",
        label: "1 Day",
        nameId: "1 Day (24 Jam)",
        priceFormatted: "Rp 15.000",
        priceNumeric: 15000,
        periodTextId: "untuk akses 1 hari penuh",
        periodTextEn: "for 24 hours full access",
        dailyRateTextId: "Rp 15.000 / hari",
        dailyRateTextEn: "Rp 15,000 / day",
        badge: "STARTER",
        featuresId: [
            "Konversi Audio: Tanpa batas (Fair-use)",
            "Audio Splitter Otomatis (Part)",
            "Roblox Auto-Upload Kredensial Langsung",
            "Studio Audio Editor (EQ, Trim, Pitch)",
            "Moderation Status Tracking",
            "Role Pro di Server Discord",
        ],
        featuresEn: [
            "Audio Convert: Unlimited (Fair-use)",
            "Automatic Audio Splitter (Parts)",
            "Roblox Auto-Upload Direct Credentials",
            "Studio Audio Editor (EQ, Trim, Pitch)",
            "Moderation Status Tracking",
            "Pro Role in Discord Server",
        ],
    },
    weekly: {
        code: "weekly",
        label: "7 Days",
        nameId: "7 Days (Mingguan)",
        priceFormatted: "Rp 70.000",
        priceNumeric: 70000,
        periodTextId: "untuk akses 7 hari",
        periodTextEn: "for 7-day access",
        dailyRateTextId: "Rp 10.000 / hari · Best Value",
        dailyRateTextEn: "Rp 10,000 / day · Best Value",
        badge: "MOST POPULAR",
        featuresId: [
            "Semua fitur paket 1 Day",
            "10x Bulk Audio Conversions",
            "Roblox Auto-Upload: User & Group Universe",
            "Batch Audio Processing Cepat",
            "Bulk Asset Permissions Auto-grant",
            "Priority Discord Support",
        ],
        featuresEn: [
            "All 1 Day Plan features included",
            "10x Bulk Audio Conversions",
            "Roblox Auto-Upload: User & Group Universe",
            "High-speed Batch Audio Processing",
            "Bulk Asset Permissions Auto-grant",
            "Priority Discord Support",
        ],
    },
    monthly: {
        code: "monthly",
        label: "30 Days",
        nameId: "30 Days (Bulanan)",
        priceFormatted: "Rp 140.000",
        priceNumeric: 140000,
        periodTextId: "untuk akses 30 hari",
        periodTextEn: "for 30-day access",
        dailyRateTextId: "Rp 4.666 / hari · Paling Hemat",
        dailyRateTextEn: "Rp 4,666 / day · Save 47%",
        badge: "SAVE 47%",
        featuresId: [
            "Semua fitur paket 7 Days",
            "50x Bulk Audio Conversions",
            "Roblox Auto-Upload: Tanpa Batas",
            "Unlimited Audio Part Splitting",
            "Export Preset Khusus Studio",
            "Dedicated High-speed Queue",
        ],
        featuresEn: [
            "All 7 Days Plan features included",
            "50x Bulk Audio Conversions",
            "Roblox Auto-Upload: Unlimited",
            "Unlimited Audio Part Splitting",
            "Studio Custom Export Presets",
            "Dedicated High-speed Queue",
        ],
    },
    lifetime: {
        code: "lifetime",
        label: "Lifetime",
        nameId: "Lifetime (Permanen)",
        priceFormatted: "Rp 1.000.000",
        priceNumeric: 1000000,
        periodTextId: "sekali bayar seumur hidup",
        periodTextEn: "one-time payment forever",
        dailyRateTextId: "AKSES PERMANEN",
        dailyRateTextEn: "PERMANENT ACCESS",
        badge: "LIFETIME",
        featuresId: [
            "Akses Permanen Tanpa Batas Masa Aktif",
            "100x Bulk Audio Conversions",
            "Roblox Auto-Upload Prioritas Paling Tinggi",
            "Semua Pembaruan & Fitur Baru Otomatis Terbuka",
            "Akses Langsung ke Channel Private Developer",
            "Role Eksklusif Lifetime di Discord",
        ],
        featuresEn: [
            "Permanent Access No Expiration",
            "100x Bulk Audio Conversions",
            "Roblox Auto-Upload Highest Priority",
            "All Future Updates & Tools Unlocked",
            "Direct Access to Private Developer Channels",
            "Exclusive Lifetime Role in Discord",
        ],
    },
};
const PLAN_KEY_BY_CODE = {
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    lifetime: "lifetime",
};
for (const code of Object.keys(PLANS_DATA)) {
    const priceIdr = PLAN_CONFIGS[PLAN_KEY_BY_CODE[code]].priceIdr;
    PLANS_DATA[code].priceNumeric = priceIdr;
    PLANS_DATA[code].priceFormatted = `Rp ${priceIdr.toLocaleString("id-ID")}`;
}
const METHOD_ICONS = {
    qris: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3h-3z"/>
      <path d="M21 14v7h-7"/>
      <path d="M14 21h7"/>
    </svg>),
    gopay: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
      <line x1="6" x2="6.01" y1="15" y2="15"/>
      <line x1="10" x2="14" y1="15" y2="15"/>
    </svg>),
    paypal: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
      <path d="M6 15h4"/>
    </svg>),
    touchngo: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="M7 15h10"/>
      <path d="M12 9v6"/>
    </svg>),
};
const PAYMENT_METHODS = [
    {
        id: "qris",
        titleId: "QRIS",
        titleEn: "QRIS",
        descId: "Pembayaran instan kode QRIS.",
        descEn: "Instant QRIS code payment.",
        icons: ["QRIS"],
    },
    {
        id: "gopay",
        titleId: "GoPay",
        titleEn: "GoPay",
        descId: "Bayar langsung dengan GoPay.",
        descEn: "Pay directly with GoPay.",
        icons: ["GoPay"],
    },
    {
        id: "paypal",
        titleId: "PayPal",
        titleEn: "PayPal",
        descId: "Pembayaran via akun PayPal.",
        descEn: "Pay with your PayPal account.",
        icons: ["PayPal"],
    },
    {
        id: "touchngo",
        titleId: "Touch 'n Go",
        titleEn: "Touch 'n Go",
        descId: "Bayar langsung dengan Touch 'n Go.",
        descEn: "Pay directly with Touch 'n Go.",
        icons: ["Touch 'n Go"],
    },
];
export default function LiquidPaymentModal({ isOpen, initialStep = "plans", initialPlan = "monthly", initialMethod = "qris", locale = "id", isAuthenticated = false, onClose, onSuccess, }) {
    const router = useRouter();
    const m = getMessages(locale);
    const pm = m.paymentModal;
    const [step, setStep] = useState(initialStep);
    const [selectedPlan, setSelectedPlan] = useState(initialPlan || "monthly");
    const [selectedMethod, setSelectedMethod] = useState(initialMethod || "qris");
    const currentPlan = PLANS_DATA[selectedPlan];
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [paypalEmail, setPaypalEmail] = useState("");
    const [secondsRemaining, setSecondsRemaining] = useState(300);
    const [isExpired, setIsExpired] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    useBodyScrollLock(isOpen);
    useEffect(() => {
        if (!isOpen || step !== "payment" || isExpired)
            return;
        const timer = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, step, isExpired]);
    useEffect(() => {
        if (!isOpen || step !== "payment" || !orderId || isExpired)
            return;
        let isMounted = true;
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
                if (!res.ok)
                    return;
                const data = await res.json();
                if (isMounted && data.status === "paid") {
                    clearInterval(pollInterval);
                    setStep("success");
                    if (onSuccess)
                        onSuccess(selectedPlan);
                }
                else if (isMounted && (data.status === "cancelled" || data.status === "expired" || data.expired)) {
                    clearInterval(pollInterval);
                    setIsExpired(true);
                }
            }
            catch {
            }
        }, 2500);
        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [isOpen, step, orderId, isExpired, selectedPlan, onSuccess]);
    const handleProceedToPayment = async () => {
        if (!isAuthenticated) {
            startDiscordLogin(window.location.pathname);
            return;
        }
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: selectedPlan,
                    paymentMethod: selectedMethod,
                    metadata: { paypalEmail },
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                setErrorMessage(data.error || pm.err_create_tx);
                setIsLoading(false);
                return;
            }
            setOrderId(data.orderId);
            setPaymentUrl(data.paymentUrl || null);
            setSecondsRemaining(300);
            setIsExpired(false);
            setStep("payment");
        }
        catch (err) {
            setErrorMessage(err instanceof Error ? err.message : pm.err_connection);
        }
        finally {
            setIsLoading(false);
        }
    };
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainder = secs % 60;
        return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
    };
    const copyToClipboard = (text, key) => {
        navigator.clipboard?.writeText(text);
        setCopiedKey(key);
        notify.success(pm.copied, text);
        setTimeout(() => setCopiedKey(null), 2000);
    };
    const handleManualCheck = async () => {
        if (!orderId)
            return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
            const data = await res.json();
            if (data.status === "paid") {
                setStep("success");
                notify.success(pm.payment_success_title, pm.payment_success_desc);
                if (onSuccess)
                    onSuccess(selectedPlan);
            }
            else if (data.status === "cancelled" || data.status === "expired" || data.expired) {
                setIsExpired(true);
                notify.error(pm.payment_expired_title, pm.payment_expired_hint);
            }
            else {
                notify.warning(pm.title, pm.alert_not_detected);
            }
        }
        catch {
            notify.error(pm.title, pm.alert_check_failed);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCancelPayment = async () => {
        if (!orderId) {
            setStep("plans");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/payment/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                notify.info("Pembayaran Dibatalkan", "Pesanan transaksi pembayaran telah berhasil dibatalkan.");
                setOrderId(null);
                setPaymentUrl(null);
                setStep("plans");
            }
            else {
                notify.warning("Gagal Batalkan", data.error || "Gagal membatalkan transaksi.");
            }
        }
        catch {
            notify.error("Koneksi Bermasalah", "Gagal menghubungi server untuk membatalkan pesanan.");
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    const qrDisplayUrl = paymentUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(paymentUrl)}`
        : `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(`CILAAA-QRIS-${orderId || "PAY"}-${currentPlan.priceNumeric}`)}`;
    return createPortal(<div className="fixed inset-0 z-[1000] isolate flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xl overscroll-contain animate-in fade-in duration-200" onClick={(e) => {
            if (e.target === e.currentTarget) {
                e.stopPropagation();
                onClose();
            }
        }}>
      <div role="dialog" aria-modal="true" aria-labelledby="liquid-payment-title" className={`relative z-[1010] w-full ${step === "plans" ? "max-w-5xl" : "max-w-2xl"} max-h-[90vh] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-background shadow-[0_0_80px_rgba(255,102,178,0.28),0_25px_70px_rgba(0,0,0,0.85)] text-foreground p-0 transition-all duration-300 ring-1 ring-white/10`} onClick={(e) => e.stopPropagation()}>

        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/20 blur-[90px] -z-10"/>
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber-500/15 blur-[90px] -z-10"/>

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <CustomIcon name="nav-studio" size={18}/>
            </div>
            <div>
              <span className="font-heading text-[13px] sm:text-sm font-bold tracking-tight">
                CILAAA COMMUNITY · {pm.portal_badge}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span>GATEWAY · 24/7</span>
              </div>
            </div>
          </div>

          <button type="button" aria-label="Tutup Modal" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }} className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-secondary/60 text-muted-foreground transition-all hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40 hover:rotate-90 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-5">

          {step === "plans" && (<div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="text-center max-w-md mx-auto space-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
                  <CustomIcon name="icon-sparkles-colored" size={13} alt="Step 1"/>
                  <span>{pm.step_1_of_3}</span>
                </span>
                <h2 id="liquid-payment-title" className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight">
                  {pm.choose_plan_title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{pm.choose_plan_subtitle}</p>
              </div>

              <div className="pt-1">
                <SaturnPricingCards locale={locale} selectedPlan={selectedPlan} onSelectPlan={(pCode) => {
                if (pCode !== "free") {
                    setSelectedPlan(pCode);
                    setStep("methods");
                }
            }} isModal={true}/>
              </div>
            </div>)}

          {step === "methods" && (<div className="space-y-6 animate-in fade-in-50 duration-300">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <button type="button" onClick={() => setStep("plans")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  ← {pm.change_plan}
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
                  <span className="text-muted-foreground">{pm.plan_label}:</span>
                  <span className="font-bold text-foreground">{currentPlan.label}</span>
                  <span className="font-mono font-bold text-primary">({currentPlan.priceFormatted})</span>
                </div>
              </div>

              <div className="text-center max-w-md mx-auto space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
                  <CustomIcon name="icon-creditcard-colored" size={13} alt="Step 2"/>
                  <span>{pm.step_2_of_3}</span>
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {pm.select_method_title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{pm.select_method_subtitle}</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-w-lg mx-auto">
                {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                const isQris = method.id === "qris";
                return (<div key={method.id} onClick={() => setSelectedMethod(method.id)} className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
                        ? "border-primary bg-primary/[0.12] shadow-[0_0_30px_rgba(255,102,178,0.25)]"
                        : "border-border/70 bg-card/80 hover:border-primary/40 hover:bg-card/95"}`}>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${isSelected ? "border-primary/40 bg-primary/15 text-primary" : "border-border/70 bg-secondary/60 text-muted-foreground"}`}>
                            {METHOD_ICONS[method.id] || METHOD_ICONS.paypal}
                          </span>
                          <h4 className="font-heading font-bold text-base text-foreground">
                            {pm.methods[method.id]?.title || method.id}
                          </h4>
                          <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${isQris ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-secondary text-muted-foreground"}`}>
                            {pm.methods[method.id]?.badge || ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pm.methods[method.id]?.desc || ""}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {method.icons.map((ic) => (<span key={ic} className="rounded-md border border-border/50 bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {ic}
                            </span>))}
                        </div>
                      </div>

                      <div className="flex items-center self-end sm:self-center">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground"/>}
                        </div>
                      </div>
                    </div>);
            })}
              </div>

              {!isAuthenticated && (<div className="max-w-2xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
                  <CustomIcon name="icon-warning-custom" size={18} className="shrink-0 mt-0.5" alt="Warning"/>
                  <div>
                    <strong>{pm.discord_required_title}</strong>
                    <p className="mt-0.5 text-muted-foreground">{pm.discord_required_bot_desc}</p>
                  </div>
                </div>)}

              <div className="max-w-2xl mx-auto pt-2">
                <button type="button" disabled={isLoading} onClick={handleProceedToPayment} className="w-full py-3.5 px-6 rounded-xl font-heading text-sm sm:text-base font-bold !text-white bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? (<>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      <span>{pm.connecting_gateway}</span>
                    </>) : (<>
                      <span>{pm.continue_payment}</span>
                      <span>({currentPlan.priceFormatted}) →</span>
                    </>)}
                </button>
                {errorMessage && (<p className="mt-2 text-center text-xs text-destructive font-medium">{errorMessage}</p>)}
              </div>
            </div>)}

          {step === "payment" && (<div className="space-y-6 animate-in fade-in-50 duration-300">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <button type="button" onClick={() => setStep("methods")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  ← {pm.change_method}
                </button>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
                    ORDER ID: <strong className="text-foreground">{orderId || "#ORD-PENDING"}</strong>
                  </span>
                  <button type="button" onClick={() => copyToClipboard(orderId || "", "order")} className="text-xs text-primary hover:underline cursor-pointer">
                    {copiedKey === "order" ? (<span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CustomIcon name="icon-check-custom" size={12} alt="Check"/>
                        <span>Tersalin</span>
                      </span>) : ("Salin")}
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${isExpired
                ? "border-destructive/60 bg-destructive/10 text-destructive"
                : "border-primary/40 bg-primary/[0.04]"}`}>
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isExpired ? "border-destructive bg-destructive/20 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                      {isExpired ? pm.payment_expired_title : pm.payment_time_remaining}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isExpired ? pm.payment_expired_hint : pm.payment_active_hint}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className={`font-mono text-2xl sm:text-3xl font-extrabold ${isExpired ? "text-destructive" : "text-primary"}`}>
                    {formatTime(secondsRemaining)}
                  </div>
                  <div className="flex items-center justify-center sm:justify-end gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
                    <span className={`h-2 w-2 rounded-full ${isExpired ? "bg-destructive" : "bg-emerald-400 animate-pulse"}`}/>
                    <span>{isExpired ? "EXPIRED" : "AUTO VERIFYING"}</span>
                  </div>
                </div>
              </div>

              {selectedMethod === "qris" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-inner text-center">
                    <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                      <img src={qrDisplayUrl} alt="QRIS Payment Code" width={240} height={240} className="rounded-lg object-contain"/>

                      <div className="pointer-events-none absolute inset-x-3 top-3 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75 animate-bounce"/>
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="font-mono text-xs text-muted-foreground">{pm.total_amount}</span>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-heading text-2xl font-extrabold text-foreground">
                          {currentPlan.priceFormatted}
                        </span>
                        <button type="button" onClick={() => copyToClipboard(currentPlan.priceNumeric.toString(), "amount")} className="text-xs text-primary hover:underline cursor-pointer">
                          {copiedKey === "amount" ? (<span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CustomIcon name="icon-check-custom" size={12} alt="Check"/>
                              <span>Tersalin</span>
                            </span>) : ("Salin")}
                        </button>
                      </div>
                    </div>

                    {paymentUrl && (<a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 border border-border/80 transition-all">
                        <span>{pm.open_tako}</span>
                        <span>↗</span>
                      </a>)}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-heading font-bold text-base text-foreground">
                      {pm.qris_steps_title}
                    </h4>
                    <ol className="space-y-3 text-xs text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</span>
                        <span>{pm.qris_step_1}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</span>
                        <span>{pm.qris_step_2}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</span>
                        <span>{pm.qris_step_3}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">4</span>
                        <span>{pm.qris_step_4}</span>
                      </li>
                    </ol>

                    <div className="pt-2 space-y-2">
                      <button type="button" onClick={handleManualCheck} disabled={isLoading} className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                        {isLoading ? ("Memeriksa Status...") : (<span className="inline-flex items-center justify-center gap-2">
                            <CustomIcon name="icon-refresh-custom" size={15} alt="Refresh"/>
                            <span>Cek Status Pembayaran Sekarang</span>
                          </span>)}
                      </button>

                      <button type="button" onClick={handleCancelPayment} disabled={isLoading} className="w-full py-2 px-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        <span>Batalkan Pembayaran</span>
                      </button>
                    </div>
                  </div>
                </div>)}

              {selectedMethod === "gopay" && (<div className="space-y-4 max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {["GoPay"].map((p) => (<span key={p} className="rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                        {p}
                      </span>))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{pm.total_billed}</span>
                    <p className="font-heading text-2xl font-extrabold text-primary">{currentPlan.priceFormatted}</p>
                  </div>

                  <p className="text-xs text-muted-foreground">{pm.open_gateway_hint}</p>

                  {paymentUrl ? (<a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-heading text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
                      {pm.proceed_gateway}
                    </a>) : (<p className="text-xs text-muted-foreground">{pm.connecting_gateway}</p>)}

                  <div className="space-y-2 pt-1">
                    <button type="button" onClick={handleManualCheck} disabled={isLoading} className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer">
                      {isLoading ? ("Memeriksa Status...") : (<span className="inline-flex items-center justify-center gap-2">
                          <CustomIcon name="icon-refresh-custom" size={15} alt="Refresh"/>
                          <span>Cek Status Pembayaran</span>
                        </span>)}
                    </button>

                    <button type="button" onClick={handleCancelPayment} disabled={isLoading} className="w-full py-2 px-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>Batalkan Pembayaran</span>
                    </button>
                  </div>
                </div>)}

              {selectedMethod === "paypal" && (<div className="space-y-4 max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <div className="flex justify-center gap-2">
                    {["PayPal"].map((p) => (<span key={p} className="rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                        {p}
                      </span>))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{pm.international_amount}</span>
                    <p className="font-heading text-2xl font-extrabold text-primary">{currentPlan.priceFormatted}</p>
                  </div>

                  <div className="text-left text-xs space-y-1.5">
                    <label className="text-muted-foreground">Email PayPal / Billing Account:</label>
                    <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="yourname@gmail.com" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"/>
                  </div>

                  {paymentUrl ? (<a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-heading text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
                      Buka Pembayaran PayPal ↗
                    </a>) : (<p className="text-xs text-muted-foreground">Menghubungkan ke gateway pembayaran...</p>)}

                  <div className="space-y-2 pt-1">
                    <button type="button" onClick={handleManualCheck} disabled={isLoading} className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer">
                      {isLoading ? ("Memeriksa Status...") : (<span className="inline-flex items-center justify-center gap-2">
                          <CustomIcon name="icon-refresh-custom" size={15} alt="Refresh"/>
                          <span>Cek Status Pembayaran</span>
                        </span>)}
                    </button>

                    <button type="button" onClick={handleCancelPayment} disabled={isLoading} className="w-full py-2 px-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>Batalkan Pembayaran</span>
                    </button>
                  </div>
                </div>)}

              {selectedMethod === "touchngo" && (<div className="space-y-4 max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Touch 'n Go"].map((p) => (<span key={p} className="rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                        {p}
                      </span>))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{pm.total_billed}</span>
                    <p className="font-heading text-2xl font-extrabold text-primary">{currentPlan.priceFormatted}</p>
                  </div>

                  <p className="text-xs text-muted-foreground">{pm.open_gateway_hint}</p>

                  {paymentUrl ? (<a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-heading text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
                      {pm.proceed_gateway}
                    </a>) : (<p className="text-xs text-muted-foreground">{pm.connecting_gateway}</p>)}

                  <div className="space-y-2 pt-1">
                    <button type="button" onClick={handleManualCheck} disabled={isLoading} className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer">
                      {isLoading ? ("Memeriksa Status...") : (<span className="inline-flex items-center justify-center gap-2">
                          <CustomIcon name="icon-refresh-custom" size={15} alt="Refresh"/>
                          <span>Cek Status Pembayaran</span>
                        </span>)}
                    </button>

                    <button type="button" onClick={handleCancelPayment} disabled={isLoading} className="w-full py-2 px-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>Batalkan Pembayaran</span>
                    </button>
                  </div>
                </div>)}
            </div>)}

          {step === "success" && (<div className="py-6 sm:py-8 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-400">

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.4)] animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  <CustomIcon name="icon-celebration" size={14} alt="Celebration"/>
                  <span>{pm.transaction_verified}</span>
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {pm.payment_success}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pm.payment_success_details_prefix}<strong className="text-primary">{currentPlan.label}</strong>{pm.payment_success_details_suffix}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">{pm.plan_label}</span>
                  <strong className="text-foreground">{currentPlan.label}</strong>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">{pm.total_paid}</span>
                  <span className="font-mono font-bold text-emerald-400">{currentPlan.priceFormatted}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Order Reference</span>
                  <span className="font-mono text-muted-foreground">{orderId || "#ORD-COMPLETED"}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Discord Role Status</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                    <CustomIcon name="icon-check-custom" size={13} alt="Check"/>
                    <span>Otomatis Aktif</span>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={() => {
                onClose();
                router.refresh();
            }} className="w-full py-3.5 px-6 rounded-xl font-heading text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all cursor-pointer">
                  {pm.start_studio_btn} →
                </button>
              </div>
            </div>)}
        </div>
      </div>
    </div>, document.body);
}
