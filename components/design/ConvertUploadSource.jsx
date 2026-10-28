"use client";
import { useState } from "react";
const CILAAA_LOGO = "/asset/image/logo/logo.webp";
export default function ConvertUploadSource({ locale, messages, }) {
    const [fileName, setFileName] = useState(null);
    return (<div className="space-y-3">
      <label data-slot="label" className="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {" "}{messages.upload_mp3_file}{" "}
      </label>
      <div className="relative rounded-xl border border-dashed bg-background/60 transition-colors border-input">
        <input accept=".mp3,.wav,.m4a,.aac,.ogg,.opus,.flac,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/ogg,audio/flac" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)} aria-label={messages.upload_mp3_file}/>
        <div className="p-12 text-center">
          <div className="flex justify-center mb-4"><div className="rounded-full p-4 bg-muted"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload h-8 w-8 text-muted-foreground" aria-hidden="true">
            <path d="M12 3v12"></path>
            <path d="m17 8-5-5-5 5"></path>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          </svg></div></div>
          <p className="text-sm font-medium mb-1">{" "}{messages.drag_drop_your_mp3_file_here}{" "}</p>
          <p className="font-mono text-xs text-muted-foreground">{" "}{messages.or_click_to_browse_max_15mb}{" "}</p>
        </div>
      </div>
      {fileName ? (<div className="overflow-hidden rounded-xl border border-border bg-muted/20">
          <div className="relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <img src={CILAAA_LOGO} alt="CILAAA default cover" className="h-full w-auto object-contain px-6 py-4"/>
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground backdrop-blur">
              DEFAULT COVER
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span className="truncate font-mono text-[11px] text-muted-foreground">{fileName}</span>
          </div>
        </div>) : null}
    </div>);
}
