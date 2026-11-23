import React, { useState, useEffect, useRef } from "react";
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Globe, Sparkles, Shield,
  Heart, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Activity, Smartphone,
  Radio, BedDouble, Siren, Eye, Info, X, ChevronRight, Zap, Stethoscope
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface InteractiveAnnotation {
  id: string;
  timeRange: [number, number]; // seconds [start, end]
  x: number; // percentage on video 0-100
  y: number; // percentage on video 0-100
  title: string;
  category: "biometric" | "neural_ai" | "sms_beacon" | "hospital_handshake";
  badge: string;
  shortDesc: string;
  clinicalRationale: string;
  technicalMechanism: string;
  clinicalImpact: string;
}

export const ONBOARDING_ANNOTATIONS: InteractiveAnnotation[] = [
  {
    id: "ann-wearable-sync",
    timeRange: [0, 15],
    x: 28,
    y: 42,
    title: "Continuous Biometric Wearable Telemetry",
    category: "biometric",
    badge: "Sensors & Vitals",
    shortDesc: "BLE smartwatch telemetry streams pulse rate, SpO2, and BP variance in real-time.",
    clinicalRationale: "Sub-clinical deterioration (e.g. silent hypoxia, paroxysmal tachycardia) often precedes subjective complaints by 15-45 minutes.",
    technicalMechanism: "Bluetooth Low Energy (BLE) GATT health service pushes 1Hz physiological metrics directly to the local Care Preempt edge buffer.",
    clinicalImpact: "Prevents acute decompensation before patients lose consciousness."
  },
  {
    id: "ann-nlp-triage",
    timeRange: [15, 35],
    x: 50,
    y: 35,
    title: "Neural Clinical NLP Severity Scoring",
    category: "neural_ai",
    badge: "AI Decision Engine",
    shortDesc: "Cross-checks symptoms against the 5-tier Emergency Severity Index (ESI).",
    clinicalRationale: "Emergency departments utilize Manchester and ESI scoring to differentiate true life threats from non-urgent presentations.",
    technicalMechanism: "Transformer-based clinical tokenization maps vernacular language in English, Telugu, and Hindi into standardized SNOMED-CT clinical concepts in <300ms.",
    clinicalImpact: "Eliminates triage bottleneck and prevents under-triage of acute coronary syndromes."
  },
  {
    id: "ann-guardian-sms",
    timeRange: [35, 55],
    x: 72,
    y: 45,
    title: "Automated Guardian SMS & GPS Beacon",
    category: "sms_beacon",
    badge: "Zero-Delay SOS",
    shortDesc: "Direct priority SMS triggers to registered family contacts with live GPS location.",
    clinicalRationale: "Family guardians arrive on scene 4x faster than general emergency services in high-density urban areas and can administer initial bystander aid.",
    technicalMechanism: "High-priority SMS gateway broadcasts encrypted GPS lat/long, battery status, and current pulse rate within 1.2 seconds of severity classification.",
    clinicalImpact: "Reduces golden hour time-to-treatment by up to 22 minutes."
  },
  {
    id: "ann-bed-allocation",
    timeRange: [55, 75],
    x: 82,
    y: 65,
    title: "Hospital Trauma Bed & 108 ALS Pre-Allocation",
    category: "hospital_handshake",
    badge: "Clinical Handshake",
    shortDesc: "Reserves Apollo/Yashoda ICU Trauma bay bed and dispatches green corridor ambulance.",
    clinicalRationale: "Pre-arrival hospital notification allows trauma teams to prep CT scanners, defibrillators, and blood products before the patient arrives.",
    technicalMechanism: "HL7/FHIR API handoff locks designated Bed #04 and transmits SBAR summary directly to the attending ER physician's dashboard.",
    clinicalImpact: "Zero ER door-to-balloon time delay for acute myocardial infarctions."
  }
];

export const TRIAGE_EXPLAINER_STAGES = [
  {
    stage: 1,
    timeRange: [0, 15],
    title: "Symptom & Vital Telemetry Capture",
    shortTitle: "1. Intake & Sensors",
    color: "teal",
    description: "Multimodal ingestion: Wearable sensors stream live pulse and SpO2 while citizen speaks or types symptoms in their native tongue.",
    narration: {
      en: "Step 1: Patient vital signs are continuously captured from smart wearables and multimodal voice or text descriptions.",
      te: "దశ 1: స్మార్ట్ వాచ్ మరియు మొబైల్ ద్వారా రోగి పల్స్, ఆక్సిజన్ మరియు లక్షణాల సమాచారం తక్షణమే సేకరించబడుతుంది.",
      hi: "चरण 1: स्मार्ट वियरेबल्स और मरीज के लक्षणों का विवरण रीयల్-टाइम में रिकॉर्ड किया जाता है।"
    },
    metrics: [
      { label: "Pulse", val: "78 BPM", status: "Normal" },
      { label: "SpO2", val: "98%", status: "Optimal" },
      { label: "Latency", val: "12ms", status: "Active" }
    ]
  },
  {
    stage: 2,
    timeRange: [15, 35],
    title: "AI Neural Clinical Severity Scoring",
    shortTitle: "2. AI Clinical Scoring",
    color: "indigo",
    description: "Care Preempt's neural engine analyzes clinical keywords against the Emergency Severity Index (ESI Levels 1 to 5) in under 300ms.",
    narration: {
      en: "Step 2: Care Preempt's AI neural engine evaluates clinical danger signals using the international Emergency Severity Index.",
      te: "దశ 2: కేర్ ప్రీఎమ్ప్ట్ AI వ్యవస్థ అత్యవసర వైద్య ప్రమాణాల ప్రకారం తీవ్రతను కేవలం 300 మిల్లీసెకన్లలో లెక్కిస్తుంది.",
      hi: "चरण 2: केयर प्रीएम्प्ट का AI इंजन अंतरराष्ट्रीय आपातकालीन मानकों के अनुसार गंभीरता का आकलन करता है।"
    },
    metrics: [
      { label: "ESI Level", val: "Level 1 (Critical)", status: "Alert" },
      { label: "Confidence", val: "99.4%", status: "Verified" },
      { label: "Eval Time", val: "280ms", status: "Real-Time" }
    ]
  },
  {
    stage: 3,
    timeRange: [35, 55],
    title: "Automated Guardian SMS & Live GPS Beacon",
    shortTitle: "3. Guardian SMS Beacon",
    color: "amber",
    description: "Zero-delay automated SMS broadcast to registered emergency family contacts with real-time GPS coordinates and vital telemetry.",
    narration: {
      en: "Step 3: An automated emergency SMS and live GPS map link are instantly dispatched to your family guardian.",
      te: "దశ 3: కుటుంబ సంరక్షకుడి ఫోన్‌కు లైవ్ జీపీఎస్ లొకేషన్ మరియు హెచ్చరిక ఎస్ఎంఎస్ ఆటోమేటిక్‌గా పంపబడుతుంది.",
      hi: "चरण 3: परिवार के अभिभावक को तुरंत लाइव जीपीएस लोकेशन और आपातकालीन एसएमएस भेजा जाता है।"
    },
    metrics: [
      { label: "Dispatch", val: "SMS & Beacon", status: "Sent" },
      { label: "Delivery", val: "1.2s", status: "Immediate" },
      { label: "GPS Accuracy", val: "± 3 meters", status: "Locked" }
    ]
  },
  {
    stage: 4,
    timeRange: [55, 75],
    title: "Hospital Trauma Bed Pre-Allocation & 108 Dispatch",
    shortTitle: "4. Hospital Bed & 108",
    color: "rose",
    description: "Automated clinical handshake with Apollo/Yashoda trauma networks: locks ICU Bed #04 and summons 108 ALS ambulance.",
    narration: {
      en: "Step 4: Nearby hospital trauma team reserves Bed #04 while 108 ALS ambulance speeds through green corridors.",
      te: "దశ 4: సమీప ఆసుపత్రిలో బెడ్ #04 రిజర్వ్ చేయబడుతుంది మరియు 108 అడ్వాన్స్‌డ్ అంబులెన్స్ బయలుదేరుతుంది.",
      hi: "चरण 4: निकटतम अस्पताल में आईसीयू बेड आरक्षित होता है और 108 एम्बुलेंस रवाना हो जाती है।"
    },
    metrics: [
      { label: "Hospital", val: "Apollo Trauma", status: "Confirmed" },
      { label: "Bed Allocation", val: "Bay #04 Locked", status: "Ready" },
      { label: "Corridor ETA", val: "4 Minutes", status: "High Priority" }
    ]
  }
];

export function OnboardingVideoExplainer({
  embedded = false,
  onClose,
  backLabel = "Back to Registration",
}: {
  embedded?: boolean;
  onClose?: () => void;
  backLabel?: string;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<"en" | "te" | "hi">("en");
  const [isMuted, setIsMuted] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<InteractiveAnnotation | null>(null);
  const [activeInteractiveScenario, setActiveInteractiveScenario] = useState<string | null>(null);

  const duration = 75; // Total duration 75 seconds
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Determine current stage based on currentTime
  const currentStageIndex = TRIAGE_EXPLAINER_STAGES.findIndex(
    (s) => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
  );
  const currentStage = TRIAGE_EXPLAINER_STAGES[currentStageIndex !== -1 ? currentStageIndex : 0];

  // Active visible annotations
  const visibleAnnotations = ONBOARDING_ANNOTATIONS.filter(
    (a) => currentTime >= a.timeRange[0] && currentTime <= a.timeRange[1]
  );

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = Date.now();
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  // Voice narration using Web Speech API
  const speakCurrentStep = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const text = currentStage.narration[selectedLang];
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedLang === "te") utterance.lang = "te-IN";
      else if (selectedLang === "hi") utterance.lang = "hi-IN";
      else utterance.lang = "en-US";
      utterance.rate = playbackSpeed * 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Audio speech synthesis fallback
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleClose = () => {
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    onClose?.();
  };

  const jumpToStage = (stageNum: number) => {
    const s = TRIAGE_EXPLAINER_STAGES[stageNum - 1];
    if (s) {
      setCurrentTime(s.timeRange[0]);
      setIsPlaying(true);
    }
  };

  const handleAnnotationClick = (ann: InteractiveAnnotation) => {
    setIsPlaying(false);
    setActiveAnnotation(ann);
  };

  const handleTriggerScenario = (type: "chest_pain" | "fever" | "headache") => {
    setActiveInteractiveScenario(type);
    if (type === "chest_pain") {
      setCurrentTime(16); // Jump to AI Severity scoring
      setIsPlaying(true);
    } else if (type === "fever") {
      setCurrentTime(36); // Jump to Guardian alert
      setIsPlaying(true);
    } else {
      setCurrentTime(2); // Jump to Intake
      setIsPlaying(true);
    }
  };

  return (
    <div className={`w-full bg-slate-950 rounded-3xl border border-slate-800 text-white shadow-2xl overflow-hidden ${embedded ? "my-4" : ""}`}>
      {/* Top Banner Header */}
      <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shrink-0">
            <Zap size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm sm:text-base text-white">
                How Care Preempt AI Triage Works
              </h2>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold px-2 py-0.5 rounded-full">
                Interactive Video & Annotations
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visual step-by-step breakdown of automated clinical classification, family SMS, and ICU pre-allocation.
            </p>
          </div>
        </div>

        {/* Language selector & Narration Audio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Globe size={13} className="text-teal-400 mx-1.5" />
            {(["en", "te", "hi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLang(l)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedLang === l ? "bg-teal-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                {l === "en" ? "English" : l === "te" ? "తెలుగు" : "हिन्दी"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={speakCurrentStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
            title="Read clinical instructions aloud"
          >
            <Volume2 size={13} />
            <span className="hidden sm:inline">Voiceover</span>
          </button>

          {onClose && (
            <>
              <button
                type="button"
                onClick={handleClose}
                data-testid="video-back-to-registration-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <ArrowLeft size={13} aria-hidden="true" />
                <span>{backLabel}</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close video player"
                data-testid="video-close-x-btn"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Stage & Dynamic Simulation Canvas */}
      <div className="relative min-h-[360px] sm:min-h-[400px] bg-slate-950 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Subtle Ambient Background Grids */}
        <div className="absolute inset-0 sg-grid-bg opacity-15 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Status Badge */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
              {currentStage.title}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              (Stage {currentStage.stage}/4 · {Math.floor(currentTime)}s / {duration}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">Click any annotation hotspot to inspect:</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-md">
              <Sparkles size={11} /> {visibleAnnotations.length} Hotspot{visibleAnnotations.length > 1 ? "s" : ""} Active
            </span>
          </div>
        </div>

        {/* Central Graphic Simulation SVG with Interactive Hotspots */}
        <div className="relative w-full flex-1 flex items-center justify-center min-h-[220px] sm:min-h-[260px] bg-slate-900/40 rounded-2xl border border-slate-800/80 p-2 overflow-hidden">
          
          {/* ========================================================================= */}
          {/* STAGE 1: BIOMETRIC WEARABLE & MULTIMODAL INTAKE */}
          {/* ========================================================================= */}
          {currentStage.stage === 1 && (
            <svg viewBox="0 0 600 240" className="w-full h-full max-h-[260px] drop-shadow-xl select-none">
              <defs>
                <linearGradient id="streamPulse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>

              {/* Citizen with Smartwatch on Left */}
              <g transform="translate(60, 40)">
                <ellipse cx="50" cy="35" rx="22" ry="24" fill="#fed7aa" stroke="#fdba74" strokeWidth="2" />
                {/* Hair */}
                <path d="M 28 30 Q 50 10 72 30 Q 75 40 70 42 Q 50 20 30 42 Z" fill="#1e293b" />
                {/* Torso */}
                <rect x="25" y="60" width="50" height="70" rx="8" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
                {/* Arm wearing Smartwatch */}
                <line x1="75" y1="75" x2="115" y2="90" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" />
                {/* Smartwatch with Neon Pulse Sensor */}
                <rect x="110" y="80" width="22" height="22" rx="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                <circle cx="121" cy="91" r="5" fill="#ef4444" className="animate-ping" opacity="0.8" />
                <circle cx="121" cy="91" r="3" fill="#ef4444" />
                <text x="50" y="150" fill="#99f6e4" fontSize="10" fontWeight="bold" textAnchor="middle">User / Citizen</text>
              </g>

              {/* Live BLE Radio Waves */}
              <g transform="translate(200, 100)">
                <path d="M 0 0 Q 30 -30 60 0 T 120 0" fill="none" stroke="url(#streamPulse)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                <path d="M 0 15 Q 30 -15 60 15 T 120 15" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
                <text x="60" y="-12" fill="#2dd4bf" fontSize="9" fontWeight="bold" textAnchor="middle">BLE TELEMETRY (1Hz)</text>
              </g>

              {/* Smartphone Processing Hub on Right */}
              <g transform="translate(350, 25)">
                <rect x="0" y="0" width="160" height="180" rx="14" fill="#020617" stroke="#334155" strokeWidth="2.5" />
                <rect x="8" y="8" width="144" height="164" rx="10" fill="#0f172a" />
                
                {/* App Screen Header */}
                <rect x="8" y="8" width="144" height="26" fill="#0d9488" rx="8" />
                <text x="80" y="24" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">CARE PREEMPT TRIAGE</text>

                {/* Live Sensor Tiles */}
                <g transform="translate(16, 42)">
                  <rect x="0" y="0" width="60" height="36" rx="6" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1" />
                  <text x="6" y="14" fill="#94a3b8" fontSize="7">PULSE RATE</text>
                  <text x="6" y="28" fill="#38bdf8" fontSize="12" fontWeight="extrabold">78 <tspan fontSize="7">BPM</tspan></text>
                </g>

                <g transform="translate(82, 42)">
                  <rect x="0" y="0" width="60" height="36" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
                  <text x="6" y="14" fill="#94a3b8" fontSize="7">SpO2 LEVEL</text>
                  <text x="6" y="28" fill="#34d399" fontSize="12" fontWeight="extrabold">98% <tspan fontSize="7">O2</tspan></text>
                </g>

                {/* Multilingual Voice Ingestion Bubble */}
                <g transform="translate(16, 88)">
                  <rect x="0" y="0" width="128" height="42" rx="6" fill="#022c22" stroke="#14b8a6" strokeWidth="1" />
                  <text x="8" y="14" fill="#2dd4bf" fontSize="8" fontWeight="bold">VOICE INTAKE (TE/HI/EN):</text>
                  <text x="8" y="28" fill="#e2e8f0" fontSize="8">"Chest tightness radiating to arm"</text>
                </g>

                {/* Ingestion Status Bar */}
                <rect x="16" y="140" width="128" height="18" rx="4" fill="#047857" />
                <text x="80" y="152" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">✓ SENSORS SYNCED & STREAMING</text>
              </g>
            </svg>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: AI NEURAL CLINICAL ENGINE (ESI LEVELS 1 TO 5) */}
          {/* ========================================================================= */}
          {currentStage.stage === 2 && (
            <svg viewBox="0 0 600 240" className="w-full h-full max-h-[260px] drop-shadow-xl select-none">
              {/* Neural Brain & Network Core */}
              <g transform="translate(80, 25)">
                <rect x="0" y="0" width="190" height="190" rx="14" fill="#090d16" stroke="#6366f1" strokeWidth="2" />
                <text x="95" y="24" fill="#818cf8" fontSize="10" fontWeight="extrabold" textAnchor="middle">NEURAL NLP TRIAGE CORE</text>
                
                {/* Connecting Synaptic Nodes */}
                <circle cx="50" cy="65" r="9" fill="#4f46e5" stroke="#a5b4fc" strokeWidth="2" className="animate-pulse" />
                <circle cx="140" cy="65" r="9" fill="#4f46e5" stroke="#a5b4fc" strokeWidth="2" className="animate-pulse" />
                <circle cx="95" cy="115" r="14" fill="#7c3aed" stroke="#c084fc" strokeWidth="2.5" />
                <circle cx="55" cy="160" r="9" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
                <circle cx="135" cy="160" r="9" fill="#991b1b" stroke="#f87171" strokeWidth="2" className="animate-pulse" />

                {/* Connecting Circuit Lines */}
                <line x1="50" y1="65" x2="95" y2="115" stroke="#818cf8" strokeWidth="2" />
                <line x1="140" y1="65" x2="95" y2="115" stroke="#818cf8" strokeWidth="2" />
                <line x1="95" y1="115" x2="55" y2="160" stroke="#34d399" strokeWidth="1.5" />
                <line x1="95" y1="115" x2="135" y2="160" stroke="#f87171" strokeWidth="2.5" />

                <text x="95" y="119" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">AI NLP</text>
              </g>

              {/* Data Flow Bridge */}
              <g transform="translate(280, 110)">
                <path d="M 0 0 L 40 0" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 4" className="animate-pulse" />
                <polygon points="40,-4 48,0 40,4" fill="#f59e0b" />
                <text x="24" y="-8" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">INDEXING</text>
              </g>

              {/* Emergency Severity Index Matrix on Right */}
              <g transform="translate(340, 25)">
                <rect x="0" y="0" width="200" height="190" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                <text x="100" y="22" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle">EMERGENCY SEVERITY INDEX</text>

                {/* ESI Level 1: Critical (Active highlighted) */}
                <g transform="translate(12, 34)">
                  <rect x="0" y="0" width="176" height="32" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="16" cy="16" r="6" fill="#ef4444" className="animate-ping" />
                  <circle cx="16" cy="16" r="4" fill="#ef4444" />
                  <text x="28" y="16" fill="#fca5a5" fontSize="9" fontWeight="extrabold">LEVEL 1: CRITICAL THREAT</text>
                  <text x="28" y="26" fill="#fecaca" fontSize="7.5">Immediate resuscitation required</text>
                </g>

                {/* ESI Level 2: High */}
                <g transform="translate(12, 72)">
                  <rect x="0" y="0" width="176" height="26" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="1" opacity="0.8" />
                  <text x="14" y="16" fill="#fde68a" fontSize="8.5" fontWeight="bold">LEVEL 2: HIGH URGENCY</text>
                </g>

                {/* ESI Level 3: Moderate */}
                <g transform="translate(12, 104)">
                  <rect x="0" y="0" width="176" height="26" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" opacity="0.6" />
                  <text x="14" y="16" fill="#94a3b8" fontSize="8.5">LEVEL 3: MODERATE (Clinic)</text>
                </g>

                {/* Classification Decision Result */}
                <g transform="translate(12, 138)">
                  <rect x="0" y="0" width="176" height="42" rx="6" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
                  <text x="10" y="16" fill="#fecaca" fontSize="8.5" fontWeight="extrabold">TRIAGE DECISION: TRIGGER SOS</text>
                  <text x="10" y="28" fill="#ffffff" fontSize="7.5">Cardiac / Chest pain red-flag detected</text>
                  <text x="10" y="38" fill="#34d399" fontSize="7.5" fontWeight="bold">Confidence: 99.4% · Auto-SMS Authorized</text>
                </g>
              </g>
            </svg>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: AUTOMATED GUARDIAN EMERGENCY SMS & GPS BEACON */}
          {/* ========================================================================= */}
          {currentStage.stage === 3 && (
            <svg viewBox="0 0 600 240" className="w-full h-full max-h-[260px] drop-shadow-xl select-none">
              {/* Radio Tower / Care Preempt SMS Gateway on Left */}
              <g transform="translate(60, 30)">
                <line x1="60" y1="30" x2="60" y2="180" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="60,25 35,180 85,180" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                <circle cx="60" cy="25" r="8" fill="#38bdf8" />
                {/* Radiating Beacon Pulses */}
                <circle cx="60" cy="25" r="16" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-ping" opacity="0.8" />
                <circle cx="60" cy="25" r="28" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
                <text x="60" y="200" fill="#7dd3fc" fontSize="9" fontWeight="bold" textAnchor="middle">SMS GATEWAY</text>
              </g>

              {/* Encrypted SOS Signal Beam */}
              <g transform="translate(160, 100)">
                <path d="M 0 0 L 80 0" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 6" className="animate-pulse" />
                <polygon points="80,-5 90,0 80,5" fill="#ef4444" />
                <text x="45" y="-10" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">ZERO-DELAY SMS</text>
              </g>

              {/* Family Guardian Receiving Smartphone on Right */}
              <g transform="translate(280, 20)">
                <rect x="0" y="0" width="260" height="195" rx="14" fill="#090d16" stroke="#f59e0b" strokeWidth="2" />
                
                {/* Phone Top Header */}
                <rect x="0" y="0" width="260" height="28" rx="10" fill="#78350f" />
                <text x="130" y="18" fill="#fef3c7" fontSize="9" fontWeight="extrabold" textAnchor="middle">
                  EMERGENCY FAMILY GUARDIAN ALERT
                </text>

                {/* Simulated Real-Time SMS Message Bubble */}
                <g transform="translate(12, 38)">
                  <rect x="0" y="0" width="236" height="110" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="12" y="18" fill="#f87171" fontSize="9.5" fontWeight="extrabold">🚨 CARE PREEMPT RED ALERT</text>
                  <text x="12" y="32" fill="#e2e8f0" fontSize="8">"Critical symptoms detected for Ramesh Sharma (24 yrs)."</text>
                  <text x="12" y="44" fill="#e2e8f0" fontSize="8">"High-Severity Acute Chest Pain & Pulse Anomaly (82 BPM)."</text>
                  
                  {/* GPS Coordinates & Live Pin */}
                  <rect x="12" y="52" width="212" height="34" rx="5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                  <text x="20" y="66" fill="#38bdf8" fontSize="8" fontWeight="bold">📍 LIVE GPS BEACON:</text>
                  <text x="20" y="78" fill="#facc15" fontSize="7.5" fontFamily="monospace">17.4325° N, 78.4071° E (Hyderabad)</text>
                  
                  <text x="12" y="98" fill="#34d399" fontSize="8" fontWeight="bold">
                    ✓ 108 Ambulance ALS Dispatched · ETA 4 Mins
                  </text>
                </g>

                {/* Guardian Quick Action Bar */}
                <g transform="translate(12, 155)">
                  <rect x="0" y="0" width="112" height="28" rx="6" fill="#15803d" />
                  <text x="56" y="17" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">CALL GUARDIAN</text>

                  <rect x="124" y="0" width="112" height="28" rx="6" fill="#0369a1" />
                  <text x="180" y="17" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">VIEW LIVE GPS</text>
                </g>
              </g>
            </svg>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: 108 AMBULANCE DISPATCH & HOSPITAL ICU PRE-ALLOCATION */}
          {/* ========================================================================= */}
          {currentStage.stage === 4 && (
            <svg viewBox="0 0 600 240" className="w-full h-full max-h-[260px] drop-shadow-xl select-none">
              {/* 108 ALS Ambulance En-Route on Left */}
              <g transform="translate(40, 50)">
                {/* Ambulance chassis */}
                <path d="M 0 35 L 45 35 L 60 10 L 160 10 L 160 80 L 0 80 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                <polygon points="46,33 58,14 80,14 80,33" fill="#0284c7" opacity="0.6" />
                <rect x="0" y="45" width="160" height="12" fill="#ef4444" />
                <text x="80" y="54" fill="#ffffff" fontSize="7.5" fontWeight="extrabold" textAnchor="middle">108 ALS UNIT</text>
                {/* Wheels */}
                <circle cx="35" cy="80" r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="125" cy="80" r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                {/* Flashing roof sirens */}
                <circle cx="85" cy="4" r="6" fill="#ef4444" className="animate-ping" opacity="0.8" />
                <circle cx="85" cy="4" r="5" fill="#ef4444" />
                <circle cx="105" cy="4" r="5" fill="#3b82f6" />
                <text x="80" y="115" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">108 ALS EN-ROUTE</text>
                <text x="80" y="126" fill="#94a3b8" fontSize="7.5" textAnchor="middle">Green Corridor Priority</text>
              </g>

              {/* Handshake Telemetry Waves */}
              <g transform="translate(220, 80)">
                <path d="M 0 0 Q 30 -20 60 0 T 100 0" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="5 3" className="animate-pulse" />
                <text x="50" y="-10" fill="#22d3ee" fontSize="8" fontWeight="bold" textAnchor="middle">HL7 / FHIR SYNC</text>
              </g>

              {/* Apollo Hospital Trauma Center & ICU Bed #04 on Right */}
              <g transform="translate(340, 20)">
                <rect x="0" y="0" width="220" height="195" rx="14" fill="#0b1329" stroke="#10b981" strokeWidth="2" />
                <rect x="0" y="0" width="220" height="28" rx="10" fill="#064e3b" />
                <text x="110" y="18" fill="#a7f3d0" fontSize="9" fontWeight="extrabold" textAnchor="middle">
                  APOLLO TRAUMA ER · BED #04 LOCKED
                </text>

                {/* Pre-Arrival Telemetry Screen */}
                <g transform="translate(12, 36)">
                  <rect x="0" y="0" width="196" height="85" rx="6" fill="#020617" stroke="#334155" strokeWidth="1" />
                  <text x="10" y="16" fill="#38bdf8" fontSize="8" fontWeight="bold">PRE-ARRIVAL PHYSICIAN HANDOFF</text>
                  <text x="10" y="30" fill="#94a3b8" fontSize="7.5">Attending: <tspan fill="#ffffff" fontWeight="bold">Dr. Ananya Sen, MD</tspan></text>
                  
                  {/* ECG Mini Wave */}
                  <path d="M 10 50 L 30 50 L 35 40 L 40 60 L 45 46 L 50 50 L 100 50" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <text x="110" y="52" fill="#10b981" fontSize="10" fontWeight="bold">82 BPM</text>

                  {/* SBAR Status */}
                  <rect x="10" y="62" width="176" height="16" rx="3" fill="#065f46" />
                  <text x="98" y="73" fill="#ecfdf5" fontSize="7" fontWeight="bold" textAnchor="middle">
                    ✓ SBAR PACKET VERIFIED · DEFIBRILLATOR PREPPED
                  </text>
                </g>

                {/* Bed Allocation Badge */}
                <g transform="translate(12, 130)">
                  <rect x="0" y="0" width="196" height="52" rx="6" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />
                  <text x="10" y="18" fill="#2dd4bf" fontSize="9" fontWeight="extrabold">TRAUMA ICU BAY #04 RESERVED</text>
                  <text x="10" y="30" fill="#ccfbf1" fontSize="7.5">Patient admittance barcode generated.</text>
                  <text x="10" y="42" fill="#a7f3d0" fontSize="7.5" fontWeight="bold">Family Guardian notified via automated SMS.</text>
                </g>
              </g>
            </svg>
          )}

          {/* ========================================================================= */}
          {/* CLICKABLE INTERACTIVE ANNOTATION HOTSPOT PINS OVERLAY */}
          {/* ========================================================================= */}
          {visibleAnnotations.map((ann) => (
            <button
              key={ann.id}
              type="button"
              onClick={() => handleAnnotationClick(ann)}
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer focus:outline-none"
              title={`Inspect Annotation: ${ann.title}`}
            >
              <div className="relative flex items-center justify-center">
                {/* Pulsing beacon radar */}
                <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-extrabold text-[10px] group-hover:scale-125 transition-transform">
                  ?
                </div>
              </div>

              {/* Tooltip Card on Hover */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 border border-amber-400/80 rounded-xl shadow-2xl text-left pointer-events-none z-30">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Sparkles size={11} />
                  <span>{ann.badge}</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 leading-snug">
                  {ann.title}
                </div>
                <div className="text-[10px] text-slate-300 mt-1 leading-tight">
                  {ann.shortDesc}
                </div>
                <div className="text-[9px] text-teal-400 font-bold mt-1.5 flex items-center gap-1">
                  <span>Click to view clinical breakdown</span>
                  <ArrowRight size={10} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Synchronized Real-Time Clinical Narration Bar */}
        <div className="relative z-10 mt-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0 animate-pulse" />
            <span className="text-xs text-slate-200 font-medium leading-relaxed">
              {currentStage.narration[selectedLang]}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentStage.metrics.map((m, idx) => (
              <div key={idx} className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono">
                <span className="text-slate-400 mr-1.5">{m.label}:</span>
                <span className="font-bold text-teal-300">{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Timeline Controls */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Play / Pause / Restart */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-9 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Play Breakdown"}</span>
            </Button>

            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw size={14} />
            </button>

            {/* Playback Speed */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-500 font-mono">Speed:</span>
              {[0.75, 1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Time Scrubber Bar with Annotation Pins */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}
            </span>
            <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">1:15</span>
          </div>
        </div>
      </div>

      {/* 4 Step-by-Step Visual Breakdown Clickable Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 bg-slate-900/60 border-t border-slate-800">
        {TRIAGE_EXPLAINER_STAGES.map((s) => {
          const isActive = currentStage.stage === s.stage;
          return (
            <button
              key={s.stage}
              type="button"
              onClick={() => jumpToStage(s.stage)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                    isActive ? "text-teal-400" : "text-slate-500"
                  }`}>
                    PHASE {s.stage}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {s.timeRange[0]}s-{s.timeRange[1]}s
                  </span>
                </div>
                <div className={`text-xs font-bold mt-1 line-clamp-1 ${
                  isActive ? "text-white" : "text-slate-300"
                }`}>
                  {s.title}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 truncate">{s.shortTitle}</span>
                <ChevronRight size={13} className={isActive ? "text-teal-400" : "text-slate-600"} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Triage Sandbox Trigger ("Test AI Triage Live") */}
      <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-teal-400" />
          <span className="text-xs font-bold text-white">Interactive Scenario Test-Drive:</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click a sample symptom to observe Care Preempt's triage response in action:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTriggerScenario("chest_pain")}
            className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-semibold cursor-pointer"
          >
            🚨 Severe Chest Pain (Critical ESI-1)
          </button>
          <button
            type="button"
            onClick={() => handleTriggerScenario("fever")}
            className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 text-xs font-semibold cursor-pointer"
          >
            ⚠️ High Fever Child (High ESI-2)
          </button>
          <button
            type="button"
            onClick={() => handleTriggerScenario("headache")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            🩹 Mild Migraine (Low ESI-4)
          </button>
        </div>
      </div>

      {/* Interactive Annotation Inspection Modal */}
      {activeAnnotation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  {activeAnnotation.badge}
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1.5">
                  {activeAnnotation.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAnnotation(null)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeAnnotation.shortDesc}
            </p>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-teal-400 block mb-1">Clinical Rationale:</span>
                <span className="text-slate-300 leading-relaxed">{activeAnnotation.clinicalRationale}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 block mb-1">Technical Implementation:</span>
                <span className="text-slate-300 leading-relaxed">{activeAnnotation.technicalMechanism}</span>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-emerald-300">
                <span className="font-bold block mb-1">Emergency Impact:</span>
                <span className="leading-relaxed">{activeAnnotation.clinicalImpact}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  setActiveAnnotation(null);
                  setIsPlaying(true);
                }}
                className="h-10 px-5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
              >
                <span>Got It & Resume Breakdown</span>
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
