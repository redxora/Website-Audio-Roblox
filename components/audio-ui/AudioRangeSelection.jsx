"use client";
import React, { useRef, useState, useCallback } from "react";
export default function AudioRangeSelection({ duration, trimStart, trimEnd, onRangeChange, onSeek, formatTime, disabled = false, minDuration = 0.2, fileName, containerRef, }) {
    const localRef = useRef(null);
    const targetRef = containerRef || localRef;
    const [activeDrag, setActiveDrag] = useState(null);
    const dragInfoRef = useRef(null);
    const getTimeFromClientX = useCallback((clientX) => {
        const el = targetRef.current;
        if (!el || duration <= 0)
            return 0;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0)
            return 0;
        const relativeX = clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
        return ratio * duration;
    }, [duration, targetRef]);
    const handlePointerDown = useCallback((dragType, e) => {
        if (disabled || duration <= 0)
            return;
        if (e.button !== 0)
            return;
        e.preventDefault();
        e.stopPropagation();
        const pointerId = e.pointerId;
        try {
            e.currentTarget.setPointerCapture(pointerId);
        }
        catch (_) { }
        dragInfoRef.current = {
            dragType,
            startX: e.clientX,
            initialStart: trimStart,
            initialEnd: trimEnd,
            pointerId,
        };
        setActiveDrag(dragType);
    }, [disabled, duration, trimStart, trimEnd]);
    const handlePointerMove = useCallback((e) => {
        const info = dragInfoRef.current;
        if (!info)
            return;
        e.preventDefault();
        e.stopPropagation();
        const el = targetRef.current;
        if (!el || duration <= 0)
            return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0)
            return;
        const currentSec = getTimeFromClientX(e.clientX);
        if (info.dragType === "start") {
            const maxStart = Math.max(0, info.initialEnd - minDuration);
            const newStart = Math.max(0, Math.min(currentSec, maxStart));
            onRangeChange(Number(newStart.toFixed(1)), info.initialEnd);
        }
        else if (info.dragType === "end") {
            const minEnd = Math.min(duration, info.initialStart + minDuration);
            const newEnd = Math.min(duration, Math.max(currentSec, minEnd));
            onRangeChange(info.initialStart, Number(newEnd.toFixed(1)));
        }
        else if (info.dragType === "body") {
            const deltaX = e.clientX - info.startX;
            const deltaSec = (deltaX / rect.width) * duration;
            const length = info.initialEnd - info.initialStart;
            let newStart = info.initialStart + deltaSec;
            let newEnd = info.initialEnd + deltaSec;
            if (newStart < 0) {
                newStart = 0;
                newEnd = Math.min(duration, length);
            }
            else if (newEnd > duration) {
                newEnd = duration;
                newStart = Math.max(0, duration - length);
            }
            onRangeChange(Number(newStart.toFixed(1)), Number(newEnd.toFixed(1)));
        }
    }, [duration, getTimeFromClientX, minDuration, onRangeChange, targetRef]);
    const handlePointerUp = useCallback((e) => {
        const info = dragInfoRef.current;
        if (info) {
            try {
                e.currentTarget.releasePointerCapture(info.pointerId);
            }
            catch (_) { }
            dragInfoRef.current = null;
            setActiveDrag(null);
        }
    }, []);
    const handleDimmedRegionClick = useCallback((e) => {
        if (disabled || duration <= 0)
            return;
        if (activeDrag)
            return;
        e.stopPropagation();
        const clickTime = getTimeFromClientX(e.clientX);
        if (onSeek) {
            onSeek(Number(clickTime.toFixed(1)));
        }
    }, [activeDrag, disabled, duration, getTimeFromClientX, onSeek]);
    if (duration <= 0)
        return null;
    const safeStart = Math.max(0, Math.min(trimStart, duration));
    const safeEnd = Math.max(safeStart, Math.min(trimEnd, duration));
    const leftPercent = (safeStart / duration) * 100;
    const rightPercent = (safeEnd / duration) * 100;
    const widthPercent = Math.max(0, rightPercent - leftPercent);
    return (<div ref={localRef} className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible">

        {fileName && (<div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[11px] text-cyan-400/25 tracking-wide pointer-events-none select-none">
            {fileName}
        </div>)}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[10px] text-cyan-400/20 tracking-wider pointer-events-none select-none">
            {formatTime(duration)}
        </div>

        {leftPercent > 0 && (<div onPointerDown={handleDimmedRegionClick} style={{ width: `${leftPercent}%` }} className="absolute inset-y-0 left-0 bg-[#02050e]/75 border-r border-[#38bdf8]/40 pointer-events-auto cursor-pointer transition-colors hover:bg-[#02050e]/60 group/leftmask" title="Klik untuk pindah ke posisi ini" />)}

        {rightPercent < 100 && (<div onPointerDown={handleDimmedRegionClick} style={{ left: `${rightPercent}%`, right: 0 }} className="absolute inset-y-0 bg-[#02050e]/75 border-l border-[#38bdf8]/40 pointer-events-auto cursor-pointer transition-colors hover:bg-[#02050e]/60 group/rightmask" title="Klik untuk pindah ke posisi ini" />)}

        <div onPointerDown={(e) => handlePointerDown("body", e)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
        }} className={`absolute inset-y-0 border-y-2 border-[#38bdf8] bg-[#38bdf8]/12 shadow-[0_0_24px_rgba(56,189,248,0.35),inset_0_0_25px_rgba(56,189,248,0.1)] pointer-events-auto select-none transition-colors ${activeDrag === "body"
            ? "cursor-grabbing bg-[#38bdf8]/20 shadow-[0_0_30px_rgba(56,189,248,0.5)] border-sky-300"
            : "cursor-grab hover:bg-[#38bdf8]/16"}`} title="Geser bagian tengah untuk memindahkan rentang">

            {activeDrag === "body" && (<div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#081528] border border-cyan-400 px-2 py-0.5 rounded font-mono text-[10px] text-cyan-300 font-bold shadow-lg pointer-events-none whitespace-nowrap z-50">
                {formatTime(safeStart)} → {formatTime(safeEnd)} ({formatTime(safeEnd - safeStart)})
            </div>)}

            <div onPointerDown={(e) => handlePointerDown("start", e)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="absolute inset-y-0 left-0 -translate-x-1/2 w-4 sm:w-5 flex items-center justify-center cursor-ew-resize touch-none select-none z-30 group/handle" title="Tarik untuk mengubah titik awal">

                <div className={`h-full w-2.5 sm:w-3 rounded-[3px] bg-[#38bdf8] border border-sky-200 flex flex-col items-center justify-center gap-1 shadow-[0_0_12px_#38bdf8] transition-all ${activeDrag === "start"
                    ? "bg-white scale-y-105 shadow-[0_0_18px_#38bdf8] border-white"
                    : "group-hover/handle:scale-y-105 group-hover/handle:bg-sky-300"}`}>
                    <div className="flex flex-col gap-0.5 items-center justify-center pointer-events-none">
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                    </div>
                </div>

                {activeDrag === "start" && (<div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#081528] border border-cyan-400 px-2 py-0.5 rounded font-mono text-[10px] text-cyan-300 font-bold shadow-lg pointer-events-none whitespace-nowrap z-50">
                    Awal: {formatTime(safeStart)}
                </div>)}
            </div>

            <div onPointerDown={(e) => handlePointerDown("end", e)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="absolute inset-y-0 right-0 translate-x-1/2 w-4 sm:w-5 flex items-center justify-center cursor-ew-resize touch-none select-none z-30 group/handle" title="Tarik untuk mengubah titik akhir">

                <div className={`h-full w-2.5 sm:w-3 rounded-[3px] bg-[#38bdf8] border border-sky-200 flex flex-col items-center justify-center gap-1 shadow-[0_0_12px_#38bdf8] transition-all ${activeDrag === "end"
                    ? "bg-white scale-y-105 shadow-[0_0_18px_#38bdf8] border-white"
                    : "group-hover/handle:scale-y-105 group-hover/handle:bg-sky-300"}`}>
                    <div className="flex flex-col gap-0.5 items-center justify-center pointer-events-none">
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                        <span className="w-1 h-1 rounded-full bg-slate-900" />
                    </div>
                </div>

                {activeDrag === "end" && (<div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#081528] border border-cyan-400 px-2 py-0.5 rounded font-mono text-[10px] text-cyan-300 font-bold shadow-lg pointer-events-none whitespace-nowrap z-50">
                    Akhir: {formatTime(safeEnd)}
                </div>)}
            </div>
        </div>
    </div>);
}
