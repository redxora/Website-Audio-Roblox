"use client";
import * as React from "react";
import { Check, CircleX, Info, LoaderCircle, RotateCcw, TriangleAlert, X } from "lucide-react";
const TONES = {
    info: { stripe: "bg-[#00f2fe]", icon: "text-[#00f2fe]", fill: "bg-[#00f2fe]/10", glow: "shadow-[0_0_15px_rgba(0,242,254,0.15)]", border: "border-cyan-500/30" },
    warning: { stripe: "bg-amber-400", icon: "text-amber-400", fill: "bg-amber-400/10", glow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]", border: "border-amber-500/30" },
    destructive: { stripe: "bg-rose-500", icon: "text-rose-400", fill: "bg-rose-500/10", glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]", border: "border-rose-500/30" },
    success: { stripe: "bg-emerald-400", icon: "text-emerald-400", fill: "bg-emerald-400/10", glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]", border: "border-emerald-500/30" },
};
const ICONS = { info: Info, warning: TriangleAlert, destructive: CircleX, success: Check };
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
function useReducedMotion() {
    const [reduced, setReduced] = React.useState(true);
    React.useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    return reduced;
}
export function ResolvingAlertBanner({ tone = "warning", title, description, action, successTitle, successDescription, errorTitle, errorDescription, status, onStatusChange, expectedMs = 2000, collapseOnSuccessMs = 1500, onCollapse, dismissible = false, onDismiss, icon, className = "", ref, }) {
    const reduced = useReducedMotion();
    const [localStatus, setLocalStatus] = React.useState("idle");
    const [collapsed, setCollapsed] = React.useState(false);
    const current = status ?? localStatus;
    const rootRef = React.useRef(null);
    const fillRef = React.useRef(null);
    const titleRef = React.useRef(null);
    const fillAnimation = React.useRef(null);
    const collapseTimer = React.useRef(0);
    const attempt = React.useRef(0);
    const previousStatus = React.useRef(current);
    const collapseCallback = React.useRef(onCollapse);
    collapseCallback.current = onCollapse;
    const setStatus = React.useCallback((next) => {
        if (status === undefined)
            setLocalStatus(next);
        onStatusChange?.(next);
    }, [status, onStatusChange]);
    const shownTone = current === "success" ? "success" : current === "error" ? "destructive" : tone;
    const shownTitle = current === "success" ? successTitle ?? title : current === "error" ? errorTitle ?? title : title;
    const shownDescription = current === "success" ? successDescription ?? description : current === "error" ? errorDescription ?? description : description;
    const collapse = React.useCallback(() => {
        const node = rootRef.current;
        const finish = () => { setCollapsed(true); collapseCallback.current?.(); };
        if (!node || reduced || typeof node.animate !== "function") {
            finish();
            return;
        }
        const height = node.getBoundingClientRect().height;
        const animation = node.animate([
            { height: `${height}px`, opacity: 1, marginBottom: getComputedStyle(node).marginBottom },
            { height: "0px", opacity: 0, marginBottom: "0px" },
        ], { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" });
        animation.onfinish = finish;
    }, [reduced]);
    const run = async () => {
        if (!action || current === "pending")
            return;
        attempt.current += 1;
        setStatus("pending");
        try {
            await action.onAction();
            setStatus("success");
        }
        catch {
            setStatus("error");
        }
    };
    React.useLayoutEffect(() => {
        const fill = fillRef.current;
        const was = previousStatus.current;
        previousStatus.current = current;
        if (!fill)
            return;
        if (current === "pending") {
            fillAnimation.current?.cancel();
            if (reduced || typeof fill.animate !== "function") {
                fill.style.width = "100%";
                return;
            }
            fill.style.width = "0%";
            fillAnimation.current = fill.animate([{ width: "0%" }, { width: "88%" }], { duration: expectedMs, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" });
            return;
        }
        if (was === "pending" && current === "success") {
            fillAnimation.current?.cancel();
            if (reduced || typeof fill.animate !== "function") {
                fill.style.width = "100%";
            }
            else {
                const width = getComputedStyle(fill).width;
                fillAnimation.current = fill.animate([{ width }, { width: "100%" }], { duration: 260, easing: EASE, fill: "forwards" });
            }
        }
        else if (current === "error" || current === "idle") {
            fillAnimation.current?.cancel();
            fill.style.width = "0%";
        }
        const root = rootRef.current;
        if (root && current === "error" && !reduced && typeof root.animate === "function") {
            root.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(2px)" }, { transform: "translateX(0)" }], { duration: 380, easing: "ease-out" });
        }
        const heading = titleRef.current;
        if (heading && was !== current && (current === "success" || current === "error") && !reduced && typeof heading.animate === "function") {
            heading.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 300, easing: EASE });
        }
    }, [current, expectedMs, reduced]);
    React.useEffect(() => {
        if (current !== "success" || collapseOnSuccessMs === false)
            return;
        collapseTimer.current = window.setTimeout(collapse, collapseOnSuccessMs);
        return () => window.clearTimeout(collapseTimer.current);
    }, [current, collapseOnSuccessMs, collapse]);
    React.useEffect(() => () => { window.clearTimeout(collapseTimer.current); fillAnimation.current?.cancel(); }, []);
    if (collapsed)
        return null;
    const ToneIcon = ICONS[shownTone];
    const styles = TONES[shownTone];
    const label = current === "pending" ? action?.pendingLabel ?? "Working…" : current === "success" ? action?.doneLabel ?? "Done" : current === "error" ? action?.retryLabel ?? "Retry" : action?.label;
    return (<div ref={(node) => { rootRef.current = node; if (typeof ref === "function")
        ref(node);
    else if (ref)
        ref.current = node; }} role={shownTone === "info" || shownTone === "success" ? "status" : "alert"} data-slot="resolving-alert-banner" data-tone={shownTone} data-status={current} data-attempt={attempt.current} className={`relative overflow-hidden rounded-xl border bg-[#0d111d]/95 backdrop-blur-2xl text-white shadow-[0_10px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all ${styles.border} ${styles.glow} ${className}`}>
      <span ref={fillRef} data-fill aria-hidden="true" style={{ width: "0%" }} className={`pointer-events-none absolute inset-y-0 left-0 ${styles.fill}`}/>
      <span data-stripe aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 transition-colors duration-300 motion-reduce:transition-none ${styles.stripe}`}/>
      <div className="relative flex items-start gap-2.5 py-2.5 pl-3.5 pr-2">
        <span data-icon className={`relative mt-0.5 flex size-4 shrink-0 items-center justify-center transition-colors duration-300 motion-reduce:transition-none ${styles.icon}`}>
          {current === "pending" ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true"/> : icon && current === "idle" ? icon : <ToneIcon className="size-4" aria-hidden="true"/>}
        </span>
        <div className="min-w-0 flex-1">
          <p ref={titleRef} data-title className="text-xs font-bold leading-snug text-white">{shownTitle}</p>
          {shownDescription && <p data-description className="mt-0.5 text-[11px] leading-relaxed text-[#94a3b8]">{shownDescription}</p>}
        </div>
        {action && (<button type="button" data-action data-action-status={current} onClick={run} disabled={current === "pending" || current === "success"} aria-busy={current === "pending"} className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold outline-none transition-[background-color,color,transform] duration-300 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] disabled:cursor-default ${current === "success" ? "bg-emerald-500/20 text-emerald-300" : current === "pending" ? "bg-white/10 text-white/50" : "bg-primary text-white hover:opacity-90"}`}>
            {current === "pending" && <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true"/>}
            {current === "success" && <Check className="size-3 text-emerald-400" aria-hidden="true"/>}
            {current === "error" && <RotateCcw className="size-3" aria-hidden="true"/>}
            <span>{label}</span>
          </button>)}
        {dismissible && current !== "pending" && (<button type="button" data-dismiss aria-label="Dismiss" onClick={() => { onDismiss?.(); collapse(); }} className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 outline-none transition-colors cursor-pointer">
            <X className="size-3.5" aria-hidden="true"/>
          </button>)}
      </div>
    </div>);
}
export default ResolvingAlertBanner;
