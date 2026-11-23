export type AwarenessLanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "es";

export type AwarenessVideoCategory =
  | "Assistive Technology Guides"
  | "Inclusive Healthcare & Emergency Communication"
  | "Organ & Tissue Donation Awareness";

export interface AwarenessLanguageMeta {
  code: AwarenessLanguageCode;
  label: string;
  nativeLabel: string;
  speechLang: string;
}

export const AWARENESS_LANGUAGES: AwarenessLanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", speechLang: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLang: "hi-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", speechLang: "te-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", speechLang: "ta-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", speechLang: "kn-IN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", speechLang: "es-ES" },
];

export const AWARENESS_CATEGORIES: AwarenessVideoCategory[] = [
  "Assistive Technology Guides",
  "Inclusive Healthcare & Emergency Communication",
  "Organ & Tissue Donation Awareness",
];

export const AWARENESS_THUMBNAILS = {
  smartVisionGlasses:
    "/src/assets/images/thumb_smart_vision_glasses_1795262008680.jpg",
  hearingAidEmergency:
    "/src/assets/images/thumb_hearing_aid_emergency_1795261998240.jpg",
  inclusiveErCommunication:
    "/src/assets/images/thumb_inclusive_er_communication_1795261999876.jpg",
  organDonationFacts:
    "/src/assets/images/thumb_organ_donation_facts_1795262001150.jpg",
  cprFirstAidGuide:
    "/src/assets/images/thumb_cpr_first_aid_guide_1795262002101.jpg",
} as const;

export interface AwarenessVideoChapter {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  visualSceneTag: string;
  keyTakeaway: string;
  captions: Record<AwarenessLanguageCode, string>;
}

export interface AwarenessVideoItem {
  id: string;
  title: string;
  category: AwarenessVideoCategory;
  description: string;
  thumbnailUrl: string;
  durationSec: number;
  durationLabel: string;
  quality: "HD 1080p" | "4K UHD";
  viewsLabel: string;
  medicalSource: string;
  published: boolean;
  updatedAt: string;
  languages: AwarenessLanguageCode[];
  chapters: AwarenessVideoChapter[];
}

export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const AWARENESS_VIDEOS_KEY = "cp_awareness_videos_catalog_v2";

export const PREDEFINED_AWARENESS_VIDEOS: AwarenessVideoItem[] = [
  {
    id: "vid-smart-vision-glasses",
    title: "How AI Smart Vision Glasses Work in Daily Care & Emergencies",
    category: "Assistive Technology Guides",
    description:
      "Step-by-step visual and audio walkthrough showing how wearable AI camera glasses read medicine labels, detect hallway obstacles, and trigger hands-free Care Preempt SOS beacons.",
    thumbnailUrl: AWARENESS_THUMBNAILS.smartVisionGlasses,
    durationSec: 255,
    durationLabel: "04:15",
    quality: "HD 1080p",
    viewsLabel: "18.4K views",
    medicalSource: "Care Preempt Low-Vision Clinical Board",
    published: true,
    updatedAt: "2026-10-22",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-svg-1",
        title: "Wearable Camera & Optical Capture",
        startSec: 0,
        endSec: 65,
        visualSceneTag: "Micro-HD Optical Lens · Real-Time Frame Capture",
        keyTakeaway:
          "Lightweight side-mounted cameras capture medicine bottles, clinic signs, and doorways hands-free.",
        captions: {
          en: "AI smart vision glasses use a lightweight frame-mounted camera to capture prescription labels and hallway signs completely hands-free.",
          hi: "एआई स्मार्ट विज़न ग्लासेस हल्के कैमरे से दवा के लेबल और अस्पताल के साइन बिना हाथ लगाए तुरंत पढ़ लेते हैं।",
          te: "AI స్మార్ట్ విజన్ గ్లాసెస్ తేలికపాటి కెమెరాతో మందుల లేబుల్స్ మరియు ఆసుపత్రి బోర్డులను తక్షణమే గుర్తిస్తాయి.",
          ta: "AI ஸ்மார்ட் விஷன் கண்ணாடிகள் மருந்து லேபிள்கள் மற்றும் மருத்துவமனை அறிவிப்புகளை உடனடியாகப் படிக்க உதவுகின்றன.",
          kn: "AI ಸ್ಮಾರ್ಟ್ ವಿಷನ್ ಗ್ಲಾಸ್‌ಗಳು ಔಷಧಿ ಲೇಬಲ್‌ಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ಸೂಚನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸುತ್ತವೆ.",
          es: "Las gafas inteligentes con IA utilizan una cámara ligera para leer etiquetas de medicamentos y señales clínicas sin usar las manos.",
        },
      },
      {
        id: "ch-svg-2",
        title: "Medicine Label OCR & Dosage Verification",
        startSec: 65,
        endSec: 130,
        visualSceneTag: "On-Device OCR · Instant Dosage Readout",
        keyTakeaway:
          "Optical character recognition reads drug name, dosage strength, and expiry dates aloud before taking medication.",
        captions: {
          en: "Hold any medicine bottle 30 centimeters ahead. On-device OCR immediately speaks the medication name, dosage, and expiration date.",
          hi: "दवा की बोतल को 30 सेंटीमीटर सामने रखें; स्मार्ट ग्लासेस तुरंत दवा का नाम, खुराक और एक्सपायरी डेट बोलकर सुनाते हैं।",
          te: "మందుల బాటిల్‌ను ముందు ఉంచితే, గ్లాసెస్ మందు పేరు, మోతాదు మరియు గడువు తేదీని స్పష్టంగా వినిపిస్తాయి.",
          ta: "மருந்து பாட்டிலை முன்னால் பிடித்தால், மருந்தின் பெயர், அளவு மற்றும் காலாவதி தேதியை உடனே ஒலிவழியாகச் சொல்லும்.",
          kn: "ಔಷಧಿ ಬಾಟಲಿಯನ್ನು ಮುಂದೆ ಹಿಡಿದರೆ, ಹೆಸರು, ಪ್ರಮಾಣ ಮತ್ತು ಮುಕ್ತಾಯ ದಿನಾಂಕವನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಓದಿ ಹೇಳುತ್ತದೆ.",
          es: "Sostenga el frasco frente a usted; el reconocimiento óptico lee en voz alta el nombre del medicamento, la dosis y la fecha de caducidad.",
        },
      },
      {
        id: "ch-svg-3",
        title: "Open-Ear Bone-Conduction Audio",
        startSec: 130,
        endSec: 195,
        visualSceneTag: "Open-Ear Directional Audio · Safe Ambient Hearing",
        keyTakeaway:
          "Private audio guidance travels near the temple so ears remain open to doctors, traffic, and nurses.",
        captions: {
          en: "Open-ear temple speakers deliver clear private guidance while keeping your ear canals open to hear nurses, ambulances, and traffic.",
          hi: "ओपन-ईयर स्पीकर आपको स्पष्ट निर्देश देते हैं ताकि आप डॉक्टर, नर्स और आसपास की आवाज़ें भी सुरक्षित रूप से सुन सकें।",
          te: "ఓపెన్-ఇయర్ ఆడియో ద్వారా స్పష్టమైన మార్గదర్శనం అందుతుంది, అదే సమయంలో వైద్యులు మరియు పరిసర శబ్దాలు కూడా వినిపిస్తాయి.",
          ta: "ஓபன்-இயர் ஒலி அமைப்பு தெளிவான வழிகாட்டுதலைத் தரும் அதே வேளையில் சுற்றியுள்ள ஒலிகளையும் கேட்க அனுமதிக்கிறது.",
          kn: "ಓಪನ್-ಇಯರ್ ಆಡಿಯೋ ಸ್ಪಷ್ಟ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ ಹಾಗೂ ಸುತ್ತಮುತ್ತಲಿನ ಶಬ್ದಗಳನ್ನು ಕೇಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
          es: "Los altavoces de oído abierto brindan guía privada mientras le permiten escuchar claramente al personal médico y el entorno.",
        },
      },
      {
        id: "ch-svg-4",
        title: "Hands-Free Care Preempt SOS Trigger",
        startSec: 195,
        endSec: 255,
        visualSceneTag: "Bluetooth LE Bridge · Instant Guardian & ER Beacon",
        keyTakeaway:
          "Double-tap the temple or say 'Trigger Emergency SOS' to alert family guardians and nearest ER bays.",
        captions: {
          en: "In an emergency, say Trigger Emergency SOS or double-tap the temple frame to send your live GPS and medical profile to responders.",
          hi: "आपात स्थिति में 'ट्रिगर इमरजेंसी एसओएस' बोलें या फ्रेम पर दो बार टैप करें—आपकी जीपीएस लोकेशन तुरंत आपातकालीन टीम को मिल जाएगी।",
          te: "అత్యవసర పరిస్థితిలో వాయిస్ కమాండ్ లేదా డబుల్-టాప్ ద్వారా మీ GPS మరియు వైద్య వివరాలను వెంటనే పంపవచ్చు.",
          ta: "அவசர நிலையில் குரல் கட்டளை அல்லது இருமுறை தட்டுவதன் மூலம் உங்கள் இடமும் மருத்துவ விவரங்களும் உடனே அனுப்பப்படும்.",
          kn: "ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಧ್ವನಿ ಆದೇಶ ಅಥವಾ ಡಬಲ್ ಟ್ಯಾಪ್ ಮೂಲಕ ನಿಮ್ಮ ಜಿಪಿಎಸ್ ಮತ್ತು ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯನ್ನು ತಕ್ಷಣ ಕಳುಹಿಸಬಹುದು.",
          es: "En una emergencia, diga Activar SOS o toque dos veces la patilla para enviar su ubicación GPS y perfil médico de inmediato.",
        },
      },
    ],
  },
  {
    id: "vid-hearing-aids-emergency",
    title: "Using Hearing Aids & Pocket Amplifiers in Emergency Situations",
    category: "Assistive Technology Guides",
    description:
      "Practical clinical guide for hard-of-hearing patients and families on Bluetooth LE hearing aid pairing, emergency speech-clarity presets, and backup hospital pocket amplifiers.",
    thumbnailUrl: AWARENESS_THUMBNAILS.hearingAidEmergency,
    durationSec: 220,
    durationLabel: "03:40",
    quality: "HD 1080p",
    viewsLabel: "14.2K views",
    medicalSource: "Indian Society of Audiology & ER Care",
    published: true,
    updatedAt: "2026-10-19",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-ha-1",
        title: "Switching to Emergency Speech-Clarity Mode",
        startSec: 0,
        endSec: 60,
        visualSceneTag: "Noise Reduction · Front-Focus Voice Filtering",
        keyTakeaway:
          "Switch hearing aids to speech-in-noise focus to cut through ambulance sirens and busy ER bays.",
        captions: {
          en: "Busy emergency rooms are noisy. Switch your hearing aid to Speech-in-Noise mode so frontal clinician voices stand out clearly.",
          hi: "व्यस्त इमरजेंसी वार्ड में अपने हियरिंग एड को 'स्पीच-इन-नॉइज़' मोड पर रखें ताकि डॉक्टर की आवाज़ साफ सुनाई दे।",
          te: "రద్దీగా ఉండే ఎమర్జెన్సీ గదిలో హియరింగ్ ఎయిడ్‌ను స్పీచ్-క్లారిటీ మోడ్‌లో ఉంచితే వైద్యుల మాటలు స్పష్టంగా వినిపిస్తాయి.",
          ta: "அவசர சிகிச்சைப் பிரிவில் உங்கள் கேட்கும் கருவியை தெளிவான பேச்சு பயன்முறைக்கு மாற்றினால் மருத்துவர் குரல் தெளிவாகக் கேட்கும்.",
          kn: "ತುರ್ತು ವಿಭಾಗದಲ್ಲಿ ನಿಮ್ಮ ಶ್ರವಣ ಸಾಧನವನ್ನು ಸ್ಪೀಚ್-ಕ್ಲಾರಿಟಿ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿದರೆ ವೈದ್ಯರ ಮಾತು ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸುತ್ತದೆ.",
          es: "En salas de urgencias ruidosas, active el modo de enfoque de voz para escuchar claramente las indicaciones del médico.",
        },
      },
      {
        id: "ch-ha-2",
        title: "Pairing with Care Preempt Live Captions",
        startSec: 60,
        endSec: 120,
        visualSceneTag: "Bluetooth LE + Visual-First Synchronized Captions",
        keyTakeaway:
          "Pair Visual-First Mode alongside hearing aids for zero-ambiguity dosage and triage instructions.",
        captions: {
          en: "Enable Visual-First Mode in Care Preempt to pair crisp live captions with your Bluetooth hearing aid during every consultation.",
          hi: "केयर प्रीएम्प्ट में विजुअल-फर्स्ट मोड चालू करें ताकि सुनने के साथ-साथ स्क्रीन पर लाइव कैप्शन भी दिखते रहें।",
          te: "కేర్ ప్రీఎమ్ప్ట్‌లో విజువల్-ఫస్ట్ మోడ్ ఆన్ చేయడం ద్వారా ఆడియోతో పాటు స్క్రీన్‌పై లైవ్ క్యాప్షన్స్ కూడా చూడవచ్చు.",
          ta: "விஷுவல்-ஃபர்ஸ்ட் பயன்முறையை இயக்கினால் ஆடியோவுடன் நேரடி வசனங்களும் திரையில் தெளிவாகத் தோன்றும்.",
          kn: "ವಿಷುಯಲ್-ಫಸ್ಟ್ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸುವುದರಿಂದ ಧ್ವನಿಯೊಂದಿಗೆ ಲೈವ್ ಕ್ಯಾಪ್ಷನ್‌ಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಓದಬಹುದು.",
          es: "Active el modo Visual-First en Care Preempt para combinar subtítulos en vivo con su audífono Bluetooth en cada consulta.",
        },
      },
      {
        id: "ch-ha-3",
        title: "Requesting a Hospital Bedside Pocket Amplifier",
        startSec: 120,
        endSec: 175,
        visualSceneTag: "Hospital Special Device Stock · Instant Loaner Unit",
        keyTakeaway:
          "If your battery dies or you left your aid at home, ask ER intake for a sanitized hospital pocket amplifier.",
        captions: {
          en: "Forgot your hearing aid or low on battery? Care Preempt hospitals stock sanitized pocket amplifiers ready at every triage desk.",
          hi: "अगर हियरिंग एड की बैटरी खत्म हो जाए या आप उसे घर भूल जाएं, तो अस्पताल के ट्राइएज डेस्क से पॉकेट एम्पलीफायर मांगें।",
          te: "మీ హియరింగ్ ఎయిడ్ బ్యాటరీ అయిపోయినా లేదా మర్చిపోయినా, ఆసుపత్రి ట్రయాజ్ డెస్క్‌లో పాకెట్ యాంప్లిఫైయర్ అడగండి.",
          ta: "உங்கள் கருவியின் பேட்டரி தீர்ந்துவிட்டால், மருத்துவமனை வரவேற்பறையில் சுத்திகரிக்கப்பட்ட பாக்கெட் ஆம்ப்ளிஃபையரைக் கேளுங்கள்.",
          kn: "ನಿಮ್ಮ ಶ್ರವಣ ಸಾಧನದ ಬ್ಯಾಟರಿ ಖಾಲಿಯಾದರೆ, ಆಸ್ಪತ್ರೆಯ ಟ್ರಯಾಜ್ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ಪಾಕೆಟ್ ಆಂಪ್ಲಿಫೈಯರ್ ಪಡೆಯಬಹುದು.",
          es: "Si se agota la batería o dejó su audífono en casa, solicite un amplificador portátil desinfectado en admisiones.",
        },
      },
      {
        id: "ch-ha-4",
        title: "Safe Storage During MRI & CT Scans",
        startSec: 175,
        endSec: 220,
        visualSceneTag: "Imaging Safety Checklist · Labeled Bedside Case",
        keyTakeaway:
          "Always place hearing aids in a labeled hospital container before MRI scans and request visual cue cards inside.",
        captions: {
          en: "Before MRI scans, place hearing aids safely in a labeled bedside case and ask the technologist to use visual hand signals.",
          hi: "एमआरआई स्कैन से पहले हियरिंग एड को लेबल किए गए बॉक्स में सुरक्षित रखें और टेक्नीशियन से विजुअल संकेतों का उपयोग करने को कहें।",
          te: "MRI స్కాన్ ముందు హియరింగ్ ఎయిడ్‌ను లేబుల్ చేసిన బాక్స్‌లో సురక్షితంగా ఉంచి, విజువల్ సైగలు వాడమని కోరండి.",
          ta: "எம்ஆர்ஐ ஸ்கேனுக்கு முன் கருவியைப் பாதுகாப்பான பெட்டியில் வைத்து, காட்சி சைகைகளைப் பயன்படுத்தக் கேளுங்கள்.",
          kn: "ಎಂಆರ್‌ಐ ಸ್ಕ್ಯಾನ್‌ಗೆ ಮುನ್ನ ಶ್ರವಣ ಸಾಧನವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇಟ್ಟು, ದೃಶ್ಯ ಸಂಕೇತಗಳನ್ನು ಬಳಸಲು ಕೇಳಿಕೊಳ್ಳಿ.",
          es: "Antes de una resonancia magnética, guarde su audífono en un estuche rotulado y solicite señales visuales al técnico.",
        },
      },
    ],
  },
  {
    id: "vid-assisting-deaf-patients",
    title: "Assisting Deaf & Hard-of-Hearing Patients in Emergency Triage",
    category: "Inclusive Healthcare & Emergency Communication",
    description:
      "Clear, compassionate communication protocol for caregivers, bystanders, and hospital nurses using visual pain scales, well-lit face-to-face positioning, and vibrating ward pagers.",
    thumbnailUrl: AWARENESS_THUMBNAILS.inclusiveErCommunication,
    durationSec: 310,
    durationLabel: "05:10",
    quality: "HD 1080p",
    viewsLabel: "22.9K views",
    medicalSource: "National Deaf Health & Triage Alliance",
    published: true,
    updatedAt: "2026-10-21",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-deaf-1",
        title: "Respectful Visual Attention & Lighting",
        startSec: 0,
        endSec: 80,
        visualSceneTag: "Face-to-Face Positioning · Clear Sightline",
        keyTakeaway:
          "Gently tap the shoulder or wave in view, stand in good light, and speak directly to the patient—not only to their companion.",
        captions: {
          en: "Always gain attention with a gentle wave or light shoulder tap, face the patient directly in good lighting, and address them personally.",
          hi: "सदैव हल्के संकेत या कंधे पर कोमल स्पर्श से ध्यान आकर्षित करें, अच्छी रोशनी में सीधे मरीज़ की ओर देखकर बात करें।",
          te: "మంచి వెలుతురులో రోగిని నేరుగా చూస్తూ, సున్నితమైన సైగతో దృష్టిని ఆకర్షించి స్పష్టంగా సంభాషించండి.",
          ta: "நல்ல வெளிச்சத்தில் நோயாளியை நேராகப் பார்த்து, மென்மையான சைகையுடன் கவனம் பெற்று அவர்களிடம் நேரடியாகப் பேசுங்கள்.",
          kn: "ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ರೋಗಿಯನ್ನು ನೇರವಾಗಿ ನೋಡಿ, ಸೌಮ್ಯ ಸಂಕೇತದೊಂದಿಗೆ ಗಮನ ಸೆಳೆದು ನೇರವಾಗಿ ಸಂವಹನ ನಡೆಸಿ.",
          es: "Llame su atención con un gesto suave, colóquese frente al paciente con buena iluminación y diríjase siempre directamente a la persona.",
        },
      },
      {
        id: "ch-deaf-2",
        title: "Using Visual Triage & Pain Scale Cards",
        startSec: 80,
        endSec: 160,
        visualSceneTag: "Icon-Based Triage Tablet · Rapid Symptom Confirmation",
        keyTakeaway:
          "Point to body diagrams and 1–10 visual pain charts to accurately confirm symptoms without misunderstanding.",
        captions: {
          en: "Use icon-based triage tablets and visual pain scales so patients can point precisely to where symptoms hurt and how intense they feel.",
          hi: "लक्षणों और दर्द की तीव्रता की सटीक पुष्टि के लिए विजुअल ट्राइएज टैबलेट और आइकन कार्ड का उपयोग करें।",
          te: "లక్షణాలు మరియు నొప్పి తీవ్రతను ఖచ్చితంగా తెలుసుకోవడానికి విజువల్ ట్రయాజ్ కార్డులు మరియు బొమ్మలను ఉపయోగించండి.",
          ta: "அறிகுறிகள் மற்றும் வலியின் அளவைத் துல்லியமாக அறிய காட்சி அட்டைகள் மற்றும் படங்களைப் பயன்படுத்துங்கள்.",
          kn: "ಲಕ್ಷಣಗಳು ಮತ್ತು ನೋವಿನ ತೀವ್ರತೆಯನ್ನು ನಿಖರವಾಗಿ ತಿಳಿಯಲು ದೃಶ್ಯ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ಬಳಸಿ.",
          es: "Utilice tabletas visuales y escalas gráficas de dolor para que el paciente señale con precisión sus síntomas.",
        },
      },
      {
        id: "ch-deaf-3",
        title: "Live Captions & Written Discharge Confirmation",
        startSec: 160,
        endSec: 235,
        visualSceneTag: "Real-Time Speech-to-Text · Medication Clarity",
        keyTakeaway:
          "Write down dosage intervals and follow-up dates clearly; lip-reading alone misses up to 60% of medical terms.",
        captions: {
          en: "Because lip-reading misses many clinical terms, always confirm medication doses and warning signs in clear written text or live captions.",
          hi: "चूंकि लिप-रीडिंग में कई मेडिकल शब्द छूट सकते हैं, इसलिए दवा की खुराक और चेतावनी के संकेत हमेशा लिखित या लाइव कैप्शन में दें।",
          te: "వైద్య పదాలు తప్పుగా అర్థం కాకుండా ఉండేందుకు మందుల వివరాలు మరియు సూచనలను ఎల్లప్పుడూ రాతపూర్వకంగా లేదా లైవ్ క్యాప్షన్స్‌లో ఇవ్వండి.",
          ta: "மருத்துவ சொற்கள் தவறாமல் புரிய, மருந்து அளவுகளையும் எச்சரிக்கைகளையும் எப்போதும் எழுத்துப்பூர்வமாக வழங்கவும்.",
          kn: "ವೈದ್ಯಕೀಯ ಪದಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥವಾಗಲು ಔಷಧಿ ವಿವರಗಳನ್ನು ಯಾವಾಗಲೂ ಲಿಖಿತ ರೂಪದಲ್ಲಿ ಅಥವಾ ಲೈವ್ ಕ್ಯಾಪ್ಷನ್‌ನಲ್ಲಿ ನೀಡಿ.",
          es: "Confirme siempre las dosis y señales de alerta por escrito o con subtítulos en vivo para evitar malentendidos clínicos.",
        },
      },
      {
        id: "ch-deaf-4",
        title: "Vibrating Ward Alert Pagers for Inpatient Safety",
        startSec: 235,
        endSec: 310,
        visualSceneTag: "Haptic Wristband Alert · Flashing Bedside Receiver",
        keyTakeaway:
          "Assign a hospital vibrating pager on admission so Deaf patients never miss nurse check-ins or safety alerts.",
        captions: {
          en: "Assign a visual and vibrating ward alert pager upon admission so Deaf patients stay informed of nurse visits and emergency alarms.",
          hi: "भर्ती होते ही विजुअल और वाइब्रेटिंग वार्ड पेजर प्रदान करें ताकि बधिर मरीज़ को नर्स विज़िट और अलर्ट तुरंत मिल सकें।",
          te: "అడ్మిషన్ సమయంలో వైబ్రేటింగ్ వార్డ్ పేజర్ అందించడం ద్వారా నర్స్ విజిట్ మరియు అత్యవసర అలర్ట్‌లు వెంటనే తెలుస్తాయి.",
          ta: "மருத்துவமனையில் சேரும்போதே அதிர்வுறும் எச்சரிக்கை பேஜரை வழங்குவதால் செவிலியர் வருகையும் அலாரங்களும் உடனே தெரியும்.",
          kn: "ದಾಖಲಾತಿಯ ಸಮಯದಲ್ಲಿ ವೈಬ್ರೇಟಿಂಗ್ ವಾರ್ಡ್ ಪೇಜರ್ ನೀಡುವುದರಿಂದ ನರ್ಸ್ ಭೇಟಿ ಮತ್ತು ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು ತಕ್ಷಣ ತಿಳಿಯುತ್ತವೆ.",
          es: "Asigne un localizador visual y vibratorio al ingresar para que el paciente reciba avisos de enfermería y alertas de seguridad.",
        },
      },
    ],
  },
  {
    id: "vid-guiding-blind-patients",
    title: "Emergency First Aid & Guiding Blind or Visually Impaired Patients",
    category: "Inclusive Healthcare & Emergency Communication",
    description:
      "Essential bystander and clinician training on verbalizing care steps, sighted-guide walking technique, and CPR coordination for blind and low-vision community members.",
    thumbnailUrl: AWARENESS_THUMBNAILS.cprFirstAidGuide,
    durationSec: 270,
    durationLabel: "04:30",
    quality: "HD 1080p",
    viewsLabel: "16.8K views",
    medicalSource: "Care Preempt Emergency Paramedic Council",
    published: true,
    updatedAt: "2026-10-18",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-blind-1",
        title: "Introduce Yourself & Narrate Every Action",
        startSec: 0,
        endSec: 70,
        visualSceneTag: "Calm Verbal Orientation · Consent Before Touch",
        keyTakeaway:
          "State your name and role clearly before touching the patient or applying a blood pressure cuff.",
        captions: {
          en: "Always introduce yourself by name and role, and explain what you are about to do before placing a stethoscope or pulse oximeter.",
          hi: "किसी भी जांच या उपकरण का उपयोग करने से पहले अपना नाम और भूमिका बताएं और हर कदम को शांत आवाज़ में समझाएं।",
          te: "ఏదైనా వైద్య పరీక్ష చేసే ముందు మీ పేరు, బాధ్యతను చెప్పి, చేయబోయే ప్రక్రియను ప్రశాంతంగా వివరించండి.",
          ta: "பரிசோதனை செய்யும் முன் உங்கள் பெயர் மற்றும் பொறுப்பைக் கூறி, ஒவ்வொரு செயலையும் அமைதியாக விளக்கவும்.",
          kn: "ಯಾವುದೇ ಪರೀಕ್ಷೆ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಪಾತ್ರವನ್ನು ತಿಳಿಸಿ, ಪ್ರತಿ ಹಂತವನ್ನು ಶಾಂತವಾಗಿ ವಿವರಿಸಿ.",
          es: "Preséntese siempre por su nombre y función, y explique cada paso antes de realizar cualquier contacto clínico.",
        },
      },
      {
        id: "ch-blind-2",
        title: "Sighted-Guide Technique in Busy Corridors",
        startSec: 70,
        endSec: 140,
        visualSceneTag: "Elbow-Hold Guidance · Safe Step & Doorway Cues",
        keyTakeaway:
          "Offer your bent elbow rather than pulling the person's arm, and announce stairs, ramps, and chairs clearly.",
        captions: {
          en: "Never pull a blind patient by the wrist. Offer your bent elbow so they can walk half a step behind while you call out stairs and doorways.",
          hi: "कभी भी हाथ पकड़कर न खींचें—अपनी कोहनी का सहारा दें और सीढ़ियों, दरवाजों व कुर्सी की स्थिति पहले से बताएं।",
          te: "చేయి పట్టుకుని లాగకుండా మీ మోచేయిని ఆధారంగా అందించండి; మెట్లు మరియు తలుపుల గురించి ముందుగా తెలియజేయండి.",
          ta: "கையைப் பிடித்து இழுக்காமல் உங்கள் முழங்கையை ஆதரவாகக் கொடுத்து, படிகள் மற்றும் கதவுகளை முன்கூட்டியே தெரிவியுங்கள்.",
          kn: "ಕೈ ಹಿಡಿದು ಎಳೆಯದೆ ನಿಮ್ಮ ಮೊಣಕೈ ಆಧಾರ ನೀಡಿ; ಮೆಟ್ಟಿಲುಗಳು ಮತ್ತು ಬಾಗಿಲುಗಳ ಬಗ್ಗೆ ಮುಂಚಿತವಾಗಿ ತಿಳಿಸಿ.",
          es: "Nunca tire del brazo del paciente; ofrezca su codo doblado y anuncie con antelación escalones, puertas o sillas.",
        },
      },
      {
        id: "ch-blind-3",
        title: "Hands-Only CPR & Audio-Guided Rhythm",
        startSec: 140,
        endSec: 210,
        visualSceneTag: "100–120 BPM Audio Metronome · Center-Chest Placement",
        keyTakeaway:
          "Push hard and fast in the center of the chest at 100–120 compressions per minute using audio cues.",
        captions: {
          en: "For cardiac arrest, place both hands in the center of the chest and press hard and fast at 100 to 120 compressions per minute.",
          hi: "कार्डियक अरेस्ट में छाती के बीच दोनों हाथ रखें और प्रति मिनट 100 से 120 बार मजबूत और तेज़ दबाव दें।",
          te: "గుండె ఆగినప్పుడు ఛాతీ మధ్యలో రెండు చేతులు ఉంచి నిమిషానికి 100 నుండి 120 సార్లు గట్టిగా, వేగంగా నొక్కండి.",
          ta: "இதயத் துடிப்பு நின்றால் மார்பின் மையத்தில் இரு கைகளையும் வைத்து நிமிடத்திற்கு 100 முதல் 120 முறை அழுத்தவும்.",
          kn: "ಹೃದಯ ಸ್ತಂಭನವಾದಾಗ ಎದೆಯ ಮಧ್ಯದಲ್ಲಿ ಎರಡೂ ಕೈಗಳನ್ನಿಟ್ಟು ನಿಮಿಷಕ್ಕೆ 100 ರಿಂದ 120 ಬಾರಿ ಬಲವಾಗಿ ಒತ್ತಿ.",
          es: "Ante un paro cardíaco, coloque ambas manos en el centro del pecho y comprima fuerte y rápido a un ritmo de 100 a 120 por minuto.",
        },
      },
      {
        id: "ch-blind-4",
        title: "Keeping Assistive Hardware Safe & Accessible",
        startSec: 210,
        endSec: 270,
        visualSceneTag: "White Cane & Smart Glasses · Bedside Continuity",
        keyTakeaway:
          "Never relocate a patient's white cane or smart vision glasses without informing them exactly where it rests.",
        captions: {
          en: "Keep the patient's white cane and smart vision glasses within arm's reach and always tell them before moving personal aids.",
          hi: "मरीज़ की व्हाइट केन और स्मार्ट विज़न ग्लासेस को हमेशा उनकी पहुंच में रखें और बिना बताए उन्हें दूसरी जगह न रखें।",
          te: "రోగి యొక్క వైట్ కేన్ మరియు స్మార్ట్ గ్లాసెస్‌ను ఎల్లప్పుడూ అందుబాటులో ఉంచి, మార్చే ముందు తప్పక తెలియజేయండి.",
          ta: "நோயாளியின் வெள்ளைக் கோல் மற்றும் ஸ்மார்ட் கண்ணாடிகளை எப்போதும் அருகிலேயே வைத்து, நகர்த்தும் முன் தெரிவியுங்கள்.",
          kn: "ರೋಗಿಯ ವೈಟ್ ಕೇನ್ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಗ್ಲಾಸ್‌ಗಳನ್ನು ಯಾವಾಗಲೂ ಕೈಗೆಟುಕುವಂತೆ ಇರಿಸಿ, ಸ್ಥಳಾಂತರಿಸುವ ಮೊದಲು ತಿಳಿಸಿ.",
          es: "Mantenga el bastón blanco y las gafas inteligentes siempre al alcance del paciente y avise antes de moverlos.",
        },
      },
    ],
  },
  {
    id: "vid-organ-donation-myths-facts",
    title: "Organ & Tissue Donation: Myths vs. Clinical Facts",
    category: "Organ & Tissue Donation Awareness",
    description:
      "Empathetic, physician-led breakdown answering the most common questions about emergency medical ethics, brain-stem death certification, age eligibility, and zero cost to donor families.",
    thumbnailUrl: AWARENESS_THUMBNAILS.organDonationFacts,
    durationSec: 290,
    durationLabel: "04:50",
    quality: "HD 1080p",
    viewsLabel: "31.5K views",
    medicalSource: "NOTTO Clinical Ethics & Transplant Advisory",
    published: true,
    updatedAt: "2026-10-20",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-od-1",
        title: "Myth 1: Does Being a Donor Affect Emergency Care?",
        startSec: 0,
        endSec: 75,
        visualSceneTag: "Strict Clinical Separation · Life-Saving First",
        keyTakeaway:
          "Fact: Emergency doctors work solely to save your life. Transplant teams are completely separate and never consulted until all efforts end.",
        captions: {
          en: "Fact: Your emergency medical team's sole mission is saving your life. Organ donation is never considered until all life-saving care has ended.",
          hi: "तथ्य: आपातकालीन डॉक्टरों का एकमात्र लक्ष्य आपकी जान बचाना है। अंगदान की टीम पूरी तरह अलग होती है।",
          te: "వాస్తవం: అత్యవసర వైద్యుల ఏకైక లక్ష్యం మీ ప్రాణాలను కాపాడటం మాత్రమే. అవయవ దాన బృందం పూర్తిగా వేరుగా ఉంటుంది.",
          ta: "உண்மை: அவசர மருத்துவர்களின் ஒரே நோக்கம் உங்கள் உயிரைக் காப்பாற்றுவதே. உறுப்பு மாற்று குழு முற்றிலும் தனிப்பட்டது.",
          kn: "ಸತ್ಯ: ತುರ್ತು ವೈದ್ಯರ ಏಕೈಕ ಗುರಿ ನಿಮ್ಮ ಜೀವವನ್ನು ಉಳಿಸುವುದಾಗಿದೆ. ಅಂಗಾಂಗ ದಾನ ತಂಡವು ಸಂಪೂರ್ಣವಾಗಿ ಪ್ರತ್ಯೇಕವಾಗಿರುತ್ತದೆ.",
          es: "Hecho: El único objetivo del equipo de urgencias es salvar su vida. La donación solo se evalúa cuando ya no existe posibilidad médica.",
        },
      },
      {
        id: "ch-od-2",
        title: "Myth 2: Am I Too Old or Have Health Conditions?",
        startSec: 75,
        endSec: 150,
        visualSceneTag: "Individual Medical Evaluation · Corneas & Tissues",
        keyTakeaway:
          "Fact: People of almost any age can pledge; doctors evaluate individual organ and cornea suitability only when the time comes.",
        captions: {
          en: "Fact: There is no strict upper age limit to register a pledge. Corneas and tissues from older adults restore sight and heal thousands every year.",
          hi: "तथ्य: अंगदान संकल्प के लिए कोई कठोर आयु सीमा नहीं है। वरिष्ठ नागरिक भी कॉर्निया और ऊतक दान से दूसरों को नई रोशनी दे सकते हैं।",
          te: "వాస్తవం: అవయవ దాన ప్రతిజ్ఞకు కఠినమైన వయోపరిమితి లేదు. పెద్దవారి కార్నియా దానం ఎందరికో చూపును అందిస్తుంది.",
          ta: "உண்மை: உறுப்பு தான உறுதிமொழிக்கு கடுமையான வயது வரம்பு இல்லை. முதியவர்களின் கருவிழி தானம் பலருக்கு பார்வை அளிக்கிறது.",
          kn: "ಸತ್ಯ: ಅಂಗಾಂಗ ದಾನ ಪ್ರತಿಜ್ಞೆಗೆ ಕಟ್ಟುನಿಟ್ಟಾದ ವಯೋಮಿತಿ ಇಲ್ಲ. ಹಿರಿಯರ ಕಾರ್ನಿಯಾ ದಾನವು ಹಲವರಿಗೆ ದೃಷ್ಟಿ ನೀಡುತ್ತದೆ.",
          es: "Hecho: No existe un límite estricto de edad para registrarse. Las córneas y tejidos de adultos mayores restauran la visión cada año.",
        },
      },
      {
        id: "ch-od-3",
        title: "Myth 3: Does Donation Cost the Family Money?",
        startSec: 150,
        endSec: 220,
        visualSceneTag: "Zero Financial Burden · Respectful Dignity",
        keyTakeaway:
          "Fact: Donor families are never charged for organ recovery, and every procedure treats the donor body with complete dignity.",
        captions: {
          en: "Fact: Organ and tissue recovery never costs the donor's family anything, and the body is always treated with the deepest clinical respect.",
          hi: "तथ्य: अंगदान की प्रक्रिया का कोई भी खर्च दाता के परिवार पर नहीं आता, और पूरे सम्मान के साथ प्रक्रिया पूरी की जाती है।",
          te: "వాస్తవం: అవయవ దాన ప్రక్రియకు దాత కుటుంబానికి ఎలాంటి ఖర్చు ఉండదు మరియు పూర్తి గౌರವంతో నిర్వహిస్తారు.",
          ta: "உண்மை: உறுப்பு தான செயல்முறைக்கு குடும்பத்திற்கு எந்த செலவும் இல்லை; முழு மரியாதையுடன் மேற்கொள்ளப்படுகிறது.",
          kn: "ಸತ್ಯ: ಅಂಗಾಂಗ ದಾನ ಪ್ರಕ್ರಿಯೆಗೆ ಕುಟುಂಬಕ್ಕೆ ಯಾವುದೇ ವೆಚ್ಚವಿರುವುದಿಲ್ಲ ಮತ್ತು ಸಂಪೂರ್ಣ ಗೌರವದಿಂದ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ.",
          es: "Hecho: La donación nunca genera costos para la familia del donante y el procedimiento se realiza con absoluto respeto y dignidad.",
        },
      },
      {
        id: "ch-od-4",
        title: "Why Telling Your Next-of-Kin Matters Most",
        startSec: 220,
        endSec: 290,
        visualSceneTag: "Family Consent & Shared Wishes · Digital Donor Card",
        keyTakeaway:
          "Share your Care Preempt Digital Donor Card with your family guardian so they can honor your wishes peacefully.",
        captions: {
          en: "Under Indian law, family consent is essential. Sharing your Care Preempt Donor Card with your next-of-kin ensures your compassionate wish is honored.",
          hi: "भारतीय कानून के अनुसार परिवार की सहमति आवश्यक है। अपना डिजिटल डोनर कार्ड परिवार के साथ साझा करें ताकि आपकी इच्छा पूरी हो सके।",
          te: "భారతీయ చట్టం ప్రకారం కుటుంబ సమ్మతి ముఖ్యం. మీ డిజిటల్ డోనర్ కార్డును కుటుంబ సభ్యులతో పంచుకోండి.",
          ta: "இந்திய சட்டத்தின்படி குடும்ப சம்மதம் அவசியம். உங்கள் டிஜிட்டல் நன்கொடையாளர் அட்டையை குடும்பத்தாருடன் பகிருங்கள்.",
          kn: "ಭಾರತೀಯ ಕಾನೂನಿನ ಪ್ರಕಾರ ಕುಟುಂಬದ ಒಪ್ಪಿಗೆ ಅಗತ್ಯ. ನಿಮ್ಮ ಡಿಜಿಟಲ್ ದಾನಿ ಕಾರ್ಡ್ ಅನ್ನು ಕುಟುಂಬದವರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.",
          es: "Compartir su tarjeta digital de donante con su familia garantiza que conozcan y honren con tranquilidad su decisión solidaria.",
        },
      },
    ],
  },
  {
    id: "vid-organ-pledge-saves-lives",
    title: "How Pledging Organ & Tissue Donation Saves Up to 8 Lives",
    category: "Organ & Tissue Donation Awareness",
    description:
      "Clear overview of how a single voluntary donor pledge supports life-saving heart, kidney, liver, lung, and pancreas transplants plus sight-restoring corneal grafts.",
    thumbnailUrl: AWARENESS_THUMBNAILS.organDonationFacts,
    durationSec: 235,
    durationLabel: "03:55",
    quality: "HD 1080p",
    viewsLabel: "27.1K views",
    medicalSource: "National Transplant Coordination Network",
    published: true,
    updatedAt: "2026-10-16",
    languages: ["en", "hi", "te", "ta", "kn", "es"],
    chapters: [
      {
        id: "ch-sl-1",
        title: "One Pledge, Eight Vital Organs",
        startSec: 0,
        endSec: 80,
        visualSceneTag: "Heart · Kidneys · Liver · Lungs · Pancreas",
        keyTakeaway:
          "A single donor can save up to 8 lives through vital organ transplantation and heal over 50 people via tissues.",
        captions: {
          en: "One voluntary donor pledge can save up to eight lives through heart, kidney, liver, lung, and pancreas transplants—and heal over fifty through tissue.",
          hi: "एक स्वैच्छिक अंगदान संकल्प हृदय, किडनी, लिवर, फेफड़े और अग्न्याशय प्रत्यारोपण से 8 जीवन बचा सकता है।",
          te: "ఒక్క అవయవ దాన ప్రతిజ్ఞ ద్వారా గుండె, కిడ్నీ, కాలేయం, ఊపిరితిత్తుల మార్పిడితో 8 మంది ప్రాణాలను కాపాడవచ్చు.",
          ta: "ஒரு தன்னார்வ உறுப்பு தான உறுதிமொழி இதயம், சிறுநீரகம், கல்லீரல் மற்றும் நுரையீரல் மூலம் 8 உயிர்களைக் காப்பாற்றும்.",
          kn: "ಒಂದು ಸ್ವಯಂಪ್ರೇರಿತ ಅಂಗಾಂಗ ದಾನ ಪ್ರತಿಜ್ಞೆಯು 8 ಜೀವಗಳನ್ನು ಉಳಿಸಬಹುದು ಮತ್ತು 50ಕ್ಕೂ ಹೆಚ್ಚು ಜನರಿಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಬಹುದು.",
          es: "Un solo compromiso voluntario puede salvar hasta ocho vidas mediante trasplantes de órganos y ayudar a más de cincuenta personas con tejidos.",
        },
      },
      {
        id: "ch-sl-2",
        title: "Restoring Sight Through Cornea Donation",
        startSec: 80,
        endSec: 155,
        visualSceneTag: "Corneal Transplantation · Gift of Vision",
        keyTakeaway:
          "Two donated corneas can restore clear vision to two people living with corneal blindness.",
        captions: {
          en: "Even when solid organs are not eligible, donating two corneas restores clear sight to two people waiting for corneal transplantation.",
          hi: "दो कॉर्निया का दान कॉर्नियल अंधेपन से जूझ रहे दो लोगों के जीवन में फिर से रोशनी ला सकता है।",
          te: "రెండు కార్నియాల దానం ద్వారా కార్నియల్ అంధత్వం ఉన్న ఇద్దరికి మళ్లీ స్పష్టమైన చూపును అందించవచ్చు.",
          ta: "இரண்டு கருவிழிகளைத் தானம் செய்வதன் மூலம் பார்வையற்ற இருவருக்கு மீண்டும் தெளிவான பார்வை வழங்கலாம்.",
          kn: "ಎರಡು ಕಾರ್ನಿಯಾಗಳ ದಾನದಿಂದ ದೃಷ್ಟಿಹೀನತೆ ಎದುರಿಸುತ್ತಿರುವ ಇಬ್ಬರಿಗೆ ಮತ್ತೆ ಸ್ಪಷ್ಟ ದೃಷ್ಟಿ ನೀಡಬಹುದು.",
          es: "Incluso cuando otros órganos no son viables, donar dos córneas devuelve la vista a dos personas con ceguera corneal.",
        },
      },
      {
        id: "ch-sl-3",
        title: "Managing Your Pledge Privately in Care Preempt",
        startSec: 155,
        endSec: 235,
        visualSceneTag: "Flexible Preferences · Update or Withdraw Anytime",
        keyTakeaway:
          "Choose all eligible organs or specific organs, record next-of-kin, and update or withdraw your pledge anytime.",
        captions: {
          en: "In Care Preempt, your pledge is completely voluntary and private. You can choose specific organs, print your donor card, or update preferences anytime.",
          hi: "केयर प्रीएम्प्ट में आपका संकल्प पूरी तरह स्वैच्छिक है। आप अपनी पसंद के अंग चुन सकते हैं और कभी भी विवरण अपडेट कर सकते हैं।",
          te: "కేర్ ప్రీఎమ్ప్ట్‌లో మీ ప్రతిజ్ఞ పూర్తిగా స్వచ్ఛందమైనది. మీరు ఎప్పుడైనా వివరాలను మార్చుకోవచ్చు లేదా డోనర్ కార్డును ప్రింట్ చేయవచ్చు.",
          ta: "உங்கள் உறுதிமொழி முழுமையாகத் தன்னார்வமானது; எப்போது வேண்டுமானாலும் உங்கள் விருப்பங்களை மாற்றலாம் அல்லது அட்டையை அச்சிடலாம்.",
          kn: "ನಿಮ್ಮ ಪ್ರತಿಜ್ಞೆಯು ಸಂಪೂರ್ಣವಾಗಿ ಸ್ವಯಂಪ್ರೇರಿತವಾಗಿದೆ; ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಆದ್ಯತೆಗಳನ್ನು ನವೀಕರಿಸಬಹುದು ಅಥವಾ ಕಾರ್ಡ್ ಮುದ್ರಿಸಬಹುದು.",
          es: "Su registro en Care Preempt es completamente voluntario y privado; puede elegir órganos específicos o actualizar su decisión en cualquier momento.",
        },
      },
    ],
  },
];

export function formatVideoTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getActiveChapterAndCaption(
  video: AwarenessVideoItem,
  currentTimeSec: number,
  language: AwarenessLanguageCode
): { chapter: AwarenessVideoChapter; caption: string; chapterIndex: number } {
  const chapters = video.chapters;
  const idx = chapters.findIndex(
    (c) => currentTimeSec >= c.startSec && currentTimeSec < c.endSec
  );
  const resolvedIndex =
    idx !== -1 ? idx : currentTimeSec >= video.durationSec ? chapters.length - 1 : 0;
  const chapter = chapters[Math.max(0, resolvedIndex)];
  const caption = chapter.captions[language] || chapter.captions.en;
  return { chapter, caption, chapterIndex: Math.max(0, resolvedIndex) };
}

export function filterAwarenessVideos(
  videos: AwarenessVideoItem[],
  filters: {
    category?: AwarenessVideoCategory | "All";
    language?: AwarenessLanguageCode | "all";
    search?: string;
    publishedOnly?: boolean;
  }
): AwarenessVideoItem[] {
  const q = (filters.search || "").trim().toLowerCase();
  return videos.filter((v) => {
    if (filters.publishedOnly && !v.published) return false;
    if (filters.category && filters.category !== "All" && v.category !== filters.category) {
      return false;
    }
    if (
      filters.language &&
      filters.language !== "all" &&
      !v.languages.includes(filters.language)
    ) {
      return false;
    }
    if (q) {
      const hay = `${v.title} ${v.description} ${v.category} ${v.medicalSource}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function toggleAwarenessVideoStatus(
  videos: AwarenessVideoItem[],
  videoId: string
): AwarenessVideoItem[] {
  return videos.map((v) =>
    v.id === videoId
      ? {
          ...v,
          published: !v.published,
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      : v
  );
}

export function createAwarenessVideo(input: {
  title: string;
  category: AwarenessVideoCategory;
  description: string;
  durationSec: number;
  medicalSource: string;
  languages: AwarenessLanguageCode[];
  thumbnailUrl?: string;
  published?: boolean;
}): AwarenessVideoItem {
  const safeDuration = Math.max(60, Math.min(1800, Math.round(input.durationSec || 240)));
  const half = Math.floor(safeDuration / 2);
  const langs: AwarenessLanguageCode[] =
    input.languages.length > 0 ? input.languages : ["en"];

  const defaultThumb =
    input.category === "Organ & Tissue Donation Awareness"
      ? AWARENESS_THUMBNAILS.organDonationFacts
      : input.category === "Inclusive Healthcare & Emergency Communication"
      ? AWARENESS_THUMBNAILS.inclusiveErCommunication
      : AWARENESS_THUMBNAILS.smartVisionGlasses;

  const cap1: Record<AwarenessLanguageCode, string> = {
    en: `${input.title}: ${input.description}`,
    hi: `${input.title}: ${input.description}`,
    te: `${input.title}: ${input.description}`,
    ta: `${input.title}: ${input.description}`,
    kn: `${input.title}: ${input.description}`,
    es: `${input.title}: ${input.description}`,
  };

  const cap2: Record<AwarenessLanguageCode, string> = {
    en: `Verified clinical takeaway from ${input.medicalSource}. Share this guidance with family caregivers and emergency contacts.`,
    hi: `${input.medicalSource} द्वारा सत्यापित मार्गदर्शन। इस जानकारी को परिवार के सदस्यों के साथ साझा करें।`,
    te: `${input.medicalSource} ద్వారా ధృవీకరించబడిన వైద్య మార్గదర్శనం. కుటుంబ సభ్యులతో పంచుకోండి.`,
    ta: `${input.medicalSource} சரிபார்த்த மருத்துவ வழிகாட்டுதல். குடும்பத்தாருடன் பகிருங்கள்.`,
    kn: `${input.medicalSource} ದೃಢೀಕರಿಸಿದ ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶನ. ಕುಟುಂಬದವರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.`,
    es: `Guía clínica verificada por ${input.medicalSource}. Compártala con su familia y contactos de emergencia.`,
  };

  return {
    id: `vid-custom-${Date.now()}`,
    title: input.title.trim(),
    category: input.category,
    description: input.description.trim(),
    thumbnailUrl: input.thumbnailUrl || defaultThumb,
    durationSec: safeDuration,
    durationLabel: formatVideoTime(safeDuration),
    quality: "HD 1080p",
    viewsLabel: "New release",
    medicalSource: input.medicalSource.trim() || "Care Preempt Clinical Board",
    published: input.published ?? true,
    updatedAt: new Date().toISOString().slice(0, 10),
    languages: langs,
    chapters: [
      {
        id: `ch-c1-${Date.now()}`,
        title: "Clinical Overview & Core Steps",
        startSec: 0,
        endSec: half,
        visualSceneTag: input.category,
        keyTakeaway: input.description.trim(),
        captions: cap1,
      },
      {
        id: `ch-c2-${Date.now()}`,
        title: "Practical Family & Responder Checklist",
        startSec: half,
        endSec: safeDuration,
        visualSceneTag: "Verified Care Preempt Action Protocol",
        keyTakeaway: `Verified by ${input.medicalSource.trim() || "Care Preempt Clinical Board"}.`,
        captions: cap2,
      },
    ],
  };
}

function getDefaultStorage(): SimpleStorage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

export function loadAwarenessVideos(
  storage: SimpleStorage | null = getDefaultStorage()
): AwarenessVideoItem[] {
  if (!storage) return [...PREDEFINED_AWARENESS_VIDEOS];
  try {
    const raw = storage.getItem(AWARENESS_VIDEOS_KEY);
    if (!raw) {
      storage.setItem(
        AWARENESS_VIDEOS_KEY,
        JSON.stringify(PREDEFINED_AWARENESS_VIDEOS)
      );
      return [...PREDEFINED_AWARENESS_VIDEOS];
    }
    const parsed = JSON.parse(raw) as AwarenessVideoItem[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...PREDEFINED_AWARENESS_VIDEOS];
  } catch {
    return [...PREDEFINED_AWARENESS_VIDEOS];
  }
}

export function saveAwarenessVideos(
  videos: AwarenessVideoItem[],
  storage: SimpleStorage | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(AWARENESS_VIDEOS_KEY, JSON.stringify(videos));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("awareness-catalog-updated"));
    }
  } catch {
    // ignore quota errors
  }
}
