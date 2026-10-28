"use client";
import { getMessages } from "@/lib/messages";
export default function PremiumLock({ locale, title, description, compact = false, }) {
    const m = getMessages(locale);
    return (<div className={`flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 text-center ${compact ? "gap-2 px-4 py-5" : "gap-3 px-6 py-10"}`}>
      <div className={`flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 ${compact ? "h-9 w-9" : "h-14 w-14"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`text-primary ${compact ? "h-4 w-4" : "h-6 w-6"}`} aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p className={`font-heading font-semibold text-foreground ${compact ? "text-sm" : "text-xl"}`}>
        {title}
      </p>
      <p className={`max-w-md text-muted-foreground ${compact ? "text-[11px] leading-relaxed" : "text-sm leading-relaxed"}`}>
        {description}
      </p>
      <button type="button" data-action="upgrade" className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] cursor-pointer ${compact ? "mt-1 px-3 py-1.5 text-xs" : "mt-2 px-5 py-2.5 text-sm"}`}>
        {m.premiumLock.upgrade_plan}
      </button>
    </div>);
}
