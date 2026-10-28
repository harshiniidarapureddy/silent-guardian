import React, { useEffect, useRef } from "react";
import { LiveAudioAnalyzer } from "../../lib/audioManager";

export interface AudioWaveformVisualizerProps {
  analyzer: LiveAudioAnalyzer | null;
  isListening: boolean;
  silenceSecondsRemaining?: number; // e.g., 2, 1, 0
  isSpeaking: boolean;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  analyzer,
  isListening,
  silenceSecondsRemaining,
  isSpeaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const freqData = analyzer?.getFrequencyData();
      const numBars = 28;
      const barWidth = 3;
      const totalBarsWidth = numBars * (barWidth + 3);
      const startX = (width - totalBarsWidth) / 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4; // base resting height

        if (isListening) {
          if (freqData && freqData.length > 0) {
            // Sample frequency index
            const dataIdx = Math.floor((i / numBars) * (freqData.length / 2));
            const val = freqData[dataIdx] || 0;
            barHeight = Math.max(4, Math.round((val / 255) * (height - 8)));
          } else {
            // Subtle simulated breath wave if frequency not directly available
            const wave = Math.sin(Date.now() / 200 + i * 0.4) * 0.5 + 0.5;
            barHeight = isSpeaking ? 6 + wave * 18 : 4 + wave * 6;
          }
        }

        const x = startX + i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        // Gradient color based on intensity
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (barHeight > 20) {
          gradient.addColorStop(0, "#0d9488"); // teal
          gradient.addColorStop(1, "#10b981"); // emerald
        } else {
          gradient.addColorStop(0, "#0f766e");
          gradient.addColorStop(1, "#047857");
        }

        ctx.fillStyle = isListening ? gradient : "#cbd5e1";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isListening) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [analyzer, isListening, isSpeaking]);

  return (
    <div className="flex items-center gap-3 w-full justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {isSpeaking ? "Listening to your symptoms..." : "Listening (speak clearly)..."}
        </span>
      </div>

      {/* Visual Canvas Waveform */}
      <div className="flex-1 max-w-xs h-9 bg-slate-100 rounded-xl px-2 py-1 flex items-center justify-center border border-slate-200">
        <canvas ref={canvasRef} width={200} height={32} className="w-full h-full" />
      </div>

      {/* Silence Auto-Send Counter */}
      {silenceSecondsRemaining !== undefined && silenceSecondsRemaining > 0 && (
        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 shrink-0 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
          Auto-sending in <span className="font-mono font-bold text-teal-800">{silenceSecondsRemaining}s</span>
        </div>
      )}
    </div>
  );
};
