import type {
  AccessibilityOnboardingOption,
  AccessibilityPreferences,
  AssistiveDevice,
  AssistiveDeviceType,
  AssistiveDeviceVisualKey,
  AssistiveTechCategory,
  OrganDonorPledge,
  OrganType,
  RecommendedAssistiveDevice,
} from "../types";

export const ALL_ELIGIBLE_ORGANS: OrganType[] = [
  "Heart",
  "Kidneys",
  "Liver",
  "Corneas",
  "Lungs",
  "Pancreas",
  "Tissue",
];

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  handsFreeVoice: false,
  visualFirst: false,
  assistiveDevicesEnabled: false,
  standardExperience: true,
  enlargedTargets: false,
  autoReadAlerts: false,
  simplifiedMedicalText: false,
  onboardingCompleted: false,
};

export const DEFAULT_ORGAN_PLEDGE: OrganDonorPledge = {
  isDonor: false,
  donateAll: true,
  selectedOrgans: [...ALL_ELIGIBLE_ORGANS],
  nextOfKinName: "",
  nextOfKinRelation: "",
  nextOfKinPhone: "",
  nextOfKinInformed: false,
  pledgeId: "",
  pledgedAt: "",
  updatedAt: "",
  consentAcknowledged: false,
};

export function getVisualKeyForDevice(
  type: AssistiveDeviceType,
  nameOrModel = ""
): AssistiveDeviceVisualKey {
  const lower = nameOrModel.toLowerCase();
  if (lower.includes("blood pressure") || lower.includes("bp ") || lower.includes("bp-") || lower.includes("cuff") || lower.includes("sphygmo")) {
    return "bp_monitor";
  }
  if (lower.includes("oximeter") || lower.includes("spo2") || lower.includes("pulse ox")) {
    return "pulse_oximeter";
  }
  if (lower.includes("glucose") || lower.includes("glucometer") || lower.includes("sugar")) {
    return "glucometer";
  }
  if (lower.includes("thermometer") || lower.includes("infrared") || lower.includes("temp")) {
    return "ir_thermometer";
  }
  if (lower.includes("nebulizer") || lower.includes("ecg") || lower.includes("ekg")) {
    return "nebulizer_ecg";
  }
  if (lower.includes("bone") || lower.includes("shokz") || lower.includes("opencomm")) {
    return "bone_conduction_specs";
  }
  if (type === "vitals_monitoring") return "bp_monitor";
  if (type === "smart_glasses") return "smart_vision_glasses";
  if (type === "hearing_aid") return "digital_hearing_aid";
  return "mobility_assist_aid";
}

export function getAltTextForDevice(
  type: AssistiveDeviceType,
  name: string,
  model?: string
): string {
  const label = model ? `${name} (${model})` : name;
  if (type === "vitals_monitoring") {
    return `Clinical illustration of ${label} home and hospital vitals monitoring medical device`;
  }
  if (type === "smart_glasses") {
    return `Studio photograph of ${label} AI smart vision glasses with embedded frame micro-camera and open-ear temple speakers`;
  }
  if (type === "hearing_aid") {
    return `Studio photograph of ${label} rechargeable behind-the-ear digital Bluetooth hearing aids with charging case`;
  }
  return `Studio photograph of ${label} assistive mobility and hands-free accessibility hardware`;
}

export const INITIAL_ASSISTIVE_DEVICES: AssistiveDevice[] = [
  {
    id: "adev-smart-glasses-1",
    name: "Primary Vision Glasses",
    model: "Envision AI Smart Glasses (Titanium)",
    type: "smart_glasses",
    connectionType: "Bluetooth LE",
    connected: true,
    batteryLevel: 84,
    lastSynced: "Synced 4 mins ago",
    notes: "Audio description & prescription label reader enabled",
    visualKey: "smart_vision_glasses",
    altText:
      "Matte titanium AI Smart Vision Glasses featuring a miniature bridge micro-camera and open-ear bone-conduction temple speakers",
    troubleshootingTips: [
      "Ensure Bluetooth is enabled on your phone or computer before tapping Sync.",
      "Hold the right temple pad for 3 seconds to enter Bluetooth pairing mode.",
      "Keep firmware updated via the companion app for low-latency Care Preempt readouts.",
    ],
  },
  {
    id: "adev-hearing-aid-1",
    name: "Bilateral Hearing Aid",
    model: "Phonak Audéo Lumity L90-R",
    type: "hearing_aid",
    connectionType: "Bluetooth LE",
    connected: true,
    batteryLevel: 92,
    lastSynced: "Synced 2 mins ago",
    notes: "Direct audio streaming for critical emergency cues",
    visualKey: "digital_hearing_aid",
    altText:
      "Pair of rechargeable behind-the-ear digital Bluetooth hearing aids alongside their matte white charging case",
    troubleshootingTips: [
      "Place hearing aids in the charger for 5 seconds, then remove to reset Bluetooth LE pairing.",
      "Switch to Visual-First Mode in Care Preempt if ambient noise interferes with audio alerts.",
      "Verify microphone domes are clean and unobstructed for clear voice capture.",
    ],
  },
];

export const RECOMMENDED_ASSISTIVE_TECH: RecommendedAssistiveDevice[] = [
  {
    id: "rec-envision-glasses",
    name: "Envision AI Smart Vision Glasses",
    manufacturer: "Envision",
    category: "Vision Support",
    deviceType: "smart_glasses",
    visualKey: "smart_vision_glasses",
    altText:
      "Envision AI Smart Vision Glasses with bridge-mounted OCR micro-camera and open-ear directional speakers",
    summary:
      "Lightweight AI vision-assist glasses that read medicine bottles, clinical forms, and surroundings aloud in real time.",
    keyFeatures: [
      "Instant OCR text & prescription label reading",
      "Hands-free voice command control",
      "Open-ear directional speaker for situational awareness",
    ],
    compatibilityNote:
      "Compatible with Care Preempt Hands-Free Voice Mode via Bluetooth audio routing.",
    usageGuidance:
      "Enable Hands-Free & Voice Assistance in Care Preempt to hear critical triage alerts and medicine instructions directly through the frame speakers.",
  },
  {
    id: "rec-orcam-myeye",
    name: "OrCam MyEye Pro 3 Vision Specs",
    manufacturer: "OrCam",
    category: "Vision Support",
    deviceType: "smart_glasses",
    visualKey: "bone_conduction_specs",
    altText:
      "Lightweight prescription-compatible AI vision spectacles with side-mounted optical reader and open-ear bone-conduction audio",
    summary:
      "Smart vision eyewear with offline text reading, medication identification, currency recognition, and familiar face cues.",
    keyFeatures: [
      "Works completely offline for privacy in clinical rooms",
      "Smart Reading mode for hospital discharge summaries",
      "Open-ear audio keeps ambient sounds audible",
    ],
    compatibilityNote:
      "Pairs smoothly with Care Preempt enlarged tap targets and keyboard switch navigation.",
    usageGuidance:
      "Use OrCam to read printed prescriptions while Care Preempt tracks your dosage schedules and emergency alerts.",
  },
  {
    id: "rec-xrai-ar-glasses",
    name: "XRAI Glass Captioned AR Specs",
    manufacturer: "XRAI / XREAL",
    category: "Hearing Support",
    deviceType: "smart_glasses",
    visualKey: "bone_conduction_specs",
    altText:
      "Captioned AR audio spectacles designed for real-time floating clinical subtitles",
    summary:
      "Augmented-reality smart glasses that project live real-time subtitles of doctor consultations and emergency instructions directly into view.",
    keyFeatures: [
      "Real-time floating closed captions",
      "Multi-language clinical translation support",
      "Lightweight everyday sunglass-style frame",
    ],
    compatibilityNote:
      "Designed to complement Care Preempt Visual-First Mode and Live Visual Transcripts.",
    usageGuidance:
      "Turn on Visual-First Mode so Care Preempt mirrors every notification in structured text while your AR glasses caption in-person conversations.",
  },
  {
    id: "rec-phonak-lumity",
    name: "Phonak Audéo Lumity Rechargeable BTE",
    manufacturer: "Phonak",
    category: "Hearing Support",
    deviceType: "hearing_aid",
    visualKey: "digital_hearing_aid",
    altText:
      "Phonak Audéo Lumity rechargeable behind-the-ear digital hearing aids with portable charging case",
    summary:
      "Universal Bluetooth rechargeable hearing aid delivering clear speech understanding in noisy hospital waiting rooms.",
    keyFeatures: [
      "Direct Bluetooth streaming from phones and laptops",
      "Adaptive speech-in-noise filtering",
      "Full-day lithium-ion battery with rapid charge",
    ],
    compatibilityNote:
      "Supports direct Care Preempt voice readouts and visual banner fallbacks simultaneously.",
    usageGuidance:
      "Register your hearing aid in My Connected Devices to keep battery status visible and receive visual fallbacks if battery drops below 20%.",
  },
  {
    id: "rec-oticon-intent",
    name: "Oticon Intent miniRITE Hearing Aid",
    manufacturer: "Oticon",
    category: "Hearing Support",
    deviceType: "hearing_aid",
    visualKey: "digital_hearing_aid",
    altText:
      "Oticon Intent miniRITE digital hearing aids with Bluetooth LE Audio support and charging dock",
    summary:
      "4D user-intent sensor hearing machine with LE Audio support for low-latency clinical telehealth calls and alerts.",
    keyFeatures: [
      "Bluetooth LE Audio & Auracast broadcast ready",
      "Motion-aware directional focus for conversations",
      "IP68 moisture and dust resistance",
    ],
    compatibilityNote:
      "Fully compatible with Care Preempt Visual-First captioning and telehealth audio.",
    usageGuidance:
      "Pair with your primary device and enable Visual-First alerts so critical updates are never missed during charging cycles.",
  },
  {
    id: "rec-shokz-opencomm",
    name: "Shokz OpenComm2 Bone-Conduction Specs & Headset",
    manufacturer: "Shokz",
    category: "Hands-Free Control",
    deviceType: "mobility_sensory",
    visualKey: "bone_conduction_specs",
    altText:
      "Bone-conduction open-ear audio spectacles and wraparound titanium headset for hands-free voice control",
    summary:
      "Open-ear bone-conduction audio system with noise-canceling mic for reliable voice navigation without blocking ambient traffic or caregiver voices.",
    keyFeatures: [
      "DSP noise-canceling mic for accurate voice commands",
      "Open-ear comfort for all-day medical monitoring",
      "16-hour talk time with tactile multi-function button",
    ],
    compatibilityNote:
      "Optimizes Web Speech API command accuracy in Care Preempt Hands-Free Voice Mode.",
    usageGuidance:
      "Use voice commands like 'Go to Dashboard', 'Read my alerts', or 'Open Organ Donor Card' hands-free from anywhere in the app.",
  },
  {
    id: "rec-able-switch",
    name: "AbleNet Blue2 FT Bluetooth Switch",
    manufacturer: "AbleNet",
    category: "Hands-Free Control",
    deviceType: "mobility_sensory",
    visualKey: "mobility_assist_aid",
    altText:
      "Compact wireless dual-button Bluetooth accessibility switch for effortless keyboard and switch navigation",
    summary:
      "Dual-surface wireless accessibility switch enabling effortless keyboard/switch scanning for users with limited motor mobility.",
    keyFeatures: [
      "Feather-touch dual activation surfaces",
      "Standard keyboard Space/Enter/Tab emulation",
      "Long-life rechargeable battery",
    ],
    compatibilityNote:
      "Works natively with Care Preempt high-visibility focus rings and enlarged 44px+ targets.",
    usageGuidance:
      "Activate Hands-Free & Voice Assistance to enlarge every interactive control and navigate sequentially using switch or Tab/Enter inputs.",
  },
  {
    id: "rec-wewalk-cane",
    name: "WeWalk Smart Ultrasonic Mobility Cane",
    manufacturer: "WeWalk",
    category: "Mobility Aids",
    deviceType: "mobility_sensory",
    visualKey: "mobility_assist_aid",
    altText:
      "Smart ultrasonic mobility cane handle with integrated obstacle sensor ring and tactile haptic grip",
    summary:
      "Connected smart cane with built-in ultrasonic obstacle detection for above-chest hazards and turn-by-turn haptic navigation.",
    keyFeatures: [
      "Ultrasonic sensor detects low branches, signs, and poles",
      "Gentle handle vibrations guide turns without headphones",
      "Integrated touchpad triggers Care Preempt voice check-ins",
    ],
    compatibilityNote:
      "Syncs alongside AI Smart Vision Glasses and Care Preempt Guardian GPS location alerts.",
    usageGuidance:
      "Pair your smart cane with Care Preempt to combine ground-level obstacle feedback with overhead smart-glasses voice guidance.",
  },
  {
    id: "rec-smartgait-fall",
    name: "SafeStep Haptic Fall & Mobility Beacon",
    manufacturer: "SafeStep Health",
    category: "Mobility Aids",
    deviceType: "mobility_sensory",
    visualKey: "mobility_assist_aid",
    altText:
      "Wireless mobility safety beacon and tactile emergency alert button for fall detection and caregiver SOS",
    summary:
      "Lightweight mobility aid sensor and one-press SOS beacon that alerts family guardians automatically if a sudden fall or balance loss occurs.",
    keyFeatures: [
      "Multi-axis accelerometer distinguishes falls from normal steps",
      "Tactile one-press SOS trigger for instant guardian notification",
      "14-day battery with low-battery visual & audio reminders",
    ],
    compatibilityNote:
      "Directly forwards urgent alerts to Care Preempt's Guardian Network and Emergency SOS.",
    usageGuidance:
      "Clip onto a belt, walker, or cane strap and verify Connected status in My Connected Devices before heading outdoors.",
  },
  {
    id: "rec-bp-monitor",
    name: "Digital Blood Pressure (BP) Monitor",
    manufacturer: "Omron / Dr. Morepen",
    category: "Vitals & Health Monitoring",
    deviceType: "vitals_monitoring",
    visualKey: "bp_monitor",
    altText:
      "Upper-arm automatic Digital Blood Pressure (BP) Monitor with talking voice readout and large clinical LCD display",
    summary:
      "Upper-arm automatic blood pressure cuff with irregular heartbeat detection, large high-contrast display, and optional spoken voice readout.",
    keyFeatures: [
      "One-touch upper-arm automatic inflation with cuff-wrap check",
      "Optional spoken voice readout for low-vision & senior users",
      "Stores 60+ systolic/diastolic readings with morning hypertension flag",
    ],
    compatibilityNote:
      "Log readings into Care Preempt Vitals or sync Bluetooth models for automated hypertension triage alerts.",
    usageGuidance:
      "Sit calmly for 5 minutes, rest your arm at heart level, wrap the cuff 2 cm above the elbow crease, and press Start without talking.",
    howToUseTip:
      "Rest 5 mins, sit upright with feet flat, place cuff 2 cm above elbow at heart height, and keep still while inflating.",
  },
  {
    id: "rec-pulse-oximeter",
    name: "Fingertip Pulse Oximeter (SpO2 & Heart Rate)",
    manufacturer: "Beurer / Choicemmed",
    category: "Vitals & Health Monitoring",
    deviceType: "vitals_monitoring",
    visualKey: "pulse_oximeter",
    altText:
      "Fingertip Pulse Oximeter showing 98 percent SpO2 oxygen saturation, 72 BPM pulse rate, and plethysmograph wave",
    summary:
      "Compact clinical fingertip sensor that measures blood oxygen saturation (SpO2) and pulse rate in under 10 seconds with bright OLED readability.",
    keyFeatures: [
      "Instant SpO2 (70–100%) and BPM pulse rate with perfusion index",
      "Multi-directional high-contrast OLED screen for bedside checks",
      "Audible & visual low-oxygen warning below 94% SpO2",
    ],
    compatibilityNote:
      "Essential home triage companion for asthma, COPD, fever, and post-viral recovery tracking in Care Preempt.",
    usageGuidance:
      "Warm cold fingers first, remove dark nail polish, clip gently onto your index or middle finger, and wait 10 seconds for a steady reading.",
    howToUseTip:
      "Clip onto a warm, still index finger (no dark nail polish) and read SpO2 once the pulse wave stabilizes for 10 seconds.",
  },
  {
    id: "rec-glucometer",
    name: "Blood Glucose Monitor (Glucometer)",
    manufacturer: "Accu-Chek / OneTouch",
    category: "Vitals & Health Monitoring",
    deviceType: "vitals_monitoring",
    visualKey: "glucometer",
    altText:
      "Digital Blood Glucose Monitor (Glucometer) with test strip slot, backlit mg/dL reading, and color range indicator",
    summary:
      "Fast 5-second capillary blood glucose meter with color-coded low/normal/high range alerts and minimal blood sample requirement.",
    keyFeatures: [
      "5-second clinical test result using a tiny 0.6 µL blood drop",
      "Pre-meal & post-meal tagging with hypoglycemia alert cue",
      "Large backlit screen & spill-resistant easy-grip test strips",
    ],
    compatibilityNote:
      "Pair with Care Preempt Guardian alerts to notify family rapidly during severe low (<70 mg/dL) or high readings.",
    usageGuidance:
      "Wash and dry hands thoroughly, insert a fresh test strip, prick the side of your fingertip gently, and touch the strip edge to the drop.",
    howToUseTip:
      "Wash & dry hands, insert a fresh strip, prick the side of a fingertip, and touch the strip edge lightly to the blood drop.",
  },
  {
    id: "rec-ir-thermometer",
    name: "Digital / Infrared Thermometer",
    manufacturer: "Braun / Rossmax",
    category: "Vitals & Health Monitoring",
    deviceType: "vitals_monitoring",
    visualKey: "ir_thermometer",
    altText:
      "Non-contact clinical Infrared Forehead & Digital Thermometer with color-coded fever backlight",
    summary:
      "1-second contactless forehead infrared thermometer with silent night mode and green/amber/red fever color backlight.",
    keyFeatures: [
      "1-second contactless measurement (hygienic for families & wards)",
      "Color-coded fever backlight plus silent mode for Deaf/sleeping users",
      "Switchable °F / °C scale with 32-reading fever trend memory",
    ],
    compatibilityNote:
      "Supports fast fever triage intake for children, seniors, and high-risk Care Preempt patients.",
    usageGuidance:
      "Hold the sensor 2–3 cm from the center of a dry forehead, press Measure, and wait for the gentle beep or color backlight confirmation.",
    howToUseTip:
      "Aim 2–3 cm from the center of a clean, dry forehead (away from hair or sweat) and press once until the screen illuminates.",
  },
  {
    id: "rec-nebulizer-ecg",
    name: "Portable Nebulizer & Compact ECG Monitor",
    manufacturer: "Omron / AliveCor",
    category: "Vitals & Health Monitoring",
    deviceType: "vitals_monitoring",
    visualKey: "nebulizer_ecg",
    altText:
      "Portable mesh nebulizer for respiratory mist therapy alongside a pocket single-lead ECG cardiac rhythm monitor",
    summary:
      "Whisper-quiet portable mesh nebulizer for rapid asthma/COPD bronchodilator relief paired with a pocket 30-second ECG rhythm monitor.",
    keyFeatures: [
      "Ultra-fine mesh mist delivers prescribed respiratory meds quietly",
      "Pocket 30-second finger-pad ECG detects AFib & irregular rhythms",
      "USB-C rechargeable & travel-ready for home or ER standby",
    ],
    compatibilityNote:
      "Export 30-second ECG strips directly for Care Preempt AI Triage and cardiologist review.",
    usageGuidance:
      "For nebulizer: fill prescribed dose, breathe slowly through mask/mouthpiece until mist stops. For ECG: rest two fingers on pads for 30 seconds.",
    howToUseTip:
      "Nebulizer: sit upright and inhale slow mist until chamber clears. Pocket ECG: rest fingertips lightly on metal pads for 30 secs.",
  },
];

export interface SmartVisionHotspot {
  id: "camera" | "sensor" | "processor" | "speakers";
  number: number;
  label: string;
  location: string;
  xPercent: number;
  yPercent: number;
  summary: string;
  clinicalBenefit: string;
}

export const SMART_VISION_GLASSES_HOTSPOTS: SmartVisionHotspot[] = [
  {
    id: "camera",
    number: 1,
    label: "Micro-Camera",
    location: "Frame Center Bridge",
    xPercent: 31.8,
    yPercent: 42.5,
    summary:
      "A discreet 12MP wide-angle miniature optical camera embedded in the frame center scans printed text, medicine labels, currency notes, and people ahead.",
    clinicalBenefit:
      "Reads small prescription dosages, expiry dates, and hospital signage effortlessly without needing to hold a phone.",
  },
  {
    id: "sensor",
    number: 2,
    label: "Ultrasonic / LiDAR Obstacle Sensor",
    location: "Front Frame Corner",
    xPercent: 18.5,
    yPercent: 36,
    summary:
      "Micro time-of-flight LiDAR and ultrasonic rangefinders continuously measure distances to stairs, glass doors, curbs, and head-height obstacles.",
    clinicalBenefit:
      "Triggers early distance cues before collisions occur, complementing a white cane or guide dog.",
  },
  {
    id: "processor",
    number: 3,
    label: "Onboard AI Processor",
    location: "Right Temple Arm",
    xPercent: 66,
    yPercent: 50,
    summary:
      "Low-power neural engine runs Optical Character Recognition (OCR) and computer vision locally in milliseconds for instant private recognition.",
    clinicalBenefit:
      "Processes sensitive prescriptions and personal medical forms securely on-device with minimal latency.",
  },
  {
    id: "speakers",
    number: 4,
    label: "Bone-Conduction / Open-Ear Speakers",
    location: "Inner Temple Transducer",
    xPercent: 30,
    yPercent: 30.5,
    summary:
      "Directional open-ear and bone-conduction transducers whisper spoken guidance privately while gentle haptic motors pulse for nearby hazards.",
    clinicalBenefit:
      "Leaves your ear canals completely open so you stay fully aware of approaching traffic, hospital staff, and family voices.",
  },
];

export interface SmartVisionStep {
  step: number;
  id: "capture" | "processing" | "output" | "sos_sync";
  title: string;
  shortTitle: string;
  hotspotId: SmartVisionHotspot["id"];
  description: string;
  examples: string[];
}

export const SMART_VISION_GLASSES_STEPS: SmartVisionStep[] = [
  {
    step: 1,
    id: "capture",
    title: "Capture (Camera & Sensors)",
    shortTitle: "Capture",
    hotspotId: "camera",
    description:
      "A miniature camera on the frame continuously scans text, faces, currency notes, and surroundings, while ultrasonic/LiDAR distance sensors detect obstacles like stairs, doors, or poles.",
    examples: [
      "Scans prescription labels, clinic forms, and elevator numbers",
      "Detects curbs, glass doors, stairs, and hanging hazards up to 3m ahead",
      "Identifies currency denominations and crosswalk signals",
    ],
  },
  {
    step: 2,
    id: "processing",
    title: "AI Processing (OCR & Computer Vision)",
    shortTitle: "AI Processing",
    hotspotId: "processor",
    description:
      "Built-in AI and Optical Character Recognition (OCR) instantly convert printed books, medicine labels, and signs into readable data and identify objects or registered familiar faces.",
    examples: [
      "Converts fine print on medication boxes into clear dosage instructions",
      "Recognizes registered caregivers, doctors, and family members",
      "Summarizes complex visual scenes into concise clinical cues",
    ],
  },
  {
    step: 3,
    id: "output",
    title: "Audio & Haptic Output",
    shortTitle: "Audio & Haptics",
    hotspotId: "speakers",
    description:
      "The glasses whisper real-time voice guidance through open-ear or bone-conduction speakers—leaving your ears free to hear traffic—and provide gentle temple vibration alerts for nearby hazards.",
    examples: [
      "Private directional voice whisper without blocking ambient awareness",
      "Gentle directional temple vibrations signal close obstacles",
      "Adjustable speech pace synced with Care Preempt preferences",
    ],
  },
  {
    step: 4,
    id: "sos_sync",
    title: "Emergency SOS & Care Preempt Sync",
    shortTitle: "SOS & Sync",
    hotspotId: "sensor",
    description:
      "Paired over Bluetooth LE with Care Preempt, the glasses read critical triage alerts aloud automatically and share live GPS location with your family guardian on a single temple press.",
    examples: [
      "Reads urgent Care Preempt health & medication alerts aloud hands-free",
      "One-touch temple SOS shares GPS location and medical profile with caregivers",
      "Monitors glasses battery so Care Preempt falls back to visual/phone cues if low",
    ],
  },
];

export function upsertSmartVisionGlasses(
  devices: AssistiveDevice[]
): { devices: AssistiveDevice[]; pairedDevice: AssistiveDevice; wasAdded: boolean } {
  const existingIdx = devices.findIndex((d) => d.type === "smart_glasses");
  if (existingIdx >= 0) {
    const updatedDevice: AssistiveDevice = {
      ...devices[existingIdx],
      connected: true,
      lastSynced: "Paired via Smart Vision Guide (just now)",
      visualKey: "smart_vision_glasses",
    };
    const next = devices.map((d, i) => (i === existingIdx ? updatedDevice : d));
    return { devices: next, pairedDevice: updatedDevice, wasAdded: false };
  }

  const newDevice: AssistiveDevice = {
    id: `adev-smart-vision-${Date.now()}`,
    name: "AI Smart Vision Glasses",
    model: "Envision AI Smart Vision Glasses (Titanium)",
    type: "smart_glasses",
    connectionType: "Bluetooth LE",
    connected: true,
    batteryLevel: 96,
    lastSynced: "Paired via Smart Vision Guide (just now)",
    notes: "OCR label reader, obstacle alerts & Care Preempt SOS audio sync active",
    visualKey: "smart_vision_glasses",
    altText:
      "AI Smart Vision Glasses with bridge-mounted micro-camera and open-ear bone-conduction speakers",
    troubleshootingTips: getDefaultTipsForDeviceType("smart_glasses"),
  };
  return {
    devices: [newDevice, ...devices],
    pairedDevice: newDevice,
    wasAdded: true,
  };
}

export function getDefaultTipsForDeviceType(type: AssistiveDeviceType): string[] {
  if (type === "smart_glasses") {
    return [
      "Check that Bluetooth LE is active on your companion phone or computer.",
      "Hold the temple power button for 3 seconds to re-enter pairing mode.",
      "Clean camera/optical sensors gently with a microfiber cloth for clear text capture.",
    ];
  }
  if (type === "hearing_aid") {
    return [
      "Place the hearing machine in its charging case for 5 seconds to reset wireless pairing.",
      "Enable Visual-First Mode in Care Preempt so all alerts display as high-contrast banners.",
      "Check battery charge before long clinical appointments.",
    ];
  }
  if (type === "vitals_monitoring") {
    return [
      "Replace low AA/AAA batteries or recharge via USB-C to prevent inaccurate sensor readings.",
      "Keep cuffs, finger probes, and infrared lenses clean and dry before each check.",
      "Log abnormal readings (BP >140/90, SpO2 <94%, Glucose <70) directly into Care Preempt Triage.",
    ];
  }
  return [
    "Confirm the assistive switch or controller is set to standard keyboard/HID mode.",
    "Verify enlarged tap targets are enabled in Accessibility Settings.",
    "Re-sync the device if focus navigation pauses after waking from sleep.",
  ];
}

export function reconcileOnboardingSelection(
  current: AccessibilityOnboardingOption[],
  toggled: AccessibilityOnboardingOption
): AccessibilityOnboardingOption[] {
  if (toggled === "standard") {
    return current.includes("standard") ? [] : ["standard"];
  }
  const withoutStandard = current.filter((item) => item !== "standard");
  if (withoutStandard.includes(toggled)) {
    return withoutStandard.filter((item) => item !== toggled);
  }
  return [...withoutStandard, toggled];
}

export function buildPreferencesFromOnboarding(
  selected: AccessibilityOnboardingOption[]
): AccessibilityPreferences {
  const isStandard = selected.length === 0 || selected.includes("standard");
  const handsFreeVoice = !isStandard && selected.includes("hands_free_voice");
  const visualFirst = !isStandard && selected.includes("visual_first");
  const assistiveDevicesEnabled =
    !isStandard && selected.includes("assistive_devices");

  return {
    handsFreeVoice,
    visualFirst,
    assistiveDevicesEnabled,
    standardExperience: isStandard,
    enlargedTargets: handsFreeVoice || assistiveDevicesEnabled,
    autoReadAlerts: handsFreeVoice,
    simplifiedMedicalText: visualFirst,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  };
}

export type VoiceCommandIntent =
  | { type: "navigate"; path: string; label: string; speech: string }
  | { type: "read_alerts"; speech: string }
  | { type: "open_settings"; speech: string }
  | { type: "toggle_visual"; speech: string }
  | { type: "stop_listening"; speech: string }
  | { type: "help"; speech: string }
  | { type: "unknown"; raw: string; speech: string };

export function parseVoiceCommand(transcript: string): VoiceCommandIntent {
  const normalized = transcript.trim().toLowerCase();
  if (!normalized) {
    return {
      type: "unknown",
      raw: transcript,
      speech: "I did not catch a command. Try saying Go to Dashboard, Read my alerts, or Open Organ Donor Card.",
    };
  }

  if (
    normalized.includes("stop listening") ||
    normalized.includes("turn off mic") ||
    normalized.includes("pause voice")
  ) {
    return {
      type: "stop_listening",
      speech: "Voice listening paused. Tap the microphone button anytime to resume.",
    };
  }

  if (
    normalized.includes("read") &&
    (normalized.includes("alert") || normalized.includes("notification") || normalized.includes("sos"))
  ) {
    return {
      type: "read_alerts",
      speech: "Reading your active safety alerts now.",
    };
  }

  if (
    normalized.includes("organ") ||
    normalized.includes("donor card") ||
    normalized.includes("donation")
  ) {
    return {
      type: "navigate",
      path: "/patient/organ-donation",
      label: "Organ Donation Registry",
      speech: "Opening the Organ Donation Registry and Digital Donor Card.",
    };
  }

  if (
    normalized.includes("assistive") ||
    normalized.includes("device") ||
    normalized.includes("glasses") ||
    normalized.includes("hearing aid")
  ) {
    return {
      type: "navigate",
      path: "/patient/devices",
      label: "Assistive Devices Hub",
      speech: "Opening your Assistive Devices Hub.",
    };
  }

  if (
    normalized.includes("accessibility") ||
    normalized.includes("profile") ||
    normalized.includes("settings")
  ) {
    return {
      type: "open_settings",
      speech: "Opening Profile and Accessibility Settings.",
    };
  }

  if (normalized.includes("visual mode") || normalized.includes("captions")) {
    return {
      type: "toggle_visual",
      speech: "Toggling Visual-First Mode and live visual captions.",
    };
  }

  if (normalized.includes("triage") || normalized.includes("symptom")) {
    return {
      type: "navigate",
      path: "/patient/triage",
      label: "AI Triage",
      speech: "Opening AI Symptom Triage.",
    };
  }

  if (normalized.includes("hospital")) {
    return {
      type: "navigate",
      path: "/patient/hospitals",
      label: "Hospital Finder",
      speech: "Opening Hospital Finder.",
    };
  }

  if (normalized.includes("blood")) {
    return {
      type: "navigate",
      path: "/patient/blood",
      label: "Blood Network",
      speech: "Opening the Blood Network.",
    };
  }

  if (normalized.includes("alert") || normalized.includes("sos") || normalized.includes("emergency")) {
    return {
      type: "navigate",
      path: "/patient/alerts",
      label: "Alerts & SOS",
      speech: "Opening Alerts and Emergency SOS.",
    };
  }

  if (normalized.includes("vital") || normalized.includes("wearable")) {
    return {
      type: "navigate",
      path: "/patient/vitals",
      label: "Vitals & Wearables",
      speech: "Opening Vitals and Wearables.",
    };
  }

  if (
    normalized.includes("dashboard") ||
    normalized.includes("overview") ||
    normalized.includes("home")
  ) {
    return {
      type: "navigate",
      path: "/patient",
      label: "Dashboard Overview",
      speech: "Navigating to your Care Preempt Dashboard.",
    };
  }

  if (normalized.includes("help") || normalized.includes("commands")) {
    return {
      type: "help",
      speech:
        "Available commands include: Go to Dashboard, Read my alerts, Open Organ Donor Card, Open Assistive Devices, Open AI Triage, and Open Accessibility Settings.",
    };
  }

  return {
    type: "unknown",
    raw: transcript,
    speech: `Command "${transcript.trim()}" was not recognized. Try saying Go to Dashboard, Read my alerts, or Open Organ Donor Card.`,
  };
}

export interface NewAssistiveDeviceInput {
  name: string;
  model: string;
  type: AssistiveDeviceType;
  connectionType: "Bluetooth LE" | "Companion App" | "USB-C / Bridge";
  batteryLevel?: number;
  notes?: string;
}

export function validateAssistiveDevice(input: NewAssistiveDeviceInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Please enter a clear label for this device (at least 2 characters).";
  }
  if (!input.model || input.model.trim().length < 2) {
    errors.model = "Please enter the device model or manufacturer name.";
  }
  if (
    input.batteryLevel !== undefined &&
    (Number.isNaN(input.batteryLevel) || input.batteryLevel < 0 || input.batteryLevel > 100)
  ) {
    errors.batteryLevel = "Battery level must be between 0 and 100%.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function toggleAssistiveDeviceConnection(
  devices: AssistiveDevice[],
  deviceId: string
): AssistiveDevice[] {
  return devices.map((device) => {
    if (device.id !== deviceId) return device;
    const nextConnected = !device.connected;
    return {
      ...device,
      connected: nextConnected,
      lastSynced: nextConnected ? "Synced just now" : "Disconnected (Standby)",
    };
  });
}

export function filterRecommendedDevices(
  catalog: RecommendedAssistiveDevice[],
  category: AssistiveTechCategory | "All",
  searchQuery: string
): RecommendedAssistiveDevice[] {
  const q = searchQuery.trim().toLowerCase();
  return catalog.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.keyFeatures.some((f) => f.toLowerCase().includes(q))
    );
  });
}

export function validateOrganPledge(pledge: Partial<OrganDonorPledge>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (pledge.isDonor) {
    const organs = pledge.donateAll
      ? ALL_ELIGIBLE_ORGANS
      : pledge.selectedOrgans || [];
    if (organs.length === 0) {
      errors.selectedOrgans =
        "Please select at least one organ or tissue, or choose 'Donate all eligible organs & tissues'.";
    }
    if (!pledge.nextOfKinName || pledge.nextOfKinName.trim().length < 2) {
      errors.nextOfKinName =
        "Please provide the full name of your next of kin or legal representative.";
    }
    if (!pledge.nextOfKinRelation || pledge.nextOfKinRelation.trim().length < 2) {
      errors.nextOfKinRelation =
        "Please specify your relationship to this emergency contact (e.g. Spouse, Mother, Sibling).";
    }
    const cleanedPhone = (pledge.nextOfKinPhone || "").replace(/[^\d+]/g, "");
    if (cleanedPhone.length < 7) {
      errors.nextOfKinPhone =
        "Please enter a valid phone number (at least 7 digits) for your next of kin.";
    }
    if (!pledge.consentAcknowledged) {
      errors.consentAcknowledged =
        "Please acknowledge the voluntary personal directive notice before saving your pledge.";
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function generateNextOfKinMessage(
  holderName: string,
  pledge: OrganDonorPledge
): string {
  const organsList = pledge.donateAll
    ? "all eligible organs and tissues"
    : pledge.selectedOrgans.join(", ");
  const dateLabel = pledge.pledgedAt
    ? new Date(pledge.pledgedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return [
    `Hello ${pledge.nextOfKinName || "Family Member"},`,
    ``,
    `I am sharing an important personal health directive with you. On ${dateLabel}, I recorded my voluntary Organ & Tissue Donation Pledge in Care Preempt (Pledge ID: ${pledge.pledgeId || "CP-DONOR-PENDING"}).`,
    ``,
    `My Preference: I wish to donate ${organsList} to help save and restore lives.`,
    `Designated Family Contact: ${pledge.nextOfKinName} (${pledge.nextOfKinRelation || "Next of Kin"}) · ${pledge.nextOfKinPhone}`,
    ``,
    `I have named you as my informed next of kin so you are aware of my wishes. Please keep this message for your records.`,
    `— ${holderName || "Care Preempt Member"}`,
  ].join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateDonorCardSvg(
  holderName: string,
  bloodGroup: string,
  pledge: OrganDonorPledge
): string {
  const organsLabel = pledge.donateAll
    ? "All Eligible Organs & Tissues"
    : pledge.selectedOrgans.join(", ");
  const pledgeDate = pledge.pledgedAt
    ? new Date(pledge.pledgedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Pending";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="440" viewBox="0 0 760 440">
  <defs>
    <linearGradient id="cpCardBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="55%" stop-color="#115E59"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>
  </defs>
  <rect width="760" height="440" rx="24" fill="url(#cpCardBg)"/>
  <rect x="20" y="20" width="720" height="400" rx="18" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
  <text x="44" y="66" fill="#99F6E4" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2">CARE PREEMPT · DIGITAL ORGAN DONOR CARD</text>
  <rect x="520" y="42" width="196" height="34" rx="17" fill="#10B981" fill-opacity="0.22" stroke="#34D399" stroke-width="1"/>
  <text x="618" y="64" text-anchor="middle" fill="#A7F3D0" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700">VERIFIED DONOR PLEDGE</text>

  <text x="44" y="128" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="30" font-weight="800">${escapeXml(holderName || "Care Preempt Member")}</text>
  <text x="44" y="156" fill="#CCFBF1" font-family="JetBrains Mono, monospace" font-size="13">Pledge ID: ${escapeXml(pledge.pledgeId || "CP-DONOR")}   ·   Blood Group: ${escapeXml(bloodGroup || "O+")}</text>

  <line x1="44" y1="184" x2="716" y2="184" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>

  <text x="44" y="216" fill="#99F6E4" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1.2">DONATION PREFERENCES</text>
  <text x="44" y="242" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600">${escapeXml(organsLabel)}</text>

  <text x="44" y="292" fill="#99F6E4" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1.2">NEXT OF KIN / EMERGENCY REPRESENTATIVE</text>
  <text x="44" y="318" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600">${escapeXml(pledge.nextOfKinName || "Not specified")} (${escapeXml(pledge.nextOfKinRelation || "Family")}) · ${escapeXml(pledge.nextOfKinPhone || "—")}</text>

  <text x="44" y="378" fill="#CBD5E1" font-family="Inter, Arial, sans-serif" font-size="12">Pledge Date: ${escapeXml(pledgeDate)}</text>
  <text x="716" y="378" text-anchor="end" fill="#CBD5E1" font-family="Inter, Arial, sans-serif" font-size="11">Personal Health Directive · Register officially via NOTTO / OrganDonor.gov</text>
</svg>`;
}

// Per-user storage helpers (safe in SSR / node:test environments)
function hasLocalStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadUserAccessibility(userId: string): AccessibilityPreferences {
  if (!hasLocalStorage()) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  try {
    const raw = localStorage.getItem(`sg_a11y_${userId}`);
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  }
}

export function saveUserAccessibility(
  userId: string,
  prefs: AccessibilityPreferences
): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(`sg_a11y_${userId}`, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

export function loadUserDevices(userId: string): AssistiveDevice[] {
  if (!hasLocalStorage()) return [...INITIAL_ASSISTIVE_DEVICES];
  try {
    const raw = localStorage.getItem(`sg_assistive_devices_${userId}`);
    if (!raw) {
      localStorage.setItem(
        `sg_assistive_devices_${userId}`,
        JSON.stringify(INITIAL_ASSISTIVE_DEVICES)
      );
      return [...INITIAL_ASSISTIVE_DEVICES];
    }
    return JSON.parse(raw) as AssistiveDevice[];
  } catch {
    return [...INITIAL_ASSISTIVE_DEVICES];
  }
}

export function saveUserDevices(
  userId: string,
  devices: AssistiveDevice[]
): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(
      `sg_assistive_devices_${userId}`,
      JSON.stringify(devices)
    );
  } catch {
    // ignore quota errors
  }
}

export function loadUserOrganPledge(userId: string): OrganDonorPledge {
  if (!hasLocalStorage()) return { ...DEFAULT_ORGAN_PLEDGE };
  try {
    const raw = localStorage.getItem(`sg_organ_pledge_${userId}`);
    if (!raw) return { ...DEFAULT_ORGAN_PLEDGE };
    return { ...DEFAULT_ORGAN_PLEDGE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ORGAN_PLEDGE };
  }
}

export function saveUserOrganPledge(
  userId: string,
  pledge: OrganDonorPledge
): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(`sg_organ_pledge_${userId}`, JSON.stringify(pledge));
  } catch {
    // ignore quota errors
  }
}

export function shouldShowAccessibilityOnboarding(
  user: { role?: string; onboarded?: boolean } | null | undefined,
  pathname: string,
  preferences: Pick<AccessibilityPreferences, "onboardingCompleted"> | null | undefined
): boolean {
  if (!user) return false;
  // Strictly restrict Accessibility & Specialized Needs onboarding popup to Patient accounts ONLY.
  // Admin and Hospital accounts must NEVER receive this patient-only onboarding modal.
  if (user.role !== "patient") return false;
  if (user.onboarded === false) return false;
  if (!pathname.startsWith("/patient")) return false;
  if (preferences?.onboardingCompleted) return false;
  return true;
}

