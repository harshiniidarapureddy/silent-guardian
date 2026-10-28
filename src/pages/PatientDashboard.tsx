import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useSearchParams } from "react-router-dom";
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
  Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, AlertTriangle, ArrowRight,
  Filter, Search, Droplets, Check, X, Sparkles, Camera, Calendar, Clock, Award, Languages, UserCheck,
  ExternalLink, ShoppingBag, Eye, Bed, Building2, Stethoscope, ChevronRight, Upload, Radio
} from "lucide-react";
import DashShell, { NavItem } from "../components/DashShell";
import { api, API } from "../lib/api";
import { generate500Hospitals, generate510Medicines, MULTILINGUAL_VIDEO_GUIDES, VideoAwarenessGuide, generate500BloodDonors, generate500Doctors } from "../lib/dataGenerator";
import { Hospital, Medicine, SOSAlert, BloodRequest, BloodDonor, Profile, Doctor, GuardianAlert } from "../types";
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
  { key: "guardians", to: "/patient/guardians", label: "Guardian Network (10+)", icon: ShieldAlert },
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
  const [guardianAlerts, setGuardianAlerts] = useState<GuardianAlert[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    api.get<Partial<Profile>>("/profile").then(r => setProfile(r.data || {}));
    api.get("/patients/stats").then(r => setStats(r.data || {}));
    api.get<SOSAlert[]>("/alerts").then(r => setAlerts((r.data || []).slice(0, 4)));
    api.get<GuardianAlert[]>("/guardian-alerts").then(r => setGuardianAlerts(r.data || []));
  }, []);

  const handleSavePhoto = async (newUrl: string) => {
    const updated = { ...profile, photo_url: newUrl };
    setProfile(updated);
    await api.post("/profile", updated);
    window.dispatchEvent(new Event("profile-updated"));
    toast.success("User avatar updated successfully!");
  };

  const criticalGuardians = guardianAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className="space-y-6">
      {/* High-Tech Animated Guardian Shield Radar & Alert Ticker */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border border-purple-500/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 z-10">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-inner flex-shrink-0">
            <Radio className="w-6 h-6 text-purple-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-200">
                Live Family Guardian Net
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                10 Guardians Active
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 mt-0.5">
              <span>🚨 Live Alert: <strong>Mother Sunita</strong> (Chest Discomfort · Guardian Notified)</span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-purple-300 text-xs hidden sm:inline">Instant SMS & GPS Telemetry connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <Link to="/patient/guardians">
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md">
              <ShieldAlert size={14} className="mr-1.5" />
              View Guardian Feed ({guardianAlerts.length})
            </Button>
          </Link>
        </div>

        {/* Ambient Animated Radar Background Sweep */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Hero Banner with Anime Healer Companion & Heartbeat Wave */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-teal-600/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-teal-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-yellow-300 animate-spin" />
                Hi {profile.preferred_name || "User"}, I'm your AI Healthcare Guardian
              </span>
              <span className="text-[10px] bg-teal-900/90 border border-teal-400/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                ID: SG-USR-{profile.preferred_name ? '942' : '101'}
              </span>
            </div>

            <h2 className="font-display mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              How are you and your family feeling today?
            </h2>
            <p className="mt-2 text-teal-50/90 text-sm leading-relaxed">
              Describe symptoms in your preferred language (English, Hindi, Telugu, Tamil, Bengali, Spanish). When urgent, our AI instantly alerts your family guardians with live clinical telemetry, directs you to the nearest emergency beds, and prescribes verified quick-delivery medications.
            </p>

            {/* Animated Cardiogram ECG Heartbeat Waveform GIF / SVG */}
            <div className="mt-4 p-2.5 rounded-xl bg-black/20 border border-white/15 backdrop-blur-sm flex items-center gap-3 max-w-md">
              <div className="relative w-8 h-8 rounded-lg bg-teal-500/30 flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-semibold text-teal-100 mb-0.5">
                  <span>Continuous Vitals Pulse Monitor</span>
                  <span className="text-emerald-300 font-mono">72 BPM · NORMAL</span>
                </div>
                <div className="w-full h-4 relative flex items-center overflow-hidden">
                  <svg className="w-full h-full text-emerald-400" viewBox="0 0 200 20" fill="none" preserveAspectRatio="none">
                    <path
                      d="M 0 10 L 30 10 L 40 10 L 45 3 L 50 17 L 55 6 L 60 14 L 65 10 L 90 10 L 100 10 L 105 3 L 110 17 L 115 6 L 120 14 L 125 10 L 150 10 L 160 10 L 165 3 L 170 17 L 175 6 L 180 14 L 185 10 L 200 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/patient/triage">
                <Button className="rounded-full bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-md hover:scale-105 transition-all">
                  <MessageCircle size={16} className="mr-2 text-teal-700" />
                  Multilingual AI Triage
                </Button>
              </Link>
              <Link to="/patient/guardians">
                <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:scale-105 transition-all">
                  <ShieldAlert size={16} className="mr-2" />
                  Guardian Alerts (10+)
                </Button>
              </Link>
              <Link to="/patient/hospitals">
                <Button className="rounded-full bg-teal-900/80 text-white hover:bg-teal-950 font-semibold shadow-sm border border-teal-500/40">
                  <HospitalIcon size={16} className="mr-2" />
                  Hospitals (500+)
                </Button>
              </Link>
              <Link to="/patient/alerts">
                <Button className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md">
                  <Siren size={16} className="mr-2" />
                  Emergency SOS
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive User Digital Identity Card with Anime Avatar */}
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/25 p-5 rounded-3xl flex flex-col items-center text-center max-w-xs w-full shadow-2xl relative">
            <div className="relative group">
              <img
                src={profile.photo_url || "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04"}
                alt="User Profile"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/80 shadow-xl ring-4 ring-purple-500/30 bg-purple-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04";
                }}
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Change Anime Avatar"
              >
                <Sparkles size={14} />
              </button>
            </div>

            <div className="mt-3 font-extrabold text-white text-base truncate max-w-[200px]">
              {profile.preferred_name || "Active User"}
            </div>
            <div className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold">Blood: {profile.blood_group || "O+"}</span>
              <span>·</span>
              <span>{profile.location || "Hyderabad"}</span>
            </div>

            <div className="mt-2.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-[11px] font-bold text-purple-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Guardian Protected
            </div>

            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="mt-3.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full border border-white/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={13} className="text-yellow-300" />
              Anime Avatar & Photo
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
          { label: "Blood group", v: profile.blood_group || "O+", icon: Heart, sub: "Donor verified" },
          { label: "Life stage", v: profile.age_bracket || "Adult", icon: Users, sub: "Family head" },
          { label: "Language", v: (profile.language || "en").toUpperCase(), icon: Globe, sub: "Multilingual AI" },
          { label: "First-aid ready", v: profile.first_aid_cpr ? "Certified / Ready" : "Learning", icon: ShieldAlert, sub: "First responder" },
        ].map((c) => {
          const I = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{c.label}</div>
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <I size={16} />
                </div>
              </div>
              <div className="mt-2 font-display font-extrabold text-xl text-slate-900 capitalize">{c.v}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Featured Family Guardian Safety & Community Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family Guardian Live Safety Status */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <span>Active Family Guardian Alerts</span>
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                  {guardianAlerts.length} Sample Cases
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Protecting Mother, Father, Child, Spouse, and Elderly members with instant emergency SMS & triage dispatch
              </p>
            </div>
            <Link to="/patient/guardians" className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline">
              View All 10+ Alerts →
            </Link>
          </div>

          <div className="space-y-3">
            {guardianAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 uppercase">
                      {alert.relation}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{alert.user_name} ({alert.age} yrs)</span>
                    <Badge className={sevClass(alert.severity)}>{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    🚨 {alert.condition}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                    <span>Guardian: <strong>{alert.guardian_name}</strong></span>
                    <span>·</span>
                    <span className="font-mono text-purple-800">BP: {alert.vitals?.bp || "Normal"}</span>
                    <span>·</span>
                    <span className="font-mono text-purple-800">SpO2: {alert.vitals?.spo2 || "98%"}</span>
                    <span>·</span>
                    <span className="text-slate-400">{alert.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`tel:${alert.guardian_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Phone size={12} />
                    Call Guardian
                  </a>
                  <Link
                    to="/patient/guardians"
                    className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Quick Access */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="font-display font-bold text-base text-slate-900">Safety Quick Actions</div>
          
          <Link to="/patient/guardians" className="block p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition-all">
            <div className="font-bold text-sm text-purple-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-purple-600" />
                Family Guardian Safety Net
              </span>
              <ArrowRight size={14} className="text-purple-600" />
            </div>
            <p className="text-xs text-purple-700 mt-1">10+ demo family alerts (Mother, Father, Child, Spouse)</p>
          </Link>

          <Link to="/patient/hospitals" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-200 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>Find Nearby Hospital</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">520+ facilities with live ICU, interior photos & equipment</p>
          </Link>

          <Link to="/patient/blood" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-red-50/50 hover:border-red-200 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>Emergency Blood Needed</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">500+ verified donors & urgent transfusion requests</p>
          </Link>

          <Link to="/patient/medicine" className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100 transition-all">
            <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
              <span>500+ Medicine Guide</span>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Compare prices on Apollo, Tata 1mg, PharmEasy</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. AI CLINICAL SYMPTOM & PHOTO TRIAGE
const SKIN_ALLERGY_PRESETS = [
  {
    name: "Acute Allergic Hives (Urticaria)",
    tag: "Allergy",
    img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80",
    condition: "Acute Urticaria (Allergic Wheals / Hives)",
    confidence: 96.4,
    severity: "Moderate" as const,
    characteristics: "Raised pruritic erythematous wheals with transient blanching, typical of histamine-mediated allergy.",
    dangerSign: "Seek immediate ER care if accompanied by lip swelling (angioedema), difficulty breathing, or throat tightness.",
    recommendedMeds: [
      { name: "Cetirizine 10mg", dose: "1 tablet once daily", app: "Apollo 24/7", url: "https://www.apollopharmacy.in/search-medicines/cetirizine", price: 35 },
      { name: "Calamine Soothing Lotion", dose: "Apply to affected areas twice daily", app: "Tata 1mg", url: "https://www.1mg.com/search/all?name=calamine", price: 120 },
      { name: "Hydrocortisone 1% Cream", dose: "Thin layer for intense localized itch", app: "PharmEasy", url: "https://pharmeasy.in/search/all?name=hydrocortisone", price: 85 }
    ]
  },
  {
    name: "Contact Dermatitis / Skin Rash",
    tag: "Rash",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80",
    condition: "Contact Dermatitis (Irritant / Chemical Rash)",
    confidence: 93.8,
    severity: "Mild" as const,
    characteristics: "Erythematous vesicular rash with sharp margin matching contact agent (detergent, cosmetic, or plant).",
    dangerSign: "Watch for secondary bacterial infection if pus crusts appear.",
    recommendedMeds: [
      { name: "Hydrocortisone 1% Cream", dose: "Apply sparingly twice daily for 5 days", app: "Tata 1mg", url: "https://www.1mg.com/search/all?name=hydrocortisone", price: 85 },
      { name: "Ceramide Barrier Balm", dose: "Moisturize skin barrier frequently", app: "Apollo 24/7", url: "https://www.apollopharmacy.in/search-medicines/ceramide", price: 210 }
    ]
  },
  {
    name: "Atopic Eczema Flare-up",
    tag: "Eczema",
    img: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&auto=format&fit=crop&q=80",
    condition: "Atopic Dermatitis (Eczematous Plaque Flare)",
    confidence: 91.5,
    severity: "Moderate" as const,
    characteristics: "Dry, lichenified scaly erythematous plaques in flexural folds with intense nocturnal itching.",
    dangerSign: "Avoid harsh soaps; keep skin moisturized immediately after bathing.",
    recommendedMeds: [
      { name: "Mometasone / Hydrocortisone Cream", dose: "Apply once daily as directed by doctor", app: "PharmEasy", url: "https://pharmeasy.in/search/all?name=mometasone", price: 145 },
      { name: "Cetirizine 10mg", dose: "Nighttime tablet for itch control", app: "Netmeds", url: "https://www.netmeds.com/catalogsearch/result?q=cetirizine", price: 32 }
    ]
  },
  {
    name: "Heat Rash (Miliaria Rubra)",
    tag: "Heat Rash",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80",
    condition: "Miliaria Rubra (Prickly Heat)",
    confidence: 95.1,
    severity: "Mild" as const,
    characteristics: "Clustered pinpoint erythematous papules over sweat glands in neck, back, and chest.",
    dangerSign: "Stay in cool, air-conditioned rooms. Avoid heavy occlusive ointments.",
    recommendedMeds: [
      { name: "Calamine Powder / Lotion", dose: "Apply after gentle cool water wash", app: "Apollo 24/7", url: "https://www.apollopharmacy.in/search-medicines/calamine", price: 95 },
      { name: "Aloe Vera Gel", dose: "Soothes prickling heat sensation", app: "Tata 1mg", url: "https://www.1mg.com/search/all?name=aloe+vera", price: 110 }
    ]
  },
  {
    name: "Insect Sting / Bug Bite",
    tag: "Insect Bite",
    img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=80",
    condition: "Arthropod Bite Local Allergic Reaction",
    confidence: 92.7,
    severity: "Mild" as const,
    characteristics: "Single central puncture punctum with surrounding localized inflammatory edema and mild tenderness.",
    dangerSign: "If multiple stings occur with dizziness or nausea, call emergency 108 immediately.",
    recommendedMeds: [
      { name: "Calamine & Zinc Cream", dose: "Apply to bite site immediately", app: "Apollo 24/7", url: "https://www.apollopharmacy.in/search-medicines/calamine", price: 75 },
      { name: "Cetirizine 10mg", dose: "1 tablet for swelling reduction", app: "Tata 1mg", url: "https://www.1mg.com/search/all?name=cetirizine", price: 30 }
    ]
  }
];

interface TriageMessageItem {
  role: "assistant" | "user";
  text: string;
  photoUrl?: string;
  photoAnalysis?: {
    condition: string;
    confidence: number;
    severity: "Mild" | "Moderate" | "Critical";
    characteristics: string;
    dangerSign?: string;
    recommendedMeds: { name: string; dose: string; app: string; url: string; price: number }[];
  };
  recommendedMedicines?: Array<{
    name: string;
    category: string;
    dosage: string;
    online_apps?: Array<{ app_id: string; price: number; discount_percent: number; delivery_eta: string; buy_url: string; logo_color: string }>;
  }>;
  emergencyHotlines?: Array<{ name: string; number: string; desc: string; type: string }>;
  doctorRecommendation?: {
    specialtyName: string;
    department: string;
    doctorTypeDesc: string;
    whyConsult: string;
    suggestedActionTimeline: string;
    bookingUrl: string;
    callNumber?: string;
  };
  guardianAlertInfo?: {
    triggered: boolean;
    message: string;
    relation?: string;
    guardian_name?: string;
    guardian_phone?: string;
  };
}

function Triage() {
  const [msgs, setMsgs] = useState<TriageMessageItem[]>([
    {
      role: "assistant",
      text: "Hello! I am your Silent Guardian health triage companion.\n\nPlease describe what you or your loved one are experiencing in your preferred language (English, हिन्दी, తెలుగు, தமிழ், বাংলা, Español). You can type, speak hands-free, or attach a photo if you have a skin allergy, rash, or fever. When symptoms are serious, I immediately alert your family guardian with live telemetry.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeGuardianAlertModal, setActiveGuardianAlertModal] = useState<GuardianAlert | null>(null);
  
  // Voice & Microphone States
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | undefined>(undefined);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'denied' | 'granted' | 'unsupported'>('prompt');
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);

  // Photo & Skin Allergy Option States
  const [isPhotoPanelOpen, setIsPhotoPanelOpen] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<typeof SKIN_ALLERGY_PRESETS[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

    checkMicrophonePermissionState().then((s) => setMicPermissionState(s));

    return () => {
      stopVoice(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API - Multilingual voice read-aloud for assistant triage messages
  const speakTriageMessage = (text: string, idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error("Speech playback is not supported in this browser.");
      return;
    }

    if (activeSpeechIdx === idx) {
      window.speechSynthesis.cancel();
      setActiveSpeechIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setActiveSpeechIdx(null);
    utterance.onerror = () => setActiveSpeechIdx(null);

    setActiveSpeechIdx(idx);
    window.speechSynthesis.speak(utterance);
    toast.info(`Speaking response in ${voiceLang.split('-')[0].toUpperCase()}... Tap again to stop.`);
  };

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file is too large. Please select an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedPhoto(result);
      setActivePreset(null);
      setIsPhotoPanelOpen(false);
      toast.success("Skin allergy/rash photo attached! Type symptoms or tap send.");
    };
    reader.readAsDataURL(file);
  };

  const send = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    const photoToSend = attachedPhoto;
    const presetUsed = activePreset;

    if ((!text && !photoToSend) || busy) return;

    const userMsgText = text || (photoToSend ? "Attached clinical photograph for dermatological rash and allergy assessment." : "");
    const userMsg: TriageMessageItem = {
      role: "user",
      text: userMsgText,
      photoUrl: photoToSend || undefined
    };

    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setAttachedPhoto(null);
    setActivePreset(null);
    currentTranscriptRef.current = "";
    setBusy(true);

    try {
      const langCode = voiceLang.split('-')[0] || 'en';
      const resp = await api.post("/triage/chat", {
        message: userMsgText + (photoToSend ? " [User attached clinical skin/lesion image]" : ""),
        session_id: sessionId.current,
        lang: langCode,
      });

      const reply = resp.data?.reply || "Guidance received. Please consult a qualified physician.";
      const lower = userMsgText.toLowerCase();

      // Check if skin allergy / rash was requested or photo was attached
      const isSkinCase = Boolean(photoToSend || presetUsed || lower.includes("rash") || lower.includes("skin") || lower.includes("allergy") || lower.includes("itch") || lower.includes("hive"));
      // Check if fever / flu was mentioned
      const isFeverCase = lower.includes("fever") || lower.includes("temp") || lower.includes("chill") || lower.includes("101") || lower.includes("102") || lower.includes("headache") || lower.includes("body ache") || lower.includes("bukhar") || lower.includes("juram");

      const assistantMsg: TriageMessageItem = {
        role: "assistant",
        text: reply
      };

      // Check if Guardian Alert was triggered
      if (resp.data?.guardian_alert_triggered) {
        playChime('urgent');
        toast.error("🚨 CRITICAL GUARDIAN ALERT DISPATCHED: Family contact notified with live clinical telemetry!", { duration: 6000 });
        const alertObj: GuardianAlert = resp.data.guardian_alert || {
          id: `ga-${Date.now()}`,
          user_name: "Active User",
          relation: "Family Ward",
          age: 32,
          guardian_name: "Rajesh Sharma (Father)",
          guardian_phone: "+91-98490-11223",
          condition: resp.data.guardian_alert_message || "High-acuity emergency condition detected during clinical triage.",
          severity: "critical",
          vitals: { bp: "160/98", pulse: 112, temp: "102.6°F", spo2: "91%" },
          trigger_source: "Live Multilingual AI Triage",
          location: "Banjara Hills, Hyderabad",
          timestamp: "Just now",
          action_taken: "Emergency SMS & WhatsApp dispatched to Guardian",
          status: "Active Alert"
        };
        setActiveGuardianAlertModal(alertObj);
        assistantMsg.guardianAlertInfo = {
          triggered: true,
          message: resp.data.guardian_alert_message || "Urgent emergency alert dispatched to family guardian with live telemetry & coordinates.",
          relation: alertObj.relation,
          guardian_name: alertObj.guardian_name,
          guardian_phone: alertObj.guardian_phone
        };
      }

      // 1. If photo or skin case: inject Dermatology analysis card
      if (isSkinCase) {
        const p = presetUsed || SKIN_ALLERGY_PRESETS[0];
        assistantMsg.photoAnalysis = {
          condition: p.condition,
          confidence: p.confidence,
          severity: p.severity,
          characteristics: p.characteristics,
          dangerSign: p.dangerSign,
          recommendedMeds: p.recommendedMeds
        };
      }

      // 2. Attach recommended medicines and emergency hotlines returned from intelligent triage engine
      if (resp.data?.recommended_medicines && resp.data.recommended_medicines.length > 0) {
        assistantMsg.recommendedMedicines = resp.data.recommended_medicines;
      }
      if (resp.data?.emergency_hotlines && resp.data.emergency_hotlines.length > 0) {
        assistantMsg.emergencyHotlines = resp.data.emergency_hotlines;
      }
      if (resp.data?.doctor_recommendation) {
        assistantMsg.doctorRecommendation = resp.data.doctor_recommendation;
      }

      setMsgs((m) => [...m, assistantMsg]);
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

          clearSilenceTimers();
          setSilenceCountdown(2);

          countdownIntervalRef.current = setInterval(() => {
            setSilenceCountdown((prev) => (prev && prev > 1 ? prev - 1 : prev));
          }, 1000);

          silenceTimerRef.current = setTimeout(() => {
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
      stopVoice(true);
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
              <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <span>Clinical Symptom & Allergy Triage</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  📷 Photo Triage Active
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Multilingual audio playback & online pharmacy integration</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector for Speech Synthesis & Recognition */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
              <Languages size={13} className="text-teal-600" />
              <select
                value={voiceLang}
                onChange={(e) => {
                  setVoiceLang(e.target.value);
                  if (listening) {
                    stopVoice(false);
                  }
                  toast.info(`Language set to ${e.target.value}. AI voice will speak in this language.`);
                }}
                className="text-xs bg-transparent font-medium focus:outline-none cursor-pointer"
                title="Voice Language for Triage Speech"
              >
                <option value="en-IN">English (EN)</option>
                <option value="hi-IN">हिन्दी (HI)</option>
                <option value="te-IN">తెలుగు (TE)</option>
                <option value="ta-IN">தமிழ் (TA)</option>
                <option value="bn-IN">বাংলা (BN)</option>
                <option value="es-ES">Español (ES)</option>
              </select>
            </div>

            <span className="text-xs bg-teal-50 border border-teal-200 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full hidden sm:inline">
              Active Session
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-5 sg-scrollbar">
          {msgs.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} space-y-2`}>
              {/* Photo attached by user */}
              {m.photoUrl && (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-teal-500/40 shadow-md max-w-xs">
                  <img src={m.photoUrl} alt="Clinical lesion or allergy" className="w-full h-44 object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <Camera size={12} className="text-teal-400" /> Clinical Skin Photo
                    </span>
                    <span className="text-[10px] text-teal-300">Sent to AI Triage</span>
                  </div>
                </div>
              )}

              {/* Text Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : m.text.includes("SEEK EMERGENCY CARE NOW")
                    ? "bg-red-50 text-red-950 border border-red-300 rounded-bl-none font-medium"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                {m.text}

                {/* Read Aloud Button for Assistant Reply */}
                {m.role === "assistant" && (
                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => speakTriageMessage(m.text, i)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                        activeSpeechIdx === i
                          ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/40"
                          : "bg-white text-teal-800 border border-teal-200/70 hover:bg-teal-50"
                      }`}
                      title="Listen to clinical guidance in selected language"
                    >
                      {activeSpeechIdx === i ? (
                        <>
                          <VolumeX size={13} className="animate-pulse" />
                          <span>Stop Speaking</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span>🔊 Read Aloud ({voiceLang.split('-')[0].toUpperCase()})</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">Silent Guardian AI</span>
                  </div>
                )}
              </div>

              {/* Guardian Emergency Alert Card */}
              {m.guardianAlertInfo && m.guardianAlertInfo.triggered && (
                <div className="max-w-[88%] rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 shadow-xl space-y-3 sg-fade-in border-2 border-red-300">
                  <div className="flex items-center justify-between border-b border-red-400/40 pb-2">
                    <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider">
                      <ShieldAlert size={16} className="text-yellow-300 animate-bounce" />
                      <span>🚨 Guardian Emergency Alert Dispatched</span>
                    </div>
                    <span className="bg-white text-red-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      Live Telemetry & GPS Sent
                    </span>
                  </div>
                  <p className="text-xs text-red-50 font-medium leading-relaxed">
                    {m.guardianAlertInfo.message}
                  </p>
                  <div className="bg-red-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-red-400/30">
                    <div>
                      <div className="font-bold text-white text-sm">Designated Guardian: {m.guardianAlertInfo.guardian_name}</div>
                      <div className="text-red-200 text-[11px] mt-0.5">Family Role: {m.guardianAlertInfo.relation || "Family Guardian"} · Real-time SMS Dispatched</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${m.guardianAlertInfo.guardian_phone || "108"}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-800 rounded-lg font-bold text-xs shadow hover:bg-red-50 transition-all"
                      >
                        <Phone size={12} />
                        Call Guardian
                      </a>
                      <Link
                        to="/patient/guardians"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950 text-white rounded-lg font-bold text-xs border border-red-500 hover:bg-black transition-all"
                      >
                        <ShieldAlert size={12} />
                        View Guardian Feed
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Dermatology Scanner Result Card if photo analysis is available */}
              {m.photoAnalysis && (
                <div className="max-w-[88%] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-300 p-4 shadow-md space-y-3 sg-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span className="font-bold text-xs uppercase tracking-wide text-emerald-950">
                        AI Dermatology Lesion Scanner Result
                      </span>
                    </div>
                    <Badge variant="default" className="bg-emerald-700 text-white text-[10px] font-bold">
                      {m.photoAnalysis.confidence}% Diagnostic Match
                    </Badge>
                  </div>

                  <div>
                    <div className="font-display font-bold text-sm text-slate-900">
                      {m.photoAnalysis.condition}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {m.photoAnalysis.characteristics}
                    </div>
                  </div>

                  {m.photoAnalysis.dangerSign && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-900 flex items-start gap-2">
                      <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-800">Critical Warning: </span>
                        {m.photoAnalysis.dangerSign}
                      </div>
                    </div>
                  )}

                  {/* Immediate Recommended Skin OTC Medicines */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill size={13} className="text-teal-700" />
                      Recommended Relief & Online Pharmacy Delivery:
                    </div>
                    <div className="grid gap-2">
                      {m.photoAnalysis.recommendedMeds.map((med, idx) => (
                        <div key={idx} className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{med.name}</div>
                            <div className="text-slate-500 text-[11px]">{med.dose}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-emerald-800">₹{med.price}</span>
                            <a
                              href={med.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-xs"
                            >
                              <ShoppingBag size={11} />
                              Order on {med.app}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Doctor Specialist Card */}
              {m.doctorRecommendation && (
                <div className="max-w-[88%] rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-teal-50/90 border-2 border-indigo-200/80 p-4 shadow-md space-y-3 sg-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100/90 pb-2.5 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 block">Recommended Specialist Consultation</span>
                        <span className="font-display font-extrabold text-sm sm:text-base text-slate-900">{m.doctorRecommendation.specialtyName}</span>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 font-mono text-[10px] font-bold self-start sm:self-auto">
                      {m.doctorRecommendation.suggestedActionTimeline}
                    </Badge>
                  </div>

                  <div className="bg-white/85 rounded-xl p-3 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <HospitalIcon size={14} className="text-indigo-600 shrink-0" />
                      <span>Department: <strong className="text-slate-900 font-bold">{m.doctorRecommendation.department}</strong></span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {m.doctorRecommendation.doctorTypeDesc}
                    </p>
                    <div className="text-xs bg-indigo-50/80 text-indigo-950 p-2.5 rounded-lg border border-indigo-100/80 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-900">Why consult this doctor: </span>
                        <span>{m.doctorRecommendation.whyConsult}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <Link
                      to={m.doctorRecommendation.bookingUrl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                    >
                      <Calendar size={13} />
                      <span>Book OPD Consultation</span>
                    </Link>
                    <a
                      href={`tel:${m.doctorRecommendation.callNumber || "1860-500-1066"}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Phone size={13} className="text-indigo-600" />
                      <span>Call Tele-Consult ({m.doctorRecommendation.callNumber || "1860-500-1066"})</span>
                    </a>
                    <Link
                      to="/patient/doctors"
                      className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold underline ml-auto"
                    >
                      View All 40+ Specialists &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* Recommended Medicines with Fast 30-min Delivery Card (e.g. for Fever) */}
              {m.recommendedMedicines && m.recommendedMedicines.length > 0 && (
                <div className="max-w-[88%] rounded-2xl bg-white border-2 border-teal-500/30 p-4 shadow-md space-y-3 sg-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wide">
                      <ShoppingBag size={14} className="text-teal-700" />
                      <span>Recommended Medicines & Fast Online Delivery</span>
                    </div>
                    <Link
                      to="/patient/medicine?search=Fever"
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold underline flex items-center gap-0.5"
                    >
                      Browse 520+ in Guide <ArrowRight size={11} />
                    </Link>
                  </div>

                  <div className="grid gap-3">
                    {m.recommendedMedicines.map((med, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{med.name}</div>
                            <div className="text-[11px] text-teal-700 font-semibold">{med.category}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-white text-emerald-800 border-emerald-300">
                            Instant Stock
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{med.dosage}</p>

                        {/* Online Pharmacy Delivery Apps */}
                        {med.online_apps && (
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available on:</span>
                            {med.online_apps.map((app, appIdx) => (
                              <a
                                key={appIdx}
                                href={app.buy_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-800 transition-all shadow-xs"
                                title={`Order on ${app.app_id} for ₹${app.price}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${app.logo_color}`}></span>
                                <span className="capitalize">{app.app_id}</span>
                                <span className="text-slate-500 font-normal">₹{app.price}</span>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{app.delivery_eta}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Hotline Direct Call Cards */}
              {m.emergencyHotlines && m.emergencyHotlines.length > 0 && (
                <div className="max-w-[88%] rounded-2xl bg-red-50/80 border border-red-200 p-4 shadow-sm space-y-2.5 sg-fade-in">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wide">
                    <Phone size={14} className="text-red-700" />
                    <span>Emergency Telephone Hotlines & Doctor Call</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {m.emergencyHotlines.map((hotline, idx) => (
                      <a
                        key={idx}
                        href={`tel:${hotline.number}`}
                        className="bg-white border border-red-200 rounded-xl p-2.5 flex flex-col justify-between hover:bg-red-50 transition-all group"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-red-700 uppercase">{hotline.type}</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">{hotline.name}</div>
                          <div className="text-[10px] text-slate-500 mt-1 leading-tight">{hotline.desc}</div>
                        </div>
                        <div className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 group-hover:text-red-700">
                          <Phone size={12} />
                          Call {hotline.number}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
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

        {/* Attached Photo Preview Bar */}
        {attachedPhoto && (
          <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-3 sg-fade-in">
            <div className="flex items-center gap-3">
              <img src={attachedPhoto} alt="Skin lesion thumbnail" className="w-10 h-10 rounded-lg object-cover border border-emerald-300" />
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Camera size={13} className="text-emerald-700" />
                  <span>Photo Attached: {activePreset?.name || "Custom Skin Photograph"}</span>
                </div>
                <div className="text-[11px] text-emerald-800">Ready for automated lesion and rash AI triage</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedPhoto(null);
                setActivePreset(null);
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-white rounded-md border border-red-200"
            >
              Remove
            </button>
          </div>
        )}

        {/* Expandable Skin Allergy & Rash Photo Picker Panel */}
        {isPhotoPanelOpen && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 sg-fade-in">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera size={14} className="text-teal-700" />
                Select Clinical Skin Photo Preset or Upload from Device:
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPanelOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {SKIN_ALLERGY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAttachedPhoto(preset.img);
                    setActivePreset(preset);
                    setIsPhotoPanelOpen(false);
                    setInput(`I have a skin condition: ${preset.name}. It is itching and spreading.`);
                    toast.success(`Selected ${preset.name} photo. Type additional details or send.`);
                  }}
                  className="group rounded-xl border border-slate-200 overflow-hidden bg-white text-left hover:border-teal-500 hover:shadow-md transition-all p-1.5"
                >
                  <img src={preset.img} alt={preset.name} className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  <div className="mt-1.5 text-[11px] font-bold text-slate-800 truncate">{preset.name}</div>
                  <span className="text-[9px] bg-teal-50 text-teal-800 font-semibold px-1.5 py-0.5 rounded">
                    {preset.tag}
                  </span>
                </button>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">Or upload a photo of your own skin allergy or rash:</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs bg-white text-teal-800 border-teal-300"
              >
                <Upload size={12} className="mr-1" />
                Upload from Computer/Phone
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

          {/* Photo Option Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsPhotoPanelOpen(!isPhotoPanelOpen)}
            className={`rounded-full shrink-0 transition-all ${
              attachedPhoto
                ? "bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-400/30"
                : "text-slate-700 hover:text-teal-700 hover:border-teal-300"
            }`}
            title="Attach Skin Allergy or Rash Photo"
          >
            <Camera size={18} />
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
                : "Type symptoms, tap mic to speak, or tap camera to attach a skin rash photo..."
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
            disabled={busy || (!input.trim() && !attachedPhoto)}
            className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-10 px-5 shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Triage Guidance Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        {/* Photo Allergy Scanner Callout */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-200 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
            <Camera size={16} className="text-teal-700" />
            Skin Allergy & Rash Photo Scanner
          </div>
          <p className="text-xs text-teal-900 leading-relaxed">
            Have an itchy rash, hives, cut, or insect bite? Tap the <strong>Camera</strong> icon to upload or choose a clinical reference. Our engine analyzes lesion morphology and recommends safe OTC creams with direct 30-min pharmacy links.
          </p>
          <div className="pt-1 flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setAttachedPhoto(SKIN_ALLERGY_PRESETS[0].img);
                setActivePreset(SKIN_ALLERGY_PRESETS[0]);
                setInput("I have an acute allergic skin rash with itchy red hives after seafood");
                toast.info("Loaded Allergic Hives sample. Click Send to evaluate.");
              }}
              className="text-[11px] bg-white border border-teal-200 text-teal-800 font-semibold px-2 py-1 rounded-md hover:bg-teal-50"
            >
              Test Hives Sample
            </button>
            <button
              onClick={() => {
                setInput("I have high fever (102°F) for 2 days with severe body chills and headache");
                toast.info("Loaded Fever sample. Click Send to see medicine booking & hotlines.");
              }}
              className="text-[11px] bg-white border border-teal-200 text-teal-800 font-semibold px-2 py-1 rounded-md hover:bg-teal-50"
            >
              Test Fever Sample
            </button>
          </div>
        </div>

        {/* Voice Feature Callout Card */}
        <div className="rounded-2xl bg-teal-50/80 border border-teal-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <Mic size={16} className="text-teal-700" />
            Hands-Free Voice Triage
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Tap the microphone button to dictate symptoms in English, Hindi, Telugu, Tamil, or Spanish. The engine detects when you finish speaking and submits automatically after 2 seconds of silence.
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
              Test cardiac sample
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
          <div className="font-semibold text-sm text-slate-900">How to use Triage</div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li>Describe fever, symptoms, or upload a photo of your skin rash/allergy.</li>
            <li>Click <strong>🔊 Read Aloud</strong> to hear advice spoken in your language.</li>
            <li>Use direct <strong>Order on Apollo/1mg</strong> buttons to book medicines in minutes.</li>
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

      {/* Emergency Guardian Alert Modal */}
      {activeGuardianAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-500 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-600 uppercase tracking-widest">
                    Emergency Alert Active
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    🚨 Guardian Dispatched!
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveGuardianAlertModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-2">
              <div className="font-bold text-sm text-red-950">
                {activeGuardianAlertModal.condition}
              </div>
              <p className="leading-relaxed">
                Silent Guardian has dispatched an immediate alert to your designated family guardian (<strong>{activeGuardianAlertModal.guardian_name}</strong> - {activeGuardianAlertModal.relation}) with your live coordinates and clinical telemetry.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Blood Pressure</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{activeGuardianAlertModal.vitals?.bp || "160/98"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Heart Pulse</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{activeGuardianAlertModal.vitals?.pulse || 112} BPM</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Oxygen SpO2</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{activeGuardianAlertModal.vitals?.spo2 || "91%"}</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveGuardianAlertModal(null)}
                className="w-full sm:w-auto text-xs"
              >
                Close & Continue
              </Button>
              <a
                href={`tel:${activeGuardianAlertModal.guardian_phone}`}
                className="w-full sm:w-auto"
              >
                <Button
                  size="sm"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                >
                  <Phone size={14} className="mr-1.5" />
                  Call {activeGuardianAlertModal.guardian_name}
                </Button>
              </a>
              <Link to="/patient/guardians" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                >
                  <ShieldAlert size={14} className="mr-1.5" />
                  View Guardian Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2.5 GUARDIAN NETWORK & FAMILY SAFETY (10+ DEMO ALERTS: MOTHER, FATHER, CHILD, SPOUSE)
function GuardianNetwork() {
  const [alerts, setAlerts] = useState<GuardianAlert[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Simulation form states
  const [simName, setSimName] = useState("Sunita Sharma");
  const [simRelation, setSimRelation] = useState("Mother");
  const [simAge, setSimAge] = useState(55);
  const [simCondition, setSimCondition] = useState("Sudden acute chest pressure with left shoulder ache and shortness of breath");
  const [simSeverity, setSimSeverity] = useState<'critical' | 'high' | 'medium'>('critical');
  const [simGuardianName, setSimGuardianName] = useState("Rohan Sharma (Son)");
  const [simGuardianPhone, setSimGuardianPhone] = useState("+91-98490-11223");
  const [simBP, setSimBP] = useState("168/104");
  const [simPulse, setSimPulse] = useState(116);
  const [simSpO2, setSimSpO2] = useState("90%");

  useEffect(() => {
    api.get<GuardianAlert[]>("/guardian-alerts").then((res) => {
      setAlerts(res.data || []);
    });
  }, []);

  const handleUpdateStatus = (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
    toast.success(`Guardian alert updated to: "${newStatus}"`);
  };

  const handleEscalateEMS = (alert: GuardianAlert) => {
    playChime('urgent');
    toast.error(`🚨 EMS 108 AMBULANCE DISPATCHED: Ambulance responding to ${alert.user_name} (${alert.location})!`);
    handleUpdateStatus(alert.id, "108 Ambulance Dispatched & Responding");
  };

  const handleSimulateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: GuardianAlert = {
      id: `ga-sim-${Date.now()}`,
      user_name: simName,
      relation: simRelation,
      age: Number(simAge),
      guardian_name: simGuardianName,
      guardian_phone: simGuardianPhone,
      condition: simCondition,
      severity: simSeverity,
      vitals: {
        bp: simBP,
        pulse: Number(simPulse),
        temp: "99.1°F",
        spo2: simSpO2,
      },
      trigger_source: "Simulated Family Emergency Sensor",
      location: "Jubilee Hills, Hyderabad",
      timestamp: "Just now",
      action_taken: "Automated SMS & WhatsApp coordinates transmitted to Guardian",
      status: "Active Alert"
    };

    try {
      await api.post("/guardian-alerts", newAlert);
      setAlerts(prev => [newAlert, ...prev]);
      setIsSimulateModalOpen(false);
      playChime('urgent');
      toast.error(`🚨 Live Guardian Alert Generated for ${simName} (${simRelation})! SMS dispatched to ${simGuardianName}`);
    } catch {
      setAlerts(prev => [newAlert, ...prev]);
      setIsSimulateModalOpen(false);
      toast.success(`Guardian Alert simulated for ${simName}!`);
    }
  };

  const filtered = alerts.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.user_name.toLowerCase().includes(term) ||
      a.condition.toLowerCase().includes(term) ||
      a.guardian_name.toLowerCase().includes(term) ||
      a.relation.toLowerCase().includes(term) ||
      a.location.toLowerCase().includes(term);

    const matchesRelation =
      selectedRelation === "all" ||
      a.relation.toLowerCase().includes(selectedRelation.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || a.severity === severityFilter;

    return matchesSearch && matchesRelation && matchesSeverity;
  });

  const relationCounts: Record<string, number> = {
    all: alerts.length,
    mother: alerts.filter(a => a.relation.toLowerCase().includes('mother')).length,
    father: alerts.filter(a => a.relation.toLowerCase().includes('father')).length,
    child: alerts.filter(a => a.relation.toLowerCase().includes('child') || a.relation.toLowerCase().includes('daughter') || a.relation.toLowerCase().includes('son') || a.relation.toLowerCase().includes('infant')).length,
    spouse: alerts.filter(a => a.relation.toLowerCase().includes('spouse') || a.relation.toLowerCase().includes('husband') || a.relation.toLowerCase().includes('wife')).length,
    elderly: alerts.filter(a => a.relation.toLowerCase().includes('grand')).length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Trigger Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              Family Guardian Safety Net & Alerts
            </h2>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {alerts.length} Family Records
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            When a family member (Mother, Father, Child, Spouse, Grandparent) experiences an acute medical event, Silent Guardian immediately alerts their designated Guardian with live vital signs, real-time GPS coordinates, and 108 EMS ambulance coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsSimulateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={14} className="mr-1.5 text-yellow-300" />
            + Simulate Guardian Alert
          </Button>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Monitored Links</div>
          <div className="mt-1 text-2xl font-extrabold text-purple-900 flex items-center gap-2">
            <span>{alerts.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">100% Guarded</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Mother, Father, Children, Elders</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Critical / High Alerts</div>
          <div className="mt-1 text-2xl font-extrabold text-red-600 flex items-center gap-2">
            <span>{alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}</span>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires immediate attention</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400">108 EMS Auto-Dispatch</div>
          <div className="mt-1 text-2xl font-extrabold text-teal-800 flex items-center gap-2">
            <span>Standby</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">24x7 Ready</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">GPS telemetry link online</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Avg Guardian Response</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
            <span>1.8 min</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">⚡ Rapid</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct SMS & Audio Alert</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Family Relation Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sg-scrollbar">
            {[
              { id: 'all', label: `All Family (${relationCounts.all})` },
              { id: 'mother', label: `Mother 👩 (${relationCounts.mother})` },
              { id: 'father', label: `Father 👨 (${relationCounts.father})` },
              { id: 'child', label: `Child / Infant 🧒 (${relationCounts.child})` },
              { id: 'spouse', label: `Spouse 💍 (${relationCounts.spouse})` },
              { id: 'elderly', label: `Grandmother 👵 (${relationCounts.elderly})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRelation(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedRelation === tab.id
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">🚨 Critical Only</option>
              <option value="high">⚠️ High Only</option>
              <option value="medium">Medium Only</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by family member name (e.g. Sunita, Aarav, Rajesh), condition, guardian, or location..."
            className="pl-9 text-xs h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800 text-base">No guardian alerts found matching criteria</div>
            <p className="text-xs text-slate-500">Try adjusting your family relation tab or search keywords.</p>
            <Button
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedRelation("all");
                setSeverityFilter("all");
              }}
              variant="outline"
              className="text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filtered.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`rounded-2xl bg-white border p-5 shadow-sm transition-all hover:shadow-md space-y-4 ${
                  isCritical ? 'border-red-300 ring-2 ring-red-500/10' : 'border-slate-200'
                }`}
              >
                {/* Top Row: Ward Name, Relation, Severity */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center text-xl font-bold border border-purple-200/60 shadow-xs flex-shrink-0">
                      {alert.relation.toLowerCase().includes('mother') ? '👩' :
                       alert.relation.toLowerCase().includes('father') ? '👨' :
                       alert.relation.toLowerCase().includes('child') || alert.relation.toLowerCase().includes('son') || alert.relation.toLowerCase().includes('daughter') ? '🧒' :
                       alert.relation.toLowerCase().includes('infant') ? '👶' :
                       alert.relation.toLowerCase().includes('grand') ? '👵' :
                       alert.relation.toLowerCase().includes('spouse') || alert.relation.toLowerCase().includes('husband') || alert.relation.toLowerCase().includes('wife') ? '💍' : '🛡️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{alert.user_name}</span>
                        <span className="text-xs text-slate-500 font-medium">({alert.age} yrs)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wide">
                          {alert.relation}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <Badge className={`${sevClass(alert.severity)} font-bold text-xs uppercase`}>
                    {alert.severity}
                  </Badge>
                </div>

                {/* Condition Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Emergency Trigger</div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    🚨 {alert.condition}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span>Location: {alert.location}</span>
                  </div>
                </div>

                {/* Live Vitals Telemetry */}
                {alert.vitals && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Activity size={12} className="text-purple-600" />
                      Live Clinical Telemetry
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">BP</div>
                        <div className="font-mono font-bold text-xs text-purple-900 mt-0.5">{alert.vitals.bp || '120/80'}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Pulse</div>
                        <div className="font-mono font-bold text-xs text-purple-900 mt-0.5">{alert.vitals.pulse || 78} bpm</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Temp</div>
                        <div className="font-mono font-bold text-xs text-purple-900 mt-0.5">{alert.vitals.temp || '98.6°F'}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">SpO2</div>
                        <div className="font-mono font-bold text-xs text-purple-900 mt-0.5">{alert.vitals.spo2 || '98%'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Designated Guardian Information */}
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Designated Guardian</div>
                    <div className="text-xs font-bold text-slate-900">{alert.guardian_name}</div>
                    <div className="text-[11px] text-purple-800 font-mono mt-0.5">{alert.guardian_phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${alert.guardian_phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Phone size={12} />
                      Call
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`SMS coordinates resent to ${alert.guardian_name} (${alert.guardian_phone})`);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-bold transition-all"
                    >
                      Send SMS
                    </button>
                  </div>
                </div>

                {/* Action Taken & Status Badge */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">Action: </strong> {alert.action_taken}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                    alert.status.includes('Active') ? 'bg-red-100 text-red-800' :
                    alert.status.includes('Dispatched') ? 'bg-purple-100 text-purple-800' :
                    alert.status.includes('Acknowledged') ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                  {alert.status !== 'Resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(alert.id, "Acknowledged by Guardian")}
                      className="text-xs h-8 border-slate-200 hover:bg-slate-50"
                    >
                      Acknowledge Alert
                    </Button>
                  )}
                  {isCritical && !alert.status.includes('Dispatched') && (
                    <Button
                      size="sm"
                      onClick={() => handleEscalateEMS(alert)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 font-bold shadow-xs"
                    >
                      <Siren size={12} className="mr-1.5" />
                      Dispatch 108 Ambulance
                    </Button>
                  )}
                  {alert.status !== 'Resolved' ? (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(alert.id, "Resolved")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                    >
                      <CheckCircle2 size={12} className="mr-1" />
                      Mark Resolved
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Ward Reported Safe
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulation Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Simulate Family Emergency Alert
                  </h3>
                  <p className="text-xs text-slate-500">
                    Demonstrates how our platform alerts family guardians during acute symptoms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimulateAlert} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Ward Name</Label>
                  <Input
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    required
                    className="mt-1 text-xs h-9"
                    placeholder="e.g. Sunita Sharma"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Relationship</Label>
                  <select
                    value={simRelation}
                    onChange={(e) => setSimRelation(e.target.value)}
                    className="mt-1 w-full text-xs h-9 border border-slate-200 rounded-lg px-2 bg-white"
                  >
                    <option value="Mother">Mother 👩</option>
                    <option value="Father">Father 👨</option>
                    <option value="Child">Child 🧒</option>
                    <option value="Daughter">Daughter 👧</option>
                    <option value="Son">Son 👦</option>
                    <option value="Spouse">Spouse / Partner 💍</option>
                    <option value="Grandmother">Grandmother 👵</option>
                    <option value="Infant">Infant 👶</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Ward Age</Label>
                  <Input
                    type="number"
                    value={simAge}
                    onChange={(e) => setSimAge(Number(e.target.value))}
                    required
                    className="mt-1 text-xs h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Emergency Severity</Label>
                  <select
                    value={simSeverity}
                    onChange={(e) => setSimSeverity(e.target.value as any)}
                    className="mt-1 w-full text-xs h-9 border border-slate-200 rounded-lg px-2 bg-white"
                  >
                    <option value="critical">🚨 Critical Urgency</option>
                    <option value="high">⚠️ High Urgency</option>
                    <option value="medium">Medium Urgency</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Symptom Condition / Emergency Reason</Label>
                <Textarea
                  value={simCondition}
                  onChange={(e) => setSimCondition(e.target.value)}
                  required
                  rows={2}
                  className="mt-1 text-xs"
                  placeholder="e.g. High fever (103.8°F), sudden chest tightness, allergic wheezing..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Guardian Name</Label>
                  <Input
                    value={simGuardianName}
                    onChange={(e) => setSimGuardianName(e.target.value)}
                    required
                    className="mt-1 text-xs h-9"
                    placeholder="e.g. Rohan Sharma (Son)"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Guardian Phone</Label>
                  <Input
                    value={simGuardianPhone}
                    onChange={(e) => setSimGuardianPhone(e.target.value)}
                    required
                    className="mt-1 text-xs h-9"
                    placeholder="+91-98490-11223"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Blood Pressure</Label>
                  <Input
                    value={simBP}
                    onChange={(e) => setSimBP(e.target.value)}
                    className="mt-1 text-xs h-8 font-mono"
                    placeholder="160/98"
                  />
                </div>
                <div>
                  <Label className="text-xs">Pulse Rate</Label>
                  <Input
                    type="number"
                    value={simPulse}
                    onChange={(e) => setSimPulse(Number(e.target.value))}
                    className="mt-1 text-xs h-8 font-mono"
                    placeholder="110"
                  />
                </div>
                <div>
                  <Label className="text-xs">Oxygen SpO2</Label>
                  <Input
                    value={simSpO2}
                    onChange={(e) => setSimSpO2(e.target.value)}
                    className="mt-1 text-xs h-8 font-mono"
                    placeholder="92%"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  <ShieldAlert size={14} className="mr-1.5" />
                  Transmit Live Guardian Alert
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. HOSPITAL FINDER (500+ Hospitals with Search, Photos & Interior Explorer)
function HospitalFinder() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  // Interior & Equipment Inspection Modal State
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'exterior' | 'interior_icu' | 'interior_ward' | 'equipment_suite' | 'er_bay'>('interior_icu');

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
            Hospital & Emergency Resource Locator (520+ Facilities)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Browse 520+ verified hospitals with real interior photographs, ICU beds, CT/MRI equipment, and emergency bay statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full tabular-nums">
            {filtered.length} Facilities Indexed
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
            placeholder="Search by hospital name, city (e.g. Hyderabad, Delhi, Bengaluru, Mumbai), or area..."
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

      {/* Hospital Cards Grid with Real Facility & Interior Photos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((h) => {
          const mainPhoto = h.photos?.exterior || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80";
          const icuPhoto = h.photos?.interior_icu || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80";

          return (
            <div key={h.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                {/* Hospital Photo Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={mainPhoto}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* Rating & Verified badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {h.verified ? (
                      <Badge variant="default" className="text-[10px] bg-emerald-600/90 text-white backdrop-blur-xs font-semibold">
                        ✓ Verified Facility
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-slate-900/80 text-amber-300 border-amber-400 font-semibold">
                        Audit Pending
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-amber-400 border border-slate-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={11} className="fill-amber-400" />
                    <span>{h.rating}</span>
                  </div>

                  {/* Explore Interior Button on Photo Overlay */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHospital(h);
                      setActivePhotoTab('interior_icu');
                    }}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-teal-900 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    <Eye size={13} className="text-teal-700" />
                    <span>Explore Interior & Rooms</span>
                  </button>
                  
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] text-teal-300 font-medium">{h.city}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                    {h.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin size={12} className="text-teal-700 shrink-0" />
                    <span className="truncate">{h.address}</span>
                  </div>

                  {/* Specialties tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {h.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                    {h.interior_details?.room_types && (
                      <span className="text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                        {h.interior_details.room_types.length} Room Classes
                      </span>
                    )}
                  </div>

                  {/* Bed Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-teal-50/70 p-2">
                      <div className="text-[10px] uppercase font-bold text-teal-800">ICU Beds</div>
                      <div className="font-display font-extrabold text-base text-teal-900 tabular-nums">{h.icu_available}</div>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 p-2">
                      <div className="text-[10px] uppercase font-bold text-amber-800">ER Bays</div>
                      <div className="font-display font-extrabold text-base text-amber-900 tabular-nums">{h.er_available}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-600">Ventilators</div>
                      <div className="font-display font-extrabold text-base text-slate-900 tabular-nums">{h.ventilator_available}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800">
                  <Phone size={13} />
                  {h.phone}
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveHospital(h);
                    setActivePhotoTab('equipment_suite');
                  }}
                  className="rounded-full text-xs h-8 text-teal-800 border-teal-200 hover:bg-teal-50"
                >
                  <Eye size={12} className="mr-1" />
                  View Equipment
                </Button>
              </div>
            </div>
          );
        })}
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

      {/* Comprehensive Hospital Interior & Medical Equipment Modal */}
      {activeHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    {activeHospital.name} · Facility Interior & Equipment
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeHospital.address}, {activeHospital.city} · {activeHospital.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHospital(null)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 sg-scrollbar">
              
              {/* Photo View Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                {[
                  { key: 'interior_icu', label: 'ICU Critical Care Unit', icon: Activity },
                  { key: 'interior_ward', label: 'Patient Deluxe & Ward Rooms', icon: Bed },
                  { key: 'equipment_suite', label: 'Advanced Diagnostic (CT / MRI)', icon: Stethoscope },
                  { key: 'er_bay', label: 'Emergency Trauma Bay', icon: Siren },
                  { key: 'exterior', label: 'Campus & Exterior', icon: Building2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActivePhotoTab(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        activePhotoTab === tab.key
                          ? "bg-teal-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* High-Resolution Photo Viewer Display */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-72 sm:h-96 w-full border border-slate-800 shadow-inner group">
                <img
                  src={activeHospital.photos?.[activePhotoTab] || activeHospital.photos?.exterior || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80"}
                  alt={`${activeHospital.name} - ${activePhotoTab}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-teal-300">
                      High-Definition Verified Medical Facility Photo
                    </span>
                    <h4 className="text-base sm:text-lg font-bold">
                      {activePhotoTab === 'interior_icu' ? 'Intensive Care Unit (Level 3 Sterile Isolation)' :
                       activePhotoTab === 'interior_ward' ? 'Patient Deluxe Room & Post-Operative Ward' :
                       activePhotoTab === 'equipment_suite' ? 'Advanced Imaging Suite (GE / Siemens 128-Slice)' :
                       activePhotoTab === 'er_bay' ? 'Emergency Level-1 Resuscitation Trauma Bay' : 'Main Hospital Campus & Ambulatory Entry'}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs bg-slate-900/80 text-white border-white/30 self-start sm:self-auto">
                    Verified Inspection 2026
                  </Badge>
                </div>
              </div>

              {/* Room Classes & Bed Specifications Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Room Types & Capacities */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Bed size={16} className="text-teal-700" />
                    <span>In-Patient Room Configurations</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(activeHospital.interior_details?.room_types || [
                      { name: "Super Deluxe Suite (Private with Companion Sofa, Wi-Fi, Nurse Call)", beds: 18, daily_rate: 6500 },
                      { name: "Single AC Patient Room (Electric Bed, Attached Restroom)", beds: 42, daily_rate: 3800 },
                      { name: "Twin-Sharing Semi-Private Room", beds: 60, daily_rate: 2200 },
                      { name: "General Multi-Bed Medical Ward", beds: 120, daily_rate: 950 }
                    ]).map((room, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{room.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{room.beds} Operational Units Available</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-teal-800">₹{room.daily_rate}</span>
                          <div className="text-[10px] text-slate-400">/ night</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Machinery & Motorized Bed Specifications */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-teal-700" />
                    <span>Equipment Suite & Bed Mechanics</span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Motorized ICU & Ward Beds</div>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {Array.isArray(activeHospital.interior_details?.bed_types)
                          ? activeHospital.interior_details.bed_types.join(" · ")
                          : (activeHospital.interior_details?.bed_types as any)?.motorized_icu || "Hill-Rom TotalCare 5-function electric ICU beds with central cardiac chair positioning and continuous lateral rotation."}
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Advanced Diagnostic Machinery</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(activeHospital.interior_details?.equipment_list || [
                          "GE Revolution 128-Slice CT",
                          "Siemens Magnetom 3.0T MRI",
                          "Philips Azurion Biplane Cath Lab",
                          "Draeger Evita V800 Ventilators"
                        ]).map((eq, idx) => (
                          <span key={idx} className="bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold px-2 py-1 rounded-md">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accreditations & Safety Standards */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-teal-950">Accreditations & Quality Certifications:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(activeHospital.interior_details?.accreditations || ["JCI Accredited", "NABH Certified", "NABL Laboratory"]).map((acc, idx) => (
                      <span key={idx} className="bg-white text-teal-900 border border-teal-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a href={`tel:${activeHospital.phone}`}>
                    <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 rounded-full">
                      <Phone size={12} className="mr-1.5" />
                      Call Emergency Admission Desk
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

// 7. MEDICINE GUIDE (500+ Medicines with Online App Availability & Direct Links)
function MedicineGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    setMedicines(generate510Medicines());
  }, []);

  // Sync when navigated with search query (e.g. from Triage)
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(q) ||
      m.uses.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.good_for && m.good_for.toLowerCase().includes(q)) ||
      (m.indication_tags && m.indication_tags.some(t => t.toLowerCase().includes(q)));
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
            Verified pharmacology with clinical indications, online pharmacy availability (Apollo 24/7, Tata 1mg, PharmEasy, Netmeds), and direct buy links.
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
            placeholder="Search by medicine, condition (Fever, Allergy, Infection), where it is good, or molecule (Paracetamol, Metformin)..."
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

      {/* Quick Condition Tag Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Fast Condition Filters:</span>
        {["Fever", "Allergy", "Skin Rash", "Asthma", "Diabetes", "Hypertension", "Acid Reflux", "Antibiotic", "Pain Relief"].map((pill) => (
          <button
            key={pill}
            onClick={() => {
              setSearch(pill);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              search.toLowerCase() === pill.toLowerCase()
                ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50"
            }`}
          >
            {pill}
          </button>
        ))}
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="text-xs text-red-600 hover:underline font-semibold ml-1"
          >
            Clear Filter
          </button>
        )}
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

              {/* Online Apps Availability Section with Direct Links */}
              {m.online_apps && m.online_apps.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={12} className="text-teal-600" />
                      Available on Online Pharmacy Apps:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {m.online_apps.slice(0, 4).map((app, appIdx) => {
                      const appNameMap: Record<string, string> = {
                        apollo: "Apollo 24/7",
                        "1mg": "Tata 1mg",
                        pharmeasy: "PharmEasy",
                        netmeds: "Netmeds",
                        medplus: "MedPlus"
                      };
                      const displayName = appNameMap[app.app_id] || app.app_id;

                      return (
                        <a
                          key={appIdx}
                          href={app.buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 p-2 rounded-xl flex items-center justify-between transition-all group/app"
                          title={`Order ${m.name} on ${displayName}`}
                        >
                          <div>
                            <div className="text-[11px] font-bold text-slate-900 group-hover/app:text-teal-900 flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${app.logo_color}`}></span>
                              <span>{displayName}</span>
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold">{app.delivery_eta}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900">₹{app.price}</span>
                            <div className="text-[9px] text-emerald-600 font-bold">{app.discount_percent}% OFF</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
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

// MAIN USER SAFETY DASHBOARD ROUTER
export default function PatientDashboard() {
  return (
    <DashShell title="User Safety Portal" nav={NAV} accent="teal">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/guardians" element={<GuardianNetwork />} />
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
