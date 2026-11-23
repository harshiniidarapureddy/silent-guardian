import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL_ELIGIBLE_ORGANS,
  INITIAL_ASSISTIVE_DEVICES,
  RECOMMENDED_ASSISTIVE_TECH,
  SMART_VISION_GLASSES_HOTSPOTS,
  SMART_VISION_GLASSES_STEPS,
  buildPreferencesFromOnboarding,
  filterRecommendedDevices,
  generateDonorCardSvg,
  generateNextOfKinMessage,
  getVisualKeyForDevice,
  parseVoiceCommand,
  reconcileOnboardingSelection,
  toggleAssistiveDeviceConnection,
  upsertSmartVisionGlasses,
  validateAssistiveDevice,
  validateOrganPledge,
} from "./accessibilityLogic";
import type { AssistiveTechCategory, OrganDonorPledge } from "../types";

test("reconcileOnboardingSelection handles multi-select assistive modes and exclusive Standard Experience", () => {
  let sel = reconcileOnboardingSelection([], "hands_free_voice");
  assert.deepEqual(sel, ["hands_free_voice"]);

  sel = reconcileOnboardingSelection(sel, "visual_first");
  assert.deepEqual(sel, ["hands_free_voice", "visual_first"]);

  // Selecting standard clears assistive options
  sel = reconcileOnboardingSelection(sel, "standard");
  assert.deepEqual(sel, ["standard"]);

  // Selecting an assistive option clears standard
  sel = reconcileOnboardingSelection(sel, "assistive_devices");
  assert.deepEqual(sel, ["assistive_devices"]);
});

test("buildPreferencesFromOnboarding activates adaptive sub-flags accurately", () => {
  const voiceAndVisual = buildPreferencesFromOnboarding([
    "hands_free_voice",
    "visual_first",
  ]);
  assert.equal(voiceAndVisual.handsFreeVoice, true);
  assert.equal(voiceAndVisual.visualFirst, true);
  assert.equal(voiceAndVisual.enlargedTargets, true);
  assert.equal(voiceAndVisual.autoReadAlerts, true);
  assert.equal(voiceAndVisual.simplifiedMedicalText, true);
  assert.equal(voiceAndVisual.standardExperience, false);
  assert.equal(voiceAndVisual.onboardingCompleted, true);

  const standard = buildPreferencesFromOnboarding(["standard"]);
  assert.equal(standard.handsFreeVoice, false);
  assert.equal(standard.visualFirst, false);
  assert.equal(standard.standardExperience, true);
  assert.equal(standard.onboardingCompleted, true);
});

test("parseVoiceCommand recognizes core Care Preempt voice intents", () => {
  const dash = parseVoiceCommand("Go to Dashboard");
  assert.equal(dash.type, "navigate");
  if (dash.type === "navigate") assert.equal(dash.path, "/patient");

  const alerts = parseVoiceCommand("Read my alerts please");
  assert.equal(alerts.type, "read_alerts");

  const donor = parseVoiceCommand("Open Organ Donor Card");
  assert.equal(donor.type, "navigate");
  if (donor.type === "navigate") assert.equal(donor.path, "/patient/organ-donation");

  const devices = parseVoiceCommand("Open assistive devices");
  assert.equal(devices.type, "navigate");
  if (devices.type === "navigate") assert.equal(devices.path, "/patient/devices");

  const settings = parseVoiceCommand("Open accessibility settings");
  assert.equal(settings.type, "open_settings");

  const unknown = parseVoiceCommand("Play jazz music");
  assert.equal(unknown.type, "unknown");
});

test("validateAssistiveDevice enforces required fields and battery bounds", () => {
  const bad = validateAssistiveDevice({
    name: "",
    model: "X",
    type: "smart_glasses",
    connectionType: "Bluetooth LE",
    batteryLevel: 120,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.model);
  assert.ok(bad.errors.batteryLevel);

  const good = validateAssistiveDevice({
    name: "Daily Smart Glasses",
    model: "Envision AI Titanium",
    type: "smart_glasses",
    connectionType: "Bluetooth LE",
    batteryLevel: 85,
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});

test("toggleAssistiveDeviceConnection flips pairing state cleanly", () => {
  const firstId = INITIAL_ASSISTIVE_DEVICES[0].id;
  const initialState = INITIAL_ASSISTIVE_DEVICES[0].connected;
  const toggled = toggleAssistiveDeviceConnection(INITIAL_ASSISTIVE_DEVICES, firstId);
  assert.equal(toggled[0].connected, !initialState);
  assert.equal(toggled[1].connected, INITIAL_ASSISTIVE_DEVICES[1].connected);
});

test("filterRecommendedDevices covers every category including Mobility Aids and Vitals & Health Monitoring with visualKey & altText", () => {
  const allCategories: AssistiveTechCategory[] = [
    "Vision Support",
    "Hearing Support",
    "Hands-Free Control",
    "Mobility Aids",
    "Vitals & Health Monitoring",
  ];
  for (const cat of allCategories) {
    const items = filterRecommendedDevices(RECOMMENDED_ASSISTIVE_TECH, cat, "");
    assert.ok(items.length >= 2, `Category ${cat} should have at least 2 items`);
    assert.ok(items.every((d) => d.category === cat));
    assert.ok(items.every((d) => Boolean(d.visualKey) && d.altText.length >= 20));
  }

  const vitals = filterRecommendedDevices(
    RECOMMENDED_ASSISTIVE_TECH,
    "Vitals & Health Monitoring",
    ""
  );
  assert.equal(vitals.length, 5);
  assert.ok(vitals.every((d) => Boolean(d.howToUseTip && d.howToUseTip.length >= 20)));

  const glassesSearch = filterRecommendedDevices(
    RECOMMENDED_ASSISTIVE_TECH,
    "All",
    "Envision"
  );
  assert.equal(glassesSearch.length, 1);
  assert.equal(glassesSearch[0].id, "rec-envision-glasses");
  assert.equal(getVisualKeyForDevice("smart_glasses", "OrCam"), "smart_vision_glasses");
  assert.equal(getVisualKeyForDevice("mobility_sensory", "Shokz Bone Conduction"), "bone_conduction_specs");
  assert.equal(getVisualKeyForDevice("vitals_monitoring", "Omron BP Monitor"), "bp_monitor");
  assert.equal(getVisualKeyForDevice("vitals_monitoring", "SpO2 Pulse Oximeter"), "pulse_oximeter");
  assert.equal(getVisualKeyForDevice("vitals_monitoring", "Accu-Chek Glucometer"), "glucometer");
});

test("Smart Vision Glasses guide has 4 anatomy hotspots, 4 steps, and upsertSmartVisionGlasses pairs reliably", () => {
  assert.equal(SMART_VISION_GLASSES_HOTSPOTS.length, 4);
  assert.equal(SMART_VISION_GLASSES_STEPS.length, 4);

  // Pairing when no glasses exist adds a new connected smart glasses device
  const onlyHearing = INITIAL_ASSISTIVE_DEVICES.filter((d) => d.type !== "smart_glasses");
  const added = upsertSmartVisionGlasses(onlyHearing);
  assert.equal(added.wasAdded, true);
  assert.equal(added.pairedDevice.connected, true);
  assert.equal(added.devices.length, onlyHearing.length + 1);

  // Pairing when glasses exist reconnects them in place without duplicating
  const disconnected = INITIAL_ASSISTIVE_DEVICES.map((d) =>
    d.type === "smart_glasses" ? { ...d, connected: false } : d
  );
  const reconnected = upsertSmartVisionGlasses(disconnected);
  assert.equal(reconnected.wasAdded, false);
  assert.equal(reconnected.pairedDevice.connected, true);
  assert.equal(reconnected.devices.length, disconnected.length);
});

test("validateOrganPledge requires organs, next-of-kin details, and consent when opted in", () => {
  const incomplete = validateOrganPledge({
    isDonor: true,
    donateAll: false,
    selectedOrgans: [],
    nextOfKinName: "",
    nextOfKinRelation: "",
    nextOfKinPhone: "123",
    consentAcknowledged: false,
  });
  assert.equal(incomplete.valid, false);
  assert.ok(incomplete.errors.selectedOrgans);
  assert.ok(incomplete.errors.nextOfKinName);
  assert.ok(incomplete.errors.nextOfKinRelation);
  assert.ok(incomplete.errors.nextOfKinPhone);
  assert.ok(incomplete.errors.consentAcknowledged);

  const validPledge: OrganDonorPledge = {
    isDonor: true,
    donateAll: false,
    selectedOrgans: ["Corneas", "Kidneys", "Heart"],
    nextOfKinName: "Sita Sharma",
    nextOfKinRelation: "Mother",
    nextOfKinPhone: "+91 98490 22334",
    nextOfKinInformed: true,
    pledgeId: "CP-DONOR-2026-4821",
    pledgedAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    consentAcknowledged: true,
  };
  const checked = validateOrganPledge(validPledge);
  assert.equal(checked.valid, true);

  const msg = generateNextOfKinMessage("Ramesh Sharma", validPledge);
  assert.match(msg, /Sita Sharma/);
  assert.match(msg, /Corneas, Kidneys, Heart/);
  assert.match(msg, /CP-DONOR-2026-4821/);

  const svg = generateDonorCardSvg("Ramesh Sharma", "O+", validPledge);
  assert.match(svg, /<svg /);
  assert.match(svg, /Ramesh Sharma/);
  assert.match(svg, /VERIFIED DONOR PLEDGE/);
  assert.equal(ALL_ELIGIBLE_ORGANS.length, 7);
});
