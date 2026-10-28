import { cn } from "@/lib/utils";
export function WindowDots({ variant = "glass", className }) {
    const dot = variant === "glass" ? "window-dot" : "window-dot-solid";
    return (<span className={cn("window-dots", className)} aria-hidden="true">
      <span className={dot}/>
      <span className={dot}/>
      <span className={dot}/>
    </span>);
}
