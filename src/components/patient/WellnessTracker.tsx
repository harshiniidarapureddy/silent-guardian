import React, { useState, useEffect } from "react";
import {
  Flame, Footprints, Droplets, HeartPulse, CheckCircle2, RotateCcw,
  Sparkles, Award, Play, Pause, Compass, Clock, Trophy, Plus, ShieldCheck, Sun, Moon
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface WellnessState {
  steps: number;
  waterGlasses: number;
  streakDays: number;
  completedActivities: string[];
  lastDate: string;
}

const DEFAULT_ACTIVITIES = [
  { id: "act-1", title: "Morning 5-Min Spinal Stretch & Posture Reset", category: "Mobility", time: "5 mins", points: 20 },
  { id: "act-2", title: "4-7-8 Deep Relaxation Breathing Exercise", category: "Mindfulness", time: "4 mins", points: 25 },
  { id: "act-3", title: "Post-Lunch 15-Minute Glucose Regulation Walk", category: "Cardio", time: "15 mins", points: 40 },
  { id: "act-4", title: "20-20-20 Digital Screen Eye Strain Break", category: "Eye Health", time: "2 mins", points: 15 },
  { id: "act-5", title: "Evening Screen Wind-Down & Sleep Preparation", category: "Sleep Hygiene", time: "20 mins", points: 30 },
];

export function WellnessTracker() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [state, setState] = useState<WellnessState>(() => {
    try {
      const saved = localStorage.getItem("sg_wellness_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastDate === todayStr) {
          return parsed;
        } else {
          // New day, preserve streak
          return {
            steps: 0,
            waterGlasses: 0,
            streakDays: (parsed.streakDays || 6) + 1,
            completedActivities: [],
            lastDate: todayStr
          };
        }
      }
    } catch {}
    return {
      steps: 6420,
      waterGlasses: 5,
      streakDays: 7,
      completedActivities: ["act-1", "act-4"],
      lastDate: todayStr
    };
  });

  const [isPedometerActive, setIsPedometerActive] = useState<boolean>(false);
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCountdown, setBreathCountdown] = useState<number>(4);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem("sg_wellness_data", JSON.stringify(state));
    } catch {}
  }, [state]);

  // Live Pedometer Ticker
  useEffect(() => {
    let timer: any = null;
    if (isPedometerActive) {
      timer = setInterval(() => {
        setState(prev => {
          const nextSteps = prev.steps + 2;
          if (nextSteps === 10000) {
            toast.success("🎉 Congratulations! You reached your 10,000 steps daily goal!");
          }
          return { ...prev, steps: nextSteps };
        });
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPedometerActive]);

  // 4-7-8 Breathing Cycle
  useEffect(() => {
    let timer: any = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathCountdown(prev => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [breathingActive, breathPhase]);

  const addSteps = (count: number) => {
    setState(prev => {
      const nextSteps = prev.steps + count;
      toast.success(`+${count} steps recorded!`);
      return { ...prev, steps: nextSteps };
    });
  };

  const drinkGlass = () => {
    if (state.waterGlasses < 8) {
      setState(prev => ({ ...prev, waterGlasses: prev.waterGlasses + 1 }));
      toast.success("Glass of water logged! Stay hydrated.");
    }
  };

  const resetWater = () => {
    setState(prev => ({ ...prev, waterGlasses: 0 }));
  };

  const toggleActivity = (id: string) => {
    setState(prev => {
      const exists = prev.completedActivities.includes(id);
      const next = exists
        ? prev.completedActivities.filter(a => a !== id)
        : [...prev.completedActivities, id];
      if (!exists) {
        toast.success("Activity completed! Wellness score boosted.");
      }
      return { ...prev, completedActivities: next };
    });
  };

  // Calculations
  const targetSteps = 10000;
  const stepPercent = Math.min(100, Math.round((state.steps / targetSteps) * 100));
  const caloriesBurned = Math.round(state.steps * 0.042);
  const distanceKm = (state.steps * 0.00078).toFixed(2);
  const activeMinutes = Math.round(state.steps / 105);

  return (
    <div className="space-y-6">
      {/* Top Banner with Streak & Vitals */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-amber-950 font-bold px-3 py-1 flex items-center gap-1.5 border-none">
                <Flame size={15} className="fill-amber-950" />
                {state.streakDays} Day Healthy Habit Streak!
              </Badge>
              <span className="text-xs text-teal-100 font-medium">Daily Target: 10,000 Steps</span>
            </div>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personal Wellness & Activity Command
            </h2>
            <p className="mt-2 text-teal-100 text-sm leading-relaxed">
              Maintain everyday mobility, cardiovascular resilience, and hydration. Clinical studies confirm that 8,000+ daily steps lower all-cause cardiac mortality by up to 51%.
            </p>
          </div>

          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-5 text-center shadow-inner">
            <div>
              <div className="text-xs uppercase text-teal-200 font-semibold">Streak</div>
              <div className="text-2xl font-extrabold font-display text-white mt-0.5">{state.streakDays} Days</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div>
              <div className="text-xs uppercase text-teal-200 font-semibold">Water</div>
              <div className="text-2xl font-extrabold font-display text-white mt-0.5">{state.waterGlasses * 250} ml</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div>
              <div className="text-xs uppercase text-teal-200 font-semibold">Burn</div>
              <div className="text-2xl font-extrabold font-display text-white mt-0.5">{caloriesBurned} kcal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Live Step Counter | 2. Hydration Logger */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Step Tracker (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Footprints size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live Pedometer & Daily Steps</h3>
                <p className="text-xs text-slate-500">Auto-tracking and manual step logging</p>
              </div>
            </div>
            <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-800 font-semibold text-xs">
              Goal: {targetSteps.toLocaleString()} steps
            </Badge>
          </div>

          {/* Step Count Progress Visualization */}
          <div className="grid sm:grid-cols-12 gap-6 items-center">
            {/* Circular Ring Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-slate-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-teal-600 transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * stepPercent) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-2xl font-extrabold font-display text-slate-900 tabular-nums">
                    {state.steps.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {stepPercent}% Goal
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="sm:col-span-7 grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Calories</div>
                <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">{caloriesBurned}</div>
                <div className="text-[10px] text-slate-500">kcal</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
                <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">{distanceKm}</div>
                <div className="text-[10px] text-slate-500">km</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Active Time</div>
                <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">{activeMinutes}</div>
                <div className="text-[10px] text-slate-500">mins</div>
              </div>
            </div>
          </div>

          {/* Interactive Step Incrementers */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSteps(100)}
                className="rounded-xl text-xs font-semibold hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
              >
                <Plus size={13} className="mr-1" />
                100 Steps
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSteps(500)}
                className="rounded-xl text-xs font-semibold hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
              >
                <Plus size={13} className="mr-1" />
                500 Steps Walk
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => setIsPedometerActive(!isPedometerActive)}
              className={`rounded-xl text-xs font-bold transition-all shadow-sm ${
                isPedometerActive
                  ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                  : "bg-teal-700 hover:bg-teal-800 text-white"
              }`}
            >
              {isPedometerActive ? (
                <>
                  <Pause size={13} className="mr-1.5" />
                  Live Pedometer Active...
                </>
              ) : (
                <>
                  <Play size={13} className="mr-1.5" />
                  Start Auto-Pedometer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hydration Tracker (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Droplets size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Hydration Intake</h3>
                  <p className="text-xs text-slate-500">Target: 8 Glasses (2,000 ml)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetWater}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs flex items-center gap-1"
                title="Reset water log"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Glasses Grid */}
            <div className="grid grid-cols-4 gap-3 my-6">
              {Array.from({ length: 8 }).map((_, i) => {
                const filled = i < state.waterGlasses;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i === state.waterGlasses - 1) {
                        setState(prev => ({ ...prev, waterGlasses: prev.waterGlasses - 1 }));
                      } else {
                        setState(prev => ({ ...prev, waterGlasses: i + 1 }));
                      }
                    }}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                      filled
                        ? "bg-sky-500 border-sky-600 text-white shadow-md shadow-sky-500/20 scale-102"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:border-sky-300"
                    }`}
                  >
                    <Droplets size={20} className={filled ? "fill-white" : ""} />
                    <span className="text-[10px] font-bold mt-1">250ml</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{state.waterGlasses * 250} ml consumed</span>
                <span className="text-slate-400 font-medium">{Math.round((state.waterGlasses / 8) * 100)}% of goal</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${(state.waterGlasses / 8) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={drinkGlass}
            disabled={state.waterGlasses >= 8}
            className="w-full mt-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11"
          >
            <Plus size={16} className="mr-1.5" />
            {state.waterGlasses >= 8 ? "Daily Goal Achieved! (2L)" : "Log 1 Glass (+250ml)"}
          </Button>
        </div>
      </div>

      {/* Daily Wellness Activities & 4-7-8 Breathing Guide */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Activities Checklist (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daily Clinical Wellness Checklist</h3>
                <p className="text-xs text-slate-500">Preventive rituals recommended by cardiology & neurology</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {state.completedActivities.length} of {DEFAULT_ACTIVITIES.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {DEFAULT_ACTIVITIES.map((act) => {
              const isDone = state.completedActivities.includes(act.id);
              return (
                <div
                  key={act.id}
                  onClick={() => toggleActivity(act.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDone
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-800"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isDone ? "bg-emerald-600 text-white" : "border-2 border-slate-300 text-transparent"
                    }`}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-teal-700">{act.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {act.time}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg flex-shrink-0">
                    +{act.points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive 4-7-8 Breathing Pacer (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HeartPulse size={18} className="text-teal-400" />
                <h4 className="font-bold text-sm text-white">4-7-8 Relaxation Breathing Pacer</h4>
              </div>
              <Badge variant="outline" className="text-teal-400 border-teal-500/40 text-[10px]">
                Vagus Nerve Reset
              </Badge>
            </div>

            <div className="py-8 flex flex-col items-center justify-center text-center">
              {/* Expanding & Contracting Pacer Circle */}
              <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? "border-teal-400 bg-teal-500/20 scale-110 shadow-xl shadow-teal-500/30"
                  : breathPhase === 'Hold'
                  ? "border-amber-400 bg-amber-500/20 scale-110 shadow-xl shadow-amber-500/30"
                  : "border-sky-400 bg-sky-500/20 scale-95"
              }`}>
                <div className="text-3xl font-extrabold font-display tabular-nums">
                  {breathCountdown}s
                </div>
                <div className="text-xs uppercase tracking-wider font-bold mt-1 text-teal-200">
                  {breathPhase}
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300 max-w-xs leading-relaxed">
                {breathPhase === 'Inhale' && "Inhale calmly through your nose for 4 seconds."}
                {breathPhase === 'Hold' && "Hold your breath steadily for 7 seconds."}
                {breathPhase === 'Exhale' && "Exhale slowly through your mouth for 8 seconds."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setBreathingActive(!breathingActive)}
            className={`w-full rounded-2xl font-bold h-11 transition-all ${
              breathingActive ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {breathingActive ? "Pause Breathing Session" : "Start Guided 4-7-8 Session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
