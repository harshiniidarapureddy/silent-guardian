import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Captions,
  CheckCircle2,
  FileText,
  Globe,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  AWARENESS_LANGUAGES,
  formatVideoTime,
  getActiveChapterAndCaption,
  type AwarenessLanguageCode,
  type AwarenessVideoItem,
} from "../../lib/awarenessVideoCatalog";
import {
  inferClinicalSceneType,
  resolveNarrationVoice,
} from "../../lib/speechNarration";
import { resolveAwarenessThumbnail } from "../shared/awarenessThumbnails";
import { AudioWaveform } from "../shared/AudioWaveform";
import { AwarenessMotionStage } from "./AwarenessMotionStage";

interface CinemaVideoPlayerModalProps {
  video: AwarenessVideoItem | null;
  initialLanguage?: AwarenessLanguageCode;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;

export function CinemaVideoPlayerModal({
  video,
  initialLanguage = "en",
  onClose,
}: CinemaVideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [language, setLanguage] = useState<AwarenessLanguageCode>(initialLanguage);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [activeBottomTab, setActiveBottomTab] = useState<"chapters" | "transcript">(
    "chapters"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceFallbackUsed, setVoiceFallbackUsed] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>(
    []
  );

  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastSpokenKeyRef = useRef<string>("");
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load installed system voices via getVoices() + voiceschanged
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const refreshVoices = () => {
      const list = synth.getVoices();
      if (list && list.length > 0) {
        setAvailableVoices(list);
      }
    };

    refreshVoices();
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", refreshVoices);
      return () => synth.removeEventListener("voiceschanged", refreshVoices);
    }
    synth.onvoiceschanged = refreshVoices;
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // Immediately stop & clear any queued speech synthesis narration
  const stopNarration = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore cancel errors in restricted environments
      }
    }
    activeUtteranceRef.current = null;
    setVoiceActive(false);
  }, []);

  // Core synchronous narration trigger (callable directly inside Play/Click handlers to satisfy autoplay policies)
  const speakChapterNow = useCallback(
    (
      targetVideo: AwarenessVideoItem,
      targetTimeSec: number,
      targetLang: AwarenessLanguageCode,
      targetRate: number,
      targetVolume: number,
      targetMuted: boolean
    ) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      if (targetMuted || targetVolume <= 0.01) {
        stopNarration();
        return;
      }

      const info = getActiveChapterAndCaption(
        targetVideo,
        targetTimeSec,
        targetLang
      );
      const englishCaption =
        info.chapter.captions.en || info.caption || targetVideo.description;

      const synth = window.speechSynthesis;
      const liveVoices =
        availableVoices.length > 0 ? availableVoices : synth.getVoices();

      const resolved = resolveNarrationVoice(
        liveVoices,
        targetLang,
        info.caption,
        englishCaption
      );

      setVoiceFallbackUsed(resolved.fallbackUsed);

      const speakKey = `${targetVideo.id}:${info.chapter.id}:${targetLang}:${targetRate}`;
      lastSpokenKeyRef.current = speakKey;

      try {
        synth.cancel();
        // Resume in case Chrome paused the speech queue
        if (synth.paused) synth.resume();

        const utterance = new SpeechSynthesisUtterance(resolved.textToSpeak);
        if (resolved.voice) {
          utterance.voice = resolved.voice;
        }
        utterance.lang = resolved.speechLang;
        utterance.volume = Math.min(1, Math.max(0, targetVolume));
        utterance.rate = Math.min(1.8, Math.max(0.75, 0.95 * targetRate));
        utterance.pitch = 1.0;

        utterance.onstart = () => setVoiceActive(true);
        utterance.onend = () => {
          if (activeUtteranceRef.current === utterance) {
            setVoiceActive(false);
          }
        };
        utterance.onerror = () => {
          if (activeUtteranceRef.current === utterance) {
            setVoiceActive(false);
          }
        };

        activeUtteranceRef.current = utterance;
        setVoiceActive(true);
        synth.speak(utterance);
      } catch {
        setVoiceActive(false);
      }
    },
    [availableVoices, stopNarration]
  );

  // Reset player state cleanly when opening a new video (starts in Ready-to-Play or resumes cleanly)
  useEffect(() => {
    if (!video) {
      stopNarration();
      return;
    }
    const validLang = video.languages.includes(initialLanguage)
      ? initialLanguage
      : video.languages[0] || "en";
    setLanguage(validLang);
    setCurrentTime(0);
    setIsPlaying(true);
    setCaptionsEnabled(true);
    setMuted(false);
    setVolume(1);
    setActiveBottomTab("chapters");
    lastSpokenKeyRef.current = "";

    // Speak immediately inside open gesture turn
    speakChapterNow(video, 0, validLang, 1, 1, false);

    return () => {
      stopNarration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, initialLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, [stopNarration]);

  // Escape to close + keyboard shortcuts
  useEffect(() => {
    if (!video) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopNarration();
        onClose();
      } else if (
        e.key === " " &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        setIsPlaying((prev) => {
          if (prev) {
            stopNarration();
            return false;
          }
          speakChapterNow(video, currentTime, language, playbackRate, volume, muted);
          return true;
        });
      } else if (e.key === "ArrowRight") {
        const nextSec = Math.min(video.durationSec, currentTime + 10);
        setCurrentTime(nextSec);
        if (isPlaying) {
          speakChapterNow(video, nextSec, language, playbackRate, volume, muted);
        }
      } else if (e.key === "ArrowLeft") {
        const nextSec = Math.max(0, currentTime - 10);
        setCurrentTime(nextSec);
        if (isPlaying) {
          speakChapterNow(video, nextSec, language, playbackRate, volume, muted);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    video,
    onClose,
    stopNarration,
    speakChapterNow,
    currentTime,
    language,
    playbackRate,
    volume,
    muted,
    isPlaying,
  ]);

  // Listen to fullscreen state changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Playback timer loop synchronized with chapter timeline
  useEffect(() => {
    if (!video || !isPlaying) return;
    const tickMs = 250;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (tickMs / 1000) * playbackRate;
        if (next >= video.durationSec) {
          setIsPlaying(false);
          stopNarration();
          return video.durationSec;
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [video, isPlaying, playbackRate, stopNarration]);

  const activeInfo = useMemo(() => {
    if (!video) return null;
    return getActiveChapterAndCaption(video, currentTime, language);
  }, [video, currentTime, language]);

  // Trigger voice narration automatically when advancing into a new chapter while playing
  useEffect(() => {
    if (!video || !activeInfo) return;
    if (!isPlaying || muted || volume <= 0.01) {
      return;
    }
    const speakKey = `${video.id}:${activeInfo.chapter.id}:${language}:${playbackRate}`;
    if (lastSpokenKeyRef.current === speakKey) return;
    speakChapterNow(video, currentTime, language, playbackRate, volume, muted);
  }, [
    video,
    activeInfo,
    isPlaying,
    muted,
    volume,
    language,
    playbackRate,
    currentTime,
    speakChapterNow,
  ]);

  if (!video || !activeInfo) return null;

  const progressPct =
    video.durationSec > 0
      ? Math.min(100, Math.max(0, (currentTime / video.durationSec) * 100))
      : 0;
  const resolvedThumb = resolveAwarenessThumbnail(video.thumbnailUrl);
  const currentLangMeta =
    AWARENESS_LANGUAGES.find((l) => l.code === language) || AWARENESS_LANGUAGES[0];
  const sceneType = inferClinicalSceneType(video);

  // Synchronous Play / Pause handler (guarantees browser audio unlock on click)
  const handleTogglePlay = () => {
    if (currentTime >= video.durationSec) {
      setCurrentTime(0);
      setIsPlaying(true);
      speakChapterNow(video, 0, language, playbackRate, volume, muted);
      return;
    }

    if (isPlaying) {
      stopNarration();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakChapterNow(video, currentTime, language, playbackRate, volume, muted);
    }
  };

  const handleSeek = (nextSec: number) => {
    const clamped = Math.max(0, Math.min(video.durationSec, nextSec));
    setCurrentTime(clamped);
    lastSpokenKeyRef.current = "";
    if (isPlaying) {
      speakChapterNow(video, clamped, language, playbackRate, volume, muted);
    } else {
      stopNarration();
    }
  };

  const handleJumpChapter = (startSec: number) => {
    setCurrentTime(startSec);
    setIsPlaying(true);
    lastSpokenKeyRef.current = "";
    speakChapterNow(video, startSec, language, playbackRate, volume, muted);
  };

  const handleLanguageChange = (nextLang: AwarenessLanguageCode) => {
    stopNarration();
    lastSpokenKeyRef.current = "";
    setLanguage(nextLang);
    if (isPlaying) {
      speakChapterNow(video, currentTime, nextLang, playbackRate, volume, muted);
    }
  };

  const handleSpeedChange = (nextRate: number) => {
    stopNarration();
    lastSpokenKeyRef.current = "";
    setPlaybackRate(nextRate);
    if (isPlaying) {
      speakChapterNow(video, currentTime, language, nextRate, volume, muted);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (nextMuted) {
      stopNarration();
    } else if (isPlaying) {
      const nextVol = volume > 0 ? volume : 1;
      if (volume === 0) setVolume(1);
      speakChapterNow(video, currentTime, language, playbackRate, nextVol, false);
    }
  };

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    if (nextVol <= 0.01) {
      setMuted(true);
      stopNarration();
    } else {
      const wasMuted = muted;
      setMuted(false);
      if (isPlaying && wasMuted) {
        speakChapterNow(video, currentTime, language, playbackRate, nextVol, false);
      }
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore restricted iframe fullscreen errors gracefully
    }
  };

  const handleClose = () => {
    stopNarration();
    onClose();
  };

  const audioIsOn = !muted && volume > 0.01;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cinema-player-title"
      data-testid="cinema-video-player-modal"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Theater Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span className="text-teal-400 font-semibold">{video.category}</span>
              <span>·</span>
              <span>{video.quality}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <ShieldCheck size={12} className="text-teal-400" aria-hidden="true" />
                {video.medicalSource}
              </span>
            </div>
            <h2
              id="cinema-player-title"
              className="font-display text-base sm:text-lg font-bold text-white truncate mt-0.5"
            >
              {video.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close video player"
            data-testid="close-cinema-player-btn"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 shrink-0"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content: Stage + Chapters/Transcript */}
        <div className="flex-1 overflow-y-auto">
          {/* 16:9 Cinema Animated Clinical Viewport */}
          <div
            ref={stageRef}
            className="relative aspect-video w-full bg-slate-950 overflow-hidden select-none group"
          >
            {/* Live 60fps Animated Clinical Action Canvas */}
            <AwarenessMotionStage
              sceneType={sceneType}
              isPlaying={isPlaying}
              chapterIndex={activeInfo.chapterIndex}
              chapterTitle={activeInfo.chapter.title}
              visualSceneTag={activeInfo.chapter.visualSceneTag}
              playbackRate={playbackRate}
              thumbnailSrc={resolvedThumb}
            />

            {/* Measured Bottom Scrim for Captions & Controls Legibility */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/45 pointer-events-none" />

            {/* Top HUD inside frame: Active Chapter Scene & Visible Audio/Volume Indicator */}
            <div className="absolute top-3.5 left-4 right-4 z-30 flex items-center justify-between gap-3 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs text-slate-100 flex items-center gap-2 max-w-[65%]">
                <span className="font-mono text-teal-400 font-bold shrink-0">
                  CH {activeInfo.chapterIndex + 1}/{video.chapters.length}
                </span>
                <span className="truncate font-medium">
                  {activeInfo.chapter.title}
                </span>
              </div>

              {/* Visible Audio / Volume & Voice Language Indicator */}
              <div
                data-testid="cinema-audio-indicator"
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-100 flex items-center gap-2 shrink-0"
              >
                <span className="inline-flex items-center gap-1">
                  <Globe size={12} className="text-teal-400" aria-hidden="true" />
                  <span>{currentLangMeta.label}</span>
                </span>
                <span className="text-slate-600">|</span>
                {audioIsOn ? (
                  <span className="inline-flex items-center gap-2 text-teal-300">
                    <Volume2 size={12} aria-hidden="true" />
                    <AudioWaveform
                      active={isPlaying && audioIsOn}
                      mode="output"
                      volume={muted ? 0 : volume}
                      variant="compact"
                      theme="dark"
                      barCount={10}
                      testId="cinema-audio-waveform"
                      label={
                        isPlaying && audioIsOn
                          ? `Narration audio active at ${Math.round(volume * 100)} percent volume`
                          : "Narration audio paused"
                      }
                    />
                    <span className="font-mono text-[10px]">
                      {isPlaying
                        ? voiceFallbackUsed
                          ? "Voice ON (EN)"
                          : voiceActive
                          ? `Speaking ${Math.round(volume * 100)}%`
                          : `Voice ${Math.round(volume * 100)}%`
                        : "Paused"}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-mono text-[10px]">
                    <VolumeX size={12} aria-hidden="true" />
                    <AudioWaveform
                      active={false}
                      mode="output"
                      volume={0}
                      variant="compact"
                      theme="dark"
                      barCount={10}
                      testId="cinema-audio-waveform"
                      label="Narration audio muted"
                    />
                    <span>Muted</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center Play/Pause Overlay Click Target */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="absolute inset-0 z-20 w-full h-full flex items-center justify-center focus-visible:outline-none"
            >
              {!isPlaying && (
                <span className="w-16 h-16 rounded-full bg-teal-600/95 hover:bg-teal-500 text-white shadow-2xl flex items-center justify-center border border-white/25 transition-transform hover:scale-105">
                  <Play size={28} className="ml-1 fill-white" aria-hidden="true" />
                </span>
              )}
            </button>

            {/* Bottom Overlay: High-Contrast Synchronized Captions (CC) + Player Controls */}
            <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-3 pt-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent space-y-2.5">
              {/* High-Contrast Synchronized Closed Captions */}
              {captionsEnabled && (
                <div
                  data-testid="cinema-live-caption"
                  aria-live="polite"
                  className="mx-auto max-w-3xl text-center"
                >
                  <div className="inline-block px-4 py-2 rounded-lg bg-black/85 border border-white/15 text-white text-sm sm:text-base font-medium leading-snug shadow-lg">
                    {activeInfo.caption}
                  </div>
                </div>
              )}

              {/* Interactive Progress Bar / Scrubber with Chapter Tick Markers */}
              <div className="space-y-1">
                <div className="relative h-5 flex items-center">
                  <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden relative">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-[width] duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {video.chapters.slice(1).map((ch) => {
                    const leftPct = (ch.startSec / video.durationSec) * 100;
                    return (
                      <span
                        key={ch.id}
                        title={ch.title}
                        style={{ left: `${leftPct}%` }}
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2.5 bg-slate-950/90 pointer-events-none"
                      />
                    );
                  })}

                  <input
                    type="range"
                    aria-label="Seek video timeline"
                    data-testid="cinema-scrubber"
                    min={0}
                    max={video.durationSec}
                    step={1}
                    value={Math.floor(currentTime)}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Left Transport Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    data-testid="cinema-play-pause-btn"
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={15} aria-hidden="true" />
                    ) : (
                      <Play size={15} aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(currentTime - 10)}
                    data-testid="cinema-rewind-btn"
                    aria-label="Rewind 10 seconds"
                    title="Rewind 10s"
                    className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white inline-flex items-center gap-1 font-mono text-[11px] whitespace-nowrap"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>10s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(currentTime + 10)}
                    data-testid="cinema-forward-btn"
                    aria-label="Forward 10 seconds"
                    title="Forward 10s"
                    className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white inline-flex items-center gap-1 font-mono text-[11px] whitespace-nowrap"
                  >
                    <span>10s</span>
                    <RotateCw size={13} aria-hidden="true" />
                  </button>

                  {/* Visible Volume Control */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      data-testid="cinema-mute-btn"
                      aria-label={muted ? "Unmute audio" : "Mute audio"}
                      className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200"
                    >
                      {!audioIsOn ? (
                        <VolumeX size={15} aria-hidden="true" />
                      ) : (
                        <Volume2 size={15} aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="range"
                      aria-label="Audio volume"
                      data-testid="cinema-volume-slider"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="hidden sm:block w-16 accent-teal-400 cursor-pointer"
                    />
                  </div>

                  {/* Timecode */}
                  <span
                    data-testid="cinema-timecode"
                    className="ml-1 font-mono text-[11px] text-slate-200 tabular-nums whitespace-nowrap"
                  >
                    {formatVideoTime(currentTime)} / {formatVideoTime(video.durationSec)}
                  </span>
                </div>

                {/* Right Controls: Live Language Switcher, CC, Speed, Fullscreen */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <label htmlFor="cinema-lang-select" className="sr-only">
                    Audio and subtitle language
                  </label>
                  <select
                    id="cinema-lang-select"
                    data-testid="cinema-language-select"
                    value={language}
                    onChange={(e) =>
                      handleLanguageChange(e.target.value as AwarenessLanguageCode)
                    }
                    className="h-8 rounded-lg bg-slate-900/95 border border-white/20 px-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {AWARENESS_LANGUAGES.filter((l) =>
                      video.languages.includes(l.code)
                    ).map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900">
                        {lang.nativeLabel !== lang.label
                          ? `${lang.label} (${lang.nativeLabel})`
                          : lang.label}
                      </option>
                    ))}
                  </select>

                  {/* CC Toggle */}
                  <button
                    type="button"
                    onClick={() => setCaptionsEnabled((c) => !c)}
                    data-testid="cinema-cc-toggle"
                    aria-pressed={captionsEnabled}
                    aria-label="Toggle closed captions"
                    className={`px-2.5 h-8 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                      captionsEnabled
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "bg-white/10 border-white/15 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    <Captions size={14} aria-hidden="true" />
                    <span>CC</span>
                  </button>

                  {/* Playback Speed */}
                  <label htmlFor="cinema-speed-select" className="sr-only">
                    Playback speed
                  </label>
                  <select
                    id="cinema-speed-select"
                    data-testid="cinema-speed-select"
                    value={playbackRate}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="h-8 rounded-lg bg-slate-900/95 border border-white/20 px-2 text-xs font-mono font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {SPEED_OPTIONS.map((spd) => (
                      <option key={spd} value={spd} className="bg-slate-900">
                        {spd}x
                      </option>
                    ))}
                  </select>

                  {/* Fullscreen Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize2 size={14} aria-hidden="true" />
                    ) : (
                      <Maximize2 size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Below-Player Chapters & Synchronized Transcript Panel */}
          <div className="bg-white text-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {video.description}
                </p>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{video.viewsLabel}</span>
                  <span>·</span>
                  <span>Duration {video.durationLabel}</span>
                  <span>·</span>
                  <span>Updated {video.updatedAt}</span>
                  <span>·</span>
                  <span>{video.languages.length} languages with live CC & voice</span>
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Video chapters and transcript"
                className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-start"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBottomTab === "chapters"}
                  data-testid="cinema-tab-chapters"
                  onClick={() => setActiveBottomTab("chapters")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeBottomTab === "chapters"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen size={13} aria-hidden="true" />
                  <span>Chapters ({video.chapters.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBottomTab === "transcript"}
                  data-testid="cinema-tab-transcript"
                  onClick={() => setActiveBottomTab("transcript")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeBottomTab === "transcript"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText size={13} aria-hidden="true" />
                  <span>Full Transcript ({currentLangMeta.label})</span>
                </button>
              </div>
            </div>

            {activeBottomTab === "chapters" && (
              <div className="grid sm:grid-cols-2 gap-3" data-testid="cinema-chapters-list">
                {video.chapters.map((ch, idx) => {
                  const isCurrent = idx === activeInfo.chapterIndex;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleJumpChapter(ch.startSec)}
                      data-testid={`cinema-chapter-${idx}`}
                      className={`text-left rounded-xl border p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                        isCurrent
                          ? "bg-teal-50/70 border-teal-300"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 tabular-nums">
                          {formatVideoTime(ch.startSec)} – {formatVideoTime(ch.endSec)}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-teal-800 inline-flex items-center gap-1">
                            <CheckCircle2 size={12} aria-hidden="true" />
                            Now Playing
                          </span>
                        )}
                      </div>
                      <div className="font-display text-sm font-bold text-slate-900 mt-1">
                        {idx + 1}. {ch.title}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {ch.keyTakeaway}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {activeBottomTab === "transcript" && (
              <div
                className="space-y-2.5"
                data-testid="cinema-transcript-panel"
              >
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing synchronized transcript in{" "}
                    <strong className="text-slate-900">
                      {currentLangMeta.nativeLabel !== currentLangMeta.label
                        ? `${currentLangMeta.label} (${currentLangMeta.nativeLabel})`
                        : currentLangMeta.label}
                    </strong>
                    . Click any timestamp to jump directly to that moment.
                  </span>
                </div>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/40">
                  {video.chapters.map((ch, idx) => {
                    const isCurrent = idx === activeInfo.chapterIndex;
                    const line = ch.captions[language] || ch.captions.en;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleJumpChapter(ch.startSec)}
                        className={`w-full text-left px-4 py-3.5 flex items-start gap-3.5 transition-colors ${
                          isCurrent ? "bg-teal-50/80" : "hover:bg-white"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-teal-800 tabular-nums shrink-0 mt-0.5">
                          {formatVideoTime(ch.startSec)}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900">
                            {ch.title}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {line}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
