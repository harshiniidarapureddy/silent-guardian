import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowAccessibilityOnboarding } from "./accessibilityLogic";
import {
  computeAdminAccessibilityStats,
  computeAdminOrganDonorStats,
  computeHospitalInclusiveSummary,
  enrichPatientsWithInclusiveData,
  filterHospitalPatients,
  loadAdminDeviceCatalog,
  loadAdminEducationalResources,
  saveAdminDeviceCatalog,
  saveAdminEducationalResources,
  type StorageLike,
} from "./portalInclusiveData";
import {
  clearAuthSignupDraft,
  clearOnboardingDraft,
  loadAuthSignupDraft,
  loadOnboardingDraft,
  saveAuthSignupDraft,
  saveOnboardingDraft,
  type SessionStorageLike,
} from "./signupDraft";
import type { PatientRecord } from "../types";

function createMemoryStorage(): StorageLike & SessionStorageLike {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

test("shouldShowAccessibilityOnboarding strictly restricts modal to onboarded patient accounts", () => {
  // Admin accounts must NEVER trigger onboarding modal
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "admin", onboarded: true },
      "/admin",
      { onboardingCompleted: false }
    ),
    false
  );
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "admin", onboarded: true },
      "/patient",
      { onboardingCompleted: false }
    ),
    false
  );

  // Hospital accounts must NEVER trigger onboarding modal
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "hospital", onboarded: true },
      "/hospital",
      { onboardingCompleted: false }
    ),
    false
  );
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "hospital", onboarded: true },
      "/hospital/intake",
      { onboardingCompleted: false }
    ),
    false
  );

  // Un-onboarded patient still completing registration must NOT trigger it
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "patient", onboarded: false },
      "/onboarding",
      { onboardingCompleted: false }
    ),
    false
  );
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "patient", onboarded: false },
      "/patient",
      { onboardingCompleted: false }
    ),
    false
  );

  // Onboarded patient who already completed accessibility onboarding must NOT trigger it
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "patient", onboarded: true },
      "/patient",
      { onboardingCompleted: true }
    ),
    false
  );

  // Onboarded patient on /patient who has not completed accessibility setup MUST trigger it
  assert.equal(
    shouldShowAccessibilityOnboarding(
      { role: "patient", onboarded: true },
      "/patient",
      { onboardingCompleted: false }
    ),
    true
  );
});

test("Hospital patient enrichment & inclusive filtering expose accessibility badges and organ donor directives", () => {
  const sample: PatientRecord[] = [
    {
      id: "pt-1",
      name: "Aarav Rao",
      age: 42,
      gender: "Male",
      issue: "Acute Chest Pain",
      severity: "critical",
      location: "Hyderabad",
      blood_group: "O+",
      assigned_doctor: "Dr. Menon",
      admitted: true,
      admission_time: "10:15 AM",
    },
    {
      id: "pt-2",
      name: "Lakshmi Devi",
      age: 64,
      gender: "Female",
      issue: "Shortness of Breath",
      severity: "high",
      location: "Bengaluru",
      blood_group: "A+",
      assigned_doctor: "Dr. Nair",
      admitted: false,
      admission_time: "10:22 AM",
    },
    {
      id: "pt-3",
      name: "Vikram Patel",
      age: 29,
      gender: "Male",
      issue: "Road Traffic Trauma",
      severity: "critical",
      location: "Mumbai",
      blood_group: "B+",
      assigned_doctor: "Dr. Khan",
      admitted: true,
      admission_time: "10:30 AM",
    },
  ];

  const storage = createMemoryStorage();
  storage.setItem(
    "sg_organ_pledge_citizen@carepreempt.com",
    JSON.stringify({
      isDonor: true,
      donateAll: false,
      selectedOrgans: ["Corneas", "Kidneys"],
      nextOfKinName: "Sita Sharma",
      nextOfKinRelation: "Mother",
      nextOfKinPhone: "+91 98490 22334",
      nextOfKinInformed: true,
      pledgeId: "CP-LIVE-9988",
      pledgedAt: "2026-10-20",
    })
  );

  const enriched = enrichPatientsWithInclusiveData(sample, storage);
  assert.equal(enriched[0].organDonor?.pledgeId, "CP-LIVE-9988");
  assert.deepEqual(enriched[0].organDonor?.selectedOrgans, ["Corneas", "Kidneys"]);
  assert.ok(enriched[0].accessibilityProfile?.badges.length);
  assert.ok(enriched[1].accessibilityProfile?.needsVisualFirst);

  const summary = computeHospitalInclusiveSummary(enriched);
  assert.equal(summary.totalPatients, 3);
  assert.ok(summary.voiceCount >= 1);
  assert.ok(summary.visualFirstCount >= 1);
  assert.ok(summary.organDonorCount >= 2);

  const donorsOnly = filterHospitalPatients(enriched, {
    search: "",
    severity: "all",
    gender: "all",
    inclusiveFilter: "organ_donor",
  });
  assert.ok(donorsOnly.every((p) => p.organDonor?.isDonor));

  const visualOnly = filterHospitalPatients(enriched, {
    search: "",
    severity: "all",
    gender: "all",
    inclusiveFilter: "visual_first",
  });
  assert.ok(visualOnly.length >= 1);
  assert.ok(visualOnly.every((p) => p.accessibilityProfile?.needsVisualFirst));
});

test("Admin accessibility & organ donation registry stats aggregate live data without PII and persist catalog updates", () => {
  const storage = createMemoryStorage();
  storage.setItem(
    "sg_a11y_patient1@example.com",
    JSON.stringify({ handsFreeVoice: true, visualFirst: true, onboardingCompleted: true })
  );
  storage.setItem(
    "sg_assistive_devices_patient1@example.com",
    JSON.stringify([
      {
        id: "dev-1",
        name: "AI Smart Vision Glasses",
        type: "smart_glasses",
        connected: true,
      },
    ])
  );
  storage.setItem(
    "sg_organ_pledge_patient1@example.com",
    JSON.stringify({
      isDonor: true,
      donateAll: true,
      selectedOrgans: ["Heart", "Kidneys"],
      nextOfKinInformed: true,
    })
  );

  const a11yStats = computeAdminAccessibilityStats(storage);
  assert.equal(a11yStats.localLiveProfilesCount, 1);
  assert.equal(a11yStats.voiceModeUsers, 319);
  assert.equal(a11yStats.visualFirstUsers, 265);
  assert.ok(a11yStats.totalRegisteredDevices > 500);

  const donorStats = computeAdminOrganDonorStats(storage);
  assert.equal(donorStats.totalPledges, 649);
  assert.ok(donorStats.optInRatePercent > 30);
  assert.equal(donorStats.organBreakdown.length, 7);
  // Ensure anonymized output contains no personal names/emails/phones
  const serialized = JSON.stringify(donorStats);
  assert.equal(serialized.includes("patient1@example.com"), false);
  assert.equal(serialized.includes("+91"), false);

  // Resource & Catalog persistence
  const resources = loadAdminEducationalResources(storage);
  assert.ok(resources.length >= 4);
  const updatedResources = resources.map((r, i) =>
    i === 0 ? { ...r, verified: !r.verified } : r
  );
  saveAdminEducationalResources(updatedResources, storage);
  assert.equal(loadAdminEducationalResources(storage)[0].verified, !resources[0].verified);

  const catalog = loadAdminDeviceCatalog(storage);
  assert.ok(catalog.length >= 4);
  const updatedCatalog = catalog.map((c, i) =>
    i === 0 ? { ...c, featured: !c.featured } : c
  );
  saveAdminDeviceCatalog(updatedCatalog, storage);
  assert.equal(loadAdminDeviceCatalog(storage)[0].featured, !catalog[0].featured);
});

test("Signup and Onboarding drafts preserve form fields, step, and scrollY across video modal open/close", () => {
  const sess = createMemoryStorage();

  saveAuthSignupDraft(
    {
      mode: "signup",
      role: "patient",
      email: "meera@example.com",
      phone: "+91 98450 99887",
      scrollY: 120,
    },
    sess
  );

  const loadedAuth = loadAuthSignupDraft(sess);
  assert.equal(loadedAuth?.email, "meera@example.com");
  assert.equal(loadedAuth?.phone, "+91 98450 99887");
  assert.equal(loadedAuth?.scrollY, 120);

  saveOnboardingDraft(
    {
      step: 2,
      name: "Meera Nair",
      phone: "+91 98450 99887",
      age: "31",
      gender: "Female",
      language: "en",
      location: "Bengaluru",
      customLocation: "",
      bloodGroup: "AB+",
      willingToDonate: true,
      firstAidLevel: "certified",
      guardianName: "",
      guardianPhone: "",
      agreeConsent: true,
      selectedAvatar: "https://example.com/avatar.svg",
      scrollY: 260,
    },
    sess
  );

  const loadedOnboarding = loadOnboardingDraft(sess);
  assert.equal(loadedOnboarding?.step, 2);
  assert.equal(loadedOnboarding?.name, "Meera Nair");
  assert.equal(loadedOnboarding?.bloodGroup, "AB+");
  assert.equal(loadedOnboarding?.firstAidLevel, "certified");
  assert.equal(loadedOnboarding?.scrollY, 260);

  clearAuthSignupDraft(sess);
  clearOnboardingDraft(sess);
  assert.equal(loadAuthSignupDraft(sess), null);
  assert.equal(loadOnboardingDraft(sess), null);
});
