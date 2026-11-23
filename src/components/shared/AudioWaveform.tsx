import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  computeWaveformBars,
  getWaveformAriaLabel,
  type AudioWaveformMode,
} from "../../lib/audioWaveform";

export interface AudioWaveformProps {
  active: boolean;
  mode: AudioWaveformMode;
  volume?: number;
  barCount?: number;
  variant?: "compact" | "stage" | "modal";
  theme?: "dark" | "light";
  useMicrophone?: boolean;
  label?: string;
  className?: string;
  testId?: string;
}

const VARIANT_CONFIG = {
  compact: {
    heightPx: 20,
    barWidthClass: "w-[2.5px]",
    gapClass: "gap-[2.5px]",
    defaultBars: 9,
  },
  stage: {
    heightPx: 28,
    barWidthClass: "w-[3px]",
    gapClass: "gap-[3px]",
    defaultBars: 16,
  },
  modal: {
    heightPx: 36,
    barWidthClass: "w-[3.5px]",
    gapClass: "gap-[3.5px]",
    defaultBars: 20,
  },
} as const;

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  active,
  mode,
  volume = 1,
  barCount,
  variant = "compact",
  theme = "dark",
  useMicrophone = false,
  label,
  className = "",
  testId,
}) => {
  const cfg = VARIANT_CONFIG[variant];
  const count = barCount ?? cfg.defaultBars;

  const [bars, setBars] = useState<number[]>(() =>
    computeWaveformBars(count, 0, false, mode, volume)
  );
  const [liveMicActive, setLiveMicActive] = useState(false);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const phaseRef = useRef<number>(0);

  // Optional real-time Web Audio API microphone capture when mode === "input"
  useEffect(() => {
    if (!active || mode !== "input" || !useMicrophone) {
      analyserRef.current = null;
      binsRef.current = null;
      setLiveMicActive(false);
      return;
    }

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setLiveMicActive(false);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    const initMic = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.72;
        source.connect(analyser);

        analyserRef.current = analyser;
        binsRef.current = new Uint8Array(analyser.frequencyBinCount);
        setLiveMicActive(true);
      } catch {
        // Gracefully fall back to reactive simulated waveform when mic permission is unavailable
        analyserRef.current = null;
        binsRef.current = null;
        setLiveMicActive(false);
      }
    };

    void initMic();

    return () => {
      cancelled = true;
      analyserRef.current = null;
      binsRef.current = null;
      setLiveMicActive(false);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtx && audioCtx.state !== "closed") {
        void audioCtx.close().catch(() => {});
      }
    };
  }, [active, mode, useMicrophone]);

  // 30fps paced animation loop (respects reduced motion and stops completely when idle)
  useEffect(() => {
    const normalizedVol = Math.min(1, Math.max(0, volume));
    if (!active || normalizedVol <= 0.01) {
      setBars(computeWaveformBars(count, 0, false, mode, normalizedVol));
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setBars(computeWaveformBars(count, 0.75, true, mode, normalizedVol));
      return;
    }

    let rafId = 0;
    let lastTick = performance.now();

    const step = (now: number) => {
      const elapsed = now - lastTick;
      if (elapsed >= 34) {
        phaseRef.current += Math.min(0.12, elapsed / 1000);
        lastTick = now;

        let liveBins: Uint8Array | null = null;
        if (analyserRef.current && binsRef.current) {
          analyserRef.current.getByteFrequencyData(binsRef.current);
          liveBins = binsRef.current;
        }

        setBars(
          computeWaveformBars(
            count,
            phaseRef.current,
            true,
            mode,
            normalizedVol,
            liveBins
          )
        );
      }
      rafId = window.requestAnimationFrame(step);
    };

    // Immediate first active frame so visual state reflects speech right away
    phaseRef.current += 0.18;
    setBars(computeWaveformBars(count, phaseRef.current, true, mode, normalizedVol));
    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [active, count, mode, volume]);

  const ariaLabel = useMemo(
    () => label || getWaveformAriaLabel(active, mode),
    [active, label, mode]
  );

  const barColorClass = useMemo(() => {
    if (!active || volume <= 0.01) {
      return theme === "dark" ? "bg-slate-600/70" : "bg-slate-300";
    }
    if (mode === "input") {
      return theme === "dark" ? "bg-rose-400" : "bg-rose-600";
    }
    return theme === "dark" ? "bg-teal-400" : "bg-teal-600";
  }, [active, mode, theme, volume]);

  return (
    <div
      role="status"
      aria-live="off"
      aria-label={ariaLabel}
      data-testid={testId}
      data-active={active && volume > 0.01 ? "true" : "false"}
      data-mode={mode}
      data-mic-live={liveMicActive ? "true" : "false"}
      className={`inline-flex items-center justify-center ${cfg.gapClass} ${className}`}
      style={{ height: `${cfg.heightPx}px` }}
    >
      {bars.map((level, idx) => {
        const barHeightPx = Math.max(3, Math.round(level * cfg.heightPx));
        return (
          <span
            key={idx}
            aria-hidden="true"
            className={`${cfg.barWidthClass} rounded-full transition-[height] duration-75 ease-out ${barColorClass}`}
            style={{ height: `${barHeightPx}px` }}
          />
        );
      })}
    </div>
  );
};
