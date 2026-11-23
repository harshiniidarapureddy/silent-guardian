import React, { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  HeartHandshake,
  Info,
  Printer,
  Share2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { api, getUser } from "../../lib/api";
import { useAccessibility } from "../../context/AccessibilityContext";
import type { OrganDonorPledge, OrganType, Profile } from "../../types";
import {
  ALL_ELIGIBLE_ORGANS,
  generateDonorCardSvg,
  generateNextOfKinMessage,
  validateOrganPledge,
} from "../../lib/accessibilityLogic";

const MYTHS_AND_FACTS = [
  {
    myth: "Doctors will not try as hard to save me if I am registered as a donor.",
    fact: "Emergency medical teams focus strictly on saving your life. Organ donation is only considered after all life-saving measures have been exhausted and brain death is independently certified.",
  },
  {
    myth: "My age or medical history automatically disqualifies me.",
    fact: "People of almost all ages and backgrounds can pledge. Clinical teams evaluate organ and tissue suitability at the time of donation so healthy organs and corneas can still help others.",
  },
  {
    myth: "Once I pledge, I cannot change my mind.",
    fact: "Donation is completely voluntary. You can update specific organ preferences or withdraw your pledge in Care Preempt at any moment.",
  },
];

export function OrganDonationRegistry() {
  const { organPledge, saveOrganPledge, preferences, speak } =
    useAccessibility();
  const currentUser = getUser();

  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [draft, setDraft] = useState<OrganDonorPledge>(organPledge);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    api.get<Partial<Profile>>("/profile").then((res) => {
      const p = res.data || {};
      setProfile(p);
      setDraft((prev) => ({
        ...prev,
        nextOfKinName: prev.nextOfKinName || p.guardian_name || "",
        nextOfKinPhone: prev.nextOfKinPhone || p.guardian_contact || "",
      }));
    });
  }, []);

  useEffect(() => {
    setDraft((prev) => ({
      ...organPledge,
      nextOfKinName: organPledge.nextOfKinName || prev.nextOfKinName || "",
      nextOfKinPhone: organPledge.nextOfKinPhone || prev.nextOfKinPhone || "",
    }));
  }, [organPledge]);

  const holderName =
    profile.preferred_name || currentUser?.preferred_name || "Care Preempt Member";
  const bloodGroup = profile.blood_group || "O+";

  const toggleSpecificOrgan = (organ: OrganType) => {
    setDraft((prev) => {
      const baseOrgans = prev.donateAll
        ? [...ALL_ELIGIBLE_ORGANS]
        : prev.selectedOrgans;
      const exists = baseOrgans.includes(organ);
      const nextOrgans = exists
        ? baseOrgans.filter((o) => o !== organ)
        : [...baseOrgans, organ];
      return {
        ...prev,
        donateAll: false,
        selectedOrgans: nextOrgans,
      };
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateOrganPledge(draft);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      toast.error("Please review the highlighted fields before saving your pledge.");
      return;
    }
    setFormErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const normalized: OrganDonorPledge = {
      ...draft,
      selectedOrgans: draft.donateAll
        ? [...ALL_ELIGIBLE_ORGANS]
        : draft.selectedOrgans,
    };
    saveOrganPledge(normalized);
    setConfirmOpen(false);
    if (normalized.isDonor) {
      toast.success(
        "Your Organ Donor Pledge has been saved and your Digital Donor Card is ready."
      );
      speak(
        "Your organ donor pledge has been updated and your Digital Organ Donor Card is now active.",
        { title: "Organ Donor Pledge Saved", source: "guidance" }
      );
    } else {
      toast.info("Your organ donor pledge status has been updated to paused.");
    }
  };

  const shareableMessage = generateNextOfKinMessage(
    holderName,
    organPledge.isDonor ? organPledge : draft
  );

  const handleCopyFamilyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareableMessage);
      setCopiedMsg(true);
      toast.success("Family notification message copied to clipboard.");
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      toast.info("Select and copy the message text from the box below.");
    }
  };

  const handleDownloadCard = () => {
    if (!organPledge.isDonor) {
      toast.info("Save an active donor pledge first to download your card.");
      return;
    }
    const svg = generateDonorCardSvg(holderName, bloodGroup, organPledge);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CarePreempt_OrganDonorCard_${(organPledge.pledgeId || "pledge").replace(/[^a-zA-Z0-9-_]/g, "")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Digital Organ Donor Card downloaded.");
  };

  const handlePrintCard = () => {
    if (!organPledge.isDonor) {
      toast.info("Save an active donor pledge first to print your card.");
      return;
    }
    window.print();
  };

  const formattedPledgeDate = organPledge.pledgedAt
    ? new Date(organPledge.pledgedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not yet recorded";

  return (
    <div
      className="max-w-6xl mx-auto space-y-6"
      data-testid="organ-donation-registry"
    >
      {/* Page Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Personal Health Directive · Organ & Tissue Pledge
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Organ Donation Registry & Digital Donor Profile
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Record your voluntary organ and tissue donation wishes with clarity, notify your loved ones, and keep a printable Digital Organ Donor Card ready in your Care Preempt profile.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {organPledge.isDonor ? (
            <span
              data-testid="donor-status-active"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl"
            >
              <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
              Verified Donor Pledge Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl">
              <HeartHandshake size={15} className="text-teal-700" aria-hidden="true" />
              No Active Pledge Yet
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Educational Overview */}
      <section
        aria-labelledby="organ-edu-heading"
        className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 no-print"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center flex-shrink-0">
            <HeartHandshake size={20} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="organ-edu-heading"
              className="font-display text-lg font-bold text-slate-900"
            >
              Understanding Organ & Tissue Donation
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              One registered donor can save up to <strong>8 lives</strong> through organ donation and restore sight or mobility for up to <strong>50 people</strong> through cornea and tissue donation. Sharing your decision clearly with family brings peace of mind and ensures your wishes are respected.
            </p>
          </div>
        </div>

        {/* Visual-First structured step guide if enabled */}
        {preferences.visualFirst && (
          <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2.5">
              3 Clear Steps to Record Your Pledge
            </div>
            <ol className="grid sm:grid-cols-3 gap-3 text-xs text-slate-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  1
                </span>
                <span>Choose all eligible organs or select specific organs below.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  2
                </span>
                <span>Enter your next-of-kin contact and share your summary message.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  3
                </span>
                <span>Confirm your pledge to generate and print or download your card.</span>
              </li>
            </ol>
          </div>
        )}

        {/* Myths vs Facts */}
        <div className="grid md:grid-cols-3 gap-4 pt-1">
          {MYTHS_AND_FACTS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2"
            >
              <div className="text-xs font-semibold text-slate-500">
                Common Question
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                "{item.myth}"
              </p>
              <div className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/80">
                <strong className="text-teal-800">Clinical Fact: </strong>
                {item.fact}
              </div>
            </div>
          ))}
        </div>

        {/* Privacy & Consent Notice */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3 text-xs text-slate-700">
          <ShieldCheck
            size={18}
            className="text-teal-700 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="leading-relaxed">
            <strong className="text-slate-900">Privacy & Voluntary Consent: </strong>
            Your pledge preferences are stored privately in your Care Preempt profile. You remain in complete control and may edit, pause, or revoke your directive at any time.
          </div>
        </div>
      </section>

      {/* Section 2 & 3 Grid: Interactive Pledge Form + Digital Donor Card */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Pledge & Preferences Form */}
        <form
          onSubmit={handleReviewSubmit}
          noValidate
          data-testid="organ-pledge-form"
          className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 space-y-6 no-print"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Pledge & Donation Preferences
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Customize your donation choice and record the family member or legal representative who knows your wishes.
            </p>
          </div>

          {/* Opt-in Toggle */}
          <fieldset className="space-y-2.5">
            <legend className="text-xs font-semibold text-slate-800">
              Donor Pledge Status
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={draft.isDonor}
                onClick={() => setDraft((prev) => ({ ...prev, isDonor: true }))}
                data-testid="pledge-opt-in-btn"
                className={`p-4 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  draft.isDonor
                    ? "border-teal-700 bg-teal-50/70 ring-1 ring-teal-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-bold text-slate-900">
                  Opt In as Organ Donor
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Activate my pledge and generate a Digital Donor Card
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={!draft.isDonor}
                onClick={() => setDraft((prev) => ({ ...prev, isDonor: false }))}
                data-testid="pledge-opt-out-btn"
                className={`p-4 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  !draft.isDonor
                    ? "border-slate-900 bg-slate-100/80 ring-1 ring-slate-900"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-bold text-slate-900">
                  Not Pledged / Pause
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Keep pledge inactive until you are ready
                </div>
              </button>
            </div>
          </fieldset>

          {draft.isDonor && (
            <>
              {/* Granular Organ Selection */}
              <fieldset className="space-y-3 pt-2 border-t border-slate-100">
                <legend className="text-xs font-semibold text-slate-800">
                  Organ & Tissue Preferences *
                </legend>

                <label
                  htmlFor="donate-all-checkbox"
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 cursor-pointer"
                >
                  <input
                    id="donate-all-checkbox"
                    type="checkbox"
                    checked={draft.donateAll}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        donateAll: e.target.checked,
                        selectedOrgans: e.target.checked
                          ? [...ALL_ELIGIBLE_ORGANS]
                          : prev.selectedOrgans,
                      }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">
                      Donate all eligible organs and tissues
                    </span>
                    <span className="text-xs text-slate-600">
                      Includes Heart, Kidneys, Liver, Corneas, Lungs, Pancreas, and Tissue as clinically appropriate.
                    </span>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-slate-600">
                    Or select specific organs and tissues individually (
                    <strong className="font-mono text-slate-900">
                      {draft.donateAll
                        ? ALL_ELIGIBLE_ORGANS.length
                        : draft.selectedOrgans.length}
                      /{ALL_ELIGIBLE_ORGANS.length}
                    </strong>{" "}
                    selected):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        donateAll: false,
                        selectedOrgans: [],
                      }))
                    }
                    className="text-teal-800 hover:text-teal-950 font-semibold underline"
                  >
                    Clear selection
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_ELIGIBLE_ORGANS.map((organ) => {
                    const checked =
                      draft.donateAll || draft.selectedOrgans.includes(organ);
                    return (
                      <label
                        key={organ}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          checked
                            ? "border-teal-700 bg-teal-50/60 text-teal-950"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSpecificOrgan(organ)}
                          data-testid={`organ-checkbox-${organ.toLowerCase()}`}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                        <span>{organ}</span>
                      </label>
                    );
                  })}
                </div>

                {formErrors.selectedOrgans && (
                  <p role="alert" className="text-xs font-medium text-red-700">
                    {formErrors.selectedOrgans}
                  </p>
                )}
              </fieldset>

              {/* Next of Kin / Emergency Contact Notification */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-teal-700" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Next-of-Kin / Legal Representative Notification
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nok-name" className="text-xs font-semibold text-slate-800">
                      Family Member / Representative Name *
                    </Label>
                    <Input
                      id="nok-name"
                      type="text"
                      value={draft.nextOfKinName}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          nextOfKinName: e.target.value,
                        }))
                      }
                      placeholder="e.g. Sita Sharma"
                      aria-invalid={Boolean(formErrors.nextOfKinName)}
                      className="rounded-xl border-slate-300"
                    />
                    {formErrors.nextOfKinName && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {formErrors.nextOfKinName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nok-relation" className="text-xs font-semibold text-slate-800">
                      Relationship *
                    </Label>
                    <Input
                      id="nok-relation"
                      type="text"
                      value={draft.nextOfKinRelation}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          nextOfKinRelation: e.target.value,
                        }))
                      }
                      placeholder="e.g. Mother, Spouse, Sibling"
                      aria-invalid={Boolean(formErrors.nextOfKinRelation)}
                      className="rounded-xl border-slate-300"
                    />
                    {formErrors.nextOfKinRelation && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {formErrors.nextOfKinRelation}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="nok-phone" className="text-xs font-semibold text-slate-800">
                      Emergency Contact Phone *
                    </Label>
                    <Input
                      id="nok-phone"
                      type="tel"
                      value={draft.nextOfKinPhone}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          nextOfKinPhone: e.target.value,
                        }))
                      }
                      placeholder="e.g. +91 98490 22334"
                      aria-invalid={Boolean(formErrors.nextOfKinPhone)}
                      className="rounded-xl border-slate-300 font-mono"
                    />
                    {formErrors.nextOfKinPhone && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {formErrors.nextOfKinPhone}
                      </p>
                    )}
                  </div>
                </div>

                <label
                  htmlFor="nok-informed-checkbox"
                  className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    id="nok-informed-checkbox"
                    type="checkbox"
                    checked={draft.nextOfKinInformed}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        nextOfKinInformed: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                  />
                  <span>
                    I have informed (or will share my summary with) my next of kin so they are aware of my donation wishes.
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSharePreviewOpen((s) => !s)}
                    data-testid="toggle-share-summary-btn"
                    className="text-xs font-semibold border-slate-300 text-slate-800"
                  >
                    <Share2 size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
                    {sharePreviewOpen
                      ? "Hide Family Summary Message"
                      : "Generate Shareable Family Summary"}
                  </Button>
                </div>

                {sharePreviewOpen && (
                  <div
                    data-testid="family-summary-box"
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Ready-to-Share Family Notification Message
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCopyFamilyMessage}
                        className="text-xs h-8"
                      >
                        {copiedMsg ? (
                          <>
                            <Check size={13} className="mr-1 text-emerald-700" aria-hidden="true" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="mr-1" aria-hidden="true" />
                            Copy Message
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-lg p-3">
                      {shareableMessage}
                    </pre>
                  </div>
                )}
              </div>

              {/* Legal Disclaimer & Official Registry Guidance */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-950">
                  <Info size={16} className="text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1.5 leading-relaxed">
                    <div className="font-bold">
                      Important Legal & National Registry Notice
                    </div>
                    <p>
                      This pledge serves as your personal health directive within Care Preempt so your emergency profile and family reflect your wishes. For formal legal enrollment, please also register with your official national organ donor registry:
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1 font-semibold">
                      <a
                        href="https://notto.mohfw.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-800 underline hover:text-teal-950"
                      >
                        NOTTO India National Registry
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                      <a
                        href="https://www.organdonor.gov/sign-up"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-800 underline hover:text-teal-950"
                      >
                        OrganDonor.gov (US Registry)
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                <label
                  htmlFor="pledge-consent-checkbox"
                  className="flex items-start gap-2.5 text-xs font-medium text-slate-900 cursor-pointer pt-2 border-t border-amber-200/80"
                >
                  <input
                    id="pledge-consent-checkbox"
                    type="checkbox"
                    checked={draft.consentAcknowledged}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        consentAcknowledged: e.target.checked,
                      }))
                    }
                    data-testid="pledge-consent-checkbox"
                    className="h-4 w-4 mt-0.5 rounded border-slate-400 text-teal-700 focus:ring-teal-700"
                  />
                  <span>
                    I understand this is a voluntary personal health directive within Care Preempt and consent to displaying my Verified Donor Pledge status on my Emergency Medical Profile. *
                  </span>
                </label>

                {formErrors.consentAcknowledged && (
                  <p role="alert" className="text-xs font-medium text-red-700">
                    {formErrors.consentAcknowledged}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <Button
              type="submit"
              data-testid="save-organ-pledge-btn"
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6"
            >
              {draft.isDonor
                ? "Review & Save Organ Donor Pledge"
                : "Save Donor Status"}
            </Button>
          </div>
        </form>

        {/* Section 3: Digital Organ Donor Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 donor-card-print-area">
            <div className="flex items-center justify-between gap-2 no-print">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Digital Organ Donor Card
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {organPledge.pledgeId || "PREVIEW"}
              </span>
            </div>

            {organPledge.isDonor ? (
              <div
                data-testid="digital-donor-card"
                className="rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-teal-800 text-white p-6 space-y-5 shadow-lg border border-teal-700/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">
                      Care Preempt · Donor Directive
                    </div>
                    <div className="font-display text-xl font-bold text-white mt-1">
                      {holderName}
                    </div>
                    <div className="text-xs text-teal-100 font-mono mt-0.5">
                      ID: {organPledge.pledgeId} · Blood: {bloodGroup}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-2.5 py-1 rounded-lg flex-shrink-0">
                    <CheckCircle2 size={13} aria-hidden="true" />
                    Verified Pledge
                  </span>
                </div>

                <div className="pt-4 border-t border-white/15 space-y-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-teal-200">
                      Donation Preferences
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5 leading-snug">
                      {organPledge.donateAll
                        ? "All Eligible Organs & Tissues"
                        : organPledge.selectedOrgans.join(", ")}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-teal-200">
                      Next of Kin / Emergency Representative
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {organPledge.nextOfKinName} ({organPledge.nextOfKinRelation})
                    </div>
                    <div className="text-xs font-mono text-teal-100 mt-0.5">
                      {organPledge.nextOfKinPhone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] text-slate-200">
                    <span>Pledge Date: {formattedPledgeDate}</span>
                    <span>Personal Directive</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center space-y-2.5">
                <HeartHandshake
                  size={28}
                  className="text-teal-700 mx-auto"
                  aria-hidden="true"
                />
                <div className="text-sm font-bold text-slate-900">
                  Your Digital Donor Card Will Appear Here
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete and confirm the Organ Donation Pledge form on the left to automatically generate your printable and downloadable card, plus a Verified Donor Pledge badge on your Emergency Medical Profile.
                </p>
              </div>
            )}

            {/* Print & Download Controls */}
            <div className="grid grid-cols-2 gap-3 no-print">
              <Button
                type="button"
                variant="outline"
                disabled={!organPledge.isDonor}
                onClick={handlePrintCard}
                data-testid="print-donor-card-btn"
                className="text-xs font-semibold border-slate-300 text-slate-800"
              >
                <Printer size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
                Print Card
              </Button>
              <Button
                type="button"
                disabled={!organPledge.isDonor}
                onClick={handleDownloadCard}
                data-testid="download-donor-card-btn"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                <Download size={14} className="mr-1.5" aria-hidden="true" />
                Download Card
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before saving sensitive Organ Donor Pledge */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-pledge-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="confirm-pledge-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Confirm Organ Donation Preferences
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Please verify these details before updating your personal health directive and Emergency Medical Profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Cancel saving organ pledge"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {draft.isDonor ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1.5">
                <div>
                  Status: <strong className="text-emerald-800">Active Organ Donor Pledge</strong>
                </div>
                <div>
                  Organs:{" "}
                  <strong>
                    {draft.donateAll
                      ? "All Eligible Organs & Tissues"
                      : draft.selectedOrgans.join(", ")}
                  </strong>
                </div>
                <div>
                  Next of Kin:{" "}
                  <strong>
                    {draft.nextOfKinName} ({draft.nextOfKinRelation}) ·{" "}
                    {draft.nextOfKinPhone}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700">
                Status: <strong>Not Pledged / Paused</strong>. Your Verified Donor Pledge badge will be hidden from your Emergency Medical Profile.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
              >
                Review Again
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSave}
                data-testid="confirm-organ-pledge-btn"
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Confirm & Save Pledge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
