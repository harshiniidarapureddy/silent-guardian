import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Activity, Users, BedDouble, Siren, Truck, UserCog, Pill, Hospital as HospitalIcon, Search, Check, RefreshCw, Star, Award, Clock, Languages } from "lucide-react";
import { toast } from "sonner";
import { CatalogPagination } from "../components/ui/CatalogPagination";
import DashShell, { NavItem } from "../components/DashShell";
import { api } from "../lib/api";
import { generate550Patients } from "../lib/dataGenerator";
import { PatientRecord, BedCapacity, Ambulance, Doctor, PharmacyItem } from "../types";

const NAV: NavItem[] = [
  { key: "overview", to: "/hospital", label: "Command Center", icon: Activity, exact: true },
  { key: "intake", to: "/hospital/intake", label: "Patient Intake (550+)", icon: Users },
  { key: "beds", to: "/hospital/beds", label: "Beds & Capacity", icon: BedDouble },
  { key: "ambulances", to: "/hospital/ambulances", label: "Ambulance Fleet", icon: Truck },
  { key: "doctors", to: "/hospital/doctors", label: "Medical Staff", icon: UserCog },
  { key: "pharmacy", to: "/hospital/pharmacy", label: "Pharmacy Stock", icon: Pill },
];

function StatCard({ label, value, hint, icon: I, tone = "teal" }: any) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{label}</div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <I size={18} />
        </div>
      </div>
      <div className="mt-2 font-display font-extrabold text-3xl text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1 font-medium">{hint}</div>}
    </div>
  );
}

// 1. OVERVIEW
function Overview() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    api.get("/hospital/overview").then((r) => setData(r.data || {}));
  }, []);

  const p = data.patients || {};
  const b: BedCapacity = data.beds || { total: 240, available: 58, icu_available: 6, er_available: 7, ventilator_available: 3 };
  const a = data.ambulances || { total: 5, out: 2, available: 3 };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 text-white p-7 shadow-lg">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-amber-100">
          Hospital Command Center
        </div>
        <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
          Emergency Operational Overview
        </h2>
        <p className="mt-2 text-amber-50/90 text-sm max-w-xl">
          Real-time triage queue, ICU bed capacity, ambulance dispatch status, and on-duty resuscitation teams.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Intake"
          value={550}
          hint="Active patient registry"
          icon={Users}
        />
        <StatCard
          label="Critical Cases"
          value={p.severity?.critical ?? 48}
          hint="Immediate ICU / Resus triage"
          icon={Siren}
          tone="red"
        />
        <StatCard
          label="Beds Available"
          value={b.available ?? 58}
          hint={`Of ${b.total ?? 240} total beds`}
          icon={BedDouble}
          tone="teal"
        />
        <StatCard
          label="Ambulances Active"
          value={a.out ?? 2}
          hint={`${a.available ?? 3} currently in bay`}
          icon={Truck}
          tone="amber"
        />
      </div>

      {/* Bed Distribution Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="font-display font-bold text-base text-slate-900">
            Emergency Bed Allocation Status
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-center">
              <div className="text-[10px] uppercase font-bold text-teal-800">General Beds</div>
              <div className="font-display font-extrabold text-2xl text-teal-900 mt-1 tabular-nums">41</div>
              <div className="text-[10px] text-teal-700 mt-0.5">Available</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
              <div className="text-[10px] uppercase font-bold text-red-800">ICU Beds</div>
              <div className="font-display font-extrabold text-2xl text-red-900 mt-1 tabular-nums">{b.icu_available ?? 6}</div>
              <div className="text-[10px] text-red-700 mt-0.5">Critical care</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-800">Emergency (ER)</div>
              <div className="font-display font-extrabold text-2xl text-amber-900 mt-1 tabular-nums">{b.er_available ?? 7}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Trauma bay</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-700">Ventilators</div>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-1 tabular-nums">{b.ventilator_available ?? 3}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Mechanical</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="font-display font-bold text-base text-slate-900">
            Rapid Dispatch Protocol
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Silent Guardian connects directly with regional 108 trauma ambulances. Critical alerts flagged via AI Triage bypass routine queues to prepare catheterization and surgical bays before arrival.
          </p>
          <div className="pt-2 flex gap-3">
            <Button
              onClick={() => toast.success("Hospital telemetry synchronized with 108 Emergency Network")}
              className="rounded-full bg-slate-900 text-white text-xs h-9 px-4"
            >
              Sync Emergency Telemetry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. PATIENT INTAKE (550+ Scaled Patient Records with Search, Filter & Pagination)
function PatientIntake() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [gender, setGender] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    setPatients(generate550Patients());
  }, []);

  const toggleAdmission = (id: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.admitted;
          toast.success(`${p.name} marked as ${nextState ? "Admitted" : "Triage / Discharged"}`);
          return { ...p, admitted: nextState };
        }
        return p;
      })
    );
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.issue.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.assigned_doctor.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severity === "all" || p.severity === severity;
    const matchesGen = gender === "all" || p.gender === gender;
    return matchesSearch && matchesSev && matchesGen;
  });

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Emergency Triage & Intake Queue
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real-time tracking of 550+ clinical intake records, triage complaints, and assigned physicians.
          </p>
        </div>
        <Badge variant="default" className="bg-amber-50 text-amber-900 border-amber-300 font-bold tabular-nums">
          {filtered.length} Patients in Queue
        </Badge>
      </div>

      {/* Filter Toolbar */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-6 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by patient name, symptom, area, or physician..."
            className="pl-10 h-10"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High Urgency</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Patient Intake Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Triage Complaint</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Blood</TableHead>
                <TableHead>Assigned Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-slate-900 whitespace-nowrap">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs whitespace-nowrap">
                    {p.age} yrs · {p.gender}
                  </TableCell>
                  <TableCell className="text-xs text-slate-800 max-w-xs truncate">
                    {p.issue}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        p.severity === "critical"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : p.severity === "high"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : p.severity === "medium"
                          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                          : "bg-green-50 text-green-800 border-green-200"
                      }`}
                    >
                      {p.severity}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {p.blood_group}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                    {p.assigned_doctor}
                  </TableCell>
                  <TableCell>
                    {p.admitted ? (
                      <Badge variant="default" className="text-[10px] bg-teal-50 text-teal-800 border-teal-200">
                        Admitted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-600">
                        In Triage
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAdmission(p.id)}
                      className="rounded-full text-xs h-7 px-3"
                    >
                      {p.admitted ? "Discharge" : "Admit"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length} patients
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="self-center font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. BEDS & CAPACITY
function BedsAndCapacity() {
  const [beds, setBeds] = useState<BedCapacity>({
    total: 240,
    available: 58,
    icu_total: 30,
    icu_available: 6,
    er_total: 20,
    er_available: 7,
    ventilator_total: 15,
    ventilator_available: 3,
  });

  const update = (field: keyof BedCapacity, delta: number) => {
    setBeds((prev) => {
      const nextVal = Math.max(0, (prev[field] as number) + delta);
      toast.success(`Updated ${field.replace("_", " ")} to ${nextVal}`);
      return { ...prev, [field]: nextVal };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Hospital Bed & Resuscitation Capacity Management
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Adjust live bed counts to broadcast verified availability to dispatch ambulances and triage patients.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { key: "available" as const, label: "General Ward Beds", count: beds.available, total: beds.total, color: "teal" },
          { key: "icu_available" as const, label: "Intensive Care (ICU)", count: beds.icu_available, total: beds.icu_total, color: "red" },
          { key: "er_available" as const, label: "Emergency Room (ER)", count: beds.er_available, total: beds.er_total, color: "amber" },
          { key: "ventilator_available" as const, label: "Mechanical Ventilators", count: beds.ventilator_available, total: beds.ventilator_total, color: "slate" },
        ].map((item) => (
          <div key={item.key} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">{item.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-3xl text-slate-900 tabular-nums">{item.count}</span>
              <span className="text-xs text-slate-400">/ {item.total} total</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(item.key, -1)}
                className="w-full text-xs h-8"
              >
                - Occupy
              </Button>
              <Button
                size="sm"
                onClick={() => update(item.key, 1)}
                className="w-full text-xs h-8 bg-slate-900 text-white"
              >
                + Release
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. AMBULANCES (500+ Fleet Units)
function Ambulances() {
  const [fleet, setFleet] = useState<Ambulance[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    api.get<Ambulance[]>("/ambulances").then((r) => setFleet(r.data || []));
  }, []);

  const dispatch = (id: string) => {
    setFleet((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = a.status === "available" ? "out" : "available";
          toast.success(`Ambulance ${a.vehicle_no} status updated to ${next.toUpperCase()}`);
          return { ...a, status: next };
        }
        return a;
      })
    );
  };

  const filtered = fleet.filter((a) => {
    const q = search.toLowerCase();
    const matchQ = !search ||
      a.vehicle_no.toLowerCase().includes(q) ||
      a.driver_name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" || (a.type && a.type.toLowerCase().includes(typeFilter.toLowerCase()));
    return matchQ && matchStatus && matchType;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const availableCount = fleet.filter((a) => a.status === "available").length;
  const outCount = fleet.filter((a) => a.status === "out").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Emergency Ambulance Fleet (520+ Units)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real-time GPS tracking, ACLS/BLS vehicle classes, rapid dispatch, and telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
            {availableCount} Available in Bay
          </Badge>
          <Badge variant="destructive" className="font-bold">
            {outCount} Dispatched
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-6 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by registration plate, driver, or locality..."
            className="pl-10 h-10 text-xs"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Fleet Statuses</option>
            <option value="available">Available in Bay</option>
            <option value="out">Out on Emergency Call</option>
            <option value="maintenance">Maintenance Service</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Ambulance Classes</option>
            <option value="ACLS">ACLS (Cardiac Life Support)</option>
            <option value="BLS">BLS (Basic Life Support)</option>
            <option value="Neonatal">Neonatal ICU</option>
            <option value="Trauma">Trauma Mobile Unit</option>
            <option value="Bike">First-Response Bike</option>
          </select>
        </div>
      </div>

      {/* Ambulance Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display font-bold text-base text-slate-900 font-mono">{a.vehicle_no}</div>
                  <div className="text-xs text-teal-700 font-semibold mt-0.5">{a.type || "BLS Unit"}</div>
                </div>
                <Badge
                  variant={a.status === "available" ? "default" : a.status === "out" ? "destructive" : "secondary"}
                  className="capitalize text-[10px]"
                >
                  {a.status === "available" ? "Available" : a.status === "out" ? "En Route" : "Service Bay"}
                </Badge>
              </div>

              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div><span className="text-slate-400">Driver:</span> <strong className="text-slate-800">{a.driver_name}</strong></div>
                <div className="text-[11px] text-slate-500 truncate"><span className="text-slate-400">Location:</span> {a.location}</div>
                {a.equipment && a.equipment.length > 0 && (
                  <div className="text-[10px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-600">Gear: </span>
                    {a.equipment.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>

              {a.current_call && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                  <strong>Call:</strong> {a.current_call}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a href={`tel:${a.driver_phone}`} className="text-xs text-teal-700 font-semibold hover:underline">
                {a.driver_phone}
              </a>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dispatch(a.id)}
                className={`rounded-full text-xs h-7 px-3 ${
                  a.status === "available" ? "hover:bg-amber-50 hover:text-amber-800" : "hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                {a.status === "available" ? "Dispatch Call" : "Return to Bay"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
          itemName="ambulances"
        />
      </div>
    </div>
  );
}

// 5. MEDICAL STAFF / DOCTORS (500+ Doctors)
function Doctors() {
  const [docs, setDocs] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    api.get<Doctor[]>("/doctors").then((r) => setDocs(r.data || []));
  }, []);

  const toggleStatus = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const next: Doctor['status'] = d.status === "available" ? "rounds" : "available";
          toast.success(`Status updated for ${d.name} to ${next.toUpperCase()}`);
          return { ...d, status: next };
        }
        return d;
      })
    );
  };

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchQ = !search ||
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q) ||
      (d.council_reg_no && d.council_reg_no.toLowerCase().includes(q));
    const matchDept = deptFilter === "all" || d.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchQ && matchDept;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Hospital Medical Faculty & Staff (520+ Specialists)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Council registration audits, outpatient hours, and real-time duty status.
          </p>
        </div>
        <Badge variant="default" className="bg-teal-50 text-teal-900 border-teal-300 font-bold self-start">
          {docs.filter(d => d.status === "available").length} Available on Duty
        </Badge>
      </div>

      {/* Search & Department Filter */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-8 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by physician name, department, specialty, or council reg no..."
            className="pl-10 h-10 text-xs"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Departments</option>
            <option value="Cardiac">Cardiac Sciences & Cath Lab</option>
            <option value="Neuro">Neuro Sciences & Stroke Unit</option>
            <option value="Trauma">Trauma & Joint Replacement</option>
            <option value="Pediatric">Pediatric Emergency & NICU</option>
            <option value="Respiratory">Respiratory Critical Care</option>
            <option value="Emergency">Emergency Resuscitation</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((d) => (
          <div key={d.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={d.photo_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"}
                  alt={d.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-display font-bold text-base text-slate-900 truncate">{d.name}</div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      <span>{d.rating || "4.8"}</span>
                    </div>
                  </div>
                  <div className="text-xs text-teal-700 font-semibold">{d.specialty}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {d.degrees || "MBBS, MD"} {d.experience_years ? `· ${d.experience_years} yrs` : ""}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-1 font-mono">
                    <Award size={10} className="text-teal-600" />
                    <span>{d.council_reg_no || "MCI-VERIFIED"}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>OPD: {d.opd_hours || "10:00 AM - 02:00 PM"}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">{d.shift}</span>
                </div>
                {d.languages && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Languages size={11} className="text-slate-400" />
                    <span>Languages: {d.languages.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Badge variant={d.status === "available" ? "default" : "secondary"} className="capitalize text-[10px]">
                {d.status.replace("_", " ")}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleStatus(d.id)}
                className="text-xs h-7 rounded-lg"
              >
                {d.status === "available" ? "Mark On Rounds" : "Mark Available"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
          itemName="doctors"
        />
      </div>
    </div>
  );
}

// 6. PHARMACY STOCK (500+ Items with Critical Alerts & Restock)
function Pharmacy() {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    api.get<PharmacyItem[]>("/pharmacy").then((r) => setItems(r.data || []));
  }, []);

  const restock = (id: string, amount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = item.stock + amount;
          toast.success(`Restocked ${item.name} (+${amount} ${item.unit}). New level: ${updated}`);
          return { ...item, stock: updated };
        }
        return item;
      })
    );
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchQ = !search || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || i.category.toLowerCase().includes(catFilter.toLowerCase());
    const matchStock =
      stockStatus === "all" ||
      (stockStatus === "critical" && i.stock <= Math.floor(i.reorder_level * 0.5)) ||
      (stockStatus === "low" && i.stock <= i.reorder_level && i.stock > Math.floor(i.reorder_level * 0.5));
    return matchQ && matchCat && matchStock;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const lowStockCount = items.filter(i => i.stock <= i.reorder_level).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Critical Emergency Pharmacy Stock (520+ Medications)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Live inventory of resuscitation ampoules, inotropes, IV crystalloids, antiplatelets, and antibiotics.
          </p>
        </div>
        <Badge variant={lowStockCount > 0 ? "destructive" : "default"} className="font-bold self-start">
          {lowStockCount} Items Below Reorder Threshold
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid md:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-6 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by drug name or category..."
            className="pl-10 h-10 text-xs"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Pharmacy Classes</option>
            <option value="Injectable">Emergency Injectables</option>
            <option value="Cardiac">Cardiac & Antidotes</option>
            <option value="Antibiotic">Critical Care Antibiotics</option>
            <option value="IV Fluids">IV Fluids & Expanders</option>
            <option value="Antiplatelet">Antiplatelets</option>
            <option value="Analgesic">Analgesics & Sedatives</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Inventory Levels</option>
            <option value="critical">Critical Depletion (Immediate Action)</option>
            <option value="low">Below Reorder Level</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication / Fluid (Batch)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Threshold</TableHead>
              <TableHead>Batch Expiry</TableHead>
              <TableHead className="text-right">Quick Restock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((i) => {
              const isCritical = i.stock <= Math.floor(i.reorder_level * 0.5);
              const isLow = i.stock <= i.reorder_level;
              return (
                <TableRow key={i.id} className={isCritical ? "bg-red-50/40" : isLow ? "bg-amber-50/30" : ""}>
                  <TableCell className="font-semibold text-slate-900 text-xs">
                    <div>{i.name}</div>
                    {isCritical && (
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        CRITICAL SHORTAGE
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{i.category}</TableCell>
                  <TableCell className="font-bold tabular-nums text-xs">
                    <span className={isCritical ? "text-red-700 font-extrabold" : isLow ? "text-amber-700" : "text-slate-900"}>
                      {i.stock} {i.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 tabular-nums">
                    {i.reorder_level} {i.unit}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">{i.expiry}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restock(i.id, 50)}
                      className="rounded-lg text-xs h-7 px-2.5 font-semibold text-teal-700 hover:bg-teal-50"
                    >
                      +50 {i.unit}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <CatalogPagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 30, 60]}
          itemName="medications"
        />
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  return (
    <DashShell title="Hospital Command" nav={NAV} accent="amber">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/intake" element={<PatientIntake />} />
        <Route path="/beds" element={<BedsAndCapacity />} />
        <Route path="/ambulances" element={<Ambulances />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
      </Routes>
    </DashShell>
  );
}
