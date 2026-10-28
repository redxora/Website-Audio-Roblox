"use client";
import Link from "next/link";
import CustomIcon from "@/components/ui/CustomIcon";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import { localizedHref } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { requestTab } from "@/lib/tab-nav";
import SaturnPricingCards from "@/components/design/SaturnPricingCards";
export function PublicFeatures({ locale }) {
    const m = getMessages(locale);
    const f = m.publicPages.features;
    const icons = [
        <CustomIcon key="core" name="icon-lightning" size={26} alt="Lightning"/>,
        <CustomIcon key="studio" name="icon-mixer" size={26} alt="Studio"/>,
        <CustomIcon key="cloud" name="icon-rocket" size={26} alt="Cloud"/>,
        <CustomIcon key="spoofer" name="icon-shield-custom" size={26} alt="Spoofer"/>,
        <CustomIcon key="perf" name="icon-diamond" size={26} alt="Performance"/>,
    ];
    return (<>
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="hero-grid absolute inset-0 opacity-40"></div>
          <div className="aurora-a absolute -top-[20%] left-1/2 h-[60vh] w-[70vw] -translate-x-[50%] opacity-30 will-change-transform"></div>
          <div className="aurora-b absolute top-[10%] left-1/2 h-[50vh] w-[60vw] -translate-x-[30%] opacity-20 will-change-transform"></div>
        </div>

        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"/>
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {f.badge}
            </span>
          </div>

          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            {f.title_prefix}
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-primary bg-clip-text text-transparent">
              {f.title_highlight}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {f.desc}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href={localizedHref("/dashboard", locale)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105">
              <span>{f.launch_console}</span>
              <span>→</span>
            </Link>
            <button type="button" onClick={() => requestTab("pricing")} className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer">
              <span>{f.explore_pricing}</span>
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {f.cards.map((feat, idx) => (<div key={idx} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(255,102,178,0.15)]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-2xl transition-transform group-hover:scale-110">
                    {icons[idx] || icons[0]}
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-primary border border-primary/25 bg-primary/10 rounded-full px-2.5 py-0.5">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>

                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                {feat.tags.map((tag, tIdx) => (<span key={tIdx} className="rounded-md bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground border border-border/40">
                    {tag}
                  </span>))}
              </div>
            </div>))}
        </div>
      </main>
    </>);
}
export function PublicPricing({ locale }) {
    const m = getMessages(locale);
    const p = m.publicPages.pricing;
    return (<>
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="hero-grid absolute inset-0 opacity-40"></div>
          <div className="aurora-a absolute -top-[20%] left-1/2 h-[60vh] w-[70vw] -translate-x-[50%] opacity-30 will-change-transform"></div>
          <div className="aurora-b absolute top-[10%] left-1/2 h-[50vh] w-[60vw] -translate-x-[30%] opacity-20 will-change-transform"></div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SaturnPricingCards locale={locale}/>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-6 pb-24">

        <div className="mt-16 rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-md max-w-2xl mx-auto">
          <h4 className="font-heading text-base font-bold text-foreground">
            {p.methods_title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {p.methods_desc}
          </p>
        </div>
      </main>
    </>);
}
export function PublicAbout({ locale, team, }) {
    const m = getMessages(locale);
    const a = m.publicPages.about;
    const leadership = team.filter((member) => member.customRole === "Owner" || member.customRole === "Creator");
    const developers = team.filter((member) => member.customRole === "Developer");
    const handles = team.filter((member) => member.customRole === "Handle");
    return (<>
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="hero-grid absolute inset-0 opacity-40"></div>
          <div className="aurora-a absolute -top-[20%] left-1/2 h-[60vh] w-[70vw] -translate-x-[50%] opacity-30 will-change-transform"></div>
          <div className="aurora-b absolute top-[10%] left-1/2 h-[50vh] w-[60vw] -translate-x-[30%] opacity-20 will-change-transform"></div>
        </div>

        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"/>
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {a.badge}
            </span>
          </div>

          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            {a.title_prefix}
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-primary bg-clip-text text-transparent">
              {a.title_highlight}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {a.desc}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 space-y-16">
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CustomIcon name="icon-crown" size={20} alt="Leadership"/>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {a.leadership_title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {a.leadership_desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {leadership.map((member) => (<TeamMemberCard key={member.id} member={member} locale={locale}/>))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CustomIcon name="icon-developer" size={20} alt="Developers"/>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {a.dev_title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {a.dev_desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developers.map((member) => (<TeamMemberCard key={member.id} member={member} locale={locale}/>))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CustomIcon name="icon-shield-custom" size={20} alt="Management"/>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {a.ops_title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {a.ops_desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {handles.map((member) => (<TeamMemberCard key={member.id} member={member} locale={locale}/>))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/70 to-card/50 p-8 sm:p-12 text-center backdrop-blur-xl shadow-[0_0_30px_rgba(255,102,178,0.12)]">
          <div className="mx-auto max-w-2xl">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              {a.cta_title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {a.cta_desc}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href="https://discord.gg/cilaaa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105">
                <span>{a.cta_btn}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>);
}
export function PublicPrivacy({ locale }) {
    const m = getMessages(locale);
    const p = m.publicPages.privacy;
    return (<main className="mx-auto min-h-screen max-w-3xl px-6 py-16 text-foreground">
      <button type="button" onClick={() => requestTab("home")} className="text-sm underline underline-offset-4 cursor-pointer">
        ← {p.back}
      </button>

      <p className="mt-10 font-mono text-xs tracking-widest text-primary">
        {p.community_badge}
      </p>

      <h1 className="mt-3 font-heading text-4xl font-bold">
        {p.title}
      </h1>

      <p className="mt-4 text-sm text-muted-foreground">
        {p.desc}
      </p>

      <section className="mt-10 space-y-7 text-sm leading-7 text-muted-foreground">
        {p.sections.map((sec, idx) => (<div key={idx}>
            <h2 className="font-semibold text-foreground">
              {sec.title}
            </h2>
            <p>{sec.content}</p>
          </div>))}
      </section>
    </main>);
}
export function PublicTerms({ locale }) {
    const m = getMessages(locale);
    const t = m.publicPages.terms;
    return (<main className="mx-auto min-h-screen max-w-3xl px-6 py-16 text-foreground">
      <button type="button" onClick={() => requestTab("home")} className="text-sm underline underline-offset-4 cursor-pointer">
        ← {t.back}
      </button>

      <p className="mt-10 font-mono text-xs tracking-widest text-primary">
        {t.community_badge}
      </p>

      <h1 className="mt-3 font-heading text-4xl font-bold">
        {t.title}
      </h1>

      <p className="mt-4 text-sm text-muted-foreground">
        {t.desc}
      </p>

      <section className="mt-10 space-y-7 text-sm leading-7 text-muted-foreground">
        {t.sections.map((sec, idx) => (<div key={idx}>
            <h2 className="font-semibold text-foreground">
              {sec.title}
            </h2>
            <p>{sec.content}</p>
          </div>))}
      </section>
    </main>);
}
