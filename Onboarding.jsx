import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Shield, HeartPulse } from "lucide-react";
import { api, getUser, saveAuth } from "../lib/api";

const AGE_BRACKETS = [
  { v: "under5", l: "Under 5 (Child)" },
  { v: "teen", l: "Teenager" },
  { v: "adult", l: "Adult" },
  { v: "married", l: "Married" },
  { v: "graduate", l: "Graduate / Student" },
  { v: "senior", l: "Senior Citizen" },
];
const LANGS = [
  { v: "en", l: "English" }, { v: "hi", l: "हिन्दी" }, { v: "te", l: "తెలుగు" },
  { v: "ta", l: "தமிழ்" }, { v: "es", l: "Español" },
];
const BLOOD = ["O+","O-","A+","A-","B+","B-","AB+","AB-"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    preferred_name: "", age_bracket: "adult", language: "en", location: "",
    guardian_name: "", guardian_contact: "", managed_by_guardian: false,
    first_aid_cpr: false, blood_group: "O+", willing_to_donate: false,
  });
  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    try {
      await api.post("/profile", data);
      const u = getUser();
      saveAuth(localStorage.getItem("sg_token"), { ...u, onboarded: true, preferred_name: data.preferred_name });
      toast.success("Welcome aboard, " + data.preferred_name);
      navigate("/patient");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not save");
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-7 sg-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] font-bold text-teal-700">Step {step} of 4</div>
              <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
                {step === 1 && "Let's get acquainted"}
                {step === 2 && "A bit about you"}
                {step === 3 && "Guardian & community"}
                {step === 4 && "Blood & readiness"}
              </h1>
            </div>
            <HeartPulse className="text-teal-700" />
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label>What should the assistant call you?</Label>
                <Input value={data.preferred_name} onChange={(e) => set("preferred_name")(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Preferred language</Label>
                <Select value={data.language} onValueChange={set("language")}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGS.map(l => <SelectItem key={l.v} value={l.v}>{l.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label>Which life stage fits you best?</Label>
                <Select value={data.age_bracket} onValueChange={set("age_bracket")}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{AGE_BRACKETS.map(a => <SelectItem key={a.v} value={a.v}>{a.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Your city / area</Label>
                <Input value={data.location} onChange={(e) => set("location")(e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Can you use the app independently?</div>
                    <div className="text-sm text-slate-600">Children and seniors can be managed by a guardian.</div>
                  </div>
                  <Switch checked={data.managed_by_guardian} onCheckedChange={set("managed_by_guardian")} />
                </div>
              </div>
              <div>
                <Label>Guardian name</Label>
                <Input value={data.guardian_name} onChange={(e) => set("guardian_name")(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Guardian phone</Label>
                <Input value={data.guardian_contact} onChange={(e) => set("guardian_contact")(e.target.value)} className="mt-1.5" />
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Do you know basic First Aid / CPR?</div>
                    <div className="text-sm text-slate-600">You will appear as a nearby responder for emergencies.</div>
                  </div>
                  <Switch checked={data.first_aid_cpr} onCheckedChange={set("first_aid_cpr")} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <Label>Your blood group</Label>
                <Select value={data.blood_group} onValueChange={set("blood_group")}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{BLOOD.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Willing & able to donate blood?</div>
                    <div className="text-sm text-slate-600">We only ping you for matched urgent requests nearby.</div>
                  </div>
                  <Switch checked={data.willing_to_donate} onCheckedChange={set("willing_to_donate")} />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
            {step < 4
              ? <Button onClick={next} disabled={step === 1 && !data.preferred_name} className="rounded-full bg-teal-700 hover:bg-teal-800 text-white">Continue</Button>
              : <Button onClick={submit} className="rounded-full bg-teal-700 hover:bg-teal-800 text-white">Finish & enter dashboard</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
