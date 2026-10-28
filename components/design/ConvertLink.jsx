import { getMessages } from "@/lib/messages";
import { localizedHref } from "@/lib/i18n";
import SoundSettings from "@/components/SoundSettings";
import RecentConversions from "@/components/RecentConversions";
import CustomIcon from "@/components/ui/CustomIcon";
import ConvertProgressButton from "@/components/dashboard/ConvertProgressButton";
import { WindowDots } from "@/components/ui/WindowDots";
import QuotaMeter, { formatQuotaLimit, formatQuotaRemaining } from "@/components/dashboard/QuotaMeter";
import { isLifetimeOrFullAccess } from "@/lib/discord-plan";
import ConvertLinkSource from "@/components/design/ConvertLinkSource";
import ConvertUploadSource from "@/components/design/ConvertUploadSource";
export default function ConvertLink({ locale, userName = "Guest", avatarUrl, nameplateUrl, nameplateVideoUrl, robloxAccount, plan, roleName, quota, }) {
    const m = getMessages(locale);
    const planLabel = plan?.label || "FREE";
    const quotaData = quota ?? {
        limit: plan?.dailyLimit ?? null,
        used: 0,
        remaining: plan?.dailyLimit ?? null,
    };
    const quotaLimit = formatQuotaLimit(quotaData.limit);
    const quotaRemaining = formatQuotaRemaining(quotaData.remaining);
    const showUpgrade = !isLifetimeOrFullAccess(plan, roleName);
    return (<main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"><div className="space-y-8">
              <div>
                <p className="font-mono text-[11px] tracking-widest text-primary">{" "}{m.convertLink.n01_convert}{" "}</p>
                <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  {" "}{m.convertLink.welcome}{" "}
                  <span className="text-muted-foreground">{m.convertLink.text}{" "}{userName}</span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{" "}{m.convertLink.upload_mp3_files_or_paste_youtube_soundc}{" "}</p>
              </div>
              <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60 py-0 gap-0">
                <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                  <WindowDots variant="solid"/>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{" "}{m.convertLink.cilaaa_convert}{" "}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground">
                    {" "}{planLabel}{" "}
                  </span>
                </div>
                <div data-slot="card-content" className="pt-6 pb-6 px-4 sm:px-6"><form className="space-y-6" data-action-form="convert">
                  {robloxAccount ? (<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-emerald-400">
                              
                              {m.convertLink.roblox_account_connected_auto_upload_act}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                              {robloxAccount.mode === "group" ? `GROUP #${robloxAccount.group_id}` : `USER #${robloxAccount.roblox_user_id}`}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            
                            {m.convertLink.converted_audio_will_be_directly_uploade}
                          </p>
                        </div>
                      </div>
                    </div>) : (<div className="rounded-xl border border-warning/30 bg-warning/5 p-4"><div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{" "}{m.convertLink.link_your_roblox_account_first}{" "}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{" "}{m.convertLink.conversions_upload_to_roblox_automatical}{" "}</p>
                        <a data-slot="button" data-variant="outline" data-size="sm" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 mt-3" href={localizedHref("/dashboard/account?tab=personal#roblox-section", locale)}>
                          <CustomIcon name="nav-roblox" size={16}/>
                          {" "}{m.convertLink.link_a_roblox_account}{" "}
                        </a>
                      </div>
                    </div></div>)}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2.5 border-border bg-muted/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                    <p className="flex items-baseline gap-1.5">
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{" "}{quotaRemaining}{" "}</span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{" "}{m.convertLink.text_2}{quotaLimit}{" "}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{" "}{m.convertLink.left_today}{" "}</span>
                    </p>
                    <QuotaMeter data={quotaData} ariaLabel={`${quotaRemaining}/${quotaLimit} ${m.convertLink.left_today}`}/>
                    {showUpgrade ? (<div className="ml-auto flex items-center gap-3"><button type="button" className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors border-border bg-secondary/60 text-muted-foreground hover:border-border hover:text-foreground" data-action="upgrade">
                      {" "}{m.convertLink.upgrade}{" "}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                      </svg>
                    </button></div>) : null}
                  </div>

                  <section className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                        <span className="absolute inset-0 rounded-full transition-colors bg-primary/20"></span>
                        <span className="h-1.5 w-1.5 rounded-full transition-colors bg-primary motion-safe:animate-pulse"></span>
                      </span>
                      <span className="font-mono text-[10px] tabular-nums transition-colors text-primary/70" aria-hidden="true">{" "}{m.convertLink.n01}{" "}</span>
                      <h3 className="font-mono text-[10px] uppercase tracking-widest transition-colors text-foreground">{" "}{m.convertLink.source}{" "}</h3>
                      <span data-anim="true" className="rail-track h-px flex-1 rail-flow" aria-hidden="true"></span>
                    </div>
                    <div dir="ltr" data-orientation="horizontal" data-slot="tabs" className="group/tabs flex gap-2 data-[orientation=horizontal]:flex-col">
                      <div role="tablist" aria-orientation="horizontal" data-slot="tabs-list" data-variant="default" className="rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col bg-muted grid w-full grid-cols-2" tabIndex={0} data-orientation="horizontal" style={{ outline: "none" }}>
                        <button type="button" role="tab" aria-selected="true" aria-controls="radix-_r_s_-content-link" data-state="active" id="radix-_r_s_-trigger-link" data-slot="tabs-trigger" className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-4 py-1.5 font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 cursor-pointer disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 gap-2.5 text-xs" tabIndex={-1} data-orientation="horizontal" data-action="convert-tab" data-mode="link">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music h-3.5 w-3.5 ml-2" aria-hidden="true">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                          </svg>
                          {" "}{m.convertLink.paste_a_link}{" "}
                        </button>
                        <button type="button" role="tab" aria-selected="false" aria-controls="radix-_r_s_-content-file" data-state="inactive" id="radix-_r_s_-trigger-file" data-slot="tabs-trigger" className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-4 py-1.5 font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 cursor-pointer disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 gap-2.5 text-xs" tabIndex={-1} data-orientation="horizontal" data-action="convert-tab" data-mode="upload">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload h-3.5 w-3.5 ml-2" aria-hidden="true">
                            <path d="M12 3v12"></path>
                            <path d="m17 8-5-5-5 5"></path>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          </svg>
                          {" "}{m.convertLink.upload_a_file}{" "}
                        </button>
                      </div>
                      <div data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-_r_s_-trigger-link" id="radix-_r_s_-content-link" tabIndex={0} data-slot="tabs-content" className="flex-1 outline-none mt-4 space-y-3">
                        <ConvertLinkSource locale={locale} messages={m.convertLink}/>
                      </div>
                      <div data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-_r_s_-trigger-file" hidden={true} id="radix-_r_s_-content-file" tabIndex={0} data-slot="tabs-content" className="flex-1 outline-none mt-4 space-y-3">
                        <ConvertUploadSource locale={locale} messages={m.convertUpload}/>
                      </div>
                    </div>
                  </section>
                  <SoundSettings locale={locale} locked={quotaData.remaining !== null && quotaData.remaining <= 0}/>
                  <section className="space-y-3"><div className="flex items-center gap-3">
                    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                      <span className="absolute inset-0 rounded-full transition-colors bg-muted-foreground/10"></span>
                      <span className="h-1.5 w-1.5 rounded-full transition-colors bg-muted-foreground/40"></span>
                    </span>
                    <span className="font-mono text-[10px] tabular-nums transition-colors text-muted-foreground/50" aria-hidden="true">{" "}{m.convertLink.n03}{" "}</span>
                    <h3 className="font-mono text-[10px] uppercase tracking-widest transition-colors text-muted-foreground">{" "}{m.convertLink.destination}{" "}</h3>
                    <span data-anim="true" className="rail-track h-px flex-1" aria-hidden="true"></span>
                  </div></section>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.convertLink.convert}{" "}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-3 w-3 shrink-0 text-muted-foreground/40" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                    <span className="inline-flex items-center rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.convertLink.upload}{" "}</span>
                  </div>
                  <div className="space-y-2">
                    <ConvertProgressButton label={m.convertLink.convert_audio} locale={locale}/>
                    <p className="text-center font-mono text-[11px] text-muted-foreground" aria-live="polite">{" "}{m.convertLink.paste_a_link_or_choose_a_file_to_continu}{" "}</p>
                  </div>
                </form></div>
              </div>
              <RecentConversions locale={locale}/>
            </div></main>);
}
