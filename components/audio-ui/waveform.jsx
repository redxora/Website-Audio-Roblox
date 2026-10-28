"use client";
import { Waveform as WaveformPrimitive } from "@audio-ui/react";
import { cn } from "@/lib/utils";
function mergeClassNames(custom, ...defaults) {
    if (typeof custom === "function") {
        return (state) => cn(...defaults, custom(state));
    }
    return cn(...defaults, custom);
}
const EDGE_FADE = "[-webkit-mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] mask-[linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]";
function Waveform({ "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, children, className, getAriaValueText, onSelectionChange, onSelectionCommitted, shape, values, variant = "playhead", ...props }) {
    return (<WaveformPrimitive.Root className="group/waveform w-full min-w-0 data-disabled:cursor-not-allowed select-none" peaks={values} {...props}>
      <WaveformPrimitive.Control aria-describedby={ariaDescribedBy} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={mergeClassNames(className, "relative h-20 sm:h-24 rounded-lg w-full min-w-0 cursor-crosshair touch-none select-none overflow-hidden py-1", "data-disabled:pointer-events-none data-disabled:opacity-50 data-loading:cursor-progress")} data-slot="waveform" getAriaValueText={getAriaValueText} onSelectionChange={onSelectionChange} onSelectionCommitted={onSelectionCommitted}>
        <WaveformPrimitive.Canvas className={cn("pointer-events-none [--waveform-bar-radius:max(0px,min(var(--radius-sm),3px))] [--waveform-color:#00d2ff] [--waveform-progress-color:#00f2fe] block size-full text-[#00d2ff]", EDGE_FADE)} style={{
            "--waveform-color": "#00d2ff",
            "--waveform-progress-color": "#00f2fe",
            color: "#00d2ff",
        }} variant={shape}/>
        {children}
        {variant === "playhead" ? (<>
            <WaveformPrimitive.Playhead className="inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_10px_#38bdf8] group-data-outside/waveform:hidden z-30 pointer-events-none"/>
            <WaveformPrimitive.Thumb className="inset-y-0 my-auto size-3 rounded-full border border-sky-300 bg-white shadow-[0_0_10px_rgba(56,189,248,0.9)] group-data-outside/waveform:hidden z-30 pointer-events-none"/>
          </>) : null}
      </WaveformPrimitive.Control>
    </WaveformPrimitive.Root>);
}
function WaveformRegion({ className, ...props }) {
    return (<WaveformPrimitive.Region className={mergeClassNames(className, "rounded-md bg-sky-500/20 ring-2 ring-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.35)] inset-y-0 z-20 cursor-grab active:cursor-grabbing pointer-events-auto")} data-slot="waveform-region" {...props}/>);
}
function WaveformRegionHandle({ className, edge, ...props }) {
    return (<WaveformPrimitive.RegionHandle className={mergeClassNames(className, "pointer-events-auto absolute inset-y-0 w-4 cursor-ew-resize z-40 flex items-center justify-center", edge === "end" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2")} data-slot="waveform-region-handle" edge={edge} {...props}>
      <div className="h-10 w-2.5 rounded-xs bg-[#38bdf8] text-black font-bold flex items-center justify-center text-[10px] shadow-[0_0_12px_#38bdf8] border border-sky-200">
        ⋮
      </div>
    </WaveformPrimitive.RegionHandle>);
}
function WaveformMarker({ children, className, ...props }) {
    return (<WaveformPrimitive.Marker className={mergeClassNames(className, "bg-cyan-400/80 pointer-events-none inset-y-0 w-px z-25")} data-slot="waveform-marker" {...props}>
      {children ? (<span className="rounded bg-sky-950/90 border border-sky-400/50 px-1 font-mono text-[10px] text-sky-200 absolute top-1 left-1 whitespace-nowrap shadow-sm">
          {children}
        </span>) : null}
    </WaveformPrimitive.Marker>);
}
function WaveformHover({ className, format, ...props }) {
    const label = format
        ? (value) => (<span className="rounded bg-black/80 border border-cyan-400/50 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 tabular-nums absolute top-1 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-md backdrop-blur-sm pointer-events-none">
          {format(value)}
        </span>)
        : undefined;
    return (<WaveformPrimitive.Hover className={mergeClassNames(className, "bg-cyan-400/40 pointer-events-none inset-y-0 z-20 w-px")} data-slot="waveform-hover" {...props}>
      {label}
    </WaveformPrimitive.Hover>);
}
export { Waveform, WaveformHover, WaveformMarker, WaveformRegion, WaveformRegionHandle, };
export { default as AudioRangeSelection } from "./AudioRangeSelection";
