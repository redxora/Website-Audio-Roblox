"use client";
import React from "react";
import { COMPARISON_CONFIG, PLAN_CONFIGS } from "@/lib/plans";
export default function PlanComparisonTable({ locale }) {
  const isId = locale === "id";
  const title = isId ? COMPARISON_CONFIG.titleId : COMPARISON_CONFIG.titleEn;
  const subtitle = isId ? COMPARISON_CONFIG.subtitleId : COMPARISON_CONFIG.subtitleEn;
  const columns = COMPARISON_CONFIG.columns;
  const getBadgeClass = (planKey) => {
    switch (planKey) {
      case "free":
        return "bg-zinc-700/80 text-zinc-200 border-zinc-600";
      case "daily":
        return "bg-indigo-600 text-white border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.35)]";
      case "weekly":
        return "bg-white text-zinc-950 font-bold border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]";
      case "monthly":
        return "bg-pink-600 text-white border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.35)]";
      case "lifetime":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]";
      default:
        return "bg-primary text-white";
    }
  };
  const getPlanName = (planKey) => {
    const p = PLAN_CONFIGS[planKey];
    if (!p)
      return planKey;
    if (planKey === "free")
      return isId ? "Gratis" : "Free";
    if (planKey === "daily")
      return isId ? "Solo" : "Solo";
    if (planKey === "weekly")
      return isId ? "Team" : "Team";
    if (planKey === "monthly")
      return isId ? "Pro" : "Pro";
    if (planKey === "lifetime")
      return isId ? "Agency" : "Agency";
    return isId ? p.nameId : (p.nameEn || p.nameId);
  };
  const renderCellValue = (val) => {
    if (val === "-") {
      return <span className="text-muted-foreground/60 font-mono text-base">—</span>;
    }
    if (val === "Ya" || val === "Yes") {
      return (<span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>{isId ? "Ya" : "Yes"}</span>
      </span>);
    }
    return <span className="text-foreground/90 font-medium text-sm">{val}</span>;
  };
  return (<section className="py-20 lg:py-32 bg-transparent relative overflow-hidden border-t border-border/40">
    <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/15 blur-[120px] rounded-full" />
    <div className="pointer-events-none absolute bottom-0 right-10 w-[400px] h-[250px] bg-indigo-500/10 blur-[100px] rounded-full" />

    <div className="container px-4 mx-auto max-w-6xl relative z-10">
      <div className="text-center mb-16 lg:mb-20">
        <p className="font-mono text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            // 03 — PRICING BUILT FOR CREATORS
        </p>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-center text-white tracking-tighter">
          {title}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <table className="w-full min-w-[740px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 sm:p-6 text-left text-xs font-mono tracking-wider text-muted-foreground uppercase">
                {isId ? "Fitur & Spesifikasi" : "Feature Specification"}
              </th>
              {columns.map((colKey) => (<th key={colKey} className="p-4 sm:p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-1.5 pb-2">
                  <div className={`inline-block px-4 sm:px-5 py-1 text-xs sm:text-sm font-semibold tracking-tight rounded-full border transition-transform hover:scale-105 ${getBadgeClass(colKey)}`}>
                    {getPlanName(colKey)}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {PLAN_CONFIGS[colKey]?.priceFormatted || "Rp 0"}
                  </span>
                </div>
              </th>))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_CONFIG.rows.map((row, rIdx) => {
              const featureLabel = isId ? row.nameId : (row.nameEn || row.nameId);
              const isEven = rIdx % 2 === 0;
              return (<tr key={rIdx} className={`transition-colors hover:bg-white/[0.03] ${isEven ? "bg-white/[0.01]" : ""}`}>
                <td className="py-5 sm:py-6 px-4 sm:px-6 border-b border-gray-800/80">
                  <p className="font-semibold text-white tracking-tight text-sm">
                    {featureLabel}
                  </p>
                </td>
                {columns.map((colKey) => {
                  const val = row[colKey] || "-";
                  return (<td key={colKey} className="py-5 sm:py-6 px-4 sm:px-6 border-b border-gray-800/80 text-center">
                    <div className="flex items-center justify-center">
                      {renderCellValue(val)}
                    </div>
                  </td>);
                })}
              </tr>);
            })}
          </tbody>
          <tfoot>
            <tr className="bg-white/[0.02]">
              <td className="py-6 px-4 sm:px-6 font-mono text-xs text-muted-foreground">
                {isId ? "Tindakan" : "Action"}
              </td>
              {columns.map((colKey) => {
                const isFree = colKey === "free";
                const buttonColorClass = (() => {
                  switch (colKey) {
                    case "free":
                      return "bg-zinc-800 text-white font-bold hover:bg-zinc-700 border border-zinc-600 shadow-[0_0_12px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-200";
                    case "daily":
                      return "bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all duration-200";
                    case "weekly":
                      return "bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold hover:from-pink-500 hover:to-rose-400 shadow-[0_0_25px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-all duration-200";
                    case "monthly":
                      return "bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all duration-200";
                    case "lifetime":
                      return "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 !text-black font-extrabold hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-200";
                    default:
                      return "bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all duration-200";
                  }
                })();

                return (<td key={colKey} className="py-6 px-4 sm:px-6 text-center">
                  <div className="flex items-center justify-center">
                    {isFree ? (<a href="#upload" className={`inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold rounded-full ${buttonColorClass}`}>
                      {isId ? "Mulai Gratis" : "Start Free"}
                    </a>) : (<button type="button" data-action="choose-plan" data-plan={colKey} className={`inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold rounded-full cursor-pointer ${buttonColorClass}`}>
                      {isId ? "Pilih Paket" : "Choose Plan"}
                    </button>)}
                  </div>
                </td>);
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2.5 text-center text-xs sm:text-sm text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>
          {isId
            ? "Semua paket mencakup tools spoofer audio, Roblox auto-upload, dan pemotong part otomatis."
            : "Every plan covers audio spoofer conversion, Roblox auto-upload, and automatic part splitter."}
        </span>
      </p>
    </div>
  </section>);
}
