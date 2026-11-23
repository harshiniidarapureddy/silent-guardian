import type {
  AccessibilityPreferences,
  AssistiveDevice,
  AssistiveTechCategory,
  OrganDonorPledge,
  OrganType,
  PatientAccessibilityProfile,
  PatientOrganDonorSummary,
  PatientRecord,
} from "../types";
import { RECOMMENDED_ASSISTIVE_TECH } from "./accessibilityLogic";

const ALL_ORGAN_TYPES: OrganType[] = [
  "Heart",
  "Kidneys",
  "Liver",
  "Corneas",
  "Lungs",
  "Pancreas",
  "Tissue",
];

export type HospitalInclusiveFilter =
  | "all"
  | "any_accessibility"
  | "voice_mode"
  | "visual_first"
  | "assistive_devices"
  | "organ_donor";

export interface AdminEducationalResource {
  id: string;
  title: string;
  category: "Organ Donation" | "Accessibility & Assistive Tech" | "Emergency Protocols";
  audience: "Patients & Families" | "Hospital Triage Staff" | "All Users";
  summary: string;
  verified: boolean;
  published: boolean;
  lastReviewed: string;
  sourceBody: string;
}

export interface AdminDeviceCatalogEntry {
  id: string;
  name: string;
  manufacturer: string;
  category: AssistiveTechCategory;
  compatibilityNote: string;
  verified: boolean;
  active: boolean;
  featured: boolean;
  registeredCount: number;
}

export interface AdminAccessibilityStats {
  totalTrackedPatients: number;
  voiceModeUsers: number;
  visualFirstUsers: number;
  assistiveDeviceUsers: number;
  totalRegisteredDevices: number;
  deviceBreakdown: Array<{
    key: string;
    label: string;
    count: number;
    sharePercent: number;
  }>;
  localLiveProfilesCount: number;
}

export interface AdminOrganDonorStats {
  totalPledges: number;
  totalPatientsConsidered: number;
  optInRatePercent: number;
  fullAllOrgansCount: number;
  specificOrgansCount: number;
  nextOfKinInformedRatePercent: number;
  organBreakdown: Array<{
    organ: OrganType;
    count: number;
    sharePercent: number;
  }>;
  regionalBreakdown: Array<{
    region: string;
    pledges: number;
    optInPercent: number;
  }>;
}

export interface StorageLike {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KIN_NAMES = [
  { name: "Sita Sharma", relation: "Mother", phone: "+91 98490 22334" },
  { name: "Rajesh Nair", relation: "Spouse", phone: "+91 98850 44120" },
  { name: "Kavita Deshmukh", relation: "Sister", phone: "+91 99120 77819" },
  { name: "Mohammed Farhan", relation: "Brother", phone: "+91 97011 33490" },
  { name: "Meenakshi Iyer", relation: "Daughter", phone: "+91 98402 61288" },
  { name: "Prakash Kulkarni", relation: "Father", phone: "+91 98220 55104" },
  { name: "Anjali Verma", relation: "Spouse", phone: "+91 98114 29073" },
  { name: "Suresh Reddy", relation: "Brother", phone: "+91 90005 81422" },
];

const SPECIFIC_ORGAN_SETS: OrganType[][] = [
  ["Corneas", "Kidneys"],
  ["Corneas", "Kidneys", "Liver"],
  ["Heart", "Lungs", "Kidneys"],
  ["Corneas", "Tissue"],
  ["Kidneys", "Liver", "Pancreas"],
];

function hashIndex(input: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function readLivePatientInclusiveRecord(
  storage: StorageLike | null
): {
  name: string;
  accessibilityProfile?: PatientAccessibilityProfile;
  organDonor?: PatientOrganDonorSummary;
} | null {
  if (!storage) return null;
  try {
    // Prefer citizen@carepreempt.com or any active patient key saved in localStorage
    const candidateKeys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (!k) continue;
      if (k.startsWith("sg_a11y_") || k.startsWith("sg_organ_pledge_")) {
        const suffix = k.replace(/^sg_(a11y|organ_pledge)_/, "");
        if (
          suffix &&
          suffix !== "guest" &&
          !suffix.includes("admin@") &&
          !suffix.includes("hospital@") &&
          !candidateKeys.includes(suffix)
        ) {
          candidateKeys.push(suffix);
        }
      }
    }

    const emailKey = candidateKeys.includes("citizen@carepreempt.com")
      ? "citizen@carepreempt.com"
      : candidateKeys[0];

    if (!emailKey) return null;

    const rawPrefs = storage.getItem(`sg_a11y_${emailKey}`);
    const rawDevices = storage.getItem(`sg_assistive_devices_${emailKey}`);
    const rawPledge = storage.getItem(`sg_organ_pledge_${emailKey}`);

    const prefs: Partial<AccessibilityPreferences> = rawPrefs ? JSON.parse(rawPrefs) : {};
    const devices: AssistiveDevice[] = rawDevices ? JSON.parse(rawDevices) : [];
    const pledge: Partial<OrganDonorPledge> = rawPledge ? JSON.parse(rawPledge) : {};

    const connectedDevices = devices.filter((d) => d.connected).map((d) => d.name);
    const badges: string[] = [];
    if (prefs.handsFreeVoice) badges.push("Visual Impairment / Voice Mode");
    if (prefs.visualFirst) badges.push("Deaf / Hard-of-Hearing – Visual-First");
    connectedDevices.forEach((name) => {
      if (name.toLowerCase().includes("glass") || name.toLowerCase().includes("vision")) {
        badges.push("Uses Smart Vision Glasses");
      } else if (name.toLowerCase().includes("hearing")) {
        badges.push("Uses Hearing Aid");
      } else {
        badges.push(`Uses ${name}`);
      }
    });

    const notes: string[] = [];
    if (prefs.handsFreeVoice) {
      notes.push("Speak clearly, announce clinical actions before physical exam, and offer spoken triage confirmation.");
    }
    if (prefs.visualFirst) {
      notes.push("Use written visual cards, face patient directly for lip-reading, and keep live caption display visible.");
    }
    if (connectedDevices.length > 0) {
      notes.push(`Patient carries registered assistive hardware (${connectedDevices.join(", ")}). Keep device secure during intake.`);
    }

    const accessibilityProfile: PatientAccessibilityProfile | undefined =
      badges.length > 0
        ? {
            needsVoiceMode: Boolean(prefs.handsFreeVoice),
            needsVisualFirst: Boolean(prefs.visualFirst),
            assistiveDevices: connectedDevices,
            communicationNote: notes.join(" "),
            badges: Array.from(new Set(badges)),
          }
        : undefined;

    const organDonor: PatientOrganDonorSummary | undefined = pledge.isDonor
      ? {
          isDonor: true,
          pledgeId: pledge.pledgeId || "CP-DONOR-LIVE",
          donateAll: Boolean(pledge.donateAll),
          selectedOrgans:
            pledge.donateAll || !pledge.selectedOrgans?.length
              ? [...ALL_ORGAN_TYPES]
              : pledge.selectedOrgans,
          nextOfKinName: pledge.nextOfKinName || "Sita Sharma",
          nextOfKinRelation: pledge.nextOfKinRelation || "Mother",
          nextOfKinPhone: pledge.nextOfKinPhone || "+91 98490 22334",
          nextOfKinInformed: Boolean(pledge.nextOfKinInformed),
          pledgedAt: pledge.pledgedAt || new Date().toISOString().slice(0, 10),
        }
      : undefined;

    return {
      name: emailKey === "citizen@carepreempt.com" ? "Ramesh Sharma" : emailKey.split("@")[0],
      accessibilityProfile,
      organDonor,
    };
  } catch {
    return null;
  }
}

/**
 * Enriches generated clinical patient intake records with deterministic Accessibility Needs
 * and Organ Donor Pledge directives so Hospital Triage teams can prepare inclusive arrival
 * communication and verify next-of-kin directives immediately.
 */
export function enrichPatientsWithInclusiveData(
  patients: PatientRecord[],
  storage: StorageLike | null = getDefaultStorage()
): PatientRecord[] {
  const liveRecord = readLivePatientInclusiveRecord(storage);

  return patients.map((patient, idx) => {
    // Ensure top incoming patients showcase realistic, immediately scannable inclusive care flags
    const seed = hashIndex(`${patient.id}-${patient.name}`, 100);

    let needsVoiceMode = idx === 0 || idx === 4 || seed < 14;
    let needsVisualFirst = idx === 1 || idx === 5 || (seed >= 14 && seed < 26);
    const assistiveDevices: string[] = [];

    if (idx === 0 || idx === 3 || seed % 11 === 0) {
      assistiveDevices.push("AI Smart Vision Glasses");
      needsVoiceMode = true;
    }
    if (idx === 1 || idx === 6 || seed % 13 === 0) {
      assistiveDevices.push("Digital Bluetooth Hearing Aid");
      needsVisualFirst = true;
    }
    if (idx === 7 || seed % 19 === 0) {
      assistiveDevices.push("Bluetooth Switch & Mobility Aid");
    }

    const badges: string[] = [];
    if (needsVoiceMode) badges.push("Visual Impairment / Voice Mode");
    if (needsVisualFirst) badges.push("Deaf / Hard-of-Hearing – Visual-First");
    if (assistiveDevices.some((d) => d.includes("Vision Glasses"))) {
      badges.push("Uses Smart Vision Glasses");
    }
    if (assistiveDevices.some((d) => d.includes("Hearing Aid"))) {
      badges.push("Uses Hearing Aid");
    }
    if (assistiveDevices.some((d) => d.includes("Mobility"))) {
      badges.push("Uses Mobility / Switch Aid");
    }

    const commNotes: string[] = [];
    if (needsVoiceMode) {
      commNotes.push(
        "Verbalize all triage steps clearly, introduce staff by name, and avoid relying solely on visual signage."
      );
    }
    if (needsVisualFirst) {
      commNotes.push(
        "Use high-contrast visual triage cards, face patient directly in well-lit bay, and enable live written transcripts."
      );
    }
    if (assistiveDevices.length > 0) {
      commNotes.push(
        `Keep patient's ${assistiveDevices.join(" & ")} accessible and powered during stabilization unless clinically contraindicated.`
      );
    }

    const accessibilityProfile: PatientAccessibilityProfile | undefined =
      badges.length > 0
        ? {
            needsVoiceMode,
            needsVisualFirst,
            assistiveDevices,
            communicationNote: commNotes.join(" "),
            badges,
          }
        : undefined;

    const isDonor = idx === 0 || idx === 2 || idx === 4 || seed % 3 === 0;
    const kin = KIN_NAMES[(idx + seed) % KIN_NAMES.length];
    const donateAll = (idx + seed) % 2 === 0;
    const selectedOrgans = donateAll
      ? [...ALL_ORGAN_TYPES]
      : SPECIFIC_ORGAN_SETS[(idx + seed) % SPECIFIC_ORGAN_SETS.length];

    const organDonor: PatientOrganDonorSummary | undefined = isDonor
      ? {
          isDonor: true,
          pledgeId: `CP-NOTTO-${String(104200 + idx * 17).slice(0, 6)}`,
          donateAll,
          selectedOrgans,
          nextOfKinName: kin.name,
          nextOfKinRelation: kin.relation,
          nextOfKinPhone: kin.phone,
          nextOfKinInformed: seed % 5 !== 0,
          pledgedAt: `2026-0${(idx % 9) + 1}-${String((idx % 24) + 4).padStart(2, "0")}`,
        }
      : undefined;

    // Merge live persisted citizen data onto record #0 if the user has explicitly saved preferences/pledge
    if (idx === 0 && liveRecord) {
      return {
        ...patient,
        accessibilityProfile: liveRecord.accessibilityProfile || accessibilityProfile,
        organDonor: liveRecord.organDonor || organDonor,
      };
    }

    return {
      ...patient,
      accessibilityProfile,
      organDonor,
    };
  });
}

export function filterHospitalPatients(
  patients: PatientRecord[],
  filters: {
    search: string;
    severity: string;
    gender: string;
    inclusiveFilter: HospitalInclusiveFilter;
  }
): PatientRecord[] {
  const q = filters.search.trim().toLowerCase();
  return patients.filter((p) => {
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.issue.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.assigned_doctor.toLowerCase().includes(q) ||
      Boolean(
        p.accessibilityProfile?.badges.some((b) => b.toLowerCase().includes(q))
      ) ||
      Boolean(p.organDonor?.pledgeId.toLowerCase().includes(q));

    const matchesSev = filters.severity === "all" || p.severity === filters.severity;
    const matchesGen = filters.gender === "all" || p.gender === filters.gender;

    let matchesInclusive = true;
    switch (filters.inclusiveFilter) {
      case "any_accessibility":
        matchesInclusive = Boolean(p.accessibilityProfile && p.accessibilityProfile.badges.length > 0);
        break;
      case "voice_mode":
        matchesInclusive = Boolean(p.accessibilityProfile?.needsVoiceMode);
        break;
      case "visual_first":
        matchesInclusive = Boolean(p.accessibilityProfile?.needsVisualFirst);
        break;
      case "assistive_devices":
        matchesInclusive = Boolean(
          p.accessibilityProfile && p.accessibilityProfile.assistiveDevices.length > 0
        );
        break;
      case "organ_donor":
        matchesInclusive = Boolean(p.organDonor?.isDonor);
        break;
      default:
        matchesInclusive = true;
    }

    return matchesSearch && matchesSev && matchesGen && matchesInclusive;
  });
}

export function computeHospitalInclusiveSummary(patients: PatientRecord[]) {
  let voiceCount = 0;
  let visualFirstCount = 0;
  let assistiveDeviceCount = 0;
  let organDonorCount = 0;

  for (const p of patients) {
    if (p.accessibilityProfile?.needsVoiceMode) voiceCount++;
    if (p.accessibilityProfile?.needsVisualFirst) visualFirstCount++;
    if (p.accessibilityProfile && p.accessibilityProfile.assistiveDevices.length > 0) {
      assistiveDeviceCount++;
    }
    if (p.organDonor?.isDonor) organDonorCount++;
  }

  return {
    totalPatients: patients.length,
    voiceCount,
    visualFirstCount,
    assistiveDeviceCount,
    organDonorCount,
  };
}

/**
 * Computes platform-wide Accessibility & Assistive Tech telemetry for the Admin Portal,
 * combining the national baseline cohort with live persisted patient profiles in storage.
 */
export function computeAdminAccessibilityStats(
  storage: StorageLike | null = getDefaultStorage()
): AdminAccessibilityStats {
  let localVoice = 0;
  let localVisual = 0;
  let localSmartGlasses = 0;
  let localHearingAids = 0;
  let localMobility = 0;
  let localVitals = 0;
  let localProfiles = 0;

  if (storage) {
    const seenUsers = new Set<string>();
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (!k) continue;

      if (k.startsWith("sg_a11y_")) {
        const uid = k.replace("sg_a11y_", "");
        if (uid === "guest" || uid.includes("admin@") || uid.includes("hospital@")) continue;
        seenUsers.add(uid);
        try {
          const parsed = JSON.parse(storage.getItem(k) || "{}") as Partial<AccessibilityPreferences>;
          if (parsed.handsFreeVoice) localVoice++;
          if (parsed.visualFirst) localVisual++;
        } catch {
          // ignore invalid json
        }
      }

      if (k.startsWith("sg_assistive_devices_")) {
        const uid = k.replace("sg_assistive_devices_", "");
        if (uid === "guest" || uid.includes("admin@") || uid.includes("hospital@")) continue;
        seenUsers.add(uid);
        try {
          const devices = JSON.parse(storage.getItem(k) || "[]") as AssistiveDevice[];
          for (const d of devices) {
            if (!d.connected) continue;
            if (d.type === "smart_glasses") localSmartGlasses++;
            else if (d.type === "hearing_aid") localHearingAids++;
            else if (d.type === "vitals_monitoring") localVitals++;
            else localMobility++;
          }
        } catch {
          // ignore
        }
      }
    }
    localProfiles = seenUsers.size;
  }

  const totalTrackedPatients = 1840 + localProfiles;
  const voiceModeUsers = 318 + localVoice;
  const visualFirstUsers = 264 + localVisual;
  const smartGlassesCount = 192 + localSmartGlasses;
  const hearingAidsCount = 248 + localHearingAids;
  const mobilityAidsCount = 114 + localMobility;
  const vitalsMonitoringCount = 326 + localVitals;
  const totalRegisteredDevices =
    smartGlassesCount + hearingAidsCount + mobilityAidsCount + vitalsMonitoringCount;
  const assistiveDeviceUsers =
    412 + (localSmartGlasses + localHearingAids + localMobility + localVitals > 0 ? 1 : 0);

  return {
    totalTrackedPatients,
    voiceModeUsers,
    visualFirstUsers,
    assistiveDeviceUsers,
    totalRegisteredDevices,
    deviceBreakdown: [
      {
        key: "smart_glasses",
        label: "AI Smart Vision Glasses",
        count: smartGlassesCount,
        sharePercent: Math.round((smartGlassesCount / totalRegisteredDevices) * 100),
      },
      {
        key: "hearing_aid",
        label: "Digital Hearing Aids (BLE / MFi)",
        count: hearingAidsCount,
        sharePercent: Math.round((hearingAidsCount / totalRegisteredDevices) * 100),
      },
      {
        key: "mobility_sensory",
        label: "Mobility & Switch Control Aids",
        count: mobilityAidsCount,
        sharePercent: Math.round((mobilityAidsCount / totalRegisteredDevices) * 100),
      },
      {
        key: "vitals_monitoring",
        label: "Vitals & Health Monitoring",
        count: vitalsMonitoringCount,
        sharePercent: Math.round((vitalsMonitoringCount / totalRegisteredDevices) * 100),
      },
    ],
    localLiveProfilesCount: localProfiles,
  };
}

/**
 * Computes strictly anonymized Organ Donation Registry statistics (zero PII)
 * for the Admin Portal management tab.
 */
export function computeAdminOrganDonorStats(
  storage: StorageLike | null = getDefaultStorage()
): AdminOrganDonorStats {
  const organCounts: Record<OrganType, number> = {
    Corneas: 612,
    Kidneys: 584,
    Liver: 540,
    Heart: 498,
    Lungs: 462,
    Pancreas: 418,
    Tissue: 526,
  };

  let localDonorCount = 0;
  let localAllCount = 0;
  let localKinInformed = 0;

  if (storage) {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (!k || !k.startsWith("sg_organ_pledge_")) continue;
      const uid = k.replace("sg_organ_pledge_", "");
      if (uid === "guest" || uid.includes("admin@") || uid.includes("hospital@")) continue;
      try {
        const pledge = JSON.parse(storage.getItem(k) || "{}") as Partial<OrganDonorPledge>;
        if (!pledge.isDonor) continue;
        localDonorCount++;
        if (pledge.donateAll) {
          localAllCount++;
          ALL_ORGAN_TYPES.forEach((o) => {
            organCounts[o] += 1;
          });
        } else if (Array.isArray(pledge.selectedOrgans)) {
          pledge.selectedOrgans.forEach((o) => {
            if (o in organCounts) organCounts[o] += 1;
          });
        }
        if (pledge.nextOfKinInformed) localKinInformed++;
      } catch {
        // ignore
      }
    }
  }

  const totalPledges = 648 + localDonorCount;
  const totalPatientsConsidered = 1840 + localDonorCount;
  const fullAllOrgansCount = 412 + localAllCount;
  const specificOrgansCount = Math.max(0, totalPledges - fullAllOrgansCount);
  const kinInformedTotal = 556 + localKinInformed;

  const organBreakdown = ALL_ORGAN_TYPES.map((organ) => ({
    organ,
    count: organCounts[organ],
    sharePercent: Math.round((organCounts[organ] / totalPledges) * 100),
  })).sort((a, b) => b.count - a.count);

  const regionalBreakdown = [
    { region: "Hyderabad Metro", pledges: 146 + localDonorCount, optInPercent: 39.2 },
    { region: "Bengaluru Urban", pledges: 132, optInPercent: 37.8 },
    { region: "Mumbai Metropolitan", pledges: 118, optInPercent: 34.1 },
    { region: "Chennai Core", pledges: 104, optInPercent: 41.5 },
    { region: "Delhi NCR", pledges: 86, optInPercent: 29.4 },
    { region: "Pune & Ahmedabad", pledges: 62, optInPercent: 33.6 },
  ];

  return {
    totalPledges,
    totalPatientsConsidered,
    optInRatePercent: Number(((totalPledges / totalPatientsConsidered) * 100).toFixed(1)),
    fullAllOrgansCount,
    specificOrgansCount,
    nextOfKinInformedRatePercent: Number(((kinInformedTotal / totalPledges) * 100).toFixed(1)),
    organBreakdown,
    regionalBreakdown,
  };
}

const ADMIN_RESOURCES_KEY = "sg_admin_inclusive_resources_v1";
const ADMIN_CATALOG_KEY = "sg_admin_assistive_catalog_v2";
const LEGACY_ADMIN_CATALOG_KEY = "sg_admin_assistive_catalog_v1";

export const DEFAULT_ADMIN_EDUCATIONAL_RESOURCES: AdminEducationalResource[] = [
  {
    id: "res-notto-pledge",
    title: "National Organ & Tissue Transplant (NOTTO) Pledge Guide",
    category: "Organ Donation",
    audience: "Patients & Families",
    summary:
      "Plain-language legal and ethical guide explaining voluntary organ donation, brain-stem death certification, and family consent.",
    verified: true,
    published: true,
    lastReviewed: "2026-10-14",
    sourceBody: "NOTTO / MoHFW Clinical Advisory",
  },
  {
    id: "res-family-conversation",
    title: "How to Discuss Your Donor Pledge with Next-of-Kin",
    category: "Organ Donation",
    audience: "Patients & Families",
    summary:
      "Empathetic conversation toolkit helping donors share their wishes clearly with family guardians so preferences are honored.",
    verified: true,
    published: true,
    lastReviewed: "2026-10-08",
    sourceBody: "Care Preempt Ethics Board",
  },
  {
    id: "res-smart-vision-er",
    title: "Hospital ER Protocol: Communicating with Smart Vision Glasses Users",
    category: "Accessibility & Assistive Tech",
    audience: "Hospital Triage Staff",
    summary:
      "Checklist for ER nurses and paramedics when triaging blind or low-vision patients using AI smart glasses and voice navigation.",
    verified: true,
    published: true,
    lastReviewed: "2026-10-19",
    sourceBody: "Inclusive Clinical Care Working Group",
  },
  {
    id: "res-deaf-visual-triage",
    title: "Deaf & Hard-of-Hearing Visual-First Emergency Triage Cards",
    category: "Accessibility & Assistive Tech",
    audience: "Hospital Triage Staff",
    summary:
      "Standardized high-contrast icon cards and captioning workflows for trauma bays when treating Deaf or hard-of-hearing patients.",
    verified: true,
    published: true,
    lastReviewed: "2026-09-29",
    sourceBody: "National Deaf Health Alliance",
  },
  {
    id: "res-myth-vs-fact",
    title: "Organ Donation Myth vs. Clinical Fact Multilingual Brief",
    category: "Organ Donation",
    audience: "All Users",
    summary:
      "Addresses common misconceptions around emergency treatment quality, age limits, and religious alignment in 6 Indian languages.",
    verified: false,
    published: true,
    lastReviewed: "2026-10-02",
    sourceBody: "Regional Transplant Coordination Cell",
  },
];

export function loadAdminEducationalResources(
  storage: StorageLike | null = getDefaultStorage()
): AdminEducationalResource[] {
  if (!storage) return [...DEFAULT_ADMIN_EDUCATIONAL_RESOURCES];
  try {
    const raw = storage.getItem(ADMIN_RESOURCES_KEY);
    if (!raw) {
      storage.setItem(ADMIN_RESOURCES_KEY, JSON.stringify(DEFAULT_ADMIN_EDUCATIONAL_RESOURCES));
      return [...DEFAULT_ADMIN_EDUCATIONAL_RESOURCES];
    }
    return JSON.parse(raw) as AdminEducationalResource[];
  } catch {
    return [...DEFAULT_ADMIN_EDUCATIONAL_RESOURCES];
  }
}

export function saveAdminEducationalResources(
  resources: AdminEducationalResource[],
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(ADMIN_RESOURCES_KEY, JSON.stringify(resources));
  } catch {
    // ignore quota errors
  }
}

export function getDefaultAdminDeviceCatalog(): AdminDeviceCatalogEntry[] {
  const seededCounts: Record<string, number> = {
    "rec-envision-glasses": 192,
    "rec-orcam-myeye": 134,
    "rec-xrai-ar-glasses": 118,
    "rec-phonak-lumity": 248,
    "rec-oticon-intent": 164,
    "rec-shokz-opencomm": 114,
    "rec-able-switch": 76,
    "rec-wewalk-cane": 88,
    "rec-smartgait-fall": 69,
    "rec-bp-monitor": 412,
    "rec-pulse-oximeter": 486,
    "rec-glucometer": 344,
    "rec-ir-thermometer": 392,
    "rec-nebulizer-ecg": 185,
  };
  return RECOMMENDED_ASSISTIVE_TECH.map((item, idx) => ({
    id: item.id,
    name: item.name,
    manufacturer: item.manufacturer,
    category: item.category,
    compatibilityNote: item.compatibilityNote,
    verified: true,
    active: true,
    featured: idx === 0 || idx === 3 || item.id === "rec-bp-monitor" || item.id === "rec-pulse-oximeter",
    registeredCount: seededCounts[item.id] ?? 64,
  }));
}

export function loadAdminDeviceCatalog(
  storage: StorageLike | null = getDefaultStorage()
): AdminDeviceCatalogEntry[] {
  const defaults = getDefaultAdminDeviceCatalog();
  if (!storage) return defaults;
  try {
    const raw = storage.getItem(ADMIN_CATALOG_KEY);
    if (!raw) {
      const legacyRaw = storage.getItem(LEGACY_ADMIN_CATALOG_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as AdminDeviceCatalogEntry[];
        if (Array.isArray(legacy) && legacy.length > 0) {
          const seenIds = new Set(legacy.map((e) => e.id));
          const merged = [
            ...legacy,
            ...defaults.filter((d) => !seenIds.has(d.id)),
          ];
          storage.setItem(ADMIN_CATALOG_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      storage.setItem(ADMIN_CATALOG_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as AdminDeviceCatalogEntry[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seenIds = new Set(parsed.map((e) => e.id));
      const missing = defaults.filter((d) => !seenIds.has(d.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    }
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveAdminDeviceCatalog(
  entries: AdminDeviceCatalogEntry[],
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(ADMIN_CATALOG_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}
