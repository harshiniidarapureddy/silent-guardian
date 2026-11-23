import test from "node:test";
import assert from "node:assert/strict";
import {
  LANGUAGE_LOCALE_CANDIDATES,
  inferClinicalSceneType,
  resolveNarrationVoice,
  type VoiceLike,
} from "./speechNarration";

const SAMPLE_VOICES: VoiceLike[] = [
  { name: "Google UK English Female", lang: "en-GB", default: false },
  { name: "Microsoft Heera", lang: "en-IN", default: true },
  { name: "Google हिन्दी", lang: "hi-IN", default: false },
  { name: "Google español", lang: "es-ES", default: false },
];

test("resolveNarrationVoice selects exact locale voice when available", () => {
  const hi = resolveNarrationVoice(
    SAMPLE_VOICES,
    "hi",
    "नमस्ते, यह स्मार्ट ग्लासेस गाइड है।",
    "Hello, this is the smart glasses guide."
  );
  assert.equal(hi.matchedExactLanguage, true);
  assert.equal(hi.fallbackUsed, false);
  assert.equal(hi.voice?.lang, "hi-IN");
  assert.equal(hi.textToSpeak, "नमस्ते, यह स्मार्ट ग्लासेस गाइड है।");

  const es = resolveNarrationVoice(
    SAMPLE_VOICES,
    "es",
    "Guía clínica de emergencia.",
    "Clinical emergency guide."
  );
  assert.equal(es.matchedExactLanguage, true);
  assert.equal(es.fallbackUsed, false);
  assert.equal(es.voice?.lang, "es-ES");
  assert.equal(es.textToSpeak, "Guía clínica de emergencia.");

  const en = resolveNarrationVoice(
    SAMPLE_VOICES,
    "en",
    "Check blood pressure calmly.",
    "Check blood pressure calmly."
  );
  assert.equal(en.matchedExactLanguage, true);
  assert.equal(en.fallbackUsed, false);
  assert.equal(en.voice?.lang, "en-IN");
});

test("resolveNarrationVoice cleanly falls back to English audio when regional voice pack is missing", () => {
  const te = resolveNarrationVoice(
    SAMPLE_VOICES,
    "te",
    "స్మార్ట్ గ్లాసెస్ ఔషధ లేబుల్స్ చదువుతాయి.",
    "Smart glasses read medicine labels aloud."
  );
  assert.equal(te.matchedExactLanguage, false);
  assert.equal(te.fallbackUsed, true);
  assert.equal(te.voice?.lang, "en-IN");
  assert.equal(te.textToSpeak, "Smart glasses read medicine labels aloud.");
  assert.match(te.voiceLabel, /English fallback/);

  const knNoVoices = resolveNarrationVoice(
    [],
    "kn",
    "ರಕ್ತದೊತ್ತಡ ಪರೀಕ್ಷೆ",
    "Blood pressure check"
  );
  assert.equal(knNoVoices.fallbackUsed, true);
  assert.equal(knNoVoices.textToSpeak, "Blood pressure check");
  assert.equal(knNoVoices.speechLang, "en-IN");
});

test("inferClinicalSceneType maps all clinical awareness video topics accurately", () => {
  assert.equal(
    inferClinicalSceneType({
      id: "vid-smart-vision",
      title: "How AI Smart Vision Glasses Work",
      category: "Assistive Technology Guides",
    }),
    "smart_glasses"
  );
  assert.equal(
    inferClinicalSceneType({
      id: "vid-hearing",
      title: "Digital Hearing Aids & Bluetooth Pairing",
      category: "Assistive Technology Guides",
    }),
    "hearing_aid"
  );
  assert.equal(
    inferClinicalSceneType({
      id: "vid-deaf",
      title: "Emergency Triage for Deaf & Hard-of-Hearing Patients",
      category: "Inclusive Healthcare & Emergency Communication",
    }),
    "deaf_triage"
  );
  assert.equal(
    inferClinicalSceneType({
      id: "vid-cpr",
      title: "Hands-Only CPR & First Aid Guide",
      category: "Inclusive Healthcare & Emergency Communication",
    }),
    "cpr_guide"
  );
  assert.equal(
    inferClinicalSceneType({
      id: "vid-organ",
      title: "Organ & Tissue Donation Myths vs Facts",
      category: "Organ & Tissue Donation Awareness",
    }),
    "organ_donation"
  );
  assert.equal(
    inferClinicalSceneType({
      id: "vid-bp",
      title: "Measuring Blood Pressure & SpO2 Oximeter Vitals",
      category: "Assistive Technology Guides",
    }),
    "vitals_bp"
  );
  assert.equal(Object.keys(LANGUAGE_LOCALE_CANDIDATES).length, 6);
});
