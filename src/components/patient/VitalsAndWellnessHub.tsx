import React, { useState } from "react";
import {
  HeartPulse,
  Activity,
  Droplets,
  Sparkles,
  Watch,
  Flame,
  FileDown,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Shield,
  Smile,
  Zap,
  Footprints,
  Clock
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { WearablesManager } from "./WearablesManager";
import { WellnessTracker } from "./WellnessTracker";

export function VitalsAndWellnessHub() {
  const [activeTab, setActiveTab] = useState<"vitals" | "wellness" | "dossier">("vitals");

  const handleExportDossier = () => {
    const reportData = {
      report_title: "Silent Guardian · Consolidated Biometric & Wellness Report",
      generated_at: new Date().toISOString(),
      patient_profile: {
        id: "SG-USR-9482",
        category: "Continuous Wearable & Wellness Telemetry",
        dpdp_compliance: "Section 9 Compliant · AES-256 Encrypted",
      },
      vitals_summary: {
        current_pulse_bpm: 72,
        resting_hr_bpm: 62,
        peak_hr_bpm: 138,
        spo2_percent: 98.4,
        blood_pressure: "118/76 mmHg",
        hrv_rmssd_ms: 64,
        skin_temperature_c: 36.6,
        autonomic_stress_index: "18 / 100 (Calm)",
      },
      wellness_summary: {
        steps_today: 7856,
        daily_goal: 10000,
        distance_km: 5.8,
        active_minutes: 52,
        hydration_glasses: "6 / 8 glasses (1500 ml)",
        wellness_streak_days: 7,
        mindfulness_completed: "4-7-8 Deep Relaxation Breathing",
        mobility_completed: "Morning Spinal Stretch & Posture Reset",
      },
      clinical_recommendations: [
        "Cardiovascular rhythm within normal sinus variation (52 - 138 BPM span).",
        "Pedometer cadence indicates healthy aerobic movement frequency.",
        "Hydration adherence maintained above 75% daily target.",
        "Recommended checkup: Annual routine preventive screening in 6 months."
      ]
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SilentGuardian_Vitals_Wellness_Report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Consolidated Vitals & Wellness Clinical Dossier exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Unified Master Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Combined Biometric & Preventive Health System
              </span>
              <span className="text-xs text-teal-200">
                Continuous 24h Vitals + Daily Preventive Habits
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
              <HeartPulse className="w-8 h-8 text-emerald-400" />
              Vitals & Wellness Ecosystem
            </h1>
            <p className="mt-2 text-teal-100/90 text-sm leading-relaxed">
              Your consolidated health command center. Seamlessly monitor live physiological signals from connected wearables, review 24-hour heart rate rhythms, predict automated step cadence from phone motion, and log daily hydration, mindfulness, and healthy habits in one unified space.
            </p>
          </div>

          {/* Holistic Health Score Meter */}
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 z-10 shadow-lg">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-display font-extrabold text-lg text-white">94</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                Holistic Health Score
              </span>
              <span className="text-sm font-bold text-white">Optimal Condition</span>
              <span className="text-[11px] text-teal-200 block">Vitals + Habits Synchronized</span>
            </div>
          </div>
        </div>

        {/* Ambient Neon Glow */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unified Tab Switcher Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("vitals")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "vitals"
                ? "bg-teal-700 text-white shadow-md shadow-teal-900/20 ring-2 ring-teal-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Watch size={15} className={activeTab === "vitals" ? "text-teal-200" : "text-slate-400"} />
            <span>Real-Time Vitals & 24h Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab("wellness")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "wellness"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Droplets size={15} className={activeTab === "wellness" ? "text-emerald-200" : "text-slate-400"} />
            <span>Daily Wellness & Preventive Habits</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dossier"
                ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-700/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileDown size={15} className={activeTab === "dossier" ? "text-slate-300" : "text-slate-400"} />
            <span>Consolidated Biometric Dossier</span>
          </button>
        </div>

        <div className="pr-1">
          <Button
            size="sm"
            onClick={handleExportDossier}
            variant="outline"
            className="text-xs font-semibold text-slate-700 hover:text-teal-800 border-slate-200 rounded-xl"
          >
            <FileDown size={14} className="mr-1.5 text-teal-600" />
            Export Clinical JSON
          </Button>
        </div>
      </div>

      {/* Main Tab View Contents */}
      {activeTab === "vitals" && (
        <div className="space-y-6">
          <WearablesManager />
        </div>
      )}

      {activeTab === "wellness" && (
        <div className="space-y-6">
          <WellnessTracker />
        </div>
      )}

      {activeTab === "dossier" && (
        <div className="space-y-6">
          {/* Consolidated Biometric Summary View */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-display text-slate-900">
                    Comprehensive Health & Biometric Summary
                  </h3>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] font-bold">
                    NABH & DPDP Standard
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-referenced from active continuous BLE sensors, phone accelerometer cadence, and daily logged lifestyle habits.
                </p>
              </div>

              <Button
                onClick={handleExportDossier}
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                <FileDown size={14} className="mr-1.5" />
                Download Report (.JSON)
              </Button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resting Heart Rate</span>
                <span className="text-2xl font-black text-slate-900 font-display">62 BPM</span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Normal Sinus Rhythm</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Oxygen SpO2</span>
                <span className="text-2xl font-black text-slate-900 font-display">98.4%</span>
                <span className="text-[11px] text-sky-600 font-semibold block mt-0.5">Optimal Saturation</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Step Cadence</span>
                <span className="text-2xl font-black text-slate-900 font-display">7,856</span>
                <span className="text-[11px] text-teal-600 font-semibold block mt-0.5">79% of 10k Goal &bull; 5.8 km</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Hydration Intake</span>
                <span className="text-2xl font-black text-slate-900 font-display">6 / 8</span>
                <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">1,500 ml Logged</span>
              </div>
            </div>

            {/* Clinical Comparison Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Biometric Parameter</th>
                    <th className="py-3 px-4">Recorded Value</th>
                    <th className="py-3 px-4">Reference Standard</th>
                    <th className="py-3 px-4">Clinical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Heart Rate (Resting)</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">62 BPM</td>
                    <td className="py-3 px-4 text-slate-500">60 - 100 BPM (AHA Standard)</td>
                    <td className="py-3 px-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Blood Pressure</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">118 / 76 mmHg</td>
                    <td className="py-3 px-4 text-slate-500">&lt;120 / &lt;80 mmHg</td>
                    <td className="py-3 px-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Normotensive</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Blood Oxygen Saturation (SpO2)</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">98.4%</td>
                    <td className="py-3 px-4 text-slate-500">95% - 100%</td>
                    <td className="py-3 px-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Excellent</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Heart Rate Variability (HRV RMSSD)</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">64 ms</td>
                    <td className="py-3 px-4 text-slate-500">&gt;45 ms for age bracket</td>
                    <td className="py-3 px-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">High Recovery</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Autonomic Stress Index</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">18 / 100</td>
                    <td className="py-3 px-4 text-slate-500">&lt;35 (Zone 1 Low Stress)</td>
                    <td className="py-3 px-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Relaxed</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Daily Physical Activity Cadence</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">7,856 Steps (5.8 km)</td>
                    <td className="py-3 px-4 text-slate-500">10,000 steps / 60 active mins</td>
                    <td className="py-3 px-4"><span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">79% Achieved</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Doctor Note Advice Box */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs space-y-2">
              <span className="font-bold text-sm block text-teal-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Telemedicine Consultation Guidance
              </span>
              <p className="leading-relaxed text-teal-800">
                This report consolidates continuous Holter-grade metrics from paired devices and can be presented during physical examinations or telemedicine consultations. No critical cardiac arrhythmias or hypertensive surges were identified over the 24-hour monitoring interval.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
