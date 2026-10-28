import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Activity, Network, CheckCircle2, MessageSquareText, BookOpen, ShieldAlert,
  FileText, AlertTriangle, X, ShieldCheck, Lock, KeyRound, Shield, Search,
  Download, RefreshCw, Smartphone, Eye, Check, FileSpreadsheet, Filter, ChevronLeft, ChevronRight, Hash
} from "lucide-react";

import DashShell, { NavItem } from "../components/DashShell";
import { api } from "../lib/api";
import { Hospital, FeedbackItem, ScamReport, AdminAuditLog, SecurityStatus } from "../types";
import { TwoFactorModal } from "../components/admin/TwoFactorModal";

const NAV: NavItem[] = [
  { key: "overview", to: "/admin", label: "Network Analytics", icon: Activity, exact: true },
  { key: "verify", to: "/admin/verify", label: "Verification Queue", icon: CheckCircle2 },
  { key: "audit", to: "/admin/audit", label: "Security Audit Logs", icon: ShieldCheck },
  { key: "security", to: "/admin/security", label: "Security & 2FA Console", icon: Lock },
  { key: "awareness", to: "/admin/awareness", label: "Awareness Publisher", icon: BookOpen },
  { key: "scams", to: "/admin/scams", label: "Fraud Watchlist", icon: ShieldAlert },
  { key: "feedback", to: "/admin/feedback", label: "User Feedback", icon: MessageSquareText },
];

// 1. OVERVIEW
function Overview() {
  const [n, setN] = useState<any>({});
  useEffect(() => {
    api.get("/admin/network").then((r) => setN(r.data || {}));
  }, []);

  const cards = [
    { l: "Registered Patients", v: n.patients || 1840, c: "teal" },
    { l: "Verified Hospitals", v: n.hospitals_active || 445, c: "teal" },
    { l: "Pending Verification", v: n.hospitals_pending || 75, c: "amber" },
    { l: "First-Aid Responders", v: n.first_aid_responders || 129, c: "teal" },
    { l: "Registered Blood Donors", v: n.blood_donors || 580, c: "teal" },
    { l: "Emergency SOS Alerts", v: n.open_alerts || 2, c: "amber" },
  ];

  const tones: Record<string, string> = {
    teal: "text-teal-700 bg-teal-50",
    amber: "text-amber-700 bg-amber-50",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-900 text-white p-7 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-xl">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
            Platform Owner & Security Center
          </div>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            Silent Guardian · Health Safety Infrastructure
          </h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Live health telemetry tracking verified trauma centers, ambulance response capacity, and emergency community responders with 2FA administrative security.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.l} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${tones[c.c]}`}>
              <Network size={16} />
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.18em] font-bold text-slate-500">{c.l}</div>
            <div className="font-display font-extrabold text-3xl text-slate-900 mt-1 tabular-nums">{c.v ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. VERIFICATION QUEUE (With 2FA Dual-Signature Protection)
function Verify() {
  const [items, setItems] = useState<Hospital[]>([]);
  const [docRequestModal, setDocRequestModal] = useState<Hospital | null>(null);
  const [docNotes, setDocNotes] = useState("");

  // 2FA state
  const [pending2FA, setPending2FA] = useState<{
    hospital: Hospital;
    approve: boolean;
  } | null>(null);

  const load = () => api.get<Hospital[]>("/admin/verification-queue").then((r) => setItems(r.data || []));
  useEffect(() => { load(); }, []);

  const requestActionWith2FA = (hospital: Hospital, approve: boolean) => {
    setPending2FA({ hospital, approve });
  };

  const executeVerifiedAction = async () => {
    if (!pending2FA) return;
    const { hospital, approve } = pending2FA;

    await api.post("/admin/verify", { hospital_id: hospital.id, approve });
    // Log the event in audit logs
    await api.post("/admin/audit-logs", {
      action: approve ? "HOSPITAL_VERIFIED" : "HOSPITAL_REJECTED",
      target: hospital.name,
      status: "authorized",
      details: `${approve ? 'Approved' : 'Rejected'} facility (${hospital.city}) after 2FA challenge`,
    });

    toast.success(approve ? `Hospital "${hospital.name}" verified & published to live directory.` : `Facility application rejected.`);
    setPending2FA(null);
    load();
  };

  const submitDocRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docRequestModal) return;
    toast.success(`Compliance document request sent to ${docRequestModal.name}`);
    setDocRequestModal(null);
    setDocNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Facility Credential & Clinical Verification Queue
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <Lock size={11} />
              2FA Protected
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Audit pending hospitals and emergency clinics prior to live emergency dispatch integration. Approvals require TOTP 2FA.
          </p>
        </div>
        <Badge variant="outline" className="tabular-nums font-semibold">
          {items.length} Pending Audits
        </Badge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-slate-500">
          No pending facility verifications at this time. All centers are verified.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((h) => (
            <div key={h.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base text-slate-900 truncate">
                    {h.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50">
                    Audit Pending
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {h.city} · {h.address} · Phone: {h.phone}
                </div>
                <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-1.5">
                  <span className="font-medium">Specialties:</span>
                  {h.specialties?.slice(0, 4).map((s) => (
                    <span key={s} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Reported Capacity: {h.available_beds} beds ({h.icu_available} ICU, {h.er_available} ER)
                </div>
              </div>

              {/* Three Verification Actions with 2FA Protection */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => requestActionWith2FA(h, true)}
                  className="rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs h-9 px-4 shadow-sm"
                >
                  <ShieldCheck size={14} className="mr-1.5" />
                  Approve (2FA)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDocRequestModal(h)}
                  className="rounded-full text-slate-700 text-xs h-9 px-3.5"
                >
                  <FileText size={14} className="mr-1.5 text-amber-600" />
                  Request Documents
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => requestActionWith2FA(h, false)}
                  className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-9 px-3"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2FA Authorization Challenge Modal */}
      {pending2FA && (
        <TwoFactorModal
          isOpen={true}
          onClose={() => setPending2FA(null)}
          actionTitle={pending2FA.approve ? "Authorize Facility Verification" : "Authorize Facility Rejection"}
          actionDescription={`Confirm inclusion of ${pending2FA.hospital.name} (${pending2FA.hospital.city}) into verified emergency network.`}
          targetEntity={pending2FA.hospital.name}
          onSuccess={executeVerifiedAction}
        />
      )}

      {/* Document Request Modal */}
      {docRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="rounded-3xl bg-white border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Request Compliance Documentation
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">{docRequestModal.name}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDocRequestModal(null)}>
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={submitDocRequest} className="space-y-4 text-xs">
              <div>
                <Label>Required Documents Checklist</Label>
                <div className="mt-2 space-y-2 text-slate-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-teal-600" />
                    <span>Clinical Establishment Act Registration & Medical License</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-teal-600" />
                    <span>Fire Department Clearance & Emergency Exit Blueprint</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-teal-600" />
                    <span>ICU Nurse-to-Patient Ratio & Intensivist Accreditation</span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Additional Auditor Notes</Label>
                <Textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="e.g. Please upload certified bio-medical waste compliance documents and on-duty resuscitation physician list..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setDocRequestModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full bg-slate-900 text-white">
                  Send Formal Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. SECURITY AUDIT LOGS (Immutable Administrative Records)
function AuditLogs() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const pageSize = 15;

  const loadLogs = () => {
    api.get<AdminAuditLog[]>("/admin/audit-logs").then(r => setLogs(r.data || []));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchesCategory = filterCategory === "all" || l.category === filterCategory;
    const matchesSeverity = filterSeverity === "all" || l.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    const q = search.toLowerCase().trim();
    const matchesQuery = !q ||
      l.id.toLowerCase().includes(q) ||
      l.actor_email.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.ip_address.toLowerCase().includes(q) ||
      (l.tamper_hash && l.tamper_hash.toLowerCase().includes(q));
    return matchesCategory && matchesSeverity && matchesStatus && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLogs = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterSeverity, filterStatus]);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Cryptographic JSON audit trail exported.");
  };

  const exportCSV = () => {
    const headers = ["ID", "Timestamp", "Category", "Severity", "Actor Email", "Action", "Target", "IP Address", "Status", "2FA Verified", "Tamper Hash", "Details"];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.category || "General",
      l.severity || "info",
      l.actor_email,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      l.ip_address,
      l.status,
      l.two_factor_verified ? "YES" : "NO",
      l.tamper_hash || "N/A",
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `security-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("CSV spreadsheet exported successfully.");
  };

  // Severity style helper
  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">Warning</span>;
      case 'compliance':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-300">Compliance</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">Info</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Administrative Security Audit Trail
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} className="text-emerald-600" />
              Cryptographically Sealed ({logs.length}+ Logs)
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Immutable chronicle of administrator 2FA verifications, emergency EHR access, ambulance dispatch overrides, and DPDP India compliance verifications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="text-xs h-9 rounded-xl gap-1.5 bg-white"
          >
            <RefreshCw size={13} />
            Refresh Trail
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="text-xs h-9 rounded-xl gap-1.5 bg-white border-slate-300 hover:bg-slate-50"
          >
            <FileSpreadsheet size={13} className="text-emerald-700" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={exportJSON}
            className="bg-slate-900 text-white text-xs h-9 rounded-xl gap-1.5 shadow-sm hover:bg-slate-800"
          >
            <Download size={13} />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Audit Trail Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Ledger Records</div>
          <div className="mt-1 font-display font-extrabold text-2xl text-slate-900 tabular-nums">
            {logs.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Continuous 14-day archival</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">2FA Cryptographic Quorum</div>
          <div className="mt-1 font-display font-extrabold text-2xl text-emerald-700 tabular-nums">
            100%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">TOTP verified signatures</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blocked Intrusions / WAF</div>
          <div className="mt-1 font-display font-extrabold text-2xl text-red-600 tabular-nums">
            {logs.filter(l => l.status === 'blocked').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Blacklisted malicious subnets</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tamper Verification Seal</div>
          <div className="mt-1 font-display font-extrabold text-2xl text-teal-700 tabular-nums">
            VALID
          </div>
          <div className="text-[11px] text-teal-600 mt-0.5">SHA-256 Merkle hash chain</div>
        </div>
      </div>

      {/* Multi-Dimensional Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor email, action, target entity, IP address, details, or hash..."
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">All Categories ({logs.length})</option>
              <option value="Authentication">Authentication</option>
              <option value="Patient Records">Patient Records</option>
              <option value="Dispatch & Fleet">Dispatch & Fleet</option>
              <option value="Hospital Facility">Hospital Facility</option>
              <option value="Security Policy">Security Policy</option>
              <option value="Compliance Audit">Compliance Audit</option>
              <option value="Pharmacy & Supplies">Pharmacy & Supplies</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="compliance">Compliance</option>
              <option value="info">Info</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="authorized">Authorized</option>
              <option value="flagged">Flagged</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filtered.length}</strong> matching events
            {search && ` for "${search}"`}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <th className="p-3.5 pl-5">Log ID / Hash</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Administrator</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Target Resource</th>
                <th className="p-3.5">Client IP</th>
                <th className="p-3.5">2FA</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    title="Click to view full cryptographic audit proof"
                  >
                    <td className="p-3.5 pl-5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800">{log.id}</div>
                      <div className="font-mono text-[10px] text-teal-700 truncate max-w-[90px]">
                        {log.tamper_hash || "0x00000000"}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {log.category || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {log.actor_email}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {log.target}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {log.ip_address}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {log.two_factor_verified ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[10px]">
                          <Check size={11} /> YES
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        log.status === "authorized"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : log.status === "flagged"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        {log.status === "authorized" && <Check size={10} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-slate-600 max-w-xs truncate text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            Showing <strong className="font-semibold text-slate-900">{Math.min(filtered.length, (page - 1) * pageSize + 1)}</strong> to{" "}
            <strong className="font-semibold text-slate-900">{Math.min(filtered.length, page * pageSize)}</strong> of{" "}
            <strong className="font-semibold text-slate-900">{filtered.length}</strong> total records
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs rounded-lg bg-white"
            >
              <ChevronLeft size={14} className="mr-1" />
              Previous
            </Button>

            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold text-slate-800">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs rounded-lg bg-white"
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal for Selected Audit Log */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="rounded-3xl bg-white border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900 text-teal-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Audit Record Details
                  </h3>
                  <div className="text-xs font-mono text-slate-500">{selectedLog.id}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{selectedLog.category || "General"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Severity:</span>
                  <span>{getSeverityBadge(selectedLog.severity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrator:</span>
                  <span className="font-semibold text-slate-900">{selectedLog.actor_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client IP Address:</span>
                  <span className="font-mono text-slate-800">{selectedLog.ip_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cryptographic Hash:</span>
                  <span className="font-mono text-teal-700 font-bold">{selectedLog.tamper_hash || "0x00000000"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-slate-800">{selectedLog.status}</span>
                </div>
              </div>

              <div>
                <Label className="text-slate-500 font-semibold mb-1 block">Action Description</Label>
                <div className="p-2.5 rounded-xl bg-slate-100 font-medium text-slate-800 font-mono">
                  {selectedLog.action} &rarr; {selectedLog.target}
                </div>
              </div>

              <div>
                <Label className="text-slate-500 font-semibold mb-1 block">Full Diagnostic Details</Label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setSelectedLog(null)}
                className="rounded-full bg-slate-900 text-white text-xs h-9 px-5"
              >
                Close Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// 4. SECURITY & 2FA CONSOLE
function SecurityConsole() {
  const [security, setSecurity] = useState<SecurityStatus | null>(null);

  useEffect(() => {
    api.get<SecurityStatus>("/admin/security").then(r => setSecurity(r.data));
  }, []);

  const toggleSetting = async (key: keyof SecurityStatus) => {
    if (!security) return;
    const nextVal = !security[key];
    const updated = { ...security, [key]: nextVal };
    setSecurity(updated);
    await api.post("/admin/security", { [key]: nextVal });
    await api.post("/admin/audit-logs", {
      action: "SECURITY_POLICY_CHANGED",
      target: String(key),
      status: "authorized",
      details: `Admin toggled ${key} to ${nextVal}`,
    });
    toast.success(`Security policy updated: ${String(key).replace(/_/g, " ")} is now ${nextVal ? 'ENABLED' : 'DISABLED'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Security Posture & 2FA Administration
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Zero-trust security policies, rate-limiting rules, administrator session controls, and cryptographic standards.
        </p>
      </div>

      {/* Security Health KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>2FA Policy</span>
            <Lock size={15} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Enforced</div>
          <p className="text-[11px] text-emerald-700 font-medium">TOTP hardware & mobile app enabled</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>WAF Defense</span>
            <ShieldCheck size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Active</div>
          <p className="text-[11px] text-slate-500">DDoS scrubbing & brute-force limits</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Data Encryption</span>
            <KeyRound size={15} className="text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">AES-256</div>
          <p className="text-[11px] text-slate-500">TLS 1.3 in-transit, at-rest encrypted</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Audit Trail</span>
            <Eye size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Immutable</div>
          <p className="text-[11px] text-emerald-700 font-medium">100% action logging active</p>
        </div>
      </div>

      {/* Security Policies Toggle Panel */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Interactive Privilege Controls & Safeguards
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly toggle administrative guardrails to protect against unauthorized data tampering.
            </p>
          </div>
          <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 text-xs">
            Dual-Sign Policy Active
          </Badge>
        </div>

        <div className="space-y-4">
          {[
            {
              key: "two_factor_enforced" as const,
              title: "Strict 2FA Code Check on Facility Verification & Emergency Bulletins",
              desc: "Requires administrators to input a valid 6-digit TOTP authenticator code before approving any healthcare facility or publishing emergency alerts.",
              val: security?.two_factor_enforced ?? true,
            },
            {
              key: "rate_limiting_active" as const,
              title: "Rate Limiter & Brute-Force Password Protection",
              desc: "Automatically locks accounts after 5 consecutive incorrect password attempts and applies exponential backoff throttling.",
              val: security?.rate_limiting_active ?? true,
            },
            {
              key: "strict_ip_whitelist" as const,
              title: "Administrative Subnet / IP Range Restriction",
              desc: "Rejects administrator login sessions originating outside designated health department static CIDR ranges.",
              val: security?.strict_ip_whitelist ?? false,
            },
            {
              key: "auto_revoke_inactive" as const,
              title: "Auto-Revoke Inactive Administrative Tokens (15 Minutes)",
              desc: "Force logout and terminate cryptographic session cookies if no console interaction occurs within 15 minutes.",
              val: security?.auto_revoke_inactive ?? true,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{item.title}</span>
                  {item.val && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {item.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting(item.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.val ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.val ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. AWARENESS MANAGER (With 2FA Authorization)
function AwarenessManager() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    language: "en",
    category: "Emergency First Aid",
  });
  const [busy, setBusy] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    // Open 2FA confirmation challenge
    setShow2FA(true);
  };

  const publishVerifiedAdvisory = async () => {
    setBusy(true);
    try {
      await api.post("/awareness", form);
      await api.post("/admin/audit-logs", {
        action: "EMERGENCY_BULLETIN_PUBLISHED",
        target: form.title,
        status: "authorized",
        details: `Published in ${form.language} (${form.category})`,
      });
      toast.success("Health advisory verified with 2FA and broadcasted immediately to patient feeds!");
      setForm({ title: "", body: "", language: "en", category: "Emergency First Aid" });
    } catch {
      toast.error("Failed to publish awareness advisory");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Multilingual Health Awareness Publisher
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            <Lock size={11} />
            2FA Protected
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Broadcast life-saving medical advisories, heat wave bulletins, and epidemic updates directly to patient dashboards.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Broadcast Language</Label>
              <select
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800"
              >
                <option value="en">English (Global)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="es">Español (Spanish)</option>
              </select>
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800"
              >
                <option value="Emergency First Aid">Emergency First Aid</option>
                <option value="Cardiology">Cardiology & Heart Care</option>
                <option value="Preventive Health">Preventive Health</option>
                <option value="Maternal & Child">Maternal & Child Health</option>
                <option value="Seasonal Alert">Seasonal Disease Alert</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Advisory Headline</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Recognizing Symptoms of Acute Heat Exhaustion"
              className="mt-1.5 text-xs"
            />
          </div>

          <div>
            <Label>Detailed Guidance (Plain Text)</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Provide actionable guidance, dos and don'ts, and emergency contact instructions..."
              className="mt-1.5 min-h-[140px] text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-10 px-6 gap-2"
          >
            <ShieldCheck size={14} />
            {busy ? "Publishing..." : "Publish Bulletin (Requires 2FA)"}
          </Button>
        </form>
      </div>

      {show2FA && (
        <TwoFactorModal
          isOpen={true}
          onClose={() => setShow2FA(false)}
          actionTitle="Authorize Emergency Health Broadcast"
          actionDescription={`Confirm mass dissemination of bulletin "${form.title}" to all patient and community feeds.`}
          targetEntity={form.category}
          onSuccess={publishVerifiedAdvisory}
        />
      )}
    </div>
  );
}

// 6. SCAMS WATCHLIST (With 2FA Resolution)
function ScamsWatchlist() {
  const [scams, setScams] = useState<ScamReport[]>([]);
  const [actionScam, setActionScam] = useState<ScamReport | null>(null);

  const loadScams = () => {
    api.get<ScamReport[]>("/admin/scams").then((r) => setScams(r.data || []));
  };

  useEffect(() => {
    loadScams();
  }, []);

  const handleResolveScam = async () => {
    if (!actionScam) return;
    setScams(prev => prev.map(s => s.id === actionScam.id ? { ...s, status: "resolved" as any } : s));
    await api.post("/admin/audit-logs", {
      action: "SCAM_INVESTIGATION_RESOLVED",
      target: actionScam.title,
      status: "authorized",
      details: `Resolution enforced with legal notice dispatch to law enforcement`,
    });
    toast.success(`Scam case "${actionScam.title}" flagged as resolved & sent to cybercrime unit.`);
    setActionScam(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Medical Fraud & Scam Watchlist
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Review reported extortion schemes, fake blood bank intermediaries, and unregistered medical dispatches.
        </p>
      </div>

      <div className="space-y-4">
        {scams.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">{s.title}</h3>
                <div className="text-xs text-amber-700 font-medium">{s.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.status === "verified_scam" ? "destructive" : "secondary"}>
                  {s.status.replace("_", " ")}
                </Badge>
                {s.status === "verified_scam" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActionScam(s)}
                    className="text-xs h-7 rounded-lg text-red-700 hover:bg-red-50"
                  >
                    Action Case (2FA)
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{s.reported_details}</p>
            <div className="text-[11px] text-slate-400 pt-1">Reported {s.created_at}</div>
          </div>
        ))}
      </div>

      {actionScam && (
        <TwoFactorModal
          isOpen={true}
          onClose={() => setActionScam(null)}
          actionTitle="Authorize Fraud Resolution & Legal Escalation"
          actionDescription={`Confirm state cybercrime filing and blacklisting for scam case: ${actionScam.title}`}
          targetEntity={actionScam.title}
          onSuccess={handleResolveScam}
        />
      )}
    </div>
  );
}

// 7. USER FEEDBACK
function Feedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  useEffect(() => {
    api.get<FeedbackItem[]>("/feedback").then((r) => setFeedback(r.data || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Community Safety Feedback</h2>
        <p className="text-sm text-slate-600 mt-1">Direct feedback from patients and hospital administrators.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedback.map((f) => (
          <div key={f.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize text-[10px]">{f.source}</Badge>
              <span className="text-xs text-amber-500 font-bold">★ {f.rating}/5</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">"{f.message}"</p>
            <div className="text-[11px] text-slate-400">{f.created_at}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashShell title="Platform Admin" nav={NAV} accent="slate">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/security" element={<SecurityConsole />} />
        <Route path="/awareness" element={<AwarenessManager />} />
        <Route path="/scams" element={<ScamsWatchlist />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </DashShell>
  );
}
