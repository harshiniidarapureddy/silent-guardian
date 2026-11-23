import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Accessibility,
  ArrowRight,
  Ear,
  Glasses,
  HeartHandshake,
  Mic,
} from "lucide-react";
import {
  computeAdminAccessibilityStats,
  computeAdminOrganDonorStats,
} from "../../lib/portalInclusiveData";

export function AdminAccessibilityOverview() {
  const a11yStats = useMemo(() => computeAdminAccessibilityStats(), []);
  const donorStats = useMemo(() => computeAdminOrganDonorStats(), []);

  return (
    <section
      aria-labelledby="admin-a11y-overview-heading"
      data-testid="admin-accessibility-overview"
      className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-bold text-teal-800">
            <Accessibility size={14} aria-hidden="true" />
            <span>Accessibility & Assistive Tech Adoption</span>
          </div>
          <h3
            id="admin-a11y-overview-heading"
            className="font-display font-bold text-base text-slate-900 mt-0.5"
          >
            Inclusive Care & Assistive Hardware Telemetry
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated, anonymized counts of active sensory modes, registered assistive devices, and organ donor pledges across the Care Preempt network.
          </p>
        </div>

        <Link
          to="/admin/organ-registry"
          data-testid="admin-open-organ-registry-link"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          <HeartHandshake size={14} className="text-teal-700" aria-hidden="true" />
          <span>Manage Organ Registry & Catalog</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="p-5 space-y-5">
        {/* 4 Summary Metric Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-900">
                Hands-Free Voice Mode
              </span>
              <Mic size={16} className="text-indigo-700" aria-hidden="true" />
            </div>
            <div
              data-testid="admin-stat-voice-users"
              className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums"
            >
              {a11yStats.voiceModeUsers.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-900/80 mt-0.5">
              Active voice-guided patient accounts
            </div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-sky-900">
                Visual-First Mode
              </span>
              <Ear size={16} className="text-sky-700" aria-hidden="true" />
            </div>
            <div
              data-testid="admin-stat-visual-users"
              className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums"
            >
              {a11yStats.visualFirstUsers.toLocaleString()}
            </div>
            <div className="text-[11px] text-sky-900/80 mt-0.5">
              Deaf / Hard-of-Hearing visual caption users
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-900">
                Assistive Devices Linked
              </span>
              <Glasses size={16} className="text-amber-700" aria-hidden="true" />
            </div>
            <div
              data-testid="admin-stat-devices-total"
              className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums"
            >
              {a11yStats.totalRegisteredDevices.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-900/80 mt-0.5">
              Across {a11yStats.assistiveDeviceUsers.toLocaleString()} registered patients
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-900">
                Organ Donor Pledges
              </span>
              <HeartHandshake size={16} className="text-teal-700" aria-hidden="true" />
            </div>
            <div
              data-testid="admin-stat-donor-pledges"
              className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums"
            >
              {donorStats.totalPledges.toLocaleString()}
            </div>
            <div className="text-[11px] text-teal-900/80 mt-0.5">
              {donorStats.optInRatePercent}% community opt-in (anonymized)
            </div>
          </div>
        </div>

        {/* Registered Assistive Device Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Registered Assistive &amp; Vitals Hardware Breakdown
            </h4>
            <span className="text-[11px] font-medium text-slate-500">
              Synced from patient profiles (Zero PII exposed)
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {a11yStats.deviceBreakdown.map((item) => (
              <div
                key={item.key}
                data-testid={`admin-device-breakdown-${item.key}`}
                className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-800">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${Math.min(100, Math.max(12, item.sharePercent))}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.sharePercent}% of connected devices
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
