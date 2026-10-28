"use client";
import { useEffect, useState, useRef } from "react";
const PROVIDERS = [
    { id: "youtube", label: "YouTube", icon: "▶" },
    { id: "tiktok", label: "TikTok", icon: "♪" },
    { id: "soundcloud", label: "SoundCloud", icon: "☁" },
    { id: "spotify", label: "Spotify", icon: "●" },
    { id: "direct", label: "Direct Audio", icon: "♫" },
];
function detectProvider(input) {
    const clean = input.trim().toLowerCase();
    if (!clean || !clean.startsWith("http"))
        return null;
    if (clean.includes("youtube.com") || clean.includes("youtu.be"))
        return "youtube";
    if (clean.includes("tiktok.com"))
        return "tiktok";
    if (clean.includes("soundcloud.com"))
        return "soundcloud";
    if (clean.includes("spotify.com"))
        return "spotify";
    return "direct";
}
export default function ConvertLinkSource({ locale, messages, autoFocus = false, }) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const debounceTimer = useRef(null);
    const detected = detectProvider(value);
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        const trimmed = value.trim();
        if (!trimmed || !trimmed.startsWith("http")) {
            setPreview(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/audio/metadata?url=${encodeURIComponent(trimmed)}`);
                if (res.ok) {
                    const data = (await res.json());
                    setPreview(data);
                }
                else {
                    setPreview(null);
                }
            }
            catch {
                setPreview(null);
            }
            finally {
                setLoading(false);
            }
        }, 350);
        return () => {
            if (debounceTimer.current)
                clearTimeout(debounceTimer.current);
        };
    }, [value]);
    return (<div className="space-y-4">
      {/* 5 Providers Pill Badges */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 pb-0.5">
        <span className="text-[11px] font-mono text-muted-foreground/70 uppercase tracking-wider mr-1">
          Supported Providers:
        </span>
        {PROVIDERS.map((p) => {
            const isActive = detected === p.id;
            return (<span key={p.id} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition-all select-none ${isActive
                    ? "border-primary/60 bg-primary/20 text-primary shadow-[0_0_12px_rgba(236,72,153,0.3)] ring-1 ring-primary/40 scale-105"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground/70 hover:border-white/20"}`}>
              <span className={`text-[11px] ${isActive ? "text-primary" : "text-muted-foreground/50"}`}>
                {p.icon}
              </span>
              <span>{p.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse ml-0.5"/>}
            </span>);
        })}
      </div>

      {/* Input Field */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music pointer-events-none absolute left-4.5 sm:left-5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/80" aria-hidden="true">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>

        <input data-slot="input" name="url" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-12 rounded-xl !pl-12 !pr-10" style={{ paddingLeft: "3.25rem", paddingRight: "2.5rem" }} placeholder={messages.paste_youtube_soundcloud_tiktok_or_audio} type="url" value={value} autoFocus={autoFocus} onChange={(event) => setValue(event.target.value)} aria-label={messages.paste_a_link}/>

        {loading && (<div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
          </div>)}
      </div>

      {/* Metadata Preview Card */}
      {preview && preview.title ? (<div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center p-3.5 gap-3.5">
            {preview.thumbnailUrl ? (<div className="relative h-16 w-28 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-inner">
                <img src={preview.thumbnailUrl} alt={preview.title} className="h-full w-full object-cover" loading="lazy"/>
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[9px] font-semibold text-white/90 uppercase">
                  {preview.providerLabel}
                </span>
              </div>) : null}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
                  {preview.providerLabel.toUpperCase()}
                </span>
                {preview.author && (<span className="truncate font-mono text-[11px] text-muted-foreground/80">
                    by {preview.author}
                  </span>)}
              </div>
              <h4 className="font-heading text-sm font-semibold text-foreground line-clamp-2">
                {preview.title}
              </h4>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                ✓ Judul lagu resmi terdeteksi & siap dikonversi
              </p>
            </div>
          </div>
        </div>) : loading ? (<div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3 text-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse">
            Memuat judul lagu resmi dari {detected ? detected.toUpperCase() : "link"}...
          </p>
        </div>) : null}
    </div>);
}
