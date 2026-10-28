"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const AeroShards = dynamic(() => import("./AeroShards"), {
    ssr: false,
});

function ShardsCanvasFallback() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const onResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", onResize);
        const shards = Array.from({ length: 90 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 28 + 12,
            speedX: (Math.random() - 0.5) * 0.45,
            speedY: (Math.random() - 0.5) * 0.45,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
            color: Math.random() > 0.4 ? "rgba(236, 72, 153, 0.22)" : "rgba(168, 85, 247, 0.18)",
            strokeColor: Math.random() > 0.4 ? "rgba(255, 0, 126, 0.45)" : "rgba(168, 85, 247, 0.35)",
            points: [
                [-1, -1.2],
                [0.8, -0.9],
                [1.2, 0.8],
                [-0.6, 1.1],
            ],
        }));

        let mouseX = width / 2;
        let mouseY = height / 2;
        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener("pointermove", onMouseMove, { passive: true });

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            const radGrad = ctx.createRadialGradient(
                mouseX,
                mouseY,
                10,
                width / 2,
                height / 2,
                Math.max(width, height) * 0.7
            );
            radGrad.addColorStop(0, "rgba(236, 72, 153, 0.08)");
            radGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.04)");
            radGrad.addColorStop(1, "rgba(8, 8, 8, 0)");
            ctx.fillStyle = radGrad;
            ctx.fillRect(0, 0, width, height);

            for (const s of shards) {
                s.x += s.speedX;
                s.y += s.speedY;
                s.rotation += s.rotSpeed;

                if (s.x < -40) s.x = width + 40;
                if (s.x > width + 40) s.x = -40;
                if (s.y < -40) s.y = height + 40;
                if (s.y > height + 40) s.y = -40;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);

                ctx.beginPath();
                s.points.forEach(([px, py], i) => {
                    const gx = px * s.size;
                    const gy = py * s.size;
                    if (i === 0) ctx.moveTo(gx, gy);
                    else ctx.lineTo(gx, gy);
                });
                ctx.closePath();

                ctx.fillStyle = s.color;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = s.strokeColor;
                ctx.stroke();

                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointermove", onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export default function AeroShardsBackground() {
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className="aero-shards-bg fixed inset-0 w-full h-full pointer-events-none z-0"
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
                overflow: "hidden",
            }}
            aria-hidden="true"
        >
            {!hasError ? (
                <AeroShards
                    shardColor="#ec4899"
                    accentColor="#ff007e"
                    backgroundColor="transparent"
                    placement="full"
                    material="glass"
                    markers="plus"
                    count={1300}
                    depthOfField={0.75}
                    vignette={0.3}
                    mouseInteraction
                    pulseOnClick
                    holdToGather
                    onError={(err) => {
                        console.warn("WebGPU AeroShards not available, using high-performance animated shard fallback:", err?.message || err);
                        setHasError(true);
                    }}
                />
            ) : (
                <ShardsCanvasFallback />
            )}
        </div>
    );
}
