"use client";
import { useEffect, useState } from "react";
import { getMessages } from "@/lib/messages";
function stageText(stage, percent, m) {
    const pct = typeof percent === "number" ? ` ${percent}%` : "";
    switch (stage) {
        case "extract":
            return `${m.convertProgress.extract}${pct}`;
        case "decode":
            return m.convertProgress.decode;
        case "encode":
            return `${m.convertProgress.encode}${pct}`;
        case "upload":
            return `${m.convertProgress.upload} ke server...`;
        case "roblox":
            return "Mengunggah & Moderasi Roblox...";
        case "done":
            return `${m.convertProgress.done} 100%`;
        default:
            return m.convertProgress.working;
    }
}
function resolveProgressWidth(stage, percent) {
    if (typeof percent === "number")
        return Math.min(100, Math.max(5, percent));
    switch (stage) {
        case "extract":
            return 25;
        case "decode":
            return 50;
        case "encode":
            return 75;
        case "upload":
            return 85;
        case "roblox":
            return 92;
        case "done":
            return 100;
        default:
            return 30;
    }
}
export default function ConvertProgressButton({ label, locale, }) {
    const [stage, setStage] = useState(null);
    const m = getMessages(locale);
    useEffect(() => {
        const onStage = (event) => {
            const detail = event.detail;
            if (!detail?.stage)
                return;
            if (detail.stage === "error") {
                setStage(null);
                return;
            }
            setStage({ stage: detail.stage, percent: detail.percent ?? null });
            if (detail.stage === "done") {
                window.setTimeout(() => setStage(null), 1800);
            }
        };
        window.addEventListener("cilaaa:convert-stage", onStage);
        return () => window.removeEventListener("cilaaa:convert-stage", onStage);
    }, []);
    const active = stage !== null;
    const percent = stage?.percent ?? null;
    const barWidth = stage ? resolveProgressWidth(stage.stage, percent) : 0;
    return (<button data-slot="button" data-variant="default" data-size="default" className="relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-95 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 has-[>svg]:px-3 h-12 w-full rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.35)]" type="submit" data-action="convert-audio" aria-busy={active} disabled={active}>
      {active && (<>
          {/* Animated gradient progress fill */}
          <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400/40 via-purple-400/40 to-pink-300/50 transition-[width] duration-300 ease-out border-r-2 border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.6)]" style={{ width: `${barWidth}%` }}/>

          {/* Shimmer light effect running across button */}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"/>
        </>)}

      <span className="relative flex items-center justify-center gap-2.5 z-10 font-heading">
        {active ? (<>
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent shadow-sm"/>
            <span className="tracking-wide text-white drop-shadow-sm font-mono text-xs sm:text-sm">
              {stage ? stageText(stage.stage, percent, m) : label}
            </span>
            <span className="ml-1 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
              {barWidth}%
            </span>
          </>) : (label)}
      </span>
    </button>);
}
