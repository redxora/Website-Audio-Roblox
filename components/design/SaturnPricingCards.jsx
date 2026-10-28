"use client";
import React from "react";
import { PLAN_CONFIGS } from "@/lib/plans";
export default function SaturnPricingCards({ locale, selectedPlan, onSelectPlan, isModal = false, }) {
  const isId = locale === "id";
  const plansToShow = ["daily", "weekly", "monthly", "lifetime"];
  const getTierTitle = (code, p) => {
    switch (code) {
      case "daily":
        return isId ? "Starter (1 Day)" : "Starter (1 Day)";
      case "weekly":
        return isId ? "Popular (7 Days)" : "Popular (7 Days)";
      case "monthly":
        return isId ? "Pro" : "Pro";
      case "lifetime":
        return isId ? "Enterprise (Lifetime)" : "Enterprise (Lifetime)";
      default:
        return p.label;
    }
  };
  const getIconContainerStyle = (code, isPopular, isLifetime) => {
    if (isLifetime)
      return "bg-amber-500/15 border border-amber-500/30 text-amber-400";
    if (isPopular)
      return "bg-primary text-primary-foreground shadow-md shadow-primary/30";
    if (code === "monthly")
      return "bg-pink-500/15 border border-pink-500/30 text-pink-400";
    return "bg-indigo-500/15 border border-indigo-500/30 text-indigo-400";
  };

  const getPricingButtonClass = (code) => {
    switch (code) {
      case "daily":
        return "bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all duration-200";
      case "weekly":
        return "bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-[0_0_25px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-all duration-200";
      case "monthly":
        return "bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all duration-200";
      case "lifetime":
        return "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 !text-black font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-200";
      default:
        return "bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all duration-200";
    }
  };

  return (<div className="w-full">
      {!isModal && (<div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-semibold text-primary mb-4">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>{isId ? "PILIHAN PAKET TERBAIK" : "FLEXIBLE PRICING PLANS"}</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          <span>{isId ? "Pilih paket untuk kreasi yang lebih " : "Choose a plan for a more "}</span>
          <span className="italic font-serif bg-gradient-to-r from-pink-400 via-rose-400 to-primary bg-clip-text text-transparent">
            {isId ? "advanced & profesional" : "advanced creator"}
          </span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          {isId
            ? "Semua fitur dirancang khusus untuk mempermudah upload audio Roblox tanpa ribet dan bebas batasan."
            : "All features designed specifically to streamline Roblox audio upload and spoofer workflows."}
        </p>
      </div>)}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isModal ? "lg:grid-cols-4 gap-3.5" : "lg:grid-cols-4 gap-6"}`}>
        {plansToShow.map((planCode) => {
          const plan = PLAN_CONFIGS[planCode];
          if (!plan)
            return null;
          const isPopular = planCode === "weekly";
          const isLifetime = planCode === "lifetime";
          const isSelected = selectedPlan === planCode;
          const tierTitle = getTierTitle(planCode, plan);
          const desc = isId ? plan.descriptionId : (plan.descriptionEn || plan.descriptionId);
          const periodText = isId ? plan.periodTextId : (plan.periodTextEn || plan.periodTextId);
          return (<div key={planCode} onClick={() => onSelectPlan && onSelectPlan(planCode)} className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 transition-all duration-300 ${onSelectPlan ? "cursor-pointer" : ""} ${isSelected
            ? isLifetime
              ? "border-amber-500 bg-amber-500/[0.08] shadow-[0_0_35px_rgba(245,158,11,0.25)] scale-[1.02]"
              : "border-primary bg-primary/[0.08] shadow-[0_0_35px_rgba(255,102,178,0.25)] scale-[1.02]"
            : isPopular
              ? "border-primary/80 bg-zinc-950/90 shadow-[0_0_30px_rgba(255,102,178,0.18)] hover:border-primary"
              : isLifetime
                ? "border-amber-500/60 bg-zinc-950/90 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]"
                : "border-white/10 bg-zinc-950/60 hover:border-white/25 hover:bg-zinc-950/80"}`}>
            {plan.badge && (<div className="absolute -top-3 right-5">
              <span className={`rounded-full px-3 py-1 text-[10px] font-mono font-extrabold tracking-wider uppercase border shadow-sm ${isLifetime
                ? "bg-amber-500 text-black border-amber-400"
                : isPopular
                  ? "bg-primary text-white border-primary/50 animate-pulse"
                  : "bg-secondary text-muted-foreground border-border/80"}`}>
                {plan.badge}
              </span>
            </div>)}

            <div>
              <div className={`flex mb-4 items-center justify-center rounded-full ${getIconContainerStyle(planCode, isPopular, isLifetime)}`} style={{ width: 44, height: 44 }}>
                <img className="w-5 h-5 object-contain" src={plan.iconSrc || "/saturn-assets/images/pricing/icon1.svg"} alt={tierTitle} onError={(e) => {
                  e.currentTarget.style.display = "none";
                }} />
              </div>

              <span className="block text-lg font-bold text-white tracking-tight mb-1.5">
                {tierTitle}
              </span>

              <p className="text-xs text-muted-foreground mb-5 min-h-[2.5rem] leading-relaxed">
                {desc}
              </p>

              <div className="flex items-baseline gap-1.5 pb-5 border-b border-white/10">
                <span className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  {plan.priceFormatted}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{periodText}</span>
              </div>

              <div className="mt-5">
                <span className="block text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                  {isId ? "Fitur yang didapat:" : "What's included:"}
                </span>

                <ul className="space-y-2.5 mb-6 text-xs">
                  {(plan.featuresList || []).map((feat, fIdx) => {
                    const featText = isId ? feat.textId : (feat.textEn || feat.textId);
                    return (<li key={fIdx} className="flex items-center gap-2.5">
                      {feat.included ? (<img src="/saturn-assets/images/pricing/green-check.svg" alt="Included" className="w-4 h-4 shrink-0" />) : (<img src="/saturn-assets/images/pricing/check-circle-grey.svg" alt="Not included" className="w-4 h-4 shrink-0 opacity-60" />)}
                      <span className={feat.included
                        ? "text-zinc-200"
                        : "text-muted-foreground line-through opacity-50"}>
                        {featText}
                      </span>
                    </li>);
                  })}
                </ul>
              </div>
            </div>

            <div className="mt-auto pt-2">
              {onSelectPlan ? (<button type="button" onClick={(e) => {
                e.stopPropagation();
                onSelectPlan(planCode);
              }} className={`w-full py-2.5 px-4 rounded-full text-xs cursor-pointer ${getPricingButtonClass(planCode)}`}>
                {isId ? "Pilih Paket" : "Choose Plan"}
              </button>) : (<button type="button" data-action="choose-plan" data-plan={planCode} className={`w-full py-2.5 px-4 rounded-full text-xs cursor-pointer ${getPricingButtonClass(planCode)}`}>
                {isId ? "Pilih Paket" : "Choose Plan"}
              </button>)}
            </div>
          </div>);
        })}
      </div>
    </div>);
}
