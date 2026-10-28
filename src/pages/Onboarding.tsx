import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Shield, HeartPulse, Check, ArrowRight, ArrowLeft, Camera, Upload, User, SkipForward } from "lucide-react";
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

const PRESET_AVATARS = [
  { id: "av1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", label: "Avatar 1" },
  { id: "av2", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80", label: "Avatar 2" },
  { id: "av3", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", label: "Avatar 3" },
  { id: "av4", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", label: "Avatar 4" },
  { id: "av5", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80", label: "Avatar 5" },
  { id: "av6", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80", label: "Avatar 6" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    preferred_name: "",
    age: "32",
    age_bracket: "adult" as any,
    blood_group: "O+",
    language: "en",
    location: "Hyderabad",
    photo_url: "",
    guardian_name: "",
    guardian_contact: "",
    managed_by_guardian: false,
    first_aid_cpr: true,
    willing_to_donate: true,
  });

  const [previewPhoto, setPreviewPhoto] = useState<string>("");

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
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string) => {
    setPreviewPhoto(url);
    set("photo_url")(url);
  };

  const skipPhoto = () => {
    set("photo_url")("");
    setPreviewPhoto("");
    toast.info("Photo skipped. You can always add one later from your dashboard profile.");
    setStep(3);
  };

  const submit = async () => {
    try {
      await api.post("/profile", data);
      const u = getUser();
      if (u) {
        saveAuth(localStorage.getItem("sg_token") || "token", {
          ...u,
          onboarded: true,
          preferred_name: data.preferred_name || "Patient",
        });
      }
      toast.success("Welcome to Silent Guardian, " + (data.preferred_name || "Patient") + "!");
      window.dispatchEvent(new Event("profile-updated"));
      navigate("/patient");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Could not save profile");
    }
  };

  const canProceedStep1 = data.preferred_name.trim().length > 0 && Number(data.age) > 0 && !!data.blood_group;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-10 sg-fade-in">
          {/* Header Progress */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-teal-700">
                Step {step} of 3
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {step === 1 && "Patient Identity & Vitals"}
                {step === 2 && "Profile Photo Setup"}
                {step === 3 && "Emergency Safety Circle"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {step === 1 && "Enter your basic medical identity (name, age, and blood group) first."}
                {step === 2 && "Add a face photo for clinical verification, or skip and set it later."}
                {step === 3 && "Add your emergency contact and community responder preferences."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <HeartPulse size={24} />
            </div>
          </div>

          {/* Step 1: Name, Age, Blood Group First */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200/60 rounded-2xl text-xs text-teal-900 flex items-center gap-2">
                <Shield size={16} className="text-teal-700 flex-shrink-0" />
                <span>
                  Please provide your <strong>Name</strong>, <strong>Age</strong>, and <strong>Blood Group</strong>. Photo setup will follow on the next step.
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                <Input
                  value={data.preferred_name}
                  onChange={(e) => set("preferred_name")(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="mt-1.5 h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Age in Years *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="115"
                    value={data.age}
                    onChange={(e) => set("age")(e.target.value)}
                    placeholder="e.g. 32"
                    className="mt-1.5 h-11"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Blood Group *</Label>
                  <Select value={data.blood_group} onValueChange={set("blood_group")}>
                    <SelectTrigger className="mt-1.5 h-11">
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
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">City / Locality</Label>
                  <Input
                    value={data.location}
                    onChange={(e) => set("location")(e.target.value)}
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Preferred Language</Label>
                  <Select value={data.language} onValueChange={set("language")}>
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGS.map((l) => (
                        <SelectItem key={l.v} value={l.v}>{l.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photo Setup (With Explicit Skip Option) */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Confirmed Vitals Badge */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Patient: </span>
                  <strong className="text-slate-800">{data.preferred_name}</strong>
                  <span className="text-slate-400"> ({data.age} yrs)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                  Blood: {data.blood_group}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt="Preview"
                      className="w-28 h-28 rounded-3xl object-cover border-4 border-teal-500 shadow-md ring-4 ring-teal-50"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <User size={36} />
                      <span className="text-[10px] mt-1 text-slate-400 font-medium">No photo</span>
                    </div>
                  )}
                  {previewPhoto && (
                    <button
                      type="button"
                      onClick={() => { setPreviewPhoto(""); set("photo_url")(""); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs shadow hover:bg-red-600"
                      title="Clear photo"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Upload Your Photo</Label>
                    <label className="mt-1.5 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                      <Upload size={15} />
                      <span>Choose file from device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP (Max 5MB). Photo is stored locally on your device.
                  </p>
                </div>
              </div>

              {/* Diverse Preset Avatars */}
              <div>
                <Label className="text-xs font-bold text-slate-700">Or choose a preset profile avatar:</Label>
                <div className="grid grid-cols-6 gap-2.5 mt-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => selectPreset(av.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                        previewPhoto === av.url ? "border-teal-600 ring-2 ring-teal-500/30 scale-105" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      {previewPhoto === av.url && (
                        <div className="absolute inset-0 bg-teal-600/30 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skip Option Banner */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-center justify-between text-xs">
                <div className="pr-3 text-amber-900">
                  <span className="font-semibold">Don't have a photo right now?</span>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    You can skip this step and add your picture later anytime in your Patient Dashboard.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipPhoto}
                  className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100 rounded-full text-xs font-bold h-8 px-3.5 flex-shrink-0"
                >
                  <SkipForward size={13} className="mr-1" />
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contacts & First-Aid */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Emergency Guardian Name</Label>
                  <Input
                    value={data.guardian_name}
                    onChange={(e) => set("guardian_name")(e.target.value)}
                    placeholder="e.g. Sita Sharma (Spouse / Parent)"
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Emergency Guardian Contact Phone</Label>
                  <Input
                    value={data.guardian_contact}
                    onChange={(e) => set("guardian_contact")(e.target.value)}
                    placeholder="+91 98490 00000"
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-teal-100 p-4 bg-teal-50/50">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <div className="font-semibold text-sm text-teal-900">Do you know basic First Aid / Hands-Only CPR?</div>
                    <div className="text-xs text-teal-700 mt-0.5">
                      You will be highlighted as a willing community responder during nearby life-threatening crises.
                    </div>
                  </div>
                  <Switch checked={data.first_aid_cpr} onCheckedChange={set("first_aid_cpr")} />
                </div>
              </div>

              <div className="rounded-2xl border border-red-100 p-4 bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <div className="font-semibold text-sm text-red-900">Willing & medically eligible to donate blood?</div>
                    <div className="text-xs text-red-700 mt-0.5">
                      We notify you only when hospitals in your city request critical {data.blood_group} blood units.
                    </div>
                  </div>
                  <Switch checked={data.willing_to_donate} onCheckedChange={set("willing_to_donate")} />
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              disabled={step === 1}
              className="text-slate-600"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Back
            </Button>

            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-7 font-semibold"
              >
                Proceed to Photo Setup
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            )}

            {step === 2 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipPhoto}
                  className="rounded-full text-slate-600 hover:text-slate-900 px-4"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6 font-semibold"
                >
                  Save Photo & Continue
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <Button
                onClick={submit}
                className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-8 font-semibold shadow-md"
              >
                Complete Setup & Enter Portal
                <Check size={16} className="ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
