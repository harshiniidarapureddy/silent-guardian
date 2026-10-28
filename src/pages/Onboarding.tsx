import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Shield, HeartPulse, Check, ArrowRight, ArrowLeft, Camera, Upload, User, Sparkles, GraduationCap, Briefcase } from "lucide-react";
import { api, getUser, saveAuth } from "../lib/api";

const LANGS = [
  { v: "en", l: "English (Global)" },
  { v: "hi", l: "हिन्दी (Hindi)" },
  { v: "te", l: "తెలుగు (Telugu)" },
  { v: "ta", l: "தமிழ் (Tamil)" },
  { v: "bn", l: "বাংলা (Bengali)" },
  { v: "es", l: "Español (Spanish)" },
];

const BLOOD = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const GENDERS = [
  { value: "Male", label: "Male 👨" },
  { value: "Female", label: "Female 👩" },
  { value: "Non-Binary", label: "Non-Binary 🧑" },
  { value: "Prefer not to say", label: "Prefer not to say 🔒" },
];

const OCCUPATIONS = [
  { value: "Student", label: "🎓 Student (School / College / University)" },
  { value: "Working Professional", label: "💼 Working Professional / Corporate" },
  { value: "Healthcare Worker", label: "🏥 Healthcare Worker / EMT / First Responder" },
  { value: "Homemaker", label: "🏡 Homemaker / Family Caregiver" },
  { value: "Freelancer", label: "🚀 Freelancer / Self-Employed" },
  { value: "Senior Citizen", label: "👴 Senior Citizen / Retired" },
  { value: "Other", label: "🌟 Other" },
];

export const ANIME_AVATARS_COLLECTION = [
  { id: "an1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04", name: "Kenji", title: "Anime Medic Sensei" },
  { id: "an2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=SakuraMedic&hair=long01&eyes=variant02", name: "Sakura", title: "Anime Healer Girl" },
  { id: "an3", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=RenStudent&hair=short02&eyes=variant06", name: "Ren", title: "Anime Student Scholar" },
  { id: "an4", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=AoiStudent&hair=long03&eyes=variant10", name: "Aoi", title: "Anime Student & Helper" },
  { id: "an5", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=CyberHealer&hair=short04", name: "Kaito", title: "Cyber Healer Hero" },
  { id: "an6", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=YukiClinic&hair=long04", name: "Yuki", title: "Kawaii Clinic Specialist" },
  { id: "an7", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=DaikiGuardian&hair=short05", name: "Daiki", title: "Guardian Defender" },
  { id: "an8", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=ShunDoctor&hair=short06", name: "Shun", title: "Resident Physician" },
  { id: "an9", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=HanaEMT&hair=long02", name: "Hana", title: "Chibi EMT Responder" },
  { id: "an10", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=MikoPriestess&hair=long05", name: "Miko", title: "Shrine Healer" },
  { id: "an11", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=HarutoHero&hair=short03", name: "Haruto", title: "Campus First Aider" },
  { id: "an12", url: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaTrauma", name: "Mecha", title: "Trauma Cyber-Unit" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    preferred_name: "",
    gender: "Male" as any,
    occupation: "Student" as any,
    age: "22",
    age_bracket: "adult" as any,
    blood_group: "O+",
    language: "en",
    location: "Hyderabad",
    photo_url: ANIME_AVATARS_COLLECTION[0].url,
    guardian_name: "",
    guardian_contact: "",
    managed_by_guardian: false,
    first_aid_cpr: true,
    willing_to_donate: true,
  });

  const [previewPhoto, setPreviewPhoto] = useState<string>(ANIME_AVATARS_COLLECTION[0].url);

  const set = (k: string) => (v: any) => setData((d) => ({ ...d, [k]: v }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewPhoto(result);
        set("photo_url")(result);
        toast.success("Custom profile photo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const selectAnimeAvatar = (url: string) => {
    setPreviewPhoto(url);
    set("photo_url")(url);
    toast.success("Anime avatar selected!");
  };

  const submit = async () => {
    try {
      await api.post("/profile", data);
      const u = getUser();
      if (u) {
        saveAuth(localStorage.getItem("sg_token") || "token", {
          ...u,
          onboarded: true,
          preferred_name: data.preferred_name || "User",
        });
      }
      toast.success("Welcome to Silent Guardian, " + (data.preferred_name || "User") + "!");
      window.dispatchEvent(new Event("profile-updated"));
      navigate("/patient");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Could not save profile");
    }
  };

  const canProceedStep1 = data.preferred_name.trim().length > 0 && Number(data.age) > 0 && !!data.blood_group;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-10 sg-fade-in">
          
          {/* Header Progress Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-teal-700 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>STEP {step} OF 2 · PROFILE SETUP</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {step === 1 && "Personal Identity & Anime Avatar"}
                {step === 2 && "Emergency Guardian & Medical Preferences"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {step === 1 && "Select your gender, occupation (e.g. Student), vitals, and chosen Anime Avatar."}
                {step === 2 && "Add your family emergency contact and CPR volunteer preferences."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <HeartPulse size={24} />
            </div>
          </div>

          {/* STEP 1: Name, Gender, Student / Occupation, Age, Blood Group & Anime Avatar Collection */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* 1. Full Name */}
              <div>
                <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                <Input
                  value={data.preferred_name}
                  onChange={(e) => set("preferred_name")(e.target.value)}
                  placeholder="e.g. Ramesh Sharma or Ananya Rao"
                  className="mt-1.5 h-11 text-sm"
                  required
                />
              </div>

              {/* 2. Gender & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Gender *</Label>
                  <Select value={data.gender} onValueChange={set("gender")}>
                    <SelectTrigger className="mt-1.5 h-11 text-xs">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value} className="text-xs">
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Age in Years *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="115"
                    value={data.age}
                    onChange={(e) => set("age")(e.target.value)}
                    placeholder="e.g. 21"
                    className="mt-1.5 h-11 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* 3. Occupation / Student Status */}
              <div>
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-teal-700" />
                  <span>Are you a Student, Working Professional, or Caregiver? *</span>
                </Label>
                <Select value={data.occupation} onValueChange={set("occupation")}>
                  <SelectTrigger className="mt-1.5 h-11 text-xs">
                    <SelectValue placeholder="Select Status / Occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATIONS.map((occ) => (
                      <SelectItem key={occ.value} value={occ.value} className="text-xs">
                        {occ.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Blood Group & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Blood Group *</Label>
                  <Select value={data.blood_group} onValueChange={set("blood_group")}>
                    <SelectTrigger className="mt-1.5 h-11 text-xs">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD.map((b) => (
                        <SelectItem key={b} value={b}>
                          <span className="font-bold text-red-600 mr-1.5">●</span>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">City / Metro Location</Label>
                  <Input
                    value={data.location}
                    onChange={(e) => set("location")(e.target.value)}
                    placeholder="e.g. Hyderabad, Delhi, Bengaluru"
                    className="mt-1.5 h-11 text-xs"
                  />
                </div>
              </div>

              {/* 5. Preferred Language */}
              <div>
                <Label className="text-xs font-bold text-slate-700">Preferred Medical Language</Label>
                <Select value={data.language} onValueChange={set("language")}>
                  <SelectTrigger className="mt-1.5 h-11 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGS.map((l) => (
                      <SelectItem key={l.v} value={l.v}>{l.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. ANIME AVATAR COLLECTION SELECTOR */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-600" />
                      Choose Your Anime Avatar Collection ({ANIME_AVATARS_COLLECTION.length})
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                      Official Collection
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold hidden sm:inline">
                    Tap to select avatar
                  </span>
                </div>

                {/* Selected Active Avatar Card */}
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-slate-50 to-teal-50 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-500 shadow-sm bg-white shrink-0">
                      <img src={previewPhoto} alt="Selected Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {ANIME_AVATARS_COLLECTION.find(a => a.url === previewPhoto)?.name || "Custom Avatar"}
                      </div>
                      <div className="text-[11px] text-purple-700 font-medium">
                        {ANIME_AVATARS_COLLECTION.find(a => a.url === previewPhoto)?.title || "User Profile Photo"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Selected for your safety profile & triage card
                      </div>
                    </div>
                  </div>

                  {/* Optional File Upload button */}
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-all shrink-0">
                    <Upload size={13} />
                    <span>Upload Own</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 12 Anime Avatars Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 sg-scrollbar">
                  {ANIME_AVATARS_COLLECTION.map((av) => {
                    const isSelected = previewPhoto === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => selectAnimeAvatar(av.url)}
                        className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-purple-600 ring-2 ring-purple-400/50 scale-105 shadow-md bg-purple-100"
                            : "border-slate-200 hover:border-purple-300 bg-white"
                        }`}
                        title={`${av.name} · ${av.title}`}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-600/30 backdrop-blur-xs flex items-center justify-center">
                            <Check size={18} className="text-white drop-shadow-md font-bold" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-white font-bold text-center truncate px-1 py-0.5">
                          {av.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    if (!canProceedStep1) {
                      toast.error("Please enter your name, age, and blood group.");
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={!canProceedStep1}
                  className="h-11 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Emergency Circle</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Emergency Guardian & Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Profile Confirmation Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={previewPhoto} alt="Profile" className="w-12 h-12 rounded-xl object-cover border border-purple-300" />
                  <div>
                    <strong className="text-slate-900 text-sm">{data.preferred_name}</strong>
                    <div className="text-slate-500 text-[11px]">
                      {data.gender} · {data.age} yrs · {data.occupation}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold font-mono text-xs">
                    Blood: {data.blood_group}
                  </span>
                  <div className="text-slate-400 text-[10px] mt-1">{data.location}</div>
                </div>
              </div>

              {/* Guardian Emergency Contact */}
              <div className="space-y-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Shield size={14} className="text-amber-700" />
                  Family Emergency Guardian (Receives Live Alerts)
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Guardian Name</Label>
                    <Input
                      value={data.guardian_name}
                      onChange={(e) => set("guardian_name")(e.target.value)}
                      placeholder="e.g. Sita Sharma (Mother) or Rohan"
                      className="mt-1 h-10 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Guardian Phone Number</Label>
                    <Input
                      value={data.guardian_contact}
                      onChange={(e) => set("guardian_contact")(e.target.value)}
                      placeholder="+91-98490-11223"
                      className="mt-1 h-10 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Health Preferences */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Trained in CPR & First Aid?</div>
                    <div className="text-[11px] text-slate-500">Allows receiving nearby bystander cardiac collapse alerts</div>
                  </div>
                  <Switch checked={data.first_aid_cpr} onCheckedChange={set("first_aid_cpr")} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Willing to be a Volunteer Blood Donor?</div>
                    <div className="text-[11px] text-slate-500">Notify me when someone near me urgently needs {data.blood_group} blood</div>
                  </div>
                  <Switch checked={data.willing_to_donate} onCheckedChange={set("willing_to_donate")} />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11 px-5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Profile</span>
                </Button>

                <Button
                  type="button"
                  onClick={submit}
                  className="h-11 px-8 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Complete Setup & Enter Portal</span>
                  <Check size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
