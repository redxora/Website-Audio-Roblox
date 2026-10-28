"use client";
import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Menu, ChevronRight, Sparkles } from "lucide-react";
import CustomIcon from "@/components/ui/CustomIcon";
import { requestTab } from "@/lib/tab-nav";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
export function DashboardMobileNavTrigger() {
    return (<button type="button" onClick={() => {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-dashboard-mobile-nav"));
            }
        }} className="dashboard-mobile-nav-trigger md:hidden items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-border/40 shadow-xs" aria-label="Open Navigation Menu" title="Open Menu">
      <Menu className="w-5 h-5 text-foreground"/>
    </button>);
}
export default function ModernDashboardSidebar({ currentRoute = "convert", isOpen = true, setIsOpen, planLabel, }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    useBodyScrollLock(isMobileOpen || isSearchOpen);
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const hoverPillId = useId();
    useEffect(() => {
        const handleOpen = () => setIsMobileOpen(true);
        window.addEventListener("open-dashboard-mobile-nav", handleOpen);
        return () => window.removeEventListener("open-dashboard-mobile-nav", handleOpen);
    }, []);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);
    const navGroups = [
        {
            heading: "Overview",
            items: [
                {
                    id: "search",
                    title: "Quick Search",
                    iconName: "icon-search-colored",
                    shortcut: "⌘K",
                    keywords: ["find", "search", "jump", "menu"],
                },
            ],
        },
        {
            heading: "Audio Tools",
            items: [
                {
                    id: "convert",
                    title: "Convert Audio",
                    iconName: "nav-convert",
                    href: "/en/dashboard",
                    keywords: ["convert", "upload", "mp3", "wav", "roblox"],
                    description: "Upload and convert audio to Roblox format",
                },
                {
                    id: "history",
                    title: "Conversion History",
                    iconName: "nav-history",
                    href: "/en/dashboard/history",
                    keywords: ["history", "past", "files", "downloads"],
                    description: "View and re-download your audio conversions",
                },
                {
                    id: "studio",
                    title: "Audio Studio",
                    iconName: "nav-studio",
                    href: "/en/dashboard/studio",
                    keywords: ["studio", "trim", "reverb", "pitch", "filter", "effects"],
                    description: "Advanced editor with EQ, Reverb, Pitch and FX",
                },
                {
                    id: "spoofer",
                    title: "Asset Spoofer",
                    iconName: "nav-spoofer",
                    href: "/en/dashboard/spoofer",
                    keywords: ["spoofer", "bypass", "hash", "roblox asset"],
                    description: "Protect audio assets from hash detection",
                },
            ],
        },
        {
            heading: "Account & Community",
            items: [
                {
                    id: "account",
                    title: "Roblox Account",
                    iconName: "nav-roblox",
                    href: "/en/dashboard/account",
                    keywords: ["roblox", "cookie", "login", "profile"],
                    description: "Manage connected Roblox credentials & profiles",
                },
                {
                    id: "billing",
                    title: "Billing & Plans",
                    iconName: "nav-billing",
                    href: "/en/dashboard/billing",
                    keywords: ["billing", "subscription", "upgrade", "payment"],
                    description: "Manage your subscription, tier and invoices",
                },
                {
                    id: "discord",
                    title: "Discord Community",
                    iconName: "icon-discord-colored",
                    href: "https://discord.gg/your-discord",
                    external: true,
                    keywords: ["discord", "community", "chat", "help"],
                    description: "Join the official community and get support",
                },
            ],
        },
    ];
    const bottomItems = [
        {
            id: "support",
            title: "Help & Support",
            iconName: "icon-support-colored",
            href: "/en/support",
            external: true,
        },
        {
            id: "logout",
            title: "Sign Out",
            iconName: "icon-logout-colored",
        },
    ];
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {}
        localStorage.clear();
        sessionStorage.clear();
        window.location.assign(`/${locale || "id"}`);
    };
    const allSearchableItems = [
        ...navGroups.flatMap((g) => g.items.filter((i) => i.id !== "search")),
        ...bottomItems,
    ];
    const filteredSearchItems = allSearchableItems.filter((item) => {
        if (!searchQuery.trim())
            return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const kwMatch = item.keywords?.some((k) => k.toLowerCase().includes(q));
        const descMatch = item.description?.toLowerCase().includes(q);
        return titleMatch || kwMatch || descMatch;
    });
    const renderNavGroup = (group, gIdx) => (<div key={gIdx} className="space-y-1 mb-3">
      {group.heading && (<span className="block px-3 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 font-semibold select-none">
          {group.heading}
        </span>)}
      <div className="space-y-1 relative" onMouseLeave={() => setHoveredItemId(null)}>
        {group.items.map((item) => {
            const isActive = currentRoute === item.id;
            const isHovered = hoveredItemId === item.id;
            if (item.id === "search") {
                return (<button key={item.id} type="button" onClick={() => setIsSearchOpen(true)} onMouseEnter={() => setHoveredItemId(item.id)} className="group relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer select-none border border-border/40 bg-secondary/40 hover:bg-secondary/70 text-muted-foreground hover:text-foreground shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0 z-10">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <CustomIcon name="icon-search-colored" size={18}/>
                  </div>
                  <span className="text-[13.5px] font-medium truncate leading-none text-foreground/90">{item.title}</span>
                </div>
                <kbd className="z-10 inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-mono font-bold text-muted-foreground/80 bg-background/90 border border-border/60 rounded-md shadow-xs">
                  {item.shortcut}
                </kbd>
              </button>);
            }
            const linkContent = (<div onMouseEnter={() => setHoveredItemId(item.id)} className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors duration-150 cursor-pointer select-none ${isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"}`}>

              {isHovered && !isActive && (<motion.div layoutId={`hover-pill-${hoverPillId}`} className="absolute inset-0 rounded-xl bg-white/[0.08] dark:bg-white/[0.06] border border-white/[0.08]" transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 0.8,
                    }}/>)}

              {isActive && (<motion.div layoutId="active-nav-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]" transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 0.8,
                    }}/>)}

              {isActive && (<motion.div layoutId="active-nav-indicator" className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(236,72,153,0.8)]" transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                    }}/>)}

              <div className="flex items-center gap-2.5 min-w-0 z-10">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {item.iconName ? (<CustomIcon name={item.iconName} size={18} className="transition-transform duration-200 group-hover:scale-110"/>) : item.icon ? (<item.icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} strokeWidth={isActive ? 2.2 : 1.8}/>) : null}
                </div>
                <span className="truncate leading-none text-foreground/90">{item.title}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 z-10">
                {item.badge && (<span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider ${item.badgeColor || (isActive ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground")}`}>
                    {item.badge}
                  </span>)}
                {item.external && (<ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground"/>)}
              </div>
            </div>);
            if (item.external && item.href) {
                return (<a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                {linkContent}
              </a>);
            }
            return (<button key={item.id} type="button" onClick={() => {
                    requestTab(item.id);
                    setIsMobileOpen(false);
                }} className="block w-full text-left cursor-pointer">
              {linkContent}
            </button>);
        })}
      </div>
    </div>);
    return (<>

      <aside className="hidden md:flex flex-col shrink-0 modern-dashboard-sidebar select-none z-20 sticky top-14" style={{
            width: "290px",
            minWidth: "290px",
            maxWidth: "290px",
            height: "calc(100vh - 3.5rem)",
            minHeight: "calc(100vh - 3.5rem)",
            maxHeight: "calc(100vh - 3.5rem)",
            background: "rgba(11, 8, 16, 0.94)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}>

        <div className="p-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflowY: "auto",
        }}>
          {navGroups.map((group, gIdx) => renderNavGroup(group, gIdx))}
        </div>

        <div className="p-3 border-t border-white/[0.08] space-y-1 relative" style={{
            marginTop: "auto",
            background: "rgba(11, 8, 16, 0.4)",
        }} onMouseLeave={() => setHoveredItemId(null)}>
          {bottomItems.map((item) => {
            const isLogout = item.id === "logout";
            const isHovered = hoveredItemId === item.id;
            const itemContent = (<div onMouseEnter={() => setHoveredItemId(item.id)} onClick={isLogout ? handleLogout : undefined} className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors duration-150 cursor-pointer select-none ${isLogout
                    ? "text-muted-foreground hover:text-rose-400"
                    : "text-muted-foreground hover:text-foreground"}`}>

                {isHovered && (<motion.div layoutId={`hover-pill-${hoverPillId}`} className={`absolute inset-0 rounded-xl ${isLogout
                        ? "bg-rose-500/10 border border-rose-500/20"
                        : "bg-white/[0.08] dark:bg-white/[0.06] border border-white/[0.08]"}`} transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 0.8,
                    }}/>)}

                <div className="flex items-center gap-2.5 min-w-0 z-10">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {item.iconName ? (<CustomIcon name={item.iconName} size={18} className="transition-transform duration-200 group-hover:scale-110"/>) : item.icon ? (<item.icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${isLogout ? "text-rose-400" : "text-muted-foreground group-hover:text-foreground"}`} strokeWidth={1.8}/>) : null}
                  </div>
                  <span className="truncate leading-none text-foreground/90">{item.title}</span>
                </div>
                {item.external && (<ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground z-10"/>)}
              </div>);
            if (item.href && !isLogout) {
                return (<Link key={item.id} href={item.href} className="block">
                  {itemContent}
                </Link>);
            }
            return <div key={item.id}>{itemContent}</div>;
        })}
        </div>
      </aside>

      <AnimatePresence>
        {isMobileOpen && (<div className="md:hidden fixed inset-0 z-[1000] flex">

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm"/>

            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 350 }} className="relative w-[300px] max-w-[85vw] h-full flex flex-col modern-dashboard-drawer border-r border-border/50 shadow-2xl z-10" style={{
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
            }}>

              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white"/>
                  </div>
                  <div>
                    <span className="text-sm font-bold tracking-tight text-foreground block">
                      Dashboard
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Navigation
                    </span>
                  </div>
                </div>
                <button type="button" onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
                {navGroups.map((group, gIdx) => renderNavGroup(group, gIdx))}
              </div>

              <div className="p-3.5 border-t border-border/40 space-y-1">
                {bottomItems.map((item) => {
                const isLogout = item.id === "logout";
                return (<div key={item.id} onClick={isLogout ? handleLogout : () => {
                        if (item.href)
                            router.push(item.href);
                        setIsMobileOpen(false);
                    }} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${isLogout
                        ? "text-rose-400 hover:bg-rose-500/10"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {item.iconName ? (<CustomIcon name={item.iconName} size={18}/>) : item.icon ? (<item.icon className="w-[18px] h-[18px]"/>) : null}
                        </div>
                        <span className="leading-none">{item.title}</span>
                      </div>
                      {item.external && <ExternalLink className="w-3.5 h-3.5 opacity-60"/>}
                    </div>);
            })}
              </div>
            </motion.aside>
          </div>)}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (<div className="fixed inset-0 z-[1000] flex items-start justify-center pt-20 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-black/75 backdrop-blur-md"/>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: "spring", damping: 25, stiffness: 350 }} className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0a14]/95 p-4 shadow-2xl backdrop-blur-2xl z-10 overflow-hidden">
              <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                <CustomIcon name="icon-search-colored" size={20} className="shrink-0"/>
                <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type a feature, tool, or keyword to jump..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"/>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
                {filteredSearchItems.length === 0 ? (<div className="p-6 text-center text-xs text-muted-foreground">
                    No results found for &quot;{searchQuery}&quot;
                  </div>) : (filteredSearchItems.map((item) => (<div key={item.id} onClick={() => {
                    setIsSearchOpen(false);
                    if (item.id === "logout") {
                        handleLogout();
                    }
                    else if (item.external && item.href) {
                        window.open(item.href, "_blank");
                    }
                    else {
                        requestTab(item.id);
                    }
                }} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {item.iconName ? (<CustomIcon name={item.iconName} size={18}/>) : item.icon ? (<item.icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary"/>) : null}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          {item.description && (<div className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"/>
                    </div>)))}
              </div>

              <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">ESC</kbd>{" "}
                  to close
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">ENTER</kbd>{" "}
                  to select
                </span>
              </div>
            </motion.div>
          </div>)}
      </AnimatePresence>
    </>);
}
