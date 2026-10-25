import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Shield, Hospital, UserCog } from "lucide-react";
import { api, saveAuth } from "../lib/api";

const ROLE_META = {
  patient: { label: "Patient", icon: Shield, hint: "AI triage, blood network, guardians." },
  hospital: { label: "Hospital Manager", icon: Hospital, hint: "Triage queue, beds, ambulances." },
  admin: { label: "Platform Admin", icon: UserCog, hint: "Verify facilities, feedback, fraud." },
};

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "signin");
  const [role, setRole] = useState(params.get("role") || "patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const quickFill = (r) => {
    if (r === "admin") { setEmail("admin@silentguardian.com"); setPassword("admin123"); setRole("admin"); setMode("signin"); }
    if (r === "patient") { setEmail("patient@demo.com"); setPassword("demo123"); setRole("patient"); setMode("signin"); }
    if (r === "hospital") { setEmail("hospital@demo.com"); setPassword("demo123"); setRole("hospital"); setMode("signin"); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload = mode === "signup" ? { email, password, phone, role } : { email, password };
      const { data } = await api.post(endpoint, payload);
      saveAuth(data.token, data.user);
      toast.success(mode === "signup" ? "Account created" : "Signed in");
      if (data.user.role === "patient") navigate(data.user.onboarded ? "/patient" : "/onboarding");
      else if (data.user.role === "hospital") navigate("/hospital");
      else navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-slate-900 flex flex-col justify-center items-center">
        <h2 className="text-white text-3xl font-bold p-10 text-center">Healthcare that waits for no one.</h2>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md sg-fade-in">
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {Object.entries(ROLE_META).map(([k, m]) => {
              const I = m.icon;
              return (
                <button
                  key={k}
                  onClick={() => setRole(k)}
                  className={`rounded-xl border p-3 text-left transition-all ${role === k ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500/20" : "bg-white border-slate-200"}`}
                >
                  <I size={18} className={role === k ? "text-teal-700" : "text-slate-500"} />
                  <div className="mt-1.5 text-xs font-semibold text-slate-900">{m.label}</div>
                </button>
              );
            })}
          </div>

          <Tabs value={mode} onValueChange={setMode} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                {mode === "signup" && (
                  <div>
                    <Label>Phone (optional)</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
                  </div>
                )}
                <div>
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                </div>
                <Button type="submit" disabled={busy} className="w-full h-11 rounded-full bg-teal-700 text-white">
                  {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Quick demo accounts</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => quickFill("patient")} className="text-xs bg-teal-50 text-teal-800 px-3 py-1.5 rounded-full">Patient demo</button>
              <button onClick={() => quickFill("hospital")} className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full">Hospital demo</button>
              <button onClick={() => quickFill("admin")} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
