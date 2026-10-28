import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import DiscordAvatar from "@/components/ui/DiscordAvatar";
import CustomIcon from "@/components/ui/CustomIcon";
import { WindowDots } from "@/components/ui/WindowDots";
import ModernDashboardSidebar, { DashboardMobileNavTrigger } from "@/components/dashboard/ModernDashboardSidebar";
import { getMessages } from "@/lib/messages";
export default function AccountPersonal({ locale, userName = "Guest", globalName, status = "online", avatarUrl, avatarDecorationUrl, nameplateUrl, nameplateVideoUrl, nameplateLabel, profileEffectUrl, profileEffectVideoUrl, bannerUrl, bannerColor, accentColor, clanTag, clanBadge, bio, roleName, roleColor, plan, robloxAccount, initialTab = "personal", }) {
    const m = getMessages(locale);
    const displayName = globalName || userName;
    const isPaidOrLifetime = plan && plan.name !== "free";
    const quotaDisplay = plan?.dailyLimit === null ? "Unlimited ∞" : `${plan?.dailyLimit ?? 2} / 24 Hours`;
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60 relative overflow-hidden">
          {nameplateVideoUrl ? (<video autoPlay loop muted playsInline className="discord-header-nameplate-bg" src={nameplateVideoUrl}/>) : nameplateUrl ? (<div aria-hidden="true" className="discord-header-nameplate-bg" style={{ backgroundImage: `url(${nameplateUrl})` }}/>) : null}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8"><div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DashboardMobileNavTrigger />
              <img alt={m.accountPersonal.cilaaa_community} width="32" height="32" decoding="async" data-nimg="1" className="h-7 w-7" srcSet="/asset/image/logo/logo.png 1x, /asset/image/logo/logo.png 2x" src="/asset/image/logo/logo.png" style={{ color: "transparent" }}/>
              <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">{" "}{m.accountPersonal.cilaaa_community}{" "}</span>
              <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
                <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                {" "}{m.accountPersonal.console}{" "}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher locale={locale}/>
              <button data-slot="dropdown-menu-trigger" data-variant="ghost" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 px-4 py-2 has-[>svg]:px-3 relative h-9 w-9 rounded-full" type="button" id="radix-_r_39_" aria-haspopup="menu" aria-expanded="false" data-state="closed" data-action="account-menu"><span data-slot="avatar" data-size="default" className="group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6 h-9 w-9 border border-border">{avatarUrl ? <img src={avatarUrl} alt={userName} className="h-full w-full object-cover rounded-full" data-avatar-img="true"/> : <span data-slot="avatar-fallback" className="bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs">{(userName || "U").slice(0, 1).toUpperCase()}</span>}</span></button>
            </div>
          </div></div></header>
        <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
          <ModernDashboardSidebar currentRoute="account" locale={locale} userName={userName} avatarUrl={avatarUrl} planLabel={plan?.name || undefined}/>
          <div className="min-w-0 flex-1">
            <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"><div className="space-y-8">
              <div className="spotlight space-y-8" style={{ "--sx": "938px", "--sy": "67px", "--spot-opacity": "0" }}>
                <div className="reveal" style={{ "--reveal-order": "0" }}>
                  <p className="font-mono text-[11px] tracking-widest text-primary">{" "}{m.accountPersonal.n05_account}{" "}</p>
                  <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{" "}{m.accountPersonal.accounts_plan}{" "}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{" "}{m.accountPersonal.link_your_creator_account_and_manage_you}{" "}</p>
                </div>
                <div className="beam shadow-raised reveal relative overflow-visible mt-8 sm:mt-12" style={{ "--reveal-order": "1" }}>
                  
                  {profileEffectVideoUrl ? (<div className="discord-profile-effect-container absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-[540px] pointer-events-none z-30 select-none">
                      <video autoPlay loop muted playsInline className="discord-profile-effect-video w-full h-auto object-contain mx-auto" src={profileEffectVideoUrl}/>
                    </div>) : profileEffectUrl ? (<div className="discord-profile-effect-container absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-[540px] pointer-events-none z-30 select-none">
                      <img src={profileEffectUrl} alt={m.accountPersonal.discord_profile_effect} className="discord-profile-effect-monster w-full h-auto object-contain mx-auto"/>
                    </div>) : null}

                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl transition-all duration-300">
                    
                    {bannerUrl ? (<div className="discord-profile-banner" style={{ backgroundImage: `url(${bannerUrl})` }}/>) : bannerColor ? (<div className="discord-profile-banner" style={{ background: `linear-gradient(to bottom, ${bannerColor}66, transparent)` }}/>) : null}

                    <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_0%,black,transparent)]"></div>
                    <div className="relative flex flex-col gap-6 p-5 sm:p-7">
                      <div className="flex flex-wrap items-start gap-5">
                        
                        <DiscordAvatar size="lg" avatarUrl={avatarUrl} avatarDecorationUrl={avatarDecorationUrl} userName={userName} showStatus={true} status={status || "online"} ringClass="ring-2 ring-white/20"/>
                        <div className="min-w-0 flex-1 space-y-2">
                          
                          <div className="flex items-center gap-2">
                            <h2 className="text-platinum truncate font-heading text-2xl font-bold tracking-tight sm:text-3xl leading-none">
                              {displayName}
                            </h2>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {userName && (<span className="font-mono text-xs sm:text-sm text-muted-foreground/80 font-medium">
                                
                                {m.accountPersonal.text}{userName}
                              </span>)}
                            {clanTag && (<span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.08] px-2 py-0.5 font-sans text-xs font-semibold tracking-wide text-white/95 shadow-sm backdrop-blur-md" title={m.accountPersonal.discord_server_clan_tag}>
                                {clanBadge ? (<img src={clanBadge} alt={m.accountPersonal.text_2} className="h-3.5 w-3.5 object-contain"/>) : (<CustomIcon name="icon-flame" size={14} className="h-3.5 w-3.5" alt="Flame"/>)}
                                <span>{clanTag}</span>
                              </span>)}
                          </div>

                          {bio && bio.trim().length > 0 && (<div className="discord-nameplate-badge-card my-1.5 p-2 sm:p-2.5 px-3 flex items-center gap-2.5 group max-w-lg relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0e15]/85 backdrop-blur-md shadow-md">
                              {nameplateVideoUrl ? (<video autoPlay loop muted playsInline className="discord-nameplate-badge-video" src={nameplateVideoUrl}/>) : nameplateUrl ? (<div className="absolute inset-0 h-full w-full bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${nameplateUrl})` }}/>) : null}
                              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b12]/95 via-[#0a0b12]/75 to-transparent pointer-events-none"/>
                              <div className="relative z-10 flex items-center gap-2 min-w-0">
                                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse"/>
                                <p className="text-xs text-white/90 leading-snug drop-shadow-sm font-normal">
                                  {bio.trim()}
                                </p>
                              </div>
                            </div>)}

                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            
                            {roleName && roleName !== "Not Member" && roleName !== "Guest" && (<span className="discord-role-pill inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wider" style={roleColor ? { borderColor: `${roleColor}55`, color: roleColor, backgroundColor: `${roleColor}18` } : undefined} title={m.accountPersonal.server_discord_role}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: roleColor || "#ffffff" }}/>
                                <span>{roleName}</span>
                              </span>)}

                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide border-success/20 bg-success/10 text-success">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3 shrink-0" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                              <span className="text-muted-foreground">{" "}{m.accountPersonal.discord_account}{" "}</span>
                              <span className="text-success font-medium">{userName}</span>
                            </span>

                            {robloxAccount ? (<span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide border-success/30 bg-success/15 text-success shadow-[0_0_12px_rgba(34,197,94,0.15)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3 shrink-0" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                                <span className="text-muted-foreground">{" "}{m.accountPersonal.roblox_account}{" "}</span>
                                <span className="text-success font-semibold">
                                  {robloxAccount.mode === "group" ? `Group #${robloxAccount.group_id}` : `ID #${robloxAccount.roblox_user_id}`}
                                </span>
                              </span>) : (<span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide border-border bg-secondary/60 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music h-3 w-3 shrink-0" aria-hidden="true">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                                <span className="text-muted-foreground">{" "}{m.accountPersonal.roblox_account}{" "}</span>
                                <span className="text-foreground">{m.accountPersonal.not_linked}</span>
                              </span>)}
                          </div>
                        </div>

                        <div className="w-full shrink-0 rounded-2xl border border-white/15 bg-background/80 p-5 backdrop-blur-xl sm:w-auto sm:min-w-[210px] shadow-lg">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              {" "}{m.accountPersonal.plan}{" "}
                            </p>
                            {isPaidOrLifetime && (<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                                {" "}{m.accountPersonal.active}{" "}
                              </span>)}
                          </div>
                          <p className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-foreground">
                            {plan?.label || "Free"}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                            {plan?.period || "FOREVER"}
                          </p>

                          {isPaidOrLifetime ? (<div className="mt-3.5 space-y-1.5">
                              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[11px] font-medium text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                  <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>{m.accountPersonal.full_access_active}</span>
                              </div>
                            </div>) : (<button type="button" className="group mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-sm" data-action="upgrade">
                              {" "}{m.accountPersonal.upgrade}{" "}
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                              </svg>
                            </button>)}
                        </div>
                      </div>

                      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
                        <div className="bg-card/60 px-4 py-4 sm:px-5">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.total_conversions}{" "}</p>
                          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight sm:text-3xl">{" "}{m.accountPersonal.n0}{" "}</p>
                        </div>
                        <div className="bg-card/60 px-4 py-4 sm:px-5">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.this_month}{" "}</p>
                          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight sm:text-3xl">{" "}{m.accountPersonal.n0}{" "}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <div className="bg-card/60 px-4 py-4 sm:px-5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              {" "}{m.accountPersonal.n24_hour_quota}{" "}
                            </p>
                            <p className={`mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight ${isPaidOrLifetime ? "text-emerald-400" : "text-foreground"}`}>
                              {quotaDisplay}
                            </p>
                          </div>
                        </div>
                      </dl>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-white/10 bg-secondary/40 p-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.accountPersonal.speed_control}</p>
                          <p className="font-medium text-foreground">
                            {plan?.speedControl ? m.accountPersonal.unlocked_custom : m.accountPersonal.locked_at_2_3x}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.accountPersonal.batch_convert}</p>
                          <p className="font-medium text-foreground">
                            {plan?.maxBatch && plan.maxBatch > 1 ? `Up to ${plan.maxBatch} songs` : m.accountPersonal.n1_song_at_a_time}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.accountPersonal.spoofer_quota}</p>
                          <p className="font-medium text-foreground">
                            {plan?.spooferLimit === null || plan?.spooferLimit === undefined
            ? m.accountPersonal.unlimited
            : `${plan.spooferLimit} / 24h`}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.accountPersonal.priority}</p>
                          <p className={`font-medium ${plan?.prioritySupport ? "text-emerald-400" : "text-foreground"}`}>
                            {plan?.prioritySupport ? m.accountPersonal.priority_support : m.accountPersonal.standard}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="roblox-section" className="reveal scroll-mt-24" style={{ "--reveal-order": "2" }}><div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full gap-0 overflow-hidden border-border/60 py-0">
                <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                  <WindowDots variant="solid"/>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{" "}{m.accountPersonal.cilaaa_roblox_account}{" "}</span>
                  <a href="https://create.roblox.com/dashboard/credentials" rel="noopener noreferrer" className="group ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                    {" "}{m.accountPersonal.create_api_key_on_roblox_creator_hub}{" "}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link h-3 w-3" aria-hidden="true">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </a>
                </div>
                <div data-slot="card-content" className="space-y-6 px-4 py-6 sm:px-6">
                  <p className="text-sm text-muted-foreground">{" "}{m.accountPersonal.follow_the_steps_below_to_create_an_api_}{" "}</p>
                  <div dir="ltr" data-orientation="horizontal" data-slot="tabs" className="group/tabs flex gap-2 data-[orientation=horizontal]:flex-col w-full">
                    <div role="tablist" aria-orientation="horizontal" data-slot="tabs-list" data-variant="default" className="rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col bg-muted grid w-full grid-cols-2" tabIndex={0} data-orientation="horizontal" style={{ outline: "none" }}>
                      <button type="button" role="tab" aria-selected={initialTab !== "group"} data-state={initialTab !== "group" ? m.accountPersonal.active_2 : m.accountPersonal.inactive} id="account-tab-trigger-personal" data-slot="tabs-trigger" className={`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 cursor-pointer min-w-0 gap-1.5 font-mono text-[10px] uppercase tracking-normal sm:gap-2 sm:text-xs sm:tracking-wider ${initialTab !== "group"
            ? "bg-background text-foreground shadow-sm"
            : "text-foreground/60 hover:text-foreground"}`} tabIndex={initialTab !== "group" ? 0 : -1} data-orientation="horizontal" data-action="account-tab" data-tab="personal">
                        <CustomIcon name="icon-user" size={14}/>
                        <span className="min-w-0 truncate">
                          <span className="sm:hidden">{m.accountPersonal.personal}</span>
                          <span className="hidden sm:inline">{" "}{m.accountPersonal.personal_account}{" "}</span>
                        </span>
                      </button>
                      <button type="button" role="tab" aria-selected={initialTab === "group"} data-state={initialTab === "group" ? m.accountPersonal.active_2 : m.accountPersonal.inactive} id="account-tab-trigger-group" data-slot="tabs-trigger" className={`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 cursor-pointer min-w-0 gap-1.5 font-mono text-[10px] uppercase tracking-normal sm:gap-2 sm:text-xs sm:tracking-wider ${initialTab === "group"
            ? "bg-background text-foreground shadow-sm"
            : "text-foreground/60 hover:text-foreground"}`} tabIndex={initialTab === "group" ? 0 : -1} data-orientation="horizontal" data-action="account-tab" data-tab="group">
                        <CustomIcon name="icon-group" size={14}/>
                        <span className="min-w-0 truncate">
                          <span className="sm:hidden">{m.accountPersonal.group}</span>
                          <span className="hidden sm:inline">{" "}{m.accountPersonal.group_account}{" "}</span>
                        </span>
                      </button>
                    </div>

                    <div data-state={initialTab !== "group" ? m.accountPersonal.active_2 : m.accountPersonal.inactive} data-orientation="horizontal" role="tabpanel" aria-labelledby="account-tab-trigger-personal" id="roblox-content-personal" tabIndex={0} data-slot="tabs-content" className="flex-1 outline-none space-y-6 mt-6" hidden={initialTab === "group"} style={{ display: initialTab === "group" ? "none" : "block" }}>
                      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert h-4 w-4 shrink-0 text-warning" aria-hidden="true">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                            <path d="M12 9v4"></path>
                            <path d="M12 17h.01"></path>
                          </svg>
                          <h3 className="text-sm font-semibold text-foreground">{" "}{m.accountPersonal.send_to_map_needs_one_extra_permission}{" "}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{" "}{m.accountPersonal.audio_uploaded_through_open_cloud_is_pri}{" "}</p>
                        <code className="inline-block rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-xs text-foreground">{" "}{m.accountPersonal.asset_permissions_write}{" "}</code>
                      </div>
                      <details className="group/tut rounded-xl border border-border/60 bg-muted/20">
                        <summary className="flex cursor-pointer list-none items-center gap-2 p-4">
                          <CustomIcon name="icon-support" size={16}/>
                          <h3 className="text-sm font-semibold text-foreground">{" "}{m.accountPersonal.how_to_get_your_api_key}{" "}</h3>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/tut:rotate-180" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                        </summary>
                        <ol className="space-y-2 border-t border-border/60 p-4 text-sm text-foreground/90">
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n01}{" "}</span>
                            <span>{" "}{m.accountPersonal.open_creator_hub_open_cloud_api_keys_and}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n02}{" "}</span>
                            <span>{" "}{m.accountPersonal.set_a_name_for_your_api_key_e_g_cilaaa_c}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n03}{" "}</span>
                            <span>{" "}{m.accountPersonal.under_access_permissions_add_the_assets_}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n04}{" "}</span>
                            <span className="text-warning">{" "}{m.accountPersonal.add_asset_permissions_write_to_the_same_}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n05}{" "}</span>
                            <span>{" "}{m.accountPersonal.click_save_generate_key_button}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n06}{" "}</span>
                            <span>{" "}{m.accountPersonal.copy_the_generated_api_key_roblox_will_n}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{" "}{m.accountPersonal.n07}{" "}</span>
                            <span>{" "}{m.accountPersonal.paste_the_api_key_into_the_form_below_an}{" "}</span>
                          </li>
                        </ol>
                      </details>
                      <form className="space-y-5" data-action-form="roblox-connect" data-account-mode="personal">
                        <div className="space-y-2">
                          <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.roblox_user_id}{" "}</label>
                          <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11 rounded-xl" inputMode="numeric" pattern="[0-9]*" placeholder={m.accountPersonal.n9217554647} required={true} type="text" defaultValue={robloxAccount?.mode === "personal" ? (robloxAccount.roblox_user_id || "") : ""}/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.example_9217554647}{" "}</p>
                        </div>
                        <div className="space-y-2">
                          <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.api_key}{" "}</label>
                          <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11 rounded-xl font-mono text-xs" placeholder={robloxAccount ? m.accountPersonal.saved_key_enter_new_to_replace : m.accountPersonal.paste_roblox_api_key_here} autoComplete="new-password" type="password" defaultValue=""/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.leave_empty_if_you_don_t_want_to_change_}{" "}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
                          <CustomIcon name="icon-lock" size={16}/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.your_api_key_is_encrypted_and_stored_sec}{" "}</p>
                        </div>
                        <button data-slot="button" data-variant="default" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 has-[>svg]:px-3 rounded-xl w-full" type="submit" data-action="save-roblox-account">{" "}{m.accountPersonal.save}{" "}</button>
                      </form>
                    </div>

                    <div data-state={initialTab === "group" ? m.accountPersonal.active_2 : m.accountPersonal.inactive} data-orientation="horizontal" role="tabpanel" aria-labelledby="account-tab-trigger-group" id="roblox-content-group" tabIndex={0} data-slot="tabs-content" className="flex-1 outline-none space-y-6 mt-6" hidden={initialTab !== "group"} style={{ display: initialTab === "group" ? "block" : "none" }}>
                      <div className="rounded-xl border border-border/60 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CustomIcon name="icon-support" size={16}/>
                          <h3 className="text-sm font-semibold text-foreground">{" "}{m.accountPersonal.group_account_tutorial}{" "}</h3>
                        </div>
                        <ol className="space-y-2 text-sm text-foreground/90 marker:font-mono marker:text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="font-semibold shrink-0">{m.accountPersonal.n1}</span>
                            <span>{" "}{m.accountPersonal.go_to_your_group_settings_on_roblox}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold shrink-0">{m.accountPersonal.n2}</span>
                            <span>{" "}{m.accountPersonal.navigate_to_creator_dashboard_credential}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold shrink-0">{m.accountPersonal.n3}</span>
                            <span>{" "}{m.accountPersonal.create_an_api_key_with_read_and_write_pe}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold shrink-0">{m.accountPersonal.n4}</span>
                            <span>{" "}{m.accountPersonal.copy_your_user_id_and_group_id}{" "}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold shrink-0">{m.accountPersonal.n5}</span>
                            <span>{" "}{m.accountPersonal.paste_the_api_key_and_ids_below}{" "}</span>
                          </li>
                        </ol>
                      </div>
                      <form className="space-y-5" data-action-form="roblox-connect" data-account-mode="group">
                        <div className="space-y-2">
                          <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.group_id}{" "}</label>
                          <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11 rounded-xl" inputMode="numeric" pattern="[0-9]*" placeholder={m.accountPersonal.e_g_12345678} required={true} type="text" defaultValue={robloxAccount?.mode === "group" ? (robloxAccount.group_id || "") : ""}/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.find_this_in_your_group_url_or_settings}{" "}</p>
                        </div>
                        <div className="space-y-2">
                          <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.your_roblox_user_id_creator}{" "}</label>
                          <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11 rounded-xl" inputMode="numeric" pattern="[0-9]*" placeholder={m.accountPersonal.n9217554647} required={true} type="text" defaultValue={robloxAccount?.mode === "group" ? (robloxAccount.roblox_user_id || "") : ""}/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.the_user_id_of_the_account_managing_this}{" "}</p>
                        </div>
                        <div className="space-y-2">
                          <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.accountPersonal.group_api_key}{" "}</label>
                          <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11 rounded-xl font-mono text-xs" placeholder={robloxAccount ? m.accountPersonal.saved_key_enter_new_to_replace : m.accountPersonal.paste_your_group_api_key_here} autoComplete="new-password" type="password" defaultValue=""/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.api_key_with_assets_write_permission_for}{" "}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
                          <CustomIcon name="icon-lock" size={16}/>
                          <p className="text-xs text-muted-foreground">{" "}{m.accountPersonal.your_api_key_is_encrypted_and_stored_sec}{" "}</p>
                        </div>
                        <button data-slot="button" data-variant="default" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 has-[>svg]:px-3 rounded-xl w-full" type="submit" data-action="save-roblox-account">{" "}{m.accountPersonal.link_group_account}{" "}</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div></div>
            </div></main>
          </div>
        </div>
      </div>
    </div>);
}
