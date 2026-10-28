import { getMessages } from "@/lib/messages";
import ShinyText from "@/components/ui/ShinyText";
import Faq5 from "@/components/ui/Faq5";
import PlanComparisonTable from "@/components/design/PlanComparisonTable";
import { requestTab } from "@/lib/tab-nav";
export default function Home({ locale, userName = "Guest", avatarUrl, roleName, }) {
    const m = getMessages(locale);
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
      <div className="flex min-h-screen flex-col">
        <div className="spotlight" style={{ "--sx": "1487px", "--sy": "117px", "--spot-opacity": "0" }}><section className="relative -mt-[4.5rem] overflow-hidden pt-[4.5rem]">
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div className="hero-grid absolute inset-0"></div>
            <div className="aurora-a absolute -top-[20%] left-1/2 h-[70vh] w-[80vw] -translate-x-[60%] will-change-transform"></div>
            <div className="aurora-b absolute top-[5%] left-1/2 h-[60vh] w-[70vw] -translate-x-[30%] will-change-transform"></div>
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 pb-20 pt-20 text-center sm:pt-28 lg:pb-28">
            <div className="flex flex-col items-center text-center w-full">
              <div className="motion-safe:animate-fade-up edge-light inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1">
                <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                <span className="font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n1_roblox_audio_pipeline}{" "}</span>
              </div>

              <h1 className="motion-safe:animate-fade-up hero-title hero-display-font mt-5 max-w-4xl text-4xl sm:text-6xl md:text-7xl font-black tracking-tight [animation-delay:80ms] flex flex-col items-center">
                <span className="block">
                  <ShinyText text="From Audio to Assets" color="#b5b5b5" shineColor="#ffffff" speed={2.2} shineWidth={45} softness={0.8} glow={0.5} trigger="loop" className="hero-display-font font-black tracking-tight"/>
                </span>
                <span className="block mt-2 sm:mt-3">
                  <ShinyText text="Ready for Your Workflow." color="#b5b5b5" shineColor="#ffffff" speed={2.2} shineWidth={45} softness={0.8} glow={0.5} trigger="loop" className="hero-display-font font-black tracking-tight"/>
                </span>
              </h1>

              <p className="motion-safe:animate-fade-up mx-auto mt-6 max-w-xl text-center text-lg text-muted-foreground [animation-delay:160ms]" style={{ marginLeft: "auto", marginRight: "auto" }}>{" "}{m.home.convert_audio_from_youtube_or_soundcloud}{" "}</p>
              <div className="motion-safe:animate-fade-up mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:240ms]">
                <form data-action-form="auth"><button data-slot="button" data-variant="default" data-size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-10 has-[>svg]:px-4 group rounded-full px-8" type="submit">
                  {" "}{m.home.browse_uploading}{" "}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button></form>
                <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} rel="noopener noreferrer" data-slot="button" data-variant="outline" data-size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 has-[>svg]:px-4 rounded-full px-8">{" "}{m.home.join_discord}{" "}</a>
              </div>
            </div>
          </div>
        </section></div>
        <div className="marquee border-y border-border/60 py-4" aria-hidden="true"><div className="marquee-track">
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.youtube}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.soundcloud}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.mp3}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.wav}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.flac}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.m4a}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.ogg}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.opus}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.open_cloud_api}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.roblox}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.audio_studio}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.auto_split}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.qris_payment}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.youtube}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.soundcloud}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.mp3}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.wav}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.flac}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.m4a}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.ogg}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.opus}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.open_cloud_api}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.roblox}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.audio_studio}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.auto_split}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
          <span className="flex items-center gap-12 font-mono text-xs tracking-widest text-muted-foreground">
            {" "}{m.home.qris_payment}{" "}
            <span className="text-primary">{m.home.text}</span>
          </span>
        </div></div>
        <section id="pipeline" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 sm:py-28">
          <p className="font-mono text-xs tracking-widest text-primary">{" "}{m.home.n01_pipeline}{" "}</p>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="max-w-lg text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{" "}{m.home.one_link_in_four_steps_playing_in_game}{" "}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{" "}{m.home.every_stage_runs_on_our_servers_you_past}{" "}</p>
          </div>
          <div className="mt-14"><ol className="grid gap-x-4 gap-y-8 md:grid-cols-4">
            <li className="reveal relative" style={{ "--reveal-order": "0" }}>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary/20"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                </span>
                <span data-anim="true" className="rail-track h-px flex-1 rail-flow" style={{ "--flow-order": "0" }}></span>
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n01}{" "}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 lucide-link-2 h-4 w-4 shrink-0 text-primary" aria-hidden="true">
                  <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                  <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                </svg>
                <h3 className="font-heading text-base font-semibold tracking-tight">{" "}{m.home.paste_or_drop}{" "}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.a_youtube_or_soundcloud_link_or_drag_an_}{" "}</p>
            </li>
            <li className="reveal relative" style={{ "--reveal-order": "1" }}>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary/20"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                </span>
                <span data-anim="true" className="rail-track h-px flex-1 rail-flow" style={{ "--flow-order": "1" }}></span>
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n02}{" "}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal h-4 w-4 shrink-0 text-primary" aria-hidden="true">
                  <path d="M10 5H3"></path>
                  <path d="M12 19H3"></path>
                  <path d="M14 3v4"></path>
                  <path d="M16 17v4"></path>
                  <path d="M21 12h-9"></path>
                  <path d="M21 19h-5"></path>
                  <path d="M21 5h-7"></path>
                  <path d="M8 10v4"></path>
                  <path d="M8 12H3"></path>
                </svg>
                <h3 className="font-heading text-base font-semibold tracking-tight">{" "}{m.home.process}{" "}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.pick_a_speed_preset_amplification_is_der}{" "}</p>
            </li>
            <li className="reveal relative" style={{ "--reveal-order": "2" }}>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary/20"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                </span>
                <span data-anim="true" className="rail-track h-px flex-1 rail-flow" style={{ "--flow-order": "2" }}></span>
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n03}{" "}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload h-4 w-4 shrink-0 text-primary" aria-hidden="true">
                  <path d="M12 13v8"></path>
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                  <path d="m8 17 4-4 4 4"></path>
                </svg>
                <h3 className="font-heading text-base font-semibold tracking-tight">{" "}{m.home.upload}{" "}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.sent_to_your_roblox_creator_account_over}{" "}</p>
            </li>
            <li className="reveal relative" style={{ "--reveal-order": "3" }}>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-success/20"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                </span>
                <span data-anim="true" className="rail-track h-px flex-1" style={{ "--flow-order": "3" }}></span>
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n04}{" "}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-radio h-4 w-4 shrink-0 text-success" aria-hidden="true">
                  <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                  <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                  <circle cx="12" cy="12" r="2"></circle>
                  <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                  <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
                </svg>
                <h3 className="font-heading text-base font-semibold tracking-tight">{" "}{m.home.ready_to_play}{" "}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.your_official_roblox_asset_id_is_instant}{" "}</p>
            </li>
          </ol></div>
        </section>
        <div className="spotlight" style={{ "--sx": "1528px", "--sy": "209px", "--spot-opacity": "0" }}><section id="features" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-20 sm:pb-28">
          <p className="font-mono text-xs tracking-widest text-primary">{" "}{m.home.n02_the_complete_audio_pipeline}{" "}</p>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="max-w-lg text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{" "}{m.home.the_complete_audio_pipeline}{" "}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{" "}{m.home.six_things_that_used_to_be_manual_none_o}{" "}</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="tile reveal flex flex-col p-7 md:col-span-2 md:p-9" style={{ "--reveal-order": "0" }}>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest border-primary/30 bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload h-3 w-3 shrink-0" aria-hidden="true"><path d="M12 13v8"></path><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="m8 17 4-4 4 4"></path></svg>
                {" "}{m.home.roblox_open_cloud}{" "}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{" "}{m.home.official_asset_id_straight_to_your_accou}{" "}</h3>
              <p className="mt-3 max-w-lg text-muted-foreground">{" "}{m.home.converted_songs_are_uploaded_directly_to}{" "}</p>
              <div className="mt-8 flex flex-1 flex-col"><div className="flex flex-1 flex-col gap-3" aria-hidden="true">
                <div className="flex flex-1 flex-col items-stretch gap-3 lg:flex-row">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.source}{" "}</p>
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-background/60 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music4 lucide-music-4 h-4 w-4 text-primary" aria-hidden="true">
                        <path d="M9 18V5l12-2v13"></path>
                        <path d="m9 9 12-2"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{" "}{m.home.ghost_town}{" "}</p>
                          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.n3_parts}{" "}</span>
                        </div>
                        <p className="break-all font-mono text-[11px] text-muted-foreground">{" "}{m.home.rbxassetid_9021837465}{" "}</p>
                      </div>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right mx-auto h-4 w-4 shrink-0 rotate-90 self-center text-muted-foreground lg:mt-5 lg:rotate-0" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.destination}{" "}</p>
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2 lucide-gamepad-2 h-4 w-4 text-primary" aria-hidden="true">
                        <line x1="6" x2="10" y1="11" y2="11"></line>
                        <line x1="8" x2="8" y1="9" y2="13"></line>
                        <line x1="15" x2="15.01" y1="12" y2="12"></line>
                        <line x1="18" x2="18.01" y1="10" y2="10"></line>
                        <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                      </svg></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{" "}{m.home.senna_party}{" "}</p>
                        <p className="font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.lofi_drive}{" "}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key-round h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true">
                    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                  </svg>
                  <span className="font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.grant}{" "}</span>
                  <span className="ml-auto font-mono text-[11px] text-foreground">{" "}{m.home.universe_7412093}{" "}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/[0.06] px-4 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  <span className="text-xs font-medium text-success">{" "}{m.home.added_to_your_roblox_account}{" "}</span>
                </div>
              </div></div>
              <p className="flex items-start gap-2 pt-6 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                {" "}{m.home.still_awaiting_moderation_queue_it_we_se}{" "}
              </p>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {" "}{m.home.every_uploaded_audio_asset_belongs_to_yo}{" "}
                  <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} rel="noopener noreferrer" className="whitespace-nowrap font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary">{" "}{m.home.ask_in_discord}{" "}</a>
                </p>
              </div>
            </div>
            <div className="tile reveal flex flex-col p-7" style={{ "--reveal-order": "1" }}>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest border-border bg-secondary/60 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc3 lucide-disc-3 h-3 w-3 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path><circle cx="12" cy="12" r="2"></circle><path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path></svg>
                {" "}{m.home.history}{" "}
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{" "}{m.home.every_conversion_in_one_place}{" "}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.track_every_conversion_with_its_live_sta}{" "}</p>
              <div className="mt-5"><div aria-hidden="true">
                <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                  <span className="font-mono text-[11px] text-muted-foreground">{" "}{m.home.lofi}{" "}</span>
                  <span className="cursor-blink text-primary">{m.home.text_2}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-white/[0.14] to-white/[0.02]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc3 lucide-disc-3 h-5 w-5 text-muted-foreground/60" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg></div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-medium">{" "}{m.home.lofi_mix_wav}{" "}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{" "}{m.home.n3_12}{" "}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-white/[0.10] to-white/[0.03]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc3 lucide-disc-3 h-5 w-5 text-muted-foreground/60" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg></div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-medium">{" "}{m.home.night_ops_wav}{" "}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{" "}{m.home.n2_48}{" "}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-white/[0.07] to-white/[0.02]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc3 lucide-disc-3 h-5 w-5 text-muted-foreground/60" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg></div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-medium">{" "}{m.home.arcade_theme_wav}{" "}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{" "}{m.home.n1_35}{" "}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-white/[0.12] to-white/[0.01]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc3 lucide-disc-3 h-5 w-5 text-muted-foreground/60" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                      <circle cx="12" cy="12" r="2"></circle>
                      <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg></div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-medium">{" "}{m.home.chill_set_wav}{" "}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{" "}{m.home.n4_21}{" "}</p>
                    </div>
                  </div>
                </div>
              </div></div>
              <p className="mt-auto pt-5 text-xs leading-relaxed text-muted-foreground">{" "}{m.home.every_upload_lands_in_your_roblox_accoun}{" "}</p>
            </div>
            <div className="tile reveal flex flex-col p-7" style={{ "--reveal-order": "2" }}>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest border-primary/30 bg-primary/10 text-primary">{" "}{m.home.n30_days}{" "}</span>
              <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{" "}{m.home.five_at_once}{" "}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.queue_up_to_five_songs_in_a_single_submi}{" "}</p>
              <div className="mt-5 flex flex-1 flex-col space-y-px overflow-hidden rounded-lg border border-border bg-border" aria-hidden="true">
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{" "}{m.home.ghost_town}{" "}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.n01}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{" "}{m.home.nightfall}{" "}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.n02}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{" "}{m.home.static}{" "}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.n03}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{" "}{m.home.afterglow}{" "}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.n04}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{" "}{m.home.low_tide}{" "}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.n05}{" "}</span>
                </div>
              </div>
            </div>
            <div className="tile reveal flex flex-col p-7 md:col-span-2 md:p-9" style={{ "--reveal-order": "3" }}>
              <h3 className="font-heading text-lg font-semibold tracking-tight">{" "}{m.home.auto_split_for_roblox}{" "}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{" "}{m.home.roblox_caps_a_single_audio_asset_at_seve}{" "}</p>
              <div className="mt-6" aria-hidden="true">
                <div className="flex items-baseline justify-between font-mono text-[10px] tracking-widest text-muted-foreground">
                  <span>{m.home.source}</span>
                  <span className="text-foreground">{m.home.n18_42}</span>
                </div>
                <div className="mt-2 flex gap-px overflow-hidden rounded-lg border border-border bg-border">
                  <div style={{ flexGrow: "400" }} className="bg-secondary/60 px-3 py-3">
                    <p className="font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.part_1}{" "}</p>
                    <p className="mt-1 font-mono text-sm text-foreground">{m.home.n6_40}</p>
                  </div>
                  <div style={{ flexGrow: "400" }} className="bg-secondary/60 px-3 py-3">
                    <p className="font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.part_2}{" "}</p>
                    <p className="mt-1 font-mono text-sm text-foreground">{m.home.n6_40}</p>
                  </div>
                  <div style={{ flexGrow: "322" }} className="bg-secondary/60 px-3 py-3">
                    <p className="font-mono text-[10px] tracking-widest text-primary">{" "}{m.home.part_3}{" "}</p>
                    <p className="mt-1 font-mono text-sm text-foreground">{m.home.n5_22}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-px overflow-hidden rounded-lg border border-border bg-border" aria-hidden="true">
                <div className="flex items-center justify-between bg-card px-4 py-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {" "}{m.home.n1}{" "}
                    <span className="text-foreground">{m.home.ghost_town}</span>
                  </span>
                  <span className="font-mono text-[11px] text-primary">{" "}{m.home.rbxassetid_9021837465}{" "}</span>
                </div>
                <div className="flex items-center justify-between bg-card px-4 py-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {" "}{m.home.n2}{" "}
                    <span className="text-foreground">{m.home.ghost_town}</span>
                  </span>
                  <span className="font-mono text-[11px] text-primary">{" "}{m.home.rbxassetid_9021837466}{" "}</span>
                </div>
                <div className="flex items-center justify-between bg-card px-4 py-2.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {" "}{m.home.n3}{" "}
                    <span className="text-foreground">{m.home.ghost_town}</span>
                  </span>
                  <span className="font-mono text-[11px] text-primary">{" "}{m.home.rbxassetid_9021837467}{" "}</span>
                </div>
              </div>
              <p className="mt-auto pt-6 font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.n400s_per_part_exported_as_a_ready_to_pas}{" "}</p>
            </div>
            <div className="tile reveal flex flex-col p-7 md:col-span-2 md:p-9" style={{ "--reveal-order": "4" }}>
              <h3 className="font-heading text-lg font-semibold tracking-tight">{" "}{m.home.any_source_one_control}{" "}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{" "}{m.home.paste_a_link_or_drop_a_file_then_pick_a_}{" "}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 pt-6">
                <div className="flex shrink-0 gap-2" aria-hidden="true">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-[11px] tracking-widest text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 lucide-link-2 h-3.5 w-3.5 text-primary" aria-hidden="true">
                      <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                      <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                      <line x1="8" x2="16" y1="12" y2="12"></line>
                    </svg>
                    {" "}{m.home.paste_link}{" "}
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-dashed border-input bg-background/60 px-3 py-2 font-mono text-[11px] tracking-widest text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-headphone h-3.5 w-3.5 text-primary" aria-hidden="true">
                      <path d="M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343"></path>
                      <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                      <path d="M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0"></path>
                    </svg>
                    {" "}{m.home.drop_file}{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5" aria-hidden="true">
                  <span className="whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] border-border text-muted-foreground">{" "}{m.home.slow}{" "}</span>
                  <span className="whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] border-primary/40 bg-primary/10 text-primary">{" "}{m.home.default}{" "}</span>
                  <span className="whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] border-border text-muted-foreground">{" "}{m.home.fast}{" "}</span>
                  <span className="whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] border-border text-muted-foreground">{" "}{m.home.faster}{" "}</span>
                  <span className="whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] border-border text-muted-foreground">{" "}{m.home.ultra}{" "}</span>
                </div>
              </div>
            </div>
            <div className="tile reveal flex flex-col p-7" style={{ "--reveal-order": "5" }}>
              <h3 className="font-heading text-lg font-semibold tracking-tight">{" "}{m.home.real_time_moderation_tracking}{" "}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.watch_every_asset_s_moderation_status_li}{" "}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-warning/10 text-warning border-warning/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning motion-safe:animate-pulse"></span>
                  {" "}{m.home.pending_moderation}{" "}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success border-success/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  {" "}{m.home.accepted}{" "}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive border-destructive/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive"></span>
                  {" "}{m.home.rejected}{" "}
                </span>
              </div>
            </div>
          </div>
          <div className="reveal mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            <div className="bg-card px-6 py-5">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.max_file}{" "}</p>
              <p className="mt-1 font-mono text-lg font-medium text-foreground">{" "}{m.home.n200_mb}{" "}</p>
            </div>
            <div className="bg-card px-6 py-5">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.upload_2}{" "}</p>
              <p className="mt-1 font-mono text-lg font-medium text-foreground">{" "}{m.home.open_cloud}{" "}</p>
            </div>
            <div className="bg-card px-6 py-5">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.push}{" "}</p>
              <p className="mt-1 font-mono text-lg font-medium text-foreground">{" "}{m.home.roblox}{" "}</p>
            </div>
            <div className="bg-card px-6 py-5">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.payment}{" "}</p>
              <p className="mt-1 font-mono text-lg font-medium text-foreground">{" "}{m.home.qris}{" "}</p>
            </div>
          </div>
        </section></div>
        <div className="marquee py-8 sm:py-10" aria-hidden="true"><div className="marquee-track marquee-slow items-baseline">
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.convert}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.upload_2}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-platinum">{" "}{m.home.push}{" "}</span>
          <span className="whitespace-nowrap font-heading text-6xl font-bold tracking-tight sm:text-8xl text-outline">{" "}{m.home.play}{" "}</span>
        </div></div>
        <div id="pricing" className="scroll-mt-24">
          <PlanComparisonTable locale={locale}/>
        </div>
        <section id="security" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 sm:py-28">
          <p className="font-mono text-xs tracking-widest text-primary">{" "}{m.home.n04_security}{" "}</p>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="max-w-lg text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{" "}{m.home.built_to_be_trusted_with_your_keys}{" "}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{" "}{m.home.linking_your_roblox_account_means_handin}{" "}</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="tile reveal flex flex-col p-7 sm:p-9" style={{ "--reveal-order": "0" }}><ul className="flex flex-1 flex-col justify-between gap-7">
              <li className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-4 w-4 text-primary" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg></span>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold tracking-tight">{" "}{m.home.encrypted_at_rest}{" "}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.every_key_is_stored_with_aes_256_gcm_aut}{" "}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off h-4 w-4 text-primary" aria-hidden="true">
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                  <path d="m2 2 20 20"></path>
                </svg></span>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold tracking-tight">{" "}{m.home.never_sent_back_never_logged}{" "}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.no_endpoint_returns_your_key_or_its_ciph}{" "}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check h-4 w-4 text-primary" aria-hidden="true">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg></span>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold tracking-tight">{" "}{m.home.only_the_scopes_we_actually_use}{" "}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.your_api_key_only_needs_assets_read_writ}{" "}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2 h-4 w-4 text-primary" aria-hidden="true">
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M3 6h18"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg></span>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold tracking-tight">{" "}{m.home.unlinking_deletes_it}{" "}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.unlink_removes_the_stored_key_from_our_d}{" "}</p>
                </div>
              </li>
            </ul></div>
            <div className="tile reveal flex flex-col p-7 sm:p-9" style={{ "--reveal-order": "1" }}><div className="flex flex-1 flex-col" aria-hidden="true">
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.your_keys}{" "}</p>
              <div className="mt-2 rounded-xl border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] tracking-widest text-muted-foreground">{" "}{m.home.roblox_key}{" "}</span>
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.aes_256_gcm}{" "}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span className="min-w-0 flex-1 break-all font-mono text-sm tracking-[0.2em] text-muted-foreground/70">{" "}{m.home.text_3}{" "}</span>
                </div>
              </div>
              <p className="mt-5 font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.scopes_requested}{" "}</p>
              <div className="mt-2 flex flex-1 flex-col space-y-px overflow-hidden rounded-xl border border-border bg-border">
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  <span className="break-all font-mono text-[11px] text-muted-foreground">{" "}{m.home.assets_read}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  <span className="break-all font-mono text-[11px] text-muted-foreground">{" "}{m.home.assets_write}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  <span className="break-all font-mono text-[11px] text-muted-foreground">{" "}{m.home.operations_read_moderation_status}{" "}</span>
                </div>
                <div className="flex flex-1 items-center gap-2.5 bg-background/60 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                  <span className="break-all font-mono text-[11px] text-muted-foreground/60 line-through decoration-destructive/50">{" "}{m.home.universe_datastores_objects_delete}{" "}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] tracking-widest text-destructive">{" "}{m.home.never}{" "}</span>
                </div>
              </div>
            </div></div>
          </div>
          <div className="reveal mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            <div className="bg-card p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check h-5 w-5 text-primary" aria-hidden="true">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg></div>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.auth}{" "}</span>
              </div>
              <h3 className="mt-5 font-semibold">{m.home.secure_authentication}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.oauth_2_0_via_discord_aes_256_encrypted_}{" "}</p>
            </div>
            <div className="bg-card p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-5 w-5 text-primary" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg></div>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.transport}{" "}</span>
              </div>
              <h3 className="mt-5 font-semibold">{m.home.https_encrypted}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.https_everywhere_hsts_enabled_with_a_loc}{" "}</p>
            </div>
            <div className="bg-card p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-5 w-5 text-primary" aria-hidden="true">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg></div>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.billing}{" "}</span>
              </div>
              <h3 className="mt-5 font-semibold">{m.home.secure_payments}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{" "}{m.home.payments_processed_via_tako_id_qris_inst}{" "}</p>
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {" "}{m.home.read_our}{" "}
            <button type="button" onClick={() => requestTab("privacy")} className="underline underline-offset-4 transition-colors hover:text-foreground cursor-pointer">{" "}{m.home.privacy_policy}{" "}</button>
            {" "}{m.home.and}{" "}
            <button type="button" onClick={() => requestTab("terms")} className="underline underline-offset-4 transition-colors hover:text-foreground cursor-pointer">{" "}{m.home.terms_of_service}{" "}</button>
          </p>
        </section>
        <section id="start" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-24 sm:pb-32"><div className="beam shadow-raised"><div className="grid items-center gap-10 bg-card px-6 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <p className="font-mono text-xs tracking-widest text-primary">{" "}{m.home.n05_start_uploading}{" "}</p>
            <h2 className="text-platinum mt-5 text-balance font-heading text-3xl font-bold tracking-tight sm:text-5xl">{" "}{m.home.your_next_song_could_be_in_game_in_minut}{" "}</h2>
            <p className="mt-5 max-w-md text-muted-foreground max-lg:mx-auto">{" "}{m.home.sign_in_with_discord_and_convert_your_fi}{" "}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row max-lg:justify-center">
              <form data-action-form="auth"><button data-slot="button" data-variant="default" data-size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-10 has-[>svg]:px-4 group rounded-full px-8" type="submit">
                {" "}{m.home.browse_uploading} {" "}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button></form>
              <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} rel="noopener noreferrer" data-slot="button" data-variant="outline" data-size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 has-[>svg]:px-4 rounded-full px-8">{" "}{m.home.join_discord}{" "}</a>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-6 sm:p-7">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{" "}{m.home.the_whole_pipeline}{" "}</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                <span>{m.home.paste_or_drop}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                <span>{m.home.process}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                <span>{m.home.upload}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                <span>
                  {" "}{m.home.ready_to_play_2}{" "}
                  <span className="text-muted-foreground">{" "}{m.home.straight_to_your_roblox_inventory}{" "}</span>
                </span>
              </li>
            </ul>
            <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">{" "}{m.home.free_to_start_5_conversions_every_24_hou}{" "}</p>
          </div>
        </div></div></section>
        <Faq5 locale={locale}/>
      </div>
    </div>);
}
