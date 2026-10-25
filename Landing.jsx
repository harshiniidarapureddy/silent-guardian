import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, Heart, Siren, Hospital, Users, Globe, Activity, HeartPulse, Pill, Phone } from "lucide-react";

const StatPill = ({ label, value }) => (
  <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 px-5 py-4 shadow-sm">
    <div className="text-xs uppercase tracking-[0.18em] font-bold text-teal-700">{label}</div>
    <div className="text-2xl font-extrabold text-slate-900 mt-1 font-display">{value}</div>
  </div>
);

const Feature = ({ icon: Icon, title, text }) => (
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
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Shield className="text-white" size={18} />
            </div>
            <div>
              <div className="font-display font-extrabold text-slate-900">Silent Guardian</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-teal-700 -mt-0.5">Healthcare Safety Net</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="rounded-full">Sign in</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 sg-grid-bg opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 sg-fade-in">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                AI Triage · 5 Languages · 15 Verified Hospitals
              </div>
              <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                A quiet guardian for every <span className="text-teal-700">health decision</span>.
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
                An AI-powered healthcare triage and community safety net. Cautious symptom guidance, 
                nearest verified hospitals, blood donors on standby, and alerts to the people who matter — 
                in your own language.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth?mode=signup">
                  <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-7 h-12 text-base">
                    Start free · Patient
                  </Button>
                </Link>
                <Link to="/auth?role=hospital">
                  <Button variant="outline" className="rounded-full border-slate-300 h-12 px-6 text-base">
                    <Hospital size={18} className="mr-2" />Hospital Portal
                  </Button>
                </Link>
                <Link to="/auth?role=admin">
                  <Button variant="ghost" className="rounded-full h-12 px-6 text-base text-slate-700">
                    Admin Login
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatPill label="Patients" value="320+" />
                <StatPill label="Hospitals" value="15" />
                <StatPill label="Languages" value="5" />
                <StatPill label="Articles" value="25+" />
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                <img src="https://images.unsplash.com/photo-1666887360921-85952a86894f?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" alt="Healthcare" className="w-full h-[480px] object-cover" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center sg-emergency-pulse">
                      <Siren size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-widest font-bold text-red-700">Live SOS</div>
                      <div className="text-sm text-slate-900 font-semibold truncate">O- blood needed · Apollo Super, Bengaluru</div>
                    </div>
                    <Phone className="text-teal-700" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
