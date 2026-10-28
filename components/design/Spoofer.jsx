"use client";
import { useState } from "react";
import { getMessages } from "@/lib/messages";
import CustomIcon from "@/components/ui/CustomIcon";
import LiquidSelect from "@/components/ui/LiquidSelect";
import { WindowDots } from "@/components/ui/WindowDots";
import ModernDashboardSidebar, { DashboardMobileNavTrigger } from "@/components/dashboard/ModernDashboardSidebar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
export default function Spoofer({ locale, userName = "Guest", avatarUrl, nameplateUrl, nameplateVideoUrl, userPlan, quota, }) {
    const m = getMessages(locale);
    const spooferLimit = quota?.spoofer.limit ?? userPlan?.spooferLimit ?? null;
    const spooferRemaining = quota?.spoofer.remaining ?? spooferLimit;
    const spooferQuotaText = spooferLimit === null
        ? m.spoofer.unlimited
        : `${spooferRemaining} / ${spooferLimit} ${m.spoofer.per_24h}`;
    const autoUploadLimit = quota?.autoUpload.limit ?? userPlan?.autoUploadLimit ?? null;
    const autoUploadRemaining = quota?.autoUpload.remaining ?? autoUploadLimit;
    const autoUploadQuotaText = autoUploadLimit === null
        ? m.spoofer.unlimited
        : `${autoUploadRemaining} / ${autoUploadLimit} ${m.spoofer.per_24h}`;
    const [assetInput, setAssetInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [autoUploadEnabled, setAutoUploadEnabled] = useState(false);
    const [targetType, setTargetType] = useState("user");
    const [groupId, setGroupId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const demoAssetId = "80973462842012";
    async function handleInspect(idToInspect) {
        const targetId = idToInspect || assetInput;
        if (!targetId.trim()) {
            setError(m.spoofer.err_invalid_id || "Please enter a valid Roblox Asset ID or URL.");
            return;
        }
        setLoading(true);
        setError(null);
        setUploadResult(null);
        try {
            const res = await fetch("/api/roblox/spoofer/inspect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assetIdOrUrl: targetId }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || m.spoofer.err_failed_inspect || "Failed to inspect Roblox asset.");
            }
            setResult(data);
            if (!idToInspect)
                setAssetInput(data.assetId);
            if (autoUploadEnabled) {
                handleUpload(data.assetId, data.assetName, data.assetType);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : m.common.unexpected_error || "An error occurred.");
            setResult(null);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleUpload(assetId, assetName, assetType) {
        setUploading(true);
        setError(null);
        try {
            const res = await fetch("/api/roblox/spoofer/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assetId,
                    assetName,
                    assetType,
                    targetType,
                    targetGroupId: groupId || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || m.spoofer.err_failed_upload || "Failed to auto-upload to Roblox.");
            }
            setUploadResult(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.");
        }
        finally {
            setUploading(false);
        }
    }
    function handleCopyNewId(newId) {
        navigator.clipboard.writeText(newId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        
        <header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60 relative overflow-hidden backdrop-blur-2xl bg-card/50">
          {nameplateVideoUrl ? (<video autoPlay loop muted playsInline className="discord-header-nameplate-bg" src={nameplateVideoUrl}/>) : nameplateUrl ? (<div aria-hidden="true" className="discord-header-nameplate-bg" style={{ backgroundImage: `url(${nameplateUrl})` }}/>) : null}

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DashboardMobileNavTrigger />
                <img alt={m.spoofer.cilaaa_community} width="32" height="32" className="h-7 w-7" src="/asset/image/logo/logo.png"/>
                <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                  
                  {m.spoofer.cilaaa_community}
                </span>
                <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
                  <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                  
                  {m.spoofer.console}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <LanguageSwitcher locale={locale}/>
                <button data-slot="dropdown-menu-trigger" data-variant="ghost" data-size="default" className="inline-flex items-center justify-center p-0.5 relative h-9 w-9 rounded-full border border-border/80 hover:border-primary/50 transition-colors cursor-pointer" type="button" aria-haspopup="menu" aria-expanded="false" data-action="account-menu">
                  <span data-slot="avatar" className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    {avatarUrl ? (<img src={avatarUrl} alt={userName} className="h-full w-full object-cover rounded-full" data-avatar-img="true"/>) : (<span className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center rounded-full text-xs font-mono">
                        {(userName || "U").slice(0, 1).toUpperCase()}
                      </span>)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
          
          <ModernDashboardSidebar currentRoute="spoofer" locale={locale} userName={userName} avatarUrl={avatarUrl} planLabel={userPlan?.name}/>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="space-y-6">
              
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <p className="font-mono text-[11px] tracking-widest text-primary uppercase">
                    
                    {m.spoofer.n04_roblox_asset_spoofer_reuploader}
                  </p>
                  <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {m.spoofer.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {m.spoofer.desc}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="liquid-badge rounded-xl border border-white/20 border-t-white/45 px-4 py-2.5 backdrop-blur-2xl shadow-[0_8px_25px_-5px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-default">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">
                      {m.spoofer.quota_downloads}
                    </p>
                    <p className="font-mono text-sm font-bold text-white mt-0.5">
                      {spooferQuotaText}
                    </p>
                  </div>
                  <div className="liquid-badge rounded-xl border border-white/20 border-t-white/45 px-4 py-2.5 backdrop-blur-2xl shadow-[0_8px_25px_-5px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-default">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">
                      {m.spoofer.quota_auto_uploads}
                    </p>
                    <p className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                      {autoUploadQuotaText}
                    </p>
                  </div>
                  <div className="liquid-badge-active rounded-xl border border-primary/50 border-t-white/65 px-4 py-2.5 backdrop-blur-2xl shadow-[0_8px_25px_-4px_rgba(255,0,126,0.35),inset_0_1px_2px_rgba(255,255,255,0.4),0_0_20px_rgba(255,0,126,0.2)] transition-all cursor-default">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-primary font-bold">
                      {m.spoofer.active_plan}
                    </p>
                    <p className="font-mono text-sm font-bold text-primary mt-0.5">
                      {userPlan?.label || "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="liquid-frame relative overflow-visible rounded-2xl border border-white/16 border-t-white/40 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25)] z-20">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <WindowDots />
                    <label className="block text-sm font-semibold tracking-wide text-foreground">
                      {m.spoofer.input_label}
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                    <div className="relative flex-1">
                      <input type="text" value={assetInput} onChange={(e) => setAssetInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInspect()} placeholder={m.spoofer.input_placeholder} className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 shadow-inner focus:border-primary/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-xl transition-all"/>
                      {assetInput && (<button type="button" onClick={() => setAssetInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer">
                          
                          {m.spoofer.text}
                        </button>)}
                    </div>

                    <button type="button" disabled={loading} onClick={() => handleInspect()} data-slot="button" data-variant="default" className="h-10 px-5 sm:px-6 rounded-xl font-heading text-xs sm:text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2 text-white bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-fuchsia-600/90 hover:from-rose-500 hover:via-pink-500 hover:to-fuchsia-600 border border-white/35 border-t-white/70 shadow-[0_8px_25px_-4px_rgba(255,0,126,0.55),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_12px_32px_0px_rgba(255,0,126,0.75),inset_0_1px_3px_rgba(255,255,255,0.85),0_0_20px_rgba(236,72,153,0.55)] backdrop-blur-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer whitespace-nowrap">
                      {loading ? (<>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          <span>{m.spoofer.btn_inspecting}</span>
                        </>) : (<>
                          <CustomIcon name="icon-search" size={16}/>
                          <span>{m.spoofer.btn_inspect}</span>
                        </>)}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" checked={autoUploadEnabled} onChange={(e) => setAutoUploadEnabled(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-primary/40 cursor-pointer"/>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {m.spoofer.auto_upload_toggle}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {m.spoofer.auto_upload_desc}
                        </p>
                      </div>
                    </label>

                    {autoUploadEnabled && (<div className="flex items-center gap-2">
                        <LiquidSelect value={targetType} onChange={(val) => setTargetType(val)} options={[
                { value: "user", label: m.spoofer.target_personal, icon: <CustomIcon name="icon-user-colored" size={15} alt="User"/> },
                { value: "group", label: m.spoofer.target_group, icon: <CustomIcon name="icon-group-colored" size={15} alt="Group"/> },
            ]} className="h-9 min-w-[140px]"/>
                        {targetType === "group" && (<input type="text" placeholder={m.spoofer.group_placeholder} value={groupId} onChange={(e) => setGroupId(e.target.value)} className="h-9 w-32 rounded-xl border border-white/20 border-t-white/40 bg-white/[0.06] hover:bg-white/[0.10] px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl shadow-inner focus:border-primary/60 focus:outline-none transition-all"/>)}
                      </div>)}
                  </div>
                </div>

                {error && (<div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-mono text-destructive">
                    
                    {m.spoofer.text_2} {error}
                  </div>)}
              </div>

              {result && (<div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/50 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.45)] space-y-5">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <WindowDots />
                      <span className="ml-1 flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-heading text-sm font-bold tracking-wide text-white uppercase">
                        {result.assetType} {m.spoofer.download_ready}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {m.spoofer.completed_in} {result.elapsedSeconds}{m.spoofer.s}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <CustomIcon name="icon-studio" size={20}/>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold text-white">
                          {result.fileName}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {result.fileSize ? `${result.fileSize} ${m.spoofer.text_3} ` : ""}
                          {result.fileExt.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <a href={result.downloadUrl} download={result.fileName} data-slot="button" data-variant="outline" className="h-10 px-5 rounded-xl surface-glass bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 border-t-white/50 text-white font-mono text-xs font-semibold inline-flex items-center gap-2 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] hover:shadow-[0_8px_25px_-2px_rgba(255,255,255,0.2),inset_0_1px_3px_rgba(255,255,255,0.5)] backdrop-blur-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer">
                      <CustomIcon name="icon-download" size={16}/>
                      <span>{m.spoofer.btn_download}</span>
                    </a>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                      <dt className="text-muted-foreground uppercase tracking-wider text-[10px]">{m.spoofer.meta_name}</dt>
                      <dd className="mt-2 font-semibold text-white truncate leading-relaxed">
                        <a href={result.libraryUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          <span>{result.assetName}</span>
                          <CustomIcon name="icon-external" size={11}/>
                        </a>
                      </dd>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                      <dt className="text-muted-foreground uppercase tracking-wider text-[10px]">{m.spoofer.meta_creator}</dt>
                      <dd className="mt-2 font-semibold text-white truncate leading-relaxed">
                        <a href={result.creatorProfileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          <span>{result.creatorName}</span>
                          <CustomIcon name="icon-external" size={11}/>
                        </a>
                      </dd>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                      <dt className="text-muted-foreground uppercase tracking-wider text-[10px]">{m.spoofer.meta_id}</dt>
                      <dd className="mt-2 font-semibold text-white tracking-wider break-all">{result.assetId}</dd>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                      <dt className="text-muted-foreground uppercase tracking-wider text-[10px]">{m.spoofer.meta_type}</dt>
                      <dd className="mt-2 font-semibold text-emerald-400 leading-relaxed">
                        {result.assetType}
                        {result.fileSize ? ` ${m.spoofer.text_4}${result.fileSize}${m.spoofer.text_5}` : ""}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs space-y-1.5 backdrop-blur-md">
                    <p className="font-semibold text-blue-300 font-heading inline-flex items-center gap-1.5">
                      <CustomIcon name="icon-studio" size={14}/>
                      <span>{m.spoofer.studio_title}</span>
                    </p>
                    <p className="text-blue-100/90 leading-relaxed font-sans">
                      {result.instructions}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                    <button type="button" disabled={uploading} onClick={() => handleUpload(result.assetId, result.assetName, result.assetType)} data-slot="button" className="min-h-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-600/90 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 font-heading text-xs font-bold uppercase tracking-wider text-white border border-white/30 border-t-white/70 shadow-[0_8px_25px_-4px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:shadow-[0_12px_32px_-2px_rgba(79,70,229,0.7),inset_0_1px_3px_rgba(255,255,255,0.85)] backdrop-blur-xl inline-flex items-center justify-center gap-2 text-center leading-tight disabled:opacity-50 transition-all duration-200 cursor-pointer active:scale-[0.98]">
                      {uploading ? (<>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          <span>{m.spoofer.btn_uploading}</span>
                        </>) : (<>
                          <CustomIcon name="icon-upload" size={16}/>
                          <span>{m.spoofer.btn_auto_upload}</span>
                        </>)}
                    </button>

                    <span className="text-[11px] text-muted-foreground font-mono">
                      {m.spoofer.engine_badge}
                    </span>
                  </div>

                  {uploadResult && (<div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 space-y-3 backdrop-blur-xl shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <CustomIcon name="icon-check" size={16}/>
                        <span>{uploadResult.message}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-xl bg-black/60 px-4 py-2 border border-emerald-500/30 font-mono text-base font-bold text-white tracking-widest shadow-inner">
                          {uploadResult.newAssetId}
                        </div>
                        <button type="button" onClick={() => handleCopyNewId(uploadResult.newAssetId)} data-slot="button" className="h-10 px-4 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-white font-bold font-mono text-xs border border-white/30 border-t-white/70 shadow-[0_6px_20px_rgba(16,185,129,0.4),inset_0_1px_2px_rgba(255,255,255,0.6)] backdrop-blur-xl inline-flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer">
                          {copied ? (<>
                              <CustomIcon name="icon-check" size={14}/>
                              <span>{m.spoofer.copied}</span>
                            </>) : (<>
                              <CustomIcon name="icon-copy" size={14}/>
                              <span>{m.spoofer.copy_id}</span>
                            </>)}
                        </button>
                        <a href={uploadResult.newAssetUrl} target="_blank" rel="noreferrer" data-slot="button" data-variant="outline" className="h-10 px-4 rounded-xl surface-glass bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 border-t-white/40 text-emerald-300 hover:text-emerald-200 font-mono text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm backdrop-blur-xl transition-all duration-200 active:scale-[0.98] cursor-pointer">
                          <span>{m.spoofer.open_in_roblox}</span>
                          <CustomIcon name="icon-external" size={12}/>
                        </a>
                      </div>

                      <p className="text-xs text-muted-foreground font-sans">
                        {uploadResult.instructions}
                      </p>
                    </div>)}
                </div>)}
            </div>
          </main>
        </div>
      </div>
    </div>);
}
