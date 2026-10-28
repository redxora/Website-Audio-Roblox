"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { getMessages } from "@/lib/messages";
import notifyGlobal from "@/lib/notify";
import CustomIcon from "@/components/ui/CustomIcon";
import LiquidSelect from "@/components/ui/LiquidSelect";
import { WindowDots } from "@/components/ui/WindowDots";
import ModernDashboardSidebar, { DashboardMobileNavTrigger } from "@/components/dashboard/ModernDashboardSidebar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { computePeaks, normalizePeaks, } from "@audio-ui/core/analysis";
import { createSource } from "@audio-ui/react";
import { Timeline, TimelineLane, TimelineNavigator, TimelineViewport, } from "@/components/audio-ui/timeline";
import { Waveform, WaveformHover, AudioRangeSelection, } from "@/components/audio-ui/waveform";
import { renderEditedAudioBuffer, audioBufferToWav, audioBufferToMp3, } from "@/lib/audio-encoder";
const PEAK_COUNT = 4096;
const EMPTY_PEAKS = { max: new Float32Array(0), min: new Float32Array(0) };
const LABEL_STEPS = [1, 2, 5, 10, 15, 30, 60];
const MIN_LABEL_GAP_PX = 56;
function rulerLabels(duration, zoom) {
  const step = LABEL_STEPS.find((candidate) => candidate * zoom >= MIN_LABEL_GAP_PX) ??
    LABEL_STEPS.at(-1) ??
    1;
  const count = duration > 0 ? Math.floor(duration / step) + 1 : 0;
  return Array.from({ length: count }, (_, index) => index * step);
}
function followPlayhead(viewport, x) {
  if (!viewport)
    return;
  const margin = viewport.clientWidth * 0.1;
  const { clientWidth, scrollLeft } = viewport;
  if (x < scrollLeft || x > scrollLeft + clientWidth - margin) {
    viewport.scrollLeft = Math.max(0, x - margin);
  }
}
const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const EQ_LABELS = ["60", "170", "310", "600", "1k", "3k", "6k", "12k", "14k", "16k"];
const EQ_PRESETS = {
  Default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Classic: [0, 0, 0, 0, 0, 0, -2, -2, -2, -4],
  Dance: [4, 3, 1, 0, 0, -1, 2, 3, 4, 3],
  Club: [0, 0, 2, 3, 3, 3, 2, 0, 0, 0],
  "Full bass": [6, 5, 5, 3, 1, 0, -2, -4, -6, -8],
  "Full bass treble": [5, 4, 0, -3, -2, 1, 4, 6, 7, 7],
  "Full treble": [-6, -6, -4, -1, 1, 3, 6, 8, 9, 9],
  "Vocal Boost": [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0],
  "Acoustic": [3, 2, 1, 0, 1, 2, 3, 4, 3, 2],
  "Pop": [-1, 1, 3, 4, 4, 3, 1, 0, 1, 2],
  "Rock": [5, 3, 2, 0, -1, 1, 3, 4, 5, 5],
  "Electronic": [4, 3, 1, 0, -1, 2, 1, 3, 4, 4],
  "Senna": [-3, 2, 4, 3, 1, -1, -3, -5, -7, -9],
  "Podcast / Voice": [-4, -2, 1, 3, 4, 4, 3, 1, -1, -3],
  "Flat / Reset": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
const EXTRA_PRESET_NAMES = [
  "Vocal Boost",
  "Acoustic",
  "Pop",
  "Rock",
  "Electronic",
  "Senna",
  "Podcast / Voice",
  "Flat / Reset",
];
const generateDefaultPeaks = (count = 280) => {
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let envelope = 0.72;
    if (t < 0.03) {
      envelope = (t / 0.03) * 0.65;
    }
    else if (t >= 0.52 && t <= 0.57) {
      const dipDist = Math.abs(t - 0.545) / 0.025;
      envelope = 0.12 + Math.min(1, dipDist) * 0.38;
    }
    else if (t > 0.57 && t < 0.94) {
      envelope = 0.84;
    }
    else if (t >= 0.94) {
      envelope = Math.max(0.04, (1 - (t - 0.94) / 0.06) * 0.84);
    }
    const beat = Math.abs(Math.sin(i * 0.75)) * 0.22;
    const transient = (i % 7 === 0 || i % 11 === 0) ? 0.16 : 0;
    const harmonic = (Math.sin(i * 2.8) * 0.5 + Math.cos(i * 5.4) * 0.5) * 0.14;
    const val = Math.max(0.08, Math.min(0.98, (envelope + beat + transient + harmonic) * 0.92));
    peaks.push(val);
  }
  return peaks;
};
const extractPeaksFromBuffer = (buffer, count = 280) => {
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / count);
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const start = i * step;
    let max = 0;
    const subStep = Math.max(1, Math.floor(step / 20));
    for (let j = 0; j < step; j += subStep) {
      const val = Math.abs(data[start + j] || 0);
      if (val > max)
        max = val;
    }
    peaks.push(Math.max(0.06, Math.min(0.98, max * 1.5)));
  }
  return peaks;
};
const VerticalEqSlider = ({ label, gain, onChange }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const updateGainFromY = useCallback((clientY) => {
    if (!trackRef.current)
      return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, 1 - offsetY / rect.height));
    const newGain = Math.round(ratio * 24 - 12);
    onChange(newGain);
  }, [onChange]);
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updateGainFromY(e.clientY);
    const onMouseMove = (moveEvent) => {
      updateGainFromY(moveEvent.clientY);
    };
    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  const handleTouchStart = (e) => {
    setIsDragging(true);
    if (e.touches[0])
      updateGainFromY(e.touches[0].clientY);
  };
  const handleTouchMove = (e) => {
    if (e.touches[0])
      updateGainFromY(e.touches[0].clientY);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  const percent = Math.max(0, Math.min(100, ((gain + 12) / 24) * 100));
  return (<div className="eq-slider-col" style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: "1 1 0%",
    userSelect: "none",
    padding: "4px 2px",
  }}>
    <span className="eq-slider-value" style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      fontWeight: 700,
      color: "#38bdf8",
      marginBottom: "12px",
      height: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
    }}>
      {gain > 0 ? `+${gain}` : gain}
    </span>
    <div ref={trackRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="eq-slider-track-wrap" style={{
      position: "relative",
      height: "120px",
      minHeight: "120px",
      width: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      touchAction: "none",
    }}>
      <div className="eq-slider-track-line" style={{
        width: "3px",
        height: "100%",
        minHeight: "100%",
        backgroundColor: "#162032",
        borderRadius: "9999px",
        position: "relative",
      }} />

      <div className="eq-slider-thumb-knob" style={{
        position: "absolute",
        left: "50%",
        top: `${100 - percent}%`,
        transform: "translate(-50%, -50%)",
        width: "18px",
        height: "18px",
        borderRadius: "9999px",
        backgroundColor: "#4ba3e3",
        boxShadow: isDragging
          ? "0 0 16px rgba(75, 163, 227, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.6)"
          : "0 0 10px rgba(75, 163, 227, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
        border: "1.5px solid #93c5fd",
        pointerEvents: "none",
        zIndex: 10,
        transition: isDragging ? "none" : "top 0.08s ease-out, transform 0.15s ease",
      }} />
    </div>

    {/* Bottom Frequency Label (Slate text, matching Photo 2) */}
    <span className="eq-slider-label" style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      fontWeight: 600,
      color: "#94a3b8",
      marginTop: "12px",
      height: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
    }}>
      {label}
    </span>
  </div>);
};
export default function AudioStudio({ locale, userName = "Guest", avatarUrl, roleName = "Guest", roleColor = null, plan, isAuthenticated = false, isMember = false, robloxAccount, quota, }) {
  const m = getMessages(locale);
  const [workflowState, setWorkflowState] = useState("empty");
  const [loadProgress, setLoadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState("volume");
  const [cutMode, setCutMode] = useState("keep");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isLoopSelection, setIsLoopSelection] = useState(true);
  const [isPlayingSelection, setIsPlayingSelection] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(null);
  const [isCutFlashing, setIsCutFlashing] = useState(false);
  const canvasRef = useRef(null);
  const [waveformPeaks, setWaveformPeaks] = useState([]);
  const [position] = useState(() => createSource(0));
  const [peaks, setPeaks] = useState(null);
  const [zoomPx, setZoomPx] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const timelineFrameRef = useRef(null);
  const viewportRef = useRef(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeInSec, setFadeInSec] = useState(3);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeOutSec, setFadeOutSec] = useState(3);
  const [volumePercent, setVolumePercent] = useState(100);
  const [speedVal, setSpeedVal] = useState(1.0);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [activePreset, setActivePreset] = useState("Default");
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [isMorePresetsOpen, setIsMorePresetsOpen] = useState(false);
  const [isRenderingAudio, setIsRenderingAudio] = useState(false);
  const fitPx = containerWidth > 0 && duration > 0 ? containerWidth / duration : 0;
  const zoom = Math.max(zoomPx ?? fitPx, fitPx);
  const zoomed = fitPx > 0 && zoom > fitPx * 1.001;
  const zoomIn = useCallback(() => {
    setZoomPx((prev) => Math.min(fitPx * 16, (prev ?? fitPx) * 1.5));
  }, [fitPx]);
  const zoomOut = useCallback(() => {
    setZoomPx((prev) => Math.max(fitPx, (prev ?? fitPx) / 1.5));
  }, [fitPx]);
  const resetZoom = useCallback(() => {
    setZoomPx(null);
  }, []);
  useEffect(() => {
    const frame = timelineFrameRef.current;
    if (!frame)
      return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry?.contentRect.width ?? 0);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const [exportFormat, setExportFormat] = useState("WAV");
  const [isUploadingRoblox, setIsUploadingRoblox] = useState(false);
  const [uploadRobloxProgress, setUploadRobloxProgress] = useState(0);
  const [liveQuota, setLiveQuota] = useState(quota ?? null);
  const isUnlimited = Boolean(liveQuota?.limit === null ||
    plan?.dailyLimit === null ||
    plan?.name === "lifetime" ||
    roleName.includes("OWNER") ||
    roleName.includes("ADMIN") ||
    roleName.includes("STAF"));
  const dailyLimit = isUnlimited ? null : (liveQuota?.limit ?? plan?.dailyLimit ?? 3);
  const usedCount = liveQuota?.used ?? 0;
  const remainingCount = isUnlimited
    ? null
    : (liveQuota?.remaining ?? Math.max(0, (dailyLimit ?? 3) - usedCount));
  useEffect(() => {
    if (quota)
      setLiveQuota(quota);
  }, [quota]);
  const refreshQuota = async () => {
    try {
      const res = await fetch("/api/account/entitlement", { cache: "no-store" });
      if (!res.ok)
        return;
      const data = await res.json();
      setLiveQuota({
        limit: data.dailyLimit ?? null,
        used: data.conversionsToday ?? 0,
        remaining: data.dailyRemaining ?? null,
      });
    }
    catch { }
  };
  const [isDragOver, setIsDragOver] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const fileInputRef = useRef(null);
  const waveformRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodesRef = useRef([]);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const rafRef = useRef(null);
  const showToast = (msg, tone = "info") => {
    notifyGlobal({
      tone,
      title: "Audio Studio",
      description: msg,
    });
  };
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0)
      secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };
  const generateSynthBuffer = useCallback((ctx, totalSecs) => {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(1, totalSecs));
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const ch0 = buffer.getChannelData(0);
    const ch1 = buffer.getChannelData(1);
    const cycleLen = sampleRate * 2;
    const cycle = new Float32Array(cycleLen);
    for (let i = 0; i < cycleLen; i++) {
      const t = i / sampleRate;
      const bass = Math.sin(2 * Math.PI * 130.81 * t) * 0.25;
      const lead = Math.sin(2 * Math.PI * 261.63 * t) * 0.18;
      const fifth = Math.sin(2 * Math.PI * 392.00 * t) * 0.12;
      cycle[i] = (bass + lead + fifth) * 0.45;
    }
    for (let offset = 0; offset < length; offset += cycleLen) {
      const copyLen = Math.min(cycleLen, length - offset);
      ch0.set(cycle.subarray(0, copyLen), offset);
      ch1.set(cycle.subarray(0, copyLen), offset);
    }
    return buffer;
  }, []);
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const gainNode = ctx.createGain();
      gainNode.gain.value = volumePercent / 100;
      gainNodeRef.current = gainNode;
      const filters = [];
      EQ_FREQUENCIES.forEach((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        if (idx === 0) {
          filter.type = "lowshelf";
        }
        else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = "highshelf";
        }
        else {
          filter.type = "peaking";
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains[idx] || 0;
        filters.push(filter);
      });
      filterNodesRef.current = filters;
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(gainNode);
      gainNode.connect(ctx.destination);
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, [volumePercent, eqGains]);
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volumePercent / 100, audioContextRef.current.currentTime, 0.05);
    }
  }, [volumePercent]);
  useEffect(() => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.playbackRate.setTargetAtTime(speedVal, audioContextRef.current.currentTime, 0.05);
      sourceNodeRef.current.detune.setTargetAtTime(pitchSemitones * 100, audioContextRef.current.currentTime, 0.05);
    }
  }, [speedVal, pitchSemitones]);
  useEffect(() => {
    if (filterNodesRef.current.length && audioContextRef.current) {
      filterNodesRef.current.forEach((filter, idx) => {
        filter.gain.setTargetAtTime(eqGains[idx] || 0, audioContextRef.current.currentTime, 0.05);
      });
    }
  }, [eqGains]);
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      }
      catch (_) { }
      sourceNodeRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPlaying(false);
    setIsPlayingSelection(false);
  }, []);
  const startPlaybackAt = useCallback((offsetSec, playSelectionMode = false) => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      }
      catch (_) { }
      sourceNodeRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    let buffer = audioBufferRef.current;
    if (!buffer) {
      buffer = generateSynthBuffer(ctx, duration || 306.6);
      audioBufferRef.current = buffer;
    }
    const activeDuration = duration || buffer.duration || 1;
    let targetOffset = Math.max(0, Math.min(offsetSec, activeDuration));
    if (playSelectionMode) {
      if (targetOffset < trimStart || targetOffset >= trimEnd) {
        targetOffset = trimStart;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speedVal;
    source.detune.value = pitchSemitones * 100;
    source.loop = false;
    if (filterNodesRef.current.length > 0) {
      source.connect(filterNodesRef.current[0]);
    }
    else if (gainNodeRef.current) {
      source.connect(gainNodeRef.current);
    }
    else {
      source.connect(ctx.destination);
    }
    const startCtxTime = ctx.currentTime;
    startTimeRef.current = startCtxTime - targetOffset / speedVal;
    source.start(0, targetOffset);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    setIsPlayingSelection(playSelectionMode);
    setCurrentTime(targetOffset);
    position.set(targetOffset);
    const updateLoop = () => {
      if (!audioContextRef.current || !sourceNodeRef.current)
        return;
      const currentCtxTime = audioContextRef.current.currentTime;
      const elapsed = (currentCtxTime - startTimeRef.current) * speedVal;
      const currentPos = elapsed;
      const effectiveEnd = playSelectionMode ? trimEnd : activeDuration;
      if (currentPos >= effectiveEnd) {
        if (isLoopSelection) {
          const loopTarget = playSelectionMode ? trimStart : 0;
          startPlaybackAt(loopTarget, playSelectionMode);
          return;
        }
        else {
          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.stop();
            }
            catch (_) { }
            sourceNodeRef.current = null;
          }
          setIsPlaying(false);
          setIsPlayingSelection(false);
          const resetPos = playSelectionMode ? trimStart : 0;
          setCurrentTime(resetPos);
          position.set(resetPos);
          return;
        }
      }
      setCurrentTime(currentPos);
      position.set(currentPos);
      if (zoomed) {
        followPlayhead(viewportRef.current, currentPos * zoom);
      }
      rafRef.current = requestAnimationFrame(updateLoop);
    };
    rafRef.current = requestAnimationFrame(updateLoop);
  }, [cutMode, duration, generateSynthBuffer, getAudioContext, isLoopSelection, pitchSemitones, position, speedVal, trimEnd, trimStart, zoom, zoomed]);
  const handleSeek = useCallback((targetSec) => {
    const safeSec = Math.max(0, Math.min(targetSec, duration));
    setCurrentTime(safeSec);
    position.set(safeSec);
    if (isPlaying) {
      startPlaybackAt(safeSec, isPlayingSelection);
    }
  }, [duration, isPlaying, isPlayingSelection, position, startPlaybackAt]);
  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    }
    else {
      startPlaybackAt(currentTime, false);
    }
  };
  const handlePlaySelection = () => {
    if (isPlaying && isPlayingSelection) {
      stopPlayback();
    }
    else {
      startPlaybackAt(trimStart, true);
    }
  };
  const handleSetStart = () => {
    const safeSec = Math.max(0, Math.min(currentTime, duration));
    if (safeSec >= trimEnd) {
      const newEnd = Math.min(duration, safeSec + 1);
      setTrimEnd(Number(newEnd.toFixed(1)));
    }
    setTrimStart(Number(safeSec.toFixed(1)));
    showToast(`Selection start set to ${formatTime(safeSec)}`);
  };
  const handleSetEnd = () => {
    const safeSec = Math.max(0, Math.min(currentTime, duration));
    if (safeSec <= trimStart) {
      const newStart = Math.max(0, safeSec - 1);
      setTrimStart(Number(newStart.toFixed(1)));
    }
    setTrimEnd(Number(safeSec.toFixed(1)));
    showToast(`Selection end set to ${formatTime(safeSec)}`);
  };
  const handleResetSelection = () => {
    setTrimStart(0);
    setTrimEnd(duration || 306.6);
    showToast("Selection reset to full song");
  };
  const handleToggleLoop = () => {
    setIsLoopSelection((prev) => {
      const next = !prev;
      showToast(next ? "Loop selection enabled" : "Loop selection disabled");
      return next;
    });
  };
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        }
        catch (_) { }
      }
      if (rafRef.current)
        cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        }
        catch (_) { }
      }
    };
  }, []);
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 135;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    const centerY = height / 2;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#00f2fe");
    gradient.addColorStop(0.32, "#00d2ff");
    gradient.addColorStop(0.5, "#10b981");
    gradient.addColorStop(0.68, "#00d2ff");
    gradient.addColorStop(1, "#00f2fe");
    ctx.fillStyle = gradient;
    const count = waveformPeaks.length;
    const barSpacing = width / count;
    const barWidth = Math.max(1.2, barSpacing * 0.85);
    for (let i = 0; i < count; i++) {
      const x = i * barSpacing;
      const amp = waveformPeaks[i] || 0.1;
      const barH = Math.max(2, amp * (height * 0.44));
      ctx.fillRect(x, centerY - barH, barWidth, barH * 2);
    }
    ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.restore();
  }, [waveformPeaks]);
  useEffect(() => {
    drawWaveform();
    const handleResize = () => drawWaveform();
    window.addEventListener("resize", handleResize);
    let ro = null;
    if (waveformRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        drawWaveform();
      });
      ro.observe(waveformRef.current);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro)
        ro.disconnect();
    };
  }, [drawWaveform, activeMode, workflowState]);
  useEffect(() => {
    if (!isDraggingHandle)
      return;
    const handleGlobalMouseMove = (e) => {
      if (!waveformRef.current)
        return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rect = waveformRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetSec = Number((ratio * duration).toFixed(1));
      if (isDraggingHandle === "start") {
        setTrimStart(Math.max(0, Math.min(targetSec, trimEnd - 0.5)));
      }
      else if (isDraggingHandle === "end") {
        setTrimEnd(Math.min(duration, Math.max(targetSec, trimStart + 0.5)));
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDraggingHandle(null);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalMouseMove);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalMouseMove);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isDraggingHandle, duration, trimEnd, trimStart]);
  const handleLoadClick = () => {
    if (workflowState !== "selected")
      return;
    setWorkflowState("loading");
    setLoadProgress(0);
    let curr = 0;
    const interval = setInterval(() => {
      curr += Math.floor(Math.random() * 16) + 12;
      if (curr >= 100) {
        curr = 100;
        clearInterval(interval);
        setLoadProgress(100);
        setTimeout(() => {
          setWorkflowState("ready");
          setCurrentTime(0);
          setTrimStart(0);
          setTrimEnd(duration || audioBufferRef.current?.duration || 0);
        }, 250);
      }
      else {
        setLoadProgress(curr);
      }
    }, 100);
  };
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      loadChosenFile(dropped);
    }
  };
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      loadChosenFile(selected);
    }
  };
  const loadChosenFile = (f) => {
    setFileName(f.name);
    setFileSizeMb(Number((f.size / (1024 * 1024)).toFixed(1)));
    setWorkflowState("selected");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arrayBuffer = ev.target?.result;
        const ctx = getAudioContext();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        audioBufferRef.current = decoded;
        const d = Number(decoded.duration.toFixed(1));
        setDuration(d);
        setTrimStart(0);
        setTrimEnd(d);
        setCurrentTime(0);
        position.set(0);
        const channels = Array.from({ length: decoded.numberOfChannels }, (_, c) => decoded.getChannelData(c));
        setPeaks(normalizePeaks(computePeaks(channels, PEAK_COUNT)));
        setWaveformPeaks(extractPeaksFromBuffer(decoded, 280));
      }
      catch (_) {
        setDuration(306.6);
        setTrimStart(0);
        setTrimEnd(306.6);
        setCurrentTime(0);
        position.set(0);
        setWaveformPeaks(generateDefaultPeaks(280));
      }
    };
    reader.readAsArrayBuffer(f);
  };
  const loadDemo = () => {
    setFileName("anu - Copy.mp3");
    setFileSizeMb(4.3);
    const d = 306.6;
    setDuration(d);
    setTrimStart(10.5);
    setTrimEnd(107.3);
    setCurrentTime(10.5);
    position.set(10.5);
    const ctx = getAudioContext();
    const synth = generateSynthBuffer(ctx, d);
    audioBufferRef.current = synth;
    const channels = [synth.getChannelData(0), synth.getChannelData(1)];
    setPeaks(normalizePeaks(computePeaks(channels, PEAK_COUNT)));
    setWaveformPeaks(generateDefaultPeaks(280));
    setWorkflowState("ready");
    setActiveMode("volume");
  };
  const handleResetAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      }
      catch (_) { }
      sourceNodeRef.current = null;
    }
    if (rafRef.current)
      cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
    setWorkflowState("empty");
    setFileName("");
    setFileSizeMb(0);
    setDuration(0);
    setCurrentTime(0);
    position.set(0);
    setTrimStart(0);
    setTrimEnd(0);
    setPeaks(null);
    setWaveformPeaks([]);
    setZoomPx(null);
    audioBufferRef.current = null;
    if (fileInputRef.current)
      fileInputRef.current.value = "";
  };
  const selectPreset = (name) => {
    setActivePreset(name);
    if (EQ_PRESETS[name]) {
      setEqGains([...EQ_PRESETS[name]]);
    }
  };
  const handleEqGainChange = (index, val) => {
    setActivePreset("Custom");
    setEqGains((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const applyCutToWaveform = (modeOverride) => {
    const effectiveMode = modeOverride || cutMode || "remove";
    if (!duration || duration <= 0) {
      showToast("Silakan muat file audio terlebih dahulu.", "destructive");
      return;
    }
    const rangeLength = trimEnd - trimStart;
    if (rangeLength <= 0.05) {
      showToast(effectiveMode === "keep"
        ? "Tentukan rentang seleksi pada waveform untuk dipangkas (Trim)."
        : "Tentukan rentang seleksi pada waveform untuk dipotong (Cut).", "info");
      return;
    }
    if (effectiveMode === "remove" && trimStart <= 0.05 && trimEnd >= duration - 0.05) {
      showToast("Tidak bisa memotong seluruh audio. Silakan pilih bagian tertentu.", "warning");
      return;
    }
    setIsCutFlashing(true);
    setTimeout(() => setIsCutFlashing(false), 800);
    if (isPlaying && sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      }
      catch (_) { }
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
    const ctx = getAudioContext();
    const oldBuffer = audioBufferRef.current || generateSynthBuffer(ctx, duration);
    try {
      const sampleRate = oldBuffer.sampleRate;
      const numChannels = oldBuffer.numberOfChannels;
      if (effectiveMode === "keep") {
        const startSample = Math.max(0, Math.floor(trimStart * sampleRate));
        const endSample = Math.min(oldBuffer.length, Math.floor(trimEnd * sampleRate));
        const newLength = Math.max(sampleRate, endSample - startSample);
        const newBuffer = ctx.createBuffer(numChannels, newLength, sampleRate);
        for (let ch = 0; ch < numChannels; ch++) {
          const oldData = oldBuffer.getChannelData(ch);
          const newData = newBuffer.getChannelData(ch);
          for (let i = 0; i < newLength; i++) {
            newData[i] = oldData[startSample + i] || 0;
          }
        }
        audioBufferRef.current = newBuffer;
        const newDuration = Number((newLength / sampleRate).toFixed(1));
        setDuration(newDuration);
        const chs = Array.from({ length: newBuffer.numberOfChannels }, (_, c) => newBuffer.getChannelData(c));
        setPeaks(normalizePeaks(computePeaks(chs, PEAK_COUNT)));
        setWaveformPeaks((prev) => {
          const startIndex = Math.floor((trimStart / duration) * prev.length);
          const endIndex = Math.ceil((trimEnd / duration) * prev.length);
          const sliced = prev.slice(startIndex, endIndex);
          if (sliced.length === 0)
            return generateDefaultPeaks(280);
          const resampled = [];
          for (let i = 0; i < 280; i++) {
            const idx = Math.floor((i / 280) * sliced.length);
            resampled.push(sliced[idx] || 0.5);
          }
          return resampled;
        });
        setTrimStart(0);
        setTrimEnd(newDuration);
        setCurrentTime(0);
        position.set(0);
        showToast(`Audio berhasil dipangkas (Trim)! Durasi baru: ${formatTime(newDuration)}`, "success");
      }
      else {
        const startSample = Math.max(0, Math.floor(trimStart * sampleRate));
        const endSample = Math.min(oldBuffer.length, Math.floor(trimEnd * sampleRate));
        const removeCount = endSample - startSample;
        const newLength = Math.max(sampleRate, oldBuffer.length - removeCount);
        const newBuffer = ctx.createBuffer(numChannels, newLength, sampleRate);
        for (let ch = 0; ch < numChannels; ch++) {
          const oldData = oldBuffer.getChannelData(ch);
          const newData = newBuffer.getChannelData(ch);
          for (let i = 0; i < startSample; i++) {
            newData[i] = oldData[i] || 0;
          }
          for (let i = endSample; i < oldBuffer.length; i++) {
            newData[startSample + (i - endSample)] = oldData[i] || 0;
          }
        }
        audioBufferRef.current = newBuffer;
        const newDuration = Number((newLength / sampleRate).toFixed(1));
        setDuration(newDuration);
        const chs = Array.from({ length: newBuffer.numberOfChannels }, (_, c) => newBuffer.getChannelData(c));
        setPeaks(normalizePeaks(computePeaks(chs, PEAK_COUNT)));
        setWaveformPeaks((prev) => {
          const startIndex = Math.floor((trimStart / duration) * prev.length);
          const endIndex = Math.ceil((trimEnd / duration) * prev.length);
          const spliced = [...prev.slice(0, startIndex), ...prev.slice(endIndex)];
          if (spliced.length === 0)
            return generateDefaultPeaks(280);
          const resampled = [];
          for (let i = 0; i < 280; i++) {
            const idx = Math.floor((i / 280) * spliced.length);
            resampled.push(spliced[idx] || 0.5);
          }
          return resampled;
        });
        setTrimStart(0);
        setTrimEnd(newDuration);
        setCurrentTime(0);
        position.set(0);
        showToast(`Bagian yang dipilih berhasil dipotong! Durasi baru: ${formatTime(newDuration)}`, "success");
      }
    }
    catch (_) {
      const newDuration = effectiveMode === "keep"
        ? Math.max(1, Number((trimEnd - trimStart).toFixed(1)))
        : Math.max(1, Number((duration - (trimEnd - trimStart)).toFixed(1)));
      setDuration(newDuration);
      setTrimStart(0);
      setTrimEnd(newDuration);
      setCurrentTime(0);
      position.set(0);
      showToast("Potongan audio berhasil diterapkan ke waveform!", "success");
    }
  };
  const handleSaveAudio = async () => {
    if (isRenderingAudio)
      return;
    setIsRenderingAudio(true);
    showToast("Menerapkan setingan & me-render audio asli...");
    try {
      const ctx = getAudioContext();
      const buffer = audioBufferRef.current || generateSynthBuffer(ctx, duration);
      const start = Math.max(0, trimStart);
      const end = Math.min(buffer.duration, trimEnd > trimStart ? trimEnd : buffer.duration);
      const renderedBuffer = await renderEditedAudioBuffer({
        inputBuffer: buffer,
        startTime: start,
        endTime: end,
        speedVal: speedVal || 1,
        pitchSemitones: pitchSemitones || 0,
        volumePercent: volumePercent ?? 100,
        eqGains: eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        fadeIn: Boolean(fadeIn),
        fadeInSec: fadeInSec || 0,
        fadeOut: Boolean(fadeOut),
        fadeOutSec: fadeOutSec || 0,
      });
      let blob;
      let ext;
      if (exportFormat === "MP3") {
        blob = await audioBufferToMp3(renderedBuffer, 0, renderedBuffer.duration);
        ext = "mp3";
      }
      else {
        blob = await audioBufferToWav(renderedBuffer, 0, renderedBuffer.duration);
        ext = "wav";
      }
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const outName = `${fileName.replace(/\.[^/.]+$/, "")}_Mastered.${ext}`;
      link.href = downloadUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      const newItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: fileName.replace(/\.[^/.]+$/, "") + `_Mastered.${exportFormat.toLowerCase()}`,
        sizeMb: Number((blob.size / (1024 * 1024)).toFixed(2)) || 2.4,
        duration: formatTime(renderedBuffer.duration),
        format: exportFormat,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistoryItems((prev) => [newItem, ...prev]);
      showToast(`File ${newItem.name} berhasil di-render dan di-download!`, "success");
    }
    catch (err) {
      console.error("Gagal merender dan menyimpan audio:", err);
      showToast("Gagal menyimpan audio: " + (err?.message || "Error"), "destructive");
    }
    finally {
      setIsRenderingAudio(false);
    }
  };
  const handleUploadRoblox = async () => {
    if (isUploadingRoblox || isRenderingAudio)
      return;
    if (!isAuthenticated) {
      showToast(m.audioStudio.toast_discord_required);
      return;
    }
    if (!robloxAccount) {
      showToast(m.audioStudio.toast_roblox_required);
      return;
    }
    setIsUploadingRoblox(true);
    setUploadRobloxProgress(10);
    showToast("Menerapkan setingan & me-render audio asli untuk Roblox...");
    try {
      const { getClientSessionUser } = await import("@/lib/auth/client");
      const user = await getClientSessionUser(true);
      if (!user)
        throw new Error("Not authenticated");
      const ctx = getAudioContext();
      const buffer = audioBufferRef.current || generateSynthBuffer(ctx, duration);
      const start = Math.max(0, trimStart);
      const end = Math.min(buffer.duration, trimEnd > trimStart ? trimEnd : buffer.duration);
      const renderedBuffer = await renderEditedAudioBuffer({
        inputBuffer: buffer,
        startTime: start,
        endTime: end,
        speedVal: speedVal || 1,
        pitchSemitones: pitchSemitones || 0,
        volumePercent: volumePercent ?? 100,
        eqGains: eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        fadeIn: Boolean(fadeIn),
        fadeInSec: fadeInSec || 0,
        fadeOut: Boolean(fadeOut),
        fadeOutSec: fadeOutSec || 0,
      });
      const wavBlob = await audioBufferToWav(renderedBuffer, 0, renderedBuffer.duration);
      const outName = `${(fileName || "audio").replace(/\.[^/.]+$/, "")}_Mastered.wav`;
      setUploadRobloxProgress(35);
      const storagePath = `${user.id}/studio-${crypto.randomUUID()}-${outName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const uploadRes = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "x-file-path": storagePath, "Content-Type": "audio/wav" },
        body: wavBlob,
      });
      if (!uploadRes.ok)
        throw new Error("Failed to upload audio to storage");
      setUploadRobloxProgress(55);
      const convRes = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath,
          outputName: outName,
          originalName: fileName || "audio",
          bytes: wavBlob.size,
          durationSeconds: Number(renderedBuffer.duration.toFixed(3)),
          speed: speedVal || 1,
        }),
      });
      const convData = await convRes.json().catch(() => ({}));
      if (!convRes.ok)
        throw new Error(convData.error || "Failed to record conversion");
      await refreshQuota();
      setUploadRobloxProgress(75);
      const robloxRes = await fetch("/api/roblox/upload-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath }),
      });
      const robloxData = await robloxRes.json().catch(() => ({}));
      if (!robloxRes.ok)
        throw new Error(robloxData.error || "Roblox rejected the upload");
      setUploadRobloxProgress(100);
      if (robloxData.assetId) {
        showToast(m.audioStudio.toast_roblox_uploaded.replace("{assetId}", robloxData.assetId), "success");
        setHistoryItems((prev) => prev.map((it) => it.id === historyItems[0]?.id ? { ...it, robloxAssetId: `rbxassetid://${robloxData.assetId}` } : it));
      }
      else {
        showToast(m.audioStudio.toast_roblox_processing);
      }
      window.dispatchEvent(new CustomEvent("cilaaa:refresh-conversions"));
    }
    catch (err) {
      console.error("Studio upload failed:", err);
      showToast(err instanceof Error ? err.message : m.audioStudio.err_upload_failed, "destructive");
    }
    finally {
      setTimeout(() => {
        setIsUploadingRoblox(false);
        setUploadRobloxProgress(0);
      }, 600);
    }
  };
  const handleWaveformMouseDown = (e) => {
    if (!waveformRef.current)
      return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSec = ratio * duration;
    const startPx = (trimStart / duration) * rect.width;
    const endPx = (trimEnd / duration) * rect.width;
    if (Math.abs(clickX - startPx) < 18) {
      setIsDraggingHandle("start");
    }
    else if (Math.abs(clickX - endPx) < 18) {
      setIsDraggingHandle("end");
    }
    else {
      setCurrentTime(targetSec);
      if (isPlaying && audioContextRef.current) {
        startTimeRef.current = audioContextRef.current.currentTime - targetSec / speedVal;
      }
    }
  };
  const showUploadingArea = isUploadingRoblox;
  const ready = (peaks !== null || waveformPeaks.length > 0) && duration > 0;
  const labels = rulerLabels(duration, zoom);
  return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" suppressHydrationWarning>
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DashboardMobileNavTrigger />
              <img alt={m.audioStudio.cilaaa_community} width="32" height="32" decoding="async" data-nimg="1" className="h-7 w-7" srcSet="/asset/image/logo/logo.png 1x, /asset/image/logo/logo.png 2x" src="/asset/image/logo/logo.png" style={{ color: "transparent" }} />
              <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
                {" "}{m.audioStudio.cilaaa_community}{" "}
              </span>
              <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
                <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"></span>
                {" "}{m.audioStudio.console}{" "}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher locale={locale} />
              <button data-slot="dropdown-menu-trigger" data-variant="ghost" data-size="default" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 px-4 py-2 has-[>svg]:px-3 relative h-9 w-9 rounded-full" type="button" id="radix-_r_studio_en_" aria-haspopup="menu" aria-expanded="false" data-state="closed" data-action="account-menu">
                <span data-slot="avatar" data-size="default" className="group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6 h-9 w-9 border border-border">
                  {avatarUrl ? (<img src={avatarUrl} alt={userName} className="h-full w-full object-cover rounded-full" data-avatar-img="true" />) : (<span data-slot="avatar-fallback" className="bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs">
                    {(userName || "U").slice(0, 1).toUpperCase()}
                  </span>)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
        <ModernDashboardSidebar currentRoute="studio" locale={locale} userName={userName} avatarUrl={avatarUrl} planLabel={plan?.name} />

        <div className="min-w-0 flex-1">
          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">


            <div className="space-y-7" suppressHydrationWarning>
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="font-mono text-[11px] tracking-widest text-primary">{" "}{m.audioStudio.n03_studio}{" "}</p>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">

                      {m.audioStudio.audio_studio}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94a3b8] font-medium">

                      {m.audioStudio.trim_remix_eq_master_your_audio_like_a_p}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.12)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (<img src={avatarUrl} alt={userName} className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-[0_0_15px_rgba(255,255,255,0.1)]" />) : (<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 font-bold text-white">
                          {userName.charAt(0).toUpperCase()}
                        </div>)}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{userName}</span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm border border-white/15" style={{
                              backgroundColor: roleColor ? `${roleColor}25` : "rgba(255,255,255,0.08)",
                              color: roleColor || "#38bdf8",
                              borderColor: roleColor ? `${roleColor}50` : "rgba(255,255,255,0.2)",
                            }}>
                              {roleName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

                              {m.audioStudio.real_time}
                            </span>
                          </div>
                          <p className="text-xs text-[#94a3b8] mt-0.5">
                            {isUnlimited
                              ? m.audioStudio.unlimited_access_to_all_audio_tools_conv
                              : `Daily Limit: ${dailyLimit} conversions • Used: ${usedCount}/${dailyLimit}`}
                          </p>                          </div>
                      </div>
                      <div className="flex items-center gap-3 sm:ml-auto">
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-mono tracking-wider text-[#94a3b8]">

                            {m.audioStudio.remaining_daily_quota}
                          </p>
                          <p className="text-sm font-extrabold font-mono text-cyan-300">
                            {isUnlimited
                              ? m.audioStudio.unlimited
                              : `${remainingCount} / ${dailyLimit}`}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                      </div>
                    </div>
                  </div>

                  {workflowState !== "ready" ? (<div className="liquid-frame rounded-2xl border border-white/16 border-t-white/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25)]">
                    <div className="mb-4 flex items-center gap-2">
                      <WindowDots />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">

                        {m.audioStudio.upload_audio_file}
                      </span>
                    </div>

                    <div onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }} onDragLeave={() => setIsDragOver(false)} onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()} className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition-all p-6 text-center ${isDragOver
                      ? "border-[#38bdf8] bg-blue-500/10 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                      : workflowState === "selected" || workflowState === "loading"
                        ? "border-white/20 bg-white/[0.02]"
                        : "border-[#1e293b] hover:border-[#38bdf8]/40 hover:bg-white/[0.01]"}`}>
                      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>

                      {workflowState === "empty" ? (<>
                        <p className="text-sm font-semibold text-white">

                          {m.audioStudio.drag_drop_your_audio_file_here}
                        </p>
                        <p className="mt-1 text-xs text-[#64748b]">

                          {m.audioStudio.mp3_wav_ogg_m4a_max_100mb}
                        </p>
                      </>) : (<>
                        <p className="max-w-md truncate text-sm font-medium text-white px-2">
                          {fileName}
                        </p>
                        <p className="mt-1 text-xs text-[#94a3b8] font-mono">
                          {fileSizeMb}  {m.audioStudio.mb}
                        </p>
                      </>)}
                    </div>
                    <div className="mt-5">
                      {workflowState === "empty" && (<button type="button" onClick={() => fileInputRef.current?.click()} data-slot="button" data-variant="outline" className="liquid-btn group relative w-full overflow-hidden rounded-full border border-white/20 border-t-white/45 backdrop-blur-2xl py-2 px-6 text-sm font-semibold text-white/90 hover:text-white shadow-[0_8px_25px_-4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_30px_-4px_rgba(255,0,126,0.3),inset_0_1px_3px_rgba(255,255,255,0.45)] hover:border-primary/50 transition-all duration-300 cursor-pointer active:scale-[0.99]">
                        <div className="relative flex items-center justify-center gap-2.5">
                          <svg className="w-4 h-4 text-white/80 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span className="tracking-wide">{m.audioStudio.load_audio}</span>
                        </div>
                      </button>)}

                      {workflowState === "selected" && (<button type="button" onClick={handleLoadClick} data-slot="button" data-variant="default" className="liquid-btn-primary group relative w-full overflow-hidden rounded-full border border-white/40 border-t-white/80 bg-gradient-to-r from-[#ff007e] via-[#ec4899] to-[#d946ef] hover:from-[#ff1a8c] hover:via-[#f472b6] hover:to-[#e879f9] py-2 px-6 text-sm font-bold text-white shadow-[0_8px_30px_-2px_rgba(255,0,126,0.65),inset_0_1px_3px_rgba(255,255,255,0.75),0_0_20px_rgba(236,72,153,0.45)] hover:shadow-[0_12px_36px_0px_rgba(255,0,126,0.85),inset_0_1px_4px_rgba(255,255,255,0.9),0_0_28px_rgba(236,72,153,0.65)] backdrop-blur-2xl transition-all duration-300 cursor-pointer text-center hover:scale-[1.01] active:scale-[0.99]">
                        <div className="relative flex items-center justify-center gap-2.5">
                          <svg className="w-4 h-4 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          <span className="tracking-wide">{m.audioStudio.load_audio}</span>
                        </div>
                      </button>)}

                      {workflowState === "loading" && (<div className="relative w-full overflow-hidden rounded-full border border-primary/50 border-t-white/50 bg-[#0e0814]/80 backdrop-blur-2xl py-2 text-center shadow-[0_8px_30px_rgba(255,0,126,0.35),inset_0_1px_2px_rgba(255,255,255,0.25)]">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff007e] via-[#ec4899] to-[#d946ef] shadow-[0_0_20px_rgba(255,0,126,0.7)] transition-all duration-200" style={{ width: `${loadProgress}%` }} />
                        <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold text-white">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{m.audioStudio.loading_audio} {loadProgress}{m.audioStudio.text}</span>
                        </div>
                      </div>)}
                    </div>
                  </div>) : (<div className="liquid-frame rounded-2xl p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <WindowDots />
                        <span className="truncate text-sm font-medium text-white/95">
                          {fileName}
                        </span>
                      </div>
                      <button onClick={handleResetAudio} title={m.audioStudio.close_change_audio} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => applyCutToWaveform("remove")} title="Cut: Potong & buang rentang waktu yang dipilih" className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-4 text-xs font-bold text-white bg-[#1e1c24] hover:bg-[#2c2836] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-xs active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
                          <circle cx="6" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <line x1="20" y1="4" x2="8.12" y2="15.88" />
                          <line x1="14.47" y1="14.48" x2="20" y2="20" />
                          <line x1="8.12" y1="8.12" x2="12" y2="12" />
                        </svg>
                        <span className="leading-none">{m.audioStudio.cut}</span>
                      </button>
                      <button type="button" onClick={() => applyCutToWaveform("keep")} title="Trim: Pangkas & simpan hanya rentang waktu yang dipilih" className="inline-flex items-center justify-center gap-1.5 rounded-xl h-9 px-3.5 text-xs font-bold text-white/90 hover:text-white bg-[#1e1c24] hover:bg-[#2c2836] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-xs active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0">
                          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                        </svg>
                        <span className="leading-none">Trim</span>
                      </button>

                      <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                      <button onClick={() => setActiveMode("volume")} title={m.audioStudio.volume_control} className={`inline-flex items-center justify-center rounded-xl h-9 w-10 transition-all cursor-pointer backdrop-blur-xl ${activeMode === "volume"
                        ? "border border-cyan-400/50 border-t-cyan-200/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                        : "border border-white/14 border-t-white/30 bg-white/[0.05] hover:bg-white/[0.12] text-white/70 hover:text-white shadow-xs"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      </button>
                      <button onClick={() => setActiveMode("speed")} title={m.audioStudio.audio_speed_tempo} className={`inline-flex items-center justify-center rounded-xl h-9 w-10 transition-all cursor-pointer backdrop-blur-xl ${activeMode === "speed"
                        ? "border border-cyan-400/50 border-t-cyan-200/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                        : "border border-white/14 border-t-white/30 bg-white/[0.05] hover:bg-white/[0.12] text-white/70 hover:text-white shadow-xs"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </button>
                      <button onClick={() => setActiveMode("pitch")} title={m.audioStudio.pitch_shifter} className={`inline-flex items-center justify-center rounded-xl h-9 w-10 transition-all cursor-pointer backdrop-blur-xl ${activeMode === "pitch"
                        ? "border border-cyan-400/50 border-t-cyan-200/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                        : "border border-white/14 border-t-white/30 bg-white/[0.05] hover:bg-white/[0.12] text-white/70 hover:text-white shadow-xs"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 10v4" />
                          <path d="M6 6v12" />
                          <path d="M10 3v18" />
                          <path d="M14 8v8" />
                          <path d="M18 5v14" />
                          <path d="M22 10v4" />
                        </svg>
                      </button>
                      <button onClick={() => setActiveMode("eq")} title={m.audioStudio.graphic_equalizer} className={`inline-flex items-center justify-center rounded-xl h-9 w-10 transition-all cursor-pointer backdrop-blur-xl ${activeMode === "eq"
                        ? "border border-cyan-400/50 border-t-cyan-200/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                        : "border border-white/14 border-t-white/30 bg-white/[0.05] hover:bg-white/[0.12] text-white/70 hover:text-white shadow-xs"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" y1="21" x2="4" y2="14" />
                          <line x1="4" y1="10" x2="4" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12" y2="3" />
                          <line x1="20" y1="21" x2="20" y2="16" />
                          <line x1="20" y1="12" x2="20" y2="3" />
                          <line x1="1" y1="14" x2="7" y2="14" />
                          <line x1="9" y1="8" x2="15" y2="8" />
                          <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#94a3b8] px-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white/90">{m.audioStudio.timeline_waveform}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">

                            {m.audioStudio.text_2}{formatTime(trimStart)}  {m.audioStudio.text_3} {formatTime(trimEnd)}{m.audioStudio.text_4}
                          </span>
                        </div>
                      </div>

                      <div ref={timelineFrameRef} className={`relative rounded-xl border border-cyan-500/30 bg-[#040813] shadow-[0_0_30px_rgba(6,182,212,0.15)] p-2 space-y-2 overflow-hidden transition-all ${isCutFlashing ? "ring-2 ring-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]" : ""}`}>
                        <Timeline disabled={!ready} duration={duration || 1} maxZoom={Math.max(fitPx * 16, 1)} minZoom={fitPx || 0} onPositionChange={handleSeek} onZoomChange={setZoomPx} source={position} zoom={fitPx > 0 ? zoom : undefined}>
                          <TimelineViewport className="overflow-y-hidden rounded-lg border border-[#1e3a5f]/60 bg-[#02050e]" ref={viewportRef} scrollbar="hidden">
                            <TimelineLane className="h-20 sm:h-24">
                              <Waveform aria-label={m.audioStudio.waveform_position} className="h-20 sm:h-24 rounded-none overflow-visible" disabled={!ready} duration={duration || 1} getAriaValueText={formatTime} loading={!ready} onValueChange={handleSeek} source={position} values={peaks ?? EMPTY_PEAKS} variant="playhead">
                                {ready && (<AudioRangeSelection duration={duration} trimStart={trimStart} trimEnd={trimEnd} onRangeChange={(start, end) => {
                                  setTrimStart(start);
                                  setTrimEnd(end);
                                }} onSeek={handleSeek} formatTime={formatTime} fileName={fileName} />)}
                                <WaveformHover format={formatTime} />
                              </Waveform>
                            </TimelineLane>
                          </TimelineViewport>
                          {zoomed && (<TimelineNavigator className="mt-1" getAriaValueText={formatTime} />)}
                        </Timeline>
                        {isCutFlashing && (<div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f2fe]/40 to-transparent pointer-events-none animate-pulse z-40" />)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#38bdf8] px-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#64748b]">{m.audioStudio.start}</span>
                        <span className="font-bold text-[#38bdf8] bg-[#0b1324] px-2.5 py-0.5 rounded border border-[#1e3a5f]/60 shadow-xs">
                          {formatTime(trimStart)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-[#0b1324] border border-[#1e3a5f] px-3.5 py-0.5 text-blue-400 font-bold font-mono text-xs shadow-[0_0_8px_rgba(59,130,246,0.15)] flex items-center gap-1.5">
                          <span className="text-[10px] text-cyan-400/70 uppercase tracking-wider">{m.audioStudio.duration}</span>
                          <span className="text-cyan-300 font-semibold">{formatTime(Math.max(0, trimEnd - trimStart))}</span>
                        </div>
                        <div className="rounded-md bg-[#060b17] border border-white/10 px-2.5 py-0.5 text-[#94a3b8] text-[11px] hidden sm:flex items-center gap-1">
                          <span>{m.audioStudio.playhead}</span>
                          <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#64748b]">{m.audioStudio.end}</span>
                        <span className="font-bold text-[#38bdf8] bg-[#0b1324] px-2.5 py-0.5 rounded border border-[#1e3a5f]/60 shadow-xs">
                          {formatTime(trimEnd)}
                        </span>
                        <span className="text-[11px] text-[#64748b] ml-1">{m.audioStudio.text_5} {formatTime(duration)}</span>
                      </div>
                    </div>



                    {activeMode === "volume" && (<div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">

                          {m.audioStudio.volume} <span className="text-[#38bdf8] font-bold font-mono">{volumePercent}{m.audioStudio.text}</span>
                        </span>
                      </div>

                      <div className="relative py-2">
                        <input type="range" min="0" max="200" step="1" value={volumePercent} onChange={(e) => setVolumePercent(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_in}</span>
                          <input type="number" min="0" max="10" value={fadeInSec} onChange={(e) => setFadeInSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_out}</span>
                          <input type="number" min="0" max="10" value={fadeOutSec} onChange={(e) => setFadeOutSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>
                      </div>
                    </div>)}

                    {activeMode === "speed" && (<div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">

                          {m.audioStudio.speed} <span className="text-[#38bdf8] font-bold font-mono">{speedVal.toFixed(1)}{m.audioStudio.x}</span>
                        </span>
                      </div>

                      <div className="relative py-2">
                        <input type="range" min="0.5" max="2.0" step="0.05" value={speedVal} onChange={(e) => setSpeedVal(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_in}</span>
                          <input type="number" min="0" max="10" value={fadeInSec} onChange={(e) => setFadeInSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_out}</span>
                          <input type="number" min="0" max="10" value={fadeOutSec} onChange={(e) => setFadeOutSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>
                      </div>
                    </div>)}

                    {activeMode === "pitch" && (<div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">

                          {m.audioStudio.pitch} <span className="text-[#38bdf8] font-bold font-mono">{pitchSemitones}  {m.audioStudio.semitones}</span>
                        </span>
                      </div>

                      <div className="relative py-2">
                        <input type="range" min="-12" max="12" step="1" value={pitchSemitones} onChange={(e) => setPitchSemitones(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_in}</span>
                          <input type="number" min="0" max="10" value={fadeInSec} onChange={(e) => setFadeInSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_out}</span>
                          <input type="number" min="0" max="10" value={fadeOutSec} onChange={(e) => setFadeOutSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>
                      </div>
                    </div>)}
                    {activeMode === "eq" && (<div className="space-y-4 pt-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {["Default", "Custom", "Classic", "Dance", "Club", "Full bass", "Full bass treble", "Full treble"].map((pName) => (<button key={pName} onClick={() => selectPreset(pName)} className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${activePreset === pName
                          ? "bg-[#1d4ed8] text-white shadow-[0_2px_10px_rgba(29,78,216,0.5)] border border-blue-400/30"
                          : "bg-[#0f172a] border border-white/5 text-[#94a3b8] hover:text-white hover:bg-white/5"}`}>
                          {pName}
                        </button>))}
                        <div className="relative inline-block">
                          <button type="button" onClick={() => setIsMorePresetsOpen((prev) => !prev)} className="rounded-full bg-[#0f172a] border border-white/10 px-3.5 py-1 text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5">
                            <span>{m.audioStudio.more}</span>
                            <span className="text-[10px] text-sky-400">▾</span>
                          </button>

                          {isMorePresetsOpen && (<>
                            <div className="fixed inset-0 z-[120]" onClick={() => setIsMorePresetsOpen(false)} />
                            <div className="absolute left-0 bottom-full mb-2 z-[130] w-48 rounded-xl border border-sky-500/30 bg-[#070d19]/95 backdrop-blur-md p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1">
                              <div className="px-2 py-1 text-[10px] uppercase font-bold text-sky-400 tracking-wider border-b border-white/5">
                                Preset Tambahan
                              </div>
                              {EXTRA_PRESET_NAMES.map((name) => (<button key={name} type="button" onClick={() => {
                                selectPreset(name);
                                setIsMorePresetsOpen(false);
                                showToast(`Preset "${name}" diterapkan!`, "success");
                              }} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${activePreset === name
                                ? "bg-blue-600 text-white font-semibold shadow-xs"
                                : "text-slate-300 hover:text-white hover:bg-white/10"}`}>
                                <span>{name}</span>
                                {activePreset === name && <span className="text-white text-xs">✓</span>}
                              </button>))}
                            </div>
                          </>)}
                        </div>
                      </div>

                      <div className="eq-slider-card" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "16px 20px",
                        backgroundColor: "rgba(8, 13, 26, 0.92)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.5)",
                      }}>
                        {EQ_FREQUENCIES.map((_, i) => (<VerticalEqSlider key={i} label={EQ_LABELS[i]} gain={eqGains[i] || 0} onChange={(newGain) => handleEqGainChange(i, newGain)} />))}
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_in}</span>
                          <input type="number" min="0" max="10" value={fadeInSec} onChange={(e) => setFadeInSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="accent-[#38bdf8] h-3.5 w-3.5 cursor-pointer rounded" />
                          <span>{m.audioStudio.fade_out}</span>
                          <input type="number" min="0" max="10" value={fadeOutSec} onChange={(e) => setFadeOutSec(Number(e.target.value))} className="w-11 rounded bg-black/70 border border-white/15 px-2 py-0.5 text-center font-mono text-xs text-white" />
                          <span className="text-[#64748b]">{m.audioStudio.sec}</span>
                        </label>
                      </div>
                    </div>)}

                    <div className="space-y-3 border-t border-[#1e293b] pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button onClick={togglePlay} title={isPlaying ? m.audioStudio.pause_audio : m.audioStudio.play_audio} className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-2xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${isPlaying
                            ? "border-cyan-400/80 border-t-white/90 bg-gradient-to-br from-cyan-500/80 via-blue-600/80 to-indigo-600/80 text-white shadow-[0_0_24px_rgba(6,182,212,0.7),inset_0_1px_2px_rgba(255,255,255,0.8)]"
                            : "border-white/25 border-t-white/60 border-b-black/40 bg-white/[0.09] hover:bg-white/[0.18] active:bg-white/[0.25] text-white shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_28px_rgba(6,182,212,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)]"}`}>
                            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

                            {isPlaying ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 translate-x-0.5 text-white group-hover:text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-colors">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>)}
                          </button>

                          <div className="rounded-xl bg-white/[0.05] border border-white/16 border-t-white/35 px-4 py-1.5 font-mono text-xs font-semibold text-[#38bdf8] tracking-wider shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl flex items-center gap-2">
                            <span className="text-white font-bold">{formatTime(currentTime)}</span>
                            <span className="text-white/40">{m.audioStudio.text_5}</span>
                            <span className="text-slate-300">{formatTime(duration)}</span>
                            <span className="text-white/20">{m.audioStudio.text_6}</span>
                            <span className="text-cyan-300 font-bold">{m.audioStudio.text_2}{formatTime(trimStart)}  {m.audioStudio.text_3} {formatTime(trimEnd)}{m.audioStudio.text_4}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <LiquidSelect value={exportFormat} onChange={(val) => setExportFormat(val)} options={[
                            { value: "WAV", label: "WAV", icon: <CustomIcon name="icon-sparkles-colored" size={15} alt="WAV" /> },
                            { value: "MP3", label: "MP3", icon: <CustomIcon name="icon-headphones" size={15} alt="MP3" /> },
                          ]} className="h-9 min-w-[96px]" />

                          <button onClick={handleSaveAudio} className="liquid-btn-blue h-9 rounded-xl bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white px-5 text-xs font-bold border border-white/30 border-t-white/60 shadow-[0_6px_20px_rgba(37,99,235,0.45),inset_0_1px_2px_rgba(255,255,255,0.5)] backdrop-blur-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]">

                            {m.audioStudio.save}
                          </button>

                          <button onClick={handleUploadRoblox} className="liquid-btn-amber h-9 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-orange-500/15 hover:from-amber-500/35 hover:to-orange-500/25 border border-amber-500/40 border-t-amber-300/70 text-amber-300 hover:text-amber-200 px-5 text-xs font-bold shadow-[0_6px_20px_rgba(245,158,11,0.25),inset_0_1px_2px_rgba(255,255,255,0.35)] backdrop-blur-xl transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]">

                            {m.audioStudio.upload_to_roblox}
                          </button>
                        </div>
                      </div>

                      {showUploadingArea && (<div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3 backdrop-blur-md">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_12px_#3b82f6] transition-all duration-150" style={{ width: isUploadingRoblox ? `${uploadRobloxProgress}%` : "40%" }} />
                      </div>)}

                      <div className="flex flex-col items-center justify-center pt-1 gap-1">
                        {showUploadingArea && (<span className="text-xs font-semibold text-blue-400">

                          {m.audioStudio.uploading_to_roblox}
                        </span>)}
                        <span className={`rounded-full px-3.5 py-0.5 font-mono text-[11px] font-semibold border ${isUnlimited
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/30 text-[#f59e0b]"}`}>
                          {isUnlimited
                            ? m.audioStudio.unlimited_remaining_today
                            : `${remainingCount}/${dailyLimit} remaining today`}
                        </span>
                      </div>
                    </div>
                  </div>)}

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">

                          {m.audioStudio.conversion_history}
                        </h2>
                        <p className="text-xs text-[#94a3b8] mt-1">

                          {m.audioStudio.track_all_your_audio_conversions_and_upl}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 sm:ml-auto shrink-0 flex-wrap">
                        <button type="button" onClick={() => showToast("Publishing all converted assets...")} data-slot="button" data-variant="default" className="group relative inline-flex items-center justify-center gap-2.5 h-10 px-6 sm:px-7 rounded-full border border-white/40 border-t-white/80 bg-gradient-to-r from-[#ff007e] via-[#ec4899] to-[#d946ef] hover:from-[#ff1a8c] hover:via-[#f472b6] hover:to-[#e879f9] text-white text-xs sm:text-sm font-bold tracking-wide backdrop-blur-2xl shadow-[0_8px_25px_-2px_rgba(255,0,126,0.6),inset_0_1px_3px_rgba(255,255,255,0.7),0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_12px_32px_0px_rgba(255,0,126,0.8),inset_0_1px_4px_rgba(255,255,255,0.85),0_0_28px_rgba(236,72,153,0.6)] transition-all duration-300 cursor-pointer select-none hover:scale-[1.03] active:scale-[0.97]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>{m.audioStudio.publish_all}</span>
                        </button>

                        <button type="button" onClick={() => {
                          const ids = historyItems
                            .map((it) => it.robloxAssetId)
                            .filter(Boolean)
                            .join("\n");
                          if (ids) {
                            navigator.clipboard?.writeText(ids);
                            showToast("Semua ID Roblox berhasil disalin!", "success");
                          }
                          else {
                            showToast("Belum ada file yang di-upload ke Roblox.", "warning");
                          }
                        }} data-slot="button" data-variant="outline" className="liquid-btn group relative inline-flex items-center justify-center gap-2.5 h-10 px-6 sm:px-7 rounded-full border border-white/20 border-t-white/50 text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-2xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:border-primary/60 hover:shadow-[0_10px_28px_-2px_rgba(255,0,126,0.4),inset_0_1px_3px_rgba(255,255,255,0.5)] transition-all duration-300 cursor-pointer select-none hover:scale-[1.03] active:scale-[0.97]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                          <span>{m.audioStudio.copy_all_id}</span>
                        </button>

                        <button type="button" onClick={() => {
                          setHistoryItems([]);
                          showToast("Conversion history cleared!");
                        }} data-slot="button" className="liquid-btn-danger group relative inline-flex items-center justify-center gap-2.5 h-10 px-6 sm:px-7 rounded-full border border-rose-500/45 border-t-rose-300/70 bg-gradient-to-r from-red-500/25 via-rose-500/20 to-red-600/25 hover:from-red-500/40 hover:via-rose-500/35 hover:to-red-600/40 text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-2xl shadow-[0_8px_25px_-2px_rgba(244,63,94,0.45),inset_0_1px_2px_rgba(255,255,255,0.4),0_0_20px_rgba(244,63,94,0.25)] hover:border-rose-400 hover:shadow-[0_12px_32px_0px_rgba(244,63,94,0.7),inset_0_1px_3px_rgba(255,255,255,0.6),0_0_30px_rgba(244,63,94,0.45)] transition-all duration-300 cursor-pointer select-none hover:scale-[1.03] active:scale-[0.97]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-200 group-hover:rotate-12">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          <span>{m.audioStudio.delete_all}</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full overflow-hidden rounded-2xl border border-white/20 border-t-white/50 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-pink-500/[0.02] backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.3),0_0_30px_rgba(255,0,126,0.1)]">
                      <div className="flex items-center gap-2 border-b border-white/15 bg-white/[0.06] px-4 py-3 sm:px-6 backdrop-blur-xl">
                        <WindowDots />
                        <span className="ml-2 font-mono text-xs text-white/70 tracking-wider">

                          {m.audioStudio.cilaaa_recent}
                        </span>
                      </div>
                      <div className="p-4 sm:p-6">
                        {historyItems.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-white/25 bg-gradient-to-b from-white/[0.04] to-pink-500/[0.02] backdrop-blur-xl py-12 px-4 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary/70 mb-1" aria-hidden="true">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M12 7v5l4 2" />
                          </svg>
                          <p className="font-mono text-sm font-semibold text-white/90">
                            {locale === "en"
                              ? m.audioStudio.no_conversions_yet_convert_your_first_au
                              : m.audioStudio.belum_ada_konversi_konversikan_audio_per}
                          </p>
                          <p className="max-w-md text-xs leading-relaxed text-white/60">
                            {locale === "en"
                              ? m.audioStudio.paste_a_link_above_or_convert_audio_and_
                              : m.audioStudio.tempel_tautan_atau_edit_audio_di_atas_da}
                          </p>
                        </div>) : (<div className="grid grid-cols-1 gap-3">
                          {historyItems.map((item) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/15 border-t-white/35 bg-white/[0.05] hover:bg-white/[0.09] hover:border-primary/40 backdrop-blur-xl p-4 text-xs transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
                            <div className="space-y-1 truncate">
                              <p className="truncate font-semibold text-white">{item.name}</p>
                              <p className="text-[#94a3b8] font-mono">
                                {item.duration}  {m.audioStudio.text_7} {item.sizeMb}  {m.audioStudio.mb_2} {item.format}  {m.audioStudio.text_7} {item.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {item.robloxAssetId && (<button onClick={() => {
                                navigator.clipboard?.writeText(item.robloxAssetId);
                                showToast(`Copied ${item.robloxAssetId}`);
                              }} className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 border-t-white/40 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] cursor-pointer transition-all">
                                {item.robloxAssetId}
                              </button>)}
                              <button onClick={() => {
                                setHistoryItems((prev) => prev.filter((i) => i.id !== item.id));
                                showToast("Item deleted");
                              }} className="rounded-lg p-2 text-white/50 hover:bg-rose-500/20 hover:text-rose-400 hover:border hover:border-rose-500/30 transition-all cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>))}
                        </div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>);
}
