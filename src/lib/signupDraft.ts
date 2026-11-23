export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AuthSignupDraft {
  mode: "signin" | "signup";
  role: "patient" | "hospital" | "admin";
  email: string;
  phone: string;
  scrollY?: number;
}

export interface OnboardingDraft {
  step: number;
  name: string;
  phone: string;
  age: string;
  gender: string;
  language: string;
  location: string;
  customLocation: string;
  bloodGroup: string;
  willingToDonate: boolean;
  firstAidLevel: string;
  guardianName: string;
  guardianPhone: string;
  agreeConsent: boolean;
  selectedAvatar: string;
  scrollY?: number;
}

const AUTH_DRAFT_KEY = "cp_auth_signup_draft_v1";
const ONBOARDING_DRAFT_KEY = "cp_onboarding_draft_v1";

function getDefaultSessionStorage(): SessionStorageLike | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

export function loadAuthSignupDraft(
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): Partial<AuthSignupDraft> | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(AUTH_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AuthSignupDraft>;
  } catch {
    return null;
  }
}

export function saveAuthSignupDraft(
  draft: AuthSignupDraft,
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(AUTH_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

export function clearAuthSignupDraft(
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.removeItem(AUTH_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function loadOnboardingDraft(
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): Partial<OnboardingDraft> | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<OnboardingDraft>;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(
  draft: OnboardingDraft,
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

export function clearOnboardingDraft(
  storage: SessionStorageLike | null = getDefaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // ignore
  }
}
