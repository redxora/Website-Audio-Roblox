"use client";
import React, { useState } from "react";
const sizeConfig = {
    xs: { box: "h-7 w-7", text: "text-[11px]", dotBox: "h-2.5 w-2.5 -bottom-0.5 -right-0.5 ring-[1.5px]" },
    sm: { box: "h-9 w-9", text: "text-xs", dotBox: "h-3 w-3 -bottom-0.5 -right-0.5 ring-2" },
    md: { box: "h-11 w-11", text: "text-sm", dotBox: "h-3.5 w-3.5 -bottom-0.5 -right-0.5 ring-2" },
    lg: { box: "h-16 w-16 sm:h-20 sm:w-20", text: "text-2xl", dotBox: "h-5 w-5 sm:h-6 sm:w-6 -bottom-1 -right-1 ring-[3.5px]" },
    xl: { box: "h-20 w-20 sm:h-24 sm:w-24", text: "text-3xl", dotBox: "h-6 w-6 sm:h-7 sm:w-7 -bottom-1 -right-1 ring-4" },
};
function DiscordStatusIcon({ status = "online", boxClass, }) {
    const baseWrapper = `absolute z-20 flex items-center justify-center rounded-full bg-[#0c0d14] ring-[#0c0d14] shadow-md select-none ${boxClass}`;
    if (status === "idle") {
        return (<span className={baseWrapper} title="Idle" aria-label="Idle">
        <svg viewBox="0 0 10 10" className="h-full w-full">
          <path fill="#f0b232" fillRule="evenodd" clipRule="evenodd" d="M8.7 6.3C7.6 6.7 6.4 6.4 5.5 5.5C4.6 4.6 4.3 3.4 4.7 2.3C3 2.7 1.7 4.2 1.7 6C1.7 8.2 3.5 10 5.7 10C7.5 10 9 8.7 9.4 7C9.2 6.7 8.9 6.5 8.7 6.3Z"/>
        </svg>
      </span>);
    }
    if (status === "dnd") {
        return (<span className={baseWrapper} title="Do Not Disturb" aria-label="Do Not Disturb">
        <svg viewBox="0 0 10 10" className="h-full w-full">
          <circle cx="5" cy="5" r="5" fill="#f23f43"/>
          <rect x="2" y="4" width="6" height="2" rx="0.8" fill="#ffffff"/>
        </svg>
      </span>);
    }
    if (status === "offline" || status === "invisible") {
        return (<span className={baseWrapper} title="Offline" aria-label="Offline">
        <svg viewBox="0 0 10 10" className="h-full w-full">
          <circle cx="5" cy="5" r="3.75" fill="none" stroke="#80848e" strokeWidth="2.5"/>
        </svg>
      </span>);
    }
    return (<span className={baseWrapper} title="Online" aria-label="Online">
      <span className="h-full w-full rounded-full bg-[#23a55a]"/>
    </span>);
}
export default function DiscordAvatar({ avatarUrl, avatarDecorationUrl, userName = "U", status = "online", showStatus = false, size = "md", className = "", ringClass = "ring-1 ring-border/80", }) {
    const [avatarError, setAvatarError] = useState(false);
    const [decError, setDecError] = useState(false);
    const cfg = sizeConfig[size] || sizeConfig.md;
    const initial = (userName || "U").trim().slice(0, 1).toUpperCase();
    const currentStatus = status || "online";
    return (<div className={`discord-avatar-wrapper relative inline-flex shrink-0 items-center justify-center select-none ${cfg.box} ${className}`} data-has-decoration={Boolean(avatarDecorationUrl && !decError)}>
      
      <div className={`relative h-full w-full overflow-hidden rounded-full ${ringClass} bg-card/80 backdrop-blur-md transition-transform duration-200`}>
        {avatarUrl && !avatarError ? (<img src={avatarUrl} alt={userName} onError={() => setAvatarError(true)} className="h-full w-full object-cover rounded-full" data-avatar-img="true"/>) : (<span className={`flex h-full w-full items-center justify-center rounded-full bg-muted/60 text-muted-foreground font-mono font-medium ${cfg.text}`}>
            {initial}
          </span>)}
      </div>

      {avatarDecorationUrl && !decError && (<img src={avatarDecorationUrl} alt="Avatar Decoration" aria-hidden="true" onError={() => setDecError(true)} className="discord-avatar-decoration" style={{
                position: "absolute",
                width: "124%",
                height: "124%",
                top: "-12%",
                left: "-12%",
                maxWidth: "none",
                maxHeight: "none",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 10,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.75))",
            }}/>)}

      {showStatus && (<DiscordStatusIcon status={currentStatus} boxClass={cfg.dotBox}/>)}
    </div>);
}
