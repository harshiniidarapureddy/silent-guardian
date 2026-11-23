import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Shield, HeartPulse, Check, ArrowRight, ArrowLeft, Camera, Upload, User,
  Sparkles, Heart, Users, MapPin, Award, CheckCircle2, Globe, AlertCircle, Phone,
  Play, Video, Zap, Eye
} from "lucide-react";
import { api, getUser, saveAuth } from "../lib/api";
import {
  clearAuthSignupDraft,
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../lib/signupDraft";
import { OnboardingVideoExplainer } from "../components/patient/OnboardingVideoExplainer";

const LANGS = [
  { v: "en", l: "English (Global)" },
  { v: "te", l: "తెలుగు (Telugu)" },
  { v: "hi", l: "हिन्दी (Hindi)" },
  { v: "ta", l: "தமிழ் (Tamil)" },
  { v: "bn", l: "বাংলা (Bengali)" },
  { v: "es", l: "Español (Spanish)" },
];

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-Binary", label: "Non-Binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const FIRST_AID_OPTIONS = [
  { value: "trained", label: "Trained in CPR & Basic First Aid", hasCpr: true },
  { value: "certified", label: "Certified First Responder / EMT / Nurse", hasCpr: true },
  { value: "basic", label: "Basic Awareness / Self-Taught", hasCpr: true },
  { value: "none", label: "No prior training / Need Guidance", hasCpr: false },
];

const POPULAR_LOCATIONS = [
  "Hyderabad",
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Other"
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
  const currentUser = getUser();
  const initialDraft = useRef(loadOnboardingDraft()).current;

  const [step, setStep] = useState<number>(() => {
    const s = initialDraft?.step;
    return typeof s === "number" && s >= 1 && s <= 4 ? s : 1;
  });
  const [saving, setSaving] = useState(false);

  // Step 1: What should we call you? + Age, Gender, Language, Location, Phone
  const [name, setName] = useState(
    initialDraft?.name ?? currentUser?.preferred_name ?? ""
  );
  const [phone, setPhone] = useState(
    initialDraft?.phone ?? currentUser?.phone ?? ""
  );
  const [age, setAge] = useState(initialDraft?.age ?? "24");
  const [gender, setGender] = useState(initialDraft?.gender ?? "Male");
  const [language, setLanguage] = useState(initialDraft?.language ?? "en");
  const [location, setLocation] = useState(initialDraft?.location ?? "Hyderabad");
  const [customLocation, setCustomLocation] = useState(
    initialDraft?.customLocation ?? ""
  );

  // Step 2: Blood group + Willing to donate + First aid / CPR / nursing
  const [bloodGroup, setBloodGroup] = useState(initialDraft?.bloodGroup ?? "O+");
  const [willingToDonate, setWillingToDonate] = useState(
    initialDraft?.willingToDonate ?? true
  );
  const [firstAidLevel, setFirstAidLevel] = useState(
    initialDraft?.firstAidLevel ?? "trained"
  );

  // Step 3: Guardian details + Consent protocols
  const [guardianName, setGuardianName] = useState(
    initialDraft?.guardianName ?? ""
  );
  const [guardianPhone, setGuardianPhone] = useState(
    initialDraft?.guardianPhone ?? ""
  );
  const [agreeConsent, setAgreeConsent] = useState(
    initialDraft?.agreeConsent ?? true
  );

  const [selectedAvatar, setSelectedAvatar] = useState(
    initialDraft?.selectedAvatar ?? ANIME_AVATARS_COLLECTION[0].url
  );
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [showVideoExplainer, setShowVideoExplainer] = useState(false);

  const savedScrollYRef = useRef<number>(initialDraft?.scrollY ?? 0);
  const pushedVideoHistoryRef = useRef<boolean>(false);

  // Persist all in-progress onboarding inputs in sessionStorage so nothing is lost during video playback
  useEffect(() => {
    saveOnboardingDraft({
      step,
      name,
      phone,
      age,
      gender,
      language,
      location,
      customLocation,
      bloodGroup,
      willingToDonate,
      firstAidLevel,
      guardianName,
      guardianPhone,
      agreeConsent,
      selectedAvatar,
      scrollY: savedScrollYRef.current,
    });
  }, [
    step,
    name,
    phone,
    age,
    gender,
    language,
    location,
    customLocation,
    bloodGroup,
    willingToDonate,
    firstAidLevel,
    guardianName,
    guardianPhone,
    agreeConsent,
    selectedAvatar,
  ]);

  const restoreScrollPosition = useCallback(() => {
    const targetY = savedScrollYRef.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
    });
  }, []);

  const openVideoLightbox = useCallback(() => {
    savedScrollYRef.current = window.scrollY;
    saveOnboardingDraft({
      step,
      name,
      phone,
      age,
      gender,
      language,
      location,
      customLocation,
      bloodGroup,
      willingToDonate,
      firstAidLevel,
      guardianName,
      guardianPhone,
      agreeConsent,
      selectedAvatar,
      scrollY: window.scrollY,
    });
    if (!pushedVideoHistoryRef.current) {
      window.history.pushState({ cpVideoModal: true }, "");
      pushedVideoHistoryRef.current = true;
    }
    setShowVideoExplainer(true);
  }, [
    step,
    name,
    phone,
    age,
    gender,
    language,
    location,
    customLocation,
    bloodGroup,
    willingToDonate,
    firstAidLevel,
    guardianName,
    guardianPhone,
    agreeConsent,
    selectedAvatar,
  ]);

  const closeVideoLightbox = useCallback(
    (fromPopState = false) => {
      setShowVideoExplainer(false);
      if (pushedVideoHistoryRef.current) {
        pushedVideoHistoryRef.current = false;
        if (!fromPopState && window.history.state?.cpVideoModal) {
          window.history.back();
        }
      }
      restoreScrollPosition();
    },
    [restoreScrollPosition]
  );

  // Intercept browser Back button and Escape key while video lightbox is open so user stays on exact step
  useEffect(() => {
    if (!showVideoExplainer) return;
    const onPopState = () => {
      closeVideoLightbox(true);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeVideoLightbox(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showVideoExplainer, closeVideoLightbox]);

  const activePhoto = customPhoto || selectedAvatar;
  const effectiveLocation = location === "Other" && customLocation.trim() ? customLocation.trim() : location;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomPhoto(result);
        toast.success("Custom profile photo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep1 = () => {
    if (!name.trim()) {
      toast.error("Please enter what we should call you (e.g. Ramesh Sharma).");
      return;
    }
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 120) {
      toast.error("Please enter a valid age between 1 and 120.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!bloodGroup) {
      toast.error("Please select your blood group.");
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!guardianName.trim()) {
      toast.error("Please provide an emergency guardian name (e.g. Sita Sharma / Mother).");
      return;
    }
    if (!guardianPhone.trim()) {
      toast.error("Please provide an emergency guardian phone number.");
      return;
    }
    if (!agreeConsent) {
      toast.error("Please accept the medical safety protocols to proceed.");
      return;
    }
    setStep(4);
  };

  const submitFinalProfile = async () => {
    setSaving(true);
    try {
      const selectedFa = FIRST_AID_OPTIONS.find(f => f.value === firstAidLevel);
      const parsedAge = parseInt(age, 10) || 24;
      const ageBracket = parsedAge < 18 ? "teen" : parsedAge >= 60 ? "senior" : "adult";

      const profilePayload = {
        preferred_name: name.trim(),
        phone: phone.trim() || undefined,
        age: parsedAge,
        gender,
        age_bracket: ageBracket,
        language,
        location: effectiveLocation,
        blood_group: bloodGroup,
        willing_to_donate: willingToDonate,
        first_aid_cpr: selectedFa?.hasCpr ?? true,
        first_aid_level: selectedFa?.label || "Trained in CPR & Basic First Aid",
        guardian_name: guardianName.trim(),
        guardian_contact: guardianPhone.trim(),
        managed_by_guardian: Boolean(guardianName.trim()),
        photo_url: activePhoto,
        consent_agreed: true,
      };

      await api.post("/profile", profilePayload);

      const u = getUser();
      if (u) {
        saveAuth(localStorage.getItem("sg_token") || "token", {
          ...u,
          onboarded: true,
          preferred_name: name.trim() || u.preferred_name,
        });
      }

      clearOnboardingDraft();
      clearAuthSignupDraft();
      toast.success(`Welcome to Care Preempt, ${name.trim()}! Your safety profile is fully active.`);
      window.dispatchEvent(new Event("profile-updated"));
      navigate("/patient");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Interactive Video Explainer Banner */}
        <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
              <Play size={18} className="fill-teal-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>See How AI Triage Protects You</span>
                <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-mono font-bold">Interactive</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Step-by-step visual breakdown with clickable annotations: Biometric sensors, Guardian SMS & ICU bed locks.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            data-testid="onboarding-watch-video-btn"
            onClick={openVideoLightbox}
            className="h-9 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md inline-flex items-center gap-1.5"
          >
            <span>Watch Video Breakdown</span>
            <ArrowRight size={13} />
          </Button>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-10 sg-fade-in">
          
          {/* Header Progress Stepper */}
          <div className="mb-8 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-teal-700 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>STEP {step} OF 4 · CLINICAL ONBOARDING</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {step === 1 && "Identity & Demographics"}
                  {step === 2 && "Clinical Profile & Blood Net"}
                  {step === 3 && "Emergency Guardian & Protocols"}
                  {step === 4 && "Choose Your Avatar"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {step === 1 && "First, tell us what to call you and share your basic demographic details."}
                  {step === 2 && "Share your blood group and community emergency response capabilities."}
                  {step === 3 && "Register your family emergency guardian for automated AI triage SMS."}
                  {step === 4 && "Choose an anime avatar or upload a photo for your medical pass."}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 shadow-sm">
                <HeartPulse size={24} />
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="space-y-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s < step
                        ? "bg-teal-600"
                        : s === step
                        ? "bg-teal-700 ring-2 ring-teal-200"
                        : "bg-slate-200"
                    }`}
                  />
                  <div className="text-[10px] font-bold text-center text-slate-500">
                    {s === 1 && "Identity"}
                    {s === 2 && "Blood & CPR"}
                    {s === 3 && "Guardian"}
                    {s === 4 && "Avatar"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 1: What should we call you? + Age, Gender, Language, Location */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                <Label className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <User size={16} className="text-teal-700" />
                  <span>What should we call you? (Full Legal Name) *</span>
                </Label>
                <p className="text-xs text-teal-800 mt-0.5">
                  Used on emergency hospital admittance slips and triage badges.
                </p>
                <div className="relative mt-2">
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-11 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mobile Phone (Emergency SMS)</Label>
                <div className="relative mt-1">
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Age (Years) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                    className="mt-1 h-10 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Gender *</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Language & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe size={13} className="text-teal-700" />
                    <span>Preferred Language *</span>
                  </Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {LANGS.map((l) => (
                      <option key={l.v} value={l.v}>{l.l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin size={13} className="text-teal-700" />
                    <span>Current City / Location *</span>
                  </Label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {POPULAR_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {location === "Other" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Type Your City / Town Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Visakhapatnam, Chandigarh"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="mt-1 h-10 text-xs"
                  />
                </div>
              )}

              {/* Step 1 Continue */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={handleNextStep1}
                  className="h-11 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Blood & First Aid</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Blood group + Willing to donate + First aid / CPR / nursing */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Blood Group */}
              <div>
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-600" />
                  <span>Blood Group *</span>
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = bloodGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodGroup(bg)}
                        className={`h-11 rounded-xl font-bold font-mono text-sm border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-700 shadow-md scale-105"
                            : "bg-white text-slate-700 border-slate-200 hover:border-rose-300"
                        }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Willing to Donate Blood in Emergencies Checkbox */}
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="willingToDonate"
                  checked={willingToDonate}
                  onChange={(e) => setWillingToDonate(e.target.checked)}
                  className="mt-1 rounded text-rose-600 focus:ring-rose-500 h-5 w-5 cursor-pointer"
                />
                <div>
                  <label htmlFor="willingToDonate" className="text-xs font-bold text-rose-950 cursor-pointer block">
                    Willing to Donate Blood in Emergencies
                  </label>
                  <p className="text-[11px] text-rose-800 leading-relaxed mt-1">
                    Enrolls you in Care Preempt's community rare-blood emergency net so nearby hospitals can reach you during critical transfusions.
                  </p>
                </div>
              </div>

              {/* Do You Know First Aid / CPR? */}
              <div>
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award size={15} className="text-teal-700" />
                  <span>Do You Know First Aid / CPR / Nursing? *</span>
                </Label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Helps our network coordinate nearby certified bystander response during cardiac arrests.
                </p>
                <div className="space-y-2 mt-2" role="radiogroup" aria-label="First Aid and CPR Experience">
                  {FIRST_AID_OPTIONS.map((fa) => {
                    const isSelected = firstAidLevel === fa.value;
                    return (
                      <button
                        key={fa.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        data-testid={`first-aid-option-${fa.value}`}
                        onClick={() => setFirstAidLevel(fa.value)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                          isSelected
                            ? "bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600 font-semibold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span>{fa.label}</span>
                        {isSelected && <Check size={16} className="text-teal-700 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
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
                  <span>Back to Identity</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleNextStep2}
                  className="h-11 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Guardian Details</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Emergency Guardian & Safety Protocols */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5">
              
              <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                  <Users size={16} className="text-amber-700" />
                  <span>Emergency Family Guardian Contact</span>
                </div>
                
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Guardian Name *</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Sita Sharma / Mother"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="mt-1 h-10 text-xs bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Guardian Phone *</Label>
                  <Input
                    type="tel"
                    required
                    placeholder="+91 98490 22334"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="mt-1 h-10 text-xs bg-white font-mono"
                  />
                </div>

                <div className="p-2.5 bg-amber-100/60 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Notice:</strong> Our AI Triage automatically triggers an emergency SMS and GPS beacon to this number when high-severity symptoms are flagged.
                </div>

                {/* Interactive Explainer Callout inside Guardian Step */}
                <div className="p-3 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 rounded-xl border border-teal-500/40 text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">How Guardian AI SMS Works</div>
                      <p className="text-[10px] text-teal-200">Watch the interactive video breakdown with clickable annotations</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="onboarding-guardian-video-btn"
                    onClick={openVideoLightbox}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Play size={12} className="fill-white" />
                    <span>Watch (60s)</span>
                  </button>
                </div>
              </div>

              {/* Protocol Consent Checkbox */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeConsent"
                  checked={agreeConsent}
                  onChange={(e) => setAgreeConsent(e.target.checked)}
                  className="mt-1 rounded text-teal-700 focus:ring-teal-600 h-5 w-5 cursor-pointer"
                />
                <div>
                  <label htmlFor="agreeConsent" className="text-xs font-semibold text-slate-800 leading-relaxed cursor-pointer block">
                    I agree to the Care Preempt emergency medical safety protocols and consent to storing my blood group, age, and emergency contact for verified responder coordination. *
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Your medical profile is strictly encrypted (AES-256) and only revealed to certified 108 emergency paramedics and trauma admissions.
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-11 px-5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Blood & First Aid</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleNextStep3}
                  className="h-11 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Avatar Selection</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Choose Your Avatar */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
                  <span>Choose Your Avatar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an anime avatar or upload your photo for your emergency triage pass & hospital wristband.
                </p>
              </div>

              {/* Active Avatar Preview Card */}
              <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-teal-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-500 shadow-sm bg-white shrink-0">
                    <img src={activePhoto} alt="Selected Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {name || "Your Profile"}
                    </div>
                    <div className="text-xs text-purple-700 font-medium">
                      {customPhoto
                        ? "Custom Uploaded Photo"
                        : ANIME_AVATARS_COLLECTION.find(a => a.url === selectedAvatar)?.title || "Anime Avatar"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {gender} · {age} yrs · Blood {bloodGroup} · {effectiveLocation}
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-all shrink-0">
                  <Upload size={14} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 12 Anime Avatars Gallery */}
              <div>
                <Label className="text-xs font-bold text-slate-800 mb-2 block">
                  Select Anime Avatar Collection ({ANIME_AVATARS_COLLECTION.length})
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-2.5 bg-slate-50 rounded-2xl border border-slate-200 sg-scrollbar">
                  {ANIME_AVATARS_COLLECTION.map((av) => {
                    const isSelected = !customPhoto && selectedAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setCustomPhoto(null);
                          setSelectedAvatar(av.url);
                        }}
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
                            <Check size={20} className="text-white drop-shadow-md font-bold" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-white font-bold text-center truncate px-1 py-0.5">
                          {av.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation & Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-11 px-5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Guardian</span>
                </Button>

                <Button
                  type="button"
                  onClick={submitFinalProfile}
                  disabled={saving}
                  className="h-11 px-8 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    "Saving Profile..."
                  ) : (
                    <>
                      <span>Complete & Open Safety Dashboard</span>
                      <Check size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-Place Interactive Video Explainer Lightbox (Preserves Registration Step & Form State) */}
      {showVideoExplainer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How Care Preempt AI Triage Works Video Guide"
          data-testid="signup-video-lightbox"
          onClick={() => closeVideoLightbox(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            className="w-full max-w-4xl py-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <OnboardingVideoExplainer
              backLabel={`Back to Registration (Step ${step} of 4)`}
              onClose={() => closeVideoLightbox(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
