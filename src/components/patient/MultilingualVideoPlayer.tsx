import React, { useState, useEffect, useRef } from "react";
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Globe, AlertTriangle, Heart, Shield,
  CheckCircle2, Activity, FastForward, Eye, ShieldAlert, Flame, Droplets, Clock,
  Sparkles, Award
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface VideoGuideItem {
  id: string;
  title: string;
  category: string;
  duration: number; // in seconds
  description: string;
  iconType: 'cpr' | 'heimlich' | 'bleeding' | 'burns' | 'stroke' | 'seizure';
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

export const FIRST_AID_VIDEO_GUIDES: VideoGuideItem[] = [
  {
    id: "cpr-man-simulator",
    title: "Manual CPR Action Simulator: Rescuer Compressing Patient Chest",
    category: "Cardiac Life Support (CPR / AED)",
    duration: 120,
    description: "Realistic manual CPR demonstration showing a man kneeling beside a collapsed victim on the floor, locking arms at 90°, and delivering manual chest compressions at 100-120 BPM with 30:2 rescue breath cycles.",
    iconType: 'cpr',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Check responsiveness. Tap collarbone firmly and shout 'Can you hear me? Are you okay?'",
          "If unreactive and not breathing normally, point to someone: 'Call 108 immediately and get an AED!'",
          "Kneel beside victim's chest. Place heel of dominant hand on center of sternum. Interlock other fingers.",
          "Keep elbows completely straight at 90 degrees. Push hard and fast 2 inches deep at 110 beats per minute.",
          "After 30 deep chest compressions, tilt head back, pinch nose, and deliver 2 gentle rescue breaths.",
          "Continue cycles of 30 compressions and 2 breaths without pausing until the paramedic ambulance arrives."
        ],
        subtitles: [
          { start: 0, end: 15, text: "Step 1: Check scene safety, tap patient's collarbone firmly, shout 'Are you okay?', check breathing." },
          { start: 15, end: 32, text: "Step 2: If unresponsive, immediately yell for help: 'Call 108 Emergency Ambulance right now!'" },
          { start: 32, end: 60, text: "Step 3: Kneel beside patient. Lock elbows straight at 90°. Interlock fingers over center of sternum." },
          { start: 60, end: 95, text: "Step 4: Push down 2 inches (5-6 cm) into chest at 100-120 BPM. Allow complete chest recoil between strokes." },
          { start: 95, end: 120, text: "Step 5: Maintain 30 compressions followed by 2 gentle rescue breaths. Do not stop until medical help arrives." }
        ],
        steps: [
          "1. Check responsiveness: Tap victim's shoulders firmly and shout loudly to assess consciousness.",
          "2. Activate Emergency: Direct someone to call 108 immediately for an ambulance with defibrillator.",
          "3. Correct Kneeling Position: Kneel close to victim's side, align shoulders directly over victim's sternum.",
          "4. Hand Placement: Place heel of palm on lower center breastbone, interlock fingers, keep fingers off ribs.",
          "5. Push Hard & Fast: Compress chest at least 2 inches (5 cm) deep at 100 to 120 beats per minute.",
          "6. 30:2 Cycle: Deliver 30 compressions followed by head-tilt chin-lift with 2 gentle rescue breaths."
        ],
        dos: [
          "Push to the rhythm of 'Stayin Alive' (100-120 BPM)",
          "Keep arms completely straight and use upper body weight",
          "Allow full chest rise and recoil after each compression",
          "Switch rescuers every 2 minutes to prevent fatigue"
        ],
        donts: [
          "Do NOT bend your elbows during downward compressions",
          "Do NOT interrupt compressions for more than 10 seconds",
          "Do NOT place hands over ribs or stomach (strictly sternum only)",
          "Do NOT give fluids to an unconscious person"
        ]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "బాధితుడి భుజంపై గట్టిగా తట్టి 'నా మాట వినపడుతోందా? మీరు బాగున్నారా?' అని గట్టిగా పిలవండి.",
          "స్పందన మరియు శ్వాస లేకపోతే, వెంటనే ఎవరినైనా '108 కి అత్యవసర అంబులెన్స్ కోసం కాల్ చేయండి!' అని ఆదేశించండి.",
          "రోగి పక్కన మోకాళ్లపై కూర్చోండి. ఛాతీ ఎముక (స్టెర్నమ్) మధ్యలో చేతి మడమ ఉంచి, మరో చేతి వేళ్లను బిగించండి.",
          "మోచేతులను వంచకుండా నేరుగా 90 డిగ్రీల కోణంలో ఉంచి, నిమిషానికి 100-120 సార్లు వేగంగా, 2 అంగుళాల లోతుకు నొక్కండి.",
          "30 ఛాతీ ప్రెస్‌ల తర్వాత, తలను వెనక్కి వంచి, ముక్కు మూసి 2 సార్లు నోటి ద్వారా శ్వాస అందించండి.",
          "అంబులెన్స్ లేదా వైద్యులు వచ్చే వరకు ఎటువంటి విరామం లేకుండా 30:2 పద్ధతిలో సిపిఆర్ కొనసాగించండి."
        ],
        subtitles: [
          { start: 0, end: 15, text: "దశ 1: స్పృహ పరీక్షించండి. భుజం తట్టి గట్టిగా పిలవండి, ఛాతీ కదలికలు లేకపోతే గమనించండి." },
          { start: 15, end: 32, text: "దశ 2: వెంటనే 108 ఎమర్జెన్సీ అంబులెన్స్‌కు ఫోన్ చేయమని పక్కనున్న వారికి చెప్పండి." },
          { start: 32, end: 60, text: "దశ 3: రోగి పక్కన మోకాళ్లపై కూర్చుని, చేతి వేళ్లను బిగించి ఛాతీ మధ్యలో ఉంచండి. మోచేతులు నిటారుగా ఉండాలి." },
          { start: 60, end: 95, text: "దశ 4: నిమిషానికి 100-120 సార్లు వేగంగా, శరీర బరువుతో 2 అంగుళాల లోతుకు ఛాతీని అదిమిపట్టండి." },
          { start: 95, end: 120, text: "దశ 5: 30 సార్లు ఛాతీని నొక్కిన తర్వాత 2 శ్వాసలు ఇవ్వండి. వైద్య సహాయం అందే వరకు ఆపవద్దు." }
        ],
        steps: [
          "1. స్పృహ మరియు శ్వాస తనిఖీ: భుజం తట్టి గట్టిగా పిలవండి.",
          "2. 108 కి కాల్ చేయండి: ఏ మాత్రం ఆలస్యం చేయకుండా అంబులెన్స్ రప్పించండి.",
          "3. రోగిని గట్టి నేలపై పడుకోబెట్టండి: మెత్తటి పరుపుపై కాకుండా చదునైన నేలపై ఉంచండి.",
          "4. చేతుల అమరిక: ఛాతీ మధ్యభాగంలో చేతి మడమ ఉంచి, వేళ్లు కలపండి. మోచేతులు వంచవద్దు.",
          "5. వేగంగా, బలంగా అదిమిపట్టండి: నిమిషానికి 100-120 సార్లు, 2 అంగుళాల లోతుకు ప్రెస్ చేయండి.",
          "6. 30:2 చక్రం: ప్రతి 30 ఛాతీ ప్రెస్‌లకు 2 సార్లు రెస్క్యూ శ్వాస అందించండి."
        ],
        dos: [
          "నిమిషానికి 100-120 సార్లు వేగంగా నొక్కండి",
          "మోచేతులను వంచకుండా మీ శరీర బరువును ఉపయోగించండి",
          "ప్రతి ప్రెస్ తర్వాత ఛాతీ పూర్వ స్థితికి వచ్చేలా చేయండి",
          "అలసిపోతే పక్కనున్న వారితో మారండి"
        ],
        donts: [
          "స్పృహ లేని వ్యక్తి నోట్లో నీళ్లు పోయవద్దు",
          "మోచేతులు వంచి ఒత్తిడి తగ్గించవద్దు",
          "ఛాతీ కాకుండా కడుపుపై లేదా పక్కటెముకలపై నొక్కవద్దు",
          "10 సెకన్ల కంటే ఎక్కువ విరామం ఇవ్వవద్దు"
        ]
      },
      {
        code: "hi",
        label: "हिन्दी (Hindi)",
        narrationText: [
          "मरीज के कंधे को थपथपाएं और जोर से पूछें 'क्या आप ठीक हैं?' सांस की जांच करें।",
          "यदि कोई जवाब न मिले, तो तुरंत 108 डायल करने को कहें।",
          "मरीज के पास घुटनों के बल बैठें। दोनों हाथों की उंगलियां फंसाकर छाती के बीच (स्टर्नम) पर रखें।",
          "कोहनी सीधी रखते हुए शरीर के भार से प्रति मिनट 100-120 बार 2 इंच गहरा दबाएं।",
          "30 बार छाती दबाने के बाद सिर पीछे झुकाकर 2 बार मुंह से सांस दें।",
          "एम्बुलेंस आने तक बिना रुके 30:2 का चक्र जारी रखें।"
        ],
        subtitles: [
          { start: 0, end: 15, text: "चरण 1: कंधे को थपथपाएं, 'क्या आप ठीक हैं?' पूछें और सांस की जांच करें।" },
          { start: 15, end: 32, text: "चरण 2: कोई प्रतिक्रिया न होने पर तुरंत 108 एम्बुलेंस को कॉल करवाएं।" },
          { start: 32, end: 60, text: "चरण 3: घुटनों के बल बैठें, हाथ की उंगलियां फंसाकर छाती के केंद्र में रखें। कोहनी बिल्कुल सीधी रखें।" },
          { start: 60, end: 95, text: "चरण 4: प्रति मिनट 100-120 की रफ्तार से 2 इंच गहरा दबाएं और छाती को पूरा ऊपर आने दें।" },
          { start: 95, end: 120, text: "चरण 5: 30 दबाव और 2 सांसों का क्रम डॉक्टर के आने तक निरंतर चालू रखें।" }
        ],
        steps: [
          "1. होश की जांच करें और सांस देखें।",
          "2. तुरंत 108 एम्बुलेंस बुलवाएं।",
          "3. मरीज को सख्त और समतल जमीन पर लिटाएं।",
          "4. दोनों हाथ छाती के केंद्र में रखकर उंगलियां बांधें।",
          "5. 100-120 BPM की गति से 2 इंच गहरा दबाएं।",
          "6. 30 बार छाती दबाने के बाद 2 बार सांस दें।"
        ],
        dos: [
          "कोहनी सीधी रखकर शरीर के भार का उपयोग करें",
          "100-120 की सही गति बनाए रखें",
          "छाती को पूरा ऊपर आने दें"
        ],
        donts: [
          "बेहोश व्यक्ति के मुंह में पानी न डालें",
          "छाती दबाने में बेवजह न रुकें"
        ]
      },
      {
        code: "ta",
        label: "தமிழ் (Tamil)",
        narrationText: [
          "நபரின் தோளைத் தட்டி 'உங்களுக்கு நலமா?' எனக் கேளுங்கள். சுவாசம் இல்லையெனில் உடனடியாக 108 அழைக்கவும்.",
          "நபரை கடினமான தரையில் படுக்க வைத்து, அருகில் முழங்காலிட்டு அமரவும்.",
          "நெஞ்சின் மையப்பகுதியில் கை வைத்து விரல்களைக் கோர்த்துக்கொள்ளவும்.",
          "முழங்கையை மடக்காமல் நிமிடத்திற்கு 100-120 முறை வேகமாக 5 செ.மீ ஆழத்திற்கு அழுத்தவும்.",
          "30 அழுத்தங்களுக்குப் பின் 2 முறை செயற்கை சுவாசம் வழங்கவும். மருத்துவர் வரும் வரை தொடரவும்."
        ],
        subtitles: [
          { start: 0, end: 15, text: "படி 1: தோளைத் தட்டி சுயநினைவு உள்ளதா எனப் பார்க்கவும். சுவாசம் இல்லை எனில் உடனடி நடவடிக்கை தேவை." },
          { start: 15, end: 32, text: "படி 2: உடனடியாக 108 ஆம்புலன்ஸ் எண்ணை அழைக்கச் சொல்லவும்." },
          { start: 32, end: 60, text: "படி 3: தரையில் மல்லாக்க படுக்க வைத்து, நெஞ்சின் நடுவே கை வைத்து விரல்களைக் கோர்க்கவும்." },
          { start: 60, end: 95, text: "படி 4: நிமிடத்திற்கு 100-120 முறை வேகமாக 5 செ.மீ ஆழத்திற்கு அழுத்தவும்." },
          { start: 95, end: 120, text: "படி 5: 30 அழுத்தங்கள் மற்றும் 2 சுவாசங்கள் என்ற விகிதத்தில் ஆம்புலன்ஸ் வரும் வரை தொடரவும்." }
        ],
        steps: [
          "1. சுயநினைவு மற்றும் சுவாசம் சரிபார்க்கவும்.",
          "2. உடனே 108 ஆம்புலன்ஸ் அழைக்கவும்.",
          "3. தரையில் படுக்க வைத்து கைகளை நெஞ்சின் நடுவே வைக்கவும்.",
          "4. நிமிடத்திற்கு 100-120 முறை வேகமாக அழுத்தவும்.",
          "5. 30 அழுத்தத்திற்கு 2 சுவாசம் கொடுக்கவும்."
        ],
        dos: ["தோள்களை நேராக வைத்து அழுத்தவும்", "5 செ.மீ ஆழத்திற்கு அழுத்தவும்"],
        donts: ["தண்ணீர் புகட்ட வேண்டாம்", "அழுத்துவதை நிறுத்த வேண்டாம்"]
      },
      {
        code: "bn",
        label: "বাংলা (Bengali)",
        narrationText: [
          "কাঁধ মৃদু ঝাঁকিয়ে জোরে জিজ্ঞাসা করুন 'আপনি কি ঠিক আছেন?' সাড়া না পেলে অবিলম্বে ১০৮ নম্বরে অ্যাম্বুলেন্স ডাকুন।",
          "শক্ত মেঝেতে রোগীকে শুইয়ে পাশে হাঁটু গেড়ে বসুন।",
          "বুকের খাঁচার ঠিক মাঝখানে হাতের তালুর গোড়ালি রাখুন এবং অপর হাত দিয়ে আঙুল বাঁধুন।",
          "কনুই সোজা রেখে মিনিটে ১০০-১২০ বার গতিতে ২ ইঞ্চি গভীরে চাপ দিন।",
          "৩০ বার চাপ দেওয়ার পর মাথা পেছনে হেলিয়ে ২ বার মুখ দিয়ে শ্বাস দিন।"
        ],
        subtitles: [
          { start: 0, end: 15, text: "ধাপ ১: কাঁধ মৃদু ঝাঁকিয়ে চেতনা যাচাই করুন এবং শ্বাস পরীক্ষা করুন।" },
          { start: 15, end: 32, text: "ধাপ ২: অবিলম্বে ১০৮ জরুরি অ্যাম্বুলেন্সে কল করতে বলুন।" },
          { start: 32, end: 60, text: "ধাপ ৩: পাশে হাঁটু গেড়ে বসে বুকের মাঝখানে হাত ইন্টারলক করে রাখুন।" },
          { start: 60, end: 95, text: "ধাপ ৪: মিনিটে ১০০-১২০ বার গতিতে ২ ইঞ্চি গভীরে চাপ দিন।" },
          { start: 95, end: 120, text: "ধাপ ৫: ৩০টি চাপ এবং ২টি কৃত্রিম শ্বাস চক্রাকারে চালিয়ে যান।" }
        ],
        steps: [
          "১. চেতনা পরীক্ষা করুন।",
          "২. ১০৮ নম্বরে কল করুন।",
          "৩. শক্ত মেঝেতে শুইয়ে দিন।",
          "৪. বুকের মাঝে হাত রাখুন।",
          "৫. মিনিটে ১০০-১২০ বার চাপ দিন।",
          "৬. ৩০:২ অনুপাতে সিপিআর চালিয়ে যান।"
        ],
        dos: ["কনুই সোজা রাখুন", "পুরো শরীরের ভর দিয়ে চাপুন"],
        donts: ["মুখে জল দেবেন না", "দেরি করবেন না"]
      },
      {
        code: "es",
        label: "Español",
        narrationText: [
          "Verifique si la persona responde. Toque con firmeza los hombros y grite '¿Se encuentra bien?'",
          "Si no responde y no respira, pida de inmediato: '¡Llamen al 108 / 911 ahora mismo!'",
          "Arrodíllese junto al pecho. Coloque el talón de una mano en el centro del esternón y entrelace los dedos.",
          "Mantenga los codos completamente rectos a 90°. Comprima a un ritmo de 100 a 120 por minuto, 5 cm de profundidad.",
          "Después de 30 compresiones, incline la cabeza hacia atrás, tape la nariz y dé 2 respiraciones de rescate.",
          "Continúe el ciclo 30:2 sin interrupciones hasta la llegada del equipo de emergencias."
        ],
        subtitles: [
          { start: 0, end: 15, text: "Paso 1: Verifique si responde y observe la respiración. Toque los hombros con firmeza." },
          { start: 15, end: 32, text: "Paso 2: Si no responde, ordene llamar al 108 / 911 de inmediato." },
          { start: 32, end: 60, text: "Paso 3: Arrodíllese al lado. Entrelace las manos en el centro del pecho con brazos a 90°." },
          { start: 60, end: 95, text: "Paso 4: Empuje fuerte y rápido (100-120 lpm), 5 cm de profundidad, permitiendo el rebote." },
          { start: 95, end: 120, text: "Paso 5: Mantenga ciclos de 30 compresiones y 2 respiraciones hasta que llegue la ambulancia." }
        ],
        steps: [
          "1. Verifique respuesta y respiración.",
          "2. Llame al servicio de emergencias (108 / 911).",
          "3. Coloque al paciente sobre una superficie dura.",
          "4. Entrelace las manos en el centro del esternón.",
          "5. Comprima a 100-120 BPM a 5 cm de profundidad.",
          "6. Alterne 30 compresiones y 2 ventilaciones de rescate."
        ],
        dos: ["Mantenga los brazos totalmente rectos", "Permita la descompresión total del tórax"],
        donts: ["No doble los codos durante la maniobra", "No administre líquidos a personas inconscientes"]
      }
    ]
  },
  {
    id: "choking-heimlich-action",
    title: "Choking & Heimlich Maneuver: Upward Abdominal Thrust Action",
    category: "Airway Obstruction Emergency",
    duration: 90,
    description: "Manual action guide showing how to recognize choking, lean the victim forward for 5 sharp back blows, and deliver upward J-hook abdominal thrusts to clear the airway.",
    iconType: 'heimlich',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Recognize choking: Victim cannot speak, cough forcefully, or breathe, and clutches their neck.",
          "Lean them slightly forward and deliver 5 firm back blows with the heel of your hand between shoulder blades.",
          "If object remains trapped, stand behind victim, wrap your arms around their waist.",
          "Make a fist with one hand, place thumb side just above navel and below ribcage.",
          "Grasp fist with other hand and pull sharply inward and upward in a J-hook motion.",
          "Repeat cycles of 5 back blows and 5 abdominal thrusts until the airway is clear."
        ],
        subtitles: [
          { start: 0, end: 15, text: "Phase 1: Recognize universal choking sign (clutching throat, unable to speak or cough)." },
          { start: 15, end: 35, text: "Phase 2: Lean victim forward. Deliver 5 sharp palm strikes between the shoulder blades." },
          { start: 35, end: 60, text: "Phase 3: Stand behind. Place thumb-in fist squarely 1 inch above the navel." },
          { start: 60, end: 90, text: "Phase 4: Grasp fist and execute sharp upward J-thrusts until foreign object is expelled." }
        ],
        steps: [
          "1. Ask 'Are you choking?' If they nod without speaking, act immediately.",
          "2. Support their chest and deliver 5 sharp back blows between shoulder blades.",
          "3. Stand behind and wrap arms around their waist.",
          "4. Place thumb side of fist above the navel, well below xiphoid tip.",
          "5. Deliver quick, forceful upward abdominal thrusts (J-stroke).",
          "6. Repeat 5 back blows + 5 abdominal thrusts until obstruction pops out."
        ],
        dos: ["Thrust sharply inward and upward", "Keep fist below bottom ribs", "Call 108 if victim becomes unreactive"],
        donts: ["Do NOT squeeze the lower ribcage", "Do NOT offer water while choking", "Do NOT use abdominal thrusts on infants (use back slaps)"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "గొంతులో ఆహారం ఇరుక్కున్నప్పుడు: వ్యక్తి మాట్లాడలేరు, దగ్గలేరు, గొంతును పట్టుకుంటారు.",
          "రోగిని ముందుకు వంచి, రెండు భుజాల మధ్య చేతి మడమతో 5 సార్లు బలంగా తట్టండి.",
          "అడ్డు తొలగకపోతే, వారి వెనుక నిలబడి నడుము చుట్టూ చేతులు వేయండి.",
          "ఒక చేతి పిడికిలిని బొడ్డుకు ఒక అంగుళం పైన ఛాతీ ఎముక క్రింద ఉంచండి.",
          "మరో చేత్తో ఆ పిడికిలిని పట్టుకుని లోపలికి, పైకి 'J' ఆకారంలో బలంగా నెట్టండి.",
          "అడ్డుగా ఉన్న పదార్థం బయటకు వచ్చేంతవరకు 5 సార్లు వీపుపై తట్టడం, 5 సార్లు కడుపుపై నెట్టడం కొనసాగించండి."
        ],
        subtitles: [
          { start: 0, end: 15, text: "దశ 1: గొంతు పట్టుకోవడం మరియు మాట్లాడలేకపోవడం ద్వారా గొంతులో అడ్డుపడినట్లు గుర్తించండి." },
          { start: 15, end: 35, text: "దశ 2: రోగిని ముందుకు వంచి రెండు భుజాల మధ్య చేతితో 5 సార్లు బలంగా తట్టండి." },
          { start: 35, end: 60, text: "దశ 3: వెనుక నిలబడి బొడ్డుకు ఒక అంగుళం పైన పిడికిలి బిగించి ఉంచండి." },
          { start: 60, end: 90, text: "దశ 4: పైకి మరియు లోపలికి బలంగా నెట్టండి (హెమ్లిచ్ పద్ధతి) అడ్డు తొలగే వరకు కొనసాగించండి." }
        ],
        steps: [
          "1. గొంతులో ఆహారం లేదా వస్తువు ఇరుక్కున్నట్లు నిర్ధారించండి.",
          "2. ముందుకు వంచి వీపుపై 5 సార్లు బలంగా తట్టండి.",
          "3. వెనుక నిలబడి నడుము చుట్టూ చేతులు వేయండి.",
          "4. బొడ్డు పైభాగంలో పిడికిలి ఉంచండి.",
          "5. పైకి మరియు లోపలికి 5 సార్లు బలంగా ఒత్తిడి ఇవ్వండి.",
          "6. స్పృహ కోల్పోతే వెంటనే సిపిఆర్ ప్రారంభించండి."
        ],
        dos: ["పైకి మరియు లోపలికి కోణంలో నెట్టండి", "వెంటనే సహాయం చేయండి"],
        donts: ["నోట్లో నీరు పోయవద్దు", "పక్కటెముకలపై ఒత్తిడి చేయవద్దు"]
      },
      {
        code: "hi",
        label: "हिन्दी (Hindi)",
        narrationText: [
          "गले में खाना अटकने पर: व्यक्ति बोल नहीं पाता और गले पर दोनों हाथ रखता है।",
          "उसे आगे की ओर झुकाएं और पीठ के बीच में हथेली से 5 बार जोरदार थपकी दें।",
          "पीछे खड़े होकर कमर के चारों ओर हाथ लपेटें।",
          "नाभि के ठीक ऊपर मुट्ठी रखें और दूसरी हथेली से पकड़कर ऊपर की ओर झटका दें।",
          "चीज बाहर निकलने तक 5 थपकी और 5 झटकों का क्रम जारी रखें।"
        ],
        subtitles: [
          { start: 0, end: 15, text: "पहचान: गले में हाथ रखना, बोल न पाना और सांस न आना।" },
          { start: 15, end: 35, text: "पीठ पर 5 बार हथेली से जोरदार थपकी दें।" },
          { start: 35, end: 60, text: "नाभि के ठीक ऊपर मुट्ठी रखकर ऊपर की ओर तेज झटका दें (हेमलिच तकनीक)।" },
          { start: 60, end: 90, text: "जब तक रुकावट दूर न हो, थपकी और झटकों का क्रम दोहराएं।" }
        ],
        steps: [
          "1. रुकावट की तुरंत पहचान करें।",
          "2. पीठ पर 5 बार थपकी दें।",
          "3. नाभि के ऊपर मुट्ठी रखें।",
          "4. ऊपर की ओर झटका दें।",
          "5. रुकावट दूर होने तक दोहराएं।"
        ],
        dos: ["ऊपर की ओर झटका दें", "शांत रहें"],
        donts: ["पानी न पिलाएं", "पसलियों पर दबाव न डालें"]
      }
    ]
  },
  {
    id: "severe-bleeding-tourniquet",
    title: "Severe Bleeding & Tourniquet: Hemorrhage Control Action",
    category: "Trauma & Hemorrhage Control",
    duration: 90,
    description: "Manual action guide on stopping arterial bleeding using direct palm pressure, sterile wound packing, and application of a windlass tourniquet 2-3 inches above the injury.",
    iconType: 'bleeding',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Act immediately: Arterial spurting bleeding can cause fatal shock within three minutes.",
          "Apply firm direct manual pressure using sterile gauze or clean cloth with both hands.",
          "If bleeding on a limb continues, place a tourniquet 2 to 3 inches above the wound (not over a joint).",
          "Tighten the windlass rod until all bright red spurting bleeding stops completely.",
          "Secure the rod in the clip and write down the exact tourniquet application time.",
          "Keep patient warm, calm, and elevated while awaiting emergency trauma transfer."
        ],
        subtitles: [
          { start: 0, end: 20, text: "Phase 1: Identify life-threatening arterial bleeding (pulsing/spurting bright red blood)." },
          { start: 20, end: 45, text: "Phase 2: Press directly over the wound with maximum body weight and sterile gauze." },
          { start: 45, end: 70, text: "Phase 3: Apply tourniquet 2-3 inches above the injury site. Never apply directly on joints." },
          { start: 70, end: 90, text: "Phase 4: Twist windlass until bleeding stops completely. Note the exact time on forehead/strap." }
        ],
        steps: [
          "1. Expose wound and identify source of bleeding.",
          "2. Apply direct two-handed continuous pressure with clean cloth.",
          "3. Position tourniquet 2-3 inches above wound towards the heart.",
          "4. Twist windlass rod until bleeding and distal pulse cease.",
          "5. Lock rod in place and record exact application time (e.g., T=14:30).",
          "6. Never loosen or remove tourniquet before reaching surgical hospital."
        ],
        dos: ["Push with full upper body weight", "Tighten tourniquet until spurting halts", "Keep patient lying down and warm"],
        donts: ["Do NOT remove blood-soaked gauze (add more on top)", "Do NOT place tourniquet over knees or elbows", "Do NOT loosen tourniquet once applied"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "రక్తస్రావం వెంటనే ఆపాలి: ధమని తెగి రక్తం చిమ్మితే 3 నిమిషాల్లో ప్రాణాపాయం కలగవచ్చు.",
          "గాయంపై శుభ్రమైన గుడ్డ లేదా గాజుగుడ్డ ఉంచి రెండు చేతులతో బలంగా అదిమిపట్టండి.",
          "రక్తం ఆగకపోతే, గాయానికి 2-3 అంగుళాల పైన (కీళ్లపై కాకుండా) టోర్నిక్వెట్ లేదా గట్టి గుడ్డ కట్టండి.",
          "రక్తం చిమ్మడం పూర్తిగా ఆగేంతవరకు కర్ర లేదా రాడ్ సహాయంతో తిప్పి బిగించండి.",
          "కట్టిన ఖచ్చితమైన సమయాన్ని గుర్తించి వెంటనే ఆసుపత్రికి తరలించండి."
        ],
        subtitles: [
          { start: 0, end: 20, text: "దశ 1: వేగంగా రక్తం కారే స్థలాన్ని వెంటనే గుర్తించి ఒత్తిడి ఇవ్వండి." },
          { start: 20, end: 45, text: "దశ 2: శుభ్రమైన గుడ్డతో గాయంపై రెండు చేతులతో బలంగా అదిమిపట్టండి." },
          { start: 45, end: 70, text: "దశ 3: రక్తం ఆగకపోతే గాయానికి 2-3 అంగుళాల పైన టోర్నిక్వెట్ లేదా బ్యాండేజ్ బిగించండి." },
          { start: 70, end: 90, text: "దశ 4: రక్తం ఆగే వరకు బిగించి సమయం నమోదు చేయండి. వెంటనే ఆసుపత్రికి చేర్చండి." }
        ],
        steps: [
          "1. గాయాన్ని గుర్తించి శుభ్రమైన గుడ్డ వేయండి.",
          "2. రెండు చేతులతో గట్టిగా ఒత్తిడి ఉంచండి.",
          "3. గాయానికి 2-3 అంగుళాల పైన టోర్నిక్వెట్ కట్టండి.",
          "4. రక్తం ఆగే వరకు బిగించండి.",
          "5. సమయం రాసి వెంటనే 108 ద్వారా తరలించండి."
        ],
        dos: ["రక్తస్రావం ఆగేంతవరకు బలంగా నొక్కండి", "రోగిని వెచ్చగా ఉంచండి"],
        donts: ["రక్తం తడిసిన గుడ్డను తీసివేయవద్దు (దానిపైనే మరో గుడ్డ పెట్టండి)", "కీళ్లపై కట్టవద్దు"]
      }
    ]
  },
  {
    id: "burns-cooling-protocol",
    title: "Burns Emergency Protocol: 20-Minute Cooling & Dressing",
    category: "Thermal & Chemical Injury",
    duration: 80,
    description: "Step-by-step action guide on cooling acute thermal burns under gentle running tap water for 20 minutes, safely removing constricting jewelry, and covering with clean plastic wrap.",
    iconType: 'burns',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Stop the burning process: Remove patient from heat source and gently cool immediately.",
          "Hold the burned area under cool running tap water for a full 20 minutes.",
          "Never use ice, butter, toothpaste, or greasy ointments on fresh burns.",
          "Remove tight rings, watches, and jewelry before natural swelling begins.",
          "Cover the burn loosely with clean, clear plastic cling wrap to prevent infection and air pain.",
          "Seek hospital evaluation if burn is larger than victim's palm or covers face/joints."
        ],
        subtitles: [
          { start: 0, end: 20, text: "Phase 1: Immediately remove from heat source and douse under gentle cool tap water." },
          { start: 20, end: 45, text: "Phase 2: Cool continuously for 20 minutes. Do NOT use ice cubes or icy water." },
          { start: 45, end: 65, text: "Phase 3: Gently take off rings, bracelets, and watches before swelling begins." },
          { start: 65, end: 80, text: "Phase 4: Cover loosely with clean food plastic wrap. Do not burst any blisters." }
        ],
        steps: [
          "1. Stop the heat source safely.",
          "2. Cool with clean, cool running water for 20 continuous minutes.",
          "3. Remove tight rings and clothing near the area gently.",
          "4. Cover loosely with clear plastic wrap or clean non-stick sterile pad.",
          "5. Keep the victim warm with a dry blanket over unburned areas.",
          "6. Seek professional burn care for deep, blistering, or facial burns."
        ],
        dos: ["Cool with running water for 20 minutes", "Cover with cling film loosely", "Take paracetamol for pain if conscious"],
        donts: ["Do NOT apply ice, butter, or toothpaste", "Do NOT pop burn blisters", "Do NOT peel away burned clothing stuck to skin"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "కాలిన వెంటనే: కాలిన భాగాన్ని వెంటనే వేడి నుండి వేరు చేసి చల్లబరచాలి.",
          "కనీసం 20 నిమిషాల పాటు సాధారణ కుళాయి నీటి కింద ఉంచండి.",
          "మంచు గడ్డలు, టూత్‌పేస్ట్, నూనె లేదా పసుపు అస్సలు రాయవద్దు.",
          "వాపు రాకముందే ఉంగరాలు, గడియారాలు సున్నితంగా తీసివేయండి.",
          "శుభ్రమైన ప్లాస్టిక్ ర్యాప్ లేదా తెల్లటి గుడ్డను వదులుగా కప్పండి. బొబ్బలను పగలగొట్టవద్దు."
        ],
        subtitles: [
          { start: 0, end: 20, text: "దశ 1: కాలిన ప్రదేశాన్ని వెంటనే చల్లని కుళాయి నీటి కింద ఉంచండి." },
          { start: 20, end: 45, text: "దశ 2: పూర్తి 20 నిమిషాల పాటు నీటి ప్రవాహంలో ఉంచండి (మంచు వాడవద్దు)." },
          { start: 45, end: 65, text: "దశ 3: వాపు రాకముందే ఉంగరాలు, గాజులు తొలగించండి." },
          { start: 65, end: 80, text: "దశ 4: శుభ్రమైన ప్లాస్టిక్ కవర్‌తో వదులుగా కప్పి ఆసుపత్రికి తీసుకెళ్లండి." }
        ],
        steps: [
          "1. మంటలు లేదా వేడి నుండి దూరంగా జరపండి.",
          "2. 20 నిమిషాలు కుళాయి నీటి కింద ఉంచండి.",
          "3. ఉంగరాలు తొలగించండి.",
          "4. ప్లాస్టిక్ ర్యాప్‌తో కప్పండి.",
          "5. వెంటనే వైద్యుడిని సంప్రదించండి."
        ],
        dos: ["20 నిమిషాలు నీటి కింద ఉంచండి", "శుభ్రంగా కప్పండి"],
        donts: ["మంచు లేదా నూనె రాయవద్దు", "బొబ్బలు పగలగొట్టవద్దు"]
      }
    ]
  },
  {
    id: "stroke-fast-protocol",
    title: "Stroke F.A.S.T. Assessment: Urgent Brain Rescue Action",
    category: "Acute Neurological Emergency",
    duration: 80,
    description: "Manual action guide on assessing stroke symptoms using Face drooping, Arm weakness, Slurred speech, and Time to dial 108 to activate the cath lab thrombolysis window.",
    iconType: 'stroke',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Time is brain: Every minute of delay destroys 1.9 million neurons.",
          "F - Face: Ask them to smile. Does one side of the face droop?",
          "A - Arms: Ask them to raise both arms. Does one arm drift downward?",
          "S - Speech: Ask them to repeat a simple sentence. Is their speech slurred or strange?",
          "T - Time: If you observe any of these signs, call 108 immediately and state: 'Stroke alert, need CT scan hospital'.",
          "Note exact time symptoms began. Do not give aspirin or food until hospital imaging."
        ],
        subtitles: [
          { start: 0, end: 20, text: "F (Face): Ask the person to smile. Look for asymmetric facial drooping on one side." },
          { start: 20, end: 40, text: "A (Arms): Ask them to lift both arms. Watch if one arm drifts down due to weakness." },
          { start: 40, end: 60, text: "S (Speech): Ask them to say 'The sky is blue'. Listen for slurred or unintelligible words." },
          { start: 60, end: 80, text: "T (Time): Call 108 immediately. Golden window for clot-busting therapy is under 4.5 hours." }
        ],
        steps: [
          "1. Check Face: Ask for a wide smile and inspect lip corners.",
          "2. Check Arms: Have them close eyes and raise arms forward for 10 seconds.",
          "3. Check Speech: Listen for slurring, word-finding difficulty, or confusion.",
          "4. Record Time: Write down the exact minute symptoms were first noticed.",
          "5. Call 108: Request a Stroke-ready hospital with 24x7 CT/MRI Cath Lab.",
          "6. Keep lying in recovery position with head elevated 30 degrees."
        ],
        dos: ["Note exact symptom onset time", "Keep patient lying flat or slightly elevated", "Call 108 immediately"],
        donts: ["Do NOT give aspirin (could worsen hemorrhagic stroke)", "Do NOT give water, pills, or food", "Do NOT wait to see if it improves tomorrow"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "పక్షవాతం (Stroke) - సమయమే ప్రాణం: ఆలస్యం అయ్యే కొద్దీ మెదడు కణాలు నశిస్తాయి.",
          "F - Face (ముఖం): నవ్వమని చెప్పండి. ముఖం ఒకవైపు వాలిపోతోందా?",
          "A - Arms (చేతులు): రెండు చేతులను పైకి ఎత్తమనండి. ఒక చేయి క్రిందికి జారిపోతోందా?",
          "S - Speech (మాట): ఒక చిన్న వాక్యం పలకమనండి. మాట తడబడుతోందా లేదా ముద్దగా వస్తోందా?",
          "T - Time (సమయం): ఈ మూడింటిలో ఏ ఒక్కటి కనిపించినా వెంటనే 108 కి కాల్ చేయండి.",
          "లక్షణాలు మొదలైన ఖచ్చితమైన సమయాన్ని వైద్యులకు చెప్పండి. నోట్లో ఏమీ తినిపించవద్దు."
        ],
        subtitles: [
          { start: 0, end: 20, text: "F (ముఖం): నవ్వమని అడగండి - ముఖం ఒకవైపుకు వాలుతుందేమో చూడండి." },
          { start: 20, end: 40, text: "A (చేతులు): చేతులు పైకెత్తమనండి - ఒక చేయి బలహీనంగా కిందకు పడిపోతోందా గమనించండి." },
          { start: 40, end: 60, text: "S (మాట): మాట్లాడమనండి - మాట స్పష్టంగా రాకపోవడం లేదా తడబడటం పక్షవాత సూచిక." },
          { start: 60, end: 80, text: "T (సమయం): వెంటనే 108 కి కాల్ చేసి సిటీ స్కాన్ ఉన్న ఆసుపత్రికి తరలించండి." }
        ],
        steps: [
          "1. ముఖం వాలడాన్ని పరీక్షించండి.",
          "2. చేతుల బలాన్ని చూడండి.",
          "3. మాట స్పష్టతను గమనించండి.",
          "4. సమయాన్ని నమోదు చేయండి.",
          "5. 108 కి కాల్ చేయండి."
        ],
        dos: ["సమయాన్ని గుర్తుంచుకోండి", "వెంటనే ఆసుపత్రికి వెళ్ళండి"],
        donts: ["ఆస్పిరిన్ మాత్రలు వేయవద్దు", "నీరు తాగించవద్దు"]
      }
    ]
  },
  {
    id: "seizure-recovery-position",
    title: "Seizure & Recovery Position: Airway Protection Action",
    category: "Neurological & Convulsion Safety",
    duration: 80,
    description: "Manual action guide on keeping a convulsing patient safe, cushioning the head, timing the seizure, and rolling them into the life-saving left lateral recovery position.",
    iconType: 'seizure',
    languages: [
      {
        code: "en",
        label: "English",
        narrationText: [
          "Stay calm and protect: Do NOT restrain their movements or hold them down.",
          "Place a soft jacket, pillow, or folded towel gently under their head.",
          "Move away sharp objects, glass, furniture, and dangerous edges.",
          "Never put anything in their mouth (no spoons, keys, or fingers).",
          "Once convulsions stop, gently roll them onto their left side into the recovery position to keep airway clear.",
          "Time the seizure: If it lasts more than 5 minutes or repeats, call 108 immediately."
        ],
        subtitles: [
          { start: 0, end: 20, text: "Phase 1: Protect the head from injury using a soft towel or jacket underneath." },
          { start: 20, end: 40, text: "Phase 2: Clear nearby sharp furniture. Never hold them down or restrain convulsions." },
          { start: 40, end: 60, text: "Phase 3: NEVER insert spoons, keys, or fingers into the mouth (teeth will not bite off tongue)." },
          { start: 60, end: 80, text: "Phase 4: After jerking ceases, roll onto left side in recovery position to prevent choking on saliva." }
        ],
        steps: [
          "1. Protect head with soft cushion.",
          "2. Clear dangerous items around the patient.",
          "3. Time the duration of seizure activity.",
          "4. Keep hands away from mouth; do not force teeth apart.",
          "5. Place in left lateral recovery position once jerking stops.",
          "6. Call 108 if seizure exceeds 5 minutes or person is pregnant."
        ],
        dos: ["Cushion head gently", "Roll into recovery position after seizure", "Loosen tight clothing around neck"],
        donts: ["Do NOT put spoons or objects in mouth", "Do NOT hold them down or restrain limbs", "Do NOT give water until fully conscious"]
      },
      {
        code: "te",
        label: "తెలుగు (Telugu)",
        narrationText: [
          "మూర్ఛ (Seizure) వచ్చినప్పుడు ప్రశాంతంగా ఉండండి: రోగి చేతులు, కాళ్లు అదిమిపట్టవద్దు.",
          "తల నేలకు కొట్టుకోకుండా తల క్రింద మెత్తటి గుడ్డ లేదా జాకెట్ ఉంచండి.",
          "దగ్గరగా ఉన్న పదునైన వస్తువులు మరియు ఫర్నిచర్‌ను దూరంగా జరపండి.",
          "నోట్లో తాళంచెవులు, చెంచాలు లేదా చేతులు అస్సలు పెట్టవద్దు (ఇది ప్రమాదకరం).",
          "మూర్ఛ తగ్గిన తర్వాత రోగిని ఎడమవైపుకు ఒత్తిగిల పడుకోబెట్టండి (రికవరీ పొజిషన్).",
          "మూర్ఛ 5 నిమిషాల కంటే ఎక్కువ ఉంటే వెంటనే 108 కి కాల్ చేయండి."
        ],
        subtitles: [
          { start: 0, end: 20, text: "దశ 1: తల గాయపడకుండా తల క్రింద మెత్తటి గుడ్డ ఉంచండి." },
          { start: 20, end: 40, text: "దశ 2: పదునైన వస్తువులను దూరంగా జరపండి. శరీర కదలికలను బలవంతంగా ఆపవద్దు." },
          { start: 40, end: 60, text: "దశ 3: నోట్లో తాళంచెవులు లేదా వస్తువులు ఎట్టిపరిస్థితుల్లో పెట్టవద్దు." },
          { start: 60, end: 80, text: "దశ 4: మూర్ఛ తగ్గిన తర్వాత లాలాజలం శ్వాసనాళాల్లోకి పోకుండా ఎడమవైపుకు పడుకోబెట్టండి." }
        ],
        steps: [
          "1. తల క్రింద మెత్తటి గుడ్డ ఉంచండి.",
          "2. పక్కనున్న వస్తువులు తొలగించండి.",
          "3. నోట్లో ఏమీ పెట్టవద్దు.",
          "4. సమయాన్ని గమనించండి.",
          "5. ఎడమవైపునకు తిప్పి పడుకోబెట్టండి (రికవరీ పొజిషన్).",
          "6. 5 నిమిషాలు దాటితే 108 కి కాల్ చేయండి."
        ],
        dos: ["తల క్రింద దిండు ఉంచండి", "పక్కకు ఒత్తిగిల పడుకోబెట్టండి"],
        donts: ["నోట్లో తాళంచెవులు పెట్టవద్దు", "బలవంతంగా అణచివేయవద్దు"]
      }
    ]
  }
];

export function MultilingualVideoPlayer() {
  const [selectedVideoId, setSelectedVideoId] = useState<string>("cpr-man-simulator");
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraView, setCameraView] = useState<'lateral_action' | 'sternum_closeup' | 'top_down'>('lateral_action');
  const [manualCprStep, setManualCprStep] = useState<'auto' | 'check' | 'call108' | 'airway' | 'handlock' | 'compress' | 'breaths'>('auto');
  
  // Real-time CPR dynamic motion states
  const [compressionCount, setCompressionCount] = useState<number>(0);
  const [cyclePhase, setCyclePhase] = useState<'compression' | 'breath'>('compression');
  const [userPracticeBpm, setUserPracticeBpm] = useState<number>(110);
  const [practiceFeedback, setPracticeFeedback] = useState<string>("Ready for practice");
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  const video = FIRST_AID_VIDEO_GUIDES.find(v => v.id === selectedVideoId) || FIRST_AID_VIDEO_GUIDES[0];
  const langData = video.languages.find(l => l.code === selectedLang) || video.languages[0];

  // Resolve current active CPR physical action
  const activeCprAction: 'check' | 'call108' | 'airway' | 'handlock' | 'compress' | 'breaths' = (
    manualCprStep !== 'auto'
      ? manualCprStep
      : currentTime < 15
      ? 'check'
      : currentTime < 32
      ? 'call108'
      : currentTime < 50
      ? 'airway'
      : currentTime < 65
      ? 'handlock'
      : cyclePhase === 'breath'
      ? 'breaths'
      : 'compress'
  );

  const jumpToCprStep = (step: 'auto' | 'check' | 'call108' | 'airway' | 'handlock' | 'compress' | 'breaths') => {
    setManualCprStep(step);
    if (step === 'check') setCurrentTime(2);
    else if (step === 'call108') setCurrentTime(18);
    else if (step === 'airway') setCurrentTime(35);
    else if (step === 'handlock') setCurrentTime(52);
    else if (step === 'compress') { setCurrentTime(72); setCyclePhase('compression'); }
    else if (step === 'breaths') { setCurrentTime(108); setCyclePhase('breath'); }
    setIsPlaying(true);
  };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatTimerRef = useRef<any>(null);

  // Subtitle synchronization
  const activeSubtitleObj = langData.subtitles.find(s => currentTime >= s.start && currentTime <= s.end) || langData.subtitles[0];
  const activeSubtitle = activeSubtitleObj?.text || "Emergency Clinical First Aid Action Simulator";

  // Web Speech API - Multilingual native speech
  const speakText = (text: string, langCode: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`]/g, " ").replace(/\s+/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(clean);
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
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // Audio Metronome acoustic tick (110 BPM rhythm)
  const playMetronomeTick = (isStrongBeat: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isStrongBeat ? "triangle" : "sine";
      osc.frequency.setValueAtTime(isStrongBeat ? 880 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(isStrongBeat ? 0.15 : 0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  };

  // Metronome tick loop (110 BPM = 545ms interval)
  useEffect(() => {
    if (isPlaying && selectedVideoId === 'cpr-man-simulator') {
      const intervalMs = Math.round(545 / playbackSpeed);
      const interval = setInterval(() => {
        setCompressionCount(c => {
          const next = c + 1;
          const strokeIn30 = (next - 1) % 32;
          if (strokeIn30 < 30) {
            setCyclePhase('compression');
            playMetronomeTick(strokeIn30 % 10 === 0);
          } else {
            setCyclePhase('breath');
          }
          return next;
        });
      }, intervalMs);
      beatTimerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    }
  }, [isPlaying, soundEnabled, selectedVideoId, playbackSpeed]);

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
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, video.duration, playbackSpeed]);

  // Speak instruction on subtitle update
  useEffect(() => {
    if (isPlaying && activeSubtitle) {
      speakText(activeSubtitle, selectedLang);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [activeSubtitle, isPlaying, selectedLang, soundEnabled]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCompressionCount(0);
    setCyclePhase('compression');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((currentTime / video.duration) * 100));
  const currentPhaseIndex = Math.min(
    langData.subtitles.length - 1,
    Math.max(0, langData.subtitles.findIndex(s => currentTime >= s.start && currentTime <= s.end))
  );

  // User Practice Tap Handler for CPR Rhythm
  const handleUserCprTap = () => {
    const now = Date.now();
    playMetronomeTick(true);
    if (lastTapTime > 0) {
      const diffMs = now - lastTapTime;
      if (diffMs > 250 && diffMs < 1200) {
        const bpm = Math.round(60000 / diffMs);
        setUserPracticeBpm(bpm);
        if (bpm >= 100 && bpm <= 120) {
          setPracticeFeedback(`🎯 PERFECT RHYTHM! ${bpm} BPM (AHA Guideline 100-120)`);
        } else if (bpm < 100) {
          setPracticeFeedback(`⚠️ A bit slow (${bpm} BPM). Speed up towards 110 BPM!`);
        } else {
          setPracticeFeedback(`⚠️ Too fast (${bpm} BPM). Slow down slightly to allow chest recoil!`);
        }
      }
    } else {
      setPracticeFeedback("Keep tapping rhythmically...");
    }
    setLastTapTime(now);
  };

  // Compression dynamic values
  const compressionCycleIndex = (compressionCount % 32);
  const isPumping = isPlaying && cyclePhase === 'compression';
  const isBreathing = isPlaying && cyclePhase === 'breath';
  const compressionStroke30 = (compressionCount % 30) + 1;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-0">
      
      {/* Category / Video Selector Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* First Aid Video Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {FIRST_AID_VIDEO_GUIDES.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVideoId(v.id);
                  handleReset();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedVideoId === v.id
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50 ring-2 ring-teal-400/40"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {v.iconType === 'cpr' && <Heart size={14} className="text-red-400" />}
                {v.iconType === 'heimlich' && <Shield size={14} className="text-emerald-400" />}
                {v.iconType === 'bleeding' && <Droplets size={14} className="text-rose-400" />}
                {v.iconType === 'burns' && <Flame size={14} className="text-amber-400" />}
                {v.iconType === 'stroke' && <Clock size={14} className="text-purple-400" />}
                {v.iconType === 'seizure' && <Activity size={14} className="text-sky-400" />}
                <span>{v.title.split(':')[0]}</span>
              </button>
            ))}
          </div>

          {/* Native Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            <Globe size={14} className="text-teal-400 ml-1.5" />
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Language:</span>
            {video.languages.map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLang === l.code
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {l.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Cinema Simulation Viewport */}
      <div className="relative bg-slate-950 w-full min-h-[480px] lg:min-h-[520px] flex flex-col justify-between overflow-hidden select-none">
        
        {/* Subtle grid and emergency room lighting */}
        <div className="absolute inset-0 opacity-20 pointer-events-none sg-grid-bg"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Control Bar with Camera View Toggles & Live HUD Telemetry */}
        <div className="relative z-20 px-4 py-3 flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md gap-3">
          
          {/* Status Badge & Title */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isPlaying ? "LIVE ACTION SIMULATION ACTIVE" : "SIMULATION PAUSED"}
            </span>
            <span className="text-[10px] bg-teal-950/80 text-teal-300 border border-teal-800/60 px-2 py-0.5 rounded-md font-mono hidden sm:inline">
              {langData.label} Audio Narration
            </span>
          </div>

          {/* Camera View Switcher (for CPR Simulator) */}
          {selectedVideoId === 'cpr-man-simulator' && (
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-500 px-2 font-mono flex items-center gap-1">
                <Eye size={12} /> View:
              </span>
              <button
                onClick={() => setCameraView('lateral_action')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  cameraView === 'lateral_action' ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Lateral Rescuer
              </button>
              <button
                onClick={() => setCameraView('sternum_closeup')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  cameraView === 'sternum_closeup' ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Hand Lock Sternum
              </button>
              <button
                onClick={() => setCameraView('top_down')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  cameraView === 'top_down' ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                EMT Overhead
              </button>
            </div>
          )}

          {/* Audio read-aloud toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => speakText(activeSubtitle, selectedLang)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700"
              title="Hear spoken clinical instructions"
            >
              <Volume2 size={13} />
              <span>Hear Narration</span>
            </button>
          </div>
        </div>

        {/* CENTER STAGE: Dynamic Realistic Animated Simulation Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-4">
          
          {selectedVideoId === 'cpr-man-simulator' ? (
            /* =========================================================================
               REALISTIC CPR ACTION SIMULATOR: MAN PERFORMING MANUAL CPR ON PATIENT
               ========================================================================= */
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left/Center Visual Simulation Stage */}
              <div className="md:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 lg:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
                
                {/* Action-by-Action Step Switcher Bar */}
                <div className="w-full flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs mb-3">
                  <span className="text-slate-400 font-mono text-[10px] px-2 font-bold uppercase tracking-wider hidden sm:inline">
                    Action Mode:
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('check')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'check' && manualCprStep === 'check'
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    1. Tap Shoulders
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('call108')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'call108' && manualCprStep === 'call108'
                        ? "bg-red-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    2. Call 108
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('airway')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'airway' && manualCprStep === 'airway'
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    3. Open Airway
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('handlock')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'handlock' && manualCprStep === 'handlock'
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    4. 90° Arm Lock
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('compress')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'compress' && manualCprStep === 'compress'
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    5. 30 Compressions
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('breaths')}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeCprAction === 'breaths' && manualCprStep === 'breaths'
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    6. 2 Breaths
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToCprStep('auto')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ml-auto cursor-pointer ${
                      manualCprStep === 'auto'
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    ▶ Auto Cycle
                  </button>
                </div>

                {/* HUD Live Counters at Top */}
                <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-950/80 border border-red-500/40 px-3 py-1 rounded-xl flex items-center gap-2">
                      <Heart size={15} className={`text-red-400 ${isPumping ? "animate-ping" : ""}`} />
                      <span className="font-mono font-bold text-white text-xs">110 BPM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Action Step</span>
                      <span className={`text-xs font-bold uppercase ${
                        activeCprAction === 'call108' ? "text-red-400" :
                        activeCprAction === 'breaths' ? "text-sky-400 animate-pulse" :
                        activeCprAction === 'compress' ? "text-emerald-400" : "text-teal-300"
                      }`}>
                        {activeCprAction === 'check' && "1. TAP SHOULDERS & SHOUT"}
                        {activeCprAction === 'call108' && "2. CALL 108 EMERGENCY AMBULANCE"}
                        {activeCprAction === 'airway' && "3. HEAD-TILT CHIN-LIFT (OPEN AIRWAY)"}
                        {activeCprAction === 'handlock' && "4. 90° LOCKED ARMS (FINGERS OFF RIBS)"}
                        {activeCprAction === 'compress' && `5. COMPRESSION ${compressionStroke30}/30`}
                        {activeCprAction === 'breaths' && "6. 2 RESCUE BREATHS (CHEST RISE)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Depth Target</span>
                    <span className="text-xs font-mono font-bold text-teal-400">
                      {activeCprAction === 'compress' ? "5.4 cm (2.1 in) · OPTIMAL" : "5.0 - 6.0 cm"}
                    </span>
                  </div>
                </div>

                {/* SVG Visual Demonstration based on active camera view */}
                {cameraView === 'lateral_action' ? (
                  /* VIEW 1: LATERAL PERSPECTIVE - MAN KNEELING BESIDE PATIENT ON FLOOR */
                  <div className="relative w-full h-80 flex items-center justify-center">
                    <svg viewBox="0 20 600 245" className="w-full h-full drop-shadow-2xl">
                      <defs>
                        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="patientGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                        <linearGradient id="rescuerShirt" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#0f766e" />
                        </linearGradient>
                        <filter id="glowAirway" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Training Floor Mat */}
                      <rect x="40" y="210" width="520" height="40" rx="8" fill="url(#floorGrad)" stroke="#334155" strokeWidth="2" />
                      <line x1="60" y1="210" x2="540" y2="210" stroke="#0d9488" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />

                      {/* ---------------- COLLAPSED PATIENT LYING ON BACK ---------------- */}
                      {/* Patient Pillow/Support */}
                      <rect x="70" y="195" width="40" height="15" rx="4" fill="#475569" />
                      {/* Patient Head */}
                      <ellipse
                        cx="90"
                        cy={activeCprAction === 'airway' || activeCprAction === 'breaths' ? 175 : 180}
                        rx="20"
                        ry="16"
                        fill="#fde2e4"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                      {/* Patient Face profile */}
                      <path
                        d={
                          activeCprAction === 'airway' || activeCprAction === 'breaths'
                            ? "M 82 165 Q 96 158 108 168 Q 106 178 94 185" // Tilted back head
                            : "M 85 170 Q 95 165 105 174 Q 102 182 92 188"
                        }
                        fill="#fde2e4"
                      />

                      {/* Patient Torso / Chest with dynamic compression depression or rescue breath expansion */}
                      <path
                        d={
                          activeCprAction === 'compress' && isPumping
                            ? "M 110 188 Q 170 198 230 200 Q 290 198 340 192 L 350 215 L 110 215 Z" // Depressed 5.4cm
                            : activeCprAction === 'breaths'
                            ? "M 110 188 Q 170 166 230 168 Q 290 172 340 192 L 350 215 L 110 215 Z" // Visibly Expanded +4cm
                            : "M 110 188 Q 170 178 230 180 Q 290 184 340 192 L 350 215 L 110 215 Z" // Normal Recoil
                        }
                        fill="url(#patientGrad)"
                        stroke="#7dd3fc"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                      {/* Patient Legs extending flat */}
                      <path d="M 340 192 L 480 200 L 480 215 L 350 215 Z" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                      {/* Patient Feet */}
                      <ellipse cx="485" cy="202" rx="8" ry="12" fill="#0f172a" />

                      {/* Internal Anatomical Heart and Arterial Blood Flow Pulse to Brain */}
                      {activeCprAction === 'compress' && (
                        <g>
                          {/* Heart on Sternum */}
                          <circle cx="180" cy={isPumping ? 197 : 180} r={isPumping ? 9 : 12} fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
                          {/* Arterial Blood Stream Pulsing to Head/Brain */}
                          {isPumping && (
                            <path
                              d="M 175 195 C 150 190 120 182 92 178"
                              stroke="#ef4444"
                              strokeWidth="4"
                              strokeDasharray="6 3"
                              fill="none"
                              className="animate-pulse"
                            />
                          )}
                          {/* Brain Silhouette glowing with oxygen */}
                          <ellipse cx="88" cy="176" rx="9" ry="7" fill={isPumping ? "#f87171" : "#475569"} opacity="0.75" />
                        </g>
                      )}

                      {/* ACTION 1 SCENE: CHECK RESPONSIVENESS & TAP SHOULDERS */}
                      {activeCprAction === 'check' && (
                        <g>
                          {/* Rescuer Kneeling & Tapping Both Shoulders */}
                          <path d="M 210 230 Q 240 235 250 215 L 230 195 L 200 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <path d="M 155 105 L 210 95 L 215 155 L 165 160 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                          <ellipse cx="178" cy="72" rx="16" ry="18" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />
                          {/* Ear near patient's mouth */}
                          <line x1="172" y1="74" x2="176" y2="76" stroke="#1e293b" strokeWidth="2" />
                          
                          {/* Two Arms reaching out to patient's collarbones/shoulders */}
                          <line x1="160" y1="110" x2="125" y2="182" stroke="#fbcfe8" strokeWidth="10" strokeLinecap="round" />
                          <line x1="185" y1="110" x2="145" y2="182" stroke="#fbcfe8" strokeWidth="10" strokeLinecap="round" />
                          
                          {/* Hands firmly tapping patient shoulders with yellow impact rings */}
                          <circle cx="125" cy="182" r="12" fill="none" stroke="#facc15" strokeWidth="2.5" className="animate-ping" />
                          <circle cx="145" cy="182" r="12" fill="none" stroke="#facc15" strokeWidth="2.5" className="animate-ping" />
                          
                          {/* Speech Prompt Bubble */}
                          <rect x="180" y="30" width="180" height="34" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                          <polygon points="180,50 170,55 180,60" fill="#0f172a" />
                          <text x="190" y="46" fill="#38bdf8" fontSize="10" fontWeight="bold">"CAN YOU HEAR ME?"</text>
                          <text x="190" y="58" fill="#94a3b8" fontSize="9">Tap collarbone firmly & shout</text>
                        </g>
                      )}

                      {/* ACTION 2 SCENE: SHOUT FOR HELP & CALL 108 */}
                      {activeCprAction === 'call108' && (
                        <g>
                          {/* Rescuer Pointing Urgently */}
                          <path d="M 210 230 Q 240 235 250 215 L 230 195 L 200 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <path d="M 155 105 L 210 95 L 215 155 L 165 160 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                          <ellipse cx="178" cy="72" rx="16" ry="18" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />
                          {/* Left arm resting on patient */}
                          <line x1="165" y1="110" x2="178" y2="182" stroke="#fbcfe8" strokeWidth="10" strokeLinecap="round" />
                          {/* Right arm extended pointing to side */}
                          <line x1="190" y1="110" x2="250" y2="105" stroke="#fbcfe8" strokeWidth="10" strokeLinecap="round" />
                          <ellipse cx="254" cy="104" rx="6" ry="5" fill="#fbcfe8" />

                          {/* Glowing 108 Emergency Callout Box */}
                          <g transform="translate(260, 60)">
                            <rect x="0" y="0" width="170" height="65" rx="12" fill="#450a0a" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
                            <circle cx="22" cy="32" r="14" fill="#dc2626" />
                            <text x="22" y="37" fill="#ffffff" fontSize="14" textAnchor="middle" fontWeight="bold">☎</text>
                            <text x="44" y="26" fill="#f87171" fontSize="12" fontWeight="extrabold" fontFamily="monospace">CALL 108 EMT</text>
                            <text x="44" y="42" fill="#ffffff" fontSize="9" fontWeight="bold">"Direct bystander to call"</text>
                            <text x="44" y="54" fill="#fca5a5" fontSize="8">"Bring AED Defibrillator immediately"</text>
                          </g>
                        </g>
                      )}

                      {/* ACTION 3 SCENE: HEAD-TILT CHIN-LIFT (OPEN AIRWAY) */}
                      {activeCprAction === 'airway' && (
                        <g>
                          {/* Rescuer Leaning Over Head */}
                          <path d="M 190 230 Q 220 235 230 215 L 210 195 L 180 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <path d="M 135 110 L 190 100 L 195 160 L 145 165 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                          <ellipse cx="148" cy="76" rx="16" ry="18" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />
                          
                          {/* Hand 1: Pressing down on Forehead */}
                          <line x1="140" y1="110" x2="88" y2="168" stroke="#fbcfe8" strokeWidth="8" strokeLinecap="round" />
                          <ellipse cx="86" cy="168" rx="7" ry="5" fill="#f43f5e" />
                          {/* Hand 2: Fingertips lifting lower Chin */}
                          <line x1="150" y1="115" x2="108" y2="175" stroke="#fbcfe8" strokeWidth="8" strokeLinecap="round" />
                          <ellipse cx="108" cy="175" rx="6" ry="5" fill="#f43f5e" />

                          {/* Luminous Glowing Open Airway Tube */}
                          <path
                            d="M 104 172 Q 120 178 140 188 L 155 194"
                            stroke="#22d3ee"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                            filter="url(#glowAirway)"
                          />

                          {/* Airway Annotation Banner */}
                          <g transform="translate(160, 45)">
                            <rect x="0" y="0" width="190" height="42" rx="8" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
                            <text x="10" y="18" fill="#22d3ee" fontSize="10" fontWeight="bold">✔ AIRWAY WIDE OPEN</text>
                            <text x="10" y="32" fill="#cbd5e1" fontSize="8.5">Tongue lifted off back of throat</text>
                          </g>
                        </g>
                      )}

                      {/* ACTION 4 SCENE: 90° STRAIGHT ARM LOCK & INTERLOCKED HANDS */}
                      {activeCprAction === 'handlock' && (
                        <g>
                          {/* Rescuer Kneeling Lower Body */}
                          <path d="M 210 230 Q 240 235 250 215 L 230 195 L 200 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <ellipse cx="205" cy="220" rx="14" ry="10" fill="#334155" />
                          
                          {/* Upper Body Vertically Centered Right Over Sternum */}
                          <path d="M 155 100 L 210 90 L 215 150 L 165 155 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                          <ellipse cx="178" cy="68" rx="16" ry="18" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />

                          {/* 90 DEGREE VERTICAL ALIGNMENT GUIDE */}
                          <line x1="178" y1="90" x2="178" y2="182" stroke="#22c55e" strokeWidth="3" strokeDasharray="4 2" />
                          {/* 90-degree square symbol */}
                          <path d="M 178 165 L 190 165 L 190 178" fill="none" stroke="#22c55e" strokeWidth="2" />
                          
                          {/* Locked Arms */}
                          <line x1="168" y1="105" x2="178" y2="182" stroke="#fbcfe8" strokeWidth="12" strokeLinecap="round" />
                          <line x1="188" y1="105" x2="180" y2="182" stroke="#fbcfe8" strokeWidth="12" strokeLinecap="round" />
                          {/* Interlocked Hands on Sternum */}
                          <ellipse cx="180" cy="184" rx="14" ry="8" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />

                          {/* 90 Degree Angle Badge */}
                          <g transform="translate(230, 80)">
                            <rect x="0" y="0" width="170" height="50" rx="10" fill="#052e16" stroke="#22c55e" strokeWidth="2" />
                            <text x="12" y="20" fill="#4ade80" fontSize="11" fontWeight="extrabold">✔ 90° LOCKED ARMS</text>
                            <text x="12" y="34" fill="#ffffff" fontSize="9" fontWeight="bold">DO NOT BEND ELBOWS</text>
                            <text x="12" y="44" fill="#86efac" fontSize="8">Use upper body weight to push</text>
                          </g>
                        </g>
                      )}

                      {/* ACTION 5 SCENE: 30 DEEP COMPRESSIONS (110 BPM DYNAMIC PUMP) */}
                      {activeCprAction === 'compress' && (
                        <g>
                          {/* Rescuer Kneeling Lower Body */}
                          <path d="M 210 230 Q 240 235 250 215 L 230 195 L 200 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <ellipse cx="205" cy="220" rx="14" ry="10" fill="#334155" />

                          {/* Dynamic Torso (Moves DOWN on compression, UP on recoil) */}
                          <g
                            transform={isPumping ? "translate(0, 16)" : "translate(0, 0)"}
                            className="transition-transform duration-150 ease-in-out"
                          >
                            <path d="M 155 105 L 210 95 L 215 155 L 165 160 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                            <ellipse cx="178" cy="72" rx="16" ry="18" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />
                            <path d="M 162 68 Q 178 50 194 65 Q 185 58 165 60 Z" fill="#0f172a" />
                            <line x1="172" y1="74" x2="176" y2="76" stroke="#1e293b" strokeWidth="2" />

                            {/* Rigid locked arms */}
                            <line x1="165" y1="110" x2="178" y2="182" stroke="#fbcfe8" strokeWidth="12" strokeLinecap="round" />
                            <line x1="180" y1="108" x2="182" y2="182" stroke="#fbcfe8" strokeWidth="12" strokeLinecap="round" />
                            <ellipse cx="180" cy="184" rx="13" ry="8" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />

                            {/* Downward Force Vector Arrow */}
                            {isPumping && (
                              <g>
                                <line x1="180" y1="125" x2="180" y2="160" stroke="#facc15" strokeWidth="4" />
                                <polygon points="174,160 186,160 180,172" fill="#facc15" />
                              </g>
                            )}
                          </g>

                          {/* Dynamic Depth Ruler on side */}
                          <g transform="translate(240, 160)">
                            <line x1="0" y1="0" x2="0" y2="50" stroke="#64748b" strokeWidth="2" />
                            <line x1="-5" y1="0" x2="5" y2="0" stroke="#64748b" strokeWidth="1.5" />
                            <rect x="-6" y="16" width="12" height="18" rx="2" fill="#22c55e" opacity="0.35" />
                            <line x1="-8" y1="24" x2="8" y2="24" stroke="#22c55e" strokeWidth="2.5" />
                            <text x="12" y="27" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                              {isPumping ? "5.4 cm DEPRESSED" : "RECOIL 0 cm"}
                            </text>
                            <line x1="-5" y1="45" x2="5" y2="45" stroke="#64748b" strokeWidth="1.5" />
                          </g>
                        </g>
                      )}

                      {/* ACTION 6 SCENE: 2 RESCUE BREATHS (PINCH NOSE & WATCH CHEST RISE) */}
                      {activeCprAction === 'breaths' && (
                        <g>
                          {/* Rescuer Head Down Beside Patient Mouth Delivering Breath */}
                          <path d="M 180 230 Q 210 235 220 215 L 200 195 L 170 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <path d="M 125 125 L 180 115 L 185 175 L 135 180 Z" fill="url(#rescuerShirt)" stroke="#14b8a6" strokeWidth="2" />
                          {/* Rescuer Head sealing mouth */}
                          <ellipse cx="112" cy="155" rx="15" ry="17" fill="#fbcfe8" stroke="#cbd5e1" strokeWidth="1.5" />
                          {/* Fingers Pinching Patient Nostrils */}
                          <line x1="120" y1="135" x2="100" y2="162" stroke="#fbcfe8" strokeWidth="7" strokeLinecap="round" />
                          <circle cx="98" cy="164" r="5" fill="#f43f5e" />

                          {/* Visual Oxygen Airflow into Chest */}
                          <g filter="url(#glowAirway)">
                            <path d="M 108 170 Q 140 160 170 172" stroke="#38bdf8" strokeWidth="4" strokeDasharray="5 3" fill="none" className="animate-pulse" />
                            <polygon points="175,172 165,167 167,177" fill="#38bdf8" />
                          </g>

                          {/* Chest Rise Visual Indicator */}
                          <g transform="translate(190, 130)">
                            <rect x="0" y="0" width="150" height="36" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="10" y="15" fill="#38bdf8" fontSize="10" fontWeight="bold">💨 CHEST VISIBLY RISES</text>
                            <text x="10" y="28" fill="#e0f2fe" fontSize="8.5">Give 1-sec breath & watch recoil</text>
                          </g>
                        </g>
                      )}
                    </svg>
                  </div>
                ) : cameraView === 'sternum_closeup' ? (
                  /* VIEW 2: STERNUM CLOSE-UP - INTERLOCKED FINGERS ON STERNUM */
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <svg viewBox="0 0 400 240" className="w-full h-full drop-shadow-2xl">
                      {/* Ribcage Outline */}
                      <ellipse cx="200" cy="120" rx="140" ry="85" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                      {/* Sternum / Breastbone centered */}
                      <rect x="185" y="50" width="30" height="135" rx="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="200" y1="65" x2="200" y2="165" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Target Lower Half Circle */}
                      <circle cx="200" cy="140" r="28" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="200" y="144" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">STERNUM TARGET</text>

                      {/* Interlocked Hands Animation */}
                      <g
                        transform={isPumping ? "translate(0, 10)" : "translate(0, 0)"}
                        className="transition-transform duration-150"
                      >
                        {/* Bottom Hand (Dominant heel placed flat) */}
                        <path d="M 175 140 Q 200 120 225 140 L 230 170 Q 200 175 170 170 Z" fill="#fda4af" stroke="#e11d48" strokeWidth="2" />
                        {/* Top Hand Interlocking with Fingers Pulled Up */}
                        <path d="M 165 130 Q 200 110 235 130 L 240 160 Q 200 165 160 160 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
                        {/* Raised interlocked fingers off ribs */}
                        <line x1="175" y1="125" x2="165" y2="105" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
                        <line x1="190" y1="120" x2="185" y2="100" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
                        <line x1="205" y1="120" x2="210" y2="100" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
                        <line x1="220" y1="125" x2="230" y2="105" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />

                        {/* Compression Pulse Ring */}
                        {isPumping && (
                          <circle cx="200" cy="145" r="42" fill="none" stroke="#facc15" strokeWidth="3" className="animate-ping" />
                        )}
                      </g>
                    </svg>
                  </div>
                ) : (
                  /* VIEW 3: OVERHEAD EMT TOP-DOWN VIEW */
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <svg viewBox="0 0 400 240" className="w-full h-full drop-shadow-2xl">
                      {/* Victim Body lying supine */}
                      <rect x="50" y="70" width="300" height="100" rx="20" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="75" cy="120" r="22" fill="#fde2e4" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Rescuer kneeling from above */}
                      <ellipse cx="200" cy="30" rx="35" ry="22" fill="#0d9488" stroke="#14b8a6" strokeWidth="2" />
                      {/* Arms reaching down onto sternum */}
                      <line x1="185" y1="45" x2="195" y2="115" stroke="#fda4af" strokeWidth="10" strokeLinecap="round" />
                      <line x1="215" y1="45" x2="205" y2="115" stroke="#fda4af" strokeWidth="10" strokeLinecap="round" />
                      <ellipse cx="200" cy="120" rx="18" ry="12" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                      <text x="200" y="123" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">HEEL LOCK</text>
                    </svg>
                  </div>
                )}

                {/* Real-time Subtitle & Step Guide overlay */}
                <div className="w-full mt-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    <span className="text-xs text-slate-200 font-medium">
                      {langData.steps[currentPhaseIndex] || langData.steps[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono font-bold shrink-0">
                    Phase {currentPhaseIndex + 1}/{langData.subtitles.length}
                  </span>
                </div>
              </div>

              {/* Right Panel: Interactive "Try Manual CPR Yourself" & Clinical Rules */}
              <div className="md:col-span-4 space-y-4">
                
                {/* Interactive User Beat Practice Pad */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sparkles size={13} />
                      Practice Rhythm Pad
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                      AHA 110 BPM
                    </span>
                  </div>

                  {/* Big Tap Button */}
                  <button
                    type="button"
                    onClick={handleUserCprTap}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-red-950/60 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border border-red-400/30"
                  >
                    <Heart size={24} className="text-white animate-pulse" />
                    <span>TAP TO PUSH CHEST</span>
                    <span className="text-[10px] font-normal opacity-90">Click repeatedly to match 100-120 BPM</span>
                  </button>

                  {/* Feedback on User Pace */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase">Your Measured Tempo</div>
                    <div className="text-xl font-bold text-white mt-0.5">{userPracticeBpm} BPM</div>
                    <div className="text-[11px] text-teal-400 font-sans mt-1 leading-tight">
                      {practiceFeedback}
                    </div>
                  </div>
                </div>

                {/* 30:2 Golden Clinical Rule Box */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <div className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Award size={14} className="text-yellow-400" />
                    30 Compressions : 2 Breaths Rule
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Continuous chest compressions maintain coronary and cerebral perfusion pressure. Interrupt compressions for only 5 seconds to deliver 2 gentle rescue breaths.
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Recoil: 100% full chest expansion</span>
                    <span className="text-teal-400">Locked 90° elbows</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               OTHER FIRST AID SIMULATORS: HEIMLICH, BLEEDING, BURNS, STROKE, SEIZURE
               ========================================================================= */
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-teal-400 tracking-wider font-mono">
                    CLINICAL ACTION GUIDE · {video.category.toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-700 text-xs font-mono">
                  {langData.label} Protocol
                </Badge>
              </div>

              {/* Action Graphic Illustration */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-950/80 border-2 border-teal-500/60 flex items-center justify-center text-teal-400">
                    {video.iconType === 'heimlich' && <Shield size={32} />}
                    {video.iconType === 'bleeding' && <Droplets size={32} className="text-rose-400" />}
                    {video.iconType === 'burns' && <Flame size={32} className="text-amber-400" />}
                    {video.iconType === 'stroke' && <Clock size={32} className="text-purple-400" />}
                    {video.iconType === 'seizure' && <Activity size={32} className="text-sky-400" />}
                  </div>

                  <div>
                    <h3 className="text-white text-base font-bold">{video.title}</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-md leading-relaxed">{video.description}</p>
                    <div className="text-teal-400 text-xs font-mono mt-2">
                      Current Action Step: {currentPhaseIndex + 1} of {langData.subtitles.length}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-right min-w-[160px]">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Emergency Hotline</div>
                  <div className="text-xl font-bold font-mono text-red-400 mt-0.5">108 / 104</div>
                  <div className="text-[10px] text-emerald-400 mt-1">24x7 Free Paramedic Dispatch</div>
                </div>
              </div>

              {/* Active Step Box */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-slate-100 text-xs leading-relaxed">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Execution Rule:</div>
                <p className="text-sm font-semibold text-white">
                  {langData.steps[currentPhaseIndex] || langData.steps[0]}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Subtitle Banner Bar at Bottom */}
        <div className="relative z-20 px-4 sm:px-10 pb-2">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl px-5 py-3 text-center shadow-2xl">
            <div className="text-[10px] uppercase tracking-wider font-bold text-teal-400 mb-0.5 flex items-center justify-center gap-1.5 font-mono">
              <span>Synchronized Voice Instructions ({langData.label})</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
              "{activeSubtitle}"
            </p>
          </div>
        </div>

        {/* Video Player Controls Bar */}
        <div className="relative z-20 bg-slate-950/95 border-t border-slate-800/80 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-9 w-9 rounded-full bg-teal-600/30 text-teal-300 hover:text-white cursor-pointer"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw size={15} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full cursor-pointer"
              title={soundEnabled ? "Mute audio narration and metronome" : "Unmute audio narration"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-teal-400" /> : <VolumeX size={16} />}
            </Button>
            
            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <span className="hidden sm:inline">Speed:</span>
              <button
                onClick={() => setPlaybackSpeed(s => s === 1 ? 0.75 : s === 0.75 ? 1.25 : 1)}
                className="text-teal-400 font-bold hover:text-teal-300 cursor-pointer"
              >
                {playbackSpeed}x
              </button>
            </div>

            <span className="text-white/80 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(video.duration)}
            </span>
          </div>

          {/* Scrub Bar */}
          <div className="flex-1 mx-2 min-w-[120px]">
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
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

      {/* Multilingual Step-by-Step Instructions & Do's and Don'ts */}
      <div className="p-6 grid md:grid-cols-2 gap-6 bg-slate-50/70 border-t border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Step-by-Step Action Protocol ({langData.label})
            </h4>
          </div>
          <ol className="space-y-2 text-xs text-slate-700">
            {langData.steps.map((step, idx) => (
              <li key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={18} className="text-slate-900" />
            <h4 className="font-bold text-slate-900 text-sm">
              Clinical Do's & Don'ts ({langData.label})
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1.5">
              <div className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> ALWAYS DO:
              </div>
              {langData.dos.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-emerald-800">
                  <span className="text-emerald-600 font-bold shrink-0">•</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl space-y-1.5">
              <div className="font-bold text-red-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-red-600 font-bold">✕</span> NEVER DO:
              </div>
              {langData.donts.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-red-800">
                  <span className="text-red-600 font-bold shrink-0">•</span>
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
