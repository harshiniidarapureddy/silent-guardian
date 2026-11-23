import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Ear,
  Eye,
  Glasses,
  Mic,
  RotateCcw,
  Save,
  ShieldCheck,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAccessibility } from "../../context/AccessibilityContext";
import type { AccessibilityPreferences } from "../../types";

export function AccessibilitySettingsPanel() {
  const {
    preferences,
    updatePreferences,
    openOnboardingPrompt,
    speak,
    announceVisualAlert,
  } = useAccessibility();

  const [draft, setDraft] = useState<AccessibilityPreferences>(preferences);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const hasChanges =
    draft.handsFreeVoice !== preferences.handsFreeVoice ||
    draft.visualFirst !== preferences.visualFirst ||
    draft.assistiveDevicesEnabled !== preferences.assistiveDevicesEnabled ||
    draft.enlargedTargets !== preferences.enlargedTargets ||
    draft.autoReadAlerts !== preferences.autoReadAlerts ||
    draft.simplifiedMedicalText !== preferences.simplifiedMedicalText;

  const handleConfirmSave = () => {
    updatePreferences({
      ...draft,
      standardExperience:
        !draft.handsFreeVoice &&
        !draft.visualFirst &&
        !draft.assistiveDevicesEnabled,
      onboardingCompleted: true,
    });
    setConfirmOpen(false);
    toast.success("Accessibility preferences updated and saved to your profile.");
  };

  const handleTestAlert = () => {
    const sampleMessage =
      "Medication reminder: Your evening clinical safety check-in is complete. All vitals are within normal range.";
    if (preferences.visualFirst) {
      announceVisualAlert("Sample Visual-First Alert", sampleMessage, "info");
    }
    speak(sampleMessage, {
      title: "Accessibility Readout Test",
      source: "guidance",
      forceVisualBanner: preferences.visualFirst,
    });
    if (!preferences.handsFreeVoice && !preferences.visualFirst) {
      toast.info(
        "Enable Hands-Free Voice or Visual-First Mode to preview spoken or visual banner alerts."
      );
    }
  };

  const toggleItems: Array<{
    key: keyof Pick<
      AccessibilityPreferences,
      | "handsFreeVoice"
      | "visualFirst"
      | "autoReadAlerts"
      | "enlargedTargets"
      | "simplifiedMedicalText"
      | "assistiveDevicesEnabled"
    >;
    title: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      key: "handsFreeVoice",
      title: "Hands-Free & Voice Assistant Mode",
      description:
        "Enables the floating high-contrast microphone button for voice navigation (e.g. 'Go to Dashboard', 'Read my alerts', 'Open Organ Donor Card').",
      icon: Mic,
    },
    {
      key: "autoReadAlerts",
      title: "Automatic Audio Readouts for Critical Alerts",
      description:
        "Automatically speaks urgent triage alerts, safety notices, and guided instructions using Web Speech synthesis.",
      icon: Volume2,
    },
    {
      key: "enlargedTargets",
      title: "Enlarged Tap Targets & Switch Navigation",
      description:
        "Expands interactive buttons and links to at least 44px with strong keyboard and switch focus outlines.",
      icon: Eye,
    },
    {
      key: "visualFirst",
      title: "Visual-First Mode (Deaf & Hard-of-Hearing Support)",
      description:
        "Supplements audio notifications with high-contrast visual banners and opens the Live Visual Transcript & Captioning Panel.",
      icon: Ear,
    },
    {
      key: "simplifiedMedicalText",
      title: "Structured Step-by-Step Clinical Guidance",
      description:
        "Presents complex medical guidance as clear, icon-led visual steps with zero reliance on audio cues.",
      icon: ShieldCheck,
    },
    {
      key: "assistiveDevicesEnabled",
      title: "Assistive Device Integration",
      description:
        "Highlights smart glasses, hearing aids, and switch compatibility indicators across Care Preempt.",
      icon: Glasses,
    },
  ];

  return (
    <section
      aria-labelledby="accessibility-settings-heading"
      className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6"
      data-testid="accessibility-settings-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3
            id="accessibility-settings-heading"
            className="font-display text-lg font-bold text-slate-900"
          >
            Accessibility & Adaptive Care Settings
          </h3>
          <p className="text-sm text-slate-600">
            Configure voice navigation, visual captions, enlarged targets, and assistive hardware behavior. Settings apply immediately across every sign-in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestAlert}
            className="text-xs font-semibold border-slate-300 text-slate-800"
          >
            <Volume2 size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
            Test Alert Output
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openOnboardingPrompt}
            className="text-xs font-semibold border-slate-300 text-slate-800"
          >
            <RotateCcw size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
            Re-run Personalize Wizard
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {toggleItems.map((item) => {
          const Icon = item.icon;
          const checked = Boolean(draft[item.key]);
          const inputId = `a11y-setting-${item.key}`;
          return (
            <label
              key={item.key}
              htmlFor={inputId}
              className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                checked
                  ? "bg-teal-50/50 border-teal-300"
                  : "bg-slate-50/50 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checked
                      ? "bg-teal-700 text-white"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-600 leading-relaxed block mt-0.5">
                    {item.description}
                  </span>
                </div>
              </div>
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }))
                }
                className="h-5 w-5 mt-1 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer flex-shrink-0"
              />
            </label>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-teal-700" aria-hidden="true" />
          <span>WCAG 2.1 AA compliant · Persisted to your profile</span>
        </div>

        <Button
          type="button"
          disabled={!hasChanges}
          onClick={() => setConfirmOpen(true)}
          data-testid="save-a11y-settings-btn"
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-5"
        >
          <Save size={14} className="mr-1.5" aria-hidden="true" />
          Save Accessibility Preferences
        </Button>
      </div>

      {/* Confirmation modal before saving sensitive accessibility preferences */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-a11y-save-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4
                  id="confirm-a11y-save-title"
                  className="font-display text-base font-bold text-slate-900"
                >
                  Confirm Accessibility Changes
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Saving these preferences will update how Care Preempt presents emergency alerts, voice controls, and visual captions across your sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Cancel saving preferences"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
              <div>
                Hands-Free & Voice Mode:{" "}
                <strong>{draft.handsFreeVoice ? "Enabled" : "Off"}</strong>
              </div>
              <div>
                Visual-First & Captions:{" "}
                <strong>{draft.visualFirst ? "Enabled" : "Off"}</strong>
              </div>
              <div>
                Enlarged Tap Targets:{" "}
                <strong>{draft.enlargedTargets ? "Enabled" : "Off"}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSave}
                data-testid="confirm-a11y-save-btn"
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Confirm & Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
