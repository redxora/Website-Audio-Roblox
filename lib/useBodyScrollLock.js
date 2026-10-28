import { useEffect } from "react";
let lockCount = 0;
let prevOverflow = "";
let prevPaddingRight = "";
let lenisStopped = false;
function getLenis() {
    if (typeof window === "undefined")
        return undefined;
    return window.__lenis;
}
export function useBodyScrollLock(active) {
    useEffect(() => {
        if (!active || typeof document === "undefined")
            return;
        const body = document.body;
        const lock = () => {
            if (lockCount === 0) {
                prevOverflow = body.style.overflow;
                prevPaddingRight = body.style.paddingRight;
                const scrollbar = window.innerWidth - document.documentElement.clientWidth;
                body.style.overflow = "hidden";
                if (scrollbar > 0)
                    body.style.paddingRight = `${scrollbar}px`;
                document.documentElement.classList.add("modal-open");
                const lenis = getLenis();
                if (lenis?.stop) {
                    lenis.stop();
                    lenisStopped = true;
                }
            }
            lockCount += 1;
        };
        const unlock = () => {
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) {
                body.style.overflow = prevOverflow;
                body.style.paddingRight = prevPaddingRight;
                document.documentElement.classList.remove("modal-open");
                if (lenisStopped) {
                    getLenis()?.start?.();
                    lenisStopped = false;
                }
            }
        };
        lock();
        return unlock;
    }, [active]);
}
