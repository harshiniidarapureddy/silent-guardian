import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Activity, Network, CheckCircle2, MessageSquareText, BookOpen, ShieldAlert } from "lucide-react";
import DashShell from "../components/DashShell";
import { api } from "../lib/api";

const NAV = [
  { key: "overview", to: "/admin", label: "Network", icon: Activity, exact: true },
  { key: "verify", to: "/admin/verify", label: "Verification Queue", icon: CheckCircle2 },
  { key: "awareness", to: "/admin/awareness", label: "Awareness Manager", icon: BookOpen },
];

function Overview() {
  const [n, setN] = useState({});
  useEffect(() => { api.get("/admin/network").then(r => setN(r.data)); }, []);
  
  const cards = [
    { l: "Patients", v: n.patients, c: "teal" },
    { l: "Verified hospitals", v: n.hospitals_active, c: "teal" },
    { l: "Pending verification", v: n.hospitals_pending, c: "amber" },
    { l: "First-aid responders", v: n.first_aid_responders, c: "teal" },
  ];
  const tones = { teal: "text-teal-700 bg-teal-50", amber: "text-amber-700 bg-amber-50" };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-900 text-white p-7 relative overflow-hidden">
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Platform owner</div>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight">Silent Guardian · Network control</h2>
          <p className="mt-2 text-slate-300">Live flow of patients, guardians, responders and verified hospitals.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.l} className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${tones[c.c]}`}><Network size={16} /></div>
            <div className="mt-3 text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{c.l}</div>
            <div className="font-display font-extrabold text-3xl text-slate-900 mt-1">{c.v ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Verify() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/verification-queue").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const act = async (id, approve) => {
    await api.post("/admin/verify", { hospital_id: id, approve });
    toast.success(approve ? "Hospital approved" : "Rejected"); load();
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-500">No pending verifications.</div>}
      {items.map(h => (
        <div key={h.id} className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900">{h.name}</div>
            <div className="text-xs text-slate-500">{h.city} · {h.specialties?.slice(0, 3).join(", ")}</div>
          </div>
          <Button onClick={() => act(h.id, true)} className="rounded-full bg-teal-700 text-white">Approve</Button>
          <Button onClick={() => act(h.id, false)} variant="outline" className="rounded-full">Reject</Button>
        </div>
      ))}
    </div>
  );
}

function AwarenessManager() {
  const [form, setForm] = useState({ title: "", body: "", language: "en", category: "General" });
  
  const submit = async () => {
    if (!form.title || !form.body) { toast.error("Title and body required"); return; }
    await api.post("/awareness", form);
    toast.success("Published to patient feeds");
    setForm({ title: "", body: "", language: "en", category: "General" });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 max-w-3xl">
      <h3 className="font-display font-semibold text-lg">Publish awareness content</h3>
      <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-3" />
      <Textarea placeholder="Body (plain text)" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="mt-3 min-h-40" />
      <Button onClick={submit} className="mt-4 rounded-full bg-slate-900 text-white">Publish</Button>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashShell title="Platform Admin" nav={NAV} accent="slate">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/awareness" element={<AwarenessManager />} />
      </Routes>
    </DashShell>
  );
}
