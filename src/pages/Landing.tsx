import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, Heart, Siren, Hospital, Users, Globe, Activity, HeartPulse, Pill, Phone, ArrowRight, CheckCircle2, Lock } from "lucide-react";

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 px-5 py-4 shadow-sm">
    <div className="text-xs uppercase tracking-[0.18em] font-bold text-teal-700">{label}</div>
    <div className="text-2xl font-extrabold text-slate-900 mt-1 font-display tabular-nums">{value}</div>
  </div>
);

const Feature = ({ icon: Icon, title, text }: { icon: any; title: string; text: string }) => (
  <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
      <Icon size={22} />
    </div>
    <h3 className="font-display font-semibold text-lg text-slate-900 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-sm">
              <Shield className="text-white" size={18} />
            </div>
            <div>
              <div className="font-display font-extrabold text-slate-900 leading-tight">Silent Guardian</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-teal-700 -mt-0.5">Healthcare Safety Net</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/patient">
              <Button variant="ghost" className="rounded-full text-slate-700 hover:text-teal-800">
                Patient Portal
              </Button>
            </Link>
            <Link to="/hospital">
              <Button variant="ghost" className="rounded-full text-slate-700 hover:text-amber-800">
                Hospital Command
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="rounded-full text-slate-700 hover:text-slate-900">
                Admin Console
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 sg-grid-bg opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 sg-fade-in">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                AI Triage · 500+ Hospitals · 5 Languages · Live Emergency Fleet
              </div>
              <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                A quiet guardian for every <span className="text-teal-700">health decision</span>.
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connect instantly to clinical AI triage, real-time emergency bed capacity, rapid blood donation alerts, and localized health awareness video guides in your mother tongue.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link to="/patient/triage">
                  <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-12 px-7 text-base shadow-sm">
                    Open AI Triage
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/patient/alerts">
                  <Button variant="outline" className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 h-12 px-6 text-base">
                    <Siren size={18} className="mr-2" />
                    Emergency SOS
                  </Button>
                </Link>
                <Link to="/patient/awareness">
                  <Button variant="ghost" className="rounded-full text-slate-700 h-12 px-5">
                    <Globe size={18} className="mr-2 text-teal-600" />
                    Multilingual Videos
                  </Button>
                </Link>
              </div>

              {/* Safety Badges */}
              <div className="mt-10 pt-8 border-t border-slate-200/80 flex flex-wrap gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>520 Verified Clinics & Hospitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Zero-delay Triage Algorithm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Verified Blood Donor Network</span>
                </div>
              </div>
            </div>

            {/* Right KPI Card */}
            <div className="lg:col-span-5 sg-fade-in">
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Health Network</span>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                    24/7 Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 my-5">
                  <StatPill label="Hospitals Active" value="520+" />
                  <StatPill label="Available ICU Beds" value="480+" />
                  <StatPill label="Patient Triage Runs" value="2,400+" />
                  <StatPill label="Ambulance Fleet" value="1,150+" />
                </div>

                <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <Lock size={12} className="text-teal-400" />
                      Secure Portal Gateways
                    </div>
                    <span className="text-[10px] text-teal-400 font-mono">2FA / Manual Auth</span>
                  </div>
                  <p className="text-xs text-slate-300">Sign in with registered credentials to access your dedicated portal:</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Link to="/auth?role=patient" className="text-center py-2 px-1 text-xs font-medium rounded-xl bg-teal-700/80 hover:bg-teal-700 text-white transition-all shadow-sm">
                      Patient Login
                    </Link>
                    <Link to="/auth?role=hospital" className="text-center py-2 px-1 text-xs font-medium rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white transition-all shadow-sm">
                      Hospital Login
                    </Link>
                    <Link to="/auth?role=admin" className="text-center py-2 px-1 text-xs font-medium rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white transition-all shadow-sm">
                      Admin Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900">Comprehensive Safety Architecture</h2>
          <p className="text-slate-600 mt-2 text-sm">Designed for zero-delay intervention when health challenges occur.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={Activity}
            title="AI Health Triage"
            text="Gently evaluates symptoms, highlights critical escalations (stroke, heart attack), suggests appropriate medical specialists, and safe home remedies."
          />
          <Feature
            icon={Hospital}
            title="Real-Time Hospital Beds"
            text="Instant live tracking across 520+ hospitals for ICU, Emergency Room, and Ventilator bed availability before dispatch."
          />
          <Feature
            icon={Globe}
            title="Multilingual Video Guides"
            text="Interactive step-by-step video instructions in English, Hindi, Telugu, Tamil, and Spanish for CPR, burns, and heart attack first aid."
          />
          <Feature
            icon={Heart}
            title="Emergency Blood Network"
            text="Direct community donor alerts with blood group matching, emergency unit count, and direct hospital contact coordinates."
          />
          <Feature
            icon={Siren}
            title="Immediate SOS Dispatch"
            text="One-touch distress alerts broadcasting GPS location, medical history, and guardian contact directly to emergency responders."
          />
          <Feature
            icon={Pill}
            title="500+ Medicine Guide"
            text="Verified clinical drug catalog with usage guidelines, proper dosages, side effect disclosures, and OTC vs prescription designations."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© 2026 Silent Guardian · Healthcare Safety Net. All medical triage is guidance and not a diagnostic substitute.</div>
          <div className="flex gap-4">
            <Link to="/patient" className="hover:text-slate-900">Patient</Link>
            <Link to="/hospital" className="hover:text-slate-900">Hospital</Link>
            <Link to="/admin" className="hover:text-slate-900">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
