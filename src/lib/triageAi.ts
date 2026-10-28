export interface TriageMedicineApp {
  app_id: string;
  price: number;
  discount_percent: number;
  delivery_eta: string;
  buy_url: string;
  logo_color: string;
}

export interface TriageMedicineItem {
  name: string;
  category: string;
  dosage: string;
  online_apps?: TriageMedicineApp[];
}

export interface TriageHotlineItem {
  name: string;
  number: string;
  desc: string;
  type: string;
}

export interface TriageDoctorRecommendation {
  specialtyName: string;
  department: string;
  doctorTypeDesc: string;
  whyConsult: string;
  suggestedActionTimeline: string;
  bookingUrl: string;
  callNumber?: string;
}

export interface TriageResult {
  message: string;
  isEmergency: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  specialist?: string;
  doctorRecommendation?: TriageDoctorRecommendation;
  guardianAlertTriggered: boolean;
  guardianAlertMessage?: string;
  recommendedMedicines?: TriageMedicineItem[];
  emergencyHotlines?: TriageHotlineItem[];
  homeRemedies?: string[];
  detectedTopic?: 'cpr' | 'medicines_general' | 'cough_cold' | 'digestion_acidity' | 'fever' | 'headache' | 'diarrhea' | 'skin_rash' | 'cardiac' | 'stroke' | 'trauma' | 'general';
}

const COMMON_HOTLINES: TriageHotlineItem[] = [
  { name: "National Emergency Ambulance", number: "108", desc: "24x7 Paramedic ambulance dispatch across India", type: "Ambulance" },
  { name: "National Health Advice Hotline", number: "104", desc: "Free government clinical consultation & tele-triage", type: "Govt Helpline" },
  { name: "Apollo 24/7 Doctor Video Hotline", number: "1860-500-1066", desc: "Instant physician video consult & rapid prescription delivery", type: "Telemedicine" }
];

export function evaluateSymptomTriage(input: string, targetLang: string = 'en'): TriageResult {
  const query = (input || '').toLowerCase();
  const lang = (targetLang || 'en').toLowerCase().split('-')[0];

  // 0. Explicit Intent Recognition
  const isDirectMedicineQuery = (
    query.includes('medicine') || query.includes('medicines') || query.includes('show medicine') ||
    query.includes('show medicines to buy') || query.includes('buy medicine') || query.includes('buy medicines') ||
    query.includes('order medicine') || query.includes('order medicines') || query.includes('tablet') ||
    query.includes('tablets') || query.includes('syrup') || query.includes('dawa') || query.includes('dawain') ||
    query.includes('दवा') || query.includes('दवाई') || query.includes('दवाइयां') ||
    query.includes('మందులు') || query.includes('దవాఖాన') || query.includes('మందు') ||
    query.includes('மருந்து') || query.includes('மருந்துகள்') ||
    query.includes('ওষুধ') || query.includes('ঔষধ') ||
    query.includes('medicamento') || query.includes('medicamentos') || query.includes('farmacia')
  );

  const isCoughQuery = (
    query.includes('cough') || query.includes('cold') || query.includes('sore throat') || query.includes('throat pain') ||
    query.includes('dry cough') || query.includes('wet cough') || query.includes('phlegm') || query.includes('congestion') ||
    query.includes('khansi') || query.includes('zukaam') || query.includes('nazla') || query.includes('gale mein') ||
    query.includes('aaviri') || query.includes('ఆవిరి') || query.includes('దగ్గు') || query.includes('జలుబు') || query.includes('గొంతు నొప్పి') ||
    query.includes('daggu') || query.includes('irumal') || query.includes('thondai') || query.includes('kashe') ||
    query.includes('tos') || query.includes('garganta') || query.includes('resfriado')
  );

  const isDigestionQuery = (
    query.includes('digestion') || query.includes('digestion avvakapothe') || query.includes('indigestion') ||
    query.includes('acidity') || query.includes('gas') || query.includes('bloating') || query.includes('acid reflux') ||
    query.includes('heartburn') || query.includes('stomach ache') || query.includes('stomach burning') || query.includes('constipation') ||
    query.includes('vaamu') || query.includes('vammu') || query.includes('ajwain') || query.includes('carom') ||
    query.includes('apachan') || query.includes('pet kharab') || query.includes('pet dard') || query.includes('kabz') ||
    query.includes('వాము') || query.includes('అజీర్ణం') || query.includes('కడుపు ఉబ్బరం') || query.includes('జీర్ణ') || query.includes('కడుపు నొప్పి') ||
    query.includes('செரியாமை') || query.includes('அஜீரணம்') ||
    query.includes('হজম') || query.includes('বদহজম') ||
    query.includes('indigestión') || query.includes('acidez') || query.includes('dolor de estómago') || query.includes('gases')
  );

  const isHeadacheQuery = (
    query.includes('headache') || query.includes('head ache') || query.includes('migraine') || query.includes('temple pain') ||
    query.includes('sir dard') || query.includes('sar dard') ||
    query.includes('తలనొప్పి') || query.includes('తలనెప్పి') || query.includes('తల నెప్పి') ||
    query.includes('தலைவலி') || query.includes('মাথা ব্যথা') || query.includes('dolor de cabeza') || query.includes('jaqueca')
  );

  const isDiarrheaQuery = (
    query.includes('diarrhea') || query.includes('diarrhoea') || query.includes('loose motion') || query.includes('loose motions') ||
    query.includes('watery stool') || query.includes('stomach upset') || query.includes('dast') || query.includes('pet kharab') ||
    query.includes('విరేచనాలు') || query.includes('మోషన్స్') ||
    query.includes('வயிற்றுப்போக்கு') || query.includes('পাতলা পায়খানা') || query.includes('diarrea')
  );

  const isFeverQuery = (
    query.includes('fever') || query.includes('high temp') || query.includes('temperature') || query.includes('febrile') ||
    query.includes('chills') || query.includes('bukhar') || query.includes('tap') ||
    query.includes('జ్వరం') || query.includes('కాక') || query.includes('juram') || query.includes('jwaram') ||
    query.includes('காய்ச்சல்') || query.includes('জ্বর') || query.includes('fiebre')
  );

  const isSkinQuery = (
    query.includes('rash') || query.includes('allergy') || query.includes('skin') || query.includes('itch') ||
    query.includes('hive') || query.includes('hives') || query.includes('eczema') || query.includes('red spots') ||
    query.includes('daane') || query.includes('khujli') ||
    query.includes('దురద') || query.includes('దద్దుర్లు') || query.includes('చర్మం') ||
    query.includes('அரிப்பு') || query.includes('தடிப்பு') ||
    query.includes('চুলকানি') || query.includes('erupción') || query.includes('picazón')
  );

  // 1. Multilingual Symptom Recognition
  // Cardiac / Cardiovascular signs
  const isCardiac = (
    query.includes('chest pain') || query.includes('chest tightness') || query.includes('heart attack') ||
    query.includes('pressure on chest') || query.includes('palpitations') ||
    (query.includes('chest') && (query.includes('sweat') || query.includes('arm') || query.includes('jaw'))) ||
    query.includes('छाती में दर्द') || query.includes('सीने में दर्द') || query.includes('हार्ट अटैक') ||
    query.includes('గుండె నొప్పి') || query.includes('ఛాతీ నొప్పి') || query.includes('గుండెపోటు') ||
    query.includes('நெஞ்சு வலி') || query.includes('மாரடைப்பு') ||
    query.includes('dolor de pecho') || query.includes('ataque al corazón') || query.includes('opresión en el pecho') ||
    query.includes('বুকে ব্যথা') || query.includes('হার্ট অ্যাটাক')
  );

  // Stroke / Neurological signs
  const isStroke = (
    query.includes('face drooping') || query.includes('slurred speech') || query.includes('arm weakness') ||
    query.includes('stroke') || query.includes('loss of vision') || query.includes('one side numb') ||
    query.includes('लकवा') || query.includes('मुंह टेढ़ा') || query.includes('बोलने में असमर्थ') ||
    query.includes('పక్షవాతం') || query.includes('మాట తడబడటం') || query.includes('ముఖం వాలడం') ||
    query.includes('பக்கவாதம்') || query.includes('பேச இயலாமை') ||
    query.includes('derrame') || query.includes('accidente cerebrovascular') || query.includes('parálisis facial') ||
    query.includes('স্ট্রোক') || query.includes('মুখ বেঁকে যাওয়া')
  );

  // Severe Trauma / Airway / Loss of Consciousness
  const isSevereTrauma = (
    query.includes('unconscious') || query.includes('heavy bleeding') || query.includes('severe bleeding') ||
    query.includes('cannot breathe') || query.includes('stopped breathing') || query.includes('choking') ||
    query.includes('seizure') || query.includes('anaphylaxis') ||
    query.includes('बेहोश') || query.includes('खून बहना') || query.includes('सांस नहीं आ रही') || query.includes('दम घुटना') || query.includes('दौरा') ||
    query.includes('స్పృహ కోల్పోవడం') || query.includes('రక్తం కారడం') || query.includes('శ్వాస ఆడకపోవడం') || query.includes('మూర్ఛ') ||
    query.includes('மயக்கம்') || query.includes('அதிக ரத்தப்போக்கு') || query.includes('மூச்சுத்திணறல்') ||
    query.includes('inconsciente') || query.includes('hemorragia') || query.includes('no puedo respirar') || query.includes('asfixia') || query.includes('convulsión') ||
    query.includes('অচেতন') || query.includes('তীব্র রক্তপাত') || query.includes('দম বন্ধ') || query.includes('খিঁচুনি')
  );

  // High Urgency / High Fever
  const isHighUrgency = (
    query.includes('high fever') || query.includes('102') || query.includes('103') || query.includes('104') ||
    query.includes('fracture') || query.includes('severe abdominal') || query.includes('vomiting blood') ||
    query.includes('acute asthma') || query.includes('deep cut') || query.includes('blood in stool') ||
    query.includes('तेज बुखार') || query.includes('पेट में तेज दर्द') || query.includes('हड्डी टूटना') || query.includes('उल्टी में खून') || query.includes('अस्थमा') ||
    query.includes('తీవ్ర జ్వరం') || query.includes('కడుపులో విపరీతమైన నొప్పి') || query.includes('రక్తపు వాంతులు') || query.includes('ఎముక విరగడం') ||
    query.includes('அதிக காய்ச்சல்') || query.includes('வயிற்று வலி') || query.includes('எலும்பு முறிவு') ||
    query.includes('fiebre alta') || query.includes('dolor abdominal severo') || query.includes('vómito con sangre') || query.includes('fractura') ||
    query.includes('তীব্র জ্বর') || query.includes('পেটে প্রচণ্ড ব্যথা') || query.includes('রক্তবমি')
  );

  // =========================================================================
  // 1. CRITICAL EMERGENCY EVALUATION (Life-Threatening)
  // =========================================================================
  if (isCardiac || isStroke || isSevereTrauma) {
    let specialist = "Emergency Medicine / Interventional Cardiologist";
    let guardianAlertText = "🚨 CRITICAL FAMILY EMERGENCY: Life-threatening symptom detected in User Triage. Immediate emergency alert dispatched to Guardian!";
    let recDept = "Cardiac Cath Lab & Emergency Critical Care";
    let recDesc = "Immediate resuscitation, continuous ECG rhythm monitoring, emergency cath lab angiography and intensive care.";
    let recWhy = "Critical symptoms (chest pressure, stroke deficits, airway distress) require hospital ER evaluation within minutes.";

    if (isStroke) {
      specialist = "Stroke Unit / Comprehensive Neurologist";
      guardianAlertText = "🚨 STROKE RED ALERT: FAST neurological warning symptoms detected. Immediate Guardian beacon and Stroke Cath Lab alert dispatched!";
      recDept = "Neurology & Comprehensive Stroke Unit";
      recDesc = "Emergency CT/MRI brain neuro-imaging, IV thrombolytic therapy (tPA), and mechanical thrombectomy.";
      recWhy = "Every minute counts in acute stroke to preserve brain cells. Window of golden hour treatment is under 4.5 hours.";
    } else if (isSevereTrauma) {
      specialist = "Trauma & Emergency Services (Level-1 ER)";
      guardianAlertText = "🚨 TRAUMA & AIRWAY ALERT: Severe trauma or respiratory distress detected. Guardian contacts notified for urgent intervention!";
      recDept = "Level-1 Trauma & Critical Care Resuscitation";
      recDesc = "Airway intubation, active hemorrhage control, fluid resuscitation, and acute emergency surgery.";
      recWhy = "Severe unresponsiveness, respiratory collapse, or deep hemorrhages cannot wait for routine clinic visits.";
    }

    let message = "";
    if (lang === 'te') {
      message = `🚨 తక్షణ అత్యవసర వైద్య సేవలను సంప్రదించండి (SEEK EMERGENCY CARE NOW)

మీరు పేర్కొన్న లక్షణాలు అత్యంత తీవ్రమైన అత్యవసర సంకేతాలను సూచిస్తున్నాయి. వెంటనే సమీపంలోని ఎమర్జెన్సీ ఆసుపత్రికి వెళ్లాలి.

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు:
• స్పెషలిస్ట్: ${specialist}.
• విభాగం: ${recDept}.
• ఎందుకు సంప్రదించాలి: ఛాతీ నొప్పి, పక్షవాత లక్షణాలు లేదా శ్వాస ఆడకపోవడం వంటివి క్షణాలలో ప్రాణాపాయాన్ని కలిగిస్తాయి. వీటికి తక్షణ ఐసీయూ లేదా క్యాథ్ ల్యాబ్ చికిత్స అవసరం.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (ఖచ్చితమైన తక్షణ చర్యలు):
1. తక్షణమే 108 ఎమర్జెన్సీ అంబులెన్స్ సేవలకు కాల్ చేయండి.
2. మీ కుటుంబ సంరక్షకులకు (Guardian) తక్షణ ఎమర్జెన్సీ అలర్ట్ మరియు మీ లైవ్ లొకేషన్ పంపబడింది.
3. రోగిని సురక్షితమైన ప్రదేశంలో నిటారుగా లేదా కొద్దిగా వెనుకకు ఆన్చి కూర్చోబెట్టండి.
4. నడవడం, మెట్లు ఎక్కడం, లేదా శారీరక శ్రమను పూర్తిగా ఆపండి.
5. ఆహారం లేదా నీరు అస్సలు ఇవ్వవద్దు (స్పృహ తప్పే ప్రమాదం ఉంది).`;
    } else if (lang === 'hi') {
      message = `🚨 तुरंत आपातकालीन चिकित्सा सहायता लें (SEEK EMERGENCY CARE NOW)

आपके द्वारा वर्णित लक्षणों में गंभीर आपातकालीन संकेत पाए गए हैं जिन्हें तुरंत अस्पताल में जांच की आवश्यकता है।

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• अनुशंसित विशेषज्ञ: ${specialist}।
• विभाग: ${recDept}।
• परामर्श का कारण: सीने में भारीपन, स्ट्रोक के लक्षण या सांस की रुकावट में हर एक मिनट कीमती होता है। इसके लिए अस्पताल का इमरजेंसी आईसीयू आवश्यक है।

📋 आपको अभी तुरंत क्या करना चाहिए (कदम-दर-कदम):
1. तत्काल 108 आपातकालीन एम्बुलेंस को कॉल करें।
2. आपके पंजीकृत अभिभावक (Guardian) को वास्तविक समय में इमरजेंसी अलर्ट और स्थान भेज दिया गया है।
3. मरीज को सहारा देकर आराम की स्थिति में बैठाएं, अनावश्यक चलने-फिरने से पूरी तरह रोकें।
4. बेहोशी की स्थिति में मरीज के मुंह में पानी या खाना बिल्कुल न डालें।`;
    } else if (lang === 'ta') {
      message = `🚨 உடனடியாக அவசர சிகிச்சை பிரிவை அணுகவும் (SEEK EMERGENCY CARE NOW)

தாங்கள் விவரித்த அறிகுறிகள் தீவிர அவசரநிலையைக் காட்டுகின்றன. உடனடியாக மருத்துவமனைக்குச் செல்ல வேண்டும்.

👨‍⚕️ நீங்கள் அணுக வேண்டிய சரியான மருத்துவர்:
• பரிந்துரைக்கப்படும் நிபுணர்: ${specialist}.
• துறை: ${recDept}.
• காரணம்: நெஞ்சு வலி மற்றும் நரம்பியல் குறைபாடுகளுக்கு உடனடியாக ஆம்புலன்ஸ் மூலம் மருத்துவமனையை அடைவது அவசியம்.

📋 நீங்கள் இப்போது என்ன செய்ய வேண்டும்:
1. உடனடியாக 108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்.
2. உங்கள் பாதுகావலருக்கு (Guardian) அவசர உதவி எச்சரிக்கை மற்றும் ஜிபிஎஸ் தகவல் அனுப்பப்பட்டுள்ளது.
3. அமைதியாக ஓரிடத்தில் அமருங்கள், உடல் அசைவுகளை தவிர்க்கவும்.`;
    } else if (lang === 'es') {
      message = `🚨 BUSQUE ATENCIÓN MÉDICA DE URGENCIA INMEDIATA

Los síntomas descritos indican una emergencia médica crítica que requiere evaluación hospitalaria presencial urgente.

👨‍⚕️ Especialista recomendado a consultar:
• Especialista: ${specialist}.
• Departamento: ${recDept}.
• Razón: Síntomas cardíacos o neurológicos severos requieren atención hospitalaria inmediata en sala de reanimación.

📋 Qué debe hacer en este momento:
1. Llame de inmediato a los servicios de emergencia (108 / 911).
2. Se ha emitido una ALERTA DE GUARDIÁN a sus familiares registrados con su ubicación en vivo.
3. Permanezca sentado en reposo absoluto; no camine ni conduzca.`;
    } else if (lang === 'bn') {
      message = `🚨 অবিলম্বে জরুরি হাসপাতালে যোগাযোগ করুন (SEEK EMERGENCY CARE NOW)

আপনার উল্লিখিত লক্ষণগুলো অত্যন্ত সংকটজনক জরুরি চিকিৎসাগত সতর্কবার্তা নির্দেশ করছে।

👨‍⚕️ যে ডাক্তারের পরামর্শ নেওয়া জরুরি:
• প্রস্তাবিত বিশেষজ্ঞ: ${specialist}।
• বিভাগ: ${recDept}।
• কারণ: বুকে তীব্র ব্যথা বা স্ট্রোকের লক্ষণের ক্ষেত্রে গোল্ডেন আওয়ারের মধ্যে চিকিৎসা শুরু করা জীবনরক্ষাকারী।

📋 আপনার অবিলম্বে করণীয় পদক্ষেপ:
1. অবিলম্বে ১০৮ বা জরুরি অ্যাম্বুলেন্স ডাকুন।
2. আপনার নিবন্ধিত অভিভাবককে (Guardian) সরাসরি সতর্কবার্তা ও লোকেশন পাঠানো হয়েছে।
3. শান্ত থাকুন এবং বসে পূর্ণ বিশ্রাম নিন। কোনো নড়াচড়া করবেন না।`;
    } else {
      message = `🚨 SEEK EMERGENCY CARE NOW

Your description contains critical clinical signs requiring immediate in-person hospital evaluation.

👨‍⚕️ Recommended Specialist to Consult:
• Specialist: ${specialist}
• Department: ${recDept}
• Why Consult: Life-threatening cardiovascular, stroke, or airway emergencies require immediate resuscitation, ICU monitoring, and emergency intervention.

📋 What You Should Do Right Now (Immediate Protocol):
1. Dial emergency medical services (108 / 911) or proceed immediately to the nearest Emergency Department.
2. A GUARDIAN EMERGENCY ALERT has been automatically dispatched to your registered family guardian with your live location.
3. Stay calm and rest in a supported semi-upright posture. Do not exert yourself, walk, or drive.
4. Do not ingest food or liquids until clinically evaluated.`;
    }

    return {
      isEmergency: true,
      severity: 'critical',
      specialist,
      doctorRecommendation: {
        specialtyName: specialist,
        department: recDept,
        doctorTypeDesc: recDesc,
        whyConsult: recWhy,
        suggestedActionTimeline: "IMMEDIATE EMERGENCY (< 10 Mins)",
        bookingUrl: "/patient/hospitals?specialty=Emergency",
        callNumber: "108"
      },
      message,
      guardianAlertTriggered: true,
      guardianAlertMessage: guardianAlertText,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: isCardiac ? 'cardiac' : isStroke ? 'stroke' : 'trauma'
    };
  }

  // =========================================================================
  // 2. COUGH & COLD & SORE THROAT (with Hot Water & Aaviri Pattadam Remedies!)
  // =========================================================================
  if (isCoughQuery) {
    const coughMeds: TriageMedicineItem[] = [
      {
        name: "Benadryl DR Cough Syrup (100ml)",
        category: "Antitussive Cough Relief",
        dosage: "10ml (2 teaspoons) every 6-8 hours after warm meals. Soothes dry cough & scratchy throat.",
        online_apps: [
          { app_id: "apollo", price: 125, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/benadryl-cough-syrup", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 118, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=benadryl+cough+syrup", logo_color: "bg-red-600" },
          { app_id: "pharmeasy", price: 115, discount_percent: 22, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=benadryl+cough+syrup", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Alex Sugar-Free Cough Syrup (100ml)",
        category: "Expectorant & Mucolytic",
        dosage: "10ml thrice daily with warm water. Clears chest congestion and dissolves thick phlegm.",
        online_apps: [
          { app_id: "apollo", price: 138, discount_percent: 12, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/alex-syrup", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 130, discount_percent: 18, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=alex+syrup", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Strepsils Warm Ginger & Honey Lozenges (Strip of 8)",
        category: "Throat Soothing Antiseptic",
        dosage: "Dissolve 1 lozenge slowly in mouth every 3-4 hours. Do not chew or swallow whole.",
        online_apps: [
          { app_id: "apollo", price: 42, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/strepsils", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 39, discount_percent: 16, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=strepsils", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Vicks VapoRub & Steam Inhaler (50g)",
        category: "Decongestant Balm",
        dosage: "Add half teaspoon to boiling water for steam inhalation (aaviri) or gently rub on chest & throat.",
        online_apps: [
          { app_id: "apollo", price: 145, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/vicks-vaporub", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 138, discount_percent: 15, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=vicks+vaporub", logo_color: "bg-red-600" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `🍵 దగ్గు, జలుబు & గొంతు నొప్పి నివారణోపాయాలు (Cough & Throat Remedies):

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• పల్మనాలజిస్ట్ (Pulmonologist / ఊపిరితిత్తుల నిపుణులు) లేదా ఈఎన్‌టీ స్పెషలిస్ట్ (ENT Specialist / చెవి, ముక్కు, గొంతు నిపుణులు).
• ఎందుకు సంప్రదించాలి: సాధారణ జలుబు 3-5 రోజుల్లో తగ్గకపోతే, కఫంలో రంగు మార్పు (పసుపు లేదా ఆకుపచ్చ) వచ్చినా, లేదా శ్వాసలో పిల్లికూతలు (wheezing) ఉంటే ఛాతీలో బ్రాంకైటిస్ ఇన్ఫెక్షన్ ఉండవచ్చు. సరైన స్టెతస్కోప్ మరియు చెస్ట్ ఎక్స్-రే పరీక్ష కోసం పల్మనాలజిస్ట్ ఉత్తమం.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (తక్షణ గృహ చికిత్స & వేడి నీరు):
   • రోజంతా తరచుగా వేడి నీళ్లు లేదా గోరువెచ్చని నీరు త్రాగండి. చల్లని లేదా ఫ్రిజ్ నీరు అస్సలు ముట్టవద్దు.
   • రోజుకు 2 సార్లు తులసి ఆకులు లేదా విక్స్ వేసి 10-15 నిమిషాలు గాఢంగా ఆవిరి పట్టండి (aaviri pattadam). ఇది ముక్కు దిబ్బడ మరియు ఛాతీ కఫాన్ని తక్షణమే కరిగిస్తుంది.
   • ఒక గ్లాసు గోరువెచ్చని నీటిలో అర చెంచా ఉప్పు వేసి రోజుకు 3 సార్లు గొంతులో పుక్కిలించండి (salt water gargle).
   • రాత్రి పడుకునే ముందు వేడి పాలలో చిటికెడు పసుపు, మిరియాల పొడి వేసి త్రాగండి.

2. దశ 2 (ఓవర్ ది కౌంటర్ సురక్షిత మందులు):
   • పొడి దగ్గుకు: బెనాడ్రిల్ సిరప్ (Benadryl DR) 10ml రాత్రి పూట.
   • కఫం ఉన్న దగ్గుకు: అలెక్స్ సిరప్ (Alex Syrup) 10ml గోరువెచ్చని నీటితో.
   • గొంతు గరగరకు: స్ట్రెప్‌సిల్స్ (Strepsils) బిళ్ళను నోట్లో చప్పరించండి.
   (క్రింద ఉన్న Apollo 24/7, Tata 1mg ద్వారా 30 నిమిషాల్లో డెలివరీ పొందండి).

3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి / రెడ్ ఫ్లాగ్స్):
   • దగ్గు 5 రోజుల కంటే ఎక్కువ కొనసాగినా, జ్వరం 101°F దాటినా, లేదా శ్వాస తీసుకోవడంలో ఆయాసం వస్తే వెంటనే పల్మనాలజిస్ట్‌ను కలవండి.`;
    } else if (lang === 'hi') {
      message = `🍵 खांसी, जुकाम और गले के दर्द के लिए क्लिनिकल दिशानिर्देश व उपचार:

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• पल्मोनोलॉजिस्ट (Pulmonologist / फेफड़े व श्वसन विशेषज्ञ) या ईएनटी विशेषज्ञ (ENT Specialist)।
• परामर्श का कारण: यदि खांसी 5 दिनों से अधिक बनी रहे, कफ में पीलापन हो या सांस लेने में घरघराहट (wheezing) हो, तो छाती के संक्रमण की जांच के लिए पल्मोनोलॉजिस्ट सबसे उपयुक्त हैं।

📋 आपको अभी स्पष्ट रूप से क्या करना चाहिए (कदम-दर-कदम):
1. चरण 1 (घरेलू उपचार व भाप):
   • दिनभर गुनगुना या गर्म पानी पिएं। ठंडा पानी बिल्कुल न पिएं।
   • गर्म पानी में तुलसी या विक्स डालकर दिन में 2 बार 10-15 मिनट तक भाप (Steam Inhalation) लें। इससे बंद नाक और जकड़न तुरंत खुलती है।
   • गुनगुने पानी में नमक डालकर दिन में 3 बार गरारे (Salt Water Gargle) करें।
   • रात को सोने से पहले हल्दी और काली मिर्च वाला गर्म दूध पिएं।

2. चरण 2 (अनुशंसित सुरक्षित दवाएं):
   • सूखी खांसी के लिए: बेनाड्रिल सिरप (Benadryl DR) 10ml।
   • बलगम वाली खांसी के लिए: एलेक्स कफ सिरप (Alex Syrup) 10ml।
   • गले की खराश के लिए: स्ट्रेप्सिल्स (Strepsils) गोलियां चूसें।
   (नीचे दिए गए लिंक्स से अपोलो 24/7 या 1mg से तुरंत ऑर्डर करें)।

3. चरण 3 (डॉक्टर से कब मिलें):
   • यदि बुखार 101°F से ऊपर जाए या सांस फूलने लगे, तो तुरंत विशेषज्ञ से मिलें।`;
    } else if (lang === 'ta') {
      message = `🍵 இருமல், சளி மற்றும் தொண்டை வலிக்கான மருத்துவ வழிகாட்டுதல்:

👨‍⚕️ நீங்கள் அணுக வேண்டிய சரியான மருத்துவர்:
• நுரையீரல் நிபுணர் (Pulmonologist) அல்லது காது மூக்கு தொண்டை நிபுணர் (ENT Specialist).
• காரணம்: இருமல் 5 நாட்களுக்கு மேல் நீடித்தாலோ அல்லது நெஞ்சு சளி அதிகமானாலோ நுரையீரல் மருத்துவரை அணுகுவது சிறந்தது.

📋 நீங்கள் இப்போது என்ன செய்ய வேண்டும்:
1. படி 1 (வீட்டு வைத்தியம்): நாள் முழுவதும் வெந்நீர் குடிக்கவும். துளசி அல்லது தைலம் சேர்த்து ஆவி பிடிக்கவும் (Steam Inhalation). உப்பு நீரில் வாய் கொப்பளிக்கவும்.
2. படி 2 (மருந்துகள்): பெனாட்ரில் சிரப் அல்லது அலெக்ஸ் சிரப் மற்றும் ஸ்ட்ரெப்சில்ஸ் மாத்திரைகளை எடுத்துக்கொள்ளவும்.
3. படி 3: மூச்சுத்திணறல் ஏற்பட்டால் உடனே மருத்துவரை அணுகவும்.`;
    } else {
      message = `🍵 CLINICAL GUIDANCE & STEP-BY-STEP REMEDIES FOR COUGH & SORE THROAT:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: Pulmonologist (Chest & Respiratory Specialist) or ENT Specialist.
• Why Consult: If cough persists beyond 5 days, produces colored purulent phlegm, or causes chest wheezing/tightness, a Pulmonologist should evaluate your bronchi with auscultation and chest imaging to rule out bronchitis or pneumonia.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Immediate Home Remedies & Steam):
   • Sip warm water frequently throughout the day. Warm water liquefies bronchial secretions and soothes irritated mucosa. Avoid chilled water.
   • Practice steam inhalation (Aaviri Pattadam) for 10-15 minutes twice daily with tulsi leaves or eucalyptus/Vicks balm to decongest upper airways.
   • Gargle with warm salt water (half teaspoon salt in warm water) 3 times daily to reduce bacterial load.
   • Drink warm turmeric milk with a pinch of black pepper before sleep.

2. Step 2 (Safe OTC Clinical Medications):
   • For Dry Tickling Cough: Benadryl DR Cough Syrup (10ml after warm food).
   • For Chest Congestion & Phlegm: Alex Sugar-Free Syrup (10ml thrice daily).
   • For Throat Pain: Dissolve Strepsils Honey & Ginger lozenges.
   (Express 30-min home delivery available via Apollo 24/7, Tata 1mg, and PharmEasy below).

3. Step 3 (Red Flags & Clinic Visit):
   • Seek OPD appointment if fever exceeds 101°F, cough persists >5 days, or shortness of breath develops.`;
    }

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: 'Pulmonologist / ENT Specialist',
      doctorRecommendation: {
        specialtyName: "Pulmonologist / ENT Specialist",
        department: "Pulmonology & Respiratory Medicine",
        doctorTypeDesc: "Specialist in acute bronchitis, persistent coughing, bronchial asthma, and airway allergies.",
        whyConsult: "Recommended if coughing lasts beyond 5 days, causes breathlessness, or produces discolored phlegm.",
        suggestedActionTimeline: "Consult within 24-48 hours if symptoms do not improve",
        bookingUrl: "/patient/doctors?department=Pulmonology",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: coughMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'cough_cold'
    };
  }

  // =========================================================================
  // 3. DIGESTION / ACIDITY / GAS (with Vaamu / Carom seeds remedies!)
  // =========================================================================
  if (isDigestionQuery) {
    const digestionMeds: TriageMedicineItem[] = [
      {
        name: "Gelusil MPS Antacid Suspension (200ml Mint)",
        category: "Fast Antacid & Anti-Gas",
        dosage: "1-2 teaspoons (5-10ml) 30 minutes after meals or when acidity strikes. Shakes well before use.",
        online_apps: [
          { app_id: "apollo", price: 142, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/gelusil-mps-syrup", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 135, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=gelusil+mps+syrup", logo_color: "bg-red-600" },
          { app_id: "pharmeasy", price: 130, discount_percent: 22, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=gelusil+mps+syrup", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Dabur Pudin Hara Pearls (Strip of 10)",
        category: "Herbal Carminative & Stomach Cooler",
        dosage: "Take 1 pearl with half glass of water. Fast relief from stomach ache, gas, and burning sensation.",
        online_apps: [
          { app_id: "apollo", price: 30, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/pudin-hara-pearls", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 28, discount_percent: 14, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=pudin+hara+pearls", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Digene Acidity & Gas Relief Chewable Tablets (15 Tabs)",
        category: "Chewable Antacid",
        dosage: "Chew 2 tablets after heavy meals. Neutralizes excess stomach acid in seconds.",
        online_apps: [
          { app_id: "apollo", price: 26, discount_percent: 12, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/digene-tablets", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 24, discount_percent: 15, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=digene+tablets", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Eno Fruit Salt Fast 6-Sec Relief (Lemon 100g)",
        category: "Effervescent Antacid",
        dosage: "Dissolve 1 teaspoon (5g) in a glass of water and drink immediately.",
        online_apps: [
          { app_id: "apollo", price: 160, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/eno-fruit-salt", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 152, discount_percent: 15, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=eno+fruit+salt", logo_color: "bg-red-600" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `🍃 జీర్ణ సమస్య, అజీర్ణం & గ్యాస్ నివారణోపాయాలు (Digestion & Acidity Remedies):

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• గ్యాస్ట్రోఎంటరాలజిస్ట్ (Gastroenterologist / జీర్ణకోశ, కడుపు & కాలేయ నిపుణులు) లేదా జనరల్ ఫిజీషియన్ (General Physician).
• ఎందుకు సంప్రదించాలి: తరచుగా వచ్చే ఎసిడిటీ, పుల్లటి తేన్పులు, కడుపులో తీవ్రమైన మంట, గ్యాస్ట్రిక్ అల్సర్ లేదా ఇరిటబుల్ బౌల్ సిండ్రోమ్ (IBS) సమస్యలను గుర్తించి సరైన చికిత్స అందించడానికి గ్యాస్ట్రోఎంటరాలజిస్ట్‌ను సంప్రదించడం మంచిది.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (వాము & సహజ గృహ నివారణలు):
   • అజీర్ణం అయినప్పుడు (digestion avvakapothe): అర చెంచా వాము (Ajwain/Vaamu) మరియు చిటికెడు రాతి ఉప్పు వేసి బాగా నమిలి, ఆ తర్వాత ఒక గ్లాసు గోరువెచ్చని నీళ్లు త్రాగండి. వాములోని 'థైమోల్' జీర్ణ రసాలను వేగవంతం చేసి నిమిషాల్లో కడుపు ఉబ్బరం మరియు గ్యాస్‌ను మాయం చేస్తుంది!
   • జీలకర్ర మరియు సోంపు వేసి మరిగించిన నీటిని గోరువెచ్చగా త్రాగండి.
   • భోజనం తర్వాత ఒక గ్లాసు తాజా పల్చటి మజ్జిగలో చిటికెడు ఇంగువ, వేయించిన జీలకర్ర పొడి వేసి త్రాగండి.

2. దశ 2 (ఓవర్ ది కౌంటర్ ఆన్‌లైన్ మందులు):
   • జెలుసిల్ సిరప్ (Gelusil MPS - 2 చెంచాలు భోజనం తర్వాత) లేదా డైజీన్ టాబ్లెట్లు.
   • తక్షణ రిలీఫ్ కోసం పుదీన్ హర (Pudin Hara) లేదా ఈనో (Eno) తీసుకోండి.
   (క్రింద ఇచ్చిన Apollo 24/7, Tata 1mg ద్వారా వెంటనే ఆర్డర్ చేసుకోవచ్చు).

3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి):
   • విపరీతమైన కడుపు నొప్పి, రక్తపు వాంతులు, లేదా 3 రోజులకు మించి ఆహారం అరగకపోతే వెంటనే గ్యాస్ట్రోఎంటరాలజిస్ట్‌ను సంప్రదించండి.`;
    } else if (lang === 'hi') {
      message = `🍃 अपच, गैस और एसिडिटी के क्लिनिकल उपचार व मार्गदर्शन:

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• गैस्ट्रोएंटेरोलॉजिस्ट (Gastroenterologist / पेट व पाचन रोग विशेषज्ञ) या जनरल फिजिशियन।
• परामर्श का कारण: बार-बार सीने में जलन, खट्टी डकारें, पेट में भारीपन या गैस्ट्रिक अल्सर के सटीक निदान के लिए पेट रोग विशेषज्ञ से परामर्श सर्वोत्तम है।

📋 आपको अभी स्पष्ट रूप से क्या करना चाहिए (कदम-दर-कदम):
1. चरण 1 (अजवाइन व घरेलू उपचार):
   • जब खाना हजम न हो या पेट फूला लगे: आधा चम्मच अजवाइन (Carom seeds) में चुटकी भर काला नमक मिलाकर अच्छी तरह चबाएं और ऊपर से एक गिलास गुनगुना पानी पिएं। अजवाइन का थाइमोल एंजाइम कुछ ही मिनटों में गैस और ऐंठन से तुरंत राहत दिलाता है!
   • जीरा और सौंफ का उबला गुनगुना पानी पिएं।
   • ताजा छाछ में भुनी हींग और भुना जीरा मिलाकर पिएं।

2. चरण 2 (अनुशंसित एंटासिड दवाएं):
   • जेलुसिल सिरप (Gelusil MPS) 2 चम्मच भोजन के बाद लें।
   • पुदीन हरा कैप्सूल या ईनो फ्रूट सॉल्ट लें।
   (नीचे दिए गए लिंक्स से अपोलो 24/7 या 1mg से तुरंत ऑर्डर करें)।

3. चरण 3 (डॉक्टर से कब मिलें):
   • यदि पेट में तेज चुभन वाला दर्द हो या उल्टी हो, तो तुरंत गैस्ट्रोएंटेरोलॉजिस्ट से मिलें।`;
    } else if (lang === 'ta') {
      message = `🍃 அஜீரணம், அமிலத்தன்மை மற்றும் வாய்வு தொல்லைக்கான தீர்வுகள்:

👨‍⚕️ நீங்கள் அணுக வேண்டிய சரியான மருத்துவர்:
• இரைப்பை குடல் நிபுணர் (Gastroenterologist) அல்லது பொது மருத்துவர்.
• காரணம்: தொடர் அஜீரணம் மற்றும் நெஞ்செரிச்சல் பிரச்சனைகளுக்கு இரைப்பை மருத்துவர் முறையான சிகிச்சை அளிப்பார்.

📋 நீங்கள் இப்போது என்ன செய்ய வேண்டும்:
1. படி 1 (ஓமம் மற்றும் வெந்நீர்): செரிமானம் ஆகாதபோது, சிறிது ஓமத்துடன் சிட்டிகை இந்துப்பு சேர்த்து மென்று தின்று வெந்நீர் குடிக்கவும். இது உடனடியாக வாயுவை வெளியேற்றி வயிற்றை இலகுவாக்கும்.
2. படி 2 (மருந்துகள்): ஜெலுசில் சிரப், புதின் ஹரா அல்லது ஈனோ உட்கொள்ளவும்.
3. படி 3: கடுமையான வயிற்று வலி நீடித்தால் உடனே மருத்துவரை அணுகவும்.`;
    } else {
      message = `🍃 CLINICAL GUIDANCE & STEP-BY-STEP REMEDIES FOR INDIGESTION & ACIDITY:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: Gastroenterologist (Digestive & Liver Specialist) or Family Physician.
• Why Consult: If acidity, heartburn, bloating, or stomach heaviness recurs regularly, a Gastroenterologist can evaluate for GERD, gastric ulcers, H. pylori infection, or gallbladder sluggishness.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Carom Seeds / Vaamu Remedy & Home First Aid):
   • In acute indigestion: Chew half a teaspoon of carom seeds (Vaamu / Ajwain) with a pinch of rock salt, followed by a glass of warm water. The natural active enzyme 'thymol' rapidly stimulates gastric enzymes and dispels trapped abdominal gas within minutes!
   • Sip warm boiled cumin (jeera) and fennel (saunf) infusion to neutralize burning acid reflux.
   • Drink fresh diluted buttermilk with a pinch of asafoetida (hing) and roasted cumin.

2. Step 2 (Safe OTC Antacids & Carminatives):
   • Rapid Acid Buffer: Gelusil MPS Antacid Suspension (1-2 teaspoons 30 mins after food).
   • Herbal Gas Relief: Dabur Pudin Hara pearls with water.
   • Instant Alkaline Relief: Eno Fruit Salt in water.
   (Express 30-min home delivery available via Apollo 24/7, Tata 1mg, and PharmEasy below).

3. Step 3 (Red Flags & Clinic Visit):
   • Seek a Gastroenterologist consultation if experiencing persistent severe abdominal colic, vomiting, dark stools, or difficulty swallowing.`;
    }

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: 'Gastroenterologist / Family Physician',
      doctorRecommendation: {
        specialtyName: "Gastroenterologist & Hepatologist",
        department: "Gastroenterology & Digestive Sciences",
        doctorTypeDesc: "Specialist in acid reflux (GERD), gastritis, irritable bowel, peptic ulcers, and abdominal colic.",
        whyConsult: "Recommended if bloating, burning acidity, or indigestion persists beyond 48 hours or resists OTC antacids.",
        suggestedActionTimeline: "OPD consultation within 24-48 hours",
        bookingUrl: "/patient/doctors?department=Gastroenterology",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: digestionMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'digestion_acidity'
    };
  }

  // =========================================================================
  // 4. GENERAL MEDICINE BUYING INTENT ("medicines", "show medicines to buy")
  // =========================================================================
  if (isDirectMedicineQuery) {
    const generalTopMeds: TriageMedicineItem[] = [
      {
        name: "Dolo 650 (Paracetamol 650mg - Strip of 15)",
        category: "Fever, Headache & Body Ache Relief",
        dosage: "1 tablet every 6-8 hours with food as needed. Safe and effective antipyretic.",
        online_apps: [
          { app_id: "apollo", price: 32, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/dolo-650", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 30, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=dolo+650", logo_color: "bg-red-600" },
          { app_id: "pharmeasy", price: 29, discount_percent: 22, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=dolo+650", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Benadryl DR Cough Formula (100ml)",
        category: "Cough & Throat Irritation Syrup",
        dosage: "10ml after warm water. Clears tickling cough and throat congestion.",
        online_apps: [
          { app_id: "apollo", price: 125, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/benadryl-cough-syrup", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 118, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=benadryl+cough+syrup", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Gelusil MPS Antacid Suspension (200ml Mint)",
        category: "Acidity, Heartburn & Gas Relief",
        dosage: "1-2 teaspoons after food or before bedtime. Rapid acid buffer.",
        online_apps: [
          { app_id: "apollo", price: 142, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/gelusil-mps-syrup", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 130, discount_percent: 22, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=gelusil-mps-syrup", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Electral WHO Oral Rehydration Salts (ORS 21.8g)",
        category: "Electrolyte Hydration & Weakness",
        dosage: "Dissolve 1 full sachet in 1 Litre drinking water. Sip continuously.",
        online_apps: [
          { app_id: "apollo", price: 22, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/electral", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 21, discount_percent: 14, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=electral", logo_color: "bg-red-600" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `💊 ఆన్‌లైన్ మెడిసిన్ బుకింగ్ & స్పెషలిస్ట్ వైద్యుల సిఫార్సులు:

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• జనరల్ ఫిజీషియన్ (General Physician / ప్రాథమిక ఆరోగ్య వైద్యులు).
• ఎందుకు సంప్రదించాలి: ఓవర్ ది కౌంటర్ మందులు తాత్కాలిక ఉపశమనాన్ని ఇస్తాయి, కానీ ఖచ్చితమైన రోగ నిర్ధారణ, సరైన మోతాదు (dosage), మరియు ఇతర మందులతో దుష్ప్రభావాలు లేకుండా చూసుకోవడానికి ఒక ఫిజీషియన్ సలహా ఉత్తమం.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (సమస్యకు తగిన మందును గుర్తించండి):
   • దగ్గు/జలుబు: వేడి నీళ్లు + ఆవిరి పట్టడం (aaviri pattadam), బెనాడ్రిల్ సిరప్.
   • అజీర్ణం/గ్యాస్: వాము (vaamu) నమిలి గోరువెచ్చని నీళ్లు త్రాగడం, జెలుసిల్ సిరప్ లేదా పుదీన్ హర.
   • జ్వరం/నొప్పులు: డోలో 650 (Dolo 650) ఆహారం తిన్న తర్వాత.
   • నీరసం/విరేచనాలు: ఎలక్ట్రాల్ ORS ద్రావణం.
2. దశ 2 (ఆన్‌లైన్ ఫార్మసీల నుండి ఆర్డర్ చేయండి):
   క్రింద ఉన్న Apollo 24/7 (30 నిమిషాల ఎక్స్‌ప్రెస్ డెలివరీ), Tata 1mg, లేదా PharmEasy బటన్లను నొక్కి డిస్కౌంట్‌తో నేరుగా ఆర్డర్ చేసుకోండి.
3. దశ 3 (వైద్యుడితో మాట్లాడండి):
   మందులతో పాటు అవసరమైతే కింద ఉన్న బటన్ ద్వారా జనరల్ ఫిజీషియన్‌తో టెలి-ఓపీడీ బుక్ చేసుకోండి.`;
    } else if (lang === 'hi') {
      message = `💊 ऑनलाइन दवा बुकिंग और विशेषज्ञ डॉक्टर परामर्श:

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• जनरल फिजिशियन (General Physician / पारिवारिक चिकित्सक)।
• परामर्श का कारण: ओटीसी दवाएं त्वरित राहत देती हैं, लेकिन सटीक खुराक व सही पर्चे के लिए फिजिशियन की राय जरूरी है।

📋 आपको अभी स्पष्ट रूप से क्या करना चाहिए (कदम-दर-कदम):
1. चरण 1: अपनी समस्या के अनुसार दवा चुनें (खांसी के लिए गर्म पानी + बेनाड्रिल, अपच के लिए अजवाइन + जेलुसिल, बुखार के लिए डोलो 650)।
2. चरण 2: नीचे दिए गए अपोलो 24/7 (30-मिनट एक्सप्रेस), 1mg या फार्मेसी लिंक्स से सीधे दवा मंगवाएं।
3. चरण 3: यदि लक्षण 2 दिन से अधिक रहें, तो तुरंत फिजिशियन से परामर्श बुक करें।`;
    } else {
      message = `💊 VERIFIED ONLINE MEDICINE BOOKING & CLINICAL GUIDANCE:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: General Physician / Family Medicine Practitioner.
• Why Consult: While OTC medicines provide rapid symptom relief, consulting a General Physician ensures proper dosing, checks for drug interactions, and confirms the root clinical cause.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Select Targeted First-Line Remedies):
   • For Cough/Cold: Warm water + steam inhalation (aaviri) + Benadryl DR syrup.
   • For Indigestion/Gas: Carom seeds (Vaamu / Ajwain) with warm water + Gelusil MPS suspension.
   • For Fever/Body Ache: Dolo 650 (Paracetamol) after food + WHO ORS hydration.
2. Step 2 (Direct Order via Express Pharmacy Apps):
   Tap any store button below to instantly order with verified discounts (⚡ 30-min express via Apollo 24/7, Tata 1mg, PharmEasy).
3. Step 3 (Book Follow-Up Consultation):
   Use the doctor card below to book an OPD visit or initiate a telemedicine call if symptoms do not resolve within 48 hours.`;
    }

    return {
      isEmergency: false,
      severity: 'low',
      specialist: 'General Physician / Certified Pharmacist',
      doctorRecommendation: {
        specialtyName: "General Physician & Internal Medicine",
        department: "Outpatient Family Medicine",
        doctorTypeDesc: "Primary diagnostic evaluation, comprehensive prescription verification, and wellness counseling.",
        whyConsult: "Recommended for verifying drug safety, diagnosing underlying conditions, and reviewing chronic medications.",
        suggestedActionTimeline: "Routine OPD / Teleconsultation",
        bookingUrl: "/patient/doctors?department=General+Medicine",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: generalTopMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'medicines_general'
    };
  }

  // =========================================================================
  // 5. FEVER / INFECTION EVALUATION
  // =========================================================================
  if (isFeverQuery || isHighUrgency) {
    const feverMeds: TriageMedicineItem[] = [
      {
        name: "Dolo 650 (Paracetamol 650mg - Strip of 15)",
        category: "Analgesic & Antipyretic",
        dosage: "1 tablet every 6 hours with food. Do not exceed 4 tablets in 24 hours.",
        online_apps: [
          { app_id: "apollo", price: 32, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/dolo-650", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 30, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=dolo+650", logo_color: "bg-red-600" },
          { app_id: "pharmeasy", price: 29, discount_percent: 22, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=dolo+650", logo_color: "bg-teal-700" }
        ]
      },
      {
        name: "Electral WHO Formula ORS (21.8g Sachet)",
        category: "Oral Rehydration Salts",
        dosage: "Mix 1 sachet in 1 Litre boiled & cooled water. Sip continuously throughout the day.",
        online_apps: [
          { app_id: "apollo", price: 22, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/electral", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 21, discount_percent: 14, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=electral", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Dr. Morepen Digital Clinical Thermometer",
        category: "Medical Diagnostic Tool",
        dosage: "Record oral or axillary temperature every 4-6 hours. Seek urgent care if above 102.5°F.",
        online_apps: [
          { app_id: "apollo", price: 185, discount_percent: 30, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/thermometer", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 175, discount_percent: 35, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=thermometer", logo_color: "bg-red-600" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `🌡️ జ్వరం మరియు శరీర ఉష్ణోగ్రత నిర్వహణ (Fever Management):

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• జనరల్ ఫిజీషియన్ (General Physician / సాధారణ వైద్యులు) లేదా ఇంటర్నల్ మెడిసిన్ స్పెషలిస్ట్.
• ఎందుకు సంప్రదించాలి: జ్వరం 101°F దాటినా లేదా 48 గంటలకు మించి కొనసాగినా డెంగ్యూ, మలేరియా, లేదా టైఫాయిడ్ వంటి ఇన్ఫెక్షన్ల స్క్రీనింగ్ కొరకు రక్త పరీక్షలు (CBC, Widal) సూచించడానికి ఫిజీషియన్ అత్యవసరం.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (బాహ్య శీతలీకరణ & విశ్రాంతి):
   • శరీర ఉష్ణోగ్రత 101°F దాటితే నుదిటిపై సాధారణ నీటిలో ముంచిన తడి గుడ్డ పట్టీలు వేయండి (మంచు ముక్కలు వాడవద్దు).
   • పూర్తి విశ్రాంతి తీసుకోండి. గదిలో గాలి వెలుతురు ఉండేలా చూసుకోండి.
2. దశ 2 (మందులు & ద్రవపదార్థాలు):
   • డోలో 650 (Dolo 650) టాబ్లెట్ భోజనం తర్వాత మాత్రమే వేసుకోండి (24 గంటల్లో 3-4 కంటే ఎక్కువ వేయవద్దు).
   • జ్వరం వల్ల వచ్చే డీహైడ్రేషన్ తగ్గించడానికి ఎలక్ట్రాల్ ORS, కొబ్బరి నీళ్లు, లేదా పల్చటి గంజి తరచుగా తాగుతూ ఉండండి.
3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి / రెడ్ ఫ్లాగ్స్):
   • జ్వరం 102.5°F దాటినా, చలి వణుకు ఉన్నా, లేదా విపరీతమైన తలనొప్పి, వాంతులు ఉంటే వెంటనే ఆసుపత్రికి వెళ్ళండి.`;
    } else if (lang === 'hi') {
      message = `🌡️ बुखार और बदन दर्द के लिए क्लिनिकल दिशानिर्देश व उपचार:

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• जनरल फिजिशियन (General Physician / आंतरिक चिकित्सा विशेषज्ञ)।
• परामर्श का कारण: यदि बुखार 101°F से अधिक हो या 2 दिन से अधिक रहे, तो वायरल, डेंगू या टाइफाइड की जांच (सीबीसी टेस्ट) के लिए फिजिशियन से मिलना जरूरी है।

📋 आपको अभी स्पष्ट रूप से क्या करना चाहिए (कदम-दर-कदम):
1. चरण 1: माथे पर सामान्य पानी की गीली पट्टी रखें। भरपूर आराम करें।
2. चरण 2: भोजन के बाद डोलो 650 (Dolo 650) लें। इलेक्ट्राल ओआरएस और नारियल पानी पीकर शरीर को हाइड्रेटेड रखें।
3. चरण 3: यदि बुखार 102.5°F पार करे या कंपकंपी छूटे, तो तुरंत अस्पताल पहुंचें।`;
    } else {
      message = `🌡️ CLINICAL FEVER & INFECTION MANAGEMENT PROTOCOL:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: General Physician / Internal Medicine Specialist.
• Why Consult: Essential if temperature persists beyond 48 hours or exceeds 101°F, to order targeted diagnostic lab work (CBC, Dengue NS1, Typhoid serology) and rule out systemic infections.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Physical Cooling & Rest):
   • Place room-temperature damp compresses across the forehead and neck if temperature exceeds 101°F. Never use ice baths.
   • Rest completely in a well-ventilated room.
2. Step 2 (Safe Antipyretics & Hydration):
   • Take Dolo 650 (Paracetamol 650mg) strictly after meals (max 3-4 tablets in 24 hours).
   • Drink WHO-formula ORS solution, clear broths, and tender coconut water to counteract febrile dehydration.
3. Step 3 (Red Flags & Clinic Visit):
   • Seek in-person emergency care if fever exceeds 102.5°F, or is accompanied by stiff neck, shortness of breath, confusion, or persistent vomiting.`;
    }

    return {
      isEmergency: false,
      severity: isHighUrgency ? 'high' : 'medium',
      specialist: 'Urgent Care / General Physician',
      doctorRecommendation: {
        specialtyName: "General Physician & Infectious Diseases",
        department: "Internal Medicine & Acute Fever Clinic",
        doctorTypeDesc: "Specialist in viral fevers, seasonal infectious screening, and antipyretic pharmacotherapy.",
        whyConsult: "Recommended if fever persists over 48 hours, exceeds 101.5°F, or produces intense rigors.",
        suggestedActionTimeline: isHighUrgency ? "Same-day Urgent Consultation" : "Within 24 hours",
        bookingUrl: "/patient/doctors?department=General+Medicine",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: isHighUrgency,
      guardianAlertMessage: isHighUrgency ? "⚠️ High Urgency Health Alert: Acute fever detected. Guardian notified." : undefined,
      recommendedMedicines: feverMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'fever'
    };
  }

  // =========================================================================
  // 6. HEADACHE / MIGRAINE
  // =========================================================================
  if (isHeadacheQuery) {
    const headacheMeds: TriageMedicineItem[] = [
      {
        name: "Saridon Headache Relief Tablet (Strip of 10)",
        category: "Triple Action Headache Relief",
        dosage: "1 tablet with water. Fast relief from tension headaches within 15-30 minutes.",
        online_apps: [
          { app_id: "apollo", price: 45, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/saridon", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 42, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=saridon", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Amrutanjan Extra Power Pain Balm (50g)",
        category: "Topical Herbal Balm",
        dosage: "Gently massage a small amount onto forehead and temples for rapid cooling relief.",
        online_apps: [
          { app_id: "apollo", price: 110, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/amrutanjan", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 102, discount_percent: 15, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=amrutanjan", logo_color: "bg-teal-700" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `💆 తలనొప్పి & మైగ్రేన్ ఉపశమన చిట్కాలు:

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• న్యూరాలజిస్ట్ (Neurologist / నాడీ & మెదడు నిపుణులు) లేదా జనరల్ ఫిజీషియన్.
• ఎందుకు సంప్రదించాలి: తరచుగా వచ్చే మైగ్రేన్లు, తల తిరగడం, లేదా ఒకవైపు తీవ్రంగా గుచ్చుతున్నట్లు నొప్పి ఉంటే నాడీ సంబంధిత పరీక్షల కోసం న్యూరాలజిస్ట్‌ను సంప్రదించాలి.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (చీకటి, నిశ్శబ్ద ప్రదేశంలో విశ్రాంతి): ఫోన్లు, ల్యాప్‌టాప్‌లు ఆపి, లైట్లు తగ్గించి 30 నిమిషాలు కళ్ళు మూసుకుని విశ్రాంతి తీసుకోండి. 2 పెద్ద గ్లాసుల నీరు త్రాగండి (డీహైడ్రేషన్ తలనొప్పికి ప్రధాన కారణం).
2. దశ 2 (బామ్ & ఓవర్ ది కౌంటర్ ఉపశమనం): నుదిటిపై అమృతాంజనం లేదా పెప్పర్‌మింట్ బామ్ రాసి మసాజ్ చేయండి. అవసరమైతే సారిడాన్ (Saridon) లేదా డోలో 650 టాబ్లెట్ వేసుకోండి.
3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి): తలనొప్పితో పాటు వాంతులు, చూపు మందగించడం, లేదా మెడ బిగుసుకుపోతే వెంటనే అత్యవసర వైద్యుడిని కలవండి.`;
    } else {
      message = `💆 CLINICAL HEADACHE & MIGRAINE RELIEF PROTOCOL:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: Neurologist or Primary Care Physician.
• Why Consult: Essential for chronic migraine prophylaxis, cluster headache evaluation, or ruling out secondary hypertension/cranial causes.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Dark Sensory Rest & Hydration): Rest in a dark, quiet room away from digital screens. Drink 500ml water immediately (dehydration is the #1 headache trigger).
2. Step 2 (Topical Balm & OTC Relief): Apply cooling herbal balm (Amrutanjan) to temples. Take 1 Saridon or Paracetamol tablet if pain disrupts function.
3. Step 3 (Red Flags & Clinic Visit): Seek urgent neurology evaluation if accompanied by sudden "thunderclap" onset, visual aura loss, neck stiffness, or vomiting.`;
    }

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: 'Neurologist / General Physician',
      doctorRecommendation: {
        specialtyName: "Consultant Neurologist",
        department: "Neurology & Headache Clinic",
        doctorTypeDesc: "Specialist in chronic migraines, tension headaches, neuralgias, and intracranial vascular health.",
        whyConsult: "Recommended if headaches recur multiple times per week, involve visual aura, or do not respond to analgesics.",
        suggestedActionTimeline: "Consult within 48 hours",
        bookingUrl: "/patient/doctors?department=Neurology",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: headacheMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'headache'
    };
  }

  // =========================================================================
  // 7. DIARRHEA / LOOSE MOTIONS
  // =========================================================================
  if (isDiarrheaQuery) {
    const diarrheaMeds: TriageMedicineItem[] = [
      {
        name: "Electral WHO Formula ORS (21.8g Sachet)",
        category: "Oral Rehydration Salt",
        dosage: "Dissolve 1 sachet in 1 Litre water. Sip 1 glass after every loose stool.",
        online_apps: [
          { app_id: "apollo", price: 22, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/electral", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 21, discount_percent: 14, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=electral", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Enterogermina Probiotic Suspension (5ml Mini-Bottle)",
        category: "Gut Flora Restorer",
        dosage: "Take 1-2 mini-bottles per day. Restores natural intestinal bacterial flora.",
        online_apps: [
          { app_id: "apollo", price: 62, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/enterogermina", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 58, discount_percent: 15, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=enterogermina", logo_color: "bg-teal-700" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `💧 విరేచనాలు & డీహైడ్రేషన్ నివారణ:

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• గ్యాస్ట్రోఎంటరాలజిస్ట్ (Gastroenterologist / జీర్ణకోశ నిపుణులు) లేదా జనరల్ ఫిజీషియన్.
• ఎందుకు సంప్రదించాలి: తీవ్రమైన ఫుడ్ పాయిజనింగ్, బాక్టీరియల్ ఇన్ఫెక్షన్లు లేదా ఎలక్ట్రోలైట్ అసమతుల్యతను సరిచేయడానికి.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (ORS ద్రావణం): ప్రతిసారి విరేచనం అయిన తర్వాత ఒక గ్లాసు ఎలక్ట్రాల్ ORS ద్రావణం లేదా కొబ్బరి నీళ్లు త్రాగండి (నీటి శాతం పడిపోకుండా ఉండడం ప్రాణరక్షకం).
2. దశ 2 (తేలికపాటి ఆహారం & ప్రోబయోటిక్స్): కొద్దిగా ఉప్పు వేసిన వేడి బియ్యం గంజి, అరటిపండు, పెరుగన్నం తీసుకోండి. ఎంట్రోజెర్మినా (Enterogermina) ప్రోబయోటిక్ వాడండి.
3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి): విరేచనాలలో రక్తం కనిపించినా, కళ్ళు తిరుగుతున్నా వెంటనే ఆసుపత్రికి వెళ్ళండి.`;
    } else {
      message = `💧 CLINICAL DIARRHEA & REHYDRATION MANAGEMENT:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: Gastroenterologist / General Physician.
• Why Consult: Recommended for infectious enteritis, electrolyte profiling, and preventing hypovolemic dehydration.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Continuous Oral Rehydration): Sip 1 glass of WHO-formula ORS solution after every episode.
2. Step 2 (BRAT Diet & Probiotics): Eat Bananas, Rice kanji, and curd. Take Enterogermina probiotic suspension.
3. Step 3 (Red Flags & Clinic Visit): Seek urgent care if blood appears in stool, vomiting prevents fluid retention, or dizziness occurs.`;
    }

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: 'Gastroenterologist / Primary Care',
      doctorRecommendation: {
        specialtyName: "Gastroenterologist & Primary Care",
        department: "Digestive & Infectious Diseases",
        doctorTypeDesc: "Specialist in acute bacterial gastroenteritis, intestinal flora restoration, and fluid therapy.",
        whyConsult: "Essential if diarrhea lasts beyond 24 hours, exceeds 4 episodes per day, or induces severe weakness.",
        suggestedActionTimeline: "Same-day consultation",
        bookingUrl: "/patient/doctors?department=Gastroenterology",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: diarrheaMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'diarrhea'
    };
  }

  // =========================================================================
  // 8. SKIN RASH / ALLERGY
  // =========================================================================
  if (isSkinQuery) {
    const skinMeds: TriageMedicineItem[] = [
      {
        name: "Cetirizine 10mg (Zyrtec/Cetzine - 10 Tabs)",
        category: "Antihistamine Allergy Relief",
        dosage: "1 tablet at bedtime. Relieves allergic rash, itching, and hives.",
        online_apps: [
          { app_id: "apollo", price: 28, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/cetirizine-10mg", logo_color: "bg-emerald-700" },
          { app_id: "1mg", price: 25, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=cetirizine+10mg", logo_color: "bg-red-600" }
        ]
      },
      {
        name: "Lacto Calamine Skin Balancing Lotion (120ml)",
        category: "Soothing Anti-Itch Calamine",
        dosage: "Apply gently to affected rash area twice daily. Cools skin irritation.",
        online_apps: [
          { app_id: "apollo", price: 195, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/lacto-calamine", logo_color: "bg-emerald-700" },
          { app_id: "pharmeasy", price: 185, discount_percent: 20, delivery_eta: "⚡ 2-hour delivery", buy_url: "https://pharmeasy.in/search/all?name=lacto+calamine", logo_color: "bg-teal-700" }
        ]
      }
    ];

    let message = "";
    if (lang === 'te') {
      message = `🌿 చర్మ అలెర్జీ, దద్దుర్లు & దురద నివారణ:

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• డెర్మటాలజిస్ట్ (Dermatologist / చర్మ వ్యాధి & అలెర్జీ నిపుణులు).
• ఎందుకు సంప్రదించాలి: అలెర్జిక్ కాంటాక్ట్ డెర్మటైటిస్, ఫంగల్ ఇన్ఫెక్షన్లు, లేదా దద్దుర్ల మూల కారణాన్ని గుర్తించి సరైన ఆయింట్‌మెంట్లు సూచించడానికి డెర్మటాలజిస్ట్ సంప్రదింపు ఉత్తమం.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. దశ 1 (గోకవద్దు & చల్లని కంప్రెస్): దద్దుర్లు ఉన్న ప్రదేశంలో గోకడం లేదా రుద్దడం అస్సలు చేయవద్దు. చల్లని నీటితో కడిగి లాక్టో కలామిన్ లోషన్ లేదా కలబంద (Aloe Vera) జెల్ రాయండి.
2. దశ 2 (యాంటిహిస్టామైన్ మందులు): రాత్రి పడుకునే ముందు సిట్రిజిన్ (Cetirizine 10mg) మాత్ర వేసుకోండి (దురద మరియు వాపు తగ్గుతాయి).
3. దశ 3 (వైద్యుడిని ఎప్పుడు కలవాలి): పెదవులు, కనురెప్పలు లేదా గొంతు వాపు వస్తే, లేదా శ్వాసలో ఇబ్బంది ఉంటే వెంటనే ఎమర్జెన్సీ ఆసుపత్రికి వెళ్ళండి (అనాఫిలాక్సిస్ హెచ్చరిక).`;
    } else {
      message = `🌿 CLINICAL SKIN ALLERGY & RASH GUIDANCE:

👨‍⚕️ Which Doctor is Better to Consult:
• Specialist: Consultant Dermatologist.
• Why Consult: Essential to differentiate between urticaria, contact dermatitis, eczema, and fungal rashes for proper targeted topical therapeutics.

📋 What Should We Do Clearly in Words (Action Protocol):
1. Step 1 (Avoid Scratching & Cool Compress): Do not scratch (scratching causes secondary bacterial infection). Apply cool damp compresses and Lacto Calamine lotion.
2. Step 2 (Antihistamine Therapy): Take 1 Cetirizine 10mg tablet at bedtime to block histamine receptors and relieve pruritus.
3. Step 3 (Red Flags & Emergency): If rash spreads rapidly to face/lips or causes throat tightness or difficulty breathing, seek immediate emergency care (anaphylaxis danger).`;
    }

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: 'Dermatologist / Allergy Specialist',
      doctorRecommendation: {
        specialtyName: "Consultant Dermatologist",
        department: "Dermatology & Cutaneous Medicine",
        doctorTypeDesc: "Specialist in acute urticaria, contact dermatitis, fungal lesions, drug eruptions, and skin allergies.",
        whyConsult: "Recommended if rash expands, produces blisters, or does not improve within 48 hours of calamine application.",
        suggestedActionTimeline: "OPD consultation within 24-48 hours",
        bookingUrl: "/patient/doctors?department=Dermatology",
        callNumber: "1860-500-1066"
      },
      message,
      guardianAlertTriggered: false,
      recommendedMedicines: skinMeds,
      emergencyHotlines: COMMON_HOTLINES,
      detectedTopic: 'skin_rash'
    };
  }

  // =========================================================================
  // 9. DEFAULT / GENERAL WELLNESS
  // =========================================================================
  const generalMeds: TriageMedicineItem[] = [
    {
      name: "Dolo 650 (Paracetamol 650mg)",
      category: "Pain & Fever OTC",
      dosage: "1 tablet as needed with food.",
      online_apps: [
        { app_id: "apollo", price: 32, discount_percent: 15, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/dolo-650", logo_color: "bg-emerald-700" },
        { app_id: "1mg", price: 30, discount_percent: 20, delivery_eta: "🚚 Tomorrow morning", buy_url: "https://www.1mg.com/search/all?name=dolo+650", logo_color: "bg-red-600" }
      ]
    },
    {
      name: "Electral WHO Formula ORS",
      category: "Electrolyte Hydration",
      dosage: "Dissolve 1 sachet in 1 Litre water.",
      online_apps: [
        { app_id: "apollo", price: 22, discount_percent: 10, delivery_eta: "⚡ 30-min express", buy_url: "https://www.apollopharmacy.in/search-medicines/electral", logo_color: "bg-emerald-700" }
      ]
    }
  ];

  let fallbackMessage = "";
  if (lang === 'te') {
    fallbackMessage = `నమస్కారం! సైలెంట్ గార్డియన్ ఆరోగ్య సేవల సమాచారం:

👨‍⚕️ మీరు సంప్రదించాల్సిన సరైన వైద్యులు (Which Doctor is Better to Consult):
• జనరల్ ఫిజీషియన్ (General Physician / ప్రాథమిక సంరక్షణ వైద్యులు).
• ఎందుకు సంప్రదించాలి: ఏవైనా శారీరక అసౌకర్యాలు లేదా లక్షణాలు ప్రారంభమైనప్పుడు ప్రాథమిక ఆరోగ్య పరీక్షలు నిర్వహించడానికి.

📋 మీరు ఇప్పుడు ఏమి చేయాలి (What Should We Do Clearly in Words):
1. మీ లక్షణాలను స్పష్టంగా వివరించండి: దగ్గు, జలుబు, అజీర్ణం, జ్వరం, లేదా తలనొప్పి వంటి ఏ సమస్య ఉన్నా తెలపండి.
2. దగ్గు వస్తే: వేడి నీళ్లు త్రాగడం, ఆవిరి పట్టడం (aaviri pattadam).
3. అజీర్ణం అయితే: వాము (vaamu) నమిలి గోరువెచ్చని నీళ్లు త్రాగడం.
4. మందులు కొనడానికి: క్రింద ఉన్న ఆన్‌లైన్ ఫార్మసీల నుండి ఆర్డర్ చేయండి లేదా వైద్యుడితో మాట్లాడండి.`;
  } else if (lang === 'hi') {
    fallbackMessage = `नमस्ते! साइलेंट गार्डियन स्वास्थ्य मंच पर आपका स्वागत है।

👨‍⚕️ आपको किस डॉक्टर से परामर्श करना चाहिए:
• जनरल फिजिशियन (General Physician)।

📋 आपको अभी क्या करना चाहिए:
1. अपने लक्षण बताएं: खांसी, जुकाम, अपच, बुखार या दर्द।
2. खांसी के लिए: गर्म पानी और भाप (Steam)।
3. अपच के लिए: अजवाइन और गुनगुना पानी।
4. नीचे दिए गए ऑनलाइन विकल्पों से दवाएं मंगवाएं।`;
  } else {
    fallbackMessage = `Hello! Welcome to Silent Guardian Health Assistant.

👨‍⚕️ Which Doctor is Better to Consult:
• General Physician / Primary Care Doctor for initial screening and evaluation.

📋 What Should We Do Clearly in Words:
1. Describe your symptoms: cough, indigestion, fever, headache, or skin rash.
2. For cough/cold: sip warm water and take steam inhalation (aaviri).
3. For indigestion: chew carom seeds (vaamu/ajwain) with warm water.
4. For verified medicines: order via our express partners below.`;
  }

  return {
    isEmergency: false,
    severity: 'low',
    specialist: 'Primary Care Physician / Teleconsultation',
    doctorRecommendation: {
      specialtyName: "General Physician & Family Health",
      department: "Primary Care & Preventative Medicine",
      doctorTypeDesc: "First-line comprehensive health assessment, physical vitals checkup, and lab referral.",
      whyConsult: "Recommended for undifferentiated symptoms, general fatigue, or primary clinical diagnosis.",
      suggestedActionTimeline: "Routine OPD / Teleconsultation",
      bookingUrl: "/patient/doctors?department=General+Medicine",
      callNumber: "1860-500-1066"
    },
    message: fallbackMessage,
    guardianAlertTriggered: false,
    recommendedMedicines: generalMeds,
    emergencyHotlines: COMMON_HOTLINES,
    detectedTopic: 'general'
  };
}
