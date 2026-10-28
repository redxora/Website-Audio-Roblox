"use client";
import { useState } from "react";
import { CILAAA_LOGO, resolveCover } from "@/lib/cover";
export default function ConversionCover({ originalName }) {
    const cover = resolveCover(originalName);
    const [broken, setBroken] = useState(false);
    const useLogo = cover.kind === "default" || broken;
    return (<div className="relative h-11 w-16 sm:h-12 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-white/20 border-t-white/40 bg-gradient-to-br from-pink-500/25 via-purple-500/20 to-zinc-900/80 flex items-center justify-center shadow-inner backdrop-blur-md">
      <img src={useLogo ? CILAAA_LOGO : cover.src} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} onError={() => setBroken(true)}/>
    </div>);
}
