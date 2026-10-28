"use client";
import { useState } from "react";
import { getMessages } from "@/lib/messages";
import CustomIcon from "@/components/ui/CustomIcon";
export default function TeamMemberCard({ member, locale = "id", }) {
    const m = getMessages(locale);
    const [copied, setCopied] = useState(false);
    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(member.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
        }
    };
    const getRoleBadge = (role) => {
        switch (role) {
            case "Owner":
                return {
                    icon: <CustomIcon name="icon-crown" size={14} alt="Owner"/>,
                    label: m.team.owner_role,
                    className: "border-amber-400/30 border-t-amber-200/60 bg-amber-500/15 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.25)]",
                };
            case "Creator":
                return {
                    icon: <CustomIcon name="icon-lightning" size={14} alt="Creator"/>,
                    label: m.team.creator_role,
                    className: "border-pink-400/30 border-t-pink-200/60 bg-pink-500/15 text-pink-200 shadow-[0_0_14px_rgba(236,72,153,0.25)]",
                };
            case "Developer":
                return {
                    icon: <CustomIcon name="icon-developer" size={14} alt="Developer"/>,
                    label: m.team.developer_role,
                    className: "border-cyan-400/30 border-t-cyan-200/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.25)]",
                };
            case "Handle":
                return {
                    icon: <CustomIcon name="icon-shield-custom" size={14} alt="Handle"/>,
                    label: m.team.handle_role,
                    className: "border-emerald-400/30 border-t-emerald-200/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.25)]",
                };
        }
    };
    const roleBadge = getRoleBadge(member.customRole);
    const fallbackColor = member.customRole === "Owner"
        ? "#e11d48"
        : member.customRole === "Creator"
            ? "#ec4899"
            : member.customRole === "Developer"
                ? "#0284c7"
                : "#059669";
    const bannerBg = member.bannerColor || fallbackColor;
    return (<div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/12 border-t-white/35 border-b-black/40 bg-[#090d19]/80 hover:bg-[#0d1424]/90 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(255,0,126,0.18),inset_0_1px_2px_rgba(255,255,255,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.4)]">
      
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100 z-10"/>

      <div>
        <div className="relative h-20 w-full overflow-hidden border-b border-white/10" style={{
            backgroundColor: bannerBg,
            backgroundImage: member.bannerUrl
                ? `url(${member.bannerUrl})`
                : `linear-gradient(135deg, ${bannerBg} 0%, rgba(10, 15, 30, 0.95) 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d19] via-black/25 to-transparent backdrop-blur-[1px]"/>
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"/>

          <div className="absolute top-2.5 right-2.5 z-20">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xl ${roleBadge.className}`}>
              <span>{roleBadge.icon}</span>
              <span>{roleBadge.label}</span>
            </span>
          </div>
        </div>

        <div className="relative px-5 pt-8 pb-4 z-20 flex flex-col items-center text-center">
          
          <div className="relative -mt-4 mb-3 inline-block">
            <div className="relative h-16 w-16">
              
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/30 bg-[#050914] shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                <img src={member.avatarUrl} alt={member.globalName || member.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"/>
              </div>

              {member.decorationUrl && (<img src={member.decorationUrl} alt="Avatar decoration" className="pointer-events-none absolute top-0 -left-[14%] w-[128%] h-[128%] max-w-none select-none z-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]" loading="lazy"/>)}

              <span className="absolute bottom-0.5 right-0.5 z-20 h-3.5 w-3.5 rounded-full border-2 border-[#090d19] bg-emerald-500 shadow-xs"/>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h3 className="font-heading text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              {member.globalName || member.name}
            </h3>
            {member.clanTag && (<span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300 shadow-xs">
                {member.clanBadgeUrl && (<img src={member.clanBadgeUrl} alt="" className="h-3 w-3 rounded-xs"/>)}
                {member.clanTag}
              </span>)}
          </div>

          <p className="font-mono text-xs text-white/50 mt-0.5 tracking-wide">
            @{member.username}
          </p>

          <p className="mt-2.5 text-xs text-white/75 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {member.bio ||
            (member.customRole === "Owner"
                ? m.team.owner_bio
                : member.customRole === "Creator"
                    ? m.team.creator_bio
                    : member.customRole === "Developer"
                        ? m.team.developer_bio
                        : m.team.handle_bio)}
          </p>
        </div>
      </div>

      <div className="relative px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 z-20">
        <button type="button" onClick={copyId} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50 hover:text-white transition-colors cursor-pointer" title={m.team.copy_discord_id}>
          <CustomIcon name="icon-copy" size={12} alt="Copy"/>
          <span>{copied ? m.team.copied : member.id}</span>
        </button>

        <a href={`https://discord.com/users/${member.id}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-white/20 border-t-white/45 bg-gradient-to-r from-pink-500/20 via-primary/20 to-cyan-500/20 hover:from-pink-500/35 hover:to-cyan-500/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl transition-all shadow-[0_2px_12px_rgba(255,0,126,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95">
          <span>Profile</span>
          <span className="text-[10px] text-pink-300 font-bold">↗</span>
        </a>
      </div>
    </div>);
}
