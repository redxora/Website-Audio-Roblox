"use client";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useState } from "react";
import { localizedHref } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { requestTab } from "@/lib/tab-nav";
export default function SiteHeader({ locale, activeItem = "home", isAuthenticated = false, userName = "Guest", avatarUrl = null, }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const m = getMessages(locale);
    const navLinks = [
        { id: "home", href: localizedHref("/", locale), label: m.nav.home },
        { id: "features", href: localizedHref("/features", locale), label: m.nav.features },
        { id: "pricing", href: localizedHref("/pricing", locale), label: m.nav.pricing },
        { id: "about", href: localizedHref("/about", locale), label: m.nav.about },
    ];
    return (<header className="sticky top-0 z-50 px-4 pt-4">
      <div className="surface-glass shadow-raised mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border border-border/60 pl-4 pr-2">
        
        <a className="flex items-center gap-2.5 group" href={localizedHref("/", locale)}>
          <img alt="CILAAA COMMUNITY" width={28} height={28} decoding="async" className="h-7 w-7 transition-transform group-hover:scale-105" srcSet="/asset/image/logo/logo.png 1x, /asset/image/logo/logo.png 2x" src="/asset/image/logo/logo.png" style={{ color: "transparent" }}/>
          <span className="hidden whitespace-nowrap font-heading text-sm font-semibold tracking-tight sm:inline">
            CILAAA COMMUNITY
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const isActive = activeItem === link.id;
            return (<button key={link.id} type="button" onClick={() => requestTab(link.id)} className={`rounded-full px-3.5 py-1.5 text-sm transition-all focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px] cursor-pointer ${isActive
                    ? "bg-primary/15 text-primary border border-primary/30 font-medium shadow-[0_0_12px_rgba(255,102,178,0.25)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"}`}>
                {link.label}
              </button>);
        })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} size="sm"/>

          <span data-anim="true" className="rail-track h-4 w-px bg-border/60" aria-hidden="true"/>

          {isAuthenticated ? (<a className="inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 px-3 rounded-full shadow-sm hover:shadow-[0_0_15px_rgba(255,102,178,0.35)]" href={localizedHref("/dashboard", locale)}>
              {avatarUrl ? (<img src={avatarUrl} alt={userName} className="h-4 w-4 rounded-full object-cover"/>) : null}
              <span>Console</span>
            </a>) : (<form data-action-form="auth">
              <button data-slot="button" data-variant="default" data-size="sm" className="inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 px-3 rounded-full shadow-sm hover:shadow-[0_0_15px_rgba(255,102,178,0.35)]" type="submit">
                {m.nav.login}
              </button>
            </form>)}

          <button type="button" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle navigation menu" className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-secondary/50 text-foreground transition-colors hover:bg-secondary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>)}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (<div className="surface-glass mt-2 mx-auto max-w-4xl rounded-2xl border border-border/60 p-3 shadow-xl md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
                const isActive = activeItem === link.id;
                return (<button key={link.id} type="button" onClick={() => {
                        setMobileMenuOpen(false);
                        requestTab(link.id);
                    }} className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer ${isActive
                        ? "bg-primary/15 text-primary font-medium border border-primary/25"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
                  <span>{link.label}</span>
                  {isActive && (<span className="h-1.5 w-1.5 rounded-full bg-primary"/>)}
                </button>);
            })}
          </nav>
        </div>)}
    </header>);
}
