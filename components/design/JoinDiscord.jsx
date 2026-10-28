"use client";
import React, { useState } from "react";
import { getMessages } from "@/lib/messages";
import DiscordAvatar from "@/components/ui/DiscordAvatar";
import CustomIcon from "@/components/ui/CustomIcon";
export default function JoinDiscord({ locale = "en", userName = "Guest", avatarUrl, avatarDecorationUrl, status = "online", roleName, isMember = false, hasRole = false, }) {
    const m = getMessages(locale);
    const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/gwBdp3KgKM";
    const [state, setState] = useState("idle");
    const [feedback, setFeedback] = useState(null);
    const [verifiedRole, setVerifiedRole] = useState(roleName || null);
    const handleVerify = async () => {
        if (state === "checking" || state === "success")
            return;
        setState("checking");
        setFeedback(null);
        try {
            const response = await fetch("/api/discord/membership", {
                method: "GET",
                cache: "no-store",
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data) {
                setState("error");
                setFeedback(data?.error || (locale === "id" ? "Server otentikasi sedang sibuk. Silakan coba beberapa saat lagi." : "Authentication service is busy. Please try again shortly."));
                setTimeout(() => setState("idle"), 3500);
                return;
            }
            if (!data.isMember) {
                setState("not_member");
                setFeedback(`Discord account @${userName} has not joined the CILAAA COMMUNITY server yet. Please click "Join Discord Server" first.`);
                setTimeout(() => setState("idle"), 4500);
                return;
            }
            if (!data.hasRole) {
                setState("no_role");
                setFeedback("You are in the server, but don't have a registered role yet (e.g. MEMBER CILAAA, etc.). Please obtain a role in the Discord server first.");
                setTimeout(() => setState("idle"), 5500);
                return;
            }
            setState("success");
            setVerifiedRole(data.roleName || "Member");
            setFeedback("Verified! You have joined and hold a registered role. Redirecting to dashboard...");
            setTimeout(() => {
                window.location.assign(`/${locale}/dashboard`);
            }, 1300);
        }
        catch {
            setState("error");
            setFeedback("Network error while connecting to server. Please try again.");
            setTimeout(() => setState("idle"), 3500);
        }
    };
    return (<div className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center p-4 selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-primary/15 via-rose-500/10 to-transparent blur-3xl opacity-60"/>

      <div className="relative z-10 w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/75 backdrop-blur-2xl shadow-2xl transition-all duration-300">
          
          <div className="h-2 w-full bg-gradient-to-r from-primary via-rose-500 to-primary/80 animate-gradient-x"/>

          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"/>
                <img alt={m.joinDiscord.cilaaa_community} width="72" height="72" className="relative h-16 w-16 object-contain drop-shadow-[0_0_25px_rgba(255,45,120,0.4)]" src="/asset/image/logo/logo.png"/>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] tracking-widest text-primary uppercase">

                  {m.joinDiscord.membership_verification}
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">

                  {m.joinDiscord.cilaaa_community}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">

                  {m.joinDiscord.dashboard_access_is_exclusive_to_members}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-secondary/35 p-3.5 backdrop-blur-md flex items-center gap-3.5">
              <DiscordAvatar size="md" avatarUrl={avatarUrl} avatarDecorationUrl={avatarDecorationUrl} userName={userName} status={status} showStatus={true} ringClass="ring-1 ring-white/20"/>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted-foreground">{m.joinDiscord.logged_in_discord_account}</p>
                <p className="font-heading font-bold text-sm text-foreground truncate">

                  {m.joinDiscord.text}{userName}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {verifiedRole && verifiedRole !== "Not Member" && verifiedRole !== "Guest" ? (<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                    {verifiedRole}
                  </span>) : (<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"/>

                    {m.joinDiscord.unverified}
                  </span>)}
              </div>
            </div>

            {feedback && (<div className={`rounded-xl border p-3.5 text-xs leading-relaxed transition-all animate-in fade-in-50 duration-200 ${state === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : state === "not_member"
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : state === "no_role"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5">
                    {state === "success" ? (<CustomIcon name="icon-celebration" size={20} alt="Verified"/>) : state === "no_role" ? (<CustomIcon name="icon-warning-custom" size={20} alt="Warning"/>) : state === "not_member" ? (<CustomIcon name="icon-error-custom" size={20} alt="Error"/>) : (<CustomIcon name="icon-warning-custom" size={20} alt="Notice"/>)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {state === "success"
                ? m.joinDiscord.verified
                : state === "no_role"
                    ? m.joinDiscord.no_registered_role
                    : state === "not_member"
                        ? m.joinDiscord.not_in_server
                        : m.joinDiscord.notice}
                    </p>
                    <p>{feedback}</p>
                  </div>
                </div>
              </div>)}

            <div className="space-y-3 pt-1">
              
              <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center gap-2.5 w-full h-12 rounded-xl border border-white/15 bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 cursor-pointer">
                <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>{m.joinDiscord.n1_join_discord_server}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
              </a>

              <button type="button" onClick={handleVerify} disabled={state === "checking" || state === "success"} className={`relative flex items-center justify-center gap-2.5 w-full h-12 rounded-xl font-heading font-semibold text-sm transition-all duration-300 select-none overflow-hidden ${state === "checking"
            ? "border border-primary/50 bg-primary/20 text-primary cursor-wait shadow-inner"
            : state === "success"
                ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-default"
                : state === "not_member"
                    ? "border border-rose-500/50 bg-rose-500/20 text-rose-300"
                    : state === "no_role"
                        ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
                        : "border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] text-foreground hover:border-primary/50 shadow-md cursor-pointer hover:shadow-primary/20"}`}>
                
                {state === "checking" && (<span className="flex items-center gap-2.5">
                    <svg className="animate-spin h-4 w-4 text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>{m.joinDiscord.verifying_membership_role}</span>
                  </span>)}

                {state === "success" && (<span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 shrink-0">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    <span>{m.joinDiscord.verified_redirecting_to_dashboard}</span>
                  </span>)}

                {state === "not_member" && (<span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 shrink-0">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{m.joinDiscord.not_yet_in_server}</span>
                  </span>)}

                {state === "no_role" && (<span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>{m.joinDiscord.no_registered_role_found}</span>
                  </span>)}

                {state === "error" && (<span>{m.joinDiscord.check_failed_try_again}</span>)}

                {state === "idle" && (<span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span>{m.joinDiscord.n2_i_have_joined_check_status}</span>
                  </span>)}
              </button>
            </div>

            <p className="text-center font-mono text-[11px] text-muted-foreground/75 leading-relaxed pt-1">

              {m.joinDiscord.after_joining_discord_and_acquiring_a_ro}
            </p>
          </div>
        </div>
      </div>
    </div>);
}
