export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'patient' | 'hospital' | 'admin';
  created_at: string;
  onboarded: boolean;
  preferred_name?: string;
}

export interface Profile {
  user_id?: string;
  preferred_name: string;
  photo_url?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  occupation?: 'Student' | 'Working Professional' | 'Healthcare Worker' | 'Homemaker' | 'Freelancer' | 'Senior Citizen' | 'Other';
  age_bracket: 'under5' | 'teen' | 'adult' | 'married' | 'graduate' | 'senior';
  language: string;
  location: string;
  guardian_name?: string;
  guardian_contact?: string;
  managed_by_guardian: boolean;
  first_aid_cpr: boolean;
  first_aid_level?: string;
  blood_group: string;
  willing_to_donate: boolean;
  updated_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  specialties: string[];
  verified: boolean;
  rating: number;
  available_beds: number;
  icu_available: number;
  er_available: number;
  ventilator_available: number;
  emergency_open: boolean;
  photos?: {
    exterior: string;
    interior_icu: string;
    interior_ward: string;
    equipment_suite: string;
    er_bay: string;
  };
  interior_details?: {
    room_types: Array<{ name: string; beds: number; daily_rate: number }>;
    equipment_list: string[];
    bed_types: string[] | { motorized_icu: string; ward: string };
    accreditations: string[];
  };
}

export interface PatientAccessibilityProfile {
  needsVoiceMode: boolean;
  needsVisualFirst: boolean;
  assistiveDevices: string[];
  communicationNote: string;
  badges: string[];
}

export interface PatientOrganDonorSummary {
  isDonor: boolean;
  pledgeId: string;
  donateAll: boolean;
  selectedOrgans: OrganType[];
  nextOfKinName: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  nextOfKinInformed: boolean;
  pledgedAt: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  blood_group: string;
  assigned_doctor: string;
  admitted: boolean;
  admission_time: string;
  accessibilityProfile?: PatientAccessibilityProfile;
  organDonor?: PatientOrganDonorSummary;
}

export interface SOSAlert {
  id: string;
  user_id?: string;
  user_name?: string;
  kind: 'medical' | 'blood' | 'first_aid';
  severity: 'critical' | 'high' | 'medium' | 'low';
  note: string;
  location?: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  units: number;
  hospital: string;
  city: string;
  urgency: 'Immediate' | 'Within 6 hrs' | 'Within 24 hrs';
  contact: string;
  created_at: string;
}

export interface AwarenessArticle {
  id: string;
  title: string;
  body: string;
  language: string;
  category: string;
  author: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  uses: string;
  dosage: string;
  side_effects: string;
  precautions: string;
  prescription_required: boolean;
  rating?: number;
  efficacy_percent?: number;
  good_for?: string;
  warnings?: string;
  indication_tags?: string[];
  online_apps?: Array<{
    name?: string;
    app_id: string;
    in_stock?: boolean;
    price: number | string;
    discount_percent: number;
    delivery_eta: string;
    buy_url: string;
    logo_color: string;
  }>;
}

export interface BedCapacity {
  total: number;
  available: number;
  icu_total: number;
  icu_available: number;
  er_total: number;
  er_available: number;
  ventilator_total: number;
  ventilator_available: number;
}

export interface Ambulance {
  id: string;
  vehicle_no: string;
  driver_name: string;
  driver_phone: string;
  status: 'available' | 'out' | 'maintenance';
  location: string;
  current_call?: string;
  type?: string;
  equipment?: string[];
  hospital_affiliation?: string;
  eta_minutes?: number;
  city?: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  blood_group: string;
  city: string;
  location: string;
  phone: string;
  last_donated: string;
  eligible: boolean;
  verified_donor: boolean;
  donations_count: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degrees: string;
  council_reg_no: string;
  experience_years: number;
  hospital_name: string;
  hospital?: string;
  city?: string;
  opd_hours: string;
  available_days: string | string[];
  languages: string[];
  rating: number;
  shift: string;
  status: 'available' | 'in_surgery' | 'rounds' | 'off';
  department: string;
  photo_url: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  admin_email?: string;
  actor_email: string;
  action_type?: string;
  action: string;
  category?: 'Authentication' | 'Patient Records' | 'Dispatch & Fleet' | 'Hospital Facility' | 'Security Policy' | 'Compliance Audit' | 'Pharmacy & Supplies';
  severity?: 'info' | 'warning' | 'critical' | 'compliance';
  target_resource?: string;
  target: string;
  details: string;
  ip_address: string;
  two_factor_verified?: boolean;
  status: 'authorized' | 'flagged' | 'blocked';
  tamper_hash?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'emergency' | 'blood' | 'security' | 'clinical' | 'system';
  priority: 'urgent' | 'high' | 'normal';
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  target_role?: 'patient' | 'hospital' | 'admin' | 'all';
}


export interface SecurityStatus {
  two_factor_enforced: boolean;
  encryption_standard: string;
  session_timeout_minutes: number;
  active_admin_sessions: number;
  last_security_audit: string;
  compliance_nabh: boolean;
  compliance_hipaa: boolean;
  failed_attempts_24h: number;
  rate_limiting_active?: boolean;
  strict_ip_whitelist?: boolean;
  auto_revoke_inactive?: boolean;
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorder_level: number;
  unit: string;
  expiry: string;
}

export interface FeedbackItem {
  id: string;
  source: 'patient' | 'hospital' | 'responder' | 'doctor';
  rating: number;
  message: string;
  created_at: string;
  author_name?: string;
  role_tag?: string;
  category?: string;
  sentiment?: 'positive' | 'constructive' | 'urgent';
  response?: string;
}

export interface ScamReport {
  id: string;
  title: string;
  category: string;
  reported_details: string;
  status: 'flagged' | 'verified_scam' | 'resolved';
  created_at: string;
  severity?: 'critical' | 'high' | 'medium';
  location?: string;
  investigation_notes?: string;
  action_taken?: string;
}

export interface TriageMessage {
  id: string;
  user_id?: string;
  session_id: string;
  user_msg: string;
  assistant_msg: string;
  ts: string;
}

export interface GuardianAlert {
  id: string;
  user_name: string;
  relation: string;
  age: number;
  guardian_name: string;
  guardian_phone: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium';
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: string;
    spo2?: string;
    glucose?: string;
  };
  trigger_source: string;
  location: string;
  timestamp: string;
  action_taken: string;
  status: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  brand: 'Apple' | 'Fitbit' | 'Garmin' | 'Samsung' | 'Oura' | 'Whoop' | 'BLE_Generic';
  type: 'smartwatch' | 'fitness_band' | 'smart_ring' | 'chest_strap';
  connected: boolean;
  batteryLevel: number;
  lastSync: string;
  signalStrength: 'Strong' | 'Optimal' | 'Weak';
}

export interface VitalSignRecord {
  heartRate: number; // BPM
  restingHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  hrv: number; // ms
  spo2: number; // %
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  respiratoryRate: number; // breaths/min
  skinTempCelsius: number;
  stressScore: number; // 0-100
  timestamp: string;
}

export interface HourlyHeartRatePoint {
  hour: string; // e.g., "00:00", "04:00", "08:00", "12:00", "16:00", "20:00"
  bpm: number;
  zone: 'Deep Sleep' | 'Resting' | 'Light Walk' | 'Cardio Burn' | 'Peak Surge';
  activity: string;
}

export interface StepTrackingRecord {
  totalSteps: number;
  goalSteps: number;
  distanceKm: number;
  caloriesBurned: number;
  activeMinutes: number;
  cadenceBpm: number;
  strideCm: number;
  isSensorTracking: boolean;
  trackingMode: 'phone_accelerometer' | 'automated_ai_prediction' | 'wearable_synced';
  hourlyDistribution: Array<{ hour: string; steps: number }>;
}

export interface GroundedSearchResult {
  answer: string;
  groundingChunks: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  webSearchQueries?: string[];
  simulated?: boolean;
}

export type AccessibilityOnboardingOption =
  | 'hands_free_voice'
  | 'visual_first'
  | 'assistive_devices'
  | 'standard';

export interface AccessibilityPreferences {
  handsFreeVoice: boolean;
  visualFirst: boolean;
  assistiveDevicesEnabled: boolean;
  standardExperience: boolean;
  enlargedTargets: boolean;
  autoReadAlerts: boolean;
  simplifiedMedicalText: boolean;
  onboardingCompleted: boolean;
  updatedAt?: string;
}

export type AssistiveDeviceType =
  | 'smart_glasses'
  | 'hearing_aid'
  | 'mobility_sensory'
  | 'vitals_monitoring';

export type AssistiveDeviceVisualKey =
  | 'smart_vision_glasses'
  | 'bone_conduction_specs'
  | 'digital_hearing_aid'
  | 'mobility_assist_aid'
  | 'bp_monitor'
  | 'pulse_oximeter'
  | 'glucometer'
  | 'ir_thermometer'
  | 'nebulizer_ecg';

export interface AssistiveDevice {
  id: string;
  name: string;
  model: string;
  type: AssistiveDeviceType;
  connectionType: 'Bluetooth LE' | 'Companion App' | 'USB-C / Bridge';
  connected: boolean;
  batteryLevel: number;
  lastSynced: string;
  notes?: string;
  visualKey?: AssistiveDeviceVisualKey;
  altText?: string;
  troubleshootingTips: string[];
}

export type AssistiveTechCategory =
  | 'Vision Support'
  | 'Hearing Support'
  | 'Hands-Free Control'
  | 'Mobility Aids'
  | 'Vitals & Health Monitoring';

export interface RecommendedAssistiveDevice {
  id: string;
  name: string;
  manufacturer: string;
  category: AssistiveTechCategory;
  deviceType: AssistiveDeviceType;
  visualKey: AssistiveDeviceVisualKey;
  altText: string;
  summary: string;
  keyFeatures: string[];
  compatibilityNote: string;
  usageGuidance: string;
  howToUseTip?: string;
}

export type OrganType =
  | 'Heart'
  | 'Kidneys'
  | 'Liver'
  | 'Corneas'
  | 'Lungs'
  | 'Pancreas'
  | 'Tissue';

export interface OrganDonorPledge {
  isDonor: boolean;
  donateAll: boolean;
  selectedOrgans: OrganType[];
  nextOfKinName: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  nextOfKinInformed: boolean;
  pledgeId: string;
  pledgedAt: string;
  updatedAt: string;
  consentAcknowledged: boolean;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  source: 'voice_assistant' | 'alert' | 'user_command' | 'guidance';
  title?: string;
  text: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface VisualAlertBanner {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

