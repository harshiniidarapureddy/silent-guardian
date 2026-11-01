import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Shield, Hospital, UserCog, ArrowLeft, Check, AlertCircle, Eye, EyeOff,
  Lock, Mail, Phone, CheckCircle2, ArrowRight
} from "lucide-react";
import { api, saveAuth } from "../lib/api";

const ROLE_META = {
  patient: {
    label: "User / Citizen",
    icon: Shield,
    badge: "Personal",
    hint: "Emergency SOS, multilingual CPR guides, AI symptom triage & Guardian network.",
    color: "teal",
  },
  hospital: {
    label: "Hospital Emergency Command",
    icon: Hospital,
    badge: "Clinical",
    hint: "ICU / Trauma bed telemetry, ambulance fleet dispatch & admission triage.",
    color: "amber",
  },
  admin: {
    label: "Platform Security Admin",
    icon: UserCog,
    badge: "Enterprise",
    hint: "Administrative audit logs, security analytics, and fraud defense.",
    color: "slate",
  },
};

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [role, setRole] = useState<'patient' | 'hospital' | 'admin'>((params.get("role") as any) || "patient");
  
  // Credentials
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Real-time password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 6,
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

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please verify both entries.");
        return;
      }
    } else {
      if (!password) {
        toast.error("Please enter your password.");
        return;
      }
    }

    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload = mode === "signup"
        ? {
            email: email.toLowerCase().trim(),
            password,
            phone: phone.trim() || undefined,
            role,
          }
        : { email: email.toLowerCase().trim(), password };

      const { data } = await api.post(endpoint, payload);
      saveAuth(data.token, data.user);
      
      if (mode === "signup") {
        if (data.user.role === "patient") {
          toast.success("Account created! Let's set up your clinical safety profile.");
          navigate("/onboarding");
        } else if (data.user.role === "hospital") {
          toast.success("Hospital command account created! Opening dashboard.");
          navigate("/hospital");
        } else {
          toast.success("Admin security account created! Opening console.");
          navigate("/admin");
        }
      } else {
        toast.success(`Welcome back! Signed in successfully.`);
        if (data.user.role === "patient") {
          if (data.user.onboarded) {
            navigate("/patient");
          } else {
            navigate("/onboarding");
          }
        } else if (data.user.role === "hospital") {
          navigate("/hospital");
        } else {
          navigate("/admin");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.detail || "Authentication failed. Please verify credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-slate-50">
      {/* Brand Visual Column */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-slate-900 flex-col justify-between p-10 text-white overflow-hidden">
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
              <div className="font-display font-bold text-xl leading-tight">Care Preempt</div>
              <div className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">
                Proactive Healthcare Safety Grid
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Proactive Emergency Care & AI Triage
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            Healthcare protection that acts before emergencies escalate.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Create your account with email and password. Citizens are guided through a personalized clinical intake, while hospital staff and administrators gain immediate portal access.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-300 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>520+ Hospital Bed Feeds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>Real-Time Blood Donor Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>Family Guardian SOS Beacons</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>Continuous Vitals Telemetry</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <span>Enterprise Grade AES-256 Encryption</span>
          <span className="font-mono text-teal-400">Care Preempt v3.0</span>
        </div>
      </div>

      {/* Auth Form Column */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg sg-fade-in py-6">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700">
              <ArrowLeft size={14} /> Back to Overview
            </Link>
            <span className="text-xs font-bold text-slate-700">Care Preempt</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
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
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
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
              {mode === "signup" ? "Create Your Care Preempt Account" : "Sign In to Care Preempt"}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              {mode === "signup"
                ? role === "patient"
                  ? "Sign up with email & password. You will complete your clinical intake profile right after."
                  : "Sign up with email & password to immediately access your institutional command dashboard."
                : "Enter your registered credentials to access your safety network dashboard."}
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="mb-5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
              Select Account Type
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
                    className={`rounded-xl border p-2.5 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
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
            
            {/* Email Address */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
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

            {/* Mobile Phone (Optional on Signup) */}
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mobile Phone (Emergency SMS)</Label>
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

            {/* Password Section */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Password *</Label>
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
                  placeholder={mode === "signup" ? "Create a password (min 6 characters)" : "Enter your password"}
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
                </div>
              )}
            </div>

            {/* Confirm Password for Signup */}
            {mode === "signup" && (
              <div>
                <Label className="text-xs font-semibold text-slate-700">Confirm Password *</Label>
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

            {/* Note on signup flow */}
            {mode === "signup" && role === "patient" && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800 flex items-start gap-2">
                <Shield size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <span>
                  After signing up, you will be guided step-by-step to enter your name, age, gender, language, location, blood group, first aid knowledge, guardian contact, and avatar.
                </span>
              </div>
            )}

            {mode === "signup" && role !== "patient" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <Hospital size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Institutional accounts ({role === "hospital" ? "Hospital Command" : "Security Admin"}) open their respective dashboard immediately upon account creation.
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md transition-all mt-3 cursor-pointer flex items-center justify-center gap-2"
            >
              {busy ? (
                "Processing..."
              ) : mode === "signup" ? (
                role === "patient" ? (
                  <>
                    <span>Sign Up & Continue to Profile Setup</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Sign Up & Open {role === "hospital" ? "Hospital Command" : "Admin Console"}</span>
                    <ArrowRight size={16} />
                  </>
                )
              ) : (
                "Sign In to Care Preempt"
              )}
            </Button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              {mode === "signin" ? (
                <>
                  New to Care Preempt?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2 cursor-pointer"
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
                    className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2 cursor-pointer"
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
