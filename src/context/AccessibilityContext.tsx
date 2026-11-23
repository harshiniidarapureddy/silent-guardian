import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type {
  AccessibilityOnboardingOption,
  AccessibilityPreferences,
  AssistiveDevice,
  GuardianAlert,
  OrganDonorPledge,
  SOSAlert,
  TranscriptEntry,
  VisualAlertBanner,
} from "../types";
import { api, getUser } from "../lib/api";
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  DEFAULT_ORGAN_PLEDGE,
  INITIAL_ASSISTIVE_DEVICES,
  buildPreferencesFromOnboarding,
  loadUserAccessibility,
  loadUserDevices,
  loadUserOrganPledge,
  parseVoiceCommand,
  saveUserAccessibility,
  saveUserDevices,
  saveUserOrganPledge,
  shouldShowAccessibilityOnboarding,
  toggleAssistiveDeviceConnection,
  upsertSmartVisionGlasses,
} from "../lib/accessibilityLogic";
import { useFirebase } from "./FirebaseContext";
import {
  deleteAssistiveDeviceFromFirestore,
  subscribeToAccessibilitySettings,
  subscribeToAssistiveDevices,
  subscribeToOrganPledge,
  syncAccessibilityToFirestore,
  syncAssistiveDeviceToFirestore,
  syncOrganPledgeToFirestore,
} from "../lib/firestoreSync";

interface AccessibilityContextValue {
  userId: string;
  preferences: AccessibilityPreferences;
  devices: AssistiveDevice[];
  organPledge: OrganDonorPledge;
  showOnboardingPrompt: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  lastVoiceTranscript: string;
  speechSupported: boolean;
  transcript: TranscriptEntry[];
  activeVisualAlert: VisualAlertBanner | null;
  openOnboardingPrompt: () => void;
  closeOnboardingPrompt: () => void;
  completeOnboarding: (selected: AccessibilityOnboardingOption[]) => void;
  skipOnboarding: () => void;
  updatePreferences: (patch: Partial<AccessibilityPreferences>) => void;
  toggleVoiceMode: () => void;
  toggleVisualFirstMode: () => void;
  addDevice: (device: AssistiveDevice) => void;
  removeDevice: (deviceId: string) => void;
  toggleDeviceSync: (deviceId: string) => void;
  pairSmartVisionGlasses: () => AssistiveDevice;
  saveOrganPledge: (pledge: OrganDonorPledge) => void;
  speak: (
    text: string,
    options?: {
      priority?: "normal" | "critical";
      title?: string;
      source?: TranscriptEntry["source"];
      forceVisualBanner?: boolean;
    }
  ) => void;
  announceVisualAlert: (
    title: string,
    message: string,
    severity?: "info" | "warning" | "critical"
  ) => void;
  dismissVisualAlert: () => void;
  clearTranscript: () => void;
  startListening: () => void;
  stopListening: () => void;
  executeVoiceCommand: (rawTranscript: string) => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

function getStableUserKey(user: ReturnType<typeof getUser>): string {
  if (!user) return "guest";
  if (user.email) return user.email.toLowerCase().trim();
  return user.id || "guest";
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, authReady } = useFirebase();
  const [userId, setUserId] = useState<string>(() => getStableUserKey(getUser()));

  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() =>
    loadUserAccessibility(getStableUserKey(getUser()))
  );
  const [devices, setDevices] = useState<AssistiveDevice[]>(() =>
    loadUserDevices(getStableUserKey(getUser()))
  );
  const [organPledge, setOrganPledge] = useState<OrganDonorPledge>(() =>
    loadUserOrganPledge(getStableUserKey(getUser()))
  );

  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [activeVisualAlert, setActiveVisualAlert] =
    useState<VisualAlertBanner | null>(null);

  const recognitionRef = useRef<any>(null);
  const speakFallbackTimerRef = useRef<number | null>(null);

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const win = window as any;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }, []);

  const isPatientPortalRoute = location.pathname.startsWith("/patient");

  // Reload per-user state whenever auth user changes or route enters portal
  useEffect(() => {
    const syncUser = () => {
      const current = getUser();
      const nextId = getStableUserKey(current);
      setUserId(nextId);
      const loadedPrefs = loadUserAccessibility(nextId);
      setPreferences(loadedPrefs);
      setDevices(loadUserDevices(nextId));
      setOrganPledge(loadUserOrganPledge(nextId));

      // STRICT ROLE GUARD: Accessibility onboarding modal MUST ONLY open for Patient accounts
      if (shouldShowAccessibilityOnboarding(current, location.pathname, loadedPrefs)) {
        setShowOnboardingPrompt(true);
      } else {
        setShowOnboardingPrompt(false);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("profile-updated", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("profile-updated", syncUser);
    };
  }, [location.pathname, isPatientPortalRoute]);

  // Real-time Firestore syncing (onSnapshot) for Assistive Devices, Organ Donor Registry, & Accessibility Preferences
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;
    const storageKey = firebaseUser.email?.toLowerCase().trim() || uid;

    const unsubA11y = subscribeToAccessibilitySettings(uid, (cloudPrefs) => {
      if (cloudPrefs) {
        setPreferences(cloudPrefs);
        saveUserAccessibility(storageKey, cloudPrefs);
      }
    });

    const unsubDevices = subscribeToAssistiveDevices(uid, (cloudDevices) => {
      if (cloudDevices.length > 0) {
        setDevices(cloudDevices);
        saveUserDevices(storageKey, cloudDevices);
      }
    });

    const unsubPledge = subscribeToOrganPledge(uid, (cloudPledge) => {
      if (cloudPledge) {
        setOrganPledge(cloudPledge);
        saveUserOrganPledge(storageKey, cloudPledge);
      }
    });

    return () => {
      unsubA11y();
      unsubDevices();
      unsubPledge();
    };
  }, [authReady, firebaseUser]);

  // Apply adaptive global CSS classes strictly for Patient sessions so Hospital & Admin portals remain clean
  useEffect(() => {
    const root = document.documentElement;
    const isPatientSession = getUser()?.role === "patient" && isPatientPortalRoute;

    if (isPatientSession && (preferences.handsFreeVoice || preferences.enlargedTargets)) {
      root.classList.add("a11y-hands-free");
    } else {
      root.classList.remove("a11y-hands-free");
    }

    if (isPatientSession && preferences.visualFirst) {
      root.classList.add("a11y-visual-first");
    } else {
      root.classList.remove("a11y-visual-first");
    }
  }, [
    preferences.handsFreeVoice,
    preferences.enlargedTargets,
    preferences.visualFirst,
    isPatientPortalRoute,
  ]);

  const appendTranscript = useCallback(
    (entry: Omit<TranscriptEntry, "id" | "timestamp">) => {
      const next: TranscriptEntry = {
        id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        ...entry,
      };
      setTranscript((prev) => [next, ...prev].slice(0, 40));
    },
    []
  );

  const announceVisualAlert = useCallback(
    (
      title: string,
      message: string,
      severity: "info" | "warning" | "critical" = "info"
    ) => {
      const banner: VisualAlertBanner = {
        id: `va-${Date.now()}`,
        title,
        message,
        severity,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setActiveVisualAlert(banner);
      appendTranscript({
        source: "alert",
        title,
        text: message,
        severity,
      });
    },
    [appendTranscript]
  );

  const speak = useCallback(
    (
      text: string,
      options?: {
        priority?: "normal" | "critical";
        title?: string;
        source?: TranscriptEntry["source"];
        forceVisualBanner?: boolean;
      }
    ) => {
      const clean = text.trim();
      if (!clean) return;

      appendTranscript({
        source: options?.source || "voice_assistant",
        title: options?.title,
        text: clean,
        severity: options?.priority === "critical" ? "critical" : "info",
      });

      if (preferences.visualFirst || options?.forceVisualBanner) {
        setActiveVisualAlert({
          id: `va-${Date.now()}`,
          title:
            options?.title ||
            (options?.priority === "critical"
              ? "Critical Care Alert"
              : "Care Preempt Visual Notice"),
          message: clean,
          severity: options?.priority === "critical" ? "critical" : "info",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      if (
        (preferences.handsFreeVoice || preferences.autoReadAlerts) &&
        typeof window !== "undefined"
      ) {
        if (speakFallbackTimerRef.current) {
          window.clearTimeout(speakFallbackTimerRef.current);
          speakFallbackTimerRef.current = null;
        }
        const estimatedMs = Math.min(6500, Math.max(2400, clean.length * 46));
        const startedAt = Date.now();
        setIsSpeaking(true);

        if ("speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.rate = 0.98;
            utterance.pitch = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
              // If browser TTS finishes genuinely after playback, clear immediately
              if (Date.now() - startedAt > 500) {
                setIsSpeaking(false);
                if (speakFallbackTimerRef.current) {
                  window.clearTimeout(speakFallbackTimerRef.current);
                  speakFallbackTimerRef.current = null;
                }
              }
            };
            utterance.onerror = () => {
              // If TTS engine errored immediately (e.g., restricted/headless audio),
              // let the timed visual readout window finish so the waveform stays active.
              if (Date.now() - startedAt > 500) {
                setIsSpeaking(false);
                if (speakFallbackTimerRef.current) {
                  window.clearTimeout(speakFallbackTimerRef.current);
                  speakFallbackTimerRef.current = null;
                }
              }
            };
            window.speechSynthesis.speak(utterance);
          } catch {
            // Graceful fallback in headless or restricted audio environments
          }
        }

        // Guarantee visual speaking indicator finishes cleanly even if browser speech synthesis is silent/headless
        speakFallbackTimerRef.current = window.setTimeout(() => {
          setIsSpeaking(false);
          speakFallbackTimerRef.current = null;
        }, estimatedMs);
      }
    },
    [
      appendTranscript,
      preferences.autoReadAlerts,
      preferences.handsFreeVoice,
      preferences.visualFirst,
    ]
  );

  const persistPrefsCloud = useCallback(
    (next: AccessibilityPreferences) => {
      if (firebaseUser?.emailVerified) {
        void syncAccessibilityToFirestore(firebaseUser.uid, next).catch(() => {});
      }
    },
    [firebaseUser]
  );

  const updatePreferences = useCallback(
    (patch: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => {
        const next: AccessibilityPreferences = {
          ...prev,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        if (
          next.handsFreeVoice ||
          next.visualFirst ||
          next.assistiveDevicesEnabled
        ) {
          next.standardExperience = false;
        }
        saveUserAccessibility(userId, next);
        persistPrefsCloud(next);
        return next;
      });
    },
    [persistPrefsCloud, userId]
  );

  const completeOnboarding = useCallback(
    (selected: AccessibilityOnboardingOption[]) => {
      const next = buildPreferencesFromOnboarding(selected);
      setPreferences(next);
      saveUserAccessibility(userId, next);
      persistPrefsCloud(next);
      setShowOnboardingPrompt(false);

      if (next.handsFreeVoice) {
        appendTranscript({
          source: "guidance",
          title: "Hands-Free Voice Mode Enabled",
          text: "Voice navigation is ready. Try saying 'Go to Dashboard', 'Read my alerts', or 'Open Organ Donor Card'.",
          severity: "info",
        });
      }
      if (next.visualFirst) {
        announceVisualAlert(
          "Visual-First Mode Enabled",
          "All audio cues now appear as clear visual banners and live captions below.",
          "info"
        );
      }
      toast.success("Your Care Preempt accessibility preferences have been saved.");
    },
    [announceVisualAlert, appendTranscript, persistPrefsCloud, userId]
  );

  const skipOnboarding = useCallback(() => {
    const next: AccessibilityPreferences = {
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      standardExperience: true,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };
    setPreferences(next);
    saveUserAccessibility(userId, next);
    persistPrefsCloud(next);
    setShowOnboardingPrompt(false);
    toast.info(
      "Standard experience selected. You can personalize accessibility settings anytime from the top bar."
    );
  }, [persistPrefsCloud, userId]);

  const toggleVoiceMode = useCallback(() => {
    setPreferences((prev) => {
      const enabling = !prev.handsFreeVoice;
      const next: AccessibilityPreferences = {
        ...prev,
        handsFreeVoice: enabling,
        enlargedTargets: enabling ? true : prev.assistiveDevicesEnabled,
        autoReadAlerts: enabling,
        standardExperience: !enabling && !prev.visualFirst && !prev.assistiveDevicesEnabled,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      saveUserAccessibility(userId, next);
      persistPrefsCloud(next);
      if (enabling) {
        appendTranscript({
          source: "guidance",
          title: "Voice Mode Active",
          text: "Hands-Free & Voice Assistant Mode enabled. Enlarged tap targets are now active.",
          severity: "info",
        });
        toast.success("Hands-Free & Voice Assistant Mode enabled");
      } else {
        toast.info("Hands-Free & Voice Assistant Mode turned off");
      }
      return next;
    });
  }, [appendTranscript, persistPrefsCloud, userId]);

  const toggleVisualFirstMode = useCallback(() => {
    setPreferences((prev) => {
      const enabling = !prev.visualFirst;
      const next: AccessibilityPreferences = {
        ...prev,
        visualFirst: enabling,
        simplifiedMedicalText: enabling,
        standardExperience: !enabling && !prev.handsFreeVoice && !prev.assistiveDevicesEnabled,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      saveUserAccessibility(userId, next);
      persistPrefsCloud(next);
      if (enabling) {
        announceVisualAlert(
          "Visual-First Mode Active",
          "Audio notifications are supplemented with visual banners, live transcripts, and step-by-step clinical guidance.",
          "info"
        );
        toast.success("Visual-First Mode enabled");
      } else {
        toast.info("Visual-First Mode turned off");
      }
      return next;
    });
  }, [announceVisualAlert, persistPrefsCloud, userId]);

  const addDevice = useCallback(
    (device: AssistiveDevice) => {
      setDevices((prev) => {
        const next = [device, ...prev];
        saveUserDevices(userId, next);
        return next;
      });
      if (firebaseUser?.emailVerified) {
        void syncAssistiveDeviceToFirestore(firebaseUser.uid, device).catch(() => {});
      }
    },
    [firebaseUser, userId]
  );

  const removeDevice = useCallback(
    (deviceId: string) => {
      setDevices((prev) => {
        const next = prev.filter((d) => d.id !== deviceId);
        saveUserDevices(userId, next);
        return next;
      });
      if (firebaseUser?.emailVerified) {
        void deleteAssistiveDeviceFromFirestore(firebaseUser.uid, deviceId).catch(() => {});
      }
    },
    [firebaseUser, userId]
  );

  const toggleDeviceSync = useCallback(
    (deviceId: string) => {
      setDevices((prev) => {
        const next = toggleAssistiveDeviceConnection(prev, deviceId);
        saveUserDevices(userId, next);
        const updated = next.find((d) => d.id === deviceId);
        if (updated && firebaseUser?.emailVerified) {
          void syncAssistiveDeviceToFirestore(firebaseUser.uid, updated).catch(() => {});
        }
        return next;
      });
    },
    [firebaseUser, userId]
  );

  const pairSmartVisionGlasses = useCallback(() => {
    let resultDevice: AssistiveDevice = INITIAL_ASSISTIVE_DEVICES[0];
    setDevices((prev) => {
      const { devices: next, pairedDevice } = upsertSmartVisionGlasses(prev);
      resultDevice = pairedDevice;
      saveUserDevices(userId, next);
      if (firebaseUser?.emailVerified) {
        void syncAssistiveDeviceToFirestore(firebaseUser.uid, pairedDevice).catch(() => {});
      }
      return next;
    });
    return resultDevice;
  }, [firebaseUser, userId]);

  const saveOrganPledge = useCallback(
    (pledge: OrganDonorPledge) => {
      const now = new Date().toISOString();
      const normalized: OrganDonorPledge = {
        ...pledge,
        pledgeId:
          pledge.pledgeId ||
          `CP-DONOR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        pledgedAt: pledge.pledgedAt || now,
        updatedAt: now,
      };
      setOrganPledge(normalized);
      saveUserOrganPledge(userId, normalized);
      if (firebaseUser?.emailVerified) {
        void syncOrganPledgeToFirestore(firebaseUser.uid, normalized).catch(() => {});
      }
      window.dispatchEvent(new Event("profile-updated"));
    },
    [firebaseUser, userId]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const executeVoiceCommand = useCallback(
    async (rawTranscript: string) => {
      const cleaned = rawTranscript.trim();
      if (!cleaned) return;
      stopListening();
      setLastVoiceTranscript(cleaned);
      appendTranscript({
        source: "user_command",
        title: "Voice Command",
        text: `"${cleaned}"`,
        severity: "info",
      });

      const intent = parseVoiceCommand(cleaned);
      if (intent.type === "navigate") {
        navigate(intent.path);
        speak(intent.speech, {
          title: `Navigated to ${intent.label}`,
          source: "voice_assistant",
        });
        toast.success(`Voice navigation: ${intent.label}`);
        return;
      }

      if (intent.type === "open_settings") {
        navigate("/patient/profile");
        speak(intent.speech, {
          title: "Profile & Accessibility Settings",
          source: "voice_assistant",
        });
        toast.success("Opened Profile & Accessibility Settings");
        return;
      }

      if (intent.type === "toggle_visual") {
        toggleVisualFirstMode();
        speak(intent.speech, {
          title: "Visual-First Mode",
          source: "voice_assistant",
        });
        return;
      }

      if (intent.type === "stop_listening") {
        stopListening();
        speak(intent.speech, {
          title: "Voice Assistant Paused",
          source: "voice_assistant",
        });
        return;
      }

      if (intent.type === "read_alerts") {
        try {
          const [sosRes, guardianRes] = await Promise.all([
            api.get<SOSAlert[]>("/alerts"),
            api.get<GuardianAlert[]>("/guardian-alerts"),
          ]);
          const openSos = (sosRes.data || []).filter((a) => a.status === "open").slice(0, 2);
          const urgentGuardian = (guardianRes.data || [])
            .filter((g) => g.severity === "critical" || g.severity === "high")
            .slice(0, 2);

          const summaryParts: string[] = [];
          if (urgentGuardian.length > 0) {
            urgentGuardian.forEach((g) => {
              summaryParts.push(
                `Guardian alert for ${g.user_name}: ${g.condition}. Status: ${g.status}.`
              );
            });
          }
          if (openSos.length > 0) {
            openSos.forEach((s) => {
              summaryParts.push(
                `Open ${s.kind} alert (${s.severity} priority): ${s.note}.`
              );
            });
          }

          const readout =
            summaryParts.length > 0
              ? `You have ${summaryParts.length} active safety alerts. ${summaryParts.join(" ")}`
              : "All clear. You have no urgent emergency alerts right now.";

          speak(readout, {
            priority: summaryParts.length > 0 ? "critical" : "normal",
            title: "Active Health & Safety Alerts",
            source: "alert",
            forceVisualBanner: true,
          });
        } catch {
          speak("Unable to load alerts right now. Please open Alerts & SOS directly.", {
            title: "Alerts Notice",
            source: "alert",
          });
        }
        return;
      }

      if (intent.type === "help") {
        speak(intent.speech, {
          title: "Voice Command Guide",
          source: "guidance",
        });
        return;
      }

      speak(intent.speech, {
        title: "Command Not Recognized",
        source: "voice_assistant",
      });
    },
    [appendTranscript, navigate, speak, stopListening, toggleVisualFirstMode]
  );

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const win = window as any;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsListening(true);
      appendTranscript({
        source: "guidance",
        title: "Voice Command Input Ready",
        text: "Microphone speech recognition is not available in this browser. Use the quick voice command buttons or type a command below.",
        severity: "info",
      });
      toast.info("Browser speech recognition unavailable — use quick commands or type a command.");
      return;
    }

    try {
      stopListening();
      if (speakFallbackTimerRef.current) {
        window.clearTimeout(speakFallbackTimerRef.current);
        speakFallbackTimerRef.current = null;
      }
      setIsSpeaking(false);

      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";
      let fallbackCaptureActive = false;

      recognition.onstart = () => {
        setIsListening(true);
        appendTranscript({
          source: "guidance",
          title: "Listening...",
          text: "Speak a command such as 'Go to Dashboard', 'Read my alerts', or 'Open Organ Donor Card'.",
          severity: "info",
        });
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results?.[0]?.[0]?.transcript || "";
        if (resultText) {
          setIsListening(false);
          void executeVoiceCommand(resultText);
        }
      };

      recognition.onerror = (event: any) => {
        const code = event?.error || "";
        if (
          code === "not-allowed" ||
          code === "service-not-allowed" ||
          code === "audio-capture" ||
          code === "network"
        ) {
          // Keep visual input-ready mode active so users can use quick/typed commands or tap Listening to stop
          fallbackCaptureActive = true;
          setIsListening(true);
          toast.info("Microphone unavailable here — listening standby active for quick or typed commands.");
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (!fallbackCaptureActive) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(true);
    }
  }, [appendTranscript, executeVoiceCommand, stopListening]);

  // Clean up speech recognition & speech timer on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (speakFallbackTimerRef.current) {
        window.clearTimeout(speakFallbackTimerRef.current);
      }
    };
  }, []);

  const value: AccessibilityContextValue = {
    userId,
    preferences,
    devices,
    organPledge,
    showOnboardingPrompt,
    isListening,
    isSpeaking,
    lastVoiceTranscript,
    speechSupported,
    transcript,
    activeVisualAlert,
    openOnboardingPrompt: () => {
      if (getUser()?.role === "patient") {
        setShowOnboardingPrompt(true);
      }
    },
    closeOnboardingPrompt: () => setShowOnboardingPrompt(false),
    completeOnboarding,
    skipOnboarding,
    updatePreferences,
    toggleVoiceMode,
    toggleVisualFirstMode,
    addDevice,
    removeDevice,
    toggleDeviceSync,
    pairSmartVisionGlasses,
    saveOrganPledge,
    speak,
    announceVisualAlert,
    dismissVisualAlert: () => setActiveVisualAlert(null),
    clearTranscript: () => setTranscript([]),
    startListening,
    stopListening,
    executeVoiceCommand,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return ctx;
}
