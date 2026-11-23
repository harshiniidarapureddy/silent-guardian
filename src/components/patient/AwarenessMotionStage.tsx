import React, { useEffect, useRef } from "react";
import type { ClinicalSceneType } from "../../lib/speechNarration";

interface AwarenessMotionStageProps {
  sceneType: ClinicalSceneType;
  isPlaying: boolean;
  chapterIndex: number;
  chapterTitle: string;
  visualSceneTag: string;
  playbackRate: number;
  thumbnailSrc?: string;
}

/**
 * Live 60fps HTML5 Canvas clinical animation stage showing real step-by-step
 * motion synchronized with the Awareness Video timeline & active chapter.
 */
export function AwarenessMotionStage({
  sceneType,
  isPlaying,
  chapterIndex,
  chapterTitle,
  visualSceneTag,
  playbackRate,
  thumbnailSrc,
}: AwarenessMotionStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTimestamp = performance.now();

    const drawGrid = (w: number, h: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSmartGlassesScene = (w: number, h: number, t: number) => {
      const cx = w * 0.34;
      const cy = h * 0.48;

      // Subtle ultrasonic obstacle radar waves emanating from right frame
      for (let i = 0; i < 4; i++) {
        const phase = (t * 0.9 + i * 0.25) % 1;
        const radius = 36 + phase * 190;
        ctx.save();
        ctx.strokeStyle = `rgba(45, 212, 191, ${(1 - phase) * 0.65})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx + 98, cy - 8, radius, -0.58, 0.58);
        ctx.stroke();
        ctx.restore();
      }

      // Glasses Frame Silhouette (sleek titanium vector)
      ctx.save();
      ctx.strokeStyle = "#E2E8F0";
      ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
      ctx.lineWidth = 4;

      // Left lens
      ctx.beginPath();
      ctx.roundRect(cx - 115, cy - 42, 92, 62, 16);
      ctx.fill();
      ctx.stroke();

      // Right lens
      ctx.beginPath();
      ctx.roundRect(cx + 15, cy - 42, 92, 62, 16);
      ctx.fill();
      ctx.stroke();

      // Bridge + active micro-camera lens
      ctx.beginPath();
      ctx.moveTo(cx - 23, cy - 16);
      ctx.quadraticCurveTo(cx - 4, cy - 28, cx + 15, cy - 16);
      ctx.stroke();

      const camPulse = 0.65 + 0.35 * Math.sin(t * 5);
      ctx.fillStyle = `rgba(45, 212, 191, ${camPulse})`;
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 20, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#99F6E4";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Open-ear temple speaker audio rings on left temple
      for (let i = 0; i < 3; i++) {
        const p = (t * 1.4 + i * 0.33) % 1;
        ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - p) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - 122, cy - 16, 10 + p * 36, Math.PI * 0.7, Math.PI * 1.3);
        ctx.stroke();
      }
      ctx.restore();

      // Medicine Bottle / Prescription Label Target on Right with live OCR laser scan
      const bx = w * 0.68;
      const by = h * 0.25;
      const bw = 178;
      const bh = 186;

      ctx.save();
      // Cap
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(bx + 36, by - 22, bw - 72, 24, 6);
      ctx.fill();
      // Bottle body
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 18);
      ctx.fill();
      ctx.stroke();

      // Prescription Label
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.roundRect(bx + 14, by + 26, bw - 28, 126, 8);
      ctx.fill();

      ctx.fillStyle = "#0F766E";
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillText("RX · DOSAGE VERIFIED", bx + 24, by + 48);
      ctx.fillStyle = "#0F172A";
      ctx.font = "800 14px Inter, sans-serif";
      ctx.fillText("Metformin 500mg", bx + 24, by + 72);
      ctx.fillStyle = "#475569";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.fillText("Take 1 tab after meal", bx + 24, by + 94);
      ctx.fillText("EXP: 11 / 2028", bx + 24, by + 114);

      // Animated OCR Laser Scan Line sweeping vertically across label
      const scanY = by + 32 + ((Math.sin(t * 2.6) + 1) / 2) * 114;
      const grad = ctx.createLinearGradient(bx + 10, scanY - 12, bx + 10, scanY + 12);
      grad.addColorStop(0, "rgba(45, 212, 191, 0)");
      grad.addColorStop(0.5, "rgba(45, 212, 191, 0.55)");
      grad.addColorStop(1, "rgba(45, 212, 191, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(bx + 10, scanY - 12, bw - 20, 24);

      ctx.strokeStyle = "#2DD4BF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 10, scanY);
      ctx.lineTo(bx + bw - 10, scanY);
      ctx.stroke();

      // Corner OCR tracking brackets
      ctx.strokeStyle = "#5EEAD4";
      ctx.lineWidth = 2.5;
      const m = 8;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(bx - m, by + 16);
      ctx.lineTo(bx - m, by - m);
      ctx.lineTo(bx + 16, by - m);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(bx + bw + m, by + bh - 16);
      ctx.lineTo(bx + bw + m, by + bh + m);
      ctx.lineTo(bx + bw - 16, by + bh + m);
      ctx.stroke();

      // Live OCR telemetry readout badge
      const dist = (1.6 + 0.5 * Math.sin(t * 1.4)).toFixed(1);
      ctx.fillStyle = "rgba(15, 118, 110, 0.92)";
      ctx.beginPath();
      ctx.roundRect(cx - 115, cy + 48, 222, 34, 8);
      ctx.fill();
      ctx.fillStyle = "#F0FDFA";
      ctx.font = "700 12px monospace";
      const hudText =
        chapterIndex === 3
          ? "SOS BRIDGE: GPS LOCKED · READY"
          : `OCR ACTIVE · CLEAR PATH ${dist}m`;
      ctx.fillText(hudText, cx - 101, cy + 69);
      ctx.restore();
    };

    const drawHearingAidScene = (w: number, h: number, t: number) => {
      const midY = h * 0.46;

      // Left: Noisy ER Ambient Wave (amber/red jitter)
      ctx.save();
      ctx.strokeStyle = "rgba(251, 146, 60, 0.72)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 52; x <= w * 0.42; x += 4) {
        const norm = (x - 52) / (w * 0.42 - 52);
        const y =
          midY +
          Math.sin(x * 0.08 + t * 6) * 34 +
          Math.cos(x * 0.21 - t * 9) * 18 * (0.4 + 0.6 * norm);
        if (x === 52) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Center DSP Speech-Clarity Processor Node
      const cx = w * 0.5;
      const pulse = 1 + 0.08 * Math.sin(t * 4);
      ctx.fillStyle = "rgba(15, 118, 110, 0.25)";
      ctx.beginPath();
      ctx.arc(cx, midY, 54 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = "#2DD4BF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, midY, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#5EEAD4";
      ctx.font = "800 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DSP FILTER", cx, midY - 4);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillText("SPEECH FOCUS", cx, midY + 13);

      // Right: Clean Filtered Voice Wave (crisp teal sine)
      ctx.strokeStyle = "#2DD4BF";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = w * 0.58; x <= w - 52; x += 4) {
        const env = Math.sin(((x - w * 0.58) / (w * 0.42 - 52)) * Math.PI);
        const y = midY + Math.sin(x * 0.06 - t * 5.2) * 30 * (0.35 + 0.65 * env);
        if (x === w * 0.58) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels
      ctx.textAlign = "left";
      ctx.fillStyle = "#FDBA74";
      ctx.font = "700 11px monospace";
      ctx.fillText("ER AMBIENT NOISE (-24 dB)", 56, midY - 68);
      ctx.fillStyle = "#5EEAD4";
      ctx.fillText("CLINICIAN VOICE (+18 dB · BLE SYNC)", w * 0.58, midY - 68);
      ctx.restore();
    };

    const drawDeafTriageScene = (w: number, h: number, t: number) => {
      // Left: Interactive Visual Pain Scale Tablet (1-10 animated indicator)
      const tx = w * 0.12;
      const ty = h * 0.24;
      const tw = w * 0.42;
      const th = h * 0.48;

      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#5EEAD4";
      ctx.font = "700 11px monospace";
      ctx.fillText("VISUAL-FIRST TRIAGE TABLET", tx + 20, ty + 30);

      const levels = [2, 4, 6, 8, 10];
      const colors = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];
      const activeIdx = Math.floor(t * 0.9) % levels.length;
      const boxW = (tw - 64) / levels.length;

      levels.forEach((lvl, i) => {
        const bx = tx + 20 + i * (boxW + 6);
        const by = ty + 54;
        const isSel = i === activeIdx;
        ctx.fillStyle = isSel ? colors[i] : "rgba(30, 41, 59, 0.9)";
        ctx.strokeStyle = isSel ? "#FFFFFF" : "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = isSel ? 2.5 : 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, 56, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSel ? "#0F172A" : "#CBD5E1";
        ctx.font = "800 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(lvl), bx + boxW / 2, by + 34);
      });

      ctx.textAlign = "left";
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 12px Inter, sans-serif";
      ctx.fillText(
        `Pain Level Confirmed: ${levels[activeIdx]} / 10 · Live Captions ON`,
        tx + 20,
        ty + th - 26
      );

      // Right: Vibrating & Flashing LED Ward Alert Pager
      const px = w * 0.65;
      const py = h * 0.3;
      const shakeX = Math.sin(t * 28) * (Math.sin(t * 2.5) > 0 ? 3.5 : 0);

      // Strobe LED Halo
      const flash = 0.25 + 0.45 * Math.max(0, Math.sin(t * 6));
      ctx.fillStyle = `rgba(45, 212, 191, ${flash})`;
      ctx.beginPath();
      ctx.arc(px + 90 + shakeX, py + 76, 86, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = "#2DD4BF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(px + shakeX, py, 180, 152, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#14B8A6";
      ctx.beginPath();
      ctx.roundRect(px + 18 + shakeX, py + 18, 144, 64, 10);
      ctx.fill();

      ctx.fillStyle = "#042F2E";
      ctx.font = "800 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("NURSE ARRIVING", px + 90 + shakeX, py + 48);
      ctx.font = "700 10px Inter, sans-serif";
      ctx.fillText("HAPTIC + LED FLASH", px + 90 + shakeX, py + 66);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "700 11px monospace";
      ctx.fillText("WARD ALERT PAGER", px + 90 + shakeX, py + 118);
      ctx.restore();
    };

    const drawCprGuideScene = (w: number, h: number, t: number) => {
      // 110 BPM real CPR compression rhythm (~1.833 beats per second)
      const bpm = 110;
      const beatPhase = (t * (bpm / 60)) % 1;
      const pressDepth = Math.pow(Math.sin(beatPhase * Math.PI), 2); // 0 -> 1 -> 0

      const cx = w * 0.38;
      const cy = h * 0.48;

      ctx.save();
      // Torso outline
      ctx.fillStyle = "rgba(30, 41, 59, 0.82)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cx - 108, cy - 72, 216, 156, 36);
      ctx.fill();
      ctx.stroke();

      // Center-chest target zone
      ctx.strokeStyle = `rgba(45, 212, 191, ${0.4 + 0.6 * pressDepth})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 34 + pressDepth * 14, 0, Math.PI * 2);
      ctx.stroke();

      // Animated pressing hands circle
      const handY = cy + 4 + pressDepth * 10;
      ctx.fillStyle = "#0F766E";
      ctx.strokeStyle = "#99F6E4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, handY, 26 - pressDepth * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PUSH", cx, handY + 4);

      // Right: Live CPR Metronome & Compression Depth Meter (5-6 cm optimal)
      const mx = w * 0.64;
      const my = h * 0.25;
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx, my, 210, 184, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#5EEAD4";
      ctx.font = "700 11px monospace";
      ctx.fillText("AUDIO CPR METRONOME", mx + 18, my + 28);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 30px monospace";
      ctx.fillText(`${bpm} BPM`, mx + 18, my + 68);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.fillText("Compression Depth (5–6 cm)", mx + 18, my + 104);

      // Animated Depth Bar
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(mx + 18, my + 116, 174, 18, 9);
      ctx.fill();

      ctx.fillStyle = "#14B8A6";
      ctx.beginPath();
      ctx.roundRect(mx + 18, my + 116, 28 + pressDepth * 140, 18, 9);
      ctx.fill();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px monospace";
      ctx.fillText("VERBALIZE EVERY CARE STEP", mx + 18, my + 162);
      ctx.restore();
    };

    const drawOrganDonationScene = (w: number, h: number, t: number) => {
      const cx = w * 0.5;
      const cy = h * 0.46;

      const nodes = [
        { label: "Heart", angle: -Math.PI * 0.8 },
        { label: "Kidneys", angle: -Math.PI * 0.45 },
        { label: "Liver", angle: -Math.PI * 0.1 },
        { label: "Corneas", angle: Math.PI * 0.25 },
        { label: "Lungs", angle: Math.PI * 0.6 },
        { label: "Tissues", angle: Math.PI * 0.92 },
      ];

      ctx.save();
      // Animated radiating links from central Donor Pledge Hub
      nodes.forEach((node, i) => {
        const nx = cx + Math.cos(node.angle) * 185;
        const ny = cy + Math.sin(node.angle) * 112;

        ctx.strokeStyle = "rgba(45, 212, 191, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Moving pulse dot traveling from center to organ node
        const p = (t * 0.7 + i * 0.16) % 1;
        const px = cx + (nx - cx) * p;
        const py = cy + (ny - cy) * p;
        ctx.fillStyle = "#5EEAD4";
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Node badge
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = "#2DD4BF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(nx - 48, ny - 18, 96, 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#F0FDFA";
        ctx.font = "700 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + 4);
      });

      // Central pulsing donor pledge heart ring
      const beat = 1 + 0.08 * Math.sin(t * 4.5);
      ctx.fillStyle = "rgba(20, 184, 166, 0.24)";
      ctx.beginPath();
      ctx.arc(cx, cy, 62 * beat, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0F766E";
      ctx.strokeStyle = "#99F6E4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("1 PLEDGE", cx, cy - 4);
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillStyle = "#CCFBF1";
      ctx.fillText("8 LIVES", cx, cy + 14);
      ctx.restore();
    };

    const drawVitalsBpScene = (w: number, h: number, t: number) => {
      // Animated Upper-Arm BP Cuff Inflation + Live Digital Monitor
      const cycle = (t * 0.35) % 1; // 0..0.45 inflating, 0.45..0.75 deflating, 0.75..1 reading hold
      let pressure = 118;
      let statusLabel = "READING COMPLETE";
      if (cycle < 0.45) {
        pressure = Math.round((cycle / 0.45) * 168);
        statusLabel = "INFLATING CUFF...";
      } else if (cycle < 0.75) {
        pressure = Math.round(168 - ((cycle - 0.45) / 0.3) * 50);
        statusLabel = "MEASURING PULSE...";
      }

      const cx = w * 0.29;
      const cy = h * 0.48;

      ctx.save();
      // Upper arm silhouette + inflating cuff sleeve
      const cuffExpand = cycle < 0.45 ? (cycle / 0.45) * 10 : cycle < 0.75 ? 10 - ((cycle - 0.45) / 0.3) * 6 : 4;
      ctx.fillStyle = "#1E293B";
      ctx.strokeStyle = "#64748B";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 56, cy - 94, 112, 188, 42);
      ctx.fill();
      ctx.stroke();

      // BP Cuff Wrap
      ctx.fillStyle = "#0F766E";
      ctx.strokeStyle = "#5EEAD4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 66 - cuffExpand, cy - 46, 132 + cuffExpand * 2, 92, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F0FDFA";
      ctx.font = "800 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("UPPER-ARM CUFF", cx, cy - 4);
      ctx.font = "700 11px monospace";
      ctx.fillText(`${pressure} mmHg`, cx, cy + 16);

      // Connecting air hose
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 66 + cuffExpand, cy + 10);
      ctx.bezierCurveTo(cx + 125, cy + 40, w * 0.5, cy + 45, w * 0.54, cy + 10);
      ctx.stroke();

      // Digital BP & SpO2 Monitor Console on Right
      const mx = w * 0.54;
      const my = h * 0.22;
      ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
      ctx.strokeStyle = "#2DD4BF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(mx, my, 276, 198, 18);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#5EEAD4";
      ctx.font = "700 11px monospace";
      ctx.fillText(statusLabel, mx + 20, my + 28);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 34px monospace";
      ctx.fillText(
        cycle < 0.75 ? `${pressure} / --` : "118 / 76",
        mx + 20,
        my + 74
      );
      ctx.fillStyle = "#94A3B8";
      ctx.font = "700 11px monospace";
      ctx.fillText("SYS / DIA mmHg  ·  PULSE 72 BPM", mx + 20, my + 98);

      // Live Animated ECG / Pleth Waveform
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveStart = mx + 20;
      const waveW = 236;
      const waveY = my + 148;
      for (let i = 0; i <= waveW; i += 3) {
        const phase = ((i / waveW) * 3 - t * 1.4) % 1;
        const p = phase < 0 ? phase + 1 : phase;
        let dy = 0;
        if (p > 0.42 && p < 0.48) dy = -26;
        else if (p >= 0.48 && p < 0.53) dy = 12;
        else if (p > 0.62 && p < 0.72) dy = -7;
        const x = waveStart + i;
        if (i === 0) ctx.moveTo(x, waveY + dy);
        else ctx.lineTo(x, waveY + dy);
      }
      ctx.stroke();
      ctx.restore();
    };

    let frameTimerId: number | null = null;
    let disposed = false;

    const renderFrame = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.1, (now - lastTimestamp) / 1000);
      lastTimestamp = now;
      if (isPlaying) {
        animTimeRef.current += dt * Math.max(0.5, playbackRate);
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep clinical studio backdrop (semi-transparent over thumbnail for rich visual context)
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "rgba(2, 6, 23, 0.84)");
      bg.addColorStop(0.5, "rgba(15, 23, 42, 0.78)");
      bg.addColorStop(1, "rgba(17, 94, 89, 0.74)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      const t = animTimeRef.current;
      switch (sceneType) {
        case "smart_glasses":
          drawSmartGlassesScene(w, h, t);
          break;
        case "hearing_aid":
          drawHearingAidScene(w, h, t);
          break;
        case "deaf_triage":
          drawDeafTriageScene(w, h, t);
          break;
        case "cpr_guide":
          drawCprGuideScene(w, h, t);
          break;
        case "organ_donation":
          drawOrganDonationScene(w, h, t);
          break;
        default:
          drawVitalsBpScene(w, h, t);
          break;
      }

      if (isPlaying && !disposed) {
        frameTimerId = window.setTimeout(() => {
          if (!disposed) {
            rafId = window.requestAnimationFrame(renderFrame);
          }
        }, 33);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (frameTimerId !== null) window.clearTimeout(frameTimerId);
    };
  }, [sceneType, isPlaying, chapterIndex, playbackRate]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-950"
      data-testid="awareness-motion-stage"
      data-scene-type={sceneType}
    >
      {/* Subtle Contextual Clinical Backdrop Photo */}
      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
        />
      )}

      {/* Live 60fps Animated Clinical Action Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        aria-label={`Animated clinical demonstration for ${chapterTitle}: ${visualSceneTag}`}
        className="relative z-10 w-full h-full block"
      />
    </div>
  );
}
