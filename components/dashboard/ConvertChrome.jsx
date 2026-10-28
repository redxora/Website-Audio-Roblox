"use client";
import { getMessages } from "@/lib/messages";
import ModernDashboardSidebar, { DashboardMobileNavTrigger } from "@/components/dashboard/ModernDashboardSidebar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
export default function ConvertChrome({ locale, userName = "Guest", avatarUrl, nameplateUrl, nameplateVideoUrl, planName, children, }) {
    const m = getMessages(locale);
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60 relative overflow-hidden">
          {nameplateVideoUrl ? (<video autoPlay loop muted playsInline className="discord-header-nameplate-bg" src={nameplateVideoUrl}/>) : nameplateUrl ? (<div aria-hidden="true" className="discord-header-nameplate-bg" style={{ backgroundImage: `url(${nameplateUrl})` }}/>) : null}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DashboardMobileNavTrigger />
                <img alt={m.convertLink.cilaaa_community} width="32" height="32" decoding="async" data-nimg="1" className="h-7 w-7" srcSet="/asset/image/logo/logo.png 1x, /asset/image/logo/logo.png 2x" src="/asset/image/logo/logo.png" style={{ color: "transparent" }}/>
                <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                  {" "}{m.convertLink.cilaaa_community}{" "}
                </span>
                <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
                  <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                  {" "}{m.convertLink.console}{" "}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <LanguageSwitcher locale={locale}/>
                <button data-slot="dropdown-menu-trigger" data-variant="ghost" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 px-4 py-2 has-[>svg]:px-3 relative h-9 w-9 rounded-full" type="button" id="radix-_r_q_" aria-haspopup="menu" aria-expanded="false" data-state="closed" data-action="account-menu">
                  <span data-slot="avatar" data-size="default" className="group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6 h-9 w-9 border border-border">
                    {avatarUrl ? (<img src={avatarUrl} alt={userName} className="h-full w-full object-cover rounded-full" data-avatar-img="true"/>) : (<span data-slot="avatar-fallback" className="bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs">
                        {(userName || "U").slice(0, 1).toUpperCase()}
                      </span>)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
          <ModernDashboardSidebar currentRoute="convert" locale={locale} userName={userName} avatarUrl={avatarUrl} planLabel={planName}/>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>);
}
