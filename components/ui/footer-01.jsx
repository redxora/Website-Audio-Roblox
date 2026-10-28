"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMessages } from "@/lib/messages";
import { requestTab } from "@/lib/tab-nav";
import notify from "@/lib/notify";
function BrandIcon({ d, ...props }) {
    return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d={d}/>
    </svg>);
}
function DiscordIcon(props) {
    return (<BrandIcon d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" {...props}/>);
}
function GitHubIcon(props) {
    return (<BrandIcon d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" {...props}/>);
}
function LinkedInIcon(props) {
    return (<BrandIcon d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" {...props}/>);
}
function XIcon(props) {
    return (<BrandIcon d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" {...props}/>);
}
function YouTubeIcon(props) {
    return (<BrandIcon d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" {...props}/>);
}
export default function Footer01({ locale = "id", className = "", }) {
    const activeLocale = locale === "en" ? "en" : "id";
    const m = getMessages(activeLocale);
    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || `/${activeLocale}/join-discord`;
    const columns = [
        {
            title: m.footer.product,
            links: [
                { label: m.footer.features, tab: "features" },
                { label: m.footer.studio, href: `/${activeLocale}/dashboard/studio` },
                { label: m.footer.spoofer, href: `/${activeLocale}/dashboard/spoofer` },
                { label: m.footer.pricing, tab: "pricing" },
            ],
        },
        {
            title: m.footer.resources,
            links: [
                { label: m.footer.guides, href: `/${activeLocale}/dashboard/studio` },
                { label: m.footer.roblox_cloud, href: "https://create.roblox.com/docs/cloud" },
                { label: m.footer.community, href: discordUrl },
            ],
        },
        {
            title: m.footer.legal,
            links: [
                { label: m.footer.privacy, tab: "privacy" },
                { label: m.footer.terms, tab: "terms" },
                { label: m.footer.security, tab: "privacy" },
                { label: m.footer.cookies, tab: "privacy" },
            ],
        },
    ];
    const socials = [
        { name: "GitHub", icon: GitHubIcon, href: "https://github.com" },
        { name: "X", icon: XIcon, href: "https://x.com" },
        { name: "LinkedIn", icon: LinkedInIcon, href: "https://linkedin.com" },
        { name: "YouTube", icon: YouTubeIcon, href: "https://youtube.com" },
        { name: "Discord", icon: DiscordIcon, href: discordUrl },
    ];
    return (<footer className={`cilaaa-footer-wrap ${className}`}>
      <div className="cilaaa-footer-container">
        
        <div className="cilaaa-footer-top">
          
          <div className="cilaaa-footer-brand">
            <Link href={`/${activeLocale}`} className="cilaaa-footer-logo group">
              <img src="/asset/image/logo/logo.png" alt="Cilaaa Logo" style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "4px" }} onError={(e) => {
            e.target.style.display = "none";
        }}/>
              <span className="cilaaa-footer-logo-text">CILAAA COMMUNITY</span>
            </Link>

            <p className="cilaaa-footer-desc">
              {m.footer.desc}
            </p>

            <form className="cilaaa-footer-form" onSubmit={(e) => {
            e.preventDefault();
            notify.success("Newsletter", m.footer.subscribe_alert);
        }}>
              <input id="footer-01-email" type="email" required placeholder={m.footer.subscribe_placeholder} autoComplete="email" className="cilaaa-footer-input"/>
              <button type="submit" aria-label="Subscribe" className="cilaaa-footer-btn">
                <ArrowRight style={{ width: "16px", height: "16px", strokeWidth: 2.5 }}/>
              </button>
            </form>
          </div>

          <nav aria-label="Footer" className="cilaaa-footer-nav">
            {columns.map((column) => (<div key={column.title} className="cilaaa-footer-col">
                <h3 className="cilaaa-footer-col-title">{column.title}</h3>
                <ul className="cilaaa-footer-col-list">
                  {column.links.map((link) => (<li key={link.label}>
                      {"tab" in link && link.tab ? (<button type="button" onClick={() => requestTab(link.tab)} className="cilaaa-footer-link cursor-pointer text-left">
                          {link.label}
                        </button>) : (<Link href={link.href} className="cilaaa-footer-link">
                          {link.label}
                        </Link>)}
                    </li>))}
                </ul>
              </div>))}
          </nav>
        </div>

        <div aria-hidden className="cilaaa-footer-watermark-wrap">
          <p className="cilaaa-footer-watermark-text">CILAAA</p>
        </div>

        <div className="cilaaa-footer-divider-row">
          <div className="cilaaa-footer-status-wrap">
            <span>{m.footer.all_rights_reserved}</span>
          </div>

          <div className="cilaaa-footer-socials">
            {socials.map(({ name, icon: Icon, href }) => (<a key={name} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={name} className="cilaaa-footer-social-link">
                <Icon />
              </a>))}
          </div>
        </div>
      </div>

    </footer>);
}
