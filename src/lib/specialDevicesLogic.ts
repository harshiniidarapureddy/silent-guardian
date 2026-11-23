import type { AssistiveDeviceVisualKey } from "../types";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type AvailabilityType =
  | "Retail"
  | "Audiologist / Prescription Fitted"
  | "Hospital Bulk Supply"
  | "Government / NGO Subsidized Schemes";

export interface PurchaseChannel {
  id: string;
  name: string;
  channelType:
    | "Official Manufacturer Store"
    | "Certified Medical Supplier"
    | "Assistive-Tech Marketplace"
    | "Hospital Procurement Partner"
    | "Government / NGO Program";
  url: string;
  regionNote: string;
  fulfillmentNote: string;
}

export interface WhereToBuyGuide {
  id: string;
  deviceName: string;
  subtitle: string;
  estimatedPriceRange: string;
  bulkPriceRange?: string;
  availabilityTypes: AvailabilityType[];
  subsidyNote: string;
  channels: PurchaseChannel[];
}

export type HospitalDeviceCategory =
  | "Accessibility & Sensory"
  | "Vitals & Health Monitoring";

export interface HospitalSpecialDevice {
  id: string;
  guideId: string;
  category?: HospitalDeviceCategory;
  name: string;
  targetGroup: string;
  clinicalUse: string;
  visualKey: AssistiveDeviceVisualKey;
  totalStock: number;
  assignedUnits: number;
  lowStockThreshold: number;
  wardLocation: string;
  lastAudited: string;
}

export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const HOSPITAL_STOCK_KEY = "cp_hospital_special_devices_v2";
const LEGACY_HOSPITAL_STOCK_KEY = "cp_hospital_special_devices_v1";

export const WHERE_TO_BUY_GUIDES: Record<string, WhereToBuyGuide> = {
  "smart-vision-glasses": {
    id: "smart-vision-glasses",
    deviceName: "AI Smart Vision Glasses",
    subtitle: "Wearable OCR, medicine label reader, obstacle detection & hands-free voice guidance",
    estimatedPriceRange: "₹28,000 – ₹1,45,000 ($340 – $1,750)",
    bulkPriceRange: "₹22,500 / unit (Hospital 10+ kit procurement)",
    availabilityTypes: [
      "Retail",
      "Hospital Bulk Supply",
      "Government / NGO Subsidized Schemes",
    ],
    subsidyNote:
      "Eligible for partial reimbursement under India's ADIP (Assistance to Disabled Persons) Scheme and state assistive-vision NGO grants for verified visual impairment certificates.",
    channels: [
      {
        id: "ch-envision",
        name: "Envision Glasses Official Store",
        channelType: "Official Manufacturer Store",
        url: "https://www.letsenvision.com/glasses",
        regionNote: "Global & India clinical distribution",
        fulfillmentNote: "Includes onboarding session & 2-year hardware warranty",
      },
      {
        id: "ch-orcam",
        name: "OrCam MyEye Certified Clinical Partners",
        channelType: "Official Manufacturer Store",
        url: "https://www.orcam.com/en-us/orcam-myeye",
        regionNote: "Authorized eye-hospital partners across India",
        fulfillmentNote: "In-clinic fitting & low-vision specialist demo available",
      },
      {
        id: "ch-saksham",
        name: "Saksham Assistive Tech & Blindness Resource Center",
        channelType: "Assistive-Tech Marketplace",
        url: "https://saksham.org/",
        regionNote: "Pan-India NGO & assistive retail",
        fulfillmentNote: "Subsidized pricing & community orientation support",
      },
      {
        id: "ch-gem-med",
        name: "GeM & Certified Hospital Biomedical Procurement",
        channelType: "Hospital Procurement Partner",
        url: "https://gem.gov.in/",
        regionNote: "Institutional hospital bulk supply",
        fulfillmentNote: "GST-compliant biomedical tender & multi-unit ward kits",
      },
    ],
  },
  "digital-hearing-aids": {
    id: "digital-hearing-aids",
    deviceName: "Digital Hearing Aids & Pocket Amplifiers",
    subtitle: "Rechargeable Bluetooth LE hearing aids and instant ER bedside sound amplifiers",
    estimatedPriceRange: "₹6,500 – ₹68,000 ($80 – $820)",
    bulkPriceRange: "₹4,200 / unit (Pocket ER Amplifier ward packs)",
    availabilityTypes: [
      "Audiologist / Prescription Fitted",
      "Retail",
      "Hospital Bulk Supply",
      "Government / NGO Subsidized Schemes",
    ],
    subsidyNote:
      "Prescription digital BTE/RIC hearing aids should be fitted by a licensed audiologist. Free or subsidized units are available via ALIMCO / ADIP government camps.",
    channels: [
      {
        id: "ch-phonak",
        name: "Phonak / Signia Authorized Audiology Clinics",
        channelType: "Official Manufacturer Store",
        url: "https://www.phonak.com/",
        regionNote: "Certified audiology centers nationwide",
        fulfillmentNote: "Audiogram programming, MFi/ASHA Bluetooth pairing setup",
      },
      {
        id: "ch-alimco",
        name: "ALIMCO & ADIP Subsidized Hearing Devices",
        channelType: "Government / NGO Program",
        url: "https://www.alimco.in/",
        regionNote: "Government of India subsidized distribution",
        fulfillmentNote: "Low-cost digital BTE aids for eligible citizens",
      },
      {
        id: "ch-medikabazaar-hearing",
        name: "Medikabazaar Clinical Audiology & Amplifiers",
        channelType: "Certified Medical Supplier",
        url: "https://www.medikabazaar.com/",
        regionNote: "Hospital & clinic supply across India",
        fulfillmentNote: "Sanitizable pocket amplifiers for triage & ICU bays",
      },
    ],
  },
  "bone-conduction-headsets": {
    id: "bone-conduction-headsets",
    deviceName: "Bone-Conduction Audio Headsets",
    subtitle: "Open-ear directional voice guidance preserving ambient awareness in hospitals & streets",
    estimatedPriceRange: "₹7,999 – ₹18,500 ($95 – $220)",
    bulkPriceRange: "₹6,400 / unit (Hospital 15+ unit order)",
    availabilityTypes: ["Retail", "Hospital Bulk Supply"],
    subsidyNote:
      "Over-the-counter assistive audio hardware with wipeable medical-grade silicone finish suitable for shared hospital triage sanitization.",
    channels: [
      {
        id: "ch-shokz",
        name: "Shokz Official Open-Ear Store",
        channelType: "Official Manufacturer Store",
        url: "https://shokz.com/",
        regionNote: "Direct retail & clinical orders",
        fulfillmentNote: "IP55/IP67 wipe-clean models with 8–10h continuous battery",
      },
      {
        id: "ch-assistive-market-bc",
        name: "BarrierBreak Assistive Tech Solutions",
        channelType: "Assistive-Tech Marketplace",
        url: "https://www.barrierbreak.com/",
        regionNote: "India accessibility hardware partner",
        fulfillmentNote: "Enterprise & hospital inclusive kit fulfillment",
      },
      {
        id: "ch-med-supply-bc",
        name: "Certified Hospital Biomedical Distributors",
        channelType: "Hospital Procurement Partner",
        url: "https://www.medikabazaar.com/",
        regionNote: "Bulk procurement & invoice billing",
        fulfillmentNote: "Multi-bay charging docks & disposable earpad covers",
      },
    ],
  },
  "visual-vibrating-pagers": {
    id: "visual-vibrating-pagers",
    deviceName: "Visual & Vibrating Ward Alert Pagers",
    subtitle: "High-contrast LED strobe + haptic wristband & bedside pagers for Deaf patients",
    estimatedPriceRange: "₹4,800 – ₹16,500 ($60 – $200)",
    bulkPriceRange: "₹3,900 / unit (20-bed ward paging kit)",
    availabilityTypes: [
      "Hospital Bulk Supply",
      "Retail",
      "Government / NGO Subsidized Schemes",
    ],
    subsidyNote:
      "Recommended by NABH inclusive-hospital guidelines for emergency bays, maternity wards, and inpatient rooms serving Deaf or hard-of-hearing patients.",
    channels: [
      {
        id: "ch-bellman",
        name: "Bellman & Symfon Visit Alerting Systems",
        channelType: "Official Manufacturer Store",
        url: "https://bellman.com/",
        regionNote: "Clinical & home alerting systems",
        fulfillmentNote: "Wristband vibrator + flash receiver with nurse-call bridge",
      },
      {
        id: "ch-harris",
        name: "DigiLoft / Harris Communications Deaf Tech",
        channelType: "Assistive-Tech Marketplace",
        url: "https://www.harriscomm.com/",
        regionNote: "Specialized Deaf & HoH catalog",
        fulfillmentNote: "Bed-shaker alerts, visual doorbells & emergency strobes",
      },
      {
        id: "ch-hosp-pager-bulk",
        name: "Hospital Nurse-Call & Ward Telemetry Suppliers",
        channelType: "Hospital Procurement Partner",
        url: "https://gem.gov.in/",
        regionNote: "Institutional biomedical supply",
        fulfillmentNote: "Integrates directly with ward nurse-call stations",
      },
    ],
  },
  "hands-free-voice-switches": {
    id: "hands-free-voice-switches",
    deviceName: "Hands-Free Voice Call Switches",
    subtitle: "Zero-touch pneumatic, proximity, and voice-activated nurse-call & SOS switches",
    estimatedPriceRange: "₹3,500 – ₹19,000 ($45 – $230)",
    bulkPriceRange: "₹2,850 / unit (ICU & Rehab ward bundles)",
    availabilityTypes: [
      "Hospital Bulk Supply",
      "Retail",
      "Government / NGO Subsidized Schemes",
    ],
    subsidyNote:
      "Essential for quadriplegic, stroke-recovery, and motor-impaired patients who cannot press standard call buttons. Covered under hospital rehab equipment grants.",
    channels: [
      {
        id: "ch-ablenet",
        name: "AbleNet Accessibility Switches Official",
        channelType: "Official Manufacturer Store",
        url: "https://www.ablenetinc.com/",
        regionNote: "Global & India clinical distributors",
        fulfillmentNote: "Bluetooth & 3.5mm pillow/proximity switches with bed mounts",
      },
      {
        id: "ch-mobility-india",
        name: "Mobility India Assistive Technology Resource",
        channelType: "Government / NGO Program",
        url: "https://mobility-india.org/",
        regionNote: "Rehabilitation & subsidized devices",
        fulfillmentNote: "Occupational therapist assessment & subsidized switches",
      },
      {
        id: "ch-med-rehab",
        name: "Certified ICU & Rehab Equipment Suppliers",
        channelType: "Certified Medical Supplier",
        url: "https://www.medikabazaar.com/",
        regionNote: "Hospital bulk & ward installation",
        fulfillmentNote: "Antimicrobial bed-rail mounts & sterile switch covers",
      },
    ],
  },
  "bp-monitor": {
    id: "bp-monitor",
    deviceName: "Digital Blood Pressure (BP) Monitor",
    subtitle: "Clinically validated upper-arm automatic cuff with optional voice readout & Bluetooth log",
    estimatedPriceRange: "₹1,850 – ₹5,400 ($22 – $65)",
    bulkPriceRange: "₹1,450 / unit (Hospital 25+ ward kit procurement)",
    availabilityTypes: ["Retail", "Hospital Bulk Supply"],
    subsidyNote:
      "Choose an upper-arm cuff clinically validated by AAMI / ESH standards; voice-readout models help low-vision and elderly patients monitor hypertension independently.",
    channels: [
      {
        id: "ch-omron-bp",
        name: "Omron Healthcare Official Store",
        channelType: "Official Manufacturer Store",
        url: "https://www.omronbrandshop.com/",
        regionNote: "Pan-India direct delivery & 5-year warranty",
        fulfillmentNote: "Clinically validated upper-arm & talking BP cuffs",
      },
      {
        id: "ch-1mg-bp",
        name: "Tata 1mg Certified Medical Devices",
        channelType: "Certified Medical Supplier",
        url: "https://www.1mg.com/",
        regionNote: "Same-day / next-day metro pharmacy delivery",
        fulfillmentNote: "Genuine sealed units with spare wide-range cuffs",
      },
      {
        id: "ch-medika-bp",
        name: "Medikabazaar Hospital Vitals Procurement",
        channelType: "Hospital Procurement Partner",
        url: "https://www.medikabazaar.com/",
        regionNote: "Hospital & OPD bulk supply",
        fulfillmentNote: "GST invoice, calibration certificates & adult/pediatric cuffs",
      },
    ],
  },
  "pulse-oximeter": {
    id: "pulse-oximeter",
    deviceName: "Fingertip Pulse Oximeter (SpO2 & Heart Rate)",
    subtitle: "Rapid clinical SpO2 oxygen saturation & pulse monitor with bright multi-angle OLED screen",
    estimatedPriceRange: "₹899 – ₹3,200 ($11 – $39)",
    bulkPriceRange: "₹680 / unit (Hospital 30+ triage pack)",
    availabilityTypes: ["Retail", "Hospital Bulk Supply"],
    subsidyNote:
      "Look for CE / FDA-cleared fingertip sensors with perfusion index (PI) display for reliable readings in triage bays and home respiratory care.",
    channels: [
      {
        id: "ch-beurer-ox",
        name: "Beurer / Dr. Trust Clinical Diagnostics",
        channelType: "Official Manufacturer Store",
        url: "https://www.beurer.com/",
        regionNote: "Authorized medical diagnostics retail",
        fulfillmentNote: "High-accuracy dual-wavelength SpO2 sensors",
      },
      {
        id: "ch-apollo-ox",
        name: "Apollo Pharmacy Medical Devices",
        channelType: "Certified Medical Supplier",
        url: "https://www.apollopharmacy.in/",
        regionNote: "24/7 store pickup & home delivery across India",
        fulfillmentNote: "Verified clinical oximeters with batteries included",
      },
      {
        id: "ch-gem-ox",
        name: "GeM & Medikabazaar Ward Triage Supply",
        channelType: "Hospital Procurement Partner",
        url: "https://www.medikabazaar.com/",
        regionNote: "Institutional hospital bulk supply",
        fulfillmentNote: "Sanitizable ward oximeters & pediatric probes",
      },
    ],
  },
  "glucometer": {
    id: "glucometer",
    deviceName: "Blood Glucose Monitor (Glucometer)",
    subtitle: "5-second capillary blood sugar testing kit with lancing device & easy-read strips",
    estimatedPriceRange: "₹799 – ₹2,450 ($10 – $30)",
    bulkPriceRange: "₹620 / unit + discounted 50-strip clinical canisters",
    availabilityTypes: [
      "Retail",
      "Hospital Bulk Supply",
      "Government / NGO Subsidized Schemes",
    ],
    subsidyNote:
      "Always match test strip brand and expiry date to your meter model. Subsidized strips are available via Jan Aushadhi Kendras nationwide.",
    channels: [
      {
        id: "ch-accuchek",
        name: "Accu-Chek Official Diabetes Care Store",
        channelType: "Official Manufacturer Store",
        url: "https://www.accu-chek.in/",
        regionNote: "Direct retail & verified strip authenticity",
        fulfillmentNote: "Includes meter, Softclix lancing pen & starter strips",
      },
      {
        id: "ch-onetouch",
        name: "OneTouch / Tata 1mg Diabetes Diagnostics",
        channelType: "Certified Medical Supplier",
        url: "https://www.1mg.com/",
        regionNote: "Fast refill delivery for strips & lancets",
        fulfillmentNote: "ColorSure range indicator meters & strip bundles",
      },
      {
        id: "ch-medika-gluc",
        name: "Medikabazaar Point-of-Care Diagnostics",
        channelType: "Hospital Procurement Partner",
        url: "https://www.medikabazaar.com/",
        regionNote: "Hospital & ward bulk procurement",
        fulfillmentNote: "Institutional meters, control solutions & sterile lancets",
      },
    ],
  },
  "ir-thermometer": {
    id: "ir-thermometer",
    deviceName: "Digital / Infrared Thermometer",
    subtitle: "1-second non-contact forehead infrared thermometer with fever backlight & silent mode",
    estimatedPriceRange: "₹650 – ₹2,900 ($8 – $35)",
    bulkPriceRange: "₹520 / unit (Hospital 25+ screening pack)",
    availabilityTypes: ["Retail", "Hospital Bulk Supply"],
    subsidyNote:
      "Non-contact infrared units reduce cross-infection in family homes and ER triage desks while silent mode supports Deaf users and sleeping children.",
    channels: [
      {
        id: "ch-rossmax-ir",
        name: "Rossmax / Braun Clinical Thermometers",
        channelType: "Official Manufacturer Store",
        url: "https://www.rossmax.com/",
        regionNote: "Global & India authorized clinical stores",
        fulfillmentNote: "Medical-grade IR sensors calibrated to ±0.2°C",
      },
      {
        id: "ch-apollo-ir",
        name: "Apollo Pharmacy & Tata 1mg Diagnostics",
        channelType: "Certified Medical Supplier",
        url: "https://www.apollopharmacy.in/",
        regionNote: "Rapid home & clinic delivery",
        fulfillmentNote: "Forehead IR & flexible-tip digital thermometers",
      },
      {
        id: "ch-gem-ir",
        name: "GeM & Hospital Screening Supply",
        channelType: "Hospital Procurement Partner",
        url: "https://gem.gov.in/",
        regionNote: "Bulk triage & OPD procurement",
        fulfillmentNote: "Institutional warranty & biomedical calibration docs",
      },
    ],
  },
  "nebulizer-ecg": {
    id: "nebulizer-ecg",
    deviceName: "Portable Nebulizer & Compact ECG Monitor",
    subtitle: "Whisper-quiet mesh nebulizer for airway relief & pocket 30-second ECG rhythm monitor",
    estimatedPriceRange: "₹2,200 – ₹11,900 ($26 – $145)",
    bulkPriceRange: "₹1,850 (Nebulizer) / ₹8,400 (ECG) hospital bulk",
    availabilityTypes: [
      "Retail",
      "Audiologist / Prescription Fitted",
      "Hospital Bulk Supply",
    ],
    subsidyNote:
      "Use nebulizer medications strictly as prescribed by a physician. Pocket ECG tracings aid early arrhythmia screening and should be reviewed by a clinician.",
    channels: [
      {
        id: "ch-omron-neb",
        name: "Omron Respiratory & Mesh Nebulizers",
        channelType: "Official Manufacturer Store",
        url: "https://www.omronbrandshop.com/",
        regionNote: "Official retail & spare mask kits",
        fulfillmentNote: "Adult & pediatric masks with silent ultrasonic mesh",
      },
      {
        id: "ch-alivecor-ecg",
        name: "AliveCor KardiaMobile Clinical ECG",
        channelType: "Official Manufacturer Store",
        url: "https://www.alivecor.com/",
        regionNote: "FDA-cleared personal & clinic ECG monitors",
        fulfillmentNote: "30-second single/6-lead ECG PDF export for doctors",
      },
      {
        id: "ch-medika-resp",
        name: "Medikabazaar Respiratory & Cardiac Kits",
        channelType: "Hospital Procurement Partner",
        url: "https://www.medikabazaar.com/",
        regionNote: "Hospital ER, asthma bay & cardiology supply",
        fulfillmentNote: "Disposable sterile nebulizer chambers & ECG pads",
      },
    ],
  },
};

export const INITIAL_HOSPITAL_SPECIAL_DEVICES: HospitalSpecialDevice[] = [
  {
    id: "hsd-vision-glasses",
    guideId: "smart-vision-glasses",
    category: "Accessibility & Sensory",
    name: "AI Smart Vision Glasses",
    targetGroup: "Blind & Visually Impaired Patients",
    clinicalUse: "Reads consent forms, medicine labels & guides hallway orientation via voice",
    visualKey: "smart_vision_glasses",
    totalStock: 12,
    assignedUnits: 4,
    lowStockThreshold: 3,
    wardLocation: "ER Triage Desk & Ophthalmology Wing",
    lastAudited: "Today, 08:30 AM",
  },
  {
    id: "hsd-hearing-aids",
    guideId: "digital-hearing-aids",
    category: "Accessibility & Sensory",
    name: "Digital Hearing Aids & Pocket Amplifiers",
    targetGroup: "Hard-of-Hearing & Senior Patients",
    clinicalUse: "Immediate bedside voice amplification during triage interviews & discharge briefings",
    visualKey: "digital_hearing_aid",
    totalStock: 18,
    assignedUnits: 15,
    lowStockThreshold: 4,
    wardLocation: "ER Bay 1–4 & Geriatric Ward",
    lastAudited: "Today, 09:00 AM",
  },
  {
    id: "hsd-bone-conduction",
    guideId: "bone-conduction-headsets",
    category: "Accessibility & Sensory",
    name: "Bone-Conduction Audio Headsets",
    targetGroup: "Conductive Hearing Loss & Low-Vision Patients",
    clinicalUse: "Sanitizable open-ear directional audio cues for diagnostics & imaging prep",
    visualKey: "bone_conduction_specs",
    totalStock: 10,
    assignedUnits: 3,
    lowStockThreshold: 3,
    wardLocation: "Diagnostics & Outpatient Reception",
    lastAudited: "Today, 07:45 AM",
  },
  {
    id: "hsd-visual-pagers",
    guideId: "visual-vibrating-pagers",
    category: "Accessibility & Sensory",
    name: "Visual & Vibrating Ward Alert Pagers",
    targetGroup: "Deaf & Non-Auditory Patients",
    clinicalUse: "Flashing LED & gentle wrist vibration alerts for medication rounds, doctor arrival & fire alarms",
    visualKey: "digital_hearing_aid",
    totalStock: 14,
    assignedUnits: 14,
    lowStockThreshold: 3,
    wardLocation: "Inpatient General & Maternity Wards",
    lastAudited: "Today, 08:15 AM",
  },
  {
    id: "hsd-voice-switches",
    guideId: "hands-free-voice-switches",
    category: "Accessibility & Sensory",
    name: "Hands-Free Voice Call Switches",
    targetGroup: "Motor-Impaired, Post-Stroke & ICU Patients",
    clinicalUse: "Zero-touch voice & proximity triggers connected to ward nurse-call & emergency SOS",
    visualKey: "mobility_assist_aid",
    totalStock: 8,
    assignedUnits: 6,
    lowStockThreshold: 3,
    wardLocation: "Neuro ICU & Stroke Rehab Unit",
    lastAudited: "Today, 09:10 AM",
  },
  {
    id: "hsd-bp-monitor",
    guideId: "bp-monitor",
    category: "Vitals & Health Monitoring",
    name: "Digital Blood Pressure (BP) Monitor",
    targetGroup: "ER Triage, Cardiology & Hypertension Wards",
    clinicalUse: "Upper-arm automatic BP cuff with talking voice readout for rapid systolic/diastolic checks",
    visualKey: "bp_monitor",
    totalStock: 26,
    assignedUnits: 18,
    lowStockThreshold: 5,
    wardLocation: "ER Triage Desk & Cardiology OPD",
    lastAudited: "Today, 09:15 AM",
  },
  {
    id: "hsd-pulse-oximeter",
    guideId: "pulse-oximeter",
    category: "Vitals & Health Monitoring",
    name: "Fingertip Pulse Oximeter (SpO2 & Heart Rate)",
    targetGroup: "ER Respiratory, Pulmonology & Pediatric Wards",
    clinicalUse: "Instant bedside SpO2 oxygen saturation and BPM screening with low-oxygen alert",
    visualKey: "pulse_oximeter",
    totalStock: 34,
    assignedUnits: 29,
    lowStockThreshold: 6,
    wardLocation: "ER Bay 1–6 & Respiratory Isolation",
    lastAudited: "Today, 09:20 AM",
  },
  {
    id: "hsd-glucometer",
    guideId: "glucometer",
    category: "Vitals & Health Monitoring",
    name: "Blood Glucose Monitor (Glucometer)",
    targetGroup: "Diabetic Emergency, Maternity & General Wards",
    clinicalUse: "5-second point-of-care capillary glucose testing for hypo/hyperglycemia triage",
    visualKey: "glucometer",
    totalStock: 20,
    assignedUnits: 12,
    lowStockThreshold: 4,
    wardLocation: "Endocrinology & ER Point-of-Care Cart",
    lastAudited: "Today, 08:50 AM",
  },
  {
    id: "hsd-ir-thermometer",
    guideId: "ir-thermometer",
    category: "Vitals & Health Monitoring",
    name: "Digital / Infrared Thermometer",
    targetGroup: "Fever Triage, Pediatric & Infection Control",
    clinicalUse: "1-second contactless forehead temperature screening with color-coded fever backlight",
    visualKey: "ir_thermometer",
    totalStock: 28,
    assignedUnits: 16,
    lowStockThreshold: 5,
    wardLocation: "Main Reception, ER & Pediatric Bay",
    lastAudited: "Today, 08:40 AM",
  },
  {
    id: "hsd-nebulizer-ecg",
    guideId: "nebulizer-ecg",
    category: "Vitals & Health Monitoring",
    name: "Portable Nebulizer & Compact ECG Monitor",
    targetGroup: "Asthma/COPD Airway Relief & Cardiac Triage",
    clinicalUse: "Portable mesh bronchodilator nebulizer paired with 30-second single-lead ECG screening",
    visualKey: "nebulizer_ecg",
    totalStock: 14,
    assignedUnits: 11,
    lowStockThreshold: 3,
    wardLocation: "ER Asthma Bay & Chest Pain Fast-Track",
    lastAudited: "Today, 09:05 AM",
  },
];

export function computeAvailableUnits(device: Pick<HospitalSpecialDevice, "totalStock" | "assignedUnits">): number {
  return Math.max(0, device.totalStock - device.assignedUnits);
}

export function computeStockStatus(
  availableUnits: number,
  lowStockThreshold = 3
): StockStatus {
  if (availableUnits <= 0) return "Out of Stock";
  if (availableUnits <= lowStockThreshold) return "Low Stock";
  return "In Stock";
}

export function adjustHospitalDeviceStock(
  devices: HospitalSpecialDevice[],
  deviceId: string,
  delta: number
): HospitalSpecialDevice[] {
  return devices.map((d) => {
    if (d.id !== deviceId) return d;
    const nextTotal = Math.max(d.assignedUnits, d.totalStock + delta);
    return {
      ...d,
      totalStock: nextTotal,
      lastAudited: "Just now",
    };
  });
}

export function assignHospitalDeviceUnit(
  devices: HospitalSpecialDevice[],
  deviceId: string
): HospitalSpecialDevice[] {
  return devices.map((d) => {
    if (d.id !== deviceId) return d;
    const avail = computeAvailableUnits(d);
    if (avail <= 0) return d;
    return {
      ...d,
      assignedUnits: d.assignedUnits + 1,
      lastAudited: "Just now",
    };
  });
}

export function returnHospitalDeviceUnit(
  devices: HospitalSpecialDevice[],
  deviceId: string
): HospitalSpecialDevice[] {
  return devices.map((d) => {
    if (d.id !== deviceId) return d;
    if (d.assignedUnits <= 0) return d;
    return {
      ...d,
      assignedUnits: d.assignedUnits - 1,
      lastAudited: "Just now",
    };
  });
}

export function getWhereToBuyGuide(keyOrName: string): WhereToBuyGuide {
  if (WHERE_TO_BUY_GUIDES[keyOrName]) {
    return WHERE_TO_BUY_GUIDES[keyOrName];
  }
  const lower = keyOrName.toLowerCase();
  if (lower.includes("blood pressure") || lower.includes("bp ") || lower.includes("bp-") || lower.includes("bp)") || lower.includes("cuff")) {
    return WHERE_TO_BUY_GUIDES["bp-monitor"];
  }
  if (lower.includes("oximeter") || lower.includes("spo2")) {
    return WHERE_TO_BUY_GUIDES["pulse-oximeter"];
  }
  if (lower.includes("glucose") || lower.includes("glucometer")) {
    return WHERE_TO_BUY_GUIDES["glucometer"];
  }
  if (lower.includes("thermometer") || lower.includes("infrared")) {
    return WHERE_TO_BUY_GUIDES["ir-thermometer"];
  }
  if (lower.includes("nebulizer") || lower.includes("ecg") || lower.includes("ekg")) {
    return WHERE_TO_BUY_GUIDES["nebulizer-ecg"];
  }
  if (lower.includes("bone") || lower.includes("conduction")) {
    return WHERE_TO_BUY_GUIDES["bone-conduction-headsets"];
  }
  if (lower.includes("pager") || lower.includes("vibrat") || lower.includes("visual alert")) {
    return WHERE_TO_BUY_GUIDES["visual-vibrating-pagers"];
  }
  if (lower.includes("switch") || lower.includes("mobility") || lower.includes("cane") || lower.includes("voice call")) {
    return WHERE_TO_BUY_GUIDES["hands-free-voice-switches"];
  }
  if (lower.includes("hearing") || lower.includes("amplifier") || lower.includes("audio")) {
    return WHERE_TO_BUY_GUIDES["digital-hearing-aids"];
  }
  return WHERE_TO_BUY_GUIDES["smart-vision-glasses"];
}

function getDefaultStorage(): SimpleStorage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function mergeMissingInitialDevices(saved: HospitalSpecialDevice[]): HospitalSpecialDevice[] {
  const byId = new Map<string, HospitalSpecialDevice>();
  const initialMap = new Map(INITIAL_HOSPITAL_SPECIAL_DEVICES.map((d) => [d.id, d]));

  for (const item of saved) {
    const template = initialMap.get(item.id);
    byId.set(item.id, {
      ...item,
      category: item.category || template?.category || "Accessibility & Sensory",
    });
  }
  for (const initial of INITIAL_HOSPITAL_SPECIAL_DEVICES) {
    if (!byId.has(initial.id)) {
      byId.set(initial.id, { ...initial });
    }
  }
  return Array.from(byId.values());
}

export function loadHospitalSpecialDevices(
  storage: SimpleStorage | null = getDefaultStorage()
): HospitalSpecialDevice[] {
  if (!storage) return INITIAL_HOSPITAL_SPECIAL_DEVICES.map((d) => ({ ...d }));
  try {
    const raw = storage.getItem(HOSPITAL_STOCK_KEY);
    if (!raw) {
      const legacyRaw = storage.getItem(LEGACY_HOSPITAL_STOCK_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw) as HospitalSpecialDevice[];
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          const merged = mergeMissingInitialDevices(legacyParsed);
          storage.setItem(HOSPITAL_STOCK_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      storage.setItem(
        HOSPITAL_STOCK_KEY,
        JSON.stringify(INITIAL_HOSPITAL_SPECIAL_DEVICES)
      );
      return INITIAL_HOSPITAL_SPECIAL_DEVICES.map((d) => ({ ...d }));
    }
    const parsed = JSON.parse(raw) as HospitalSpecialDevice[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return mergeMissingInitialDevices(parsed);
    }
    return INITIAL_HOSPITAL_SPECIAL_DEVICES.map((d) => ({ ...d }));
  } catch {
    return INITIAL_HOSPITAL_SPECIAL_DEVICES.map((d) => ({ ...d }));
  }
}

export function saveHospitalSpecialDevices(
  devices: HospitalSpecialDevice[],
  storage: SimpleStorage | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(HOSPITAL_STOCK_KEY, JSON.stringify(devices));
  } catch {
    // ignore quota errors
  }
}
