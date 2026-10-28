import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { localizedHref } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import CustomIcon from "@/components/ui/CustomIcon";
import { WindowDots } from "@/components/ui/WindowDots";
import { isLifetimeOrFullAccess } from "@/lib/discord-plan";
import ModernDashboardSidebar, { DashboardMobileNavTrigger } from "@/components/dashboard/ModernDashboardSidebar";
export default function Billing({ locale, userName = "Guest", avatarUrl, nameplateUrl, nameplateVideoUrl, subscription, orders, planLabel, roleName, }) {
    const m = getMessages(locale);
    const b = m.billing;
    const formatDate = (iso) => {
        if (!iso)
            return "—";
        const d = new Date(iso);
        return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };
    const daysLeft = (iso) => {
        if (!iso)
            return null;
        const diff = new Date(iso).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
    };
    const remaining = subscription ? daysLeft(subscription.expires_at) : null;
    const isLifetime = subscription && !subscription.expires_at;
    const hideChoosePlan = isLifetimeOrFullAccess(null, roleName);
    const statusBadge = (status) => {
        const map = {
            paid: b.status_paid,
            pending: b.status_pending,
            failed: b.status_failed,
            cancelled: b.status_cancelled,
            refunded: b.status_refunded,
        };
        return map[status] || status;
    };
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        
        <header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60 relative overflow-hidden backdrop-blur-2xl bg-card/50">
          {nameplateVideoUrl ? (<video autoPlay loop muted playsInline className="discord-header-nameplate-bg" src={nameplateVideoUrl}/>) : nameplateUrl ? (<div aria-hidden="true" className="discord-header-nameplate-bg" style={{ backgroundImage: `url(${nameplateUrl})` }}/>) : null}

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DashboardMobileNavTrigger />
                <img alt={m.history?.cilaaa_community || "CILAAA COMMUNITY"} width="32" height="32" className="h-7 w-7" src="/asset/image/logo/logo.png"/>
                <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                  {m.history?.cilaaa_community || "CILAAA COMMUNITY"}
                </span>
                <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
                  <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                  {m.history?.console || "CONSOLE"}
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
          
          <ModernDashboardSidebar currentRoute="billing" locale={locale} userName={userName} avatarUrl={avatarUrl} planLabel={planLabel}/>

          <div className="min-w-0 flex-1">
            <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
              <div className="space-y-8">
                
                <div>
                  <p className="font-mono text-[11px] tracking-widest text-primary">// 06 — {b.title.toUpperCase()}</p>
                  <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{b.title}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{b.subtitle}</p>
                </div>

                <div data-slot="card" className="bg-card text-card-foreground flex flex-col border shadow-sm w-full gap-0 overflow-hidden rounded-xl border-border py-0">
                  <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                    <WindowDots variant="solid"/>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">cilaaa — billing</span>
                    {subscription && subscription.status === "active" && (<span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-widest text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {b.active}
                      </span>)}
                  </div>
                  <div className="grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-10">
                    <div className="flex flex-col justify-center">
                      {subscription && subscription.status === "active" ? (<>
                          <p className="font-mono text-[11px] tracking-widest text-muted-foreground">{b.current_plan}</p>
                          <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{planLabel}</h2>
                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-border bg-secondary/30 p-3">
                              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{b.started}</p>
                              <p className="mt-1 text-sm font-semibold text-foreground">{formatDate(subscription.starts_at)}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-secondary/30 p-3">
                              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{b.expires}</p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {isLifetime ? b.never_expires : formatDate(subscription.expires_at)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-border bg-secondary/30 p-3">
                              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{b.days_left}</p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {isLifetime ? "∞" : remaining !== null ? `${remaining} ${b.days}` : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {!isLifetime && (<button data-slot="button" data-variant="default" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all cursor-pointer hover:bg-primary/90 h-11 has-[>svg]:px-4" type="button" data-action="upgrade">
                              <CustomIcon name="icon-sparkles" size={16}/>
                              {b.renew_or_upgrade}
                            </button>)}
                            <a href={localizedHref("/pricing", locale)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 h-11 text-sm font-semibold text-foreground transition-all hover:bg-secondary">
                              {b.compare_plans}
                            </a>
                          </div>
                        </>) : (<>
                          <p className="font-mono text-[11px] tracking-widest text-muted-foreground">{b.no_plan_label}</p>
                          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{b.no_plan_title}</h2>
                          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">{b.no_plan_desc}</p>
                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {!hideChoosePlan && (<button data-slot="button" data-variant="default" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all cursor-pointer hover:bg-primary/90 h-11 has-[>svg]:px-4" type="button" data-action="upgrade">
                              <CustomIcon name="icon-sparkles" size={16}/>
                              {b.choose_plan}
                            </button>)}
                          </div>
                        </>)}
                    </div>
                    <ul aria-hidden="true" className="space-y-px overflow-hidden rounded-lg border border-border bg-border">
                      <li className="flex items-center gap-3 bg-background/60 px-3 py-2.5">
                        <CustomIcon name="icon-check" size={14}/>
                        <span className="min-w-0 flex-1 truncate text-sm">{b.perk_quota}</span>
                      </li>
                      <li className="flex items-center gap-3 bg-background/60 px-3 py-2.5">
                        <CustomIcon name="icon-check" size={14}/>
                        <span className="min-w-0 flex-1 truncate text-sm">{b.perk_instant}</span>
                      </li>
                      <li className="flex items-center gap-3 bg-background/60 px-3 py-2.5">
                        <CustomIcon name="icon-check" size={14}/>
                        <span className="min-w-0 flex-1 truncate text-sm">{b.perk_role}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="reveal grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
                  <div className="bg-card p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CustomIcon name="icon-zap" size={20}/>
                    </div>
                    <h3 className="mt-4 font-semibold">{b.info_instant_title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.info_instant_desc}</p>
                  </div>
                  <div className="bg-card p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CustomIcon name="icon-check" size={20}/>
                    </div>
                    <h3 className="mt-4 font-semibold">{b.info_renew_title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.info_renew_desc}</p>
                  </div>
                  <div className="bg-card p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CustomIcon name="icon-lock" size={20}/>
                    </div>
                    <h3 className="mt-4 font-semibold">{b.info_expire_title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.info_expire_desc}</p>
                  </div>
                </div>

                <div data-slot="card" className="bg-card text-card-foreground flex flex-col border shadow-sm w-full gap-0 overflow-hidden rounded-xl border-border py-0">
                  <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                    <WindowDots variant="solid"/>
                    <h3 className="font-heading text-sm font-semibold tracking-tight">{b.history_title}</h3>
                  </div>
                  {orders.length === 0 ? (<div className="px-4 py-10 text-center text-sm text-muted-foreground">{b.history_empty}</div>) : (<div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                            <th className="px-4 py-2.5 font-medium">{b.col_date}</th>
                            <th className="px-4 py-2.5 font-medium">{b.col_plan}</th>
                            <th className="px-4 py-2.5 font-medium">{b.col_amount}</th>
                            <th className="px-4 py-2.5 font-medium">{b.col_method}</th>
                            <th className="px-4 py-2.5 font-medium">{b.col_status}</th>
                            <th className="px-4 py-2.5 font-medium">{b.col_tx}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (<tr key={o.id} className="border-b border-border/40 last:border-0">
                              <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(o.paid_at || o.created_at)}</td>
                              <td className="px-4 py-2.5">{o.plan_code}</td>
                              <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs">
                                Rp {o.amount_idr.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-2.5 uppercase text-xs text-muted-foreground">{o.payment_method || "—"}</td>
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${o.status === "paid"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : o.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-secondary text-muted-foreground border border-border"}`}>
                                  {statusBadge(o.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                                {o.provider_transaction_id ? o.provider_transaction_id.slice(0, 14) : "—"}
                              </td>
                            </tr>))}
                        </tbody>
                      </table>
                    </div>)}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>);
}
