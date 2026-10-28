import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  HeartPulse, Hospital as HospitalIcon, Globe, Siren, Heart, Pill, Activity,
  MessageCircle, Mic, MicOff, Send, Phone, Star, MapPin, Users, ShieldAlert,
  Play, Pause, RotateCcw, Volume2, CheckCircle2, AlertTriangle, ArrowRight,
  Filter, Search, Droplets, Check, X, Sparkles, Camera, Calendar, Clock, Award, Languages, UserCheck
} from "lucide-react";
import DashShell, { NavItem } from "../components/DashShell";
import { api, API } from "../lib/api";
import { generate500Hospitals, generate510Medicines, MULTILINGUAL_VIDEO_GUIDES, VideoAwarenessGuide, generate500BloodDonors, generate500Doctors } from "../lib/dataGenerator";
import { Hospital, Medicine, SOSAlert, BloodRequest, BloodDonor, Profile, Doctor } from "../types";
import { playChime, checkMicrophonePermissionState, LiveAudioAnalyzer } from "../lib/audioManager";
import { MicPermissionModal } from "../components/triage/MicPermissionModal";
import { AudioWaveformVisualizer } from "../components/triage/AudioWaveformVisualizer";
import { PhotoUploadModal } from "../components/patient/PhotoUploadModal";
import { CatalogPagination } from "../components/ui/CatalogPagination";
import { MultilingualVideoPlayer } from "../components/patient/MultilingualVideoPlayer";
import { WellnessTracker } from "../components/patient/WellnessTracker";

const NAV: NavItem[] = [
  { key: "overview", to: "/patient", label: "Overview", icon: Activity, exact: true },
  { key: "triage", to: "/patient/triage", label: "AI Triage", icon: MessageCircle },
  { key: "doctors", to: "/patient/doctors", label: "Doctors Directory", icon: Users },
  { key: "hospitals", to: "/patient/hospitals", label: "Hospital Finder (500+)", icon: HospitalIcon },
  { key: "awareness", to: "/patient/awareness", label: "Video Awareness", icon: Globe },
  { key: "blood", to: "/patient/blood", label: "Blood Network", icon: Heart },
  { key: "alerts", to: "/patient/alerts", label: "Alerts & SOS", icon: Siren },
  { key: "medicine", to: "/patient/medicine", label: "Medicine Guide (500+)", icon: Pill },
  { key: "wellness", to: "/patient/wellness", label: "Wellness", icon: HeartPulse },
];

const sevClass = (s: string) => ({
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-amber-100 text-amber-800 border-amber-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
}[s] || "bg-slate-100 text-slate-700");

// 1. OVERVIEW
function Overview() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [stats, setStats] = useState<any>({});
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    api.get<Partial<Profile>>("/profile").then(r => setProfile(r.data || {}));
    api.get("/patients/stats").then(r => setStats(r.data || {}));
    api.get<SOSAlert[]>("/alerts").then(r => setAlerts((r.data || []).slice(0, 4)));
  }, []);

  const handleSavePhoto = async (newUrl: string) => {
    const updated = { ...profile, photo_url: newUrl };
    setProfile(updated);
    await api.post("/profile", updated);
    window.dispatchEvent(new Event("profile-updated"));
    toast.success("Patient profile photo updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Banner with Profile Photo & Greetings */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-teal-100">
                Hi {profile.preferred_name || "there"}, I'm your healthcare guardian
              </span>
              <span className="text-[10px] bg-teal-800/80 border border-teal-400/40 px-2 py-0.5 rounded-full font-mono">
                ID: SG-PT-{profile.preferred_name ? '942' : '001'}
              </span>
            </div>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
              How are you feeling today?
            </h2>
            <p className="mt-2 text-teal-50/90 text-sm leading-relaxed">
              Describe any symptoms in our AI Triage assistant. We evaluate urgency calmly, identify warning signs, suggest qualified specialists, and direct you to emergency care when necessary.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/patient/triage">
                <Button className="rounded-full bg-white text-teal-900 hover:bg-teal-50 font-semibold shadow-sm">
                  <MessageCircle size={16} className="mr-2 text-teal-700" />
                  Open AI Triage
                </Button>
              </Link>
              <Link to="/patient/doctors">
                <Button className="rounded-full bg-teal-800 text-white hover:bg-teal-900 font-semibold shadow-sm border border-teal-500/30">
                  <Users size={16} className="mr-2" />
                  Consult Doctors
                </Button>
              </Link>
              <Link to="/patient/alerts">
                <Button className="rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm">
                  <Siren size={16} className="mr-2" />
                  Emergency SOS
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Patient Digital Identity Card */}
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col items-center text-center max-w-xs w-full shadow-inner">
            <div className="relative group">
              <img
                src={profile.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
                alt="Patient Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/60 shadow-md ring-2 ring-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
                }}
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-white text-teal-800 p-1.5 rounded-full shadow hover:bg-teal-50 transition-transform active:scale-95"
                title="Change Profile Photo"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="mt-2.5 font-bold text-white text-base truncate max-w-[200px]">
              {profile.preferred_name || "Patient Record"}
            </div>
            <div className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
              <span className="font-medium">Blood: {profile.blood_group || "O+"}</span>
              <span>·</span>
              <span>{profile.location || "Hyderabad"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="mt-3 text-[11px] font-semibold text-teal-100 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full border border-white/20 transition-all flex items-center gap-1"
            >
              <Camera size={12} />
              Update Patient Photo
            </button>
          </div>
        </div>
      </div>

      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={profile.photo_url}
        onSavePhoto={handleSavePhoto}
      />

      {/* Profile Health Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Blood group", v: profile.blood_group || "O+", icon: Heart },
          { label: "Life stage", v: profile.age_bracket || "Adult", icon: Users },
          { label: "Language", v: (profile.language || "en").toUpperCase(), icon: Globe },
          { label: "First-aid ready", v: profile.first_aid_cpr ? "Certified / Ready" : "Learning", icon: ShieldAlert },
        ].map((c) => {
          const I = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{c.label}</div>
                <I size={16} className="text-teal-700" />
              </div>
              <div className="mt-2 font-display font-bold text-xl text-slate-900 capitalize">{c.v}</div>
            </div>
          );
        })}
      </div>

      {/* Network Counters & Live Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="font-display font-bold text-base text-slate-900">Recent Community Emergency Alerts</div>
            <Link to="/patient/alerts" className="text-xs font-semibold text-teal-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center">No open emergency alerts in your immediate radius.</div>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="capitalize text-[11px]">{a.kind} · {a.severity}</Badge>
                      <span className="text-xs text-slate-500 font-medium">{a.created_at}</span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium mt-1">{a.note}</p>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {a.location || "Area location"}
                    </div>
                  </div>
                  <Badge variant={a.status === "open" ? "destructive" : "secondary"}>{a.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Quick Access */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="font-display font-bold text-base text-slate-900">Safety Quick Actions</div>
          
          <Link to="/patient/hospitals" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-200 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>Find Nearby Hospital</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">520+ facilities with live ICU & emergency beds</p>
          </Link>

          <Link to="/patient/blood" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-red-50/50 hover:border-red-200 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>Emergency Blood Needed</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">View urgent hospital transfusion requests</p>
          </Link>

          <Link to="/patient/medicine" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>500+ Medicine Guide</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Dosages, indications, and side effect cautions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. AI TRIAGE (With Hands-Free Audio Capture & Mic Permission Handler)
function Triage() {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "Hello! I am your Silent Guardian health triage companion.\n\nPlease describe what you or your loved one are experiencing. You can type or tap the microphone to speak hands-free. I will evaluate urgency calmly, highlight critical emergency signs, recommend qualified specialists, and suggest safe home-care steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Voice & Microphone States
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | undefined>(undefined);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'denied' | 'granted' | 'unsupported'>('prompt');
  const [voiceLang, setVoiceLang] = useState("en-IN");
  
  const sessionId = useRef(crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Audio Analyzer and Timers
  const analyzerRef = useRef<LiveAudioAnalyzer | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>("");

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  // Sync profile language on mount if available
  useEffect(() => {
    api.get<Partial<Profile>>("/profile").then((r) => {
      const lang = r.data?.language;
      if (lang === "hi") setVoiceLang("hi-IN");
      else if (lang === "te") setVoiceLang("te-IN");
      else if (lang === "ta") setVoiceLang("ta-IN");
      else if (lang === "es") setVoiceLang("es-ES");
      else setVoiceLang("en-IN");
    });

    // Check initial permission status
    checkMicrophonePermissionState().then((s) => setMicPermissionState(s));

    return () => {
      stopVoice(false);
    };
  }, []);

  const send = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || busy) return;

    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    currentTranscriptRef.current = "";
    setBusy(true);

    try {
      const resp = await api.post("/triage/chat", {
        message: text,
        session_id: sessionId.current,
      });

      const reply = resp.data?.reply || "Guidance received. Please consult a qualified physician.";
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      toast.error("Triage temporarily unavailable");
    } finally {
      setBusy(false);
    }
  };

  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSilenceCountdown(undefined);
  };

  const stopVoice = (shouldSubmit: boolean = false) => {
    clearSilenceTimers();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }

    setListening(false);
    setIsSpeaking(false);

    if (shouldSubmit) {
      playChime('stop');
      const textToSubmit = currentTranscriptRef.current.trim() || input.trim();
      if (textToSubmit) {
        toast.info("Hands-free input complete. Submitting symptoms to triage...");
        send(textToSubmit);
      }
    }
  };

  const startHandsFreeCapture = async () => {
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;

    // 1. Initialize Web Audio Live Analyzer (requests getUserMedia)
    const analyzer = new LiveAudioAnalyzer();
    const micGranted = await analyzer.start();

    if (!micGranted) {
      setMicPermissionState('denied');
      playChime('error');
      setShowPermissionModal(true);
      return;
    }

    analyzerRef.current = analyzer;
    setMicPermissionState('granted');
    setShowPermissionModal(false);

    // 2. Play acoustic start chime
    playChime('start');
    setListening(true);
    setIsSpeaking(false);
    clearSilenceTimers();

    if (!SR) {
      toast.info("Audio analyzer active. Browser does not support speech recognition, please speak or type.");
      return;
    }

    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = voiceLang;

      rec.onstart = () => {
        setListening(true);
      };

      rec.onresult = (e: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          setInput(combined);
          currentTranscriptRef.current = combined;
          setIsSpeaking(true);

          // Reset the 2-second silence auto-send timer
          clearSilenceTimers();
          setSilenceCountdown(2);

          countdownIntervalRef.current = setInterval(() => {
            setSilenceCountdown((prev) => (prev && prev > 1 ? prev - 1 : prev));
          }, 1000);

          silenceTimerRef.current = setTimeout(() => {
            // Auto-send after 2 seconds of silence!
            stopVoice(true);
          }, 2000);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicPermissionState('denied');
          playChime('error');
          setShowPermissionModal(true);
          stopVoice(false);
        }
      };

      rec.onend = () => {
        // If still listening and user hasn't explicitly stopped, restart continuous capture
        if (listening && analyzerRef.current) {
          try {
            rec.start();
          } catch {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
    }
  };

  const handleMicToggle = async () => {
    if (listening) {
      stopVoice(true); // User clicked to stop & submit
      return;
    }

    const state = await checkMicrophonePermissionState();
    setMicPermissionState(state);

    if (state === 'denied') {
      playChime('error');
      setShowPermissionModal(true);
      return;
    }

    startHandsFreeCapture();
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">Clinical Symptom Triage</div>
              <div className="text-[11px] text-slate-500">Hands-free voice reporting enabled</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector for Speech */}
            <select
              value={voiceLang}
              onChange={(e) => {
                setVoiceLang(e.target.value);
                if (listening) {
                  stopVoice(false);
                  toast.info("Voice language updated. Tap mic to speak.");
                }
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
              title="Voice Recognition Language"
            >
              <option value="en-IN">English (EN)</option>
              <option value="hi-IN">हिन्दी (HI)</option>
              <option value="te-IN">తెలుగు (TE)</option>
              <option value="ta-IN">தமிழ் (TA)</option>
              <option value="es-ES">Español (ES)</option>
            </select>

            <span className="text-xs bg-teal-50 border border-teal-200 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full">
              Active Session
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-4 sg-scrollbar">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : m.text.includes("SEEK EMERGENCY CARE NOW")
                    ? "bg-red-50 text-red-950 border border-red-300 rounded-bl-none font-medium"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-600 rounded-2xl px-4 py-2.5 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                Evaluating symptoms and matching clinical guidelines...
              </div>
            </div>
          )}
        </div>

        {/* Live Audio Visualizer Bar (Visible during active recording) */}
        {listening && (
          <div className="px-4 py-3 bg-teal-50/70 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3 sg-fade-in">
            <AudioWaveformVisualizer
              analyzer={analyzerRef.current}
              isListening={listening}
              isSpeaking={isSpeaking}
              silenceSecondsRemaining={silenceCountdown}
            />
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => stopVoice(false)}
                className="h-8 rounded-full text-xs text-slate-600 bg-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => stopVoice(true)}
                className="h-8 rounded-full text-xs bg-teal-700 hover:bg-teal-800 text-white font-medium"
              >
                Send Now
              </Button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 flex items-end gap-2 bg-white">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleMicToggle}
            className={`rounded-full shrink-0 transition-all ${
              listening
                ? "bg-red-50 border-red-400 text-red-600 shadow-sm ring-2 ring-red-400/30"
                : "text-slate-700 hover:text-teal-700 hover:border-teal-300"
            }`}
            title={listening ? "Stop and submit voice symptoms" : "Hands-free Voice Symptom Reporting"}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              currentTranscriptRef.current = e.target.value;
            }}
            placeholder={
              listening
                ? "Listening... speak symptoms clearly (will auto-send after 2 seconds of silence)"
                : "Type symptoms or tap microphone to speak hands-free..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="min-h-[48px] max-h-32 resize-none rounded-xl"
            rows={1}
          />

          <Button
            onClick={() => send()}
            disabled={busy || !input.trim()}
            className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-10 px-5 shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Triage Guidance Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        {/* Voice Feature Callout Card */}
        <div className="rounded-2xl bg-teal-50/80 border border-teal-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <Mic size={16} className="text-teal-700" />
            Hands-Free Voice Triage
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Tap the microphone button to dictate symptoms in your preferred language. The engine detects when you finish speaking and submits automatically after 2 seconds of silence.
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-teal-700 font-medium">
            <span>Audio: In-browser Web Audio</span>
            <button
              onClick={() => {
                setInput("I have sudden chest heaviness radiating to my left arm with cold sweats");
                toast.info("Loaded emergency cardiac example. Press send or speak.");
              }}
              className="text-teal-900 underline font-semibold"
            >
              Test sample
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <AlertTriangle size={18} />
            Emergency Red Flags
          </div>
          <p className="text-xs text-red-700 mt-2 leading-relaxed">
            If you or someone nearby experiences sudden chest pressure with sweating, drooping on one side of the face, difficulty speaking, severe bleeding, or loss of consciousness, do not wait:
          </p>
          <div className="mt-3">
            <Link to="/patient/alerts">
              <Button className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white text-xs h-9 font-semibold">
                <Siren size={14} className="mr-1.5" />
                Trigger Instant Emergency SOS
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="font-semibold text-sm text-slate-900">How to use Voice Triage</div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li>Speak symptoms naturally (e.g. <em>"Fever for 3 days and severe sore throat"</em>).</li>
            <li>Pause for 2 seconds to auto-submit, or tap <strong>Send Now</strong>.</li>
            <li>Mention who is experiencing the symptoms and their approximate age.</li>
          </ul>
        </div>
      </div>

      {/* Microphone Permission Modal */}
      <MicPermissionModal
        isOpen={showPermissionModal}
        permissionState={micPermissionState}
        onClose={() => setShowPermissionModal(false)}
        onRetry={startHandsFreeCapture}
        onUseFallbackText={() => {
          setShowPermissionModal(false);
          inputRef.current?.focus();
        }}
      />
    </div>
  );
}

// 3. HOSPITAL FINDER (500+ Hospitals with Search & Pagination)
function HospitalFinder() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    // Load generated 520+ hospitals
    const fullList = generate500Hospitals();
    setHospitals(fullList);
  }, []);

  const filtered = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = selectedSpecialty === "all" || h.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpec;
  });

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Hospital & Emergency Resource Locator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Browse 520+ verified hospitals with real-time ICU, ER, and ventilator bed availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full tabular-nums">
            {filtered.length} Facilities Found
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-8 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by hospital name, city (e.g. Hyderabad, Delhi, Bengaluru), or area..."
            className="pl-10 h-10"
          />
        </div>
        <div className="md:col-span-4">
          <Select
            value={selectedSpecialty}
            onValueChange={(val) => {
              setSelectedSpecialty(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Emergency Care">Emergency Care</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Trauma">Trauma & Ortho</SelectItem>
              <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
              <SelectItem value="Pulmonology">Pulmonology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((h) => (
          <div key={h.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                    {h.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin size={12} className="text-teal-700" />
                    <span>{h.city}</span>
                    <span>·</span>
                    <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {h.rating}
                    </span>
                  </div>
                </div>
                {h.verified ? (
                  <Badge variant="default" className="text-[10px] shrink-0">Verified</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-amber-700 shrink-0">Audit Pending</Badge>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-600">
                {h.address}
              </div>

              {/* Specialties tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {h.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
              </div>

              {/* Bed Metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-teal-50/60 p-2">
                  <div className="text-[10px] uppercase font-bold text-teal-800">ICU Beds</div>
                  <div className="font-display font-extrabold text-base text-teal-900 tabular-nums">{h.icu_available}</div>
                </div>
                <div className="rounded-lg bg-amber-50/60 p-2">
                  <div className="text-[10px] uppercase font-bold text-amber-800">ER Beds</div>
                  <div className="font-display font-extrabold text-base text-amber-900 tabular-nums">{h.er_available}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-600">Ventilators</div>
                  <div className="font-display font-extrabold text-base text-slate-900 tabular-nums">{h.ventilator_available}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between">
              <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800">
                <Phone size={13} />
                {h.phone}
              </a>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(`Emergency contact initiated with ${h.name}`)}
                className="rounded-full text-xs h-8"
              >
                Contact Desk
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={perPage}
          onPageChange={setPage}
          itemName="hospitals"
        />
      </div>
    </div>
  );
}

// 4. MULTILINGUAL VIDEO AWARENESS & EMERGENCY SIMULATOR
function VideoAwareness() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Multilingual Emergency Video Simulator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Clinical AI video simulators with synchronized audio metronome, 100-120 BPM pacing, and multilingual subtitles.
          </p>
        </div>
        <Badge variant="default" className="bg-teal-50 text-teal-900 border-teal-300 font-bold self-start">
          6 Languages Supported (EN, HI, TE, TA, BN, ES)
        </Badge>
      </div>

      {/* Embedded High-Fidelity Multilingual Medical Video Simulator */}
      <MultilingualVideoPlayer />
    </div>
  );
}

// 5. BLOOD NETWORK (500+ Donors & Urgent Hospital Requests)
function BloodNetwork() {
  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filterGroup, setFilterGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [donorPage, setDonorPage] = useState(1);
  const [donorPageSize, setDonorPageSize] = useState(12);
  const [userProfile, setUserProfile] = useState<Partial<Profile>>({});

  useEffect(() => {
    api.get<BloodDonor[]>("/blood/donors").then((r) => setDonors(r.data || generate500BloodDonors()));
    api.get<BloodRequest[]>("/blood/requests").then((r) => setRequests(r.data || []));
    api.get<Partial<Profile>>("/profile").then((r) => setUserProfile(r.data || {}));
  }, []);

  const bloodGroups = ["all", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

  const filteredDonors = donors.filter((d) => {
    const q = search.toLowerCase();
    const matchQ = !search || d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
    const matchGroup = filterGroup === "all" || d.blood_group === filterGroup;
    const matchEligible = !onlyEligible || d.eligible;
    return matchQ && matchGroup && matchEligible;
  });

  const paginatedDonors = filteredDonors.slice((donorPage - 1) * donorPageSize, donorPage * donorPageSize);

  const filteredRequests = requests.filter(
    (b) => filterGroup === "all" || b.blood_group === filterGroup
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Emergency Blood & Transfusion Network (500+ Donors)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real-time voluntary donor registry across 20+ cities, matching blood groups and active hospital requisitions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="tabular-nums font-bold">
            {requests.length} Urgent Open Calls
          </Badge>
          <Badge variant="default" className="bg-teal-50 text-teal-900 border-teal-300 font-bold tabular-nums">
            {donors.length} Verified Donors
          </Badge>
        </div>
      </div>

      {/* Donor Status Card */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-red-100">Your Donor Profile</div>
          <div className="font-display font-bold text-xl mt-1">
            {userProfile.preferred_name || "Community Member"} · Blood Group {userProfile.blood_group || "O+"}
          </div>
          <p className="text-xs text-red-100/90 mt-1">
            {userProfile.willing_to_donate
              ? "You are registered as an active emergency donor. You will receive notifications for matches."
              : "Enable blood donor status in your profile to save lives during critical emergencies."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("Donor status verified in regional blood registry")}
          className="rounded-full bg-white text-red-700 hover:bg-red-50 border-none shrink-0 font-semibold"
        >
          {userProfile.willing_to_donate ? "Verified Donor Active" : "Register as Donor"}
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'donors'
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Verified Donors Directory ({donors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Urgent Hospital Requisitions ({requests.length})
          </button>
        </div>

        {/* Blood Group Quick Filters */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {bloodGroups.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => {
                setFilterGroup(bg);
                setDonorPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterGroup === bg
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-red-300"
              }`}
            >
              {bg === "all" ? "All Groups" : bg}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'donors' ? (
        /* Donors Directory View */
        <div className="space-y-4">
          <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="md:col-span-8 relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDonorPage(1);
                }}
                placeholder="Search donors by name, locality, or city (e.g. Jubilee Hills, Hyderabad)..."
                className="pl-10 h-10 text-xs"
              />
            </div>
            <div className="md:col-span-4 flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={(e) => {
                    setOnlyEligible(e.target.checked);
                    setDonorPage(1);
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Show Only Medically Eligible Donors</span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDonors.map((d) => (
              <div key={d.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-base text-slate-900">{d.name}</span>
                        {d.verified_donor && (
                          <span title="Verified Donor">
                            <CheckCircle2 size={14} className="text-teal-600 fill-teal-50" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        <span>{d.location}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-xs font-mono">
                      {d.blood_group}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Donations Given:</span>
                      <strong className="text-slate-800">{d.donations_count} times</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Last Donated:</span>
                      <span className="text-slate-500">{d.last_donated}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.eligible ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {d.eligible ? "Eligible to Donate" : "Cooldown Period"}
                  </span>
                  <a
                    href={`tel:${d.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <Phone size={12} /> Contact
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <CatalogPagination
              currentPage={donorPage}
              totalItems={filteredDonors.length}
              pageSize={donorPageSize}
              onPageChange={setDonorPage}
              onPageSizeChange={setDonorPageSize}
              pageSizeOptions={[12, 24, 48]}
              itemName="blood donors"
            />
          </div>
        </div>
      ) : (
        /* Requests Grid View */
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredRequests.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="destructive" className="font-mono text-xs px-2.5 py-0.5">
                    Need {r.blood_group}
                  </Badge>
                  <h3 className="font-display font-bold text-base text-slate-900 mt-2">
                    {r.patient_name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.hospital} · {r.city}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {r.urgency}
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-2 tabular-nums">
                    {r.units} Units Required
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{r.created_at}</span>
                <a href={`tel:${r.contact}`} className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline">
                  <Phone size={12} /> Contact Blood Bank
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 6. ALERTS & SOS
function AlertsAndSOS() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [kind, setKind] = useState<any>("medical");
  const [severity, setSeverity] = useState<any>("critical");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("Jubilee Hills, Hyderabad");
  const [busy, setBusy] = useState(false);

  const load = () => api.get<SOSAlert[]>("/alerts").then((r) => setAlerts(r.data || []));
  useEffect(() => { load(); }, []);

  const triggerSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Please add a brief note for emergency responders");
      return;
    }
    setBusy(true);
    try {
      await api.post("/alerts", { kind, severity, note, location });
      toast.success("Emergency SOS alert broadcasted to nearby responders!");
      setNote("");
      load();
    } catch {
      toast.error("Failed to trigger SOS alert");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-red-600 text-white p-6 sm:p-8 shadow-xl sg-emergency-pulse">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-700/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Siren size={14} className="animate-spin" /> Live Emergency Dispatch
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trigger Immediate Emergency Alert
          </h2>
          <p className="mt-2 text-red-100 text-sm leading-relaxed">
            Sends an immediate distress beacon with your live GPS location to local emergency ambulances, registered CPR responders, and your emergency guardian.
          </p>

          <form onSubmit={triggerSOS} className="mt-6 space-y-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-[11px]">Emergency Kind</Label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl bg-white text-slate-900 px-3 text-xs font-medium"
                >
                  <option value="medical">Severe Medical Incident</option>
                  <option value="blood">Critical Blood Hemorrhage</option>
                  <option value="first_aid">Bystander Collapse / CPR</option>
                </select>
              </div>

              <div>
                <Label className="text-white text-[11px]">Severity Level</Label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl bg-white text-slate-900 px-3 text-xs font-medium"
                >
                  <option value="critical">Critical (Immediate Danger)</option>
                  <option value="high">High Urgency</option>
                  <option value="medium">Medium Priority</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-white text-[11px]">Describe Situation & Symptoms</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Unresponsive person at metro gate 2, need ambulance and defibrillator"
                className="mt-1 bg-white text-slate-900"
              />
            </div>

            <div>
              <Label className="text-white text-[11px]">Estimated GPS / Address Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 bg-white text-slate-900"
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full bg-white text-red-700 hover:bg-red-50 font-bold text-sm shadow-md"
            >
              {busy ? "Broadcasting SOS..." : "BROADCAST SOS ALERT NOW"}
            </Button>
          </form>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="font-display font-bold text-lg text-slate-900 mb-4">
          Emergency Distress Beacon History
        </h3>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="capitalize">{a.kind} · {a.severity}</Badge>
                  <span className="text-xs text-slate-500">{a.created_at}</span>
                </div>
                <div className="font-semibold text-sm text-slate-900 mt-1.5">{a.note}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {a.location}
                </div>
              </div>
              <Badge variant={a.status === "open" ? "destructive" : "secondary"}>
                {a.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. MEDICINE GUIDE (500+ Medicines with Efficacy Ratings & Indications)
function MedicineGuide() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    setMedicines(generate510Medicines());
  }, []);

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(q) ||
      m.uses.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.good_for && m.good_for.toLowerCase().includes(q));
    const matchesCat = category === "all" || m.category.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Clinical Medicine & Pharmacology Guide (520+ Indexed)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Verified pharmacology with clinical efficacy ratings, optimal indications ("Where it is Good"), and safety warnings.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full tabular-nums">
          {filtered.length} Medicines Indexed
        </span>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-8 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by medicine, condition, where it is good, or generic molecule (e.g. Paracetamol, Asthma, Metformin)..."
            className="pl-10 h-10 text-xs"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Therapeutic Classes</option>
            <option value="Antibiotic">Antibiotics & Antimicrobials</option>
            <option value="Cardiovascular">Cardiovascular & Blood Pressure</option>
            <option value="Analgesic">Analgesics & Fever Relievers</option>
            <option value="Gastrointestinal">Gastrointestinal & Acid Relief</option>
            <option value="Antidiabetic">Antidiabetic & Glycemic Control</option>
            <option value="Respiratory">Respiratory & Antiallergic</option>
            <option value="Neurological">Neurology & Nerve Pain</option>
          </select>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                    {m.name}
                  </h3>
                  <div className="text-xs text-teal-700 font-semibold mt-0.5">{m.category}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {m.prescription_required ? (
                    <Badge variant="destructive" className="text-[10px]">Rx Prescription</Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px] bg-emerald-600">OTC Safe</Badge>
                  )}
                  {m.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      <span>{m.rating}</span>
                      <span className="text-[10px] text-amber-600 font-normal">({m.efficacy_percent}% efficacy)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Where it is Good highlight badge */}
              {m.good_for && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-xs text-emerald-900">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-0.5">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Where it is Good & Most Effective:
                  </div>
                  <p className="leading-relaxed">{m.good_for}</p>
                </div>
              )}

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div className="font-semibold text-slate-700">Recommended Adult Dosage:</div>
                <div className="text-slate-600 mt-0.5 leading-relaxed">{m.dosage}</div>
              </div>

              {m.warnings && (
                <div className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl">
                  <span className="font-bold text-amber-800">Safety Warning: </span>
                  {m.warnings}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[170px]" title={m.side_effects}>
                Side effects: {m.side_effects.slice(0, 32)}...
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.info(`${m.name}: ${m.precautions}`)}
                className="text-teal-700 text-xs h-7 px-2 font-semibold"
              >
                Clinical Sheet
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
          itemName="medicines"
        />
      </div>
    </div>
  );
}

// 8. WELLNESS DASHBOARD & STEP TRACKER
function Wellness() {
  return <WellnessTracker />;
}

// 9. DOCTORS DIRECTORY (Comprehensive Clinical Profiles)
function DoctorsDirectory() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");

  useEffect(() => {
    api.get<Doctor[]>("/doctors").then(r => setDoctors(r.data || []));
  }, []);

  const specialties = ["all", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Pulmonology & Critical Care", "Oncology & Surgical", "General Medicine"];

  const filtered = doctors.filter(d => {
    const matchesSpec = specialty === "all" || d.specialty.toLowerCase().includes(specialty.toLowerCase());
    const q = query.toLowerCase();
    const matchesQuery = !query || 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q) ||
      (d.hospital_name && d.hospital_name.toLowerCase().includes(q)) ||
      (d.city && d.city.toLowerCase().includes(q)) ||
      (d.degrees && d.degrees.toLowerCase().includes(q)) ||
      (d.council_reg_no && d.council_reg_no.toLowerCase().includes(q));
    return matchesSpec && matchesQuery;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleConfirmBooking = () => {
    if (!bookingDoc) return;
    toast.success(`OPD Consultation booked with ${bookingDoc.name}! Reference: APPT-${Math.floor(100000 + Math.random() * 900000)}. Token sent via SMS.`);
    setBookingDoc(null);
    setBookingDate("");
    setBookingSlot("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-200 px-3 py-1 rounded-full text-xs font-semibold border border-teal-400/30">
            <UserCheck size={14} className="text-teal-300" />
            Verified Medical Practitioners · State Medical Council Audited
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Consult Specialist Physicians & Surgeons
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Search verified specialists with public Council Registration numbers, outpatient OPD schedules, clinical credentials, and real-time patient ratings.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-bold tabular-nums">
          {filtered.length} Verified Doctors
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by physician name, degree, council ID, hospital or city..."
            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-500 flex-shrink-0" />
          <Select value={specialty} onValueChange={(val) => {
            setSpecialty(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-56 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map(s => (
                <SelectItem key={s} value={s} className="capitalize text-xs">
                  {s === "all" ? "All Specialties" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {paginated.map(doc => (
          <div
            key={doc.id}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Doctor Header */}
              <div className="flex items-start gap-4">
                <img
                  src={doc.photo_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"}
                  alt={doc.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-slate-900 truncate">
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold font-mono">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      <span>{doc.rating || "4.8"}</span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-teal-700 mt-0.5">
                    {doc.specialty}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    {doc.degrees || "MBBS, MD"} · {doc.experience_years ? `${doc.experience_years} yrs exp` : "Senior Consultant"}
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1.5 font-mono">
                    <Award size={11} className="text-teal-600" />
                    <span>Reg: {doc.council_reg_no || "MCI-STATE-VERIFIED"}</span>
                  </div>
                </div>
              </div>

              {/* Consultation & Schedule Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <HospitalIcon size={14} className="text-slate-400" />
                    {doc.hospital_name || "Apollo Hospitals"}
                  </span>
                  <span className="text-slate-500">{doc.city || "Hyderabad"}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Clock size={13} className="text-teal-600" />
                    <span>OPD: {doc.opd_hours || "10:00 AM - 02:00 PM"}</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {Array.isArray(doc.available_days) ? doc.available_days.slice(0, 3).join(", ") + "..." : (doc.available_days || "Mon - Sat")}
                  </span>
                </div>

                {doc.languages && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <Languages size={13} className="text-slate-400" />
                    <span>Speaks: {doc.languages.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 mt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                doc.status === "available" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}>
                {doc.status === "available" ? "Available Today" : "In Surgery / On Call"}
              </span>
              <Button
                size="sm"
                onClick={() => setBookingDoc(doc)}
                className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold px-4 h-8"
              >
                <Calendar size={13} className="mr-1.5" />
                Book Consultation
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
          itemName="specialist doctors"
        />
      </div>

      {/* OPD Booking Modal */}
      {bookingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Book OPD Consultation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm outpatient visit with {bookingDoc.name}
                </p>
              </div>
              <button
                onClick={() => setBookingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-teal-900">{bookingDoc.name} ({bookingDoc.specialty})</div>
              <div className="text-teal-800">{bookingDoc.hospital_name} · Reg No: {bookingDoc.council_reg_no}</div>
              <div className="text-teal-700">Consultation Timings: {bookingDoc.opd_hours}</div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Preferred Date</Label>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-1 text-xs h-9"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label className="text-xs">Time Slot</Label>
                <Select value={bookingSlot} onValueChange={setBookingSlot}>
                  <SelectTrigger className="mt-1 text-xs h-9">
                    <SelectValue placeholder="Select Slot (OPD Hours)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning-1">10:00 AM - 10:30 AM</SelectItem>
                    <SelectItem value="morning-2">11:00 AM - 11:30 AM</SelectItem>
                    <SelectItem value="afternoon-1">12:30 PM - 01:00 PM</SelectItem>
                    <SelectItem value="afternoon-2">02:30 PM - 03:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingDoc(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmBooking}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs"
              >
                Confirm Appointment Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MAIN PATIENT DASHBOARD ROUTER
export default function PatientDashboard() {
  return (
    <DashShell title="Patient Portal" nav={NAV} accent="teal">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/doctors" element={<DoctorsDirectory />} />
        <Route path="/hospitals" element={<HospitalFinder />} />
        <Route path="/awareness" element={<VideoAwareness />} />
        <Route path="/blood" element={<BloodNetwork />} />
        <Route path="/alerts" element={<AlertsAndSOS />} />
        <Route path="/medicine" element={<MedicineGuide />} />
        <Route path="/wellness" element={<Wellness />} />
      </Routes>
    </DashShell>
  );
}
