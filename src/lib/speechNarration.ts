import type { AwarenessLanguageCode } from "./awarenessVideoCatalog";

export type ClinicalSceneType =
  | "smart_glasses"
  | "hearing_aid"
  | "deaf_triage"
  | "cpr_guide"
  | "organ_donation"
  | "vitals_bp";

export interface VoiceLike {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
}

export interface ResolvedNarrationVoice<T extends VoiceLike = VoiceLike> {
  voice: T | null;
  matchedExactLanguage: boolean;
  fallbackUsed: boolean;
  speechLang: string;
  textToSpeak: string;
  voiceLabel: string;
}

export const LANGUAGE_LOCALE_CANDIDATES: Record<AwarenessLanguageCode, string[]> = {
  en: ["en-IN", "en-US", "en-GB", "en"],
  hi: ["hi-IN", "hi"],
  te: ["te-IN", "te"],
  ta: ["ta-IN", "ta"],
  kn: ["kn-IN", "kn"],
  es: ["es-ES", "es-MX", "es-US", "es"],
};

function normalizeLocale(lang: string): string {
  return (lang || "").trim().replace(/_/g, "-").toLowerCase();
}

function findMatchingVoice<T extends VoiceLike>(
  voices: T[],
  candidates: string[]
): T | null {
  if (!voices.length) return null;

  // 1. Exact BCP-47 locale match (preferring non-robotic / default voices first)
  for (const cand of candidates) {
    const target = normalizeLocale(cand);
    const exact = voices.find((v) => normalizeLocale(v.lang) === target);
    if (exact) return exact;
  }

  // 2. Primary language prefix match (e.g., "hi" matches "hi-IN")
  for (const cand of candidates) {
    const primary = normalizeLocale(cand).split("-")[0];
    if (!primary) continue;
    const prefix = voices.find(
      (v) => normalizeLocale(v.lang).split("-")[0] === primary
    );
    if (prefix) return prefix;
  }

  return null;
}

/**
 * Selects the clearest installed system voice for the chosen language.
 * If the user's OS/browser does not have a regional voice pack (e.g. Telugu/Kannada/Tamil),
 * falls back cleanly to an installed English voice and speaks the English narration
 * so the user always hears clear, audible speech alongside their regional captions.
 */
export function resolveNarrationVoice<T extends VoiceLike>(
  voices: T[],
  language: AwarenessLanguageCode,
  localizedCaption: string,
  englishCaption: string
): ResolvedNarrationVoice<T> {
  const candidates = LANGUAGE_LOCALE_CANDIDATES[language] || ["en-IN", "en-US"];
  const primaryMatch = findMatchingVoice(voices, candidates);

  if (primaryMatch) {
    return {
      voice: primaryMatch,
      matchedExactLanguage: true,
      fallbackUsed: false,
      speechLang: primaryMatch.lang || candidates[0],
      textToSpeak: localizedCaption || englishCaption,
      voiceLabel: `${primaryMatch.name} (${primaryMatch.lang})`,
    };
  }

  // If no voice exists for the regional language, fall back to clear English narration
  if (language !== "en") {
    const englishMatch = findMatchingVoice(voices, LANGUAGE_LOCALE_CANDIDATES.en);
    return {
      voice: englishMatch,
      matchedExactLanguage: false,
      fallbackUsed: true,
      speechLang: englishMatch?.lang || "en-IN",
      textToSpeak: englishCaption || localizedCaption,
      voiceLabel: englishMatch
        ? `${englishMatch.name} (English fallback)`
        : "System English fallback",
    };
  }

  const defaultVoice = voices.find((v) => v.default) || voices[0] || null;
  return {
    voice: defaultVoice,
    matchedExactLanguage: Boolean(defaultVoice),
    fallbackUsed: false,
    speechLang: defaultVoice?.lang || "en-IN",
    textToSpeak: englishCaption || localizedCaption,
    voiceLabel: defaultVoice ? `${defaultVoice.name} (${defaultVoice.lang})` : "System Voice",
  };
}

/**
 * Maps an awareness video to its live animated clinical demonstration scene.
 */
export function inferClinicalSceneType(video: {
  id: string;
  category: string;
  title: string;
}): ClinicalSceneType {
  const hay = `${video.id} ${video.title} ${video.category}`.toLowerCase();
  if (
    hay.includes("blood pressure") ||
    hay.includes("bp ") ||
    hay.includes("oximeter") ||
    hay.includes("glucose") ||
    hay.includes("vitals")
  ) {
    return "vitals_bp";
  }
  if (hay.includes("smart-vision") || hay.includes("vision glasses") || hay.includes("glasses")) {
    return "smart_glasses";
  }
  if (hay.includes("hearing-aids") || hay.includes("hearing aid") || hay.includes("amplifier")) {
    return "hearing_aid";
  }
  if (hay.includes("deaf") || hay.includes("pager") || hay.includes("hard-of-hearing")) {
    return "deaf_triage";
  }
  if (hay.includes("cpr") || hay.includes("first aid") || hay.includes("blind")) {
    return "cpr_guide";
  }
  if (hay.includes("organ") || hay.includes("donor") || hay.includes("transplant")) {
    return "organ_donation";
  }
  return "vitals_bp";
}
