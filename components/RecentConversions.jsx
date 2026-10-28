"use client";
import { useState, useEffect, useCallback } from "react";
import { localizedHref } from "@/lib/i18n";
import { WindowDots } from "@/components/ui/WindowDots";
import { getMessages } from "@/lib/messages";
import ConversionCover from "@/components/dashboard/ConversionCover";
import notify from "@/lib/notify";
import { audioBufferToMp3 } from "@/lib/audio-encoder";
function timeAgo(dateString, rc) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSec < 30)
    return rc.just_now;
  if (diffSec < 60)
    return `${diffSec}${rc.seconds_ago}`;
  if (diffMin < 60)
    return `${diffMin}${rc.minutes_ago}`;
  if (diffHours < 24)
    return `${diffHours}${rc.hours_ago}`;
  return `${diffDays}${rc.days_ago}`;
}
function formatExactDate(dateString) {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
  catch {
    return dateString;
  }
}
function formatDisplayTitle(originalName, outputName) {
  if (!originalName)
    return outputName.replace(/\.wav$/i, "") || "Audio Track";
  if (!/^https?:\/\//i.test(originalName) && !originalName.includes("youtu.be/") && !originalName.includes("youtube.com/")) {
    return originalName.replace(/\.(mp3|wav|ogg|m4a|aac|flac)$/i, "");
  }
  const cleanOutput = outputName.replace(/\.wav$/i, "").replace(/ \(Nightcore\)$/i, "");
  if (cleanOutput && !/^[a-zA-Z0-9_-]{11}$/.test(cleanOutput) && !cleanOutput.startsWith("cilaaa-")) {
    return cleanOutput;
  }
  const withoutQuery = originalName.split("?")[0].split("#")[0].replace(/^https?:\/\/(www\.)?/, "");
  const lastSegment = withoutQuery.split("/").filter(Boolean).pop() || "Audio Track";
  return decodeURIComponent(lastSegment).replace(/[_-]+/g, " ");
}
export default function RecentConversions({ locale, isHistoryPage = false, }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const m = getMessages(locale);
  const rc = m.recentConversions;
  const fetchConversions = useCallback(async () => {
    try {
      const res = await fetch("/api/conversions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.conversions)) {
          setItems(data.conversions);
        }
      }
    }
    catch {
    }
    finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchConversions();
    const handleProgress = (event) => {
      const customEvent = event;
      const { item, isNew } = customEvent.detail;
      setItems((prev) => {
        const index = prev.findIndex((x) => x.id === item.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...item };
          return updated;
        }
        if (isNew) {
          return [item, ...prev];
        }
        return [item, ...prev];
      });
    };
    window.addEventListener("cilaaa:conversion-progress", handleProgress);
    window.addEventListener("cilaaa:refresh-conversions", fetchConversions);
    return () => {
      window.removeEventListener("cilaaa:conversion-progress", handleProgress);
      window.removeEventListener("cilaaa:refresh-conversions", fetchConversions);
    };
  }, [fetchConversions]);
  useEffect(() => {
    const processingItems = items.filter((x) => x.status === "roblox_processing");
    if (processingItems.length === 0)
      return;
    const interval = setInterval(async () => {
      for (const item of processingItems) {
        try {
          const res = await fetch(`/api/roblox/upload-audio?conversionId=${encodeURIComponent(item.id)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "uploaded" || data.assetId) {
              setItems((prev) => prev.map((x) => x.id === item.id
                ? { ...x, status: "uploaded", roblox_asset_id: data.assetId }
                : x));
            }
            else if (data.status === "failed") {
              setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: "failed" } : x)));
            }
          }
        }
        catch {
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [items]);
  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (deletingId)
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/conversions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        if (expandedId === id)
          setExpandedId(null);
      }
    }
    catch {
    }
    finally {
      setDeletingId(null);
    }
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };
  const handleDownload = async (item, format) => {
    if (downloadingId || !item.output_file_path)
      return;
    setDownloadingId(item.id);
    try {
      const fileUrl = `/api/files/${item.output_file_path.split("/").map(encodeURIComponent).join("/")}`;
      if (!item.output_file_path)
        throw new Error(rc.file_not_found);
      const baseName = (item.output_name || item.original_name || "audio").replace(/\.[^/.]+$/, "");
      if (format === "wav") {
        const res = await fetch(fileUrl);
        if (!res.ok)
          throw new Error(rc.file_download_err);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
      const res = await fetch(fileUrl);
      if (!res.ok)
        throw new Error(rc.file_download_err);
      const arrayBuffer = await res.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      void audioCtx.close();
      const blob = await audioBufferToMp3(audioBuffer);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    catch (err) {
      console.error("Download failed:", err);
      notify.error(rc.file_download_err, rc.download_failed_alert);
    }
    finally {
      setDownloadingId(null);
    }
  };
  const displayItems = isHistoryPage ? items : items.slice(0, 5);
  return (<div data-slot="card" className="flex flex-col w-full gap-0 overflow-hidden rounded-2xl border border-white/20 border-t-white/50 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-pink-500/[0.02] backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.3),0_0_30px_rgba(255,0,126,0.1)] py-0 text-card-foreground">

    <div className="flex items-center gap-2 border-b border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-xl">
      <WindowDots />
      <span className="ml-2 font-mono text-xs text-white/70">
        {isHistoryPage ? "cilaaa — history" : "cilaaa — recent"}
      </span>

      {!isHistoryPage && (<a className="group ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground" href={localizedHref("/dashboard/history", locale)}>
        {rc.view_all}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </a>)}
    </div>

    <div data-slot="card-content" className="px-4 py-6 sm:px-6">
      {displayItems.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-gradient-to-b from-white/[0.04] to-pink-500/[0.02] backdrop-blur-xl py-12 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history h-8 w-8 text-muted-foreground/50" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
        <p className="font-mono text-sm text-muted-foreground">
          {rc.empty_title}
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground/70">
          {rc.empty_hint}
        </p>
      </div>) : (<div className="space-y-3">
        {displayItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const createdAtMs = new Date(item.created_at).getTime();
          const isExpired = Date.now() - createdAtMs > 2 * 60 * 60 * 1000 &&
            !item.roblox_asset_id &&
            item.status !== "converting" &&
            item.status !== "uploading";
          const isConverting = item.status === "converting";
          const isUploading = item.status === "uploading";
          const isReviewing = item.status === "roblox_processing";
          const isUploadedToRoblox = Boolean(item.roblox_asset_id) || item.status === "uploaded";
          const step1Done = !isConverting;
          const step1Active = isConverting;
          const step2Done = !isConverting && !isUploading && item.status !== "prepared";
          const step2Active = isUploading || item.status === "prepared";
          const step3Done = isUploadedToRoblox;
          const step3Active = isReviewing;
          const step4Done = isUploadedToRoblox;
          const step4Active = false;
          const speed = item.speed || 2.3;
          const normalSpeed = (1 / speed).toFixed(2);
          const maxDuration = 400;
          const isYoutube = item.original_name.includes("youtube.com") ||
            item.original_name.includes("youtu.be");
          const sourceType = isYoutube
            ? "YOUTUBE"
            : item.original_name.startsWith("http")
              ? "URL"
              : "FILE";
          const dlTime = item.downloadTimeSeconds || 18;
          const procTime = item.processTimeSeconds || 6.4;
          const totalTime = Math.round(dlTime + procTime);
          const sizeMb = ((item.bytes || 3145728) / (1024 * 1024)).toFixed(1);
          return (<div key={item.id} className="rounded-xl border border-white/12 border-t-white/30 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 backdrop-blur-xl transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">

            <div onClick={() => toggleExpand(item.id)} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 cursor-pointer select-none">
              <div className="flex items-center gap-3 min-w-0">
                <ConversionCover originalName={item.original_name} />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-heading text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md md:max-w-lg">
                      {formatDisplayTitle(item.original_name, item.output_name)}
                    </h4>

                    {isExpired ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {rc.status_expired}
                    </span>) : isUploadedToRoblox ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {rc.status_ready}
                    </span>) : isConverting ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-400 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      {rc.status_converting}
                    </span>) : isUploading ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-400 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      {rc.status_uploading}
                    </span>) : isReviewing ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-yellow-400 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      {rc.status_reviewing}
                    </span>) : item.status === "failed" ? (<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      {rc.status_failed}
                    </span>) : null}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground/60 select-none">

                    <span className={`flex items-center gap-1 ${step1Done
                      ? "text-emerald-400 font-medium"
                      : step1Active
                        ? "text-primary font-medium"
                        : "text-muted-foreground/50"}`}>
                      {step1Done ? (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>) : (<span className={`h-1.5 w-1.5 rounded-full ${step1Active
                        ? "bg-primary motion-safe:animate-pulse"
                        : "bg-muted-foreground/40"}`} />)}
                      CONVERT
                    </span>

                    <span className="text-muted-foreground/30">—</span>

                    <span className={`flex items-center gap-1 ${step2Done
                      ? "text-emerald-400 font-medium"
                      : step2Active
                        ? "text-primary font-medium"
                        : "text-muted-foreground/50"}`}>
                      {step2Done ? (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>) : (<span className={`h-1.5 w-1.5 rounded-full ${step2Active
                        ? "bg-primary motion-safe:animate-pulse"
                        : "bg-muted-foreground/40"}`} />)}
                      UPLOAD
                    </span>

                    <span className="text-muted-foreground/30">—</span>

                    <span className={`flex items-center gap-1 ${step3Done
                      ? "text-emerald-400 font-medium"
                      : step3Active
                        ? "text-primary font-medium"
                        : "text-muted-foreground/50"}`}>
                      {step3Done ? (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>) : (<span className={`h-1.5 w-1.5 rounded-full ${step3Active
                        ? "bg-primary motion-safe:animate-pulse"
                        : "bg-muted-foreground/40"}`} />)}
                      REVIEW
                    </span>

                    <span className="text-muted-foreground/30">—</span>

                    <span className={`flex items-center gap-1 ${step4Done
                      ? "text-emerald-400 font-medium"
                      : step4Active
                        ? "text-primary font-medium"
                        : "text-muted-foreground/50"}`}>
                      {step4Done ? (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>) : (<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />)}
                      IN GAME
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto sm:ml-0 text-muted-foreground shrink-0">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {timeAgo(item.created_at, rc)}
                </span>
                <button type="button" aria-expanded={isExpanded} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {isExpanded && (<div className="border-t border-border/70 p-4 sm:p-5 space-y-4 bg-muted/10 animate-in fade-in-50 duration-200">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {rc.details}
              </p>

              <div className="rounded-lg border border-border/80 bg-background/60 overflow-hidden font-mono text-xs divide-y divide-border/60">

                {item.roblox_asset_id && (<div className="grid grid-cols-1 sm:grid-cols-4 p-3.5 gap-2 sm:gap-4 items-center bg-emerald-500/10 border-l-4 border-emerald-500">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    ROBLOX ASSET ID
                  </span>
                  <div className="sm:col-span-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground bg-black/50 px-2.5 py-1 rounded-md border border-white/15 select-all">
                      {item.roblox_asset_id}
                    </span>
                    <button type="button" onClick={(e) => {
                      e.stopPropagation();
                      if (item.roblox_asset_id) {
                        navigator.clipboard.writeText(String(item.roblox_asset_id));
                      }
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-mono text-foreground transition-colors cursor-pointer border border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                      {rc.btn_copy_id}
                    </button>
                    <a href={`https://create.roblox.com/dashboard/creations/audio/${item.roblox_asset_id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/20 hover:bg-primary/30 text-xs font-mono text-primary transition-colors border border-primary/30">
                      <span>{rc.btn_inspect_roblox}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                    </a>
                  </div>
                </div>)}

                <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-1 sm:gap-4 items-baseline">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.source}
                  </span>
                  <div className="sm:col-span-3 flex items-center gap-2 truncate">
                    <span className="text-muted-foreground/70 font-semibold">
                      {sourceType}
                    </span>
                    <span className="text-foreground truncate select-all">
                      {item.original_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-1 sm:gap-4 items-baseline">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.speed}
                  </span>
                  <span className="sm:col-span-3 text-foreground">
                    {speed.toFixed(1)}x Max Duration: {maxDuration}s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-1 sm:gap-4 items-baseline">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.normal_speed}
                  </span>
                  <div className="sm:col-span-3 flex items-center gap-1.5 text-foreground">
                    <span>{normalSpeed}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-1 sm:gap-4 items-baseline">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.date}
                  </span>
                  <span className="sm:col-span-3 text-foreground tabular-nums">
                    {formatExactDate(item.created_at)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-1 sm:gap-4 items-baseline">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.timing}
                  </span>
                  <span className="sm:col-span-3 text-foreground tabular-nums">
                    Download {dlTime} s ({sizeMb} MB, 21.0 MB/s) · Process {procTime} s · Total {totalTime} s
                  </span>
                </div>

                {!isHistoryPage && item.output_file_path && item.status !== "failed" && (<div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2 sm:gap-4 items-center">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {rc.download_song}
                  </span>
                  <div className="sm:col-span-3 flex flex-wrap items-center gap-2">
                    <button type="button" disabled={downloadingId === item.id} onClick={(e) => {
                      e.stopPropagation();
                      void handleDownload(item, "wav");
                    }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/15 hover:bg-primary/25 border border-primary/40 text-xs font-mono font-semibold text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                      {downloadingId === item.id
                        ? rc.preparing
                        : "WAV"}
                    </button>
                    <button type="button" disabled={downloadingId === item.id} onClick={(e) => {
                      e.stopPropagation();
                      void handleDownload(item, "mp3");
                    }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                      {downloadingId === item.id
                        ? rc.encoding
                        : "MP3"}
                    </button>
                  </div>
                </div>)}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    {rc.retention_notice}
                  </span>
                </div>

                <button type="button" disabled={deletingId === item.id} onClick={(e) => handleDelete(item.id, e)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer ml-auto sm:ml-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>
                    {deletingId === item.id ? rc.btn_deleting : rc.btn_delete}
                  </span>
                </button>
              </div>
            </div>)}
          </div>);
        })}
      </div>)}
    </div>
  </div>);
}
