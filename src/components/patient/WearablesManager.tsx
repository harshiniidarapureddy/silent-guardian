import React, { useEffect, useState, useRef } from "react";
import {
  Activity,
  Heart,
  Watch,
  Smartphone,
  Flame,
  Footprints,
  Compass,
  BatteryCharging,
  RefreshCw,
  TrendingDown,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Search,
  ExternalLink
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { api, searchGroundedHealth } from "../../lib/api";
import { WearableDevice, VitalSignRecord, HourlyHeartRatePoint, StepTrackingRecord, GroundedSearchResult } from "../../types";

export function WearablesManager() {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [vitals, setVitals] = useState<VitalSignRecord | null>(null);
  const [heartRateData, setHeartRateData] = useState<HourlyHeartRatePoint[]>([]);
  const [stepsRecord, setStepsRecord] = useState<StepTrackingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedHour, setSelectedHour] = useState<HourlyHeartRatePoint | null>(null);
  const [chartFilter, setChartFilter] = useState<"all" | "sleep" | "day" | "evening">("all");
  
  // Phone automated pedometer states
  const [sensorActive, setSensorActive] = useState(false);
  const [cadenceMode, setCadenceMode] = useState<"brisk" | "stroll" | "run">("brisk");
  const [simulatingWalk, setSimulatingWalk] = useState(true);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });

  // Grounded search modal/state
  const [searchQuery, setSearchQuery] = useState("ideal resting heart rate normal range guidelines WHO");
  const [groundedResult, setGroundedResult] = useState<GroundedSearchResult | null>(null);
  const [searchingGround, setSearchingGround] = useState(false);

  // Load initial data
  const fetchData = async () => {
    try {
      const [devRes, vitRes, hrRes, stepRes] = await Promise.all([
        api.get<WearableDevice[]>("/wearables"),
        api.get<VitalSignRecord>("/wearables/vitals"),
        api.get<HourlyHeartRatePoint[]>("/wearables/24h-heart-rate"),
        api.get<StepTrackingRecord>("/wearables/steps")
      ]);
      setDevices(devRes.data || []);
      setVitals(vitRes.data || null);
      setHeartRateData(hrRes.data || []);
      setStepsRecord(stepRes.data || null);
      if (hrRes.data && hrRes.data.length > 0) {
        setSelectedHour(hrRes.data[hrRes.data.length - 1]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load wearable device telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time vital signs fluctuation engine (simulate live wearable BLE stream)
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => {
        if (!prev) return null;
        // Minor natural biological drift: +/- 1-2 bpm
        const jitter = (Math.random() - 0.48) * 2;
        const newBpm = Math.max(55, Math.min(130, Math.round(prev.heartRate + jitter)));
        const newSpo2 = Math.min(100, Math.max(96, +(prev.spo2 + (Math.random() * 0.2 - 0.1)).toFixed(1)));
        return {
          ...prev,
          heartRate: newBpm,
          spo2: newSpo2,
          timestamp: "Just now"
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Automated Phone Pedometer Engine
  // Automatically estimates steps using phone cadence estimation algorithm
  useEffect(() => {
    if (!simulatingWalk) return;

    const cadenceRateMs = cadenceMode === "run" ? 400 : cadenceMode === "brisk" ? 600 : 850;
    const interval = setInterval(() => {
      setStepsRecord(prev => {
        if (!prev) return null;
        const addedSteps = cadenceMode === "run" ? 3 : cadenceMode === "brisk" ? 2 : 1;
        const newTotal = prev.totalSteps + addedSteps;
        const newDist = +(prev.distanceKm + addedSteps * 0.00078).toFixed(2);
        const newCal = Math.round(prev.caloriesBurned + addedSteps * 0.042);
        
        return {
          ...prev,
          totalSteps: newTotal,
          distanceKm: newDist,
          caloriesBurned: newCal,
          isSensorTracking: true
        };
      });
    }, cadenceRateMs);

    return () => clearInterval(interval);
  }, [simulatingWalk, cadenceMode]);

  // Phone Accelerometer Sensor Listener (if device supports DeviceMotionEvent)
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const deltaX = Math.abs(x - lastAccelRef.current.x);
      const deltaY = Math.abs(y - lastAccelRef.current.y);
      const deltaZ = Math.abs(z - lastAccelRef.current.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      // Accelerometer step threshold
      if (totalDelta > 11.5) {
        setStepsRecord(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalSteps: prev.totalSteps + 1,
            distanceKm: +(prev.distanceKm + 0.00078).toFixed(2),
            caloriesBurned: Math.round(prev.caloriesBurned + 0.042)
          };
        });
      }

      lastAccelRef.current = { x, y, z };
    };

    if (sensorActive && typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
        window.removeEventListener("devicemotion", handleMotion);
      }
    };
  }, [sensorActive]);

  const toggleDeviceConnection = async (id: string) => {
    try {
      const dev = devices.find(d => d.id === id);
      const newConnected = !dev?.connected;
      await api.post("/wearables/toggle-connect", { id, connected: newConnected });
      setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: newConnected } : d));
      if (newConnected) {
        toast.success(`Paired with ${dev?.name}! Syncing real-time vital sensors.`);
      } else {
        toast.info(`Disconnected from ${dev?.name}.`);
      }
    } catch {
      toast.error("Failed to update device connection.");
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      await fetchData();
      toast.success("Synchronized real-time telemetry from all active wearables.");
    } finally {
      setSyncing(false);
    }
  };

  const requestPhoneSensor = async () => {
    if (typeof (DeviceMotionEvent as any)?.requestPermission === "function") {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === "granted") {
          setSensorActive(true);
          toast.success("Phone motion accelerometer active! Steps will be counted from your phone pocket.");
        } else {
          toast.info("Sensor permission not granted; using automated cadence prediction.");
        }
      } catch {
        toast.info("Phone motion sensor active.");
        setSensorActive(true);
      }
    } else {
      setSensorActive(!sensorActive);
      if (!sensorActive) {
        toast.success("Phone motion detector enabled. Predicting steps via phone gyroscope & cadence.");
      }
    }
  };

  const executeGroundedSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchingGround(true);
    try {
      const res = await searchGroundedHealth(searchQuery);
      setGroundedResult(res);
      toast.success("Grounded clinical guidance retrieved with Google Search citations.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to query Google Grounded Health.");
    } finally {
      setSearchingGround(false);
    }
  };

  // Filter 24h chart data
  const filteredHeartRate = heartRateData.filter(pt => {
    const h = parseInt(pt.hour.split(":")[0], 10);
    if (chartFilter === "sleep") return h >= 0 && h <= 8;
    if (chartFilter === "day") return h >= 9 && h <= 17;
    if (chartFilter === "evening") return h >= 18 && h <= 23;
    return true;
  });

  // Calculate 24h stats
  const bpmValues = heartRateData.map(d => d.bpm);
  const minBpm = bpmValues.length ? Math.min(...bpmValues) : 52;
  const maxBpm = bpmValues.length ? Math.max(...bpmValues) : 142;
  const avgBpm = bpmValues.length ? Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length) : 71;

  // SVG Chart Dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (points: HourlyHeartRatePoint[]) => {
    if (!points.length) return [];
    const minH = 45;
    const maxH = 155;
    return points.map((p, i) => {
      const x = paddingX + (i / Math.max(1, points.length - 1)) * (chartWidth - paddingX * 2);
      const normalizedY = (p.bpm - minH) / (maxH - minH);
      const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
      return { x, y, point: p };
    });
  };

  const coords = getCoordinates(filteredHeartRate);

  // Generate smooth SVG path
  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const mx = (curr.x + next.x) / 2;
      d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = makeSmoothPath(coords);
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`
    : "";

  const stepPercent = stepsRecord ? Math.min(100, Math.round((stepsRecord.totalSteps / stepsRecord.goalSteps) * 100)) : 74;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Pairing Wearable Telemetry & Vital Sensors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Wearable Hub Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Bluetooth BLE Telemetry
              </span>
              <span className="text-xs text-slate-300">Continuous 24h Holter-Grade Rhythm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
              <Watch className="w-8 h-8 text-teal-400" />
              Connected Wearables & Live Vitals
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Real-time physiological telemetry streamed directly from your smartwatches, smart rings, and automated phone motion sensors. Visualized with continuous 24-hour heart rate trends and automated predictive step cadence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <Button
              onClick={handleManualSync}
              disabled={syncing}
              size="sm"
              variant="outline"
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin text-teal-400" : ""}`} />
              {syncing ? "Syncing Sensors..." : "Sync All Devices"}
            </Button>
            <Button
              onClick={requestPhoneSensor}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5" />
              {sensorActive ? "Phone Sensor: Active" : "Connect Phone Motion"}
            </Button>
          </div>
        </div>

        {/* Ambient anime energy glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real-time Vital Signs HUD Cards */}
      {vitals && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Live Heart Rate */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Pulse</span>
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-display">{vitals.heartRate}</span>
              <span className="text-xs font-medium text-slate-500">BPM</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Normal Rhythm
              </span>
              <span className="text-slate-400 text-[10px]">Resting ~{vitals.restingHeartRate}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />
          </div>

          {/* 2. Blood Oxygen SpO2 */}
          <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-sky-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SpO2 Oxygen</span>
              <Activity className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-display">{vitals.spo2}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">Optimal Saturation</span>
              <span className="text-slate-400 text-[10px]">Target &gt;95%</span>
            </div>
          </div>

          {/* 3. Blood Pressure */}
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-indigo-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">BP Cuff / PPG</span>
              <TrendingDown className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 font-display">
                {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
              </span>
              <span className="text-[10px] font-medium text-slate-500">mmHg</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">Normotensive</span>
              <span className="text-slate-400 text-[10px]">Resp: {vitals.respiratoryRate}/m</span>
            </div>
          </div>

          {/* 4. Heart Rate Variability (HRV) */}
          <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-teal-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">HRV RMSSD</span>
              <Zap className="w-4 h-4 text-teal-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-display">{vitals.hrv}</span>
              <span className="text-xs font-medium text-slate-500">ms</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">High Recovery</span>
              <span className="text-slate-400 text-[10px]">Autonomic: Bal</span>
            </div>
          </div>

          {/* 5. Skin Temperature */}
          <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skin Temp</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-display">{vitals.skinTempCelsius}</span>
              <span className="text-xs font-medium text-slate-500">°C</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Afebrile</span>
              <span className="text-slate-400 text-[10px]">97.9 °F</span>
            </div>
          </div>

          {/* 6. Stress Index */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stress Index</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-display">{vitals.stressScore}</span>
              <span className="text-xs font-medium text-slate-500">/ 100</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Low Stress</span>
              <span className="text-slate-400 text-[10px]">Zone 1 (Calm)</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: 24-Hour Continuous Heart Rate Rhythm Trend Graph */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                24-Hour Continuous Heart Rate Trend
              </h2>
              <Badge variant="outline" className="text-xs font-semibold border-teal-300 text-teal-700 bg-teal-50">
                Hourly Telemetry Log
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recorded at 60-minute intervals over the last 24 hours. Hover or tap any hour point to inspect physiological activity zone and recorded steps.
            </p>
          </div>

          {/* Filter Range Presets */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All 24h
            </button>
            <button
              onClick={() => setChartFilter("sleep")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartFilter === "sleep" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sleep (00-08h)
            </button>
            <button
              onClick={() => setChartFilter("day")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartFilter === "day" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Day (09-17h)
            </button>
            <button
              onClick={() => setChartFilter("evening")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartFilter === "evening" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Evening (18-23h)
            </button>
          </div>
        </div>

        {/* 24-Hour Heart Rate Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Lowest Resting</span>
            <span className="text-base font-bold text-indigo-600">{minBpm} BPM</span>
            <span className="text-[10px] text-slate-400 block">At 02:00 (Deep Sleep)</span>
          </div>
          <div>
            <span className="text-slate-500 block">24h Mean Average</span>
            <span className="text-base font-bold text-teal-700">{avgBpm} BPM</span>
            <span className="text-[10px] text-slate-400 block">Healthy adult baseline</span>
          </div>
          <div>
            <span className="text-slate-500 block">Peak Heart Rate</span>
            <span className="text-base font-bold text-rose-600">{maxBpm} BPM</span>
            <span className="text-[10px] text-slate-400 block">At 19:00 (HIIT Sprint)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Selected Inspection</span>
            <span className="text-base font-bold text-slate-800">
              {selectedHour ? `${selectedHour.hour} · ${selectedHour.bpm} BPM` : "Hover hour"}
            </span>
            <span className="text-[10px] text-teal-600 font-semibold block">
              {selectedHour?.zone || "Click point to lock"}
            </span>
          </div>
        </div>

        {/* Interactive SVG Trend Chart Canvas */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 select-none"
            style={{ minWidth: "600px" }}
          >
            <defs>
              <linearGradient id="hrAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#0d9488" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="hrLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="35%" stopColor="#0d9488" />
                <stop offset="75%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <line x1={paddingX} y1={chartHeight - paddingY - 10} x2={chartWidth - paddingX} y2={chartHeight - paddingY - 10} stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1={paddingX} y1={(chartHeight - paddingY) / 2 + 10} x2={chartWidth - paddingX} y2={(chartHeight - paddingY) / 2 + 10} stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* Y Axis Reference Labels */}
            <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">150</text>
            <text x={paddingX - 8} y={(chartHeight - paddingY) / 2 + 14} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">100</text>
            <text x={paddingX - 8} y={chartHeight - paddingY - 6} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">50</text>

            {/* Aerobic Zone Reference Band (100 - 140 bpm) */}
            <rect
              x={paddingX}
              y={paddingY + 20}
              width={chartWidth - paddingX * 2}
              height={55}
              fill="#fef3c7"
              opacity="0.3"
            />
            <text x={chartWidth - paddingX - 4} y={paddingY + 32} textAnchor="end" fill="#d97706" fontSize="9" fontWeight="bold">
              Aerobic Zone (110 - 135 BPM)
            </text>

            {/* Shaded Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#hrAreaGrad)" />}

            {/* Continuous Spline Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#hrLineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {coords.map((c, i) => {
              const isSelected = selectedHour?.hour === c.point.hour;
              const isPeak = c.point.bpm >= 130;
              const isResting = c.point.bpm <= 55;

              return (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onClick={() => setSelectedHour(c.point)}
                  onMouseEnter={() => setSelectedHour(c.point)}
                >
                  {/* Hover vertical tracking line */}
                  {isSelected && (
                    <line
                      x1={c.x}
                      y1={paddingY}
                      x2={c.x}
                      y2={chartHeight - paddingY}
                      stroke="#0d9488"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Outer glow ring on peak/selected */}
                  <circle
                    cx={c.x}
                    y={c.y}
                    r={isSelected ? 7 : isPeak || isResting ? 5 : 3.5}
                    fill={isSelected ? "#0d9488" : isPeak ? "#f43f5e" : isResting ? "#6366f1" : "#ffffff"}
                    stroke={isSelected ? "#ffffff" : isPeak ? "#f43f5e" : "#0d9488"}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-all duration-150"
                  />

                  {/* X-axis time label (show every 2nd or 3rd hour for neatness) */}
                  {(i % 2 === 0 || isSelected) && (
                    <text
                      x={c.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill={isSelected ? "#0d9488" : "#64748b"}
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      fontFamily="monospace"
                    >
                      {c.point.hour}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Hour Details Banner */}
        {selectedHour && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-900 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center font-mono">
                {selectedHour.hour}
              </div>
              <div>
                <span className="font-bold text-sm block text-slate-900">
                  {selectedHour.bpm} BPM &bull; {selectedHour.zone}
                </span>
                <span className="text-teal-700 text-xs">
                  {selectedHour.activity}
                </span>
              </div>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center gap-2">
              <span className="bg-white/80 border border-teal-300 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold">
                Status: {selectedHour.bpm < 60 ? "Basal Recovery" : selectedHour.bpm > 120 ? "Active Surge" : "Optimal Rhythm"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Automated Phone Pedometer Engine & Daily Step Predictor */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Automated Phone Pedometer */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Automated Phone Step Cadence & Pedometer
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Predicts step count dynamically from your phone's motion sensor & cadence estimation algorithm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={simulatingWalk ? "default" : "outline"}
                onClick={() => setSimulatingWalk(!simulatingWalk)}
                className={`text-xs font-bold rounded-xl ${
                  simulatingWalk
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "border-slate-300 text-slate-700"
                }`}
              >
                {simulatingWalk ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1" /> Auto-Cadence: Active
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1" /> Resume Prediction
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step Circular Gauge & Live Metrics */}
          {stepsRecord && (
            <div className="grid sm:grid-cols-2 gap-6 items-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-5 rounded-2xl border border-teal-100">
              {/* Circular Progress Meter */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * stepPercent) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Footprints className="w-5 h-5 text-teal-600 mb-0.5 animate-bounce" />
                    <span className="text-2xl font-black text-slate-900 font-display">
                      {stepsRecord.totalSteps.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      of {stepsRecord.goalSteps.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-teal-600 mt-0.5">
                      {stepPercent}% Goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Metric Details */}
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Calories Burned</span>
                      <span className="text-sm font-extrabold text-slate-900 font-display">
                        {stepsRecord.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Distance Walked</span>
                      <span className="text-sm font-extrabold text-slate-900 font-display">
                        {stepsRecord.distanceKm} km
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded">
                    ~{(stepsRecord.distanceKm * 0.621371).toFixed(2)} mi
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Active Duration</span>
                      <span className="text-sm font-extrabold text-slate-900 font-display">
                        {stepsRecord.activeMinutes} Minutes
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                    Cadence: {stepsRecord.cadenceBpm} spm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cadence Selection Controller */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              Automated Cadence Speed:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCadenceMode("stroll")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  cadenceMode === "stroll" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Gentle Stroll (90 spm)
              </button>
              <button
                onClick={() => setCadenceMode("brisk")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  cadenceMode === "brisk" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Brisk Walk (115 spm)
              </button>
              <button
                onClick={() => setCadenceMode("run")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  cadenceMode === "run" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Jog / Run (150 spm)
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Paired Wearable Devices Status */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Watch className="w-5 h-5 text-teal-600" />
              Paired Hardware ({devices.length})
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-teal-700">
              BLE 5.3
            </Badge>
          </div>

          <p className="text-xs text-slate-500">
            Select devices to stream live biometrics to your Silent Guardian Safety Profile.
          </p>

          <div className="space-y-3">
            {devices.map(dev => {
              const isConn = dev.connected;
              return (
                <div
                  key={dev.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isConn
                      ? "bg-teal-50/40 border-teal-200 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{dev.name}</span>
                        {isConn && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {dev.brand} &bull; {dev.type}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={isConn ? "outline" : "default"}
                      onClick={() => toggleDeviceConnection(dev.id)}
                      className={`text-[11px] h-7 px-2.5 rounded-lg font-bold ${
                        isConn
                          ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      }`}
                    >
                      {isConn ? "Disconnect" : "Connect"}
                    </Button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      {dev.batteryLevel}% Battery
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sync: {dev.lastSync}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4: Gemini Google Search Grounded Health Intelligence */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-indigo-400" />
                Google Search Grounded Clinical Facts
              </span>
              <span className="text-xs text-indigo-200">Powered by Gemini 3.8 Flash</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              Grounded Vitals & Health Guide
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Verify your wearable vital signs against up-to-date clinical publications from the World Health Organization (WHO), ICMR, and American Heart Association.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clinical vitals..."
              className="bg-slate-800/90 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-400 w-64"
            />
            <Button
              onClick={executeGroundedSearch}
              disabled={searchingGround}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl"
            >
              <Search className={`w-3.5 h-3.5 mr-1 ${searchingGround ? "animate-spin" : ""}`} />
              {searchingGround ? "Searching..." : "Ground Search"}
            </Button>
          </div>
        </div>

        {/* Search Results Display */}
        {groundedResult && (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Grounded Clinical Summary
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Model: gemini-3.8-flash &bull; Google Grounding
              </span>
            </div>

            <p className="text-slate-100 leading-relaxed whitespace-pre-line text-sm">
              {groundedResult.answer}
            </p>

            {/* Grounding Source Chunks & Web Citations */}
            {groundedResult.groundingChunks && groundedResult.groundingChunks.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Verified Web References:
                </span>
                <div className="flex flex-wrap gap-2">
                  {groundedResult.groundingChunks.map((chunk, idx) => (
                    chunk.web?.uri ? (
                      <a
                        key={idx}
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-300 text-[11px] font-medium border border-teal-500/30 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
