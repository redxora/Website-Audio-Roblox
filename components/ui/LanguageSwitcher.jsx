"use client";
import { useTransition, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
export function LanguageSwitcher({ locale, className = "", size = "default", }) {
    const router = useRouter();
    const pathname = usePathname() || "";
    const [isPending, startTransition] = useTransition();
    const detectedLocale = locale || (pathname.startsWith("/id") ? "id" : "en");
    const [activeLocale, setActiveLocale] = useState(detectedLocale);
    useEffect(() => {
        setActiveLocale(detectedLocale);
    }, [detectedLocale]);
    const switchLocale = (targetLocale) => {
        if (targetLocale === activeLocale)
            return;
        setActiveLocale(targetLocale);
        const parts = (pathname || window.location.pathname).split("/").filter(Boolean);
        if (parts.length && (parts[0] === "id" || parts[0] === "en")) {
            parts[0] = targetLocale;
        }
        else {
            parts.unshift(targetLocale);
        }
        const nextPath = `/${parts.join("/")}${window.location.search}${window.location.hash}`;
        startTransition(() => {
            router.push(nextPath);
        });
    };
    const isId = activeLocale === "id";
    const btnPadding = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
    return (<div role="group" aria-label="Language selection" className={`relative inline-flex items-center rounded-full bg-secondary/80 p-0.5 border border-border/80 backdrop-blur-md select-none shadow-sm ${className}`}>
        <span aria-hidden="true" className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-background border border-border/90 shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isId ? "translate-x-0" : "translate-x-full"}`} />

        <button type="button" aria-pressed={isId} aria-label="Bahasa Indonesia" onClick={() => switchLocale("id")} className={`relative z-10 flex flex-1 min-w-[34px] items-center justify-center rounded-full ${btnPadding} font-semibold tracking-wider transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${isId
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"}`}>
            ID
        </button>

        <button type="button" aria-pressed={!isId} aria-label="English" onClick={() => switchLocale("en")} className={`relative z-10 flex flex-1 min-w-[34px] items-center justify-center rounded-full ${btnPadding} font-semibold tracking-wider transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${!isId
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"}`}>
            EN
        </button>
    </div>);
}
export default LanguageSwitcher;
