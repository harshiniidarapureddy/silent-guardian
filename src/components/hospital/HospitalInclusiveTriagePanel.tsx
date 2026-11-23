import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Accessibility,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Ear,
  Glasses,
  HeartHandshake,
  Mic,
  Phone,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import type { PatientRecord } from "../../types";
import { computeHospitalInclusiveSummary } from "../../lib/portalInclusiveData";

export function PatientInclusiveBadges({
  patient,
  onInspectDirectives,
}: {
  patient: PatientRecord;
  onInspectDirectives?: (patient: PatientRecord) => void;
}) {
  const a11y = patient.accessibilityProfile;
  const donor = patient.organDonor;

  if (!a11y && !donor?.isDonor) {
    return (
      <span className="text-[11px] text-slate-400 font-medium">
        Standard intake
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-w-[200px] max-w-[300px]">
      {a11y?.needsVoiceMode && (
        <span
          className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200"
          title="Visual Impairment / Hands-Free Voice Mode"
        >
          <Mic size={11} className="shrink-0" aria-hidden="true" />
          <span>Visual Impairment / Voice</span>
        </span>
      )}
      {a11y?.needsVisualFirst && (
        <span
          className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200"
          title="Deaf / Hard-of-Hearing – Visual-First Mode"
        >
          <Ear size={11} className="shrink-0" aria-hidden="true" />
          <span>Deaf / HoH – Visual-First</span>
        </span>
      )}
      {a11y?.assistiveDevices.map((dev) => (
        <span
          key={dev}
          className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
          title={`Registered Assistive Device: ${dev}`}
        >
          <Glasses size={11} className="shrink-0" aria-hidden="true" />
          <span>Uses {dev.replace("AI ", "").replace("Digital Bluetooth ", "")}</span>
        </span>
      ))}
      {donor?.isDonor && (
        <button
          type="button"
          onClick={() => onInspectDirectives?.(patient)}
          data-testid={`donor-badge-${patient.id}`}
          className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-300 hover:bg-teal-100 transition-colors cursor-pointer"
          title="Click to expand Organ Donor Pledge preferences and Next-of-Kin contact"
        >
          <HeartHandshake size={11} className="shrink-0" aria-hidden="true" />
          <span>Registered Donor Pledge</span>
        </button>
      )}
    </div>
  );
}

export function HospitalInclusiveReadinessStrip({
  patients,
  onSelectPatient,
}: {
  patients: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
}) {
  const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);
  const summary = computeHospitalInclusiveSummary(patients);

  // Highlight top 4 incoming priority patients with accessibility or donor flags
  const priorityCards = patients
    .filter(
      (p) =>
        Boolean(p.accessibilityProfile?.badges.length) ||
        Boolean(p.organDonor?.isDonor)
    )
    .slice(0, 4);

  return (
    <section
      aria-labelledby="hospital-inclusive-readiness-heading"
      data-testid="hospital-inclusive-readiness"
      className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-bold text-teal-800">
            <Accessibility size={14} aria-hidden="true" />
            <span>Arrival Communication & Donor Directives</span>
          </div>
          <h3
            id="hospital-inclusive-readiness-heading"
            className="font-display font-bold text-lg text-slate-900 mt-1"
          >
            Incoming Patient Accessibility Needs & Organ Donor Registry
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Pre-arrival flags alert ER triage nurses to sensory accommodations, assistive hardware, and verified organ donor pledges before the ambulance arrives.
          </p>
        </div>

        <Link
          to="/hospital/intake"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          <span>Open Full Intake Queue</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* 4 Clinical Readiness Counters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              Voice / Vision Support
            </span>
            <Mic size={16} className="text-indigo-700" aria-hidden="true" />
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums">
            {summary.voiceCount}
          </div>
          <div className="text-[11px] text-indigo-900/80 mt-0.5">
            Verbal triage & audio guidance needed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900">
              Deaf / HoH Visual-First
            </span>
            <Ear size={16} className="text-sky-700" aria-hidden="true" />
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums">
            {summary.visualFirstCount}
          </div>
          <div className="text-[11px] text-sky-900/80 mt-0.5">
            Visual cards & live captions prepared
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Assistive Devices Active
            </span>
            <Glasses size={16} className="text-amber-700" aria-hidden="true" />
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums">
            {summary.assistiveDeviceCount}
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5">
            Smart glasses, hearing & mobility aids
          </div>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
              Registered Donor Pledges
            </span>
            <HeartHandshake size={16} className="text-teal-700" aria-hidden="true" />
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 tabular-nums">
            {summary.organDonorCount}
          </div>
          <div className="text-[11px] text-teal-900/80 mt-0.5">
            Next-of-kin directives verified on file
          </div>
        </div>
      </div>

      {/* Priority Incoming Patient Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {priorityCards.map((pt) => {
          const isDonorExpanded = expandedDonorId === pt.id;
          return (
            <div
              key={pt.id}
              data-testid={`priority-patient-card-${pt.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {pt.name}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {pt.age}y · {pt.gender} ·{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {pt.blood_group}
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    {pt.issue} ·{" "}
                    <span className="text-slate-500">{pt.assigned_doctor}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                    pt.severity === "critical"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : pt.severity === "high"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {pt.severity}
                </span>
              </div>

              <PatientInclusiveBadges
                patient={pt}
                onInspectDirectives={() =>
                  setExpandedDonorId((cur) => (cur === pt.id ? null : pt.id))
                }
              />

              {pt.accessibilityProfile?.communicationNote && (
                <p className="text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 leading-relaxed">
                  <strong className="text-slate-900">Arrival Protocol:</strong>{" "}
                  {pt.accessibilityProfile.communicationNote}
                </p>
              )}

              {/* Expandable Organ Donor Pledge Preferences & Next-of-Kin */}
              {pt.organDonor?.isDonor && (
                <div className="rounded-lg border border-teal-200 bg-teal-50/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDonorId((cur) => (cur === pt.id ? null : pt.id))
                    }
                    aria-expanded={isDonorExpanded}
                    data-testid={`expand-donor-${pt.id}`}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-teal-900 hover:bg-teal-100/60 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <HeartHandshake size={14} aria-hidden="true" />
                      <span>
                        Organ Donor Pledge ({pt.organDonor.pledgeId})
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                      {isDonorExpanded ? "Hide Details" : "Expand Preferences & Kin"}
                      {isDonorExpanded ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  {isDonorExpanded && (
                    <div
                      data-testid={`donor-details-${pt.id}`}
                      className="px-3 pb-3 pt-2 border-t border-teal-200/80 bg-white space-y-2 text-xs"
                    >
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Pledged Organs ({pt.organDonor.donateAll ? "All Eligible" : "Specific Selection"})
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pt.organDonor.selectedOrgans.map((org) => (
                            <span
                              key={org}
                              className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-semibold"
                            >
                              {org}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Next-of-Kin Verification Contact
                          </div>
                          <div className="font-semibold text-slate-900">
                            {pt.organDonor.nextOfKinName} ({pt.organDonor.nextOfKinRelation})
                          </div>
                          <div className="font-mono text-[11px] text-slate-700 inline-flex items-center gap-1">
                            <Phone size={11} className="text-teal-700" aria-hidden="true" />
                            {pt.organDonor.nextOfKinPhone}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            pt.organDonor.nextOfKinInformed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {pt.organDonor.nextOfKinInformed
                            ? "Family Informed"
                            : "Verify with Family"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectPatient(pt)}
                  className="h-7 text-xs px-3 rounded-lg"
                >
                  Open Full Clinical Profile
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PatientClinicalDirectivesModal({
  patient,
  onClose,
}: {
  patient: PatientRecord | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!patient) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [patient, onClose]);

  if (!patient || typeof document === "undefined") return null;

  const a11y = patient.accessibilityProfile;
  const donor = patient.organDonor;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-directives-modal-title"
      data-testid="hospital-patient-directives-modal"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-300">
              Emergency Triage Directives & Communication Profile
            </div>
            <h3
              id="patient-directives-modal-title"
              className="font-display font-bold text-xl mt-0.5"
            >
              {patient.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {patient.age} yrs · {patient.gender} · Blood Group{" "}
              <span className="font-mono font-bold text-white">
                {patient.blood_group}
              </span>{" "}
              · {patient.issue}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close patient directives profile"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Accessibility & Communication Protocol */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/70">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Accessibility size={15} className="text-indigo-700" aria-hidden="true" />
              <span>Accessibility & Arrival Communication Needs</span>
            </div>

            {a11y ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {a11y.badges.map((badge) => (
                    <span
                      key={badge}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {a11y.communicationNote}
                </p>
                {a11y.assistiveDevices.length > 0 && (
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">
                      Registered Assistive Devices:{" "}
                    </span>
                    {a11y.assistiveDevices.join(", ")}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-600">
                No specialized sensory or assistive device flags registered for this patient. Standard clinical triage communication applies.
              </p>
            )}
          </div>

          {/* Organ Donor Pledge Section */}
          <div className="rounded-xl border border-teal-200 p-4 space-y-3 bg-teal-50/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
                <HeartHandshake size={15} className="text-teal-700" aria-hidden="true" />
                <span>Organ Donor Pledge Status</span>
              </div>
              {donor?.isDonor ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-teal-700 text-white">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  Registered Donor Pledge
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  Not Registered
                </span>
              )}
            </div>

            {donor?.isDonor ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-teal-100">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Registry Pledge ID
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {donor.pledgeId}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pledged on {donor.pledgedAt}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-teal-100">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Next-of-Kin Contact
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                      <UserCheck size={13} className="text-teal-700" aria-hidden="true" />
                      {donor.nextOfKinName} ({donor.nextOfKinRelation})
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-0.5">
                      {donor.nextOfKinPhone}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-teal-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                    Organ & Tissue Preferences (
                    {donor.donateAll ? "All Eligible Organs" : "Specific Organs Selected"})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {donor.selectedOrgans.map((organ) => (
                      <span
                        key={organ}
                        className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-xs font-semibold"
                      >
                        {organ}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-teal-950 bg-teal-100/70 p-2.5 rounded-lg">
                  <ShieldCheck size={14} className="text-teal-800 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Clinical reminder: Emergency life-saving care is always completely independent of donor status. Organ coordination occurs only after independent clinical determination and family verification.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                This patient has not opted into the Care Preempt Organ Donor Registry.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assigned Physician: <strong className="text-slate-800">{patient.assigned_doctor}</strong>
          </span>
          <Button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 px-5 rounded-xl"
          >
            Close Profile
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
