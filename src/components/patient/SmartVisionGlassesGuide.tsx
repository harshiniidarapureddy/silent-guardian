import React, { useState } from "react";
import {
  Bluetooth,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  MapPin,
  Radio,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAccessibility } from "../../context/AccessibilityContext";
import {
  SMART_VISION_GLASSES_HOTSPOTS,
  SMART_VISION_GLASSES_STEPS,
  type SmartVisionHotspot,
} from "../../lib/accessibilityLogic";
import { DEVICE_VISUAL_ASSETS } from "./DeviceVisual";

function StepIcon({
  stepId,
  size = 18,
}: {
  stepId: "capture" | "processing" | "output" | "sos_sync";
  size?: number;
}) {
  if (stepId === "capture") return <Camera size={size} aria-hidden="true" />;
  if (stepId === "processing") return <Cpu size={size} aria-hidden="true" />;
  if (stepId === "output") return <Volume2 size={size} aria-hidden="true" />;
  return <ShieldAlert size={size} aria-hidden="true" />;
}

export function SmartVisionGlassesGuide() {
  const {
    devices,
    pairSmartVisionGlasses,
    speak,
    announceVisualAlert,
  } = useAccessibility();

  const [activeHotspotId, setActiveHotspotId] =
    useState<SmartVisionHotspot["id"]>("camera");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [sosDemoActive, setSosDemoActive] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const pairedGlasses = devices.find(
    (d) => d.type === "smart_glasses" && d.connected
  );

  const activeHotspot =
    SMART_VISION_GLASSES_HOTSPOTS.find((h) => h.id === activeHotspotId) ||
    SMART_VISION_GLASSES_HOTSPOTS[0];
  const activeStep = SMART_VISION_GLASSES_STEPS[activeStepIndex];

  const handleSelectHotspot = (hotspot: SmartVisionHotspot) => {
    setActiveHotspotId(hotspot.id);
    const matchingStepIdx = SMART_VISION_GLASSES_STEPS.findIndex(
      (s) => s.hotspotId === hotspot.id
    );
    if (matchingStepIdx >= 0) {
      setActiveStepIndex(matchingStepIdx);
    }
  };

  const handleSelectStep = (idx: number) => {
    setActiveStepIndex(idx);
    const step = SMART_VISION_GLASSES_STEPS[idx];
    if (step) {
      setActiveHotspotId(step.hotspotId);
    }
  };

  const handlePairGlasses = () => {
    const paired = pairSmartVisionGlasses();
    toast.success(`${paired.name} paired and synced with Care Preempt.`);
    speak(
      `Smart Vision Glasses paired with Care Preempt. Battery is at ${paired.batteryLevel} percent. OCR reading and emergency voice alerts are ready.`,
      {
        title: "Smart Vision Glasses Paired",
        source: "guidance",
      }
    );
  };

  const handleToggleSosDemo = () => {
    const nextState = !sosDemoActive;
    setSosDemoActive(nextState);

    if (nextState) {
      const demoReadout =
        "Smart Vision Glasses SOS Demo active. Obstacle clear ahead. Care Preempt alert: Evening blood pressure medication due in 15 minutes. Live GPS location and emergency medical profile ready to share with family guardian Sita Sharma.";
      speak(demoReadout, {
        priority: "critical",
        title: "Smart Vision Glasses · SOS & Alert Readout Demo",
        source: "alert",
        forceVisualBanner: true,
      });
      announceVisualAlert(
        "Smart Vision Glasses · SOS & Alert Readout Demo",
        demoReadout,
        "warning"
      );
      toast.success(
        "SOS / Read Alerts Aloud demo active — spoken cue & visual transcript updated."
      );
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
      toast.info("SOS / Read Alerts Aloud demo stopped.");
    }
  };

  return (
    <section
      aria-labelledby="smart-vision-guide-heading"
      data-testid="smart-vision-glasses-guide"
      className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
    >
      {/* Top Spotlight Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Vision Support Spotlight · For Blind & Visually Impaired Users
          </p>
          <h2
            id="smart-vision-guide-heading"
            className="font-display text-xl font-bold text-slate-900 tracking-tight"
          >
            How AI Smart Vision Glasses Work with Care Preempt
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Explore the four onboard hardware components and step-by-step workflow showing how specialized AI eyewear scans text, detects hazards, whispers open-ear guidance, and syncs emergency alerts with Care Preempt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <Button
            type="button"
            onClick={handlePairGlasses}
            data-testid="spotlight-pair-glasses-btn"
            className={`text-xs font-semibold ${
              pairedGlasses
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : "bg-teal-700 hover:bg-teal-800 text-white"
            }`}
          >
            {pairedGlasses ? (
              <>
                <CheckCircle2 size={14} className="mr-1.5" aria-hidden="true" />
                Smart Glasses Paired ({pairedGlasses.batteryLevel}%)
              </>
            ) : (
              <>
                <Bluetooth size={14} className="mr-1.5" aria-hidden="true" />
                Pair Smart Glasses
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleToggleSosDemo}
            aria-pressed={sosDemoActive}
            data-testid="spotlight-sos-demo-btn"
            className={`text-xs font-semibold ${
              sosDemoActive
                ? "border-amber-600 bg-amber-50 text-amber-950 hover:bg-amber-100"
                : "border-slate-300 text-slate-800 hover:border-teal-700"
            }`}
          >
            <Volume2 size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
            {sosDemoActive
              ? "Stop SOS / Alert Readout Demo"
              : "SOS / Read Alerts Aloud Demo"}
          </Button>
        </div>
      </div>

      {/* Main Content: Interactive Labeled Diagram + Step-by-Step Breakdown */}
      <div className="p-6 grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Labeled Visual Overview & Component Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9]">
            {!imgFailed ? (
              <img
                src={DEVICE_VISUAL_ASSETS.smart_vision_glasses}
                alt="Interactive labeled diagram of AI Smart Vision Glasses highlighting the bridge Micro-Camera, Front Ultrasonic/LiDAR Obstacle Sensor, Right Temple Onboard AI Processor, and Inner Temple Bone-Conduction Speakers"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600 p-6 text-center">
                AI Smart Vision Glasses — Interactive Hardware Diagram
              </div>
            )}

            {/* Interactive Accessible Hardware Callout Pins */}
            {SMART_VISION_GLASSES_HOTSPOTS.map((spot) => {
              const isSelected = spot.id === activeHotspotId;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSelectHotspot(spot)}
                  aria-pressed={isSelected}
                  aria-label={`Inspect component ${spot.number}: ${spot.label} at ${spot.location}`}
                  data-testid={`glasses-hotspot-${spot.id}`}
                  data-hotspot-pin="true"
                  style={{
                    left: `${spot.xPercent}%`,
                    top: `${spot.yPercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 aspect-square rounded-full font-mono text-xs font-bold flex items-center justify-center shadow-lg border-2 transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 ${
                    isSelected
                      ? "bg-teal-700 text-white border-white scale-110 z-20"
                      : "bg-slate-900/90 text-white border-teal-300 hover:scale-105 z-10"
                  }`}
                >
                  {spot.number}
                </button>
              );
            })}
          </div>

          {/* Component Selector Legend Buttons */}
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-label="Smart Vision Glasses Hardware Components"
          >
            {SMART_VISION_GLASSES_HOTSPOTS.map((spot) => {
              const isSelected = spot.id === activeHotspotId;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSelectHotspot(spot)}
                  aria-pressed={isSelected}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                    isSelected
                      ? "bg-teal-50 border-teal-700 text-teal-950 font-semibold"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-teal-700 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {spot.number}
                  </span>
                  <span className="leading-snug">{spot.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Hardware Component Clinical Detail */}
          <div
            data-testid="active-hotspot-detail"
            className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm font-bold text-slate-900">
                {activeHotspot.number}. {activeHotspot.label}
              </div>
              <span className="text-xs font-medium text-teal-800">
                {activeHotspot.location}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {activeHotspot.summary}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/80">
              <strong className="text-slate-900">Everyday Benefit: </strong>
              {activeHotspot.clinicalBenefit}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive 4-Step "How It Works" Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-slate-900">
              Step-by-Step: How It Works
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
              Step {activeStep.step} of {SMART_VISION_GLASSES_STEPS.length}
            </span>
          </div>

          {/* Interactive Stepper List */}
          <div className="space-y-2.5" role="list" aria-label="Smart Vision Glasses workflow steps">
            {SMART_VISION_GLASSES_STEPS.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  role="listitem"
                  className={`rounded-xl border transition-colors ${
                    isCurrent
                      ? "border-teal-700 bg-teal-50/40"
                      : "border-slate-200 bg-white hover:bg-slate-50/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    aria-expanded={isCurrent}
                    data-testid={`vision-step-${step.id}`}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <StepIcon stepId={step.id} size={16} />
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono font-semibold text-teal-800 block">
                          STEP {step.step}
                        </span>
                        <span className="text-sm font-bold text-slate-900 block truncate">
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isCurrent && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-teal-100">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-5">
                        {step.examples.map((ex, i) => (
                          <li key={i} className="leading-relaxed">
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activeStepIndex === 0}
              onClick={() => handleSelectStep(Math.max(0, activeStepIndex - 1))}
              className="text-xs border-slate-300"
            >
              <ChevronLeft size={14} className="mr-1" aria-hidden="true" />
              Previous Step
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activeStepIndex === SMART_VISION_GLASSES_STEPS.length - 1}
              onClick={() =>
                handleSelectStep(
                  Math.min(
                    SMART_VISION_GLASSES_STEPS.length - 1,
                    activeStepIndex + 1
                  )
                )
              }
              className="text-xs border-slate-300"
            >
              Next Step
              <ChevronRight size={14} className="ml-1" aria-hidden="true" />
            </Button>
          </div>

          {/* Live Care Preempt Sync & SOS Demo Feedback Panel */}
          {sosDemoActive && (
            <div
              role="status"
              aria-live="polite"
              data-testid="sos-demo-status-card"
              className="rounded-xl bg-amber-50 border border-amber-300 p-4 space-y-2 text-xs text-amber-950"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Radio size={15} className="text-amber-700" aria-hidden="true" />
                  Care Preempt Audio & Caregiver Beacon Demo Active
                </span>
                <span className="font-mono text-[11px] font-semibold">
                  Open-Ear Channel
                </span>
              </div>
              <p className="leading-relaxed">
                Reading aloud: <em>"Obstacle clear ahead. Evening medication reminder in 15 minutes. Guardian Sita Sharma is synced for live GPS handoff if SOS is triggered."</em>
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-amber-900">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} aria-hidden="true" />
                  GPS Caregiver Relay: Ready
                </span>
                <span>·</span>
                <span>
                  Device Link: {pairedGlasses ? pairedGlasses.name : "Simulated Preview"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
