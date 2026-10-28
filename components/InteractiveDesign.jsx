"use client";
import { useCallback, useEffect, useRef, useState, } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getClientSessionUser, clearClientSessionCache, startDiscordLogin } from "@/lib/auth/client";
import { prepareAudio } from "@/lib/audio";
import { getMessages } from "@/lib/messages";
import LiquidPaymentModal from "@/components/payment/LiquidPaymentModal";
import { requestTab } from "@/lib/tab-nav";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import notifyGlobal from "@/lib/notify";
function valueFrom(form, candidates) {
    for (const selector of candidates) {
        const element = form.querySelector(selector);
        if (element?.value.trim())
            return element.value.trim();
    }
    return "";
}
export default function InteractiveDesign({ children, locale, pageKind, userName, avatarUrl, avatarDecorationUrl, bannerUrl, bannerColor, accentColor, clanTag, clanBadge, roleName, isAuthenticated, }) {
    const pathname = usePathname();
    const router = useRouter();
    const rootRef = useRef(null);
    const m = getMessages(locale);
    const updateActiveNav = useCallback((targetPath) => {
        const root = rootRef.current;
        if (!root)
            return;
        const cleanTarget = targetPath.split("?")[0].split("#")[0];
        const isMatch = (cleanHref) => {
            if (cleanHref === cleanTarget)
                return true;
            if (cleanTarget.endsWith("/dashboard") && cleanHref.endsWith("/dashboard"))
                return true;
            return false;
        };
        const sidebarLinks = root.querySelectorAll("aside nav a[href]");
        sidebarLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const cleanHref = href.split("?")[0].split("#")[0];
            if (isMatch(cleanHref)) {
                link.setAttribute("aria-current", "page");
                link.className =
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors bg-secondary text-foreground border border-primary/20 shadow-sm";
                const numSpan = link.querySelector("span.font-mono");
                if (numSpan) {
                    numSpan.className = "font-mono text-[10px] tracking-widest text-primary";
                }
                if (!link.querySelector(".bg-primary.rounded-full")) {
                    const dot = document.createElement("span");
                    dot.className = "ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse";
                    dot.setAttribute("data-nav-dot", "true");
                    link.appendChild(dot);
                }
            }
            else {
                link.removeAttribute("aria-current");
                link.className =
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-secondary/60 hover:text-foreground";
                const numSpan = link.querySelector("span.font-mono");
                if (numSpan) {
                    numSpan.className = "font-mono text-[10px] tracking-widest text-muted-foreground/60";
                }
                link.querySelector("[data-nav-dot]")?.remove();
                link.querySelectorAll(".bg-primary.rounded-full").forEach((d) => d.remove());
            }
        });
        const mobileLinks = root.querySelectorAll('nav[aria-label*="Dashboard"] a[href]');
        mobileLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const cleanHref = href.split("?")[0].split("#")[0];
            if (isMatch(cleanHref)) {
                link.setAttribute("aria-current", "page");
                link.className =
                    "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors border-primary/40 bg-primary/10 text-foreground font-semibold";
            }
            else {
                link.removeAttribute("aria-current");
                link.className =
                    "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors border-border text-muted-foreground hover:text-foreground";
            }
        });
    }, []);
    useEffect(() => {
        if (typeof window !== "undefined") {
            updateActiveNav(pathname);
        }
    }, [pathname, updateActiveNav]);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const routesToWarmup = [
            `/${locale}/dashboard`,
            `/${locale}/dashboard/studio`,
            `/${locale}/dashboard/spoofer`,
            `/${locale}/dashboard/account`,
            `/${locale}/dashboard/history`,
            `/${locale}/dashboard/billing`,
        ];
        routesToWarmup.forEach((route) => {
            try {
                router.prefetch(route);
            }
            catch {
            }
        });
    }, [locale, router]);
    const [dialog, setDialog] = useState(null);
    const [dialogClosing, setDialogClosing] = useState(false);
    useBodyScrollLock(Boolean(dialog) || dialogClosing);
    const [busy, setBusy] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [accountMenuClosing, setAccountMenuClosing] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl || null);
    const [currentAvatarDecorationUrl, setCurrentAvatarDecorationUrl] = useState(avatarDecorationUrl || null);
    const [currentClanTag, setCurrentClanTag] = useState(clanTag || null);
    const [currentClanBadge, setCurrentClanBadge] = useState(clanBadge || null);
    const [currentUserName, setCurrentUserName] = useState(userName || "Guest");
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentModalStep, setPaymentModalStep] = useState("plans");
    const [paymentModalPlan, setPaymentModalPlan] = useState("monthly");
    const [paymentModalMethod, setPaymentModalMethod] = useState("qris");
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const url = new URL(window.location.href);
        const modalParam = url.searchParams.get("modal");
        const planParam = url.searchParams.get("plan");
        if (modalParam === "plans") {
            setPaymentModalStep("plans");
            const normalized = planParam?.toLowerCase() === "weekly" || planParam === "seven-days"
                ? "weekly"
                : planParam?.toLowerCase() === "lifetime" || planParam === "three-months"
                    ? "lifetime"
                    : "monthly";
            setPaymentModalPlan(normalized);
            setPaymentModalOpen(true);
        }
        else if (modalParam === "qris") {
            setPaymentModalStep("methods");
            const normalized = planParam?.toLowerCase() === "weekly" || planParam === "seven-days"
                ? "weekly"
                : planParam?.toLowerCase() === "lifetime" || planParam === "three-months"
                    ? "lifetime"
                    : "monthly";
            setPaymentModalPlan(normalized);
            setPaymentModalMethod("qris");
            setPaymentModalOpen(true);
        }
    }, []);
    const closeDialog = useCallback(() => {
        setDialogClosing(true);
        window.setTimeout(() => {
            setDialog(null);
            setDialogClosing(false);
        }, 200);
    }, []);
    const closeAccountMenu = useCallback(() => {
        setAccountMenuClosing(true);
        window.setTimeout(() => {
            setAccountMenuOpen(false);
            setAccountMenuClosing(false);
        }, 190);
    }, []);
    const toggleAccountMenu = useCallback(() => {
        if (accountMenuOpen) {
            closeAccountMenu();
        }
        else {
            setAccountMenuOpen(true);
            setAccountMenuClosing(false);
        }
    }, [accountMenuOpen, closeAccountMenu]);
    useEffect(() => {
        if (avatarUrl !== undefined)
            setCurrentAvatarUrl(avatarUrl);
        if (avatarDecorationUrl !== undefined)
            setCurrentAvatarDecorationUrl(avatarDecorationUrl);
        if (clanTag !== undefined)
            setCurrentClanTag(clanTag);
        if (clanBadge !== undefined)
            setCurrentClanBadge(clanBadge);
        if (userName)
            setCurrentUserName(userName);
    }, [avatarUrl, avatarDecorationUrl, clanTag, clanBadge, userName]);
    useEffect(() => {
        if (!isAuthenticated)
            return;
        let active = true;
        fetch("/api/discord/membership", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!active || !data)
                    return;
                if (data.avatarUrl)
                    setCurrentAvatarUrl(data.avatarUrl);
                if (data.avatarDecorationUrl !== undefined)
                    setCurrentAvatarDecorationUrl(data.avatarDecorationUrl);
                if (data.username)
                    setCurrentUserName(data.username);
                if (data.clanTag !== undefined)
                    setCurrentClanTag(data.clanTag);
                if (data.clanBadge !== undefined)
                    setCurrentClanBadge(data.clanBadge);
            })
            .catch(() => { });
        return () => {
            active = false;
        };
    }, [isAuthenticated]);
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const syncAvatars = () => {
            const avatarSlots = root.querySelectorAll('[data-slot="avatar"]');
            avatarSlots.forEach((slot) => {
                slot.style.overflow = "visible";
                slot.style.position = "relative";
                if (currentAvatarUrl) {
                    let img = slot.querySelector("img[data-avatar-img]");
                    if (!img) {
                        slot.innerHTML = "";
                        img = document.createElement("img");
                        img.setAttribute("data-avatar-img", "true");
                        img.className = "h-full w-full object-cover rounded-full";
                        slot.appendChild(img);
                    }
                    if (img.src !== currentAvatarUrl) {
                        img.src = currentAvatarUrl;
                    }
                    img.alt = currentUserName || "Discord Profile";
                }
                else {
                    const initial = (currentUserName || "U").trim().slice(0, 1).toUpperCase();
                    const fallback = slot.querySelector('[data-slot="avatar-fallback"]');
                    if (fallback) {
                        if (fallback.textContent !== ` ${initial} `) {
                            fallback.textContent = ` ${initial} `;
                        }
                    }
                    else {
                        slot.innerHTML = `<span data-slot="avatar-fallback" class="bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm font-medium font-mono">${initial}</span>`;
                    }
                }
                if (currentAvatarDecorationUrl) {
                    let decImg = slot.querySelector("img.discord-avatar-decoration");
                    if (!decImg) {
                        decImg = document.createElement("img");
                        decImg.className = "discord-avatar-decoration";
                        decImg.setAttribute("aria-hidden", "true");
                        decImg.style.position = "absolute";
                        decImg.style.width = "124%";
                        decImg.style.height = "124%";
                        decImg.style.top = "-12%";
                        decImg.style.left = "-12%";
                        decImg.style.maxWidth = "none";
                        decImg.style.maxHeight = "none";
                        decImg.style.pointerEvents = "none";
                        decImg.style.userSelect = "none";
                        decImg.style.zIndex = "10";
                        decImg.style.objectFit = "contain";
                        decImg.style.filter = "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.75))";
                        slot.appendChild(decImg);
                    }
                    if (decImg.src !== currentAvatarDecorationUrl) {
                        decImg.src = currentAvatarDecorationUrl;
                    }
                }
                else {
                    const decImg = slot.querySelector("img.discord-avatar-decoration");
                    if (decImg)
                        decImg.remove();
                }
            });
        };
        syncAvatars();
        const observer = new MutationObserver(() => {
            syncAvatars();
        });
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [currentAvatarUrl, currentAvatarDecorationUrl, currentUserName, pathname]);
    useEffect(() => {
        if (!accountMenuOpen)
            return;
        const handleOutsideClick = (e) => {
            const target = e.target;
            if (target?.closest(".app-user-menu") || target?.closest('[data-action="account-menu"]')) {
                return;
            }
            closeAccountMenu();
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [accountMenuOpen, closeAccountMenu]);
    useEffect(() => {
        if (pageKind !== "account")
            return;
        const syncAccountTabFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") === "group" ? "group" : "personal";
            const personalContent = document.getElementById("roblox-content-personal");
            const groupContent = document.getElementById("roblox-content-group");
            if (personalContent && groupContent) {
                const triggers = document.querySelectorAll('[data-action="account-tab"], button[role="tab"][id*="trigger-"]');
                triggers.forEach((btn) => {
                    const isTarget = btn.id.endsWith(tab) || btn.dataset.tab === tab;
                    btn.setAttribute("data-state", isTarget ? "active" : "inactive");
                    btn.setAttribute("aria-selected", isTarget ? "true" : "false");
                    if (isTarget) {
                        btn.classList.add("bg-background", "text-foreground", "shadow-sm");
                        btn.classList.remove("text-foreground/60");
                    }
                    else {
                        btn.classList.remove("bg-background", "text-foreground", "shadow-sm");
                        btn.classList.add("text-foreground/60");
                    }
                });
                if (tab === "personal") {
                    personalContent.hidden = false;
                    personalContent.style.display = "block";
                    personalContent.setAttribute("data-state", "active");
                    groupContent.hidden = true;
                    groupContent.style.display = "none";
                    groupContent.setAttribute("data-state", "inactive");
                }
                else {
                    groupContent.hidden = false;
                    groupContent.style.display = "block";
                    groupContent.setAttribute("data-state", "active");
                    personalContent.hidden = true;
                    personalContent.style.display = "none";
                    personalContent.setAttribute("data-state", "inactive");
                }
            }
        };
        syncAccountTabFromUrl();
        window.addEventListener("popstate", syncAccountTabFromUrl);
        return () => window.removeEventListener("popstate", syncAccountTabFromUrl);
    }, [pageKind]);
    const notify = useCallback((title, message, kind = "info") => {
        const tone = kind === "error" ? "destructive" : kind === "success" ? "success" : "info";
        notifyGlobal({
            tone,
            title,
            description: message,
        });
    }, []);
    const showSetup = useCallback((title, message) => setDialog({ title, message }), []);
    const verifyMembership = useCallback(async () => {
        setBusy(true);
        try {
            const response = await fetch("/api/discord/membership", {
                method: "GET",
                cache: "no-store",
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || m.gate.check_failed);
            }
            if (result.isMember) {
                notify(m.gate.verified_title, m.gate.verified_desc, "success");
                window.setTimeout(() => {
                    router.push(`/${locale}/dashboard`);
                }, 1200);
            }
            else {
                notify(m.gate.not_member_title, m.gate.not_member_desc, "error");
            }
        }
        catch (error) {
            notify(m.common.error_title, error instanceof Error ? error.message : m.gate.check_unavailable, "error");
        }
        finally {
            setBusy(false);
        }
    }, [locale, m.common.error_title, m.gate, notify]);
    const onClick = useCallback(async (event) => {
        const target = event.target;
        if (!(target instanceof Element))
            return;
        const anchor = target.closest('a[href^="#"]');
        if (anchor) {
            const hash = anchor.getAttribute("href");
            if (hash && hash.length > 1) {
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    event.preventDefault();
                    const lenis = window.__lenis;
                    if (lenis) {
                        lenis.scrollTo(targetEl, { offset: -60, duration: 1.1 });
                    }
                    else {
                        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    window.history.pushState(null, "", hash);
                    return;
                }
            }
        }
        const navLink = target.closest("a[href]");
        if (navLink && rootRef.current?.contains(navLink)) {
            const href = navLink.getAttribute("href");
            if (href &&
                !href.startsWith("#") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:") &&
                !href.startsWith("javascript:") &&
                !navLink.target &&
                !navLink.hasAttribute("download") &&
                !event.defaultPrevented &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey &&
                event.button === 0) {
                const isExternal = (href.startsWith("http://") || href.startsWith("https://")) &&
                    !href.startsWith(window.location.origin);
                if (!isExternal) {
                    const destination = href.startsWith(window.location.origin)
                        ? href.slice(window.location.origin.length)
                        : href;
                    const currentFull = window.location.pathname + window.location.search;
                    if (destination !== currentFull) {
                        event.preventDefault();
                        if (destination.includes("/dashboard")) {
                            updateActiveNav(destination);
                        }
                        router.push(destination);
                        return;
                    }
                }
            }
        }
        const explicit = target.closest("[data-action]");
        if (!explicit && pageKind === "account") {
            const tabButton = target.closest('button[role="tab"][id*="trigger-"]');
            if (tabButton && rootRef.current?.contains(tabButton)) {
                const match = tabButton.id.match(/trigger-(personal|group)$/);
                if (match) {
                    event.preventDefault();
                    const tab = match[1];
                    const personalContent = document.getElementById("roblox-content-personal");
                    const groupContent = document.getElementById("roblox-content-group");
                    if (personalContent && groupContent) {
                        const triggers = document.querySelectorAll('[data-action="account-tab"], button[role="tab"][id*="trigger-"]');
                        triggers.forEach((btn) => {
                            const isTarget = btn.id.endsWith(tab) || btn.dataset.tab === tab;
                            btn.setAttribute("data-state", isTarget ? "active" : "inactive");
                            btn.setAttribute("aria-selected", isTarget ? "true" : "false");
                            if (isTarget) {
                                btn.classList.add("bg-background", "text-foreground", "shadow-sm");
                                btn.classList.remove("text-foreground/60");
                            }
                            else {
                                btn.classList.remove("bg-background", "text-foreground", "shadow-sm");
                                btn.classList.add("text-foreground/60");
                            }
                        });
                        if (tab === "personal") {
                            personalContent.hidden = false;
                            personalContent.style.display = "block";
                            personalContent.setAttribute("data-state", "active");
                            groupContent.hidden = true;
                            groupContent.style.display = "none";
                            groupContent.setAttribute("data-state", "inactive");
                        }
                        else {
                            groupContent.hidden = false;
                            groupContent.style.display = "block";
                            groupContent.setAttribute("data-state", "active");
                            personalContent.hidden = true;
                            personalContent.style.display = "none";
                            personalContent.setAttribute("data-state", "inactive");
                        }
                        window.history.replaceState(null, "", `/${locale}/dashboard/account?tab=${encodeURIComponent(tab)}#roblox-section`);
                        return;
                    }
                    const pPane = document.getElementById("account-tab-personal");
                    const gPane = document.getElementById("account-tab-group");
                    if (pPane && gPane) {
                        if (tab === "personal") {
                            pPane.className = "tab-pane-active";
                            gPane.className = "tab-pane-inactive";
                        }
                        else {
                            gPane.className = "tab-pane-active";
                            pPane.className = "tab-pane-inactive";
                        }
                        window.history.replaceState(null, "", `/${locale}/dashboard/account?tab=${tab}#roblox-section`);
                        return;
                    }
                    router.push(`/${locale}/dashboard/account?tab=${match[1]}#roblox-section`);
                }
            }
            return;
        }
        const el = explicit;
        if (!el || !rootRef.current?.contains(el))
            return;
        const action = el.dataset.action;
        if (!action)
            return;
        if (action === "language") {
            event.preventDefault();
            const nextLocale = el.dataset.language === "id" ? "id" : "en";
            const parts = window.location.pathname.split("/").filter(Boolean);
            if (parts.length && (parts[0] === "id" || parts[0] === "en")) {
                parts[0] = nextLocale;
            }
            else {
                parts.unshift(nextLocale);
            }
            router.push(`/${parts.join("/")}${window.location.search}${window.location.hash}`);
            return;
        }
        if (action === "account-tab") {
            event.preventDefault();
            const tab = el.dataset.tab || "personal";
            const personalContent = document.getElementById("roblox-content-personal");
            const groupContent = document.getElementById("roblox-content-group");
            if (personalContent && groupContent) {
                const container = el.closest('[data-slot="tabs"], [role="tablist"]');
                const triggers = container
                    ? container.querySelectorAll('[data-action="account-tab"]')
                    : document.querySelectorAll('[data-action="account-tab"]');
                triggers.forEach((btn) => {
                    const isActive = btn.dataset.tab === tab;
                    btn.setAttribute("data-state", isActive ? "active" : "inactive");
                    btn.setAttribute("aria-selected", isActive ? "true" : "false");
                    if (isActive) {
                        btn.classList.add("bg-background", "text-foreground", "shadow-sm");
                        btn.classList.remove("text-foreground/60");
                    }
                    else {
                        btn.classList.remove("bg-background", "text-foreground", "shadow-sm");
                        btn.classList.add("text-foreground/60");
                    }
                });
                if (tab === "personal") {
                    personalContent.hidden = false;
                    personalContent.style.display = "block";
                    personalContent.setAttribute("data-state", "active");
                    groupContent.hidden = true;
                    groupContent.style.display = "none";
                    groupContent.setAttribute("data-state", "inactive");
                }
                else {
                    groupContent.hidden = false;
                    groupContent.style.display = "block";
                    groupContent.setAttribute("data-state", "active");
                    personalContent.hidden = true;
                    personalContent.style.display = "none";
                    personalContent.setAttribute("data-state", "inactive");
                }
                return;
            }
            const pPane = document.getElementById("account-tab-personal");
            const gPane = document.getElementById("account-tab-group");
            if (pPane && gPane) {
                if (tab === "personal") {
                    pPane.className = "tab-pane-active";
                    gPane.className = "tab-pane-inactive";
                }
                else {
                    gPane.className = "tab-pane-active";
                    pPane.className = "tab-pane-inactive";
                }
                return;
            }
            requestTab("account");
            return;
        }
        if (action === "convert-tab") {
            event.preventDefault();
            const mode = el.dataset.mode === "upload" ? "upload" : "link";
            const linkPane = document.getElementById("convert-tab-link");
            const uploadPane = document.getElementById("convert-tab-upload");
            if (linkPane && uploadPane) {
                if (mode === "link") {
                    linkPane.className = "tab-pane-active";
                    uploadPane.className = "tab-pane-inactive";
                }
                else {
                    uploadPane.className = "tab-pane-active";
                    linkPane.className = "tab-pane-inactive";
                }
                return;
            }
            router.push(`/${locale}/dashboard`);
            return;
        }
        if (action === "account-menu") {
            event.preventDefault();
            toggleAccountMenu();
            return;
        }
        if (action === "upgrade") {
            event.preventDefault();
            event.stopPropagation();
            setPaymentModalStep("plans");
            const rawPlan = el.dataset.plan?.toLowerCase();
            if (rawPlan === "daily" || rawPlan === "1day") {
                setPaymentModalPlan("daily");
            }
            else if (rawPlan === "weekly" || rawPlan === "seven-days") {
                setPaymentModalPlan("weekly");
            }
            else if (rawPlan === "lifetime" || rawPlan === "three-months") {
                setPaymentModalPlan("lifetime");
            }
            else {
                setPaymentModalPlan("monthly");
            }
            setPaymentModalOpen(true);
            return;
        }
        if (action === "choose-plan") {
            event.preventDefault();
            event.stopPropagation();
            const rawPlan = el.dataset.plan?.toLowerCase() || "weekly";
            const normalizedPlan = rawPlan === "daily" || rawPlan === "1day"
                ? "daily"
                : rawPlan === "weekly" || rawPlan === "seven-days"
                    ? "weekly"
                    : rawPlan === "lifetime" || rawPlan === "three-months"
                        ? "lifetime"
                        : "monthly";
            setPaymentModalPlan(normalizedPlan);
            setPaymentModalStep("methods");
            setPaymentModalOpen(true);
            return;
        }
        const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#";
        if (action === "open-support") {
            event.preventDefault();
            window.open(discordInvite, "_blank", "noopener,noreferrer");
            return;
        }
        if (action === "pay-qris" || action === "payment-not-configured") {
            event.preventDefault();
            event.stopPropagation();
            const rawPlan = el.dataset.plan?.toLowerCase() || "monthly";
            const normalizedPlan = rawPlan === "daily" || rawPlan === "1day"
                ? "daily"
                : rawPlan === "weekly" || rawPlan === "seven-days"
                    ? "weekly"
                    : rawPlan === "lifetime" || rawPlan === "three-months"
                        ? "lifetime"
                        : "monthly";
            setPaymentModalPlan(normalizedPlan);
            setPaymentModalMethod("qris");
            setPaymentModalStep("payment");
            setPaymentModalOpen(true);
            return;
        }
        if (action === "close-dialog") {
            event.preventDefault();
            event.stopPropagation();
            setPaymentModalOpen(false);
            const currentDialog = el.closest('[data-slot="dialog-content"], [role="dialog"], .app-dialog');
            if (currentDialog) {
                currentDialog.classList.add("is-closing");
                currentDialog.setAttribute("data-state", "closed");
            }
            const dialogOverlay = currentDialog?.closest('[data-slot="dialog-overlay"], .app-dialog-backdrop') ||
                el.closest('[data-slot="dialog-overlay"], .app-dialog-backdrop') ||
                document.querySelector('.app-dialog-backdrop');
            if (dialogOverlay) {
                dialogOverlay.classList.add("is-closing");
            }
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                if (url.searchParams.has("modal")) {
                    url.searchParams.delete("modal");
                    url.searchParams.delete("plan");
                    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
                }
            }
            window.setTimeout(() => {
                setDialog(null);
            }, 150);
            return;
        }
        if (action === "verify-discord") {
            event.preventDefault();
            return;
        }
        if (action === "save-roblox-account") {
            event.preventDefault();
            const form = el.closest("form");
            if (form)
                form.requestSubmit();
            return;
        }
        if (action === "convert-audio") {
            event.preventDefault();
            const form = el.closest("form") ||
                rootRef.current?.querySelector('form[data-action-form="convert"]');
            if (form)
                form.requestSubmit();
            return;
        }
        if (action === "sign-out") {
            event.preventDefault();
            await fetch("/api/auth/logout", { method: "POST" });
            clearClientSessionCache();
            window.location.assign(`/${locale}`);
            return;
        }
    }, [locale, m, notify, pageKind, showSetup, verifyMembership]);
    const onSubmit = useCallback(async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLFormElement))
            return;
        const form = target;
        const kind = form.dataset.actionForm;
        if (!kind)
            return;
        event.preventDefault();
        if (busy)
            return;
        setBusy(true);
        try {
            if (kind === "auth") {
                startDiscordLogin(`/${locale}/dashboard`);
                return;
            }
            if (kind === "checkout") {
                const plan = form.dataset.plan || "";
                if (plan === "free") {
                    startDiscordLogin(`/${locale}/dashboard`);
                    return;
                }
                const selectedPlan = [
                    "daily",
                    "1day",
                    "Weekly",
                    "weekly",
                    "seven-days",
                    "monthly",
                    "thirty-days",
                    "lifetime",
                    "three-months",
                ].includes(plan)
                    ? plan
                    : "monthly";
                const rawPlan = selectedPlan.toLowerCase();
                const normalizedPlan = rawPlan === "daily" || rawPlan === "1day"
                    ? "daily"
                    : rawPlan === "weekly" || rawPlan === "seven-days"
                        ? "weekly"
                        : rawPlan === "lifetime" || rawPlan === "three-months"
                            ? "lifetime"
                            : "monthly";
                setPaymentModalPlan(normalizedPlan);
                setPaymentModalMethod("qris");
                setPaymentModalStep("methods");
                setPaymentModalOpen(true);
                return;
            }
            if (kind === "roblox-connect") {
                const mode = form.dataset.accountMode || "personal";
                const apiKey = valueFrom(form, ['input[type="password"]']);
                const numericInputs = Array.from(form.querySelectorAll('input[type="text"], input[inputmode="numeric"]'));
                let userId = "";
                let groupId = "";
                if (mode === "personal") {
                    userId = numericInputs[0]?.value.trim() || "";
                }
                else {
                    groupId = numericInputs[0]?.value.trim() || "";
                    userId = numericInputs[1]?.value.trim() || "";
                }
                const data = { mode, apiKey };
                if (userId)
                    data.robloxUserId = userId;
                if (groupId)
                    data.groupId = groupId;
                if (!apiKey && !isAuthenticated)
                    throw new Error(m.auth.login_first);
                const response = await fetch("/api/roblox/connect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok)
                    throw new Error(result.error || m.account.save_failed);
                notify(m.account.saved_title, m.account.saved_desc, "success");
                form.querySelectorAll('input[type="password"]').forEach((input) => {
                    input.value = "";
                });
                return;
            }
            if (kind === "convert") {
                const fileInput = form.querySelector('input[type="file"]');
                const urlInput = form.querySelector('input[type="url"]');
                const file = fileInput?.files?.[0];
                const url = urlInput?.value.trim() || "";
                if (!file && !url)
                    throw new Error(m.convert.empty_input);
                if (isAuthenticated) {
                    const entitlementResponse = await fetch("/api/account/entitlement", { cache: "no-store" });
                    const entitlementData = await entitlementResponse.json();
                    if (!entitlementResponse.ok)
                        throw new Error(entitlementData.error || m.gate.check_failed);
                    if (typeof entitlementData.dailyRemaining === "number" && entitlementData.dailyRemaining <= 0) {
                        throw new Error(m.convert.quota_exceeded);
                    }
                }
                const speedInput = form.querySelector('input[name="speed"]');
                const volumeDbInput = form.querySelector('input[name="volumeDb"]');
                const speed = speedInput ? parseFloat(speedInput.value) : 2.3;
                const volumeDb = volumeDbInput ? parseFloat(volumeDbInput.value) : -8;
                const tempId = "live-" + Date.now();
                const cleanUrlDisplay = url ? url.split("?")[0].split("#")[0].replace(/^https?:\/\/(www\.)?/, "") : "";
                const initialSongTitle = file?.name ? file.name.replace(/\.[^.]+$/, "") : cleanUrlDisplay || "Audio Track";
                const startTime = performance.now();
                const dispatchProgress = (item, isNew) => {
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("cilaaa:conversion-progress", {
                            detail: { item, isNew },
                        }));
                    }
                };
                const dispatchStage = (stage, percent) => {
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("cilaaa:convert-stage", { detail: { stage, percent } }));
                    }
                };
                dispatchProgress({
                    id: tempId,
                    original_name: initialSongTitle,
                    output_name: initialSongTitle + " (Nightcore).wav",
                    status: "converting",
                    duration_seconds: 0,
                    bytes: file?.size || 0,
                    created_at: new Date().toISOString(),
                    speed,
                    downloadTimeSeconds: 0,
                    processTimeSeconds: 0,
                }, true);
                dispatchStage("extract", null);
                const output = await prepareAudio(file || url, { speed, volumeDb }, (progress) => {
                    dispatchStage(progress.stage, progress.percent);
                });
                const processTimeSeconds = Number(((performance.now() - startTime) / 1000).toFixed(1));
                const finalSongTitle = output.title || initialSongTitle;
                dispatchStage("upload", null);
                dispatchProgress({
                    id: tempId,
                    original_name: finalSongTitle,
                    output_name: output.name,
                    status: "uploading",
                    duration_seconds: output.durationSeconds,
                    bytes: output.blob.size,
                    processTimeSeconds,
                    speed,
                });
                if (!isAuthenticated) {
                    dispatchProgress({
                        id: tempId,
                        status: "prepared",
                    });
                    dispatchStage("done", 100);
                    return;
                }
                const user = await getClientSessionUser(true);
                if (!user)
                    throw new Error(m.auth.session_expired);
                const storagePath = `${user.id}/${crypto.randomUUID()}-${output.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
                const uploadRes = await fetch("/api/files/upload", {
                    method: "POST",
                    headers: {
                        "x-file-path": storagePath,
                        "Content-Type": "audio/wav",
                    },
                    body: output.blob,
                });
                if (!uploadRes.ok) {
                    const uploadErr = (await uploadRes.json().catch(() => ({})));
                    throw new Error(`${m.convert.storage_failed}${uploadErr.error || uploadRes.status}`);
                }
                const created = await fetch("/api/conversions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        originalName: finalSongTitle || file?.name || url,
                        outputName: output.name,
                        storagePath,
                        bytes: output.blob.size,
                        durationSeconds: output.durationSeconds,
                        speed,
                    }),
                });
                const conversionResult = await created.json();
                if (!created.ok) {
                    await fetch(`/api/files/${storagePath}`, { method: "DELETE" });
                    throw new Error(conversionResult.error || m.convert.history_failed);
                }
                const realId = conversionResult.conversion?.id || tempId;
                dispatchProgress({
                    id: tempId,
                    status: "roblox_processing",
                });
                dispatchStage("roblox", null);
                const robloxResponse = await fetch("/api/roblox/upload-audio", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        storagePath,
                        displayName: output.name.replace(/\.wav$/i, ""),
                        durationSeconds: output.durationSeconds,
                        conversionId: realId,
                    }),
                });
                const robloxResult = await robloxResponse.json().catch(() => ({}));
                if (robloxResponse.ok) {
                    dispatchProgress({
                        id: tempId,
                        status: "uploaded",
                        roblox_asset_id: robloxResult.assetId || "ready",
                    });
                }
                else {
                    dispatchProgress({
                        id: tempId,
                        status: "prepared",
                    });
                }
                if (typeof window !== "undefined") {
                    window.setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("cilaaa:refresh-conversions"));
                    }, 600);
                }
                dispatchStage("done", 100);
                return;
            }
        }
        catch (error) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("cilaaa:convert-stage", { detail: { stage: "error", percent: null } }));
            }
            notify(m.common.error_title, error instanceof Error ? error.message : m.common.unexpected_error, "error");
        }
        finally {
            setBusy(false);
        }
    }, [busy, isAuthenticated, locale, m, notify]);
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const clickListener = (event) => {
            void onClick(event);
        };
        root.addEventListener("click", clickListener);
        return () => root.removeEventListener("click", clickListener);
    }, [onClick]);
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const handlePointerOver = (event) => {
            const target = event.target;
            if (!(target instanceof Element))
                return;
            const link = target.closest("a[href]");
            if (link && root.contains(link)) {
                const href = link.getAttribute("href");
                if (href &&
                    !href.startsWith("#") &&
                    !href.startsWith("http") &&
                    !href.startsWith("mailto:") &&
                    !href.startsWith("tel:")) {
                    try {
                        router.prefetch(href);
                    }
                    catch {
                    }
                }
            }
        };
        root.addEventListener("mouseover", handlePointerOver, { passive: true });
        return () => root.removeEventListener("mouseover", handlePointerOver);
    }, [router]);
    useEffect(() => {
        if (typeof document !== "undefined")
            document.documentElement.lang = locale;
        const invite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;
        if (invite && rootRef.current) {
            const links = rootRef.current.querySelectorAll('a[href*="discord.gg"]');
            links.forEach((a) => {
                a.href = invite;
            });
        }
    }, [locale, pathname]);
    useEffect(() => {
        if (typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("auth") === "required") {
            notify(m.auth.required_title, m.auth.required_desc, "info");
        }
    }, [locale, m.auth, notify]);
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const cleanups = [];
        const zones = root.querySelectorAll("form[data-action-form]");
        zones.forEach((form) => {
            if (form.dataset.actionForm === "roblox-connect") {
                const requiredNumeric = form.querySelector('input[inputmode="numeric"][required]') ||
                    form.querySelector('input[inputmode="numeric"]');
                const button = form.querySelector('button[type="submit"]');
                const update = () => {
                    if (button)
                        button.disabled = !requiredNumeric?.value.trim();
                };
                update();
                requiredNumeric?.addEventListener("input", update);
                if (requiredNumeric) {
                    cleanups.push(() => requiredNumeric.removeEventListener("input", update));
                }
            }
            if (form.dataset.actionForm === "convert") {
                const urlInput = form.querySelector('input[type="url"]');
                const fileInput = form.querySelector('input[type="file"]');
                const button = form.querySelector('button[data-action="convert-audio"]');
                const update = () => {
                    if (button)
                        button.disabled = !(urlInput?.value.trim() || (fileInput?.files?.length || 0) > 0);
                };
                update();
                urlInput?.addEventListener("input", update);
                fileInput?.addEventListener("change", update);
                cleanups.push(() => urlInput?.removeEventListener("input", update), () => fileInput?.removeEventListener("change", update));
            }
        });
        return () => cleanups.forEach((cleanup) => cleanup());
    }, [pageKind, pathname]);
    return (<div ref={rootRef} onSubmit={onSubmit} data-page-kind={pageKind} suppressHydrationWarning>
        {children}

        {(accountMenuOpen || accountMenuClosing) && (<div className={`app-user-menu ${accountMenuClosing ? "is-closing" : ""}`} role="menu">
            <div className="app-user-menu-profile">
                <div className="discord-avatar-wrapper" style={{ width: 42, height: 42, flexShrink: 0 }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "9999px", overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                        {currentAvatarUrl ? (<img src={currentAvatarUrl} alt={currentUserName} className="app-user-menu-avatar-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : (<span className="app-user-menu-avatar" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {(currentUserName || "U").slice(0, 1).toUpperCase()}
                        </span>)}
                    </div>
                    {currentAvatarDecorationUrl && (<img src={currentAvatarDecorationUrl} alt="Avatar Decoration" aria-hidden="true" className="discord-avatar-decoration" />)}
                </div>
                <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUserName}</span>
                        {currentClanTag && (<span className="clan-badge-pill">
                            [{currentClanTag}]
                        </span>)}
                    </strong>
                    <small>
                        {isAuthenticated
                            ? roleName || m.auth.discord_account
                            : m.auth.preview_account}
                    </small>
                </span>
            </div>

            <a role="menuitem" href={`/${locale}/dashboard/account`}>
                {m.nav.account}
            </a>

            <a role="menuitem" href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} target="_blank" rel="noreferrer">
                {m.nav.support} ↗
            </a>

            {isAuthenticated ? (<button type="button" data-action="sign-out" role="menuitem">
                {m.nav.logout}
            </button>) : (<a role="menuitem" href={`/${locale}`}>
                {m.nav.login}
            </a>)}
        </div>)}


        {(dialog || dialogClosing) && dialog && (<div className={`app-dialog-backdrop ${dialogClosing ? "is-closing" : ""}`} role="presentation" onClick={(e) => {
            if (e.target === e.currentTarget)
                closeDialog();
        }}>
            <section className={`app-dialog ${dialogClosing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
                <button className="app-dialog-close" type="button" onClick={closeDialog} aria-label="Close dialog">
                    ×
                </button>
                <h2 id="app-dialog-title">{dialog.title}</h2>
                <p>{dialog.message}</p>
                <button className="app-dialog-ok" type="button" onClick={closeDialog}>
                    {m.common.ok}
                </button>
            </section>
        </div>)}

        {busy && (<div className="app-busy" aria-live="polite">
            {m.common.loading}
        </div>)}

        <LiquidPaymentModal key={paymentModalOpen ? "open" : "closed"} isOpen={paymentModalOpen} initialStep={paymentModalStep} initialPlan={paymentModalPlan} initialMethod={paymentModalMethod} locale={locale} isAuthenticated={isAuthenticated} onClose={() => {
            setPaymentModalOpen(false);
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                if (url.searchParams.has("modal")) {
                    url.searchParams.delete("modal");
                    url.searchParams.delete("plan");
                    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
                }
            }
        }} onSuccess={(paidPlan) => {
            notify(m.paymentModal.payment_success, `${m.paymentModal.payment_success_details_prefix}${paidPlan}${m.paymentModal.payment_success_details_suffix}`, "success");
        }} />
    </div>);
}
