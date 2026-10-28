import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, Hospital, UserCog, ArrowLeft, Check, AlertCircle, Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2 } from "lucide-react";
import { api, saveAuth } from "../lib/api";

const ROLE_META = {
  patient: {
    label: "Patient / Citizen",
    icon: Shield,
    badge: "Personal",
    hint: "Emergency SOS, multilingual CPR guides, AI symptom triage & donor network.",
    color: "teal"
  },
  hospital: {
    label: "Hospital Emergency Command",
    icon: Hospital,
    badge: "Clinical",
    hint: "ICU / Trauma bed telemetry, 500+ ambulance fleet dispatch & pharmacy.",
    color: "amber"
  },
  admin: {
    label: "Platform Security Admin",
    icon: UserCog,
    badge: "Enterprise",
    hint: "Two-factor verification, 150+ audit logs, NABH/HIPAA compliance & fraud defense.",
    color: "slate"
  },
};

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [role, setRole] = useState<'patient' | 'hospital' | 'admin'>((params.get("role") as any) || "patient");
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [busy, setBusy] = useState(false);

  // Real-time password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.hasUpperLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Strong", "Fortified"][strengthScore];
  const strengthColor = [
    "bg-slate-200 text-slate-500",
    "bg-red-500 text-red-700",
    "bg-amber-500 text-amber-700",
    "bg-blue-500 text-blue-700",
    "bg-emerald-500 text-emerald-700",
  ][strengthScore];

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long for clinical data security.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please verify both entries.");
        return;
      }
      if (!agreeTerms) {
        toast.error("Please agree to the emergency medical consent and DPDP security guidelines.");
        return;
      }
    }

    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload = mode === "signup"
        ? { email, password, phone, role, name: fullName.trim() || undefined }
        : { email, password };

      const { data } = await api.post(endpoint, payload);
      saveAuth(data.token, data.user);
      
      toast.success(
        mode === "signup"
          ? `Account created for ${data.user.preferred_name || data.user.email}!`
          : `Welcome back, ${data.user.preferred_name || data.user.email}!`
      );

      // Instant role-specific onboarding navigation
      if (data.user.role === "patient") {
        navigate(data.user.onboarded ? "/patient" : "/onboarding");
      } else if (data.user.role === "hospital") {
        navigate("/hospital");
      } else {
        navigate("/admin");
      }
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.detail || "Authentication failed. Please verify credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Brand Visual Column */}
      <div className="hidden lg:flex relative bg-slate-900 flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 sg-grid-bg opacity-20 pointer-events-none"></div>
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to safety net overview
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/50">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-xl leading-tight">Silent Guardian</div>
              <div className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">
                Zero-Latency Healthcare Safety Grid
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Integrated Emergency Response & Verification
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Healthcare access that never pauses.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Directly connect to 520+ verified trauma hospitals, 500+ real-time GPS ambulances, rare blood donors, and clinical AI awareness videos in 6 languages.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-300 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>520+ Hospital Bed Feeds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>500+ Ambulances Dispatched</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>Two-Factor Security & 2FA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>DPDP & HIPAA Compliance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <span>Enterprise Grade AES-256 Encryption</span>
          <span className="font-mono text-teal-400">v2.4.0 Secure Node</span>
        </div>
      </div>

      {/* Auth Form Column */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md sg-fade-in">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700">
              <ArrowLeft size={14} /> Back to Overview
            </Link>
            <span className="text-xs font-bold text-slate-700">Silent Guardian</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In to Portal
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create New Account
            </button>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {mode === "signup" ? "Register Your Clinical Account" : "Access Your Portal"}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              {mode === "signup"
                ? "Enter your details to initiate immediate access and safety net enrollment."
                : "Enter your registered credentials to sign in."}
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="mb-5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
              1. Select Access Level
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(ROLE_META) as [('patient' | 'hospital' | 'admin'), typeof ROLE_META['patient']][]).map(([k, m]) => {
                const Icon = m.icon;
                const isSelected = role === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRole(k)}
                    className={`rounded-xl border p-2.5 text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Icon size={18} className={isSelected ? "text-teal-700" : "text-slate-500"} />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-900 leading-tight">
                        {m.label.split('/')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 bg-slate-100/70 p-2 rounded-lg border border-slate-200/80">
              <strong className="text-slate-700 font-semibold">{ROLE_META[role].label}:</strong> {ROLE_META[role].hint}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-semibold text-slate-700">Full Legal Name</Label>
                <div className="relative mt-1">
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    required
                    placeholder={role === 'patient' ? "e.g. Ramesh Sharma" : role === 'hospital' ? "e.g. Dr. Ananya Sen (Medical Superintendent)" : "e.g. Security Admin Officer"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mobile Phone (Emergency SMS alerts)</Label>
                <div className="relative mt-1">
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Password</Label>
                {mode === "signup" && password && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${strengthColor}`}>
                    {strengthLabel}
                  </span>
                )}
              </div>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Meter for Signup */}
              {mode === "signup" && password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore <= 1 ? "bg-red-500" : strengthScore === 2 ? "bg-amber-500" : strengthScore === 3 ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.max(15, (strengthScore / 4) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-1">
                    <span className={`flex items-center gap-1 ${passwordCriteria.length ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                      {passwordCriteria.length ? "✓" : "○"} 8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasUpperLower ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                      {passwordCriteria.hasUpperLower ? "✓" : "○"} Upper & lowercase
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                      {passwordCriteria.hasNumber ? "✓" : "○"} At least 1 number
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                      {passwordCriteria.hasSpecial ? "✓" : "○"} Special symbol (!@#$)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <Label className="text-xs font-semibold text-slate-700">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-9 text-xs ${
                      passwordsMatch ? "border-emerald-500 focus:ring-emerald-500" : passwordMismatch ? "border-red-400 focus:ring-red-400" : ""
                    }`}
                  />
                  {passwordsMatch && (
                    <Check size={16} className="absolute right-3 top-2.5 text-emerald-600" />
                  )}
                </div>
                {passwordMismatch && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match yet
                  </p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  I consent to DPDP Act Section-9 medical data storage and allow verified emergency dispatchers to access my registered health info during code red emergencies.
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md transition-all mt-2"
            >
              {busy ? "Processing..." : mode === "signup" ? "Complete Registration & Launch" : "Sign In to Safety Grid"}
            </Button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              {mode === "signin" ? (
                <>
                  New to Silent Guardian?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    Create your account now
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    Sign in with existing credentials
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
