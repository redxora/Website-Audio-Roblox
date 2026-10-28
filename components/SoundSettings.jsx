"use client";
import { useState, useCallback, useId } from "react";
import { getMessages } from "@/lib/messages";
import PremiumLock from "@/components/dashboard/PremiumLock";
const PRESETS = [
    { id: "slow", label: "Slow 2.1x", speed: 2.1 },
    { id: "default", label: "Default 2.3x", speed: 2.3, hasIcon: true },
    { id: "fast", label: "Fast 2.5x", speed: 2.5 },
    { id: "faster", label: "Faster 2.7x", speed: 2.7 },
    { id: "ultra", label: "Ultra 2.9x", speed: 2.9 },
];
export function calculateVolumeDb(speed) {
    const stepsFromBase = Math.round((speed - 2.3) * 10);
    return -8 - stepsFromBase;
}
export function getPresetLabel(speed, currentPreset) {
    const match = PRESETS.find((p) => Math.abs(p.speed - speed) < 0.05);
    if (match) {
        if (match.id === "default")
            return "Default";
        if (match.id === "slow")
            return "Slow";
        if (match.id === "fast")
            return "Fast";
        if (match.id === "faster")
            return "Faster";
        if (match.id === "ultra")
            return "Ultra";
    }
    return "Custom";
}
export default function SoundSettings({ locale, defaultSpeed = 2.3, onChange, locked = false, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [speed, setSpeed] = useState(defaultSpeed);
    const [preset, setPreset] = useState("default");
    const sliderId = useId();
    const m = getMessages(locale);
    const volumeDb = calculateVolumeDb(speed);
    const presetLabel = getPresetLabel(speed, preset);
    const toggleOpen = () => {
        if (isOpen) {
            setIsClosing(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
            }, 200);
        }
        else {
            setIsOpen(true);
        }
    };
    const handleSelectPreset = useCallback((selectedPreset) => {
        setSpeed(selectedPreset.speed);
        setPreset(selectedPreset.id);
        onChange?.({
            speed: selectedPreset.speed,
            volumeDb: calculateVolumeDb(selectedPreset.speed),
            preset: selectedPreset.id,
        });
    }, [onChange]);
    const handleSliderChange = (newSpeed) => {
        setSpeed(newSpeed);
        const match = PRESETS.find((p) => Math.abs(p.speed - newSpeed) < 0.05);
        const newPreset = match ? match.id : "custom";
        setPreset(newPreset);
        onChange?.({
            speed: newSpeed,
            volumeDb: calculateVolumeDb(newSpeed),
            preset: newPreset,
        });
    };
    const minSpeed = 1.5;
    const maxSpeed = 3.5;
    const sliderPercent = Math.min(100, Math.max(0, ((speed - minSpeed) / (maxSpeed - minSpeed)) * 100));
    if (locked) {
        return (<section className="space-y-3">
        {/* Default values are still submitted so conversion proceeds without speed adjustments. */}
        <input type="hidden" name="speed" value={defaultSpeed}/>
        <input type="hidden" name="volumeDb" value={calculateVolumeDb(defaultSpeed)}/>
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-muted-foreground/10"/>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"/>
          </span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/50" aria-hidden="true">
            02
          </span>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {m.soundSettings.title}
          </h3>
        </div>
        <PremiumLock locale={locale} compact title={m.soundSettings.premium_title} description={m.soundSettings.premium_desc}/>
      </section>);
    }
    return (<section className="space-y-3">

      <input type="hidden" name="speed" value={speed}/>
      <input type="hidden" name="volumeDb" value={volumeDb}/>

      <div className="flex items-center gap-3">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
          <span className={`absolute inset-0 rounded-full transition-colors ${isOpen ? "bg-primary/20" : "bg-muted-foreground/10"}`}/>
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isOpen ? "bg-primary motion-safe:animate-pulse" : "bg-muted-foreground/40"}`}/>
        </span>

        <span className="font-mono text-[10px] tabular-nums transition-colors text-muted-foreground/50" aria-hidden="true">
          02
        </span>

        <h3 className="font-mono text-[10px] uppercase tracking-widest transition-colors text-muted-foreground">
          {m.soundSettings.title}
        </h3>

        <span data-anim="true" className="rail-track h-px flex-1 bg-border/40" aria-hidden="true"/>

        <span className="font-mono text-[11px] tabular-nums text-foreground/80 flex items-center gap-1.5">
          <span>{presetLabel}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{speed.toFixed(1)}x</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{volumeDb} dB</span>
        </span>

        <button type="button" onClick={toggleOpen} aria-expanded={isOpen} data-action="toggle-sound-settings" className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all cursor-pointer outline-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-md h-6 gap-1 px-2 text-[11px] text-foreground/90 border border-transparent hover:border-border/60">
          <span>
            {isOpen ? m.soundSettings.hide : m.soundSettings.edit}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 transition-transform duration-200 ${isOpen && !isClosing ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {(isOpen || isClosing) && (<div className={`rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-5 sound-expand-menu ${isClosing ? "is-closing" : ""}`}>

          <div className="space-y-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {m.soundSettings.presets}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => {
                const isActive = preset === p.id && Math.abs(speed - p.speed) < 0.05;
                return (<button key={p.id} type="button" onClick={() => handleSelectPreset(p)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${isActive
                        ? "border-border/90 bg-accent text-foreground font-semibold shadow-xs"
                        : "border-border/50 bg-background/50 text-muted-foreground hover:bg-accent/40 hover:text-foreground"}`}>
                    {p.hasIcon && (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-3.5 w-3.5" aria-hidden="true">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>)}
                    <span>{p.label}</span>
                  </button>);
            })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {m.soundSettings.speed}
              </span>
              <span className="font-mono text-xs tabular-nums text-foreground/90 font-medium">
                {speed.toFixed(1)}x · {volumeDb} dB
              </span>
            </div>

            <div className="relative flex items-center py-1">
              <input id={sliderId} type="range" min={minSpeed} max={maxSpeed} step={0.1} value={speed} onChange={(e) => handleSliderChange(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none bg-muted-foreground/30 accent-white" style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${sliderPercent}%, rgba(255, 255, 255, 0.2) ${sliderPercent}%, rgba(255, 255, 255, 0.2) 100%)`,
            }}/>
            </div>

            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              {m.soundSettings.volume_hint}
            </p>
          </div>
        </div>)}
    </section>);
}
