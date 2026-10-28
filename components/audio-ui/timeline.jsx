"use client";
import { Timeline as TimelinePrimitive } from "@audio-ui/react";
import { cn } from "@/lib/utils";
function mergeClassNames(custom, ...defaults) {
    if (typeof custom === "function") {
        return (state) => cn(...defaults, custom(state));
    }
    return cn(...defaults, custom);
}
function Timeline({ className, ...props }) {
    return (<TimelinePrimitive.Root className={mergeClassNames(className, "[--timeline-grid-color:rgba(56,189,248,0.15)] [--timeline-grid-accent-color:rgba(56,189,248,0.35)] flex w-full min-w-0 flex-col data-disabled:opacity-50 select-none")} data-slot="timeline" {...props}/>);
}
function TimelineViewport({ className, scrollbar = "native", ...props }) {
    return (<TimelinePrimitive.Viewport className={mergeClassNames(className, "bg-[#040813] relative min-h-0 min-w-0 overscroll-x-contain rounded-lg border border-[#1e3a5f]", scrollbar === "hidden" &&
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden")} data-slot="timeline-viewport" {...props}/>);
}
function TimelineRuler({ className, ...props }) {
    return (<TimelinePrimitive.Ruler className={mergeClassNames(className, "h-6 border-b border-[#1e293b] bg-[#070d1e] text-cyan-400/80 font-mono text-[11px] shrink-0 cursor-pointer touch-none select-none", "data-disabled:pointer-events-none")} data-slot="timeline-ruler" {...props}/>);
}
function gridLines(gridStep) {
    if (!(gridStep && gridStep > 0)) {
        return;
    }
    return {
        backgroundImage: "repeating-linear-gradient(to right, var(--timeline-grid-color) 0 1px, transparent 1px 100%)",
        backgroundSize: `calc(var(--timeline-unit) * ${gridStep}) 100%`,
    };
}
function TimelineLane({ className, gridStep, style, ...props }) {
    return (<TimelinePrimitive.Lane className={mergeClassNames(className, "h-20 sm:h-24 bg-[#040813] relative overflow-hidden")} data-slot="timeline-lane" style={{ ...gridLines(gridStep), ...style }} {...props}/>);
}
function TimelineMark({ className, ...props }) {
    return (<TimelinePrimitive.Mark className={mergeClassNames(className, "border-s border-[#1e3a5f] ps-1.5 tabular-nums pointer-events-none inset-y-0 flex items-center text-[10px] text-cyan-300/70 font-mono")} data-slot="timeline-mark" {...props}/>);
}
function TimelinePlayhead({ className, ...props }) {
    return (<TimelinePrimitive.Playhead className={mergeClassNames(className, "bg-white shadow-[0_0_8px_#38bdf8] pointer-events-none inset-y-0 w-0.5 z-30")} data-slot="timeline-playhead" {...props}/>);
}
function TimelineNavigator({ className, ...props }) {
    return (<TimelinePrimitive.Navigator className={mergeClassNames(className, "h-4 rounded bg-[#090f20] border border-[#1e3a5f]/60 shrink-0 select-none")} data-slot="timeline-navigator" {...props}>
      <TimelinePrimitive.NavigatorWindow aria-label="Visible range" className="bg-cyan-500/25 border border-cyan-400/50 hover:bg-cyan-500/35 inset-y-0 min-w-6 cursor-grab rounded-[inherit] active:cursor-grabbing shadow-[0_0_8px_rgba(6,182,212,0.3)]"/>
      <TimelinePrimitive.NavigatorHandle aria-label="Start of visible range" className="border-cyan-400 border bg-[#0b162c] inset-y-0.5 ms-0.5 w-1.5 cursor-ew-resize rounded-xs" edge="start"/>
      <TimelinePrimitive.NavigatorHandle aria-label="End of visible range" className="border-cyan-400 border bg-[#0b162c] inset-y-0.5 w-1.5 cursor-ew-resize rounded-xs data-[edge=end]:-translate-x-[calc(100%+0.125rem)]" edge="end"/>
    </TimelinePrimitive.Navigator>);
}
export { Timeline, TimelineLane, TimelineMark, TimelineNavigator, TimelinePlayhead, TimelineRuler, TimelineViewport, };
