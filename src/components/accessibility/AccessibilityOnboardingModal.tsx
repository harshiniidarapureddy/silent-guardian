import React, { useEffect, useState } from "react";
import {
  Check,
  Ear,
  Glasses,
  Mic,
  ShieldCheck,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAccessibility } from "../../context/AccessibilityContext";
import { getUser } from "../../lib/api";
import type { AccessibilityOnboardingOption } from "../../types";
import { reconcileOnboardingSelection } from "../../lib/accessibilityLogic";

interface OptionCardConfig {
  id: AccessibilityOnboardingOption;
  title: string;
  subtitle: string;
  details: string;
  icon: LucideIcon;
}

const ONBOARDING_OPTIONS: OptionCardConfig[] = [
  {
    id: "hands_free_voice",
    title: "Hands-Free & Voice Assistance",
    subtitle: "For visual or motor accessibility needs",
    details:
      "Activates voice-guided navigation, spoken readouts for critical alerts, enlarged tap targets, and keyboard/switch support.",
    icon: Mic,
  },
  {
    id: "visual_first",
    title: "Visual-First & Hearing Support",
    subtitle: "For Deaf or hard-of-hearing users",
    details:
      "Replaces audio cues with clear visual banners, adds a live visual captioning panel, and simplifies clinical steps.",
    icon: Ear,
  },
  {
    id: "assistive_devices",
    title: "Assistive Device Integration",
    subtitle: "Smart glasses, hearing aids, and sensory aids",
    details:
      "Connects and tracks personal assistive hardware with quick pairing status, battery indicators, and compatibility guidance.",
    icon: Glasses,
  },
  {
    id: "standard",
    title: "Standard Experience",
    subtitle: "Skip for now — configure anytime later",
    details:
      "Continue with the standard Care Preempt layout. You can adjust accessibility modes anytime from the header or Profile Settings.",
    icon: SlidersHorizontal,
  },
];

export function AccessibilityOnboardingModal() {
  const {
    showOnboardingPrompt,
    preferences,
    completeOnboarding,
    skipOnboarding,
  } = useAccessibility();

  const [selected, setSelected] = useState<AccessibilityOnboardingOption[]>([]);

  useEffect(() => {
    if (!showOnboardingPrompt) return;
    const preselected: AccessibilityOnboardingOption[] = [];
    if (preferences.handsFreeVoice) preselected.push("hands_free_voice");
    if (preferences.visualFirst) preselected.push("visual_first");
    if (preferences.assistiveDevicesEnabled) preselected.push("assistive_devices");
    if (preselected.length === 0 && preferences.onboardingCompleted) {
      preselected.push("standard");
    }
    setSelected(preselected);
  }, [showOnboardingPrompt, preferences]);

  useEffect(() => {
    if (!showOnboardingPrompt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipOnboarding();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showOnboardingPrompt, skipOnboarding]);

  const currentUser = getUser();
  if (!showOnboardingPrompt || currentUser?.role !== "patient") return null;

  const handleToggle = (id: AccessibilityOnboardingOption) => {
    setSelected((prev) => reconcileOnboardingSelection(prev, id));
  };

  const handleContinue = () => {
    if (selected.length === 0 || selected.includes("standard")) {
      skipOnboarding();
      return;
    }
    completeOnboarding(selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-onboarding-title"
      aria-describedby="a11y-onboarding-desc"
      data-testid="accessibility-onboarding-modal"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800">
              <ShieldCheck size={15} className="text-teal-700" aria-hidden="true" />
              <span>Inclusive Care Setup</span>
            </div>
            <h2
              id="a11y-onboarding-title"
              className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
            >
              Personalize Your Care Experience
            </h2>
            <p
              id="a11y-onboarding-desc"
              className="text-sm text-slate-600 leading-relaxed"
            >
              Do you have any accessibility preferences or assistive needs we should configure for you?
            </p>
          </div>
          <button
            type="button"
            onClick={skipOnboarding}
            aria-label="Close accessibility setup"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Multi-select option cards */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-medium text-slate-500">
            Select one or more options below. Your selections are saved privately to your Care Preempt profile and apply automatically on every future sign-in.
          </p>

          <div
            className="grid sm:grid-cols-2 gap-3"
            role="group"
            aria-label="Accessibility preference options"
          >
            {ONBOARDING_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => handleToggle(option.id)}
                  data-testid={`a11y-option-${option.id}`}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-teal-700 bg-teal-50/70 ring-1 ring-teal-700"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-teal-700 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-teal-700 border-teal-700 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={13} />}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">
                      {option.title}
                    </div>
                    <div className="text-xs font-medium text-teal-800">
                      {option.subtitle}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      {option.details}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={skipOnboarding}
            className="text-slate-700 border-slate-300 bg-white hover:bg-slate-100"
          >
            Skip for Now
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            data-testid="a11y-onboarding-save"
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6"
          >
            {selected.length === 0 || selected.includes("standard")
              ? "Continue with Standard Experience"
              : `Save Preferences (${selected.length} selected)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
