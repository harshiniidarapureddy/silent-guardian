import {
  User, Profile, Hospital, PatientRecord, SOSAlert, BloodRequest, BloodDonor,
  AwarenessArticle, Medicine, BedCapacity, Ambulance, Doctor, PharmacyItem,
  FeedbackItem, ScamReport, TriageMessage, AdminAuditLog, SecurityStatus, NotificationItem, GuardianAlert,
  WearableDevice, VitalSignRecord, HourlyHeartRatePoint, StepTrackingRecord, GroundedSearchResult
} from '../types';
import {
  INITIAL_HOSPITALS, INITIAL_PATIENTS, INITIAL_BEDS, INITIAL_AMBULANCES,
  INITIAL_DOCTORS, INITIAL_PHARMACY, INITIAL_BLOOD_REQUESTS, INITIAL_ALERTS,
  INITIAL_AWARENESS, INITIAL_MEDICINES, INITIAL_FEEDBACK, INITIAL_SCAMS,
  INITIAL_AUDIT_LOGS, INITIAL_SECURITY
} from './mockData';
import {
  generate500Hospitals, generate550Patients, generate500Ambulances,
  generate500Doctors, generate500Pharmacy, generate500BloodDonors,
  generate120BloodRequests, generate510Medicines, generate150AuditLogs,
  generateSeedNotifications, generateRoleSpecificNotifications,
  generate50ScamReports, generate60FeedbackItems, generate10GuardianAlerts
} from './dataGenerator';

import { evaluateSymptomTriage } from './triageAi';

export const API = "/api";

// Helper to safely load or initialize local storage collections
function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`sg_${key}`);
    if (!val) {
      localStorage.setItem(`sg_${key}`, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`sg_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to store sg_${key}`, e);
  }
}

// Initialize seed data on first run ensuring 500+ records in all primary catalogs
export function initializeStorage() {
  const hosps = getStored<Hospital[]>('hospitals', []);
  if (!hosps || hosps.length < 500) {
    setStored('hospitals', generate500Hospitals());
  }

  const pats = getStored<PatientRecord[]>('patients', []);
  if (!pats || pats.length < 500) {
    setStored('patients', generate550Patients());
  }

  const ambs = getStored<Ambulance[]>('ambulances', []);
  if (!ambs || ambs.length < 500) {
    setStored('ambulances', generate500Ambulances());
  }

  const docs = getStored<Doctor[]>('doctors', []);
  if (!docs || docs.length < 500) {
    setStored('doctors', generate500Doctors());
  }

  const pharm = getStored<PharmacyItem[]>('pharmacy', []);
  if (!pharm || pharm.length < 500) {
    setStored('pharmacy', generate500Pharmacy());
  }

  const donors = getStored<BloodDonor[]>('blood_donors', []);
  if (!donors || donors.length < 500) {
    setStored('blood_donors', generate500BloodDonors());
  }

  const bloodReqs = getStored<BloodRequest[]>('blood_requests', []);
  if (!bloodReqs || bloodReqs.length < 100) {
    setStored('blood_requests', generate120BloodRequests());
  }

  const meds = getStored<Medicine[]>('medicines', []);
  if (!meds || meds.length < 500 || !meds[0]?.rating) {
    setStored('medicines', generate510Medicines());
  }

  const fb = getStored<FeedbackItem[]>('feedback', []);
  if (!fb || fb.length < 50) {
    setStored('feedback', generate60FeedbackItems());
  }

  const sc = getStored<ScamReport[]>('scams', []);
  if (!sc || sc.length < 40) {
    setStored('scams', generate50ScamReports());
  }

  const logs = getStored<AdminAuditLog[]>('audit_logs', []);
  if (!logs || logs.length < 100) {
    setStored('audit_logs', generate150AuditLogs());
  }

  const notifs = getStored<NotificationItem[]>('notifications', []);
  if (!notifs || notifs.length === 0) {
    setStored('notifications', generateSeedNotifications());
  }

  // Ensure role-specific notification queues exist
  (['patient', 'hospital', 'admin'] as const).forEach(r => {
    const rKey = `notifications_${r}`;
    if (!localStorage.getItem(`sg_${rKey}`)) {
      setStored(rKey, generateRoleSpecificNotifications(r));
    }
  });

  getStored('beds', INITIAL_BEDS);
  getStored('alerts', INITIAL_ALERTS);
  getStored('awareness', INITIAL_AWARENESS);
  getStored('security_status', INITIAL_SECURITY);
  getStored('triage_messages', [] as TriageMessage[]);


  const grd = getStored<GuardianAlert[]>('guardian_alerts', []);
  if (!grd || grd.length < 10) {
    setStored('guardian_alerts', generate10GuardianAlerts());
  }

  // Default credentials for manual sign in
  const defaultAccounts = [
    { email: "citizen@carepreempt.com", password: "password123", role: "patient", name: "Ramesh Sharma" },
    { email: "hospital@carepreempt.com", password: "password123", role: "hospital", name: "Apollo Command Care" },
    { email: "admin@carepreempt.com", password: "password123", role: "admin", name: "Lead Security Admin" },
    { email: "patient@silentguardian.com", password: "password123", role: "patient", name: "Ramesh Sharma" },
    { email: "hospital@silentguardian.com", password: "password123", role: "hospital", name: "Apollo Command Care" },
    { email: "admin@silentguardian.com", password: "password123", role: "admin", name: "Lead Security Admin" },
  ];
  const registered = getStored('registered_accounts', defaultAccounts);
  // Ensure carepreempt accounts are always present
  for (const acc of defaultAccounts) {
    if (!registered.some(r => r.email === acc.email)) {
      registered.push(acc);
    }
  }
  setStored('registered_accounts', registered);

  // Default user if none exists
  if (!localStorage.getItem('sg_user')) {
    const defaultUser: User = {
      id: "usr-patient-main",
      email: "citizen@carepreempt.com",
      role: "patient",
      created_at: new Date().toISOString(),
      onboarded: true,
      preferred_name: "Ramesh Sharma",
    };
    saveAuth("sg-token-patient", defaultUser);
    
    // Set matching profile with Anime Avatar
    setStored('profile_usr-patient-main', {
      preferred_name: "Ramesh Sharma",
      photo_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04",
      age_bracket: "adult",
      language: "en",
      location: "Hyderabad",
      guardian_name: "Sita Sharma",
      guardian_contact: "+91 98490 22334",
      managed_by_guardian: false,
      first_aid_cpr: true,
      blood_group: "O+",
      willing_to_donate: true,
    } as Profile);
  }
}

// Authentication Helpers
export const saveAuth = (token: string, user: User) => {
  localStorage.setItem("sg_token", token);
  localStorage.setItem("sg_user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  try {
    const raw = localStorage.getItem("sg_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("sg_token");
  localStorage.removeItem("sg_user");
};

export const switchRole = (role: 'patient' | 'hospital' | 'admin') => {
  const meta: Record<string, { email: string; name: string }> = {
    patient: { email: "patient@demo.com", name: "Ramesh Sharma" },
    hospital: { email: "hospital@demo.com", name: "Apollo Command Care" },
    admin: { email: "admin@silentguardian.com", name: "Platform Admin" },
  };

  const newUser: User = {
    id: `usr-demo-${role}`,
    email: meta[role].email,
    role,
    created_at: new Date().toISOString(),
    onboarded: true,
    preferred_name: meta[role].name,
  };
  saveAuth(`token-${role}-session`, newUser);
  return newUser;
};

export const INITIAL_WEARABLE_DEVICES: WearableDevice[] = [
  {
    id: "wd-apple-ultra",
    name: "Apple Watch Ultra 2 (Cellular)",
    brand: "Apple",
    type: "smartwatch",
    connected: true,
    batteryLevel: 88,
    lastSync: "Live streaming (3s ago)",
    signalStrength: "Strong",
  },
  {
    id: "wd-oura-ring",
    name: "Oura Ring Gen 3 Horizon (Titanium)",
    brand: "Oura",
    type: "smart_ring",
    connected: true,
    batteryLevel: 94,
    lastSync: "Synced 1m ago",
    signalStrength: "Optimal",
  },
  {
    id: "wd-garmin-forerunner",
    name: "Garmin Forerunner 965 AMOLED",
    brand: "Garmin",
    type: "smartwatch",
    connected: false,
    batteryLevel: 65,
    lastSync: "Yesterday 21:30",
    signalStrength: "Weak",
  },
  {
    id: "wd-fitbit-sense",
    name: "Fitbit Sense 2 EDA ECG",
    brand: "Fitbit",
    type: "fitness_band",
    connected: false,
    batteryLevel: 72,
    lastSync: "3 days ago",
    signalStrength: "Optimal",
  },
  {
    id: "wd-samsung-galaxy",
    name: "Samsung Galaxy Watch 6 Classic",
    brand: "Samsung",
    type: "smartwatch",
    connected: false,
    batteryLevel: 81,
    lastSync: "2 days ago",
    signalStrength: "Optimal",
  },
  {
    id: "wd-ble-hrm",
    name: "Polar H10 Bluetooth Chest Strap HRM",
    brand: "BLE_Generic",
    type: "chest_strap",
    connected: false,
    batteryLevel: 100,
    lastSync: "Ready to pair",
    signalStrength: "Strong",
  },
];

export const INITIAL_24H_HEART_RATE: HourlyHeartRatePoint[] = [
  { hour: "00:00", bpm: 58, zone: "Deep Sleep", activity: "Slow Wave Restorative Sleep" },
  { hour: "01:00", bpm: 56, zone: "Deep Sleep", activity: "Cellular Repair Stage" },
  { hour: "02:00", bpm: 55, zone: "Deep Sleep", activity: "Lowest Nocturnal Nadir" },
  { hour: "03:00", bpm: 57, zone: "Deep Sleep", activity: "REM Dream Sleep Cycle" },
  { hour: "04:00", bpm: 59, zone: "Resting", activity: "Early Circadian Awakening" },
  { hour: "05:00", bpm: 62, zone: "Resting", activity: "Basal Metabolism Shift" },
  { hour: "06:00", bpm: 68, zone: "Resting", activity: "Morning Gentle Stretching" },
  { hour: "07:00", bpm: 82, zone: "Light Walk", activity: "Morning Hydration & Breakfast" },
  { hour: "08:00", bpm: 94, zone: "Light Walk", activity: "Active Commute & Stair Climb" },
  { hour: "09:00", bpm: 74, zone: "Resting", activity: "Stationary Work & Meetings" },
  { hour: "10:00", bpm: 76, zone: "Resting", activity: "Focused Cognitive Tasks" },
  { hour: "11:00", bpm: 73, zone: "Resting", activity: "Hydration Break" },
  { hour: "12:00", bpm: 79, zone: "Light Walk", activity: "Lunch Walk to Cafeteria" },
  { hour: "13:00", bpm: 85, zone: "Resting", activity: "Post-Prandial Digestion Thermogenesis" },
  { hour: "14:00", bpm: 72, zone: "Resting", activity: "Desk Ergonomics & Vitals Check" },
  { hour: "15:00", bpm: 75, zone: "Resting", activity: "Mid-Afternoon Work Session" },
  { hour: "16:00", bpm: 78, zone: "Light Walk", activity: "Campus Walk & Water Refill" },
  { hour: "17:00", bpm: 84, zone: "Light Walk", activity: "Evening Commute Return" },
  { hour: "18:00", bpm: 132, zone: "Cardio Burn", activity: "Aerobic Jogging & Interval Training" },
  { hour: "19:00", bpm: 138, zone: "Peak Surge", activity: "HIIT Peak Sprints (Max HR Surge)" },
  { hour: "20:00", bpm: 88, zone: "Light Walk", activity: "Post-Workout Cool Down & Dinner" },
  { hour: "21:00", bpm: 72, zone: "Resting", activity: "Family Time & Digital Detox" },
  { hour: "22:00", bpm: 66, zone: "Resting", activity: "Pre-Sleep Meditation & Reading" },
  { hour: "23:00", bpm: 60, zone: "Deep Sleep", activity: "Sleep Onset & Nocturnal Vitals" },
];

export const INITIAL_STEP_TRACKING: StepTrackingRecord = {
  totalSteps: 7840,
  goalSteps: 10000,
  distanceKm: 5.8,
  caloriesBurned: 412,
  activeMinutes: 52,
  cadenceBpm: 114,
  strideCm: 74,
  isSensorTracking: false,
  trackingMode: "automated_ai_prediction",
  hourlyDistribution: [
    { hour: "06:00", steps: 320 },
    { hour: "07:00", steps: 850 },
    { hour: "08:00", steps: 1420 },
    { hour: "09:00", steps: 210 },
    { hour: "10:00", steps: 180 },
    { hour: "11:00", steps: 290 },
    { hour: "12:00", steps: 940 },
    { hour: "13:00", steps: 350 },
    { hour: "14:00", steps: 160 },
    { hour: "15:00", steps: 220 },
    { hour: "16:00", steps: 680 },
    { hour: "17:00", steps: 890 },
    { hour: "18:00", steps: 2420 },
    { hour: "19:00", steps: 1100 },
    { hour: "20:00", steps: 410 },
    { hour: "21:00", steps: 190 },
  ],
};

// Unified Mock API Client
export const api = {
  async get<T = any>(endpoint: string, config?: { params?: Record<string, any> }): Promise<{ data: T }> {
    initializeStorage();
    const url = endpoint.split('?')[0];
    const params = config?.params || {};
    const currentUser = getUser();
    let result: any = null;

    // 1. /auth/me
    if (url === '/auth/me') {
      result = currentUser;
    }

    // 2. /profile
    else if (url === '/profile') {
      const pKey = currentUser ? `profile_${currentUser.id}` : 'profile_default';
      result = getStored<Profile>(pKey, {
        preferred_name: currentUser?.preferred_name || "User",
        photo_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04",
        age_bracket: "adult",
        language: "en",
        location: "Hyderabad",
        managed_by_guardian: false,
        first_aid_cpr: true,
        blood_group: "O+",
        willing_to_donate: true,
      });
    }

    // 2b. /guardian-alerts
    else if (url === '/guardian-alerts') {
      result = getStored<GuardianAlert[]>('guardian_alerts', generate10GuardianAlerts());
    }

    // 3. /hospitals
    else if (url === '/hospitals') {
      let items = getStored<Hospital[]>('hospitals', INITIAL_HOSPITALS);
      if (params.specialty && params.specialty !== 'all') {
        items = items.filter(h => h.specialties.includes(params.specialty));
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q));
      }
      result = items;
    }

    // 4. /patients
    else if (url === '/patients') {
      let items = getStored<PatientRecord[]>('patients', INITIAL_PATIENTS);
      if (params.gender && params.gender !== 'all') {
        items = items.filter(p => p.gender.toLowerCase() === params.gender.toLowerCase());
      }
      if (params.severity && params.severity !== 'all') {
        items = items.filter(p => p.severity.toLowerCase() === params.severity.toLowerCase());
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(p => p.name.toLowerCase().includes(q) || p.issue.toLowerCase().includes(q));
      }
      const page = params.page || 1;
      const perPage = params.per_page || 10;
      const total = items.length;
      const paginated = items.slice((page - 1) * perPage, page * perPage);
      result = {
        total,
        page,
        per_page: perPage,
        items: paginated,
      };
    }

    // 5. /patients/stats
    else if (url === '/patients/stats') {
      const items = getStored<PatientRecord[]>('patients', INITIAL_PATIENTS);
      const sev = {
        critical: items.filter(p => p.severity === 'critical').length,
        high: items.filter(p => p.severity === 'high').length,
        medium: items.filter(p => p.severity === 'medium').length,
        low: items.filter(p => p.severity === 'low').length,
      };
      const admitted = items.filter(p => p.admitted).length;
      result = {
        total: items.length,
        admitted,
        severity: sev,
      };
    }

    // 6. /hospital/overview
    else if (url === '/hospital/overview') {
      const patients = getStored<PatientRecord[]>('patients', INITIAL_PATIENTS);
      const beds = getStored<BedCapacity>('beds', INITIAL_BEDS);
      const ambulances = getStored<Ambulance[]>('ambulances', INITIAL_AMBULANCES);

      const stats = {
        total: patients.length,
        admitted: patients.filter(p => p.admitted).length,
        severity: {
          critical: patients.filter(p => p.severity === 'critical').length,
          high: patients.filter(p => p.severity === 'high').length,
          medium: patients.filter(p => p.severity === 'medium').length,
          low: patients.filter(p => p.severity === 'low').length,
        }
      };

      const amb = {
        total: ambulances.length,
        out: ambulances.filter(a => a.status === 'out').length,
        available: ambulances.filter(a => a.status === 'available').length,
      };

      result = {
        patients: stats,
        beds,
        ambulances: amb,
      };
    }

    // 7. /ambulances, /doctors, /pharmacy
    else if (url === '/ambulances') {
      let items = getStored<Ambulance[]>('ambulances', []);
      if (params.status && params.status !== 'all') {
        items = items.filter(a => a.status === params.status);
      }
      if (params.type && params.type !== 'all') {
        items = items.filter(a => a.type?.toLowerCase().includes(params.type.toLowerCase()));
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(a => a.vehicle_no.toLowerCase().includes(q) || a.driver_name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
      }
      result = items;
    }
    else if (url === '/doctors') {
      let items = getStored<Doctor[]>('doctors', []);
      if (params.department && params.department !== 'all') {
        items = items.filter(d => d.department.toLowerCase().includes(params.department.toLowerCase()) || d.specialty.toLowerCase().includes(params.department.toLowerCase()));
      }
      if (params.status && params.status !== 'all') {
        items = items.filter(d => d.status === params.status);
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.hospital_name.toLowerCase().includes(q) || (d.city && d.city.toLowerCase().includes(q)));
      }
      result = items;
    }
    else if (url === '/pharmacy') {
      let items = getStored<PharmacyItem[]>('pharmacy', []);
      if (params.category && params.category !== 'all') {
        items = items.filter(p => p.category.toLowerCase().includes(params.category.toLowerCase()));
      }
      if (params.stock_status === 'low') {
        items = items.filter(p => p.stock <= p.reorder_level);
      } else if (params.stock_status === 'critical') {
        items = items.filter(p => p.stock <= Math.floor(p.reorder_level * 0.5));
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      result = items;
    }

    // 8. /alerts
    else if (url === '/alerts') {
      let items = getStored<SOSAlert[]>('alerts', INITIAL_ALERTS);
      if (params.kind && params.kind !== 'all') {
        items = items.filter(a => a.kind === params.kind);
      }
      result = items;
    }

    // 9. /blood/requests and /blood/donors
    else if (url === '/blood/requests') {
      let items = getStored<BloodRequest[]>('blood_requests', []);
      if (params.blood_group && params.blood_group !== 'all') {
        items = items.filter(b => b.blood_group === params.blood_group);
      }
      if (params.urgency && params.urgency !== 'all') {
        items = items.filter(b => b.urgency === params.urgency);
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(b => b.hospital.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.patient_name.toLowerCase().includes(q));
      }
      result = items;
    }
    else if (url === '/blood/donors') {
      let items = getStored<BloodDonor[]>('blood_donors', []);
      if (params.blood_group && params.blood_group !== 'all') {
        items = items.filter(d => d.blood_group === params.blood_group);
      }
      if (params.city && params.city !== 'all') {
        items = items.filter(d => d.city === params.city);
      }
      if (params.eligible === 'true' || params.eligible === true) {
        items = items.filter(d => d.eligible);
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(d => d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.city.toLowerCase().includes(q));
      }
      result = items;
    }

    // 10. /awareness
    else if (url === '/awareness') {
      const lang = params.language || 'en';
      const items = getStored<AwarenessArticle[]>('awareness', INITIAL_AWARENESS);
      const filtered = items.filter(a => a.language === lang);
      result = filtered.length > 0 ? filtered : items.filter(a => a.language === 'en');
    }

    // 11. /medicines
    else if (url === '/medicines') {
      result = getStored<Medicine[]>('medicines', INITIAL_MEDICINES);
    }

    // 12. /admin/network
    else if (url === '/admin/network') {
      const hospitals = getStored<Hospital[]>('hospitals', INITIAL_HOSPITALS);
      const alerts = getStored<SOSAlert[]>('alerts', INITIAL_ALERTS);
      const triages = getStored<TriageMessage[]>('triage_messages', []);
      const ambulances = getStored<Ambulance[]>('ambulances', []);

      const cityTelemetry = [
        { city: "Hyderabad Metro", hospitals: 62, icu_beds: 184, ambulances: 48, avg_latency: "4.2 min", status: "Optimal", dispatch_rate: "98.4%", color: "teal" },
        { city: "Bengaluru Urban", hospitals: 58, icu_beds: 172, ambulances: 45, avg_latency: "5.1 min", status: "Optimal", dispatch_rate: "97.8%", color: "teal" },
        { city: "Delhi NCR", hospitals: 74, icu_beds: 218, ambulances: 54, avg_latency: "6.4 min", status: "High Demand", dispatch_rate: "96.2%", color: "amber" },
        { city: "Mumbai Metropolitan", hospitals: 68, icu_beds: 195, ambulances: 50, avg_latency: "5.8 min", status: "High Demand", dispatch_rate: "96.9%", color: "amber" },
        { city: "Chennai Core", hospitals: 46, icu_beds: 142, ambulances: 36, avg_latency: "4.6 min", status: "Optimal", dispatch_rate: "98.1%", color: "teal" },
        { city: "Kolkata Greater", hospitals: 42, icu_beds: 128, ambulances: 32, avg_latency: "4.9 min", status: "Optimal", dispatch_rate: "97.5%", color: "teal" },
        { city: "Pune Urban", hospitals: 38, icu_beds: 114, ambulances: 28, avg_latency: "4.7 min", status: "Optimal", dispatch_rate: "98.0%", color: "teal" },
        { city: "Ahmedabad Corridor", hospitals: 34, icu_beds: 98, ambulances: 24, avg_latency: "4.4 min", status: "Optimal", dispatch_rate: "98.3%", color: "teal" }
      ];

      result = {
        patients: 1840,
        hospitals_active: hospitals.filter(h => h.verified).length,
        hospitals_pending: hospitals.filter(h => !h.verified).length,
        guardians: 342,
        first_aid_responders: 129,
        blood_donors: 580,
        total_triages: 412 + triages.length,
        open_alerts: alerts.filter(a => a.status === 'open').length,
        ambulances_active: ambulances.length > 0 ? ambulances.length : 520,
        ambulances_on_road: ambulances.filter(a => a.status === 'out').length || 148,
        total_beds_monitored: 18420,
        icu_capacity_utilization: "74.2%",
        avg_network_response_time: "4.8 mins",
        blood_reserve_index: "94.6% (Balanced)",
        disaster_recovery_ready: true,
        city_breakdown: cityTelemetry,
      };
    }

    // 13. /admin/verification-queue
    else if (url === '/admin/verification-queue') {
      const hospitals = getStored<Hospital[]>('hospitals', INITIAL_HOSPITALS);
      result = hospitals.filter(h => !h.verified);
    }

    // 14. /feedback
    else if (url === '/feedback') {
      result = getStored<FeedbackItem[]>('feedback', generate60FeedbackItems());
    }

    // 15. /admin/scams
    else if (url === '/admin/scams') {
      result = getStored<ScamReport[]>('scams', generate50ScamReports());
    }

    // 16. /admin/audit-logs
    else if (url === '/admin/audit-logs') {
      result = getStored<AdminAuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    }

    // 17. /admin/security
    else if (url === '/admin/security') {
      result = getStored<SecurityStatus>('security_status', INITIAL_SECURITY);
    }

    // 18. /notifications
    else if (url === '/notifications') {
      const u = getUser();
      const role = u?.role || 'patient';
      const rKey = `notifications_${role}`;
      let roleNotifs = getStored<NotificationItem[]>(rKey, []);
      if (!roleNotifs || roleNotifs.length === 0) {
        roleNotifs = generateRoleSpecificNotifications(role);
        setStored(rKey, roleNotifs);
      }
      result = roleNotifs;
    }

    // 19. /wearables
    else if (url === '/wearables') {
      result = getStored<WearableDevice[]>('wearable_devices', INITIAL_WEARABLE_DEVICES);
    }

    // 20. /wearables/vitals
    else if (url === '/wearables/vitals') {
      // Simulate slight physiological pulse variation around 72-76
      const baseVitals = getStored<VitalSignRecord>('live_vitals', {
        heartRate: 74,
        restingHeartRate: 62,
        maxHeartRate: 138,
        minHeartRate: 55,
        hrv: 64,
        spo2: 98,
        bloodPressureSys: 118,
        bloodPressureDia: 76,
        respiratoryRate: 15,
        skinTempCelsius: 36.6,
        stressScore: 18,
        timestamp: "Live telemetry (active streaming)"
      });
      // Micro-jitter to give real sensor telemetry feel
      const jitter = Math.floor(Math.random() * 3) - 1;
      result = {
        ...baseVitals,
        heartRate: Math.max(58, Math.min(130, baseVitals.heartRate + jitter)),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    }

    // 21. /wearables/24h-heart-rate
    else if (url === '/wearables/24h-heart-rate') {
      result = getStored<HourlyHeartRatePoint[]>('24h_heart_rate', INITIAL_24H_HEART_RATE);
    }

    // 22. /wearables/steps
    else if (url === '/wearables/steps') {
      result = getStored<StepTrackingRecord>('step_tracking', INITIAL_STEP_TRACKING);
    }

    return { data: result as T };
  },

  async post<T = any>(endpoint: string, payload: any): Promise<{ data: T }> {
    initializeStorage();
    const url = endpoint.split('?')[0];
    const currentUser = getUser();
    let result: any = { ok: true };

    // 1. /auth/signup
    if (url === '/auth/signup') {
      const accounts = getStored<any[]>('registered_accounts', []);
      const existing = accounts.find(a => a.email.toLowerCase() === (payload.email || '').toLowerCase().trim());
      if (existing) {
        throw new Error('An account with this email is already registered.');
      }
      const role = payload.role || 'patient';
      const name = payload.name || payload.email.split('@')[0];
      const newAcc = {
        email: payload.email,
        password: payload.password || 'password123',
        role,
        name,
        phone: payload.phone
      };
      setStored('registered_accounts', [newAcc, ...accounts]);

      const isOnboarded = role !== 'patient' || Boolean(payload.completed_onboarding);
      const user: User = {
        id: `usr-${Date.now()}`,
        email: payload.email,
        phone: payload.phone,
        role,
        created_at: new Date().toISOString(),
        onboarded: isOnboarded,
        preferred_name: name,
      };
      const token = `token-${user.id}`;
      saveAuth(token, user);

      // Initialize matching profile
      const parsedAge = payload.age ? parseInt(payload.age, 10) : 24;
      const ageBracket = parsedAge < 18 ? "teen" : parsedAge >= 60 ? "senior" : "adult";
      const initialProfile: Profile = {
        user_id: user.id,
        preferred_name: name,
        photo_url: role === 'patient' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04" : undefined,
        age: parsedAge,
        gender: payload.gender || "Male",
        age_bracket: ageBracket,
        language: payload.language || "en",
        location: payload.location || "Hyderabad",
        guardian_name: payload.guardian_name || "",
        guardian_contact: payload.guardian_phone || payload.guardian_contact || "",
        managed_by_guardian: Boolean(payload.guardian_name),
        first_aid_cpr: payload.first_aid_cpr !== undefined ? Boolean(payload.first_aid_cpr) : true,
        first_aid_level: payload.first_aid_level || (payload.first_aid_cpr ? "Certified / Trained" : "Basic Awareness"),
        blood_group: payload.blood_group || "O+",
        willing_to_donate: payload.willing_to_donate !== undefined ? Boolean(payload.willing_to_donate) : true,
        updated_at: new Date().toISOString(),
      };
      setStored(`profile_${user.id}`, initialProfile);

      // If voluntary blood donor, enroll into community blood network
      if (initialProfile.willing_to_donate && role === 'patient') {
        const donors = getStored<BloodDonor[]>('blood_donors', []);
        const newDonor: BloodDonor = {
          id: `bd-${Date.now()}`,
          name: name,
          blood_group: initialProfile.blood_group,
          city: initialProfile.location,
          location: initialProfile.location,
          phone: payload.phone || "+91 98450 12345",
          eligible: true,
          verified_donor: true,
          donations_count: 1,
          last_donated: "Eligible now"
        };
        setStored('blood_donors', [newDonor, ...donors]);
      }

      result = { token, user };
    }

    // 2. /auth/login
    else if (url === '/auth/login') {
      const accounts = getStored<any[]>('registered_accounts', []);
      const enteredEmail = (payload.email || '').toLowerCase().trim();
      const enteredPass = (payload.password || '').trim();
      const isOtpLogin = Boolean(payload.otpLogin);

      if (!enteredEmail) {
        throw new Error('Please enter a valid email address.');
      }
      if (!isOtpLogin && !enteredPass) {
        throw new Error('Please enter your password or sign in with Email OTP.');
      }

      const match = accounts.find(a => a.email.toLowerCase() === enteredEmail);
      if (match) {
        if (!isOtpLogin && match.password && enteredPass !== match.password) {
          throw new Error('Invalid credentials. Password does not match our records.');
        }
        const user: User = {
          id: `usr-${match.role}-${Date.now()}`,
          email: match.email,
          role: match.role,
          created_at: new Date().toISOString(),
          onboarded: true,
          preferred_name: match.name,
        };
        const token = `token-${user.id}`;
        saveAuth(token, user);

        // Ensure profile exists
        const profKey = `profile_${user.id}`;
        const existingProf = getStored<Profile | null>(profKey, null);
        if (!existingProf) {
          setStored(profKey, {
            preferred_name: match.name,
            photo_url: match.role === 'patient' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04" : undefined,
            age_bracket: "adult",
            language: "en",
            location: "Hyderabad",
            managed_by_guardian: false,
            first_aid_cpr: true,
            blood_group: "O+",
            willing_to_donate: true,
          } as Profile);
        }

        result = { token, user };
      } else if (isOtpLogin) {
        // Enrolled user via OTP sign-in
        const targetRole = payload.role || 'patient';
        const user: User = {
          id: `usr-${targetRole}-${Date.now()}`,
          email: enteredEmail,
          role: targetRole,
          created_at: new Date().toISOString(),
          onboarded: true,
          preferred_name: enteredEmail.split('@')[0],
        };
        const token = `token-${user.id}`;
        saveAuth(token, user);
        
        // Save to registered accounts
        setStored('registered_accounts', [...accounts, {
          email: enteredEmail,
          role: targetRole,
          name: enteredEmail.split('@')[0],
        }]);

        const profKey = `profile_${user.id}`;
        setStored(profKey, {
          preferred_name: enteredEmail.split('@')[0],
          photo_url: targetRole === 'patient' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=HikariGuardian&hair=short01&eyes=variant04" : undefined,
          age_bracket: "adult",
          language: "en",
          location: "Hyderabad",
          managed_by_guardian: false,
          first_aid_cpr: true,
          blood_group: "O+",
          willing_to_donate: true,
        } as Profile);

        result = { token, user };
      } else {
        // Unknown account
        throw new Error('Account not found with this email. Please register or use Sign In with Email OTP.');
      }
    }

    // 2b. /admin/verify-2fa
    else if (url === '/admin/verify-2fa') {
      const enteredCode = (payload.code || '').trim();
      // Accepts security PIN: 829410 or test code 123456
      if (enteredCode !== '829410' && enteredCode !== '123456') {
        throw new Error('Invalid Two-Factor Authentication (2FA) verification code. Expected 6-digit administrative authenticator code.');
      }

      // Log 2FA authorization
      const currentLogs = getStored<AdminAuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
      const newLog: AdminAuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actor_email: currentUser?.email || 'admin@silentguardian.com',
        action: payload.action || '2FA_CHALLENGE_SUCCESS',
        target: payload.target || 'Admin Security Gateway',
        status: 'authorized',
        ip_address: '192.168.1.104',
        details: payload.details || 'Biometric / TOTP challenge passed',
      };
      setStored('audit_logs', [newLog, ...currentLogs]);

      result = { ok: true, verified: true, log_id: newLog.id };
    }

    // 2c. /admin/audit-logs
    else if (url === '/admin/audit-logs') {
      const currentLogs = getStored<AdminAuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
      const newLog: AdminAuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actor_email: currentUser?.email || 'admin@silentguardian.com',
        action: payload.action || 'ADMIN_OPERATION',
        target: payload.target || 'System',
        status: payload.status || 'authorized',
        ip_address: '192.168.1.104',
        details: payload.details || '',
      };
      setStored('audit_logs', [newLog, ...currentLogs]);
      result = { ok: true, log: newLog };
    }

    // 2d. /admin/security
    else if (url === '/admin/security') {
      const sec = getStored<SecurityStatus>('security_status', INITIAL_SECURITY);
      const updated = { ...sec, ...payload };
      setStored('security_status', updated);
      result = { ok: true, security: updated };
    }

    // 3. /profile
    else if (url === '/profile') {
      if (currentUser) {
        setStored(`profile_${currentUser.id}`, payload);
        saveAuth(localStorage.getItem('sg_token') || '', {
          ...currentUser,
          onboarded: true,
          preferred_name: payload.preferred_name || currentUser.preferred_name,
        });

        if (payload.willing_to_donate) {
          const donors = getStored<BloodDonor[]>('blood_donors', []);
          const existingDonorIdx = donors.findIndex(d => d.name === (payload.preferred_name || currentUser.preferred_name));
          const donorEntry: BloodDonor = {
            id: existingDonorIdx >= 0 ? donors[existingDonorIdx].id : `bd-${Date.now()}`,
            name: payload.preferred_name || currentUser.preferred_name || "Community Volunteer",
            blood_group: payload.blood_group || "O+",
            city: payload.location || "Hyderabad",
            location: payload.location || "Hyderabad",
            phone: payload.phone || currentUser.phone || "+91 98450 12345",
            eligible: true,
            verified_donor: true,
            donations_count: 1,
            last_donated: "Eligible now"
          };
          if (existingDonorIdx >= 0) {
            donors[existingDonorIdx] = donorEntry;
            setStored('blood_donors', [...donors]);
          } else {
            setStored('blood_donors', [donorEntry, ...donors]);
          }
        }
      }
      result = { ok: true };
    }

    // 4. /alerts
    else if (url === '/alerts') {
      const currentAlerts = getStored<SOSAlert[]>('alerts', INITIAL_ALERTS);
      const newAlert: SOSAlert = {
        id: `alt-${Date.now()}`,
        user_id: currentUser?.id,
        user_name: currentUser?.preferred_name || currentUser?.email || "Community User",
        kind: payload.kind || 'medical',
        severity: payload.severity || 'high',
        note: payload.note || 'Emergency assistance requested',
        location: payload.location || 'Current GPS Location',
        status: 'open',
        created_at: 'Just now',
      };
      setStored('alerts', [newAlert, ...currentAlerts]);
      result = { ok: true, id: newAlert.id };
    }

    // 5. /awareness
    else if (url === '/awareness') {
      const articles = getStored<AwarenessArticle[]>('awareness', INITIAL_AWARENESS);
      const newArticle: AwarenessArticle = {
        id: `aw-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        language: payload.language || 'en',
        category: payload.category || 'General',
        author: currentUser?.email || 'Platform Admin',
        created_at: 'Just now',
      };
      setStored('awareness', [newArticle, ...articles]);
      result = { ok: true, id: newArticle.id };
    }

    // 6. /admin/verify
    else if (url === '/admin/verify') {
      const hospitals = getStored<Hospital[]>('hospitals', INITIAL_HOSPITALS);
      const updated = hospitals.map(h => {
        if (h.id === payload.hospital_id) {
          return { ...h, verified: payload.approve };
        }
        return h;
      }).filter(h => payload.approve ? true : h.id !== payload.hospital_id);
      setStored('hospitals', updated);
      result = { ok: true };
    }

    // 7. /feedback
    else if (url === '/feedback') {
      const feedback = getStored<FeedbackItem[]>('feedback', INITIAL_FEEDBACK);
      const item: FeedbackItem = {
        id: `fb-${Date.now()}`,
        source: payload.source || 'patient',
        rating: payload.rating || 5,
        message: payload.message || '',
        created_at: 'Just now',
      };
      setStored('feedback', [item, ...feedback]);
      result = { ok: true };
    }

    // 8. /triage/chat
    else if (url === '/triage/chat') {
      const lang = payload.lang || 'en';
      const res = evaluateSymptomTriage(payload.message, lang);
      const triages = getStored<TriageMessage[]>('triage_messages', []);
      triages.push({
        id: `tr-${Date.now()}`,
        user_id: currentUser?.id,
        session_id: payload.session_id,
        user_msg: payload.message,
        assistant_msg: res.message,
        ts: new Date().toISOString(),
      });
      setStored('triage_messages', triages);

      // If emergency or high urgency, automatically log a Guardian Alert!
      if (res.guardianAlertTriggered) {
        const currentAlerts = getStored<GuardianAlert[]>('guardian_alerts', generate10GuardianAlerts());
        const autoAlert: GuardianAlert = {
          id: `grd-auto-${Date.now()}`,
          user_name: currentUser?.preferred_name || "User",
          relation: "Family Ward (You)",
          age: 38,
          guardian_name: "Designated Emergency Guardian",
          guardian_phone: "+91 98490 12841",
          condition: payload.message.slice(0, 90),
          severity: res.severity as any,
          vitals: res.severity === 'critical' ? { bp: "168/104 mmHg", pulse: 114, spo2: "93%" } : { temp: "102.6°F", pulse: 98 },
          trigger_source: "Live User AI Triage",
          location: "Current Registered User Location (Hyderabad)",
          timestamp: "Just now",
          action_taken: "Guardian Emergency Beacon broadcasted with live vital triage summary.",
          status: res.severity === 'critical' ? "Dispatched & En Route" : "Stabilized & Monitored"
        };
        setStored('guardian_alerts', [autoAlert, ...currentAlerts]);
      }

      result = {
        reply: res.message,
        isEmergency: res.isEmergency,
        severity: res.severity,
        specialist: res.specialist,
        guardian_alert_triggered: res.guardianAlertTriggered,
        guardian_alert_message: res.guardianAlertMessage,
        recommended_medicines: res.recommendedMedicines,
        emergency_hotlines: res.emergencyHotlines,
        doctor_recommendation: res.doctorRecommendation,
        detected_topic: res.detectedTopic,
      };
    }

    // 8b. /guardian-alerts
    else if (url === '/guardian-alerts') {
      const current = getStored<GuardianAlert[]>('guardian_alerts', generate10GuardianAlerts());
      const newAlert: GuardianAlert = {
        id: `grd-${Date.now()}`,
        user_name: payload.user_name || currentUser?.preferred_name || 'Protected User',
        relation: payload.relation || 'Family Ward',
        age: payload.age || 45,
        guardian_name: payload.guardian_name || 'Designated Family Guardian',
        guardian_phone: payload.guardian_phone || '+91 98490 12841',
        condition: payload.condition || 'Emergency Vital Condition',
        severity: payload.severity || 'high',
        vitals: payload.vitals || { bp: '135/88 mmHg', pulse: 98, temp: '99.1°F' },
        trigger_source: payload.trigger_source || 'AI Triage Detection',
        location: payload.location || 'Current GPS Location',
        timestamp: 'Just now',
        action_taken: payload.action_taken || 'Guardian notified via Priority Voice Chime & 108 Emergency Ambulance Alert',
        status: payload.status || 'Dispatched & En Route'
      };
      setStored('guardian_alerts', [newAlert, ...current]);
      result = { ok: true, alert: newAlert };
    }

    // 9. /notifications/read
    else if (url === '/notifications/read') {
      const u = getUser();
      const role = u?.role || 'patient';
      const rKey = `notifications_${role}`;
      const notifs = getStored<NotificationItem[]>(rKey, generateRoleSpecificNotifications(role));
      const updated = notifs.map(n => n.id === payload.id ? { ...n, read: true } : n);
      setStored(rKey, updated);
      result = { ok: true };
    }

    // 10. /notifications/read-all
    else if (url === '/notifications/read-all') {
      const u = getUser();
      const role = u?.role || 'patient';
      const rKey = `notifications_${role}`;
      const notifs = getStored<NotificationItem[]>(rKey, generateRoleSpecificNotifications(role));
      const updated = notifs.map(n => ({ ...n, read: true }));
      setStored(rKey, updated);
      result = { ok: true };
    }

    // 11. /notifications/add
    else if (url === '/notifications/add') {
      const notifs = getStored<NotificationItem[]>('notifications', generateSeedNotifications());
      const item: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        category: payload.category || 'system',
        priority: payload.priority || 'normal',
        timestamp: new Date().toISOString(),
        read: false,
        action_url: payload.action_url,
        action_label: payload.action_label,
      };
      setStored('notifications', [item, ...notifs]);
      result = item;
    }

    // 12. /admin/audit-logs/add
    else if (url === '/admin/audit-logs/add') {
      const logs = getStored<AdminAuditLog[]>('audit_logs', []);
      const newLog: AdminAuditLog = {
        id: `AUD-2026-${String(logs.length + 1).padStart(4, '0')}`,
        timestamp: new Date().toISOString(),
        actor_email: payload.actor_email || currentUser?.email || 'admin@silentguardian.com',
        admin_email: payload.admin_email || currentUser?.email || 'admin@silentguardian.com',
        action: payload.action,
        action_type: payload.action_type || 'MANUAL_AUDIT',
        category: payload.category || 'Security Policy',
        severity: payload.severity || 'info',
        target: payload.target || 'System',
        target_resource: payload.target || 'System',
        details: payload.details || '',
        ip_address: payload.ip_address || '10.240.18.92',
        status: payload.status || 'authorized',
        two_factor_verified: true,
        tamper_hash: `0x${Math.random().toString(16).substring(2, 10)}`
      };
      setStored('audit_logs', [newLog, ...logs]);
      result = newLog;
    }

    // 13. /wearables/toggle-connect
    else if (url === '/wearables/toggle-connect') {
      const devices = getStored<WearableDevice[]>('wearable_devices', INITIAL_WEARABLE_DEVICES);
      const updated = devices.map(d => {
        if (d.id === payload.deviceId) {
          const nextConnected = !d.connected;
          return {
            ...d,
            connected: nextConnected,
            lastSync: nextConnected ? "Live streaming (just now)" : "Disconnected",
          };
        }
        return d;
      });
      setStored('wearable_devices', updated);
      result = updated;
    }

    // 14. /wearables/add-steps
    else if (url === '/wearables/add-steps') {
      const current = getStored<StepTrackingRecord>('step_tracking', INITIAL_STEP_TRACKING);
      const delta = payload.stepsDelta || 1;
      const nextSteps = current.totalSteps + delta;
      const distanceAdded = (delta * current.strideCm) / 100000; // in km
      const caloriesAdded = Math.max(1, Math.round(delta * 0.045));
      const nextDistance = parseFloat((current.distanceKm + distanceAdded).toFixed(2));
      const nextCalories = current.caloriesBurned + caloriesAdded;
      const nextActiveMinutes = current.activeMinutes + (delta > 30 ? 1 : 0);

      // Update current hour's distribution
      const currentHourStr = `${String(new Date().getHours()).padStart(2, '0')}:00`;
      const updatedDist = [...current.hourlyDistribution];
      const existingHourIdx = updatedDist.findIndex(h => h.hour === currentHourStr);
      if (existingHourIdx >= 0) {
        updatedDist[existingHourIdx].steps += delta;
      } else {
        updatedDist.push({ hour: currentHourStr, steps: delta });
      }

      const updatedRecord: StepTrackingRecord = {
        ...current,
        totalSteps: nextSteps,
        distanceKm: nextDistance,
        caloriesBurned: nextCalories,
        activeMinutes: nextActiveMinutes,
        hourlyDistribution: updatedDist,
      };
      setStored('step_tracking', updatedRecord);
      result = updatedRecord;
    }

    // 15. /wearables/set-tracking-mode
    else if (url === '/wearables/set-tracking-mode') {
      const current = getStored<StepTrackingRecord>('step_tracking', INITIAL_STEP_TRACKING);
      const updated: StepTrackingRecord = {
        ...current,
        trackingMode: payload.trackingMode || current.trackingMode,
        isSensorTracking: payload.isSensorTracking !== undefined ? payload.isSensorTracking : current.isSensorTracking,
      };
      setStored('step_tracking', updated);
      result = updated;
    }

    // 16. /auth/send-otp
    else if (url === '/auth/send-otp') {
      const email = (payload.email || '').toLowerCase().trim();
      // First try to hit real server if available
      try {
        const sRes = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          return { data: sData as T };
        }
      } catch {}

      // Fallback in-browser OTP generator
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      setStored(`otp_${email}`, { code, expiresAt });
      result = {
        success: true,
        email,
        message: `Security verification OTP dispatched to ${email}.`,
        expiresInSeconds: 300,
        testPreviewCode: code,
      };
    }

    // 17. /auth/verify-otp
    else if (url === '/auth/verify-otp') {
      const email = (payload.email || '').toLowerCase().trim();
      const code = (payload.code || '').trim();

      // First try server endpoint
      try {
        const sRes = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          return { data: sData as T };
        }
      } catch {}

      // Local fallback check
      const stored = getStored<{ code: string; expiresAt: number } | null>(`otp_${email}`, null);
      const isValid = (stored && stored.code === code && Date.now() <= stored.expiresAt) || code === '829410' || code === '123456';

      if (!isValid) {
        throw new Error('Invalid or expired OTP verification code. Please check your email or use test code.');
      }
      result = {
        verified: true,
        email,
        message: 'Email address verified successfully with Silent Guardian Security Grid.'
      };
    }

    // 18. /gemini/grounded-health-search
    else if (url === '/gemini/grounded-health-search') {
      try {
        const sRes = await fetch('/api/gemini/grounded-health-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          return { data: sData as T };
        }
      } catch {}

      // Fallback grounded answer
      const q = (payload.query || '').toLowerCase();
      result = {
        answer: `Verified Clinical Guidance for "${payload.query}":
• First Aid / Immediate Action: Rest, ensure continuous hydration with oral electrolytes, and isolate if viral infection is suspected.
• Grounded Safety Standard: If resting heart rate exceeds 110 BPM, blood oxygen drops below 94%, or high fever persists for >48 hours, immediately visit an accredited trauma care center.
• Search Grounding Verification: Cross-referenced with National Health Portal (NHP) and WHO Clinical Practice Guidelines.`,
        groundingChunks: [
          { web: { uri: "https://www.who.int/health-topics", title: "World Health Organization Clinical Database" } },
          { web: { uri: "https://www.nhp.gov.in/", title: "National Health Portal of India (NHP)" } },
          { web: { uri: "https://www.icmr.gov.in/", title: "Indian Council of Medical Research Treatment Protocol" } },
        ],
        webSearchQueries: [payload.query, `${payload.query} treatment protocol`],
        simulated: true,
      };
    }

    return { data: result as T };
  }
};

// Convenience API exports
export const sendEmailOtp = async (email: string) => {
  return (await api.post('/auth/send-otp', { email })).data;
};

export const verifyEmailOtp = async (email: string, code: string) => {
  return (await api.post('/auth/verify-otp', { email, code })).data;
};

export const searchGroundedHealth = async (query: string, language: string = 'en') => {
  return (await api.post('/gemini/grounded-health-search', { query, language })).data;
};


