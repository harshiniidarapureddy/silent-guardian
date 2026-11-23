import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  Glasses,
  HeartHandshake,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { AssistiveTechCategory } from "../../types";
import {
  computeAdminAccessibilityStats,
  computeAdminOrganDonorStats,
  loadAdminDeviceCatalog,
  loadAdminEducationalResources,
  saveAdminDeviceCatalog,
  saveAdminEducationalResources,
  type AdminDeviceCatalogEntry,
  type AdminEducationalResource,
} from "../../lib/portalInclusiveData";

type RegistrySubTab = "statistics" | "resources" | "catalog";

export function AdminOrganRegistryTab() {
  const [activeSubTab, setActiveSubTab] = useState<RegistrySubTab>("statistics");
  const donorStats = useMemo(() => computeAdminOrganDonorStats(), []);
  const a11yStats = useMemo(() => computeAdminAccessibilityStats(), []);

  const [resources, setResources] = useState<AdminEducationalResource[]>(() =>
    loadAdminEducationalResources()
  );
  const [catalog, setCatalog] = useState<AdminDeviceCatalogEntry[]>(() =>
    loadAdminDeviceCatalog()
  );
  const [catalogCategory, setCatalogCategory] = useState<AssistiveTechCategory | "All">("All");

  const filteredCatalog = useMemo(
    () =>
      catalogCategory === "All"
        ? catalog
        : catalog.filter((entry) => entry.category === catalogCategory),
    [catalog, catalogCategory]
  );

  // Add Educational Resource form state
  const [newResTitle, setNewResTitle] = useState("");
  const [newResCategory, setNewResCategory] =
    useState<AdminEducationalResource["category"]>("Organ Donation");
  const [newResAudience, setNewResAudience] =
    useState<AdminEducationalResource["audience"]>("Patients & Families");
  const [newResSummary, setNewResSummary] = useState("");
  const [newResSource, setNewResSource] = useState("Care Preempt Clinical Review Board");

  // Add Device Catalog entry form state
  const [newDevName, setNewDevName] = useState("");
  const [newDevMaker, setNewDevMaker] = useState("");
  const [newDevCategory, setNewDevCategory] =
    useState<AssistiveTechCategory>("Vision Support");
  const [newDevCompat, setNewDevCompat] = useState("");

  const toggleResourceVerified = (id: string) => {
    setResources((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              verified: !r.verified,
              lastReviewed: new Date().toISOString().slice(0, 10),
            }
          : r
      );
      saveAdminEducationalResources(next);
      return next;
    });
    toast.success("Educational resource verification status updated.");
  };

  const toggleResourcePublished = (id: string) => {
    setResources((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, published: !r.published } : r
      );
      saveAdminEducationalResources(next);
      return next;
    });
    toast.success("Educational resource visibility updated.");
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResSummary.trim()) {
      toast.error("Please provide both a title and clinical summary.");
      return;
    }
    const created: AdminEducationalResource = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      category: newResCategory,
      audience: newResAudience,
      summary: newResSummary.trim(),
      verified: true,
      published: true,
      lastReviewed: new Date().toISOString().slice(0, 10),
      sourceBody: newResSource.trim() || "Care Preempt Clinical Advisory",
    };
    const next = [created, ...resources];
    setResources(next);
    saveAdminEducationalResources(next);
    setNewResTitle("");
    setNewResSummary("");
    toast.success(`Published & verified "${created.title}".`);
  };

  const toggleCatalogVerified = (id: string) => {
    setCatalog((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, verified: !c.verified } : c
      );
      saveAdminDeviceCatalog(next);
      return next;
    });
    toast.success("Assistive device clinical verification updated.");
  };

  const toggleCatalogFeatured = (id: string) => {
    setCatalog((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, featured: !c.featured } : c
      );
      saveAdminDeviceCatalog(next);
      return next;
    });
    toast.success("Assistive device catalog spotlight updated.");
  };

  const handleAddCatalogDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName.trim() || !newDevMaker.trim()) {
      toast.error("Please enter device name and manufacturer.");
      return;
    }
    const created: AdminDeviceCatalogEntry = {
      id: `cat-${Date.now()}`,
      name: newDevName.trim(),
      manufacturer: newDevMaker.trim(),
      category: newDevCategory,
      compatibilityNote:
        newDevCompat.trim() ||
        "Verified Bluetooth LE & Care Preempt Companion Bridge support",
      verified: true,
      active: true,
      featured: false,
      registeredCount: 0,
    };
    const next = [created, ...catalog];
    setCatalog(next);
    saveAdminDeviceCatalog(next);
    setNewDevName("");
    setNewDevMaker("");
    setNewDevCompat("");
    toast.success(`Added "${created.name}" to the verified Assistive Device Catalog.`);
  };

  return (
    <div className="space-y-6" data-testid="admin-organ-registry-page">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-teal-400">
            <HeartHandshake size={15} aria-hidden="true" />
            <span>Organ Donation Registry & Inclusive Catalog Governance</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Anonymized Donor Analytics & Clinical Resource Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor anonymized community organ pledge trends without exposing personal health identifiers, and verify educational guides and assistive hardware entries published to patients and hospital staff.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold shrink-0 w-fit">
          <Lock size={14} aria-hidden="true" />
          <span>Zero-PII Anonymized Aggregation</span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Organ Registry Management Sections"
        className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs"
      >
        {[
          {
            id: "statistics" as const,
            label: "Anonymized Pledge Statistics",
            icon: HeartHandshake,
          },
          {
            id: "resources" as const,
            label: `Educational Resources (${resources.length})`,
            icon: BookOpen,
          },
          {
            id: "catalog" as const,
            label: `Assistive Device Catalog (${catalog.length})`,
            icon: Glasses,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`admin-registry-tab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANONYMIZED DONOR PLEDGE STATISTICS */}
      {activeSubTab === "statistics" && (
        <div className="space-y-6" data-testid="admin-donor-stats-panel">
          {/* Top KPI Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Total Anonymized Pledges
              </div>
              <div className="font-display font-extrabold text-3xl text-slate-900 mt-1.5 tabular-nums">
                {donorStats.totalPledges.toLocaleString()}
              </div>
              <div className="text-xs text-teal-800 font-semibold mt-1">
                {donorStats.optInRatePercent}% of registered community
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                All-Organs Pledges
              </div>
              <div className="font-display font-extrabold text-3xl text-slate-900 mt-1.5 tabular-nums">
                {donorStats.fullAllOrgansCount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {donorStats.specificOrgansCount.toLocaleString()} specific-organ selections
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Next-of-Kin Informed
              </div>
              <div className="font-display font-extrabold text-3xl text-emerald-700 mt-1.5 tabular-nums">
                {donorStats.nextOfKinInformedRatePercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Family guardian notified of donor wishes
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Assistive Hardware Linked
              </div>
              <div className="font-display font-extrabold text-3xl text-slate-900 mt-1.5 tabular-nums">
                {a11yStats.totalRegisteredDevices.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {a11yStats.voiceModeUsers} Voice · {a11yStats.visualFirstUsers} Visual-First
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Organ Type Breakdown */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Organ & Tissue Pledge Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Percentage of active pledges covering each organ or tissue category.
                </p>
              </div>
              <div className="space-y-3">
                {donorStats.organBreakdown.map((item) => (
                  <div key={item.organ} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.organ}</span>
                      <span className="font-mono text-slate-600">
                        {item.count.toLocaleString()} pledges ({item.sharePercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${Math.min(100, item.sharePercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Metro Breakdown */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Regional Opt-In Breakdown (Anonymized)
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregate community pledge participation across monitored Indian metro corridors.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Metro Region</th>
                      <th className="py-2.5 px-3">Active Pledges</th>
                      <th className="py-2.5 px-3 text-right">Opt-In Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donorStats.regionalBreakdown.map((row) => (
                      <tr key={row.region}>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.region}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 tabular-nums">
                          {row.pledges.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200 font-bold tabular-nums">
                            {row.optInPercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDUCATIONAL RESOURCES MANAGER */}
      {activeSubTab === "resources" && (
        <div className="grid lg:grid-cols-12 gap-6" data-testid="admin-resources-manager">
          <div className="lg:col-span-8 space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                data-testid={`admin-resource-row-${res.id}`}
                className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {res.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200">
                        {res.audience}
                      </span>
                      {res.verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck size={11} aria-hidden="true" />
                          Clinically Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 mt-1.5">
                      {res.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={res.verified ? "outline" : "default"}
                      data-testid={`verify-resource-${res.id}`}
                      onClick={() => toggleResourceVerified(res.id)}
                      className={`h-8 text-xs rounded-lg ${
                        res.verified
                          ? "border-slate-300 text-slate-700"
                          : "bg-teal-700 hover:bg-teal-800 text-white"
                      }`}
                    >
                      {res.verified ? "Revoke Verification" : "Verify Resource"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleResourcePublished(res.id)}
                      className="h-8 text-xs rounded-lg"
                    >
                      {res.published ? "Published" : "Draft"}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Source: {res.sourceBody}</span>
                  <span>Last reviewed: {res.lastReviewed}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <form
              onSubmit={handleAddResource}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3.5 sticky top-20"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Plus size={16} className="text-teal-700" aria-hidden="true" />
                <span>Add Verified Educational Guide</span>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Resource Title *
                </Label>
                <Input
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Cornea Donation Family Guide"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Category
                  </Label>
                  <select
                    value={newResCategory}
                    onChange={(e) =>
                      setNewResCategory(
                        e.target.value as AdminEducationalResource["category"]
                      )
                    }
                    className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  >
                    <option value="Organ Donation">Organ Donation</option>
                    <option value="Accessibility & Assistive Tech">
                      Accessibility & Assistive Tech
                    </option>
                    <option value="Emergency Protocols">Emergency Protocols</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Audience
                  </Label>
                  <select
                    value={newResAudience}
                    onChange={(e) =>
                      setNewResAudience(
                        e.target.value as AdminEducationalResource["audience"]
                      )
                    }
                    className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  >
                    <option value="Patients & Families">Patients & Families</option>
                    <option value="Hospital Triage Staff">Hospital Triage Staff</option>
                    <option value="All Users">All Users</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Clinical Advisory Source
                </Label>
                <Input
                  value={newResSource}
                  onChange={(e) => setNewResSource(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Summary *
                </Label>
                <textarea
                  rows={3}
                  value={newResSummary}
                  onChange={(e) => setNewResSummary(e.target.value)}
                  placeholder="Brief, empathetic explanation published to users..."
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
              >
                Publish Verified Resource
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ASSISTIVE & VITALS DEVICE CATALOG MANAGER */}
      {activeSubTab === "catalog" && (
        <div className="space-y-4" data-testid="admin-catalog-manager">
          <div
            className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200"
            role="group"
            aria-label="Filter device catalog by category"
          >
            {(
              [
                "All",
                "Vision Support",
                "Hearing Support",
                "Hands-Free Control",
                "Mobility Aids",
                "Vitals & Health Monitoring",
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatalogCategory(cat)}
                aria-pressed={catalogCategory === cat}
                data-testid={`admin-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  catalogCategory === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "All"
                  ? `All (${catalog.length})`
                  : `${cat} (${catalog.filter((c) => c.category === cat).length})`}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-3">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  data-testid={`admin-catalog-row-${item.id}`}
                  className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                    {item.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={11} aria-hidden="true" />
                        Verified Compatible
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Unverified
                      </span>
                    )}
                    {item.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        <Sparkles size={11} aria-hidden="true" />
                        Featured in Hub
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {item.manufacturer} · {item.compatibilityNote}
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">
                    {item.registeredCount} active patient pairings across network
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={item.verified ? "outline" : "default"}
                    data-testid={`verify-catalog-${item.id}`}
                    onClick={() => toggleCatalogVerified(item.id)}
                    className={`h-8 text-xs rounded-lg ${
                      item.verified
                        ? "border-slate-300 text-slate-700"
                        : "bg-teal-700 hover:bg-teal-800 text-white"
                    }`}
                  >
                    {item.verified ? "Verified ✓" : "Mark Verified"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCatalogFeatured(item.id)}
                    className="h-8 text-xs rounded-lg"
                  >
                    {item.featured ? "Unfeature" : "Feature in Hub"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <form
              onSubmit={handleAddCatalogDevice}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3.5 sticky top-20"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Plus size={16} className="text-teal-700" aria-hidden="true" />
                <span>Add Assistive Hardware Entry</span>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Device Name *
                </Label>
                <Input
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  placeholder="e.g. Braille Emergency Wristband"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Manufacturer *
                </Label>
                <Input
                  value={newDevMaker}
                  onChange={(e) => setNewDevMaker(e.target.value)}
                  placeholder="e.g. AccessMed Labs"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Support Category
                </Label>
                <select
                  value={newDevCategory}
                  onChange={(e) =>
                    setNewDevCategory(e.target.value as AssistiveTechCategory)
                  }
                  className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                >
                  <option value="Vision Support">Vision Support</option>
                  <option value="Hearing Support">Hearing Support</option>
                  <option value="Hands-Free Control">Hands-Free Control</option>
                  <option value="Mobility Aids">Mobility Aids</option>
                  <option value="Vitals & Health Monitoring">Vitals &amp; Health Monitoring</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Compatibility Notes
                </Label>
                <Input
                  value={newDevCompat}
                  onChange={(e) => setNewDevCompat(e.target.value)}
                  placeholder="Bluetooth LE 5.2 / VoiceOver / TalkBack"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Add to Verified Catalog
              </Button>
            </form>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
