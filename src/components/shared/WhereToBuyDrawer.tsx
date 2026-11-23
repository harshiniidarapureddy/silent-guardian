import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import type { WhereToBuyGuide } from "../../lib/specialDevicesLogic";

interface WhereToBuyDrawerProps {
  guide: WhereToBuyGuide | null;
  mode: "patient" | "hospital";
  onClose: () => void;
}

const AVAILABILITY_DESCRIPTIONS: Record<string, string> = {
  Retail: "Direct consumer purchase online or at authorized stores",
  "Audiologist / Prescription Fitted":
    "Requires clinical audiogram or licensed specialist fitting",
  "Hospital Bulk Supply":
    "Institutional multi-unit procurement & ward kits",
  "Government / NGO Subsidized Schemes":
    "Subsidized or free via ADIP / ALIMCO / verified NGO programs",
};

export function WhereToBuyDrawer({
  guide,
  mode,
  onClose,
}: WhereToBuyDrawerProps) {
  useEffect(() => {
    if (!guide) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [guide, onClose]);

  if (!guide) return null;

  const isHospital = mode === "hospital";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="where-to-buy-title"
      data-testid="where-to-buy-drawer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800">
              {isHospital ? (
                <Building2 size={14} aria-hidden="true" />
              ) : (
                <ShoppingBag size={14} aria-hidden="true" />
              )}
              <span>
                {isHospital
                  ? "Hospital Restock & Procurement Guide"
                  : "Verified Where to Buy Guide"}
              </span>
            </div>
            <h2
              id="where-to-buy-title"
              className="font-display text-xl font-bold text-slate-900 leading-snug"
            >
              {guide.deviceName}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {guide.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Where to Buy guide"
            data-testid="close-where-to-buy-btn"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 shrink-0"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Pricing Overview */}
          <section
            aria-label="Estimated price range"
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Estimated Retail / Clinical Price
                </div>
                <div className="mt-1 text-base font-bold text-slate-900 tabular-nums">
                  {guide.estimatedPriceRange}
                </div>
              </div>
              {guide.bulkPriceRange && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                    Hospital Bulk Procurement Est.
                  </div>
                  <div className="mt-1 text-base font-bold text-teal-900 tabular-nums">
                    {guide.bulkPriceRange}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Availability Types */}
          <section aria-label="Availability and fulfillment channels" className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Availability & Acquisition Types
            </h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {guide.availabilityTypes.map((type) => (
                <div key={type} className="px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle2
                    size={15}
                    className="text-teal-700 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">
                      {type}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {AVAILABILITY_DESCRIPTIONS[type] ||
                        "Available through verified clinical distribution"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verified Purchase Channels */}
          <section aria-label="Verified purchase channels" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Purchase & Procurement Channels
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {guide.channels.length} verified sources
              </span>
            </div>

            <div className="space-y-3">
              {guide.channels.map((channel) => (
                <div
                  key={channel.id}
                  data-testid={`purchase-channel-${channel.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-300 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-teal-800">
                        {channel.channelType} · {channel.regionNote}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-normal mt-0.5">
                        {channel.name}
                      </h4>
                    </div>
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      <span>Visit Store</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {channel.fulfillmentNote}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Subsidy / Clinical Guidance Note */}
          <section className="rounded-2xl bg-teal-50/70 border border-teal-200 p-4 flex items-start gap-3">
            <Info
              size={16}
              className="text-teal-800 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <div className="text-xs font-bold text-teal-950">
                Subsidy & Clinical Guidance
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {guide.subsidyNote}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck size={14} className="text-teal-700 shrink-0" aria-hidden="true" />
            <span>External links open safely in a new tab</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
