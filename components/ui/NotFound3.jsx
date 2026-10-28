"use client";
import Link from "next/link";
import { getMessages } from "@/lib/messages";
import Footer01 from "@/components/ui/footer-01";
export default function NotFound3({ locale = "id", className = "", }) {
    const activeLocale = locale === "en" ? "en" : "id";
    const m = getMessages(activeLocale);
    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || `/${activeLocale}/join-discord`;
    return (<div className={`relative min-h-screen flex flex-col justify-between bg-[#080808] text-foreground overflow-hidden ${className}`}>
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10"/>
      <div className="absolute bottom-1/3 left-1/3 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"/>

      <header className="w-full border-b border-border/40 bg-background/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href={`/${activeLocale}`} className="flex items-center gap-3 transition-opacity hover:opacity-85">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px]">
            <div className="w-full h-full rounded-[7px] bg-background flex items-center justify-center">
              <img src="/asset/image/logo/logo.png" alt="Cilaaa Logo" className="w-4 h-4 object-contain" onError={(e) => {
            e.target.style.display = "none";
        }}/>
            </div>
          </div>
          <span className="font-heading font-bold text-sm tracking-widest text-foreground">
            CILAAA COMMUNITY
          </span>
        </Link>

        <Link href={`/${activeLocale}`} className="text-xs font-mono text-muted-foreground hover:text-cyan-400 transition-colors">
          {m.notFound.header_home}
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden -z-10">
          
          <span className="font-heading font-black text-[12rem] sm:text-[18rem] md:text-[24rem] lg:text-[28rem] leading-none tracking-tighter text-cyan-400/20 blur-3xl scale-110">
            404
          </span>
          
          <span className="absolute font-heading font-black text-[12rem] sm:text-[18rem] md:text-[24rem] lg:text-[28rem] leading-none tracking-tighter text-white/[0.04]">
            404
          </span>
        </div>

        <div className="max-w-xl w-full mx-auto text-center relative z-10 px-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-6 shadow-lg shadow-rose-950/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"/>
            <span>{m.notFound.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-foreground leading-tight sm:leading-[1.15]">
            {m.notFound.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {m.notFound.desc}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href={`/${activeLocale}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span>{m.notFound.back_home}</span>
            </Link>

            <Link href={`/${activeLocale}/dashboard/studio`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/40 text-foreground transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>{m.notFound.open_studio}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer01 locale={activeLocale}/>
    </div>);
}
