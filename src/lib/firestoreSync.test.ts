import test from "node:test";
import assert from "node:assert/strict";
import {
  mapTriageUpdateDoc,
  normalizeLanguageLabel,
  sanitizeAccessibilityPayload,
  sanitizeAssistiveDevicePayload,
  sanitizeAwarenessVideoPayload,
  sanitizeFirestoreId,
  sanitizeHospitalSpecialDevicePayload,
  sanitizeOrganPledgePayload,
  sanitizeTriageUpdatePayload,
  sanitizeUserPrivatePayload,
  sanitizeUserPublicPayload,
} from "./firestoreSync";
import {
  ALL_ELIGIBLE_ORGANS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  DEFAULT_ORGAN_PLEDGE,
} from "./accessibilityLogic";
import { INITIAL_HOSPITAL_SPECIAL_DEVICES } from "./specialDevicesLogic";
import { PREDEFINED_AWARENESS_VIDEOS } from "./awarenessVideoCatalog";

test("sanitizeFirestoreId enforces ^[a-zA-Z0-9_-]+$ and length <= 128", () => {
  assert.equal(sanitizeFirestoreId("../admin/hack?x=1"), "admin-hack-x-1");
  assert.equal(sanitizeFirestoreId("   ", "fallback_id"), "fallback_id");
  const overlong = "a".repeat(200);
  assert.ok(sanitizeFirestoreId(overlong).length <= 128);
  assert.match(sanitizeFirestoreId("usr:123/abc"), /^[a-zA-Z0-9_-]+$/);
});

test("sanitizeUserPublicPayload and sanitizeUserPrivatePayload enforce blueprint bounds", () => {
  const pub = sanitizeUserPublicPayload({
    uid: "uid_123",
    displayName: "A".repeat(140),
    role: "patient",
    language: "te",
    onboarded: true,
  });
  assert.equal(pub.displayName.length, 100);
  assert.equal(pub.language, "Telugu");
  assert.equal(normalizeLanguageLabel("unknown"), "English");

  const priv = sanitizeUserPrivatePayload({
    uid: "uid_123",
    email: "user@example.com",
    age: 250,
    bloodGroup: "INVALID",
    location: "H".repeat(200),
  });
  assert.equal(priv.age, 130);
  assert.equal("bloodGroup" in priv, false);
  assert.equal((priv.location as string).length, 120);
});

test("sanitizeAccessibilityPayload & sanitizeAssistiveDevicePayload match Firestore schema", () => {
  const a11y = sanitizeAccessibilityPayload("uid_1", {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    handsFreeVoice: true,
    enlargedTargets: true,
    onboardingCompleted: true,
  });
  assert.equal(a11y.voiceMode, true);
  assert.equal(a11y.fontScale, "large");
  assert.equal(a11y.onboardingCompleted, true);

  const { deviceId, payload } = sanitizeAssistiveDevicePayload("uid_1", {
    id: "dev/1?bad",
    name: "X",
    model: "Y",
    type: "smart_glasses",
    connectionType: "Bluetooth LE",
    connected: true,
    batteryLevel: 140,
    lastSynced: "now",
    notes: "n".repeat(400),
    troubleshootingTips: [],
  });
  assert.match(deviceId, /^[a-zA-Z0-9_-]+$/);
  assert.ok((payload.name as string).length >= 2);
  assert.equal(payload.batteryLevel, 100);
  assert.equal((payload.notes as string).length, 300);
});

test("sanitizeOrganPledgePayload strictly allowlists organs and bounds PII", () => {
  const out = sanitizeOrganPledgePayload("uid_1", {
    ...DEFAULT_ORGAN_PLEDGE,
    isDonor: true,
    donateAll: false,
    selectedOrgans: ["Heart", "Kidneys", "InvalidOrgan" as any],
    nextOfKinName: "N".repeat(150),
    nextOfKinPhone: "+91 98490 22334",
    consentAcknowledged: true,
  });
  assert.deepEqual(out.organs, ["Heart", "Kidneys"]);
  assert.equal((out.nextOfKinName as string).length, 100);
  assert.equal(out.optedIn, true);

  const allOut = sanitizeOrganPledgePayload("uid_1", {
    ...DEFAULT_ORGAN_PLEDGE,
    isDonor: true,
    donateAll: true,
    consentAcknowledged: true,
  });
  assert.deepEqual(allOut.organs, ALL_ELIGIBLE_ORGANS);
});

test("sanitizeHospitalSpecialDevicePayload enforces assignedUnits <= totalStock", () => {
  const broken = {
    ...INITIAL_HOSPITAL_SPECIAL_DEVICES[0],
    totalStock: 5,
    assignedUnits: 12,
  };
  const { payload } = sanitizeHospitalSpecialDevicePayload(broken);
  assert.equal(payload.totalStock, 5);
  assert.equal(payload.assignedUnits, 5);
});

test("sanitizeAwarenessVideoPayload enforces duration and language allowlists", () => {
  const vid = {
    ...PREDEFINED_AWARENESS_VIDEOS[0],
    durationSec: 15,
    languages: ["en", "hi", "zz" as any],
  };
  const { payload } = sanitizeAwarenessVideoPayload(vid);
  assert.equal(payload.durationSec, 60);
  assert.deepEqual(payload.languages, ["en", "hi"]);
});

test("sanitizeAssistiveDevicePayload preserves vitals_monitoring device type", () => {
  const { payload } = sanitizeAssistiveDevicePayload("uid_2", {
    id: "adev-bp-1",
    name: "Digital BP Monitor",
    model: "Omron HEM-7120",
    type: "vitals_monitoring",
    connectionType: "Bluetooth LE",
    connected: true,
    batteryLevel: 92,
    lastSynced: "Just now",
    troubleshootingTips: [],
  });
  assert.equal(payload.type, "vitals_monitoring");
});

test("sanitizeTriageUpdatePayload and mapTriageUpdateDoc enforce triage bounds", () => {
  const { triageId, payload } = sanitizeTriageUpdatePayload("uid_9", {
    triageId: "tr/99?bad",
    sessionId: "sess/1",
    symptomsSummary: "S".repeat(500),
    triageGuidance: "G".repeat(1500),
    severity: "critical",
    language: "te-IN" as any,
    guardianAlertTriggered: true,
  });
  assert.match(triageId, /^[a-zA-Z0-9_-]+$/);
  assert.equal(payload.symptomsSummary.length, 400);
  assert.equal(payload.triageGuidance.length, 1200);
  assert.equal(payload.severity, "critical");
  assert.equal(payload.language, "te");
  assert.equal(payload.guardianAlertTriggered, true);

  const mapped = mapTriageUpdateDoc(payload as Record<string, unknown>);
  assert.equal(mapped.triageId, triageId);
  assert.equal(mapped.severity, "critical");
  assert.equal(mapped.language, "te");
});

