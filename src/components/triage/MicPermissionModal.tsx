import React from "react";
import { Mic, MicOff, AlertCircle, CheckCircle2, Lock, ArrowRight, X, Shield, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export interface MicPermissionModalProps {
  isOpen: boolean;
  permissionState: 'prompt' | 'denied' | 'granted' | 'unsupported';
  onClose: () => void;
  onRetry: () => void;
  onUseFallbackText: () => void;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  permissionState,
  onClose,
  onRetry,
  onUseFallbackText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm sg-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
            permissionState === 'denied'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-teal-50 text-teal-700 border border-teal-200'
          }`}>
            {permissionState === 'denied' ? <MicOff size={24} /> : <Mic size={24} />}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              {permissionState === 'denied' ? "Microphone Access Blocked" : "Enable Voice Symptom Triage"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hands-free clinical symptom reporting
            </p>
          </div>
        </div>

        {/* Body Content */}
        {permissionState === 'denied' ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                Your browser is currently blocking microphone access for Silent Guardian. Follow these quick steps to unlock voice reporting:
              </div>
            </div>

            {/* Visual Troubleshooting Guide */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                How to re-enable in browser:
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <div>
                  Click the <span className="inline-flex items-center gap-1 font-semibold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200"><Lock size={10} /> Padlock</span> or Site Settings icon on the left of your browser address bar.
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <div>
                  Find <span className="font-semibold text-slate-900">Microphone</span> in permissions and change it from <em>Block</em> to <span className="font-semibold text-teal-800 bg-teal-50 px-1 py-0.5 rounded">Allow</span>.
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </div>
                <div>
                  Click the <span className="font-semibold text-slate-900">"Retry Permission"</span> button below.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Silent Guardian uses your microphone to transcribe and evaluate your symptoms hands-free, so you or a patient in distress don't need to type during an emergency.
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Audio is processed in real time for medical triage.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Automatic silence detection submits symptoms naturally.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>No voice recordings are sold or shared with advertisers.</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Button
            onClick={onRetry}
            className="w-full sm:flex-1 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs h-10 shadow-sm"
          >
            <RefreshCw size={14} className="mr-1.5" />
            {permissionState === 'denied' ? "Retry Permission Check" : "Allow Microphone Access"}
          </Button>

          <Button
            variant="outline"
            onClick={onUseFallbackText}
            className="w-full sm:w-auto rounded-full text-slate-700 text-xs h-10"
          >
            Continue with Typing
          </Button>
        </div>
      </div>
    </div>
  );
};
