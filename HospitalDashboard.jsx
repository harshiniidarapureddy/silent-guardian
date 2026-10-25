import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Activity, Users, BedDouble, Siren, Truck, UserCog, Pill, Hospital as HospitalIcon } from "lucide-react";
import DashShell from "../components/DashShell";
import { api } from "../lib/api";

const NAV = [
  { key: "overview", to: "/hospital", label: "Overview", icon: Activity, exact: true },
  { key: "intake", to: "/hospital/intake", label: "Patient Intake", icon: Users },
  { key: "beds", to: "/hospital/beds", label: "Beds & Capacity", icon: BedDouble },
];

function Stat({ label, value, hint, icon: I, tone = "teal" }) {
  const tones = { teal: "bg-teal-50 text-teal-700", red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-700" };
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{label}</div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}><I size={18} /></div>
      </div>
      <div className="mt-2 font-display font-extrabold text-3xl text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function Overview() {
  const [o, setO] = useState({});
  useEffect(() => { api.get("/hospital/overview").then(r => setO(r.data)); }, []);
  const p = o.patients || {}; const b = o.beds || {}; const a = o.ambulances || {};
  
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-7">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-amber-100">Hospital command center</div>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-amber-50/90">Live triage, beds and dispatch at a glance.</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Total patients" value={p.total ?? "—"} hint={`${p.admitted ?? 0} admitted`} icon={Users} />
        <Stat label="Critical cases" value={p.severity?.critical ?? "—"} hint="needs immediate attention" icon={Siren} tone="red" />
        <Stat label="Beds available" value={b.available ?? "—"} hint={`of ${b.total ?? "—"} total`} icon={BedDouble} tone="teal" />
        <Stat label="Ambulances out" value={a.out ?? "—"} hint={`${a.available ?? 0} available`} icon={Truck} tone="amber" />
      </div>
    </div>
  );
}

function Intake() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [filters, setFilters] = useState({ q: "", gender: "all", severity: "all", issue: "", location: "", page: 1 });
  const load = () => api.get("/patients", { params: filters }).then(r => setData(r.data));
  useEffect(() => { load(); }, [filters.page, filters.gender, filters.severity]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-display font-semibold text-lg">Patients <span className="text-sm text-slate-500 font-normal ml-2">{data.total} total</span></div>
          <Button onClick={load} className="rounded-full h-9 bg-slate-900 text-white">Refresh</Button>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead><TableHead>Age/Gender</TableHead><TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead><TableHead>Location</TableHead><TableHead>Blood</TableHead>
                <TableHead>Doctor</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{p.age} · {p.gender}</TableCell>
                  <TableCell>{p.issue}</TableCell>
                  <TableCell><Badge className="capitalize">{p.severity}</Badge></TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell className="font-mono text-sm">{p.blood_group}</TableCell>
                  <TableCell className="text-sm">{p.assigned_doctor}</TableCell>
                  <TableCell>{p.admitted ? <Badge>Admitted</Badge> : <Badge variant="outline">Triage</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">Page {filters.page}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Prev</Button>
            <Button variant="outline" disabled={data.items.length < 20} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  return (
    <DashShell title="Hospital Portal" nav={NAV} accent="amber">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/intake" element={<Intake />} />
      </Routes>
    </DashShell>
  );
}
