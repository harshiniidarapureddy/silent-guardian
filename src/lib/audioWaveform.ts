export type AudioWaveformMode = "input" | "output";

export const DEFAULT_WAVEFORM_BAR_COUNT = 16;
export const IDLE_BAR_LEVEL = 0.14;
export const MIN_BAR_LEVEL = 0.08;
export const MAX_BAR_LEVEL = 1.0;

function clampLevel(val: number): number {
  if (!Number.isFinite(val)) return MIN_BAR_LEVEL;
  return Math.min(MAX_BAR_LEVEL, Math.max(MIN_BAR_LEVEL, val));
}

/**
 * Pure, deterministic audio waveform bar generator supporting:
 * 1) Real Web Audio AnalyserNode frequency bins (microphone input)
 * 2) Expressive speech-cadence harmonic envelope (TTS output / simulated mic fallback)
 * 3) Calm flat baseline when paused, muted, or idle
 */
export function computeWaveformBars(
  barCount: number,
  phaseSec: number,
  active: boolean,
  mode: AudioWaveformMode,
  volume = 1,
  analyserBins?: Uint8Array | number[] | null
): number[] {
  const count = Math.max(4, Math.min(48, Math.round(barCount) || DEFAULT_WAVEFORM_BAR_COUNT));
  const normalizedVol = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 1));

  if (!active || normalizedVol <= 0.01) {
    return Array.from({ length: count }, (_, idx) => {
      // Gentle symmetric clinical resting profile
      const distFromCenter = Math.abs(idx - (count - 1) / 2) / Math.max(1, (count - 1) / 2);
      return Number(clampLevel(IDLE_BAR_LEVEL - distFromCenter * 0.04).toFixed(3));
    });
  }

  // Use live Web Audio API frequency bins when supplied and non-silent
  if (mode === "input" && analyserBins && analyserBins.length > 0) {
    const usableLen = Math.max(1, Math.floor(analyserBins.length * 0.7));
    let peak = 0;
    for (let i = 0; i < usableLen; i++) {
      if ((analyserBins[i] || 0) > peak) peak = analyserBins[i] || 0;
    }

    if (peak > 4) {
      return Array.from({ length: count }, (_, idx) => {
        const binIndex = Math.min(
          usableLen - 1,
          Math.floor((idx / count) * usableLen)
        );
        const raw = (analyserBins[binIndex] || 0) / 255;
        const centerWeight =
          0.78 +
          0.22 * Math.cos(((idx - (count - 1) / 2) / Math.max(1, count / 2)) * (Math.PI / 2));
        const level = (0.14 + raw * 0.86 * centerWeight) * normalizedVol;
        return Number(clampLevel(level).toFixed(3));
      });
    }
  }

  // Expressive speech-cadence harmonic envelope for TTS output or quiet mic fallback
  const speed = mode === "input" ? 5.6 : 4.8;
  const syllableEnvelope =
    0.58 +
    0.26 * Math.sin(phaseSec * 3.4) +
    0.16 * Math.sin(phaseSec * 7.9 + 0.9);

  return Array.from({ length: count }, (_, idx) => {
    const pos = count > 1 ? idx / (count - 1) : 0.5;
    const bellWindow = 0.42 + 0.58 * Math.sin(pos * Math.PI);
    const waveA = Math.sin(phaseSec * speed + idx * 0.72) * 0.5 + 0.5;
    const waveB = Math.cos(phaseSec * (speed * 1.45) - idx * 1.15) * 0.5 + 0.5;
    const combined = (waveA * 0.62 + waveB * 0.38) * syllableEnvelope * bellWindow;
    const level = (0.16 + combined * 0.84) * normalizedVol;
    return Number(clampLevel(level).toFixed(3));
  });
}

export function getWaveformAriaLabel(
  active: boolean,
  mode: AudioWaveformMode
): string {
  if (!active) {
    return mode === "input"
      ? "Microphone audio waveform idle"
      : "Voice narration waveform paused";
  }
  return mode === "input"
    ? "Live microphone audio input active"
    : "Voice narration audio output active";
}
