import React, { useState } from "react";
import type { AssistiveDeviceVisualKey } from "../../types";
import smartVisionGlassesImg from "../../assets/images/smart_vision_glasses_1795253557994.jpg";
import boneConductionSpecsImg from "../../assets/images/bone_conduction_specs_1795253463508.jpg";
import digitalHearingAidImg from "../../assets/images/digital_hearing_aid_1795253471964.jpg";
import mobilityAssistAidImg from "../../assets/images/mobility_assist_aid_1795253458424.jpg";

export const DEVICE_VISUAL_ASSETS: Partial<Record<AssistiveDeviceVisualKey, string>> = {
  smart_vision_glasses: smartVisionGlassesImg,
  bone_conduction_specs: boneConductionSpecsImg,
  digital_hearing_aid: digitalHearingAidImg,
  mobility_assist_aid: mobilityAssistAidImg,
};

function ClinicalVitalsIllustration({
  visualKey,
  label,
}: {
  visualKey: AssistiveDeviceVisualKey;
  label: string;
}) {
  if (visualKey === "bp_monitor") {
    return (
      <div
        role="img"
        aria-label={label}
        className="w-full h-full bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 360 200" className="w-full h-full max-h-44" aria-hidden="true">
          {/* Upper-arm Cuff */}
          <rect x="26" y="42" width="112" height="114" rx="18" fill="#1E293B" />
          <rect x="40" y="54" width="84" height="90" rx="10" fill="#334155" />
          <rect x="52" y="72" width="60" height="10" rx="4" fill="#14B8A6" opacity="0.85" />
          <text x="82" y="106" textAnchor="middle" fill="#CBD5E1" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700">
            UPPER-ARM
          </text>
          <text x="82" y="121" textAnchor="middle" fill="#94A3B8" fontFamily="Inter, sans-serif" fontSize="9">
            22–42 cm CUFF
          </text>
          {/* Air Hose */}
          <path d="M138 118 C158 118, 158 144, 178 144" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          {/* Digital Monitor Body */}
          <rect x="176" y="24" width="154" height="152" rx="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
          <rect x="190" y="38" width="126" height="86" rx="10" fill="#0F172A" />
          <text x="200" y="55" fill="#5EEAD4" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">
            SYS / DIA mmHg
          </text>
          <text x="200" y="92" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="27" fontWeight="800">
            118/76
          </text>
          <circle cx="201" cy="110" r="3.5" fill="#10B981" />
          <text x="209" y="113.5" fill="#A7F3D0" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700">
            72 BPM · VOICE ON
          </text>
          {/* Start Button */}
          <circle cx="253" cy="150" r="15" fill="#0F766E" />
          <text x="253" y="154" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="800">
            START
          </text>
        </svg>
      </div>
    );
  }

  if (visualKey === "pulse_oximeter") {
    return (
      <div
        role="img"
        aria-label={label}
        className="w-full h-full bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 360 200" className="w-full h-full max-h-44" aria-hidden="true">
          {/* Oximeter Clip Shell */}
          <rect x="92" y="32" width="176" height="136" rx="28" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
          <rect x="108" y="46" width="144" height="84" rx="14" fill="#0F172A" />
          {/* SpO2 Readout */}
          <text x="122" y="65" fill="#38BDF8" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700">
            SpO2 %
          </text>
          <text x="122" y="100" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontSize="32" fontWeight="800">
            98
          </text>
          {/* Pulse Readout */}
          <text x="194" y="65" fill="#34D399" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700">
            PR bpm
          </text>
          <text x="194" y="100" fill="#6EE7B7" fontFamily="JetBrains Mono, monospace" fontSize="28" fontWeight="800">
            72
          </text>
          {/* Pleth Wave */}
          <path
            d="M120 118 L142 118 L150 108 L157 121 L166 112 L175 118 L196 118 L204 108 L211 121 L220 112 L229 118 L242 118"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Power Button */}
          <circle cx="180" cy="148" r="10" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          <circle cx="180" cy="148" r="3.5" fill="#0F766E" />
        </svg>
      </div>
    );
  }

  if (visualKey === "glucometer") {
    return (
      <div
        role="img"
        aria-label={label}
        className="w-full h-full bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 360 200" className="w-full h-full max-h-44" aria-hidden="true">
          {/* Glucometer Body */}
          <rect x="112" y="18" width="136" height="142" rx="24" fill="#0F172A" />
          <rect x="126" y="34" width="108" height="82" rx="12" fill="#ECFDF5" />
          <text x="180" y="53" textAnchor="middle" fill="#047857" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="700">
            FASTING GLUCOSE
          </text>
          <text x="180" y="88" textAnchor="middle" fill="#0F172A" fontFamily="JetBrains Mono, monospace" fontSize="30" fontWeight="800">
            104
          </text>
          <text x="180" y="105" textAnchor="middle" fill="#0F766E" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700">
            mg/dL · NORMAL
          </text>
          {/* Range Indicator Bar */}
          <rect x="136" y="128" width="26" height="6" rx="3" fill="#38BDF8" />
          <rect x="167" y="128" width="26" height="6" rx="3" fill="#10B981" />
          <rect x="198" y="128" width="26" height="6" rx="3" fill="#F59E0B" />
          {/* Inserted Test Strip */}
          <rect x="167" y="156" width="26" height="32" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
          <rect x="174" y="178" width="12" height="7" rx="2" fill="#EF4444" opacity="0.85" />
        </svg>
      </div>
    );
  }

  if (visualKey === "ir_thermometer") {
    return (
      <div
        role="img"
        aria-label={label}
        className="w-full h-full bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-100 flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 360 200" className="w-full h-full max-h-44" aria-hidden="true">
          {/* IR Scanner Head & Handle */}
          <path
            d="M84 52 C84 36, 98 28, 122 28 L230 28 C246 28, 256 38, 256 54 L256 84 C256 96, 246 106, 232 106 L192 106 L176 174 C172 184, 160 186, 148 184 L132 180 C122 178, 118 168, 122 158 L138 106 L104 106 C92 106, 84 96, 84 82 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="3"
          />
          {/* Infrared Sensor Waves */}
          <path d="M72 56 Q62 67 72 78" fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 48 Q44 67 58 86" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          {/* Backlit LCD Display */}
          <rect x="134" y="42" width="104" height="50" rx="10" fill="#065F46" />
          <text x="186" y="61" textAnchor="middle" fill="#A7F3D0" fontFamily="Inter, sans-serif" fontSize="8.5" fontWeight="700">
            NON-CONTACT IR · 1s
          </text>
          <text x="186" y="83" textAnchor="middle" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="22" fontWeight="800">
            98.6°F
          </text>
          {/* Trigger */}
          <rect x="150" y="114" width="16" height="24" rx="6" fill="#0F766E" />
        </svg>
      </div>
    );
  }

  if (visualKey === "nebulizer_ecg") {
    return (
      <div
        role="img"
        aria-label={label}
        className="w-full h-full bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 360 200" className="w-full h-full max-h-44" aria-hidden="true">
          {/* Portable Mesh Nebulizer */}
          <rect x="42" y="46" width="84" height="122" rx="18" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="54" y="30" width="60" height="26" rx="8" fill="#CCFBF1" stroke="#0F766E" strokeWidth="2" />
          <path d="M114 43 L144 36 L144 54 L114 47 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="154" cy="40" r="3" fill="#14B8A6" opacity="0.75" />
          <circle cx="163" cy="34" r="2.5" fill="#14B8A6" opacity="0.55" />
          <circle cx="164" cy="46" r="2" fill="#14B8A6" opacity="0.65" />
          <circle cx="84" cy="112" r="14" fill="#0F766E" />
          <text x="84" y="148" textAnchor="middle" fill="#334155" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">
            MESH NEBULIZER
          </text>

          {/* Compact ECG Card */}
          <rect x="176" y="42" width="150" height="126" rx="16" fill="#0F172A" />
          <text x="190" y="62" fill="#5EEAD4" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="700">
            30s POCKET ECG · NSR
          </text>
          <path
            d="M188 100 L206 100 L212 92 L218 100 L224 100 L230 72 L237 116 L243 96 L252 100 L268 100 L274 92 L280 100 L286 100 L292 72 L299 116 L305 96 L316 100"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="192" y="132" width="52" height="22" rx="6" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
          <rect x="260" y="132" width="52" height="22" rx="6" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
          <text x="218" y="146" textAnchor="middle" fill="#CBD5E1" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="700">
            PAD L
          </text>
          <text x="286" y="146" textAnchor="middle" fill="#CBD5E1" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="700">
            PAD R
          </text>
        </svg>
      </div>
    );
  }

  return null;
}

function DeviceSvgFallback({
  visualKey,
  label,
}: {
  visualKey: AssistiveDeviceVisualKey;
  label: string;
}) {
  const vitalsGraphic = ClinicalVitalsIllustration({ visualKey, label });
  if (vitalsGraphic) return vitalsGraphic;

  return (
    <div
      role="img"
      aria-label={label}
      className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-700"
    >
      {visualKey === "smart_vision_glasses" ||
      visualKey === "bone_conduction_specs" ? (
        <svg viewBox="0 0 240 96" className="w-44 h-20" aria-hidden="true">
          <rect
            x="24"
            y="24"
            width="74"
            height="48"
            rx="14"
            fill="white"
            stroke="#0F172A"
            strokeWidth="4"
          />
          <rect
            x="142"
            y="24"
            width="74"
            height="48"
            rx="14"
            fill="white"
            stroke="#0F172A"
            strokeWidth="4"
          />
          <path d="M98 40 Q120 30 142 40" fill="none" stroke="#0F172A" strokeWidth="4" />
          <circle cx="120" cy="37" r="5" fill="#0F766E" />
          <line x1="8" y1="36" x2="24" y2="36" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
          <line x1="216" y1="36" x2="232" y2="36" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ) : visualKey === "digital_hearing_aid" ? (
        <svg viewBox="0 0 240 96" className="w-44 h-20" aria-hidden="true">
          <path
            d="M84 74 C60 74 56 36 82 26 C100 18 112 36 102 52 C96 62 94 74 84 74 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="4"
          />
          <path
            d="M156 74 C180 74 184 36 158 26 C140 18 128 36 138 52 C144 62 146 74 156 74 Z"
            fill="#FFFFFF"
            stroke="#0F766E"
            strokeWidth="4"
          />
          <circle cx="84" cy="40" r="4" fill="#0F766E" />
          <circle cx="156" cy="40" r="4" fill="#0F172A" />
        </svg>
      ) : (
        <svg viewBox="0 0 240 96" className="w-44 h-20" aria-hidden="true">
          <rect
            x="32"
            y="34"
            width="104"
            height="28"
            rx="14"
            fill="#0F172A"
          />
          <rect x="112" y="34" width="8" height="28" fill="#0F766E" />
          <rect
            x="156"
            y="26"
            width="56"
            height="44"
            rx="10"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3"
          />
          <circle cx="174" cy="48" r="9" fill="#0F766E" />
          <circle cx="196" cy="48" r="6" fill="#64748B" />
        </svg>
      )}
      <span className="text-[11px] font-semibold text-slate-600 mt-1 text-center">
        {label}
      </span>
    </div>
  );
}

export function DeviceVisual({
  visualKey,
  alt,
  caption,
  className = "",
}: {
  visualKey: AssistiveDeviceVisualKey;
  alt: string;
  caption?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = DEVICE_VISUAL_ASSETS[visualKey];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80 aspect-[16/9] ${className}`}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <DeviceSvgFallback visualKey={visualKey} label={caption || alt} />
      )}
    </div>
  );
}
