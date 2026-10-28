"use client";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer01 from "@/components/ui/footer-01";
import Home from "@/components/design/Home";
import { PublicAbout, PublicFeatures, PublicPricing, PublicPrivacy, PublicTerms } from "@/components/design/PublicPages";
import { HOME_TAB_KEY, PUBLIC_TABS, TAB_EVENT, readStoredTab, storeTab, } from "@/lib/tab-nav";
function isPublicTab(value) {
  return value != null && PUBLIC_TABS.includes(value);
}
export default function PublicTabShell({ locale, isAuthenticated, userName, avatarUrl, roleName, team, }) {
  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    const stored = readStoredTab(HOME_TAB_KEY);
    if (isPublicTab(stored) && stored !== "home") {
      setActiveTab(stored);
    }
    const onTab = (event) => {
      const detail = event.detail;
      const next = detail?.tab;
      if (isPublicTab(next)) {
        setActiveTab(next);
        storeTab(HOME_TAB_KEY, next);
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener(TAB_EVENT, onTab);
    document.documentElement.setAttribute("data-shell-ready", "public");
    return () => window.removeEventListener(TAB_EVENT, onTab);
  }, []);
  return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} activeItem={activeTab === "privacy" || activeTab === "terms" ? "home" : activeTab} isAuthenticated={isAuthenticated} userName={userName} avatarUrl={avatarUrl} />

      <main className="flex-1">
        {activeTab === "home" && (<Home locale={locale} userName={userName} avatarUrl={avatarUrl} roleName={roleName} />)}
        {activeTab === "features" && <PublicFeatures locale={locale} />}
        {activeTab === "pricing" && <PublicPricing locale={locale} />}
        {activeTab === "about" && <PublicAbout locale={locale} team={team} />}
        {activeTab === "privacy" && <PublicPrivacy locale={locale} />}
        {activeTab === "terms" && <PublicTerms locale={locale} />}
      </main>

      <Footer01 locale={locale} />
    </div>
  </div>);
}
