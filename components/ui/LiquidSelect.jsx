"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
export default function LiquidSelect({ value, onChange, options, placeholder = "Select...", className = "", menuClassName = "", disabled = false, align = "left", size = "md", }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectedOption = options.find((opt) => opt.value === value);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleOutsideClick = (e) => {
            if (containerRef.current &&
                !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);
    const handleSelect = useCallback((val) => {
        onChange(val);
        setIsOpen(false);
    }, [onChange]);
    return (<div ref={containerRef} className={`relative inline-block text-left select-none ${className} ${isOpen ? "z-[100]" : "z-10"}`}>
      
      <button type="button" disabled={disabled} onClick={() => !disabled && setIsOpen((prev) => !prev)} aria-haspopup="listbox" aria-expanded={isOpen} className={`group relative flex w-full items-center justify-between gap-2.5 rounded-xl border border-white/20 border-t-white/40 border-b-black/30 bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.18] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_4px_20px_rgba(255,102,178,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] ${isOpen
            ? "border-primary/50 bg-white/[0.16] shadow-[0_0_20px_rgba(255,102,178,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]"
            : ""} ${size === "sm" ? "h-8 px-2.5 text-[11px]" : "h-9"}`}>
        
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent opacity-50 transition-opacity group-hover:opacity-100"/>

        <div className="relative z-10 flex items-center gap-2 truncate">
          {selectedOption?.icon && (<span className="shrink-0 text-primary">{selectedOption.icon}</span>)}
          <span className="truncate tracking-wide">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (<span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-mono text-primary border border-primary/30">
              {selectedOption.badge}
            </span>)}
        </div>

        <svg className={`relative z-10 h-3.5 w-3.5 shrink-0 text-white/70 transition-transform duration-250 ease-out group-hover:text-white ${isOpen ? "rotate-180 text-primary" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (<div role="listbox" tabIndex={-1} className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 z-[100] min-w-[130px] w-max max-w-[280px] rounded-2xl border border-white/20 border-t-white/45 border-b-black/40 bg-[#0e0717]/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(255,102,178,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.35)] backdrop-blur-3xl transition-all duration-150 animate-in fade-in zoom-in-95 ${menuClassName}`}>
          
          <div className="pointer-events-none absolute -top-10 left-1/2 h-16 w-32 -translate-x-1/2 rounded-full bg-primary/25 blur-xl"/>

          <div className="relative z-10 flex flex-col gap-1">
            {options.map((option) => {
                const isSelected = option.value === value;
                return (<button key={option.value} type="button" role="option" aria-selected={isSelected} onClick={() => handleSelect(option.value)} className={`group/item relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all duration-150 cursor-pointer ${isSelected
                        ? "bg-gradient-to-r from-primary/30 via-primary/20 to-pink-500/10 text-white font-extrabold border border-primary/40 shadow-[0_0_12px_rgba(255,102,178,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                        : "text-slate-300 font-semibold hover:bg-white/[0.10] hover:text-white hover:translate-x-0.5"}`}>
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (<span className="shrink-0 text-sm">{option.icon}</span>)}
                    <div className="flex flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description && (<span className="text-[10px] font-normal text-muted-foreground/80">
                          {option.description}
                        </span>)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (<span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border/40">
                        {option.badge}
                      </span>)}

                    {isSelected && (<svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>)}
                  </div>
                </button>);
            })}
          </div>
        </div>)}
    </div>);
}
