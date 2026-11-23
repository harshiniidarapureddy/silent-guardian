import React, { useMemo, useState } from "react";
import {
  Activity,
  Battery,
  Bluetooth,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Ear,
  Eye,
  Glasses,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAccessibility } from "../../context/AccessibilityContext";
import type {
  AssistiveDevice,
  AssistiveDeviceType,
  AssistiveTechCategory,
  RecommendedAssistiveDevice,
} from "../../types";
import {
  RECOMMENDED_ASSISTIVE_TECH,
  filterRecommendedDevices,
  getAltTextForDevice,
  getDefaultTipsForDeviceType,
  getVisualKeyForDevice,
  validateAssistiveDevice,
} from "../../lib/accessibilityLogic";
import {
  getWhereToBuyGuide,
  type WhereToBuyGuide,
} from "../../lib/specialDevicesLogic";
import { WhereToBuyDrawer } from "../shared/WhereToBuyDrawer";
import { DeviceVisual } from "./DeviceVisual";
import { SmartVisionGlassesGuide } from "./SmartVisionGlassesGuide";

const DEVICE_TYPE_LABEL: Record<AssistiveDeviceType, string> = {
  smart_glasses: "Specialized Smart Glasses",
  hearing_aid: "Hearing Aid / Hearing Machine",
  mobility_sensory: "Mobility & Sensory Aid",
  vitals_monitoring: "Vitals & Health Monitoring",
};

const CATEGORIES: Array<AssistiveTechCategory | "All"> = [
  "All",
  "Vision Support",
  "Hearing Support",
  "Hands-Free Control",
  "Mobility Aids",
  "Vitals & Health Monitoring",
];

function DeviceTypeIcon({
  type,
  size = 18,
}: {
  type: AssistiveDeviceType;
  size?: number;
}) {
  if (type === "vitals_monitoring") return <Activity size={size} aria-hidden="true" />;
  if (type === "smart_glasses") return <Glasses size={size} aria-hidden="true" />;
  if (type === "hearing_aid") return <Ear size={size} aria-hidden="true" />;
  return <SlidersHorizontal size={size} aria-hidden="true" />;
}

export function AssistiveDevicesHub() {
  const {
    devices,
    preferences,
    addDevice,
    removeDevice,
    toggleDeviceSync,
    speak,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<
    "connected" | "directory" | "vision_guide"
  >("connected");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

  // Directory filters
  const [category, setCategory] = useState<AssistiveTechCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for registering a device
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceType, setDeviceType] =
    useState<AssistiveDeviceType>("smart_glasses");
  const [connectionType, setConnectionType] = useState<
    "Bluetooth LE" | "Companion App" | "USB-C / Bridge"
  >("Bluetooth LE");
  const [batteryLevel, setBatteryLevel] = useState("90");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation modals
  const [pendingDevice, setPendingDevice] = useState<AssistiveDevice | null>(
    null
  );
  const [deviceToRemove, setDeviceToRemove] = useState<AssistiveDevice | null>(
    null
  );
  const [buyGuide, setBuyGuide] = useState<WhereToBuyGuide | null>(null);

  const filteredDirectory = useMemo(
    () =>
      filterRecommendedDevices(
        RECOMMENDED_ASSISTIVE_TECH,
        category,
        searchQuery
      ),
    [category, searchQuery]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: RECOMMENDED_ASSISTIVE_TECH.length,
    };
    for (const cat of CATEGORIES) {
      if (cat === "All") continue;
      counts[cat] = RECOMMENDED_ASSISTIVE_TECH.filter(
        (item) => item.category === cat
      ).length;
    }
    return counts;
  }, []);

  const connectedCount = devices.filter((d) => d.connected).length;

  const handleToggleSync = (device: AssistiveDevice) => {
    toggleDeviceSync(device.id);
    const nextLabel = device.connected ? "set to standby" : "connected and synced";
    toast.success(`${device.name} ${nextLabel}.`);
    speak(`${device.name} is now ${nextLabel}.`, {
      title: "Assistive Device Status",
      source: "guidance",
    });
  };

  const handleValidateAndPreviewAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBattery = Number(batteryLevel);
    const check = validateAssistiveDevice({
      name: deviceName,
      model: deviceModel,
      type: deviceType,
      connectionType,
      batteryLevel: parsedBattery,
      notes,
    });
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }
    setFormErrors({});
    const cleanName = deviceName.trim();
    const cleanModel = deviceModel.trim();
    setPendingDevice({
      id: `adev-${Date.now()}`,
      name: cleanName,
      model: cleanModel,
      type: deviceType,
      connectionType,
      connected: true,
      batteryLevel: Math.round(parsedBattery),
      lastSynced: "Paired just now",
      notes: notes.trim() || undefined,
      visualKey: getVisualKeyForDevice(deviceType, `${cleanName} ${cleanModel}`),
      altText: getAltTextForDevice(deviceType, cleanName, cleanModel),
      troubleshootingTips: getDefaultTipsForDeviceType(deviceType),
    });
  };

  const handleConfirmRegister = () => {
    if (!pendingDevice) return;
    addDevice(pendingDevice);
    toast.success(`${pendingDevice.name} registered and paired with Care Preempt.`);
    speak(`${pendingDevice.name} has been added to your connected assistive devices.`, {
      title: "Assistive Device Registered",
      source: "guidance",
    });
    setPendingDevice(null);
    setShowAddForm(false);
    setDeviceName("");
    setDeviceModel("");
    setNotes("");
    setBatteryLevel("90");
    setActiveTab("connected");
  };

  const handleRegisterFromDirectory = (rec: RecommendedAssistiveDevice) => {
    setPendingDevice({
      id: `adev-${Date.now()}`,
      name: rec.name,
      model: `${rec.manufacturer} · ${rec.name}`,
      type: rec.deviceType,
      connectionType: "Bluetooth LE",
      connected: true,
      batteryLevel: 100,
      lastSynced: "Paired via Care Preempt",
      notes: rec.compatibilityNote,
      visualKey: rec.visualKey,
      altText: rec.altText,
      troubleshootingTips: getDefaultTipsForDeviceType(rec.deviceType),
    });
  };

  const handleConfirmRemove = () => {
    if (!deviceToRemove) return;
    removeDevice(deviceToRemove.id);
    toast.info(`${deviceToRemove.name} removed from your connected devices.`);
    setDeviceToRemove(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="assistive-devices-hub">
      {/* Page Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Assistive Hardware & Sensory Support
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Assistive Devices Hub
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pair and manage personal AI vision-assist glasses, bone-conduction audio specs, rechargeable hearing aids, and mobility switches so Care Preempt adapts alerts cleanly to your hardware.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div>
            <div className="text-xs font-medium text-slate-500">Connected</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
              {connectedCount}
              <span className="text-sm font-normal text-slate-400">
                /{devices.length}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setActiveTab("connected");
              setShowAddForm(true);
            }}
            data-testid="open-add-device-btn"
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-4"
          >
            <Plus size={15} className="mr-1.5" aria-hidden="true" />
            Register Device
          </Button>
        </div>
      </div>

      {/* Visual-First structured steps guidance when Visual-First mode is enabled */}
      {preferences.visualFirst && (
        <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-3">
            Visual-First Quick Steps · Connecting Assistive Hardware
          </div>
          <ol className="grid sm:grid-cols-3 gap-4 text-xs text-slate-800">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                1
              </span>
              <span>
                <strong>Power on pairing mode</strong> on your smart glasses, hearing aid, or mobility sensor.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                2
              </span>
              <span>
                <strong>Select Connect & Sync</strong> on the device card below to link companion alerts.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center flex-shrink-0 font-mono">
                3
              </span>
              <span>
                <strong>Visual banners stay active</strong> even if your device battery runs low.
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Accessible Tab Switcher */}
      <div
        role="tablist"
        aria-label="Assistive Devices Hub Sections"
        className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-200/70 border border-slate-200 w-fit max-w-full"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "connected"}
          onClick={() => setActiveTab("connected")}
          data-testid="tab-connected-devices"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
            activeTab === "connected"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          My Connected Devices ({devices.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "directory"}
          onClick={() => setActiveTab("directory")}
          data-testid="tab-recommended-directory"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
            activeTab === "directory"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Recommended Tech Directory ({RECOMMENDED_ASSISTIVE_TECH.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "vision_guide"}
          onClick={() => setActiveTab("vision_guide")}
          data-testid="tab-smart-vision-guide"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
            activeTab === "vision_guide"
              ? "bg-white text-teal-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Eye size={15} className="text-teal-700" aria-hidden="true" />
          <span>How Smart Vision Glasses Work</span>
        </button>
      </div>

      {/* TAB 1: MY CONNECTED DEVICES */}
      {activeTab === "connected" && (
        <div className="space-y-6" role="tabpanel">
          {showAddForm && (
            <form
              onSubmit={handleValidateAndPreviewAdd}
              noValidate
              data-testid="register-device-form"
              className="rounded-2xl bg-white border border-teal-200 p-6 space-y-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Register an Assistive Device
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Add your smart glasses, hearing machine, or mobility/switch controller for companion syncing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                  }}
                  aria-label="Close registration form"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adev-type" className="text-xs font-semibold text-slate-800">
                    Device Category *
                  </Label>
                  <select
                    id="adev-type"
                    value={deviceType}
                    onChange={(e) =>
                      setDeviceType(e.target.value as AssistiveDeviceType)
                    }
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="smart_glasses">
                      Specialized Smart Glasses (AI Vision / Captioned AR)
                    </option>
                    <option value="hearing_aid">
                      Hearing Aid / Hearing Machine
                    </option>
                    <option value="mobility_sensory">
                      Mobility, Switch, or Bone-Conduction Aid
                    </option>
                    <option value="vitals_monitoring">
                      Vitals &amp; Health Monitoring (BP, Oximeter, Glucometer, ECG)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adev-conn" className="text-xs font-semibold text-slate-800">
                    Connection Method *
                  </Label>
                  <select
                    id="adev-conn"
                    value={connectionType}
                    onChange={(e) =>
                      setConnectionType(
                        e.target.value as
                          | "Bluetooth LE"
                          | "Companion App"
                          | "USB-C / Bridge"
                      )
                    }
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="Bluetooth LE">Bluetooth LE Direct Pairing</option>
                    <option value="Companion App">Companion Mobile App Sync</option>
                    <option value="USB-C / Bridge">USB-C / Wireless Bridge</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adev-name" className="text-xs font-semibold text-slate-800">
                    Personal Device Label *
                  </Label>
                  <Input
                    id="adev-name"
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g. Everyday Vision Glasses"
                    aria-invalid={Boolean(formErrors.name)}
                    className="rounded-xl border-slate-300"
                  />
                  {formErrors.name && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adev-model" className="text-xs font-semibold text-slate-800">
                    Model & Manufacturer *
                  </Label>
                  <Input
                    id="adev-model"
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. OrCam MyEye Pro 3"
                    aria-invalid={Boolean(formErrors.model)}
                    className="rounded-xl border-slate-300"
                  />
                  {formErrors.model && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {formErrors.model}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adev-battery" className="text-xs font-semibold text-slate-800">
                    Current Battery Level (%)
                  </Label>
                  <Input
                    id="adev-battery"
                    type="number"
                    min={0}
                    max={100}
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(e.target.value)}
                    className="rounded-xl border-slate-300 font-mono"
                  />
                  {formErrors.batteryLevel && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {formErrors.batteryLevel}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adev-notes" className="text-xs font-semibold text-slate-800">
                    Clinical / Usage Notes (Optional)
                  </Label>
                  <Input
                    id="adev-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Used for medicine label OCR and hospital visits"
                    className="rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="submit-device-form-btn"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Review & Pair Device
                </Button>
              </div>
            </form>
          )}

          {devices.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
                <Glasses size={22} aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                No Assistive Devices Registered Yet
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Register your smart glasses, hearing aids, or switch controllers to monitor pairing status and receive tailored clinical alert routing.
              </p>
              <Button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                <Plus size={15} className="mr-1.5" aria-hidden="true" />
                Add Your First Device
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {devices.map((device) => {
                const tipsOpen = Boolean(expandedTips[device.id]);
                const lowBattery = device.batteryLevel <= 20;
                const visualKey =
                  device.visualKey ||
                  getVisualKeyForDevice(
                    device.type,
                    `${device.name} ${device.model}`
                  );
                const altText =
                  device.altText ||
                  getAltTextForDevice(device.type, device.name, device.model);
                return (
                  <article
                    key={device.id}
                    data-testid={`device-card-${device.id}`}
                    className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 pb-0">
                      <DeviceVisual
                        visualKey={visualKey}
                        alt={altText}
                        caption={device.model}
                      />
                    </div>

                    <div className="p-6 pt-4 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                device.connected
                                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              <DeviceTypeIcon type={device.type} size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-500">
                                {DEVICE_TYPE_LABEL[device.type]} · {device.connectionType}
                              </p>
                              <h3 className="font-display text-base font-bold text-slate-900 truncate">
                                {device.name}
                              </h3>
                              <p className="text-xs text-slate-600 truncate">
                                {device.model}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold flex-shrink-0 ${
                              device.connected
                                ? "text-emerald-800"
                                : "text-slate-600"
                            }`}
                          >
                            {device.connected ? (
                              <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
                            ) : (
                              <WifiOff size={15} className="text-slate-400" aria-hidden="true" />
                            )}
                            <span>{device.connected ? "Connected" : "Standby"}</span>
                          </span>
                        </div>

                        {/* Battery & Sync Status Row */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Battery size={14} aria-hidden="true" />
                                Battery
                              </span>
                              <span
                                className={`font-mono font-bold tabular-nums ${
                                  lowBattery ? "text-amber-700" : "text-slate-900"
                                }`}
                              >
                                {device.batteryLevel}%
                              </span>
                            </div>
                            <div
                              className="h-2 rounded-full bg-slate-100 overflow-hidden"
                              role="progressbar"
                              aria-valuenow={device.batteryLevel}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${device.name} battery level`}
                            >
                              <div
                                className={`h-full rounded-full transition-all ${
                                  lowBattery ? "bg-amber-600" : "bg-teal-700"
                                }`}
                                style={{ width: `${device.batteryLevel}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">Companion Sync</div>
                            <div className="text-xs font-semibold text-slate-800">
                              {device.lastSynced}
                            </div>
                          </div>
                        </div>

                        {device.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {device.notes}
                          </p>
                        )}

                        {/* Expandable Troubleshooting Tips */}
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTips((prev) => ({
                                ...prev,
                                [device.id]: !prev[device.id],
                              }))
                            }
                            aria-expanded={tipsOpen}
                            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-teal-800 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-lg"
                          >
                            <span className="flex items-center gap-1.5">
                              <HelpCircle size={14} className="text-teal-700" aria-hidden="true" />
                              Quick Troubleshooting Tips
                            </span>
                            {tipsOpen ? (
                              <ChevronUp size={15} aria-hidden="true" />
                            ) : (
                              <ChevronDown size={15} aria-hidden="true" />
                            )}
                          </button>
                          {tipsOpen && (
                            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 list-disc pl-5">
                              {device.troubleshootingTips.map((tip, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Device Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleSync(device)}
                            data-testid={`sync-toggle-${device.id}`}
                            className="text-xs font-semibold border-slate-300 text-slate-800 hover:border-teal-700 hover:text-teal-900 whitespace-nowrap"
                          >
                            {device.connected ? (
                              <>
                                <RefreshCw size={13} className="mr-1.5" aria-hidden="true" />
                                Disconnect / Standby
                              </>
                            ) : (
                              <>
                                <Bluetooth size={13} className="mr-1.5 text-teal-700" aria-hidden="true" />
                                Connect & Sync
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid={`where-to-buy-connected-${device.id}`}
                            onClick={() =>
                              setBuyGuide(
                                getWhereToBuyGuide(`${device.name} ${device.model}`)
                              )
                            }
                            className="text-xs font-semibold border-teal-200 text-teal-800 bg-teal-50/50 hover:bg-teal-100/70 whitespace-nowrap"
                          >
                            <ShoppingBag size={13} className="mr-1.5" aria-hidden="true" />
                            Where to Buy
                          </Button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeviceToRemove(device)}
                          aria-label={`Remove ${device.name}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMMENDED ASSISTIVE TECH DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-6" role="tabpanel">
          {/* Category Filters & Search */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter assistive technology by support category"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  data-testid={`dir-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                    category === cat
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat} ({categoryCounts[cat] ?? 0})
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="directory-search" className="sr-only">
                Search recommended assistive devices
              </label>
              <Input
                id="directory-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search glasses, BP monitor, oximeter, glucometer..."
                className="pl-9 rounded-xl border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Dedicated Interactive Spotlight inside Vision Support category */}
          {category === "Vision Support" && <SmartVisionGlassesGuide />}

          {/* Quick callout banner when browsing All categories */}
          {category === "All" && (
            <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
                  <Glasses size={18} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Explore AI Smart Vision Glasses for Blind & Visually Impaired Users
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    See the interactive hardware diagram, step-by-step OCR & obstacle detection guide, and live SOS audio sync demo.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setCategory("Vision Support")}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex-shrink-0"
              >
                Open Vision Support Spotlight
              </Button>
            </div>
          )}

          {/* Directory Cards with Studio Visuals */}
          <div className="grid md:grid-cols-2 gap-5" data-testid="directory-results-grid">
            {filteredDirectory.map((item) => (
              <article
                key={item.id}
                data-testid={`directory-card-${item.id}`}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 pb-0">
                  <DeviceVisual
                    visualKey={item.visualKey}
                    alt={item.altText}
                    caption={item.name}
                  />
                </div>

                <div className="p-6 pt-4 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center flex-shrink-0">
                        <DeviceTypeIcon type={item.deviceType} size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-teal-800">
                          {item.category} · {item.manufacturer}
                        </p>
                        <h3 className="font-display text-base font-bold text-slate-900">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-800">
                        Key Capabilities
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc pl-5">
                        {item.keyFeatures.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2">
                        <span className="font-semibold text-teal-900">
                          How to Use:{" "}
                        </span>
                        <span className="text-slate-700">
                          {item.howToUseTip || item.usageGuidance}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">
                          Care Preempt Compatibility:{" "}
                        </span>
                        <span className="text-slate-600">
                          {item.compatibilityNote}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`where-to-buy-dir-${item.id}`}
                      onClick={() => setBuyGuide(getWhereToBuyGuide(item.name))}
                      className="text-xs font-semibold border-teal-200 text-teal-800 bg-teal-50/50 hover:bg-teal-100/70 whitespace-nowrap"
                    >
                      <ShoppingBag size={13} className="mr-1.5" aria-hidden="true" />
                      Where to Buy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRegisterFromDirectory(item)}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap"
                    >
                      <Plus size={14} className="mr-1.5" aria-hidden="true" />
                      Add to My Connected Devices
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredDirectory.length === 0 && (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm text-slate-700 font-medium">
                No assistive devices matched "{searchQuery}".
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEDICATED SMART VISION GLASSES INTERACTIVE GUIDE */}
      {activeTab === "vision_guide" && (
        <div className="space-y-6" role="tabpanel">
          <SmartVisionGlassesGuide />
        </div>
      )}

      {/* Confirmation Modal: Register / Pair Device */}
      {pendingDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-add-device-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3
              id="confirm-add-device-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Confirm Device Registration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Care Preempt will save this assistive device to your profile so alert routing and troubleshooting tips stay ready across sessions.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1">
              <div>
                Device: <strong>{pendingDevice.name}</strong>
              </div>
              <div>
                Model: <strong>{pendingDevice.model}</strong>
              </div>
              <div>
                Type: <strong>{DEVICE_TYPE_LABEL[pendingDevice.type]}</strong> ·{" "}
                {pendingDevice.connectionType}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingDevice(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmRegister}
                data-testid="confirm-add-device-btn"
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Confirm & Pair Device
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Remove Device */}
      {deviceToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-remove-device-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3
              id="confirm-remove-device-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Remove Assistive Device?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to unlink <strong>{deviceToRemove.name}</strong> ({deviceToRemove.model}) from your Care Preempt account? You can register it again anytime.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeviceToRemove(null)}
              >
                Keep Device
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmRemove}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                Remove Device
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Portaled Where to Buy Drawer */}
      <WhereToBuyDrawer
        guide={buyGuide}
        mode="patient"
        onClose={() => setBuyGuide(null)}
      />
    </div>
  );
}
