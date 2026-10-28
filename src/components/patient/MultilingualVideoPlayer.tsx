import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Globe, Award, AlertTriangle, Heart, Shield, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface VideoGuideItem {
  id: string;
  title: string;
  category: string;
  duration: number; // in seconds
  description: string;
  languages: {
    code: string;
    label: string;
    subtitles: Array<{ start: number; end: number; text: string }>;
    narrationText: string[];
    steps: string[];
    dos: string[];
    donts: string[];
  }[];
}

const VIDEO_GUIDES: VideoGuideItem[] = [
  {
    id: "cpr-simulator",
    title: "AI Hands-Only CPR & Cardiac Arrest Emergency Simulator",
    category: "Cardiac Life Support",
    duration: 120, // 2 minutes interactive simulation
    description: "Learn how to deliver continuous, high-quality chest compressions at 100-120 BPM to a person in sudden cardiac arrest. Pacing metronome and chest recoil visualizer included.",
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Scene safe. Tap collarbone firmly. Shout 'Can you hear me? Are you okay?'",
          "If unresponsive and not breathing normally, immediately tell someone: 'Call 108 and get an AED!'",
          "Place the heel of one hand in the center of the chest. Interlock your other fingers on top.",
          "Keep elbows completely straight. Push hard and fast at 100 to 120 compressions per minute.",
          "Push down at least 2 inches deep. Allow the chest to fully rise between compressions.",
          "Continue without pause until emergency responders arrive or the victim breathes."
        ],
        subtitles: [
          { start: 0, end: 15, text: "Phase 1: Check scene safety and tap the collarbone firmly. Shout 'Are you okay?'" },
          { start: 15, end: 30, text: "Phase 2: If unresponsive and gasping, call 108/911 immediately and request an AED." },
          { start: 30, end: 55, text: "Phase 3: Place heel of palm on lower center sternum. Interlock fingers and lock elbows straight." },
          { start: 55, end: 95, text: "Phase 4: Deliver compressions at 100-120 BPM rate (depth: 2 inches / 5 cm). Allow full chest recoil." },
          { start: 95, end: 120, text: "Phase 5: Do not pause for more than 10 seconds until paramedics arrive. You are saving a life." }
        ],
        steps: [
          "1. Check scene safety and tap victim's collarbone firmly.",
          "2. Direct a specific bystander to call 108/911 and fetch an Automated External Defibrillator (AED).",
          "3. Interlock hands and position heel of palm squarely on center of chest.",
          "4. Compress down at least 2 inches (5 cm) at 100 to 120 beats per minute.",
          "5. Maintain full chest recoil and continue until professional emergency team arrives."
        ],
        dos: ["Push hard and fast to the beat of 'Stayin Alive'", "Keep your arms locked vertically over victim's chest", "Swap with another person every 2 minutes if tired"],
        donts: ["Do NOT stop compressions to check pulse", "Do NOT bend your elbows during compressions", "Do NOT delay starting CPR while waiting for ambulance"]
      },
      {
        code: "hi",
        label: "हिन्दी (Hindi)",
        narrationText: [
          "कंधे को थपथपाएं और ज़ोर से पूछें 'क्या आप मुझे सुन पा रहे हैं? क्या आप ठीक हैं?'",
          "यदि कोई जवाब न मिले, तो तुरंत 108 पर एम्बुलेंस बुलवाएं।",
          "दोनों हाथों की उंगलियों को फंसाकर हथेली को छाती के बीचो-बीच रखें।",
          "कोहनी सीधी रखते हुए तेजी से और ज़ोर से दबाएं (प्रति मिनट 100-120 बार)।",
          "छाती को कम से कम 2 इंच नीचे दबाएं और पूरा ऊपर आने दें।",
          "जब तक एम्बुलेंस न आ जाए, छाती दबाना बंद न करें।"
        ],
        subtitles: [
          { start: 0, end: 15, text: "चरण 1: कंधे को थपथपाएं और ज़ोर से पूछें 'क्या आप ठीक हैं?' सांस की जांच करें।" },
          { start: 15, end: 30, text: "चरण 2: यदि कोई प्रतिक्रिया न हो, तो तुरंत 108 डायल करें और एम्बुलेंस बुलवाएं।" },
          { start: 30, end: 55, text: "चरण 3: दोनों हाथों की उंगलियों को फंसाकर हथेली को छाती के केंद्र (स्टर्नम) पर रखें।" },
          { start: 55, end: 95, text: "चरण 4: प्रति मिनट 100-120 की गति से 2 इंच गहरा दबाएं। कोहनी बिल्कुल सीधी रखें।" },
          { start: 95, end: 120, text: "चरण 5: जब तक चिकित्सा सहायता न पहुंचे, लगातार सीपीआर जारी रखें।" }
        ],
        steps: [
          "1. कंधे को थपथपाएं और पूछें 'क्या आप मुझे सुन सकते हैं?'",
          "2. तुरंत 108 पर कॉल करें और एम्बुलेंस बुलवाएं।",
          "3. दोनों हाथ छाती के केंद्र में रखकर उंगलियां फंसाएं।",
          "4. 100-120 BPM की रफ्तार से छाती को 2 इंच नीचे दबाएं।",
          "5. डॉक्टर के आने तक बिना रुके छाती दबाते रहें।"
        ],
        dos: ["कोहनी को बिल्कुल सीधा रखें", "शरीर के ऊपरी भार का उपयोग करें", "थकने पर दूसरे व्यक्ति से मदद लें"],
        donts: ["मुंह में पानी डालने की गलती न करें", "छाती दबाने में 10 सेकंड से अधिक न रुकें", "नाड़ी ढूंढने में समय बर्बाद न करें"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "వ్యక్తిని తట్టి గట్టిగా పిలవండి. స్పందన లేకపోతే వెంటనే 108 కి కాల్ చేయండి.",
          "రోగిని గట్టి నేలపై వెల్లకిలా పడుకోబెట్టండి.",
          "మీ చేతి మడమను ఛాతీ మధ్యలో ఉంచి వేళ్లను కలపండి.",
          "నిమిషానికి 100 నుండి 120 సార్లు వేగంగా, బలంగా ఛాతీని 2 అంగుళాలు కిందకు అదిమిపట్టండి.",
          "వైద్య సహాయం అందే వరకు ఎటువంటి విరామం లేకుండా కొనసాగించండి."
        ],
        subtitles: [
          { start: 0, end: 15, text: "దశ 1: స్పృహ ఉందో లేదో చూడటానికి భుజంపై తట్టి పిలవండి. శ్వాస లేకపోతే గమనించండి." },
          { start: 15, end: 30, text: "దశ 2: వెంటనే 108 కి ఫోన్ చేసి అంబులెన్స్ రప్పించండి." },
          { start: 30, end: 55, text: "దశ 3: ఛాతీ మధ్యభాగంలో చేతి మడమ ఉంచి వేళ్లు బిగించండి." },
          { start: 55, end: 95, text: "దశ 4: నిమిషానికి 100-120 సార్లు వేగంగా 2 అంగుళాల లోతుకు అదిమిపట్టండి." },
          { start: 95, end: 120, text: "దశ 5: వైద్యులు వచ్చే వరకు ఆగకుండా ఛాతీని అదిమిపట్టడం కొనసాగించండి." }
        ],
        steps: [
          "1. స్పందన లేకపోతే వెంటనే 108 అత్యవసర సేవలకు కాల్ చేయండి.",
          "2. రోగిని చదునైన నేలపై వెల్లకిలా పడుకోబెట్టండి.",
          "3. ఛాతీ మధ్యలో చేతి మడమ ఉంచి వేళ్లను కలపండి.",
          "4. నిమిషానికి 100-120 సార్లు వేగంగా బలంగా అదిమిపట్టండి.",
          "5. అంబులెన్స్ వచ్చేంతవరకు ఆపకుండా కొనసాగించండి."
        ],
        dos: ["మోచేతులు వంచకుండా నేరుగా ఉంచండి", "శరీరం బరువుతో ఒత్తిడి ఇవ్వండి"],
        donts: ["నోట్లో నీరు పోయవద్దు", "ఒత్తడంలో ఎక్కువ విరామం ఇవ్వవద్దు"]
      },
      {
        code: "ta",
        label: "தமிழ் (Tamil)",
        narrationText: [
          "நபரை கூப்பிட்டு பார்க்கவும். சுவாசம் இல்லை என்றால் உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்.",
          "நபரை தட்டையான கடினமான தரையில் படுக்க வைக்கவும்.",
          "உங்கள் இரு கைகளையும் இணைத்து நெஞ்சின் மையப்பகுதியில் வைக்கவும்.",
          "முழங்கையை மடக்காமல் நிமிடத்திற்கு 100-120 முறை வேகமாக நெஞ்சை அழுத்தவும்.",
          "ஆம்புலன்ஸ் வரும் வரை அழுத்தத்தை நிறுத்தாமல் தொடரவும்."
        ],
        subtitles: [
          { start: 0, end: 15, text: "படி 1: நபரின் தோளைத் தட்டி 'உங்களுக்கு நலமா?' எனக் கேளுங்கள். சுவாசம் உள்ளதா எனப் பாருங்கள்." },
          { start: 15, end: 30, text: "படி 2: உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்." },
          { start: 30, end: 55, text: "படி 3: கைகளை இணைத்து நெஞ்சின் நடுப்பகுதியில் வைக்கவும்." },
          { start: 55, end: 95, text: "படி 4: நிமிடத்திற்கு 100-120 முறை 5 செ.மீ ஆழத்திற்கு அழுத்தவும்." },
          { start: 95, end: 120, text: "படி 5: ஆம்புலன்ஸ் வரும் வரை நிறுத்தாமல் தொடருங்கள்." }
        ],
        steps: [
          "1. சுயநினைவு இல்லை எனில் உடனடியாக 108 அழைக்கவும்.",
          "2. தரையில் மல்லாக்க படுக்க வைக்கவும்.",
          "3. நெஞ்சின் நடுவே கை வைத்து விரல்களைக் கோர்க்கவும்.",
          "4. நிமிடத்திற்கு 100-120 முறை வேகமாக அழுத்தவும்.",
          "5. ஆம்புலன்ஸ் வரும் வரை தொடரவும்."
        ],
        dos: ["தோள்களை நேராக வைத்து அழுத்தவும்", "5 செ.மீ ஆழத்திற்கு அழுத்தவும்"],
        donts: ["மயங்கியவருக்கு தண்ணீர் புகட்ட வேண்டாம்", "10 வினாடிகளுக்கு மேல் அழுத்தத்தை நிறுத்த வேண்டாம்"]
      },
      {
        code: "bn",
        label: "বাংলা (Bengali)",
        narrationText: [
          "ঘাড় বা কাঁধ মৃদু ঝাঁকিয়ে জোরে জিজ্ঞাসা করুন 'আপনি কি ঠিক আছেন?'",
          "সাড়া না পেলে অবিলম্বে ১০৮ বা স্থানীয় অ্যাম্বুলেন্সে ফোন করুন।",
          "বুকের ঠিক মাঝখানে হাতের তালুর গোড়ালি রাখুন এবং অপর হাত দিয়ে আঙুল বাঁধুন।",
          "কনুই সোজা রেখে মিনিটে ১০০-১২০ বার গতিতে চাপ দিন।",
          "যতক্ষণ না অ্যাম্বুলেন্স আসছে ততক্ষণ থামা যাবে না।"
        ],
        subtitles: [
          { start: 0, end: 15, text: "ধাপ ১: কাঁধ মৃদু নাড়িয়ে ডাকুন এবং শ্বাস স্বাভাবিক আছে কিনা দেখুন।" },
          { start: 15, end: 30, text: "ধাপ ২: কোনো সাড়া না পেলে অবিলম্বে ১০৮ এ অ্যাম্বুলেন্স ডাকুন।" },
          { start: 30, end: 55, text: "ধাপ ৩: বুকের খাঁচার মাঝখানে দুই হাত ইন্টারলক করে রাখুন।" },
          { start: 55, end: 95, text: "ধাপ ৪: মিনিটে ১০০-১২০ বার অন্তত ২ ইঞ্চি গভীরতায় চাপ দিন।" },
          { start: 95, end: 120, text: "ধাপ ৫: জরুরি দল না পৌঁছানো পর্যন্ত অবিরাম সিপিআর চালিয়ে যান।" }
        ],
        steps: [
          "১. চেতনা যাচাই করুন এবং অবিলম্বে ১০৮ নম্বরে কল করুন।",
          "২. সমতল শক্ত স্থানে রোগীকে শোয়ান।",
          "৩. বুকের মাঝখানে হাত রেখে আঙুল আটকে দিন।",
          "৪. মিনিটে ১০০-১২০ বার দ্রুত ও শক্তভাবে চাপ দিন।",
          "৫. সাহায্য না আসা পর্যন্ত থামা যাবে না।"
        ],
        dos: ["কনুই একদম সোজা রাখুন", "বুকের ওপর পূর্ণ ভর দিয়ে চাপ দিন"],
        donts: ["মুখে জল ঢালার ভুল করবেন না", "মাঝপথে ১০ সেকেন্ডের বেশি থামবেন না"]
      },
      {
        code: "es",
        label: "Español",
        narrationText: [
          "Evalúe si la persona responde tocando sus hombros con firmeza y pregunte en voz alta.",
          "Si no responde y no respira, llame inmediatamente a emergencias (112/911).",
          "Coloque el talón de una mano en el centro del pecho y entrelace la otra.",
          "Mantenga los codos rectos y comprima a un ritmo de 100 a 120 por minuto.",
          "Comprima al menos 5 cm de profundidad sin interrupciones."
        ],
        subtitles: [
          { start: 0, end: 15, text: "Paso 1: Toque los hombros con firmeza y pregunte: '¿Se encuentra bien?'" },
          { start: 15, end: 30, text: "Paso 2: Si no responde ni respira normalmente, llame al 112/911 de inmediato." },
          { start: 30, end: 55, text: "Paso 3: Coloque el talón de la mano en el centro del pecho y entrelace los dedos." },
          { start: 55, end: 95, text: "Paso 4: Comprima a un ritmo de 100-120 por minuto (5 cm de profundidad)." },
          { start: 95, end: 120, text: "Paso 5: Mantenga las compresiones hasta que llegue el equipo médico de emergencias." }
        ],
        steps: [
          "1. Compruebe la respuesta y llame al 112/911 de inmediato.",
          "2. Coloque al paciente boca arriba sobre una superficie firme.",
          "3. Entrelace las manos en el centro del esternón.",
          "4. Comprima fuerte y rápido a 100-120 lpm (al menos 5 cm de profundidad).",
          "5. No interrumpa las compresiones hasta que reciba asistencia médica."
        ],
        dos: ["Mantenga los brazos totalmente rectos", "Permita que el pecho vuelva a subir por completo"],
        donts: ["No doble los codos durante el empuje", "No suministre agua a personas inconscientes"]
      }
    ]
  },
  {
    id: "early-symptoms-simulator",
    title: "Don't Ignore The Signs: The Danger of Neglecting Early Minor Symptoms",
    category: "Early Health Awareness & Prevention",
    duration: 110,
    description: "Understand why ignoring subtle chest discomfort, transient arm tingling, or shortness of breath leads to devastating emergency room admissions. Learn the exact red flags.",
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Many fatal heart attacks and strokes start with very subtle, painless sensations that people dismiss as acidity or fatigue.",
          "Sign 1: Unexplained chest tightness or heaviness that radiates to the left arm, neck, or jaw. Never assume it is just indigestion.",
          "Sign 2: Transient numbness in the face or weakness in one arm lasting even two minutes is a TIA mini-stroke requiring urgent hospital imaging.",
          "Sign 3: Waking up gasping for air or sudden breathlessness after climbing a few steps points to early cardiac decompensation or pulmonary clot.",
          "Sign 4: Dark black stools or sudden unexplained fatigue could indicate silent gastrointestinal bleeding.",
          "When symptoms appear suddenly or persist for more than 48 hours, use AI Triage and seek immediate medical evaluation."
        ],
        subtitles: [
          { start: 0, end: 20, text: "Alert: Most critical cardiac and neurological crises begin with minor, subtle sensations that patients dismiss." },
          { start: 20, end: 45, text: "Sign 1: Chest tightness radiating to jaw or left arm. Do NOT assume it is simple gastritis." },
          { start: 45, end: 70, text: "Sign 2: Temporary facial droop or arm numbness (even for 2 minutes) indicates a TIA warning stroke." },
          { start: 70, end: 90, text: "Sign 3: Sudden breathlessness on minimal exertion or waking up breathless at night." },
          { start: 90, end: 110, text: "Action: Never wait for tomorrow. Open AI Triage and visit an equipped hospital immediately." }
        ],
        steps: [
          "1. Recognize that painless chest pressure, indigestion with cold sweat, or jaw ache can be a heart attack.",
          "2. Understand that brief 2-minute slurred speech or numbness is a medical emergency (mini-stroke).",
          "3. Check for sudden shortness of breath during routine walking.",
          "4. Use Silent Guardian AI Triage to assess your specific symptoms calmly.",
          "5. Have someone drive you to the nearest ER; never drive yourself."
        ],
        dos: ["Note the exact time symptoms first began", "Go to a hospital with Cath Lab / CT Scan facilities", "Take prescribed emergency medications if advised"],
        donts: ["Never ignore symptoms because you are 'too young'", "Never self-medicate repeatedly with antacids for chest heaviness", "Never delay care hoping it will vanish by tomorrow"]
      },
      {
        code: "hi",
        label: "हिन्दी (Hindi)",
        narrationText: [
          "हार्ट अटैक और स्ट्रोक अक्सर बहुत छोटे और हल्के लक्षणों से शुरू होते हैं जिन्हें लोग गैस या थकान समझकर टाल देते हैं।",
          "संकेत 1: छाती में भारीपन, जो जबड़े या बाएं हाथ तक फैले। इसे कभी भी साधारण एसिडिटी न समझें।",
          "संकेत 2: चेहरे का एक तरफ झुकना या हाथ का 2 मिनट के लिए भी सुन्न पड़ना मिनी-स्ट्रोक का गंभीर लक्षण है।",
          "संकेत 3: सीढ़ियां चढ़ने पर असामान्य सांस फूलना या रात में घबराहट से नींद खुलना।",
          "संकेत 4: मल में कालापन या बिना वजह लगातार कमजोरी होना।",
          "लक्षण दिखने पर समय बर्बाद न करें; तुरंत AI ट्राइएज का इस्तेमाल करें और अस्पताल जाएं।"
        ],
        subtitles: [
          { start: 0, end: 20, text: "सावधानी: अधिकांश हार्ट अटैक और स्ट्रोक हल्के लक्षणों से शुरू होते हैं जिन्हें मरीज नज़रअंदाज़ कर देते हैं।" },
          { start: 20, end: 45, text: "संकेत 1: छाती का भारीपन जो बाएं हाथ या गर्दन तक फैले। इसे केवल गैस न समझें।" },
          { start: 45, end: 70, text: "संकेत 2: चेहरे या हाथ में 2 मिनट की भी कमजोरी मिनी-स्ट्रोक (TIA) की चेतावनी है।" },
          { start: 70, end: 90, text: "संकेत 3: थोड़ा चलने पर ही सांस फूलना या रात में दम घुटना।" },
          { start: 90, end: 110, text: "कदम: कल सुबह का इंतजार न करें; तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।" }
        ],
        steps: [
          "1. छाती के हल्के दबाव को साधारण गैस मानकर न टालें।",
          "2. बोलने में लड़खड़ाहट या हाथ के सुन्न पड़ने पर तुरंत सतर्क हों।",
          "3. रात में सांस फूलने पर तुरंत डॉक्टर से परामर्श लें।",
          "4. AI ट्राइएज में लक्षणों की जांच करें।",
          "5. खुद गाड़ी चलाने के बजाय परिजन या एम्बुलेंस की मदद लें।"
        ],
        dos: ["लक्षण शुरू होने का सही समय नोट करें", "कैथलैब वाले अस्पताल में जाएं"],
        donts: ["'मैं तो स्वस्थ हूं' सोचकर लापरवाही न बरतें", "लगातार एसिडिटी की गोलियां खाकर दर्द को न दबाएं"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "చాలా గుండెపోట్లు, పక్షవాతాలు ప్రారంభంలో చిన్న లక్షణాలతోనే మొదలవుతాయి. వీటిని గ్యాస్ సమస్యగా భావించి నిర్లక్ష్యం చేయకూడదు.",
          "సంకేతం 1: ఛాతీ మధ్యలో బరువు లేదా మంట ఎడమ చేతికి పాకడం.",
          "సంకేతం 2: ముఖం ఒకవైపు వాలడం లేదా మాట తడబడటం.",
          "సంకేతం 3: కొద్ది దూరం నడిచినా తీవ్రమైన ఆయాసం రావడం.",
          "సంకేతం 4: తీవ్రమైన నీరసం మరియు మలంలో నలుపు రంగు రావడం.",
          "లక్షణాలు కనిపించిన వెంటనే ఏ మాత్రం ఆలస్యం చేయకుండా ఆసుపత్రికి వెళ్లండి."
        ],
        subtitles: [
          { start: 0, end: 20, text: "హెచ్చరిక: చాలా గుండెపోట్లు స్వల్ప అసౌకర్యంతోనే ప్రారంభమవుతాయి. నిర్లక్ష్యం ప్రాణాంతకం కావచ్చు." },
          { start: 20, end: 45, text: "సంకేతం 1: ఛాతీలో ఒత్తిడి లేదా ఎడమ భుజం లాగడం - గ్యాస్ అని సరిపెట్టుకోకండి." },
          { start: 45, end: 70, text: "సంకేతం 2: మాట ముద్దగా రావడం లేదా ముఖం వాలడం పక్షవాతపు హెచ్చరిక." },
          { start: 70, end: 90, text: "సంకేతం 3: కొద్దిపాటి నడకకే విపరీతమైన ఆయాసం లేదా రాత్రిపూట ఊపిరి ఆడకపోవడం." },
          { start: 90, end: 110, text: "చర్య: రేపటివరకు ఆగవద్దు; వెంటనే అత్యవసర వైద్య విభాగానికి తరలించండి." }
        ],
        steps: [
          "1. ఛాతీలో వింత అసౌకర్యం వస్తే గ్యాస్ అనుకోకండి.",
          "2. మాట తడబడితే వెంటనే సిటీ స్కాన్ ఉన్న ఆసుపత్రికి వెళ్లండి.",
          "3. ఆయాసం తీవ్రమైతే విశ్రాంతి తీసుకోండి.",
          "4. సైలెంట్ గార్డియన్ AI ట్రయాజ్ ద్వారా సమీక్షించండి.",
          "5. సొంతంగా డ్రైవింగ్ చేయకుండా ఇతరుల సహాయం తీసుకోండి."
        ],
        dos: ["లక్షణాలు మొదలైన సమయాన్ని నమోదు చేయండి", "వెంటనే ఆసుపత్రికి వెళ్లండి"],
        donts: ["అలసట మాత్రమే అని సరిపెట్టుకోవద్దు", "నొప్పి నివారణ మాత్రలు విచక్షణారహితంగా వాడవద్దు"]
      },
      {
        code: "ta",
        label: "தமிழ் (Tamil)",
        narrationText: [
          "மாரடைப்பு மற்றும் பக்கவாதம் ஆரம்பத்தில் சிறிய அறிகுறிகளுடனேயே தொடங்கும். இதை வாய்வு பிரச்சனை என நினைத்து புறக்கணிக்காதீர்கள்.",
          "அறிகுறி 1: நெஞ்சில் அழுத்தம் மற்றும் இடது கைக்கு பரவும் வலி.",
          "அறிகுறி 2: முகம் ஒரு பக்கமாக சாய்வது அல்லது கை மரத்துப்போவது.",
          "அறிகுறி 3: சிறிய நடைப்பயிற்சியிலும் அதிக மூச்சுத்திணறல் ஏற்படுவது.",
          "உடனடியாக மருத்துவமனைக்கு செல்லுங்கள்; தாமதிக்காதீர்கள்."
        ],
        subtitles: [
          { start: 0, end: 20, text: "எச்சரிக்கை: சிறிய அறிகுறிகளை அலட்சியம் செய்வது தீவிர ஆபத்தை விளைவிக்கும்." },
          { start: 20, end: 45, text: "அறிகுறி 1: நெஞ்சில் பாரம் அல்லது இடது கையில் வலி." },
          { start: 45, end: 70, text: "அறிகுறி 2: பேசத் தடுமாறுவது பக்கவாதத்தின் ஆரம்ப அறிகுறியாகும்." },
          { start: 70, end: 90, text: "அறிகுறி 3: இரவில் திடீர் மூச்சுத்திணறல் ஏற்படுவது." },
          { start: 90, end: 110, text: "உடனடியாக அவசர சிகிச்சை பிரிவை நாடுங்கள்." }
        ],
        steps: [
          "1. நெஞ்சு அழுத்தத்தை அலட்சியப்படுத்த வேண்டாம்.",
          "2. பக்கவாத அறிகுறிகள் தெரிந்தால் உடனடியாக மருத்துவமனை செல்லவும்.",
          "3. மூச்சுத்திணறலை கவனிக்கவும்.",
          "4. AI Triage வழிகாட்டலை பார்க்கவும்.",
          "5. ஆம்புலன்ஸ் மூலம் செல்லவும்."
        ],
        dos: ["நேரத்தை குறித்துக்கொள்ளுங்கள்", "அமைதியாக இருங்கள்"],
        donts: ["சுய மருத்துவம் செய்யாதீர்கள்", "சுயமாக வாகனம் ஓட்டாதீர்கள்"]
      },
      {
        code: "bn",
        label: "বাংলা (Bengali)",
        narrationText: [
          "হার্ট অ্যাটাক এবং স্ট্রোকের মতো মারাত্মক সমস্যাগুলো সাধারণ গ্যাস বা ক্লান্তির মতো ছোটখাটো লক্ষণ দিয়ে শুরু হয়।",
          "লক্ষণ ১: বুকের মাঝে চাপ যা চোয়াল বা বাম হাতে ছড়িয়ে পড়ে।",
          "লক্ষণ ২: মুখ বেঁকে যাওয়া বা সামান্য সময়ের জন্য হাত অবশ লাগা।",
          "লক্ষণ ৩: একটু হাঁটাহাঁটিতেই অতিরিক্ত শ্বাসকষ্ট।",
          "সময় নষ্ট না করে দ্রুত হাসপাতালে যান।"
        ],
        subtitles: [
          { start: 0, end: 20, text: "সতর্কতা: আপাতদৃষ্টিতে ছোট স্বাস্থ্য সমস্যাগুলো অবহেলা করলে জীবনসংশয় হতে পারে।" },
          { start: 20, end: 45, text: "লক্ষণ ১: বুকের মাঝে চাপ বা অস্বস্তি যা বাম হাতে বা চোয়ালে ছড়িয়ে পড়ে।" },
          { start: 45, end: 70, text: "লক্ষণ ২: ক্ষণিকের জন্য মুখের একপাশ বেঁকে যাওয়া স্ট্রোকের প্রাথমিক লক্ষণ।" },
          { start: 70, end: 90, text: "লক্ষণ ৩: অল্প পরিশ্রমে তীব্র শ্বাসকষ্ট বা রাতে বুক ধড়ফড় করা।" },
          { start: 90, end: 110, text: "করণীয়: অবহেলা না করে অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।" }
        ],
        steps: [
          "১. বুকের অস্বস্তিকে শুধু গ্যাসের সমস্যা ভাববেন না।",
          "২. কথা জড়িয়ে গেলে দ্রুত হাসপাতালে যান।",
          "৩. শ্বাসকষ্টে দ্রুত বিশ্রাম নিন।",
          "৪. এআই ট্রায়াজে পরীক্ষা করুন।",
          "৫. নিজে ড্রাইভ করবেন না।"
        ],
        dos: ["লক্ষণ প্রকাশের সময় মনে রাখুন", "জরুরি সাহায্য নিন"],
        donts: ["অ্যান্টাসিড খেয়ে বসে থাকবেন না", "দেরি করবেন না"]
      },
      {
        code: "es",
        label: "Español",
        narrationText: [
          "Los infartos y accidentes cerebrovasculares suelen comenzar con molestias sutiles que la gente confunde con acidez o fatiga.",
          "Signo 1: Opresión en el pecho que se irradia al brazo izquierdo o mandíbula. Nunca asuma que es solo indigestión.",
          "Signo 2: Entumecimiento transitorio en la cara o debilidad en un brazo.",
          "Signo 3: Dificultad para respirar al realizar mínimos esfuerzos.",
          "Consulte de inmediato a los servicios de urgencias."
        ],
        subtitles: [
          { start: 0, end: 20, text: "Alerta: Ignorar síntomas menores es la causa principal de ingresos críticos tardíos en urgencias." },
          { start: 20, end: 45, text: "Signo 1: Presión o ardor en el pecho que se irradia hacia mandíbula o brazo izquierdo." },
          { start: 45, end: 70, text: "Signo 2: Debilidad facial o dificultad temporal para hablar (aviso de ictus/AIT)." },
          { start: 70, end: 90, text: "Signo 3: Falta repentina de aire con esfuerzos mínimos o al despertar de noche." },
          { start: 90, end: 110, text: "Acción: No espere a que pase la noche; acuda inmediatamente a un hospital equipado." }
        ],
        steps: [
          "1. No confunda una opresión torácica con acidez común.",
          "2. Busque atención médica urgente si nota debilidad facial o en brazos.",
          "3. Monitoree cualquier fatiga o falta de aire inusual.",
          "4. Utilice el triaje de IA para evaluar la gravedad.",
          "5. No conduzca usted mismo hacia el hospital."
        ],
        dos: ["Anote la hora exacta en que empezaron los síntomas", "Mantenga la calma"],
        donts: ["No tome antiácidos repetitivos para ocultar el dolor", "No espere al día siguiente"]
      }
    ]
  }
];

export function MultilingualVideoPlayer() {
  const [selectedVideoId, setSelectedVideoId] = useState<string>("cpr-simulator");
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [compressionCount, setCompressionCount] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [mouthPhase, setMouthPhase] = useState<number>(0);

  const video = VIDEO_GUIDES.find(v => v.id === selectedVideoId) || VIDEO_GUIDES[0];
  const langData = video.languages.find(l => l.code === selectedLang) || video.languages[0];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatTimerRef = useRef<any>(null);

  // Periodic eye blinking for Dr. Maya
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation during speech
  useEffect(() => {
    if (isPlaying) {
      const mouthInterval = setInterval(() => {
        setMouthPhase(p => (p + 1) % 3);
      }, 180);
      return () => clearInterval(mouthInterval);
    } else {
      setMouthPhase(0);
    }
  }, [isPlaying]);

  // Current subtitle based on video time
  const activeSubtitleObj = langData.subtitles.find(s => currentTime >= s.start && currentTime <= s.end) || langData.subtitles[0];
  const activeSubtitle = activeSubtitleObj?.text || "Emergency Clinical Video Simulator";

  // Web Speech API - Dr. Maya speaks the current phase instruction
  const speakText = (text: string, langCode: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        bn: 'bn-IN',
        es: 'es-ES'
      };
      utterance.lang = langMap[langCode] || 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // Speak when subtitle changes during playback
  useEffect(() => {
    if (isPlaying && activeSubtitle) {
      speakText(activeSubtitle, selectedLang);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [activeSubtitle, isPlaying, selectedLang, soundEnabled]);

  // Play audio metronome beat (100-120 BPM)
  const playMetronomeClick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(selectedVideoId === 'cpr-simulator' ? 880 : 520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  };

  // Metronome tick loop (110 BPM = 545ms interval)
  useEffect(() => {
    if (isPlaying && selectedVideoId === 'cpr-simulator') {
      const interval = setInterval(() => {
        playMetronomeClick();
        setCompressionCount(c => c + 1);
      }, 545); // ~110 BPM
      beatTimerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    }
  }, [isPlaying, soundEnabled, selectedVideoId]);

  // Video playback timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(t => {
          if (t >= video.duration) {
            setIsPlaying(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, video.duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCompressionCount(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = Math.min(100, Math.round((currentTime / video.duration) * 100));

  // Determine current presentation phase (1 to 5)
  const currentPhaseIndex = Math.min(
    langData.subtitles.length - 1,
    Math.max(0, langData.subtitles.findIndex(s => currentTime >= s.start && currentTime <= s.end))
  );

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Video Selector Tabs & Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {VIDEO_GUIDES.map(v => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVideoId(v.id);
                handleReset();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedVideoId === v.id
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/50"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {v.id === 'cpr-simulator' ? <Heart size={14} className="text-red-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
              <span>{v.title.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Language Switcher Bar */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <Globe size={14} className="text-teal-400 ml-2" />
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Presenter Language:</span>
          {video.languages.map(l => (
            <button
              key={l.code}
              onClick={() => setSelectedLang(l.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLang === l.code
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {l.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive AI Video Studio Screen with Dr. Maya Presenter & Slide Deck */}
      <div className="relative bg-slate-950 min-h-[460px] w-full flex flex-col justify-between overflow-hidden select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none sg-grid-bg"></div>

        {/* Top Studio Indicator Bar */}
        <div className="relative z-10 px-5 pt-3.5 pb-2 flex items-center justify-between border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200">
              Dr. Maya, MBBS, MD · AI Emergency Clinician
            </span>
            <span className="text-[10px] text-teal-400 font-mono bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded-md">
              Synchronized {langData.label} Presentation
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Phase {currentPhaseIndex + 1} of {langData.subtitles.length}</span>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => speakText(activeSubtitle, selectedLang)}
              className="text-teal-400 hover:text-teal-300 font-sans font-semibold flex items-center gap-1 cursor-pointer"
              title="Hear Dr. Maya speak this instruction"
            >
              <Volume2 size={13} />
              Hear Presenter
            </button>
          </div>
        </div>

        {/* Studio Floor: Doctor Avatar on Left + Slide Deck on Right */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 lg:p-6 items-center">
          
          {/* LEFT: Dr. Maya - Animated Doctor Presenter */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-48 sm:w-56 h-64 flex items-end justify-center">
              
              {/* Doctor Avatar SVG with Dynamic Gestures & Lip Sync */}
              <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
                {/* Background Aura / Holographic ring */}
                <circle cx="100" cy="110" r="85" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx="100" cy="110" r="75" fill="url(#avatarGlow)" />
                <defs>
                  <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="scrubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                </defs>

                {/* Torso - Lab Coat & Scrubs */}
                <path d="M 50 160 Q 100 150 150 160 L 165 240 L 35 240 Z" fill="url(#coatGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Inner Scrubs V-Neck */}
                <polygon points="80,162 120,162 100,195" fill="url(#scrubGrad)" />
                {/* Coat Lapels */}
                <path d="M 72 162 L 95 205 L 82 240" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <path d="M 128 162 L 105 205 L 118 240" stroke="#94a3b8" strokeWidth="2" fill="none" />
                
                {/* Doctor ID Badge */}
                <rect x="62" y="195" width="22" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                <rect x="65" y="198" width="16" height="8" fill="#0d9488" rx="1" />
                <line x1="65" y1="210" x2="80" y2="210" stroke="#64748b" strokeWidth="1.5" />
                <line x1="65" y1="214" x2="75" y2="214" stroke="#94a3b8" strokeWidth="1" />

                {/* Stethoscope */}
                <path d="M 82 155 Q 75 190 90 205 Q 100 215 110 205 Q 125 190 118 155" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="214" r="5" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

                {/* Neck */}
                <rect x="91" y="132" width="18" height="26" rx="4" fill="#fbcfe8" />

                {/* Head & Hair */}
                {/* Back hair bun */}
                <circle cx="100" cy="72" r="42" fill="#1e293b" />
                {/* Face Base */}
                <ellipse cx="100" cy="95" rx="30" ry="34" fill="#fde2e4" />
                {/* Front Hair bangs */}
                <path d="M 70 82 Q 100 60 130 82 Q 125 70 100 68 Q 75 70 70 82 Z" fill="#0f172a" />
                <path d="M 70 82 Q 80 100 74 115" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 130 82 Q 120 100 126 115" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                {/* Eyebrows */}
                <path d="M 82 86 Q 90 84 96 87" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 104 87 Q 110 84 118 86" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Eyes - with dynamic blinking */}
                {isBlinking ? (
                  <>
                    <line x1="84" y1="94" x2="94" y2="94" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="106" y1="94" x2="116" y2="94" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="89" cy="94" rx="4" ry="4.5" fill="#1e293b" />
                    <circle cx="90.5" cy="92.5" r="1.5" fill="#ffffff" />
                    <ellipse cx="111" cy="94" rx="4" ry="4.5" fill="#1e293b" />
                    <circle cx="112.5" cy="92.5" r="1.5" fill="#ffffff" />
                  </>
                )}

                {/* Nose */}
                <path d="M 100 95 L 98 104 L 102 104" stroke="#f472b6" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Dynamic Lip-Sync Mouth */}
                {isPlaying ? (
                  mouthPhase === 0 ? (
                    <path d="M 94 114 Q 100 119 106 114" stroke="#be123c" strokeWidth="2" fill="#be123c" />
                  ) : mouthPhase === 1 ? (
                    <ellipse cx="100" cy="115" rx="5" ry="4" fill="#9f1239" stroke="#be123c" strokeWidth="1" />
                  ) : (
                    <path d="M 93 113 Q 100 122 107 113 Z" fill="#9f1239" stroke="#be123c" strokeWidth="1" />
                  )
                ) : (
                  <path d="M 94 114 Q 100 118 106 114" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}

                {/* Dynamic Arms & Gestures based on video and current phase */}
                {selectedVideoId === 'cpr-simulator' && (currentPhaseIndex === 2 || currentPhaseIndex === 3) ? (
                  /* Demonstration of Clasped CPR Hands */
                  <g className={isPlaying ? "animate-pulse" : ""}>
                    {/* Left arm angled down to center */}
                    <path d="M 50 170 Q 75 200 95 210" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    {/* Right arm angled down to center */}
                    <path d="M 150 170 Q 125 200 105 210" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    {/* Clasped Hands at center */}
                    <ellipse cx="100" cy="212" rx="12" ry="8" fill="#fbcfe8" stroke="#be185d" strokeWidth="1.5" />
                    <line x1="94" y1="210" x2="106" y2="210" stroke="#9d174d" strokeWidth="1" />
                  </g>
                ) : currentPhaseIndex === 1 ? (
                  /* Pointing Up / Alerting gesture */
                  <g>
                    {/* Left hand relaxed */}
                    <path d="M 50 170 Q 40 205 45 225" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    {/* Right arm pointing up to emergency call */}
                    <path d="M 150 170 Q 170 160 178 135" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" fill="none" />
                    <ellipse cx="180" cy="130" rx="6" ry="6" fill="#fbcfe8" />
                    <line x1="180" y1="130" x2="182" y2="120" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                ) : (
                  /* Natural presenting stance gesture to the board */
                  <g>
                    <path d="M 50 170 Q 40 205 45 225" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    {/* Right hand gesturing towards right slide deck */}
                    <path d="M 150 170 Q 165 190 185 185" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" fill="none" />
                    <ellipse cx="188" cy="184" rx="7" ry="5" fill="#fbcfe8" />
                  </g>
                )}
              </svg>

              {/* Speaking Soundwaves Visualizer Indicator */}
              {isPlaying && (
                <div className="absolute top-2 right-4 flex items-center gap-1 bg-slate-900/90 border border-teal-500/40 px-2 py-1 rounded-full shadow-lg">
                  <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-3.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="text-[10px] text-teal-300 font-mono font-bold ml-1">AI Speaking</span>
                </div>
              )}
            </div>

            {/* Clinician Presenter Tag */}
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Dr. Maya · Chief Clinical Instructor
              </span>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                {isPlaying ? "Narration synchronized with clinical simulation" : "Press Play to begin guided interactive session"}
              </p>
            </div>
          </div>

          {/* RIGHT: Interactive Whiteboard / Mannequin Diagram Slide Deck */}
          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-xl">
            
            {/* Slide Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400 flex items-center gap-1.5">
                <Activity size={13} />
                CLINICAL PRESENTATION BOARD · {video.category.toUpperCase()}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-700">
                SLIDE {currentPhaseIndex + 1} / {langData.subtitles.length}
              </span>
            </div>

            {/* Slide Visual Content */}
            {selectedVideoId === 'cpr-simulator' ? (
              <div className="space-y-3">
                {/* Mannequin Sternum Target & Compressions Gauge */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
                  {/* Heart / Chest target */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center text-red-400 ${
                        isPlaying ? "animate-pulse" : ""
                      }`}>
                        <Heart size={26} fill="currentColor" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[9px] font-mono bg-red-600 text-white font-bold px-1 rounded">
                        110 BPM
                      </span>
                    </div>

                    <div>
                      <div className="text-white text-xs font-bold leading-tight">Sternum Target Zone</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">Lower half of breastbone, centered</div>
                      <div className="text-teal-400 text-[10px] font-mono mt-1">
                        Rate: 100-120 compressions/min
                      </div>
                    </div>
                  </div>

                  {/* Recoil / Depth Meter */}
                  <div className="text-right border-l border-slate-800 pl-4">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Delivered Count</div>
                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      {compressionCount}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Target Depth: 5 cm (2 in)
                    </div>
                  </div>
                </div>

                {/* Key Clinical Rule for this phase */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Current Execution Focus:
                  </div>
                  <p className="font-medium text-slate-100 leading-relaxed">
                    {langData.steps[currentPhaseIndex] || langData.steps[0]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Early Warning Signs Slide Visual */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-amber-400">
                      <AlertTriangle size={28} className={isPlaying ? "animate-bounce" : ""} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">
                        {currentPhaseIndex === 0 ? "Silent Myocardial Infarction" : currentPhaseIndex === 1 ? "Transient Ischemia (FAST Stroke)" : "Acute Respiratory Decompensation"}
                      </div>
                      <div className="text-amber-400 text-[11px] mt-0.5">High Severity Clinical Marker</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">Do NOT dismiss as simple gas or exhaustion</div>
                    </div>
                  </div>

                  <div className="text-right border-l border-slate-800 pl-4">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Triage Code</div>
                    <div className="text-base font-bold font-mono text-amber-400">
                      CODE AMBER
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Immediate ER evaluation
                    </div>
                  </div>
                </div>

                {/* Current warning focus */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Emergency Clinician Note:
                  </div>
                  <p className="font-medium text-slate-100 leading-relaxed">
                    {langData.steps[currentPhaseIndex] || langData.steps[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Action Reminder */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield size={13} className="text-teal-400" />
                Evidence-Based Protocol (AHA & ERC 2026 Guidelines)
              </span>
              <span className="text-teal-400 font-semibold">
                Available in 6 Languages
              </span>
            </div>
          </div>
        </div>

        {/* Live Subtitle Overlay Banner */}
        <div className="relative z-20 px-4 sm:px-10 pb-2">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl px-5 py-2.5 text-center shadow-2xl">
            <div className="text-[10px] uppercase tracking-wider font-bold text-teal-400 mb-0.5 flex items-center justify-center gap-1.5">
              <span>Dr. Maya Speaking ({langData.label})</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
              "{activeSubtitle}"
            </p>
          </div>
        </div>

        {/* Video Player Controls Bar */}
        <div className="relative z-20 bg-slate-950/90 border-t border-slate-800/80 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-9 w-9 rounded-full bg-teal-600/20 text-teal-300 hover:text-white"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full"
              title="Restart"
            >
              <RotateCcw size={15} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full"
              title={soundEnabled ? "Mute audio narration and metronome" : "Unmute audio narration"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-teal-400" /> : <VolumeX size={16} />}
            </Button>
            <span className="text-white/80 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(video.duration)}
            </span>
          </div>

          {/* Scrub Bar */}
          <div className="flex-1 mx-2">
            <div className="relative w-full h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-slate-300 border-slate-700 text-[10px] font-mono">
              {progressPercent}% Complete
            </Badge>
          </div>
        </div>
      </div>


      {/* Emergency Protocol Checklist & Multilingual Do's and Don'ts */}
      <div className="p-6 grid md:grid-cols-2 gap-6 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Step-by-Step Clinical Protocol ({langData.label})
            </h4>
          </div>
          <ol className="space-y-2 text-xs text-slate-700">
            {langData.steps.map((step, idx) => (
              <li key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-slate-800" />
            <h4 className="font-bold text-slate-900 text-sm">
              Critical Do's and Don'ts
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1.5">
              <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider">DO:</div>
              {langData.dos.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-800">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl space-y-1.5">
              <div className="font-bold text-red-900 text-[11px] uppercase tracking-wider">DON'T:</div>
              {langData.donts.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-red-800">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
