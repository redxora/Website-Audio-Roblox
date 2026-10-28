import { cn } from "@/lib/utils";
export function formatQuotaLimit(limit) {
    return limit === null ? "∞" : String(limit);
}
export function formatQuotaRemaining(remaining) {
    return remaining === null ? "∞" : String(remaining);
}
export default function QuotaMeter({ data, ariaLabel, segments = 4, className, }) {
    const { limit, remaining } = data;
    const unlimited = limit === null || remaining === null;
    const ratio = unlimited ? 1 : Math.max(0, Math.min(1, (remaining ?? 0) / Math.max(1, limit)));
    const filled = unlimited ? segments : Math.ceil(ratio * segments);
    return (<span className={cn("flex shrink-0 items-center gap-1", className)} role="img" aria-label={ariaLabel ??
            (unlimited
                ? "Unlimited quota"
                : `${remaining} of ${limit} left today`)}>
      {Array.from({ length: segments }).map((_, i) => (<span key={i} className={cn("h-1 w-3 rounded-full transition-colors", i < filled ? "bg-foreground/70" : "bg-foreground/15")}/>))}
    </span>);
}
