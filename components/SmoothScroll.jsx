"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
export default function SmoothScroll() {
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const lenis = new Lenis({
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            prevent: (node) => {
                return Boolean(node.closest?.('[data-slot="dialog-content"], .app-dialog, [data-lenis-prevent], [role="dialog"], .overflow-y-auto'));
            },
        });
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
        window.__lenis = lenis;
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            delete window.__lenis;
        };
    }, []);
    return null;
}
