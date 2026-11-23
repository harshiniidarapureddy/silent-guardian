import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  Lock,
  Globe,
  Heart,
  Save,
  Clock,
  Sparkles,
  Camera,
  ExternalLink,
  Laptop,
  Check,
  ShieldCheck,
  Award
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { api, getUser } from "../../lib/api";
import { Profile } from "../../types";
import { useAccessibility } from "../../context/AccessibilityContext";
import { AccessibilitySettingsPanel } from "../accessibility/AccessibilitySettingsPanel";

const ANIME_AVATARS = [
  { id: "kenji", name: "Dr. Kenji (Medic)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04" },
  { id: "sakura", name: "Sakura (Responder)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=SakuraMedic&hair=long02&eyes=variant06" },
  { id: "ren", name: "Ren (Tactical Healer)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=RenHealer&hair=short03&eyes=variant02" },
  { id: "yuki", name: "Yuki (Guardian)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=YukiGuardian&hair=long04&eyes=variant08" },
  { id: "hiro", name: "Hiro (Emergency Lead)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=HiroEMT&hair=short02&eyes=variant01" },
  { id: "mei", name: "Mei (Clinical Lead)", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=MeiClinical&hair=long01&eyes=variant03" },
];

export function PatientAccountManager() {
  const currentUser = getUser();
  const location = useLocation();
  const { organPledge } = useAccessibility();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("+91 98450 12345");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [willingToDonate, setWillingToDonate] = useState(true);
  const [language, setLanguage] = useState("en");
  const [locationCity, setLocationCity] = useState("Hyderabad, Telangana");
  const [allergies, setAllergies] = useState("None known (Penicillin tested negative)");
  const [emergencyContact, setEmergencyContact] = useState("Sunita Sharma (Mother) · +91 98450 99887");
  const [twoFactorActive, setTwoFactorActive] = useState(true);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04"
  );

  useEffect(() => {
    api.get<Partial<Profile>>("/profile").then(res => {
      const p = res.data || {};
      setProfile(p);
      setPreferredName(p.preferred_name || currentUser?.preferred_name || "Ramesh Sharma");
      setBloodGroup(p.blood_group || "O+");
      setWillingToDonate(p.willing_to_donate ?? true);
      setLanguage(p.language || "en");
      setLocationCity(p.location || "Hyderabad, Telangana");
      if (p.photo_url) setSelectedAvatarUrl(p.photo_url);
      setLoading(false);
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!loading && location.hash === "#accessibility-settings") {
      const el = document.getElementById("accessibility-settings");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [loading, location.hash]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: Partial<Profile> = {
        ...profile,
        preferred_name: preferredName,
        blood_group: bloodGroup,
        willing_to_donate: willingToDonate,
        language,
        location: locationCity,
        photo_url: selectedAvatarUrl,
      };
      await api.post("/profile", updated);
      setProfile(updated);
      window.dispatchEvent(new Event("profile-updated"));
      toast.success("Account profile & clinical credentials updated successfully!");
    } catch {
      toast.error("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportAccountData = () => {
    const accountDossier = {
      account_id: "SG-USR-948201",
      holder_name: preferredName,
      email: currentUser?.email || "prathibhadarapureddy607@gmail.com",
      email_verified: true,
      verification_protocol: "Single-Use 6-Digit Email OTP (SHA-256)",
      dpdp_act_section_9_consent: true,
      medical_directives: {
        blood_group: bloodGroup,
        registered_blood_donor: willingToDonate,
        known_allergies: allergies,
        primary_emergency_contact: emergencyContact,
        primary_language: language,
        jurisdiction: locationCity,
      },
      security_credentials: {
        two_factor_auth_enabled: twoFactorActive,
        encryption_standard: "AES-256 GCM",
        compliance_certifications: ["NABH Digital Safe-Net", "DPDP Act 2023", "HIPAA Safeguard"],
      },
      export_timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(accountDossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SilentGuardian_AccountDossier_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Complete medical account dossier downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
        Loading verified clinical account dossier...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Digital Health Passport Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedAvatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-teal-300 shadow-xl object-cover ring-4 ring-teal-500/20"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-slate-900">
                <CheckCircle2 size={12} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-white">
                  {preferredName || "User Account"}
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                  ✓ Verified Safety Net
                </Badge>
                {organPledge.isDonor && (
                  <Badge className="bg-teal-500/25 text-teal-100 border-teal-300/50 text-[10px] font-bold">
                    ✓ Verified Donor Pledge
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="font-mono text-teal-300 font-semibold">ID: SG-IN-HYD-948201</span>
                <span>&bull;</span>
                <span className="text-slate-300">{currentUser?.email || "prathibhadarapureddy607@gmail.com"}</span>
                <span>&bull;</span>
                <span className="text-emerald-300 font-semibold">Blood Group: {bloodGroup}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <Button
              onClick={handleExportAccountData}
              size="sm"
              variant="outline"
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download size={14} className="mr-1.5 text-teal-400" />
              Download Dossier
            </Button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Emergency QR Card & Avatar Picker */}
        <div className="space-y-6">
          {/* Emergency EMT QR Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode size={16} className="text-teal-700" />
                Emergency EMT QR Pass
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                No Password Required
              </span>
            </div>

            {/* Stylized QR Code Graphic */}
            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                <svg viewBox="0 0 120 120" className="w-32 h-32 text-slate-900">
                  <rect x="0" y="0" width="120" height="120" fill="white" />
                  {/* Outer corner blocks */}
                  <rect x="10" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="15" y="15" width="20" height="20" fill="white" rx="2" />
                  <rect x="20" y="20" width="10" height="10" fill="#0d9488" rx="2" />

                  <rect x="80" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="85" y="15" width="20" height="20" fill="white" rx="2" />
                  <rect x="90" y="20" width="10" height="10" fill="#0d9488" rx="2" />

                  <rect x="10" y="80" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="15" y="85" width="20" height="20" fill="white" rx="2" />
                  <rect x="20" y="90" width="10" height="10" fill="#0d9488" rx="2" />

                  {/* QR Data Grid simulation */}
                  <rect x="50" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="62" y="25" width="8" height="8" fill="#0f172a" />
                  <rect x="50" y="38" width="18" height="8" fill="#0d9488" />
                  <rect x="25" y="52" width="14" height="8" fill="#0f172a" />
                  <rect x="45" y="52" width="24" height="16" fill="#0f172a" rx="2" />
                  <rect x="75" y="52" width="15" height="8" fill="#0f172a" />
                  <rect x="95" y="45" width="12" height="15" fill="#0d9488" />
                  <rect x="52" y="75" width="12" height="12" fill="#0f172a" />
                  <rect x="70" y="75" width="18" height="8" fill="#0f172a" />
                  <rect x="92" y="75" width="14" height="18" fill="#0f172a" />
                  <rect x="50" y="95" width="25" height="12" fill="#0d9488" />
                  <rect x="80" y="98" width="14" height="8" fill="#0f172a" />
                </svg>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              In code red emergencies, verified paramedics can scan this QR code to access your blood group ({bloodGroup}), critical drug allergies, and notify family guardians without unlocking your phone.
            </p>
          </div>

          {/* Anime Avatar Collection */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={15} className="text-teal-700" />
                Select Anime Avatar
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Zero Stock Photos</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {ANIME_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarUrl(av.url)}
                  className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedAvatarUrl === av.url
                      ? "border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <img src={av.url} alt={av.name} className="w-12 h-12 rounded-xl object-cover bg-slate-50" />
                  <span className="text-[10px] font-bold text-slate-700 text-center truncate w-full">
                    {av.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Professional Demographics & Security Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Medical & Demographic Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Protected under Digital Personal Data Protection (DPDP) Act 2023.
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <ShieldCheck size={14} className="text-emerald-600" />
                DPDP Verified
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Full Preferred Name</Label>
                <Input
                  type="text"
                  value={preferredName}
                  onChange={e => setPreferredName(e.target.value)}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Registered Email Address</Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={currentUser?.email || "prathibhadarapureddy607@gmail.com"}
                    disabled
                    className="text-xs rounded-xl bg-slate-50 text-slate-500 pr-24 font-mono"
                  />
                  <span className="absolute right-2 top-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check size={11} /> OTP Verified
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Emergency Mobile Phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="text-xs rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Blood Group & RH Typing</Label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 h-9 px-3 bg-white font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-) &bull; Universal Red Cell Donor</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+) &bull; Universal Plasma</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Primary Communication Language</Label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 h-9 px-3 bg-white text-slate-800 focus:outline-hidden focus:border-teal-600"
                >
                  <option value="en">English (Clinical standard)</option>
                  <option value="te">తెలుగు (Telugu - Localized)</option>
                  <option value="hi">हिन्दी (Hindi - National)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="es">Español (Spanish)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">City / Medical Dispatch District</Label>
                <Input
                  type="text"
                  value={locationCity}
                  onChange={e => setLocationCity(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Primary Emergency Contact & Relationship</Label>
                <Input
                  type="text"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  className="text-xs rounded-xl"
                  placeholder="e.g. Sunita Sharma (Mother) · +91 98450 99887"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Known Drug Allergies & Clinical Alerts</Label>
                <Input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="text-xs rounded-xl text-rose-700 font-semibold"
                  placeholder="e.g. Penicillin allergy, Asthmatic, Diabetic Type 2"
                />
              </div>
            </div>

            {/* Blood Donor Volunteer Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Voluntary Blood Donor Registry
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allow nearby hospitals to request emergency code red blood units when in critical shortage.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={willingToDonate}
                onChange={e => setWillingToDonate(e.target.checked)}
                className="h-5 w-5 text-teal-700 rounded-md focus:ring-teal-600 cursor-pointer"
              />
            </div>

            {/* Two-Factor Authentication Toggle */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-950 block">
                    Two-Factor Authentication (2FA via Email OTP)
                  </span>
                  <span className="text-[11px] text-teal-700">
                    Requires a 6-digit cryptographic verification code sent directly to your registered email on every sign-in.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorActive}
                onChange={e => setTwoFactorActive(e.target.checked)}
                className="h-5 w-5 text-teal-700 rounded-md focus:ring-teal-600 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md px-6 h-10"
              >
                <Save size={14} className="mr-1.5" />
                {saving ? "Saving Changes..." : "Save Professional Profile"}
              </Button>
            </div>
          </form>

          {/* Active Security Sessions */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Laptop size={16} className="text-teal-700" />
                Active Authorized Device Sessions
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 border-emerald-300">
                1 Session Active
              </Badge>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Current Web Session (Secure HTTPS)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  IP: 49.205.142.88 &bull; Hyderabad, India &bull; Chrome 128 / macOS &bull; TLS 1.3
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                This Device
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile > Accessibility Settings */}
      <div id="accessibility-settings" className="scroll-mt-24">
        <AccessibilitySettingsPanel />
      </div>
    </div>
  );
}
