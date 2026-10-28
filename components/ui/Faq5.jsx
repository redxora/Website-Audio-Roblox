"use client";
import { useState } from "react";
import Link from "next/link";
import { getMessages } from "@/lib/messages";
export default function Faq5({ locale = "id", className = "" }) {
    const activeLocale = locale === "en" ? "en" : "id";
    const m = getMessages(activeLocale);
    const [openId, setOpenId] = useState("faq-1");
    const faqs = m.faq.items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        inlineLink: item.inline_link
            ? {
                text: item.inline_link,
                href: item.id === "faq-1"
                    ? `/${activeLocale}/dashboard/studio`
                    : item.id === "faq-2"
                        ? `/${activeLocale}#pricing`
                        : item.id === "faq-3"
                            ? `/${activeLocale}/privacy`
                            : item.id === "faq-4"
                                ? `/${activeLocale}/dashboard/spoofer`
                                : `/${activeLocale}/dashboard/billing`,
            }
            : undefined,
        afterLinkText: item.after_link,
    }));
    const toggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };
    return (<section className={`relative py-24 sm:py-32 overflow-hidden bg-[#05070d] text-white ${className}`}>
      
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]"/>
        <div className="absolute bottom-10 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]"/>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40"/>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-medium tracking-widest uppercase bg-primary/10 text-primary border border-primary/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_15px_rgba(255,0,126,0.15)] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ff007e]"/>
                {m.faq.badge}
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white leading-[1.12]">
                {m.faq.title}
              </h2>

              <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed font-normal">
                {m.faq.desc}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 border-t-white/35 bg-gradient-to-b from-white/[0.07] via-white/[0.035] to-white/[0.015] backdrop-blur-2xl p-6 sm:p-7 relative overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25)]">
              
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none"/>

              <div className="flex items-center gap-3.5 mb-3.5 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_16px_rgba(255,0,126,0.25)] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {m.faq.sidebar_heading}
                  </h3>
                  <p className="text-xs text-white/60">
                    {m.faq.sidebar_subheading}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6 relative z-10">
                {m.faq.support_desc}{" "}
                <Link href={`/${activeLocale}/privacy`} className="text-primary hover:text-pink-300 underline underline-offset-4 transition-colors font-medium">
                  {m.footer.privacy}
                </Link>{" "}
                &{" "}
                <Link href={`/${activeLocale}/terms`} className="text-primary hover:text-pink-300 underline underline-offset-4 transition-colors font-medium">
                  {m.footer.terms}
                </Link>
                .
              </p>

              <Link href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || `/${activeLocale}/join-discord`} target="_blank" rel="noopener noreferrer" data-slot="button" data-variant="default" className="group relative inline-flex items-center justify-center gap-2.5 w-full h-11 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide cursor-pointer transition-all duration-300 active:scale-[0.98] select-none shadow-[0_6px_24px_-2px_rgba(255,0,126,0.55),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                <svg className="w-4 h-4 fill-current shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>{m.faq.join_discord}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (<div key={faq.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-2xl ${isOpen
                    ? "border-primary/50 border-t-white/40 bg-white/[0.08] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35),0_0_28px_-6px_rgba(255,0,126,0.25)]"
                    : "border-white/12 border-t-white/25 bg-white/[0.035] hover:border-white/25 hover:border-t-white/40 hover:bg-white/[0.06] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]"}`}>
                  <button type="button" onClick={() => toggle(faq.id)} aria-expanded={isOpen} aria-controls={`${faq.id}-content`} className="group w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`inline-flex items-center justify-center font-mono text-xs font-bold px-2.5 py-1 rounded-lg border transition-all duration-300 shrink-0 ${isOpen
                    ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_12px_rgba(255,0,126,0.35)]"
                    : "bg-white/[0.05] text-white/50 border-white/10 group-hover:text-white/80 group-hover:border-white/20"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className={`text-sm sm:text-base font-semibold tracking-tight leading-snug transition-colors duration-200 ${isOpen ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                        {faq.question}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen
                    ? "bg-primary/25 border-primary/50 text-white rotate-180 shadow-[0_0_16px_rgba(255,0,126,0.4)]"
                    : "border-white/15 text-white/60 bg-white/[0.04] group-hover:border-white/30 group-hover:text-white group-hover:bg-white/[0.08]"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </button>

                  {isOpen && (<div id={`${faq.id}-content`} className="px-5 sm:px-6 pb-5 pt-2 text-xs sm:text-sm text-white/80 leading-relaxed border-t border-white/[0.06]">
                      <p>
                        {faq.answer}{" "}
                        {faq.inlineLink && (<Link href={faq.inlineLink.href} className="inline-flex items-center gap-1 font-semibold text-primary hover:text-pink-300 underline underline-offset-4 transition-colors ml-1">
                            <span>{faq.inlineLink.text}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                              <path d="M7 17 17 7"/>
                              <path d="M7 7h10v10"/>
                            </svg>
                          </Link>)}
                        {faq.afterLinkText}
                      </p>
                    </div>)}
                </div>);
        })}
          </div>
        </div>
      </div>
    </section>);
}
