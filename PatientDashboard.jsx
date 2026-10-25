import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { HeartPulse, Hospital, Globe, Siren, Heart, Pill, Activity, MessageCircle, Mic, Send, Phone, Star, MapPin, Users, ShieldAlert } from "lucide-react";
import DashShell from "../components/DashShell";
import { api, API } from "../lib/api";

const NAV = [
  { key: "overview", to: "/patient", label: "Overview", icon: Activity, exact: true },
  { key: "triage", to: "/patient/triage", label: "AI Triage", icon: MessageCircle },
  { key: "hospitals", to: "/patient/hospitals", label: "Hospital Finder", icon: Hospital },
  { key: "awareness", to: "/patient/awareness", label: "Awareness Feed", icon: Globe },
  { key: "blood", to: "/patient/blood", label: "Blood Network", icon: Heart },
  { key: "alerts", to: "/patient/alerts", label: "Alerts & SOS", icon: Siren },
  { key: "medicine", to: "/patient/medicine", label: "Medicine Guide", icon: Pill },
  { key: "wellness", to: "/patient/wellness", label: "Wellness", icon: HeartPulse },
];

const sev = (s) => ({ critical: "bg-red-100 text-red-800 border-red-200", high: "bg-amber-100 text-amber-800 border-amber-200", medium: "bg-yellow-100 text-yellow-800 border-yellow-200", low: "bg-green-100 text-green-800 border-green-200" }[s] || "bg-slate-100 text-slate-700");

function Overview() {
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    api.get("/profile").then(r => setProfile(r.data));
    api.get("/patients/stats").then(r => setStats(r.data));
    api.get("/alerts").then(r => setAlerts(r.data.slice(0, 4)));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 text-white p-8 relative overflow-hidden">
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-teal-100">Hi {profile.preferred_name || "there"}, I'm your assistant</div>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight">How are you feeling today?</h2>
          <p className="mt-2 text-teal-50/90 max-w-xl">Tap below to describe a symptom. I'll ask gently, suggest the right specialist, and never jump to scary conclusions.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/patient/triage"><Button className="rounded-full bg-white text-teal-800 hover:bg-teal-50">Open AI Triage</Button></Link>
            <Link to="/patient/alerts"><Button className="rounded-full bg-red-500 hover:bg-red-600 text-white"><Siren size={16} className="mr-2" />SOS Alerts</Button></Link>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Blood group", v: profile.blood_group || "—", icon: Heart },
          { label: "Life stage", v: profile.age_bracket || "—", icon: Users },
          { label: "Language", v: (profile.language || "en").toUpperCase(), icon: Globe },
          { label: "First-aid ready", v: profile.first_aid_cpr ? "Yes" : "No", icon: ShieldAlert },
        ].map((c) => {
          const I = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{c.label}</div>
                <I size={16} className="text-teal-700" />
              </div>
              <div className="mt-2 font-display font-bold text-xl text-slate-900 capitalize">{c.v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Triage() {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Hi! I'm your Silent Guardian. Tell me what you're feeling — I'll help gently." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const sessionId = useRef(crypto.randomUUID?.() || String(Math.random()));
  const scroller = useRef(null);

  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight); }, [msgs, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setMsgs(m => [...m, { role: "user", text }]);
    setInput(""); setBusy(true);
    setMsgs(m => [...m, { role: "assistant", text: "" }]);
    try {
      const token = localStorage.getItem("sg_token");
      const resp = await fetch(`${API}/triage/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, session_id: sessionId.current }),
      });
      if (!resp.ok) throw new Error("Chat failed");
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", text: acc }; return c; });
      }
    } catch (e) {
      toast.error("Triage temporarily unavailable");
    } finally { setBusy(false); }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-9rem)]">
        <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-3 sg-scrollbar">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-slate-900 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm"}`}>
                {m.text || "..."}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 flex items-end gap-2">
          <Button type="button" variant="outline" size="icon" onClick={startVoice} className={`rounded-full ${listening ? "bg-red-50 border-red-300 text-red-700" : ""}`}>
            <Mic size={18} />
          </Button>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your symptom"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="min-h-[52px] max-h-32 resize-none rounded-2xl" rows={1} />
          <Button onClick={send} disabled={busy || !input.trim()} className="rounded-full bg-teal-700 text-white h-11 px-5"><Send size={16} /></Button>
        </div>
      </div>
    </div>
  );
}

// ... other patient portal tabs follow similar REST API integration ...

export default function PatientDashboard() {
  return (
    <DashShell title="Patient Portal" nav={NAV} accent="teal">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/triage" element={<Triage />} />
      </Routes>
    </DashShell>
  );
}
