import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  AccessibilityPreferences,
  AssistiveDevice,
  AssistiveDeviceType,
  OrganDonorPledge,
  OrganType,
  Profile,
} from "../types";
import {
  ALL_ELIGIBLE_ORGANS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  DEFAULT_ORGAN_PLEDGE,
  getAltTextForDevice,
  getDefaultTipsForDeviceType,
  getVisualKeyForDevice,
} from "./accessibilityLogic";
import type {
  AwarenessLanguageCode,
  AwarenessVideoCategory,
  AwarenessVideoItem,
} from "./awarenessVideoCatalog";
import type { HospitalSpecialDevice } from "./specialDevicesLogic";
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from "./firebase";

const VALID_LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Spanish",
] as const;

const LANG_CODE_TO_LABEL: Record<string, (typeof VALID_LANGUAGES)[number]> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  es: "Spanish",
  english: "English",
  hindi: "Hindi",
  telugu: "Telugu",
  tamil: "Tamil",
  kannada: "Kannada",
  spanish: "Spanish",
};

const VALID_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

const VALID_DEVICE_TYPES: AssistiveDeviceType[] = [
  "smart_glasses",
  "hearing_aid",
  "mobility_sensory",
  "vitals_monitoring",
];

const VALID_TRIAGE_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type TriageSeverityLevel = (typeof VALID_TRIAGE_SEVERITIES)[number];

const VALID_TRIAGE_LANGS = ["en", "hi", "te", "ta", "kn", "bn", "es"] as const;
export type TriageLangCode = (typeof VALID_TRIAGE_LANGS)[number];

export interface PatientTriageUpdate {
  triageId: string;
  sessionId: string;
  symptomsSummary: string;
  triageGuidance: string;
  severity: TriageSeverityLevel;
  language: TriageLangCode;
  guardianAlertTriggered: boolean;
  updatedAtLabel?: string;
}

const VALID_CONNECTION_TYPES = [
  "Bluetooth LE",
  "Companion App",
  "USB-C / Bridge",
] as const;

const VALID_AWARENESS_CATEGORIES: AwarenessVideoCategory[] = [
  "Assistive Technology Guides",
  "Inclusive Healthcare & Emergency Communication",
  "Organ & Tissue Donation Awareness",
];

const VALID_LANG_CODES: AwarenessLanguageCode[] = [
  "en",
  "hi",
  "te",
  "ta",
  "kn",
  "es",
];

export function sanitizeFirestoreId(raw: string, fallback = "item"): string {
  const cleaned = (raw || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : fallback;
}

function clampString(val: string | undefined, max: number, fallback = ""): string {
  const trimmed = (val ?? "").trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

export function normalizeLanguageLabel(
  lang?: string
): (typeof VALID_LANGUAGES)[number] {
  const key = (lang || "").trim().toLowerCase();
  return LANG_CODE_TO_LABEL[key] || "English";
}

export function sanitizeUserPublicPayload(input: {
  uid: string;
  displayName?: string;
  role?: "patient" | "hospital" | "admin";
  language?: string;
  onboarded?: boolean;
}) {
  const uid = sanitizeFirestoreId(input.uid, "user");
  const role: "patient" | "hospital" | "admin" =
    input.role === "hospital" || input.role === "admin" ? input.role : "patient";
  return {
    uid,
    displayName: clampString(input.displayName, 100, "Care Preempt Member"),
    role,
    language: normalizeLanguageLabel(input.language),
    onboarded: Boolean(input.onboarded),
  };
}

export function sanitizeUserPrivatePayload(input: {
  uid: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  willingToDonateBlood?: boolean;
  location?: string;
  cprTraining?: string;
  guardianName?: string;
  guardianPhone?: string;
}) {
  const uid = sanitizeFirestoreId(input.uid, "user");
  const base: Record<string, unknown> = {
    uid,
    email: clampString(input.email, 160, "member@carepreempt.com"),
  };

  if (input.phone !== undefined) {
    base.phone = clampString(input.phone, 32, "");
  }
  if (typeof input.age === "number" && !Number.isNaN(input.age)) {
    base.age = Math.max(0, Math.min(130, Math.round(input.age)));
  }
  if (input.gender !== undefined) {
    base.gender = clampString(input.gender, 32, "");
  }
  if (
    input.bloodGroup &&
    (VALID_BLOOD_GROUPS as readonly string[]).includes(input.bloodGroup)
  ) {
    base.bloodGroup = input.bloodGroup;
  }
  if (typeof input.willingToDonateBlood === "boolean") {
    base.willingToDonateBlood = input.willingToDonateBlood;
  }
  if (input.location !== undefined) {
    base.location = clampString(input.location, 120, "");
  }
  if (input.cprTraining !== undefined) {
    base.cprTraining = clampString(input.cprTraining, 120, "");
  }
  if (input.guardianName !== undefined) {
    base.guardianName = clampString(input.guardianName, 100, "");
  }
  if (input.guardianPhone !== undefined) {
    base.guardianPhone = clampString(input.guardianPhone, 32, "");
  }
  return base;
}

export function sanitizeAccessibilityPayload(
  uid: string,
  prefs: AccessibilityPreferences
) {
  const cleanUid = sanitizeFirestoreId(uid, "user");
  const fontScale: "standard" | "large" | "xlarge" = prefs.enlargedTargets
    ? "large"
    : "standard";
  return {
    uid: cleanUid,
    voiceMode: Boolean(prefs.handsFreeVoice),
    visualFirst: Boolean(prefs.visualFirst),
    highContrast: Boolean(prefs.visualFirst),
    fontScale,
    reducedMotion: false,
    assistiveDeviceEnabled: Boolean(prefs.assistiveDevicesEnabled),
    onboardingCompleted: Boolean(prefs.onboardingCompleted),
  };
}

export function mapAccessibilityDocToPreferences(
  docData: Record<string, unknown>
): AccessibilityPreferences {
  const voiceMode = Boolean(docData.voiceMode);
  const visualFirst = Boolean(docData.visualFirst);
  const assistiveDevicesEnabled = Boolean(docData.assistiveDeviceEnabled);
  const enlargedTargets =
    docData.fontScale === "large" ||
    docData.fontScale === "xlarge" ||
    voiceMode ||
    assistiveDevicesEnabled;
  return {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    handsFreeVoice: voiceMode,
    visualFirst,
    assistiveDevicesEnabled,
    standardExperience: !voiceMode && !visualFirst && !assistiveDevicesEnabled,
    enlargedTargets,
    autoReadAlerts: voiceMode,
    simplifiedMedicalText: visualFirst,
    onboardingCompleted: Boolean(docData.onboardingCompleted),
  };
}

export function sanitizeAssistiveDevicePayload(
  uid: string,
  device: AssistiveDevice
) {
  const cleanUid = sanitizeFirestoreId(uid, "user");
  const deviceId = sanitizeFirestoreId(device.id, `adev-${Date.now()}`);
  const type: AssistiveDeviceType = VALID_DEVICE_TYPES.includes(device.type)
    ? device.type
    : "smart_glasses";
  const connectionType = (VALID_CONNECTION_TYPES as readonly string[]).includes(
    device.connectionType
  )
    ? device.connectionType
    : "Bluetooth LE";

  const nameRaw = clampString(device.name, 100, "Assistive Device");
  const modelRaw = clampString(device.model, 120, "Standard Model");
  const payload: Record<string, unknown> = {
    uid: cleanUid,
    deviceId,
    name: nameRaw.length >= 2 ? nameRaw : `${nameRaw} Device`,
    model: modelRaw.length >= 2 ? modelRaw : `${modelRaw} Model`,
    type,
    connectionType,
    connected: Boolean(device.connected),
    batteryLevel: Math.max(
      0,
      Math.min(100, Math.round(Number(device.batteryLevel) || 0))
    ),
  };
  if (device.notes !== undefined) {
    payload.notes = clampString(device.notes, 300, "");
  }
  return { deviceId, payload };
}

export function mapAssistiveDeviceDoc(
  docData: Record<string, unknown>
): AssistiveDevice {
  const type: AssistiveDeviceType = VALID_DEVICE_TYPES.includes(
    docData.type as AssistiveDeviceType
  )
    ? (docData.type as AssistiveDeviceType)
    : "smart_glasses";
  const name = String(docData.name || "Assistive Device");
  const model = String(docData.model || "Care Preempt Compatible");
  const connectionType = (VALID_CONNECTION_TYPES as readonly string[]).includes(
    String(docData.connectionType)
  )
    ? (docData.connectionType as AssistiveDevice["connectionType"])
    : "Bluetooth LE";
  return {
    id: String(docData.deviceId || `adev-${Date.now()}`),
    name,
    model,
    type,
    connectionType,
    connected: Boolean(docData.connected),
    batteryLevel: Number(docData.batteryLevel ?? 85),
    lastSynced: docData.connected ? "Synced with Cloud" : "Disconnected (Standby)",
    notes: typeof docData.notes === "string" ? docData.notes : undefined,
    visualKey: getVisualKeyForDevice(type, `${name} ${model}`),
    altText: getAltTextForDevice(type, name, model),
    troubleshootingTips: getDefaultTipsForDeviceType(type),
  };
}

export function sanitizeOrganPledgePayload(
  uid: string,
  pledge: OrganDonorPledge
) {
  const cleanUid = sanitizeFirestoreId(uid, "user");
  const rawOrgans = pledge.donateAll
    ? [...ALL_ELIGIBLE_ORGANS]
    : pledge.selectedOrgans || [];
  const validOrgans = Array.from(
    new Set(
      rawOrgans.filter((o): o is OrganType =>
        ALL_ELIGIBLE_ORGANS.includes(o as OrganType)
      )
    )
  ).slice(0, 10);

  const payload: Record<string, unknown> = {
    uid: cleanUid,
    optedIn: Boolean(pledge.isDonor),
    organs: validOrgans,
    consentGiven: Boolean(pledge.consentAcknowledged),
  };
  if (pledge.pledgeId) {
    payload.donorCardId = clampString(pledge.pledgeId, 64, "");
  }
  if (pledge.nextOfKinName) {
    payload.nextOfKinName = clampString(pledge.nextOfKinName, 100, "");
  }
  if (pledge.nextOfKinPhone) {
    payload.nextOfKinPhone = clampString(pledge.nextOfKinPhone, 32, "");
  }
  return payload;
}

export function mapOrganPledgeDoc(
  docData: Record<string, unknown>,
  fallback: OrganDonorPledge = DEFAULT_ORGAN_PLEDGE
): OrganDonorPledge {
  const organs = Array.isArray(docData.organs)
    ? (docData.organs.filter((o): o is OrganType =>
        ALL_ELIGIBLE_ORGANS.includes(o as OrganType)
      ) as OrganType[])
    : [...ALL_ELIGIBLE_ORGANS];
  return {
    ...fallback,
    isDonor: Boolean(docData.optedIn),
    donateAll: organs.length === ALL_ELIGIBLE_ORGANS.length,
    selectedOrgans: organs,
    pledgeId:
      typeof docData.donorCardId === "string"
        ? docData.donorCardId
        : fallback.pledgeId,
    nextOfKinName:
      typeof docData.nextOfKinName === "string"
        ? docData.nextOfKinName
        : fallback.nextOfKinName,
    nextOfKinPhone:
      typeof docData.nextOfKinPhone === "string"
        ? docData.nextOfKinPhone
        : fallback.nextOfKinPhone,
    consentAcknowledged: Boolean(docData.consentGiven),
  };
}

export function sanitizeTriageUpdatePayload(
  uid: string,
  update: Omit<PatientTriageUpdate, "updatedAtLabel">
) {
  const cleanUid = sanitizeFirestoreId(uid, "user");
  const triageId = sanitizeFirestoreId(update.triageId, `tr-${Date.now()}`);
  const sessionId = sanitizeFirestoreId(update.sessionId, "session-default");
  const severity: TriageSeverityLevel = (
    VALID_TRIAGE_SEVERITIES as readonly string[]
  ).includes(update.severity)
    ? update.severity
    : "medium";
  const rawLang = (update.language || "en").toLowerCase().split("-")[0];
  const language: TriageLangCode = (
    VALID_TRIAGE_LANGS as readonly string[]
  ).includes(rawLang)
    ? (rawLang as TriageLangCode)
    : "en";

  return {
    triageId,
    payload: {
      uid: cleanUid,
      triageId,
      sessionId,
      symptomsSummary: clampString(
        update.symptomsSummary,
        400,
        "Symptom report"
      ),
      triageGuidance: clampString(
        update.triageGuidance,
        1200,
        "Clinical guidance recorded."
      ),
      severity,
      language,
      guardianAlertTriggered: Boolean(update.guardianAlertTriggered),
    },
  };
}

export function mapTriageUpdateDoc(
  docData: Record<string, unknown>
): PatientTriageUpdate {
  const severity: TriageSeverityLevel = (
    VALID_TRIAGE_SEVERITIES as readonly string[]
  ).includes(String(docData.severity))
    ? (docData.severity as TriageSeverityLevel)
    : "medium";
  const language: TriageLangCode = (
    VALID_TRIAGE_LANGS as readonly string[]
  ).includes(String(docData.language))
    ? (docData.language as TriageLangCode)
    : "en";
  let updatedAtLabel = "Synced";
  const rawTs = docData.updatedAt as { toDate?: () => Date } | undefined;
  if (rawTs && typeof rawTs.toDate === "function") {
    try {
      updatedAtLabel = rawTs.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      updatedAtLabel = "Synced";
    }
  }
  return {
    triageId: String(docData.triageId || `tr-${Date.now()}`),
    sessionId: String(docData.sessionId || "session-default"),
    symptomsSummary: String(docData.symptomsSummary || ""),
    triageGuidance: String(docData.triageGuidance || ""),
    severity,
    language,
    guardianAlertTriggered: Boolean(docData.guardianAlertTriggered),
    updatedAtLabel,
  };
}

export function sanitizeHospitalSpecialDevicePayload(
  device: HospitalSpecialDevice
) {
  const deviceId = sanitizeFirestoreId(device.id, "hsd-device");
  const guideId = sanitizeFirestoreId(device.guideId, "smart-vision-glasses").slice(
    0,
    64
  );
  const totalStock = Math.max(
    0,
    Math.min(10000, Math.round(Number(device.totalStock) || 0))
  );
  const assignedUnits = Math.max(
    0,
    Math.min(totalStock, Math.round(Number(device.assignedUnits) || 0))
  );
  const lowStockThreshold = Math.max(
    0,
    Math.min(500, Math.round(Number(device.lowStockThreshold) || 3))
  );
  const nameRaw = clampString(device.name, 120, "Special Device");

  return {
    deviceId,
    payload: {
      deviceId,
      guideId,
      name: nameRaw.length >= 2 ? nameRaw : `${nameRaw} Unit`,
      targetGroup: clampString(device.targetGroup, 140, "Patients"),
      wardLocation: clampString(device.wardLocation, 140, "ER Triage"),
      totalStock,
      assignedUnits,
      lowStockThreshold,
    },
  };
}

export function sanitizeAwarenessVideoPayload(video: AwarenessVideoItem) {
  const videoId = sanitizeFirestoreId(video.id, `vid-${Date.now()}`);
  const category = VALID_AWARENESS_CATEGORIES.includes(video.category)
    ? video.category
    : VALID_AWARENESS_CATEGORIES[0];
  const languages = Array.from(
    new Set(
      (video.languages || ["en"]).filter((l): l is AwarenessLanguageCode =>
        VALID_LANG_CODES.includes(l)
      )
    )
  ).slice(0, 6);
  const titleRaw = clampString(video.title, 180, "Clinical Awareness Video");
  const descRaw = clampString(
    video.description,
    600,
    "Verified multilingual clinical awareness video."
  );
  const sourceRaw = clampString(
    video.medicalSource,
    140,
    "Care Preempt Clinical Board"
  );

  return {
    videoId,
    payload: {
      videoId,
      title: titleRaw.length >= 3 ? titleRaw : `${titleRaw} Video`,
      category,
      description: descRaw.length >= 5 ? descRaw : `${descRaw} Guide`,
      durationSec: Math.max(
        60,
        Math.min(1800, Math.round(Number(video.durationSec) || 240))
      ),
      medicalSource: sourceRaw.length >= 2 ? sourceRaw : "Care Preempt",
      published: Boolean(video.published),
      languages: languages.length > 0 ? languages : ["en"],
    },
  };
}

function isCurrentFirebaseAdmin(): boolean {
  const u = auth.currentUser;
  return Boolean(
    u &&
      u.emailVerified &&
      u.email &&
      u.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );
}

export async function ensureUserDocumentExists(input: {
  uid: string;
  email: string;
  displayName?: string;
  role?: "patient" | "hospital" | "admin";
  language?: string;
  onboarded?: boolean;
  profile?: Partial<Profile>;
}): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== input.uid) return;

  const userRef = doc(db, "users", input.uid);
  const userPath = `users/${input.uid}`;
  const requestedRole: "patient" | "hospital" | "admin" =
    isCurrentFirebaseAdmin() && input.role ? input.role : "patient";

  try {
    const existingSnap = await getDoc(userRef);
    const pub = sanitizeUserPublicPayload({
      uid: input.uid,
      displayName: input.displayName || current.displayName || input.email.split("@")[0],
      role: requestedRole,
      language: input.language || input.profile?.language,
      onboarded: input.onboarded ?? true,
    });

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        ...pub,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName: pub.displayName,
        language: pub.language,
        onboarded: pub.onboarded,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }

  const privRef = doc(db, "users", input.uid, "private", "profile");
  const privPath = `users/${input.uid}/private/profile`;
  try {
    const privPayload = sanitizeUserPrivatePayload({
      uid: input.uid,
      email: input.email,
      age: input.profile?.age,
      gender: input.profile?.gender,
      bloodGroup: input.profile?.blood_group,
      willingToDonateBlood: input.profile?.willing_to_donate,
      location: input.profile?.location,
      cprTraining: input.profile?.first_aid_level,
      guardianName: input.profile?.guardian_name,
      guardianPhone: input.profile?.guardian_contact,
    });
    const existingPriv = await getDoc(privRef);
    if (!existingPriv.exists()) {
      await setDoc(privRef, {
        ...privPayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const { uid: _uid, ...updateFields } = privPayload;
      await updateDoc(privRef, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, privPath);
  }
}

export async function fetchUserCloudData(uid: string): Promise<{
  preferences: AccessibilityPreferences | null;
  devices: AssistiveDevice[] | null;
  organPledge: OrganDonorPledge | null;
}> {
  const current = auth.currentUser;
  if (!current || current.uid !== uid) {
    return { preferences: null, devices: null, organPledge: null };
  }

  let preferences: AccessibilityPreferences | null = null;
  let devices: AssistiveDevice[] | null = null;
  let organPledge: OrganDonorPledge | null = null;

  const a11yPath = `users/${uid}/accessibility/settings`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "accessibility", "settings"));
    if (snap.exists()) {
      preferences = mapAccessibilityDocToPreferences(
        snap.data() as Record<string, unknown>
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, a11yPath);
  }

  const devPath = `users/${uid}/assistiveDevices`;
  try {
    const q = query(
      collection(db, "users", uid, "assistiveDevices"),
      where("uid", "==", uid)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      devices = snap.docs.map((d) =>
        mapAssistiveDeviceDoc(d.data() as Record<string, unknown>)
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, devPath);
  }

  const pledgePath = `users/${uid}/organPledge/current`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "organPledge", "current"));
    if (snap.exists()) {
      organPledge = mapOrganPledgeDoc(snap.data() as Record<string, unknown>);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, pledgePath);
  }

  return { preferences, devices, organPledge };
}

export async function syncAccessibilityToFirestore(
  uid: string,
  prefs: AccessibilityPreferences
): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== uid) return;

  const path = `users/${uid}/accessibility/settings`;
  try {
    const ref = doc(db, "users", uid, "accessibility", "settings");
    const payload = sanitizeAccessibilityPayload(uid, prefs);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const { uid: _uid, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAssistiveDeviceToFirestore(
  uid: string,
  device: AssistiveDevice
): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== uid) return;

  const { deviceId, payload } = sanitizeAssistiveDevicePayload(uid, device);
  const path = `users/${uid}/assistiveDevices/${deviceId}`;
  try {
    const ref = doc(db, "users", uid, "assistiveDevices", deviceId);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const { uid: _uid, deviceId: _did, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteAssistiveDeviceFromFirestore(
  uid: string,
  rawDeviceId: string
): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== uid) return;

  const deviceId = sanitizeFirestoreId(rawDeviceId, "adev");
  const path = `users/${uid}/assistiveDevices/${deviceId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "assistiveDevices", deviceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncOrganPledgeToFirestore(
  uid: string,
  pledge: OrganDonorPledge
): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== uid) return;

  const path = `users/${uid}/organPledge/current`;
  try {
    const ref = doc(db, "users", uid, "organPledge", "current");
    const payload = sanitizeOrganPledgePayload(uid, pledge);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const { uid: _uid, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncHospitalSpecialDeviceToFirestore(
  device: HospitalSpecialDevice
): Promise<void> {
  if (!isCurrentFirebaseAdmin()) return;

  const { deviceId, payload } = sanitizeHospitalSpecialDevicePayload(device);
  const path = `hospitalSpecialDevices/${deviceId}`;
  try {
    const ref = doc(db, "hospitalSpecialDevices", deviceId);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const { deviceId: _did, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAwarenessVideoToFirestore(
  video: AwarenessVideoItem
): Promise<void> {
  if (!isCurrentFirebaseAdmin()) return;

  const { videoId, payload } = sanitizeAwarenessVideoPayload(video);
  const path = `awarenessVideos/${videoId}`;
  try {
    const ref = doc(db, "awarenessVideos", videoId);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const { videoId: _vid, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncTriageUpdateToFirestore(
  uid: string,
  update: Omit<PatientTriageUpdate, "updatedAtLabel">
): Promise<void> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified || current.uid !== uid) return;

  const { triageId, payload } = sanitizeTriageUpdatePayload(uid, update);
  const path = `users/${uid}/triageUpdates/${triageId}`;
  try {
    const ref = doc(db, "users", uid, "triageUpdates", triageId);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const { uid: _uid, triageId: _tid, sessionId: _sid, ...updateFields } = payload;
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToAccessibilitySettings(
  uid: string,
  onData: (prefs: AccessibilityPreferences | null) => void
): Unsubscribe {
  const path = `users/${uid}/accessibility/settings`;
  const ref = doc(db, "users", uid, "accessibility", "settings");
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(mapAccessibilityDocToPreferences(snap.data() as Record<string, unknown>));
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToAssistiveDevices(
  uid: string,
  onData: (devices: AssistiveDevice[]) => void
): Unsubscribe {
  const path = `users/${uid}/assistiveDevices`;
  const q = query(
    collection(db, "users", uid, "assistiveDevices"),
    where("uid", "==", uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) =>
        mapAssistiveDeviceDoc(d.data() as Record<string, unknown>)
      );
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToOrganPledge(
  uid: string,
  onData: (pledge: OrganDonorPledge | null) => void
): Unsubscribe {
  const path = `users/${uid}/organPledge/current`;
  const ref = doc(db, "users", uid, "organPledge", "current");
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(mapOrganPledgeDoc(snap.data() as Record<string, unknown>));
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToTriageUpdates(
  uid: string,
  onData: (updates: PatientTriageUpdate[]) => void
): Unsubscribe {
  const path = `users/${uid}/triageUpdates`;
  const q = query(
    collection(db, "users", uid, "triageUpdates"),
    where("uid", "==", uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) =>
        mapTriageUpdateDoc(d.data() as Record<string, unknown>)
      );
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

