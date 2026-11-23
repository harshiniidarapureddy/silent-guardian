import React, { useState } from "react";
import {
  AlertTriangle,
  Captions,
  ChevronDown,
  ChevronUp,
  Info,
  Mic,
  MicOff,
  Send,
  Siren,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { useAccessibility } from "../../context/AccessibilityContext";
import { AudioWaveform } from "../shared/AudioWaveform";

const QUICK_COMMANDS = [
  "Go to Dashboard",
  "Read my alerts",
  "Open Organ Donor Card",
  "Open Assistive Devices",
  "Open AI Triage",
  "Open Accessibility Settings",
];

export function VisualFirstAlertBanner() {
  const { preferences, activeVisualAlert, dismissVisualAlert } =
    useAccessibility();

  if (!preferences.visualFirst || !activeVisualAlert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="visual-first-alert-banner"
      className={`mb-5 rounded-2xl border-2 p-4 shadow-xs flex items-start justify-between gap-3 no-print ${
        activeVisualAlert.severity === "critical"
          ? "bg-red-50 border-red-600 text-red-950"
          : activeVisualAlert.severity === "warning"
          ? "bg-amber-50 border-amber-600 text-amber-950"
          : "bg-teal-50 border-teal-700 text-teal-950"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            activeVisualAlert.severity === "critical"
              ? "bg-red-600 text-white"
              : activeVisualAlert.severity === "warning"
              ? "bg-amber-600 text-white"
              : "bg-teal-700 text-white"
          }`}
        >
          {activeVisualAlert.severity === "critical" ? (
            <Siren size={20} aria-hidden="true" />
          ) : activeVisualAlert.severity === "warning" ? (
            <AlertTriangle size={20} aria-hidden="true" />
          ) : (
            <Info size={20} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider">
              {activeVisualAlert.severity === "critical"
                ? "Urgent Visual Alert"
                : activeVisualAlert.severity === "warning"
                ? "Important Notice"
                : "Visual Status Alert"}
            </span>
            <span className="text-xs font-mono opacity-75">
              {activeVisualAlert.timestamp}
            </span>
          </div>
          <div className="text-sm font-bold mt-0.5">
            {activeVisualAlert.title}
          </div>
          <p className="text-sm mt-1 leading-relaxed">
            {activeVisualAlert.message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissVisualAlert}
        aria-label="Dismiss visual alert"
        className="p-2 rounded-lg hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 flex-shrink-0"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function AdaptiveAssistOverlay() {
  const {
    preferences,
    isListening,
    isSpeaking,
    lastVoiceTranscript,
    speechSupported,
    transcript,
    startListening,
    stopListening,
    executeVoiceCommand,
    clearTranscript,
  } = useAccessibility();

  const [voiceDrawerOpen, setVoiceDrawerOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [transcriptCollapsed, setTranscriptCollapsed] = useState(true);

  const handleManualCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    await executeVoiceCommand(commandInput);
    setCommandInput("");
  };

  return (
    <>
      {/* Visual-First Live Visual Transcript / Captioning Panel */}
      {preferences.visualFirst && (
        <section
          aria-label="Live Visual Transcript and Captions"
          data-testid="live-visual-transcript-panel"
          className="fixed bottom-4 left-4 lg:left-[17rem] z-30 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl overflow-hidden no-print"
        >
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Captions size={16} className="text-teal-300 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Live Visual Transcript
                </div>
                <div className="text-[11px] text-teal-300 truncate">
                  {transcriptCollapsed && transcript[0]
                    ? transcript[0].text
                    : "Visual-First Captions · No Audio Required"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {transcript.length > 0 && (
                <button
                  type="button"
                  onClick={clearTranscript}
                  aria-label="Clear transcript history"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setTranscriptCollapsed((c) => !c)}
                aria-expanded={!transcriptCollapsed}
                aria-label={
                  transcriptCollapsed
                    ? "Expand live visual transcript"
                    : "Collapse live visual transcript"
                }
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {transcriptCollapsed ? (
                  <ChevronUp size={16} aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {!transcriptCollapsed && (
            <div
              className="max-h-56 overflow-y-auto p-3.5 space-y-2.5 sg-scrollbar"
              aria-live="polite"
            >
              {transcript.length === 0 ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  All spoken notifications, voice assistant replies, and guided safety instructions will appear here in real time.
                </p>
              ) : (
                transcript.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-2.5 text-xs border ${
                      item.severity === "critical"
                        ? "bg-red-950/70 border-red-500/60 text-red-100"
                        : item.source === "user_command"
                        ? "bg-slate-800 border-slate-700 text-teal-200"
                        : "bg-slate-800/80 border-slate-700 text-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                      <span>{item.title || "Care Preempt"}</span>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-xs">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Hands-Free Voice Assistant Floating Control */}
      {preferences.handsFreeVoice && (
        <div
          className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 no-print"
          data-testid="hands-free-voice-widget"
        >
          {voiceDrawerOpen && (
            <div
              role="region"
              aria-label="Voice Assistant Commands"
              className="w-[calc(100vw-2rem)] sm:w-80 rounded-2xl bg-white border-2 border-slate-900 shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-teal-300" aria-hidden="true" />
                  <span className="text-xs font-bold">
                    Voice Navigation Assistant
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceDrawerOpen(false)}
                  aria-label="Close voice command panel"
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="p-3.5 space-y-3">
                {/* Real-Time Audio Input / Output Waveform Panel */}
                <div
                  className={`rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    isListening
                      ? "bg-rose-50/80 border-rose-200"
                      : isSpeaking
                      ? "bg-teal-50/80 border-teal-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isListening
                          ? "text-rose-700"
                          : isSpeaking
                          ? "text-teal-800"
                          : "text-slate-500"
                      }`}
                    >
                      {isListening
                        ? "Live Input"
                        : isSpeaking
                        ? "Voice Output"
                        : "Voice Standby"}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {isListening
                        ? "Listening for command..."
                        : isSpeaking
                        ? "Speaking guidance aloud"
                        : "Ready for voice command"}
                    </div>
                  </div>
                  <AudioWaveform
                    active={isListening || isSpeaking}
                    mode={isListening ? "input" : "output"}
                    useMicrophone={isListening}
                    variant="modal"
                    theme="light"
                    barCount={16}
                    testId="voice-assistant-waveform"
                  />
                </div>

                {!speechSupported && (
                  <div
                    role="status"
                    className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-2 text-[11px] text-slate-700 leading-snug"
                  >
                    Live browser microphone dictation is unavailable here. Quick commands, typed commands, and spoken audio readouts remain fully active.
                  </div>
                )}

                <div className="text-xs text-slate-700">
                  {isListening ? (
                    <span className="font-semibold text-teal-800">
                      Listening for your voice command...
                    </span>
                  ) : lastVoiceTranscript ? (
                    <span>
                      Last heard:{" "}
                      <strong className="text-slate-900">
                        "{lastVoiceTranscript}"
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Tap Speak or choose a command below to navigate hands-free.
                    </span>
                  )}
                </div>

                {/* Quick clickable / switch-accessible voice commands */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COMMANDS.map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => void executeVoiceCommand(cmd)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      "{cmd}"
                    </button>
                  ))}
                </div>

                {/* Keyboard / text fallback for voice commands */}
                <form onSubmit={handleManualCommand} className="flex gap-2">
                  <label htmlFor="voice-cmd-input" className="sr-only">
                    Type a voice command
                  </label>
                  <input
                    id="voice-cmd-input"
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Type a command (e.g. Read my alerts)"
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  />
                  <button
                    type="submit"
                    aria-label="Run voice command"
                    className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                  >
                    <Send size={14} aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* High-contrast persistent floating microphone control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceDrawerOpen((o) => !o)}
              aria-expanded={voiceDrawerOpen}
              className="min-h-[48px] px-4 rounded-full bg-white text-slate-900 border-2 border-slate-900 shadow-lg text-xs font-bold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              {voiceDrawerOpen ? "Hide Commands" : "Voice Commands"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  setVoiceDrawerOpen(true);
                  startListening();
                }
              }}
              aria-pressed={isListening}
              aria-label={
                isListening
                  ? "Stop voice assistant listening"
                  : "Activate voice assistant microphone"
              }
              data-testid="floating-voice-mic-btn"
              className={`min-h-[56px] min-w-[56px] px-4 rounded-full font-bold text-sm shadow-2xl border-2 flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 ${
                isListening
                  ? "bg-red-700 hover:bg-red-800 text-white border-white"
                  : "bg-slate-900 hover:bg-teal-800 text-white border-teal-300"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={20} aria-hidden="true" />
                  <span>Listening</span>
                  <AudioWaveform
                    active={true}
                    mode="input"
                    variant="compact"
                    theme="dark"
                    barCount={6}
                  />
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 size={20} aria-hidden="true" />
                  <span>Speaking</span>
                  <AudioWaveform
                    active={true}
                    mode="output"
                    variant="compact"
                    theme="dark"
                    barCount={6}
                  />
                </>
              ) : (
                <>
                  <Mic size={20} aria-hidden="true" />
                  <span>Speak</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
