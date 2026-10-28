import {
  User, Profile, Hospital, PatientRecord, SOSAlert, BloodRequest, BloodDonor,
  AwarenessArticle, Medicine, BedCapacity, Ambulance, Doctor, PharmacyItem,
  FeedbackItem, ScamReport, TriageMessage, AdminAuditLog, SecurityStatus, NotificationItem
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
  generateSeedNotifications
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

  getStored('beds', INITIAL_BEDS);
  getStored('alerts', INITIAL_ALERTS);
  getStored('awareness', INITIAL_AWARENESS);
  getStored('feedback', INITIAL_FEEDBACK);
  getStored('scams', INITIAL_SCAMS);

  const logs = getStored<AdminAuditLog[]>('audit_logs', []);
  if (!logs || logs.length < 100) {
    setStored('audit_logs', generate150AuditLogs());
  }

  const notifs = getStored<NotificationItem[]>('notifications', []);
  if (!notifs || notifs.length === 0) {
    setStored('notifications', generateSeedNotifications());
  }

  getStored('security_status', INITIAL_SECURITY);
  getStored('triage_messages', [] as TriageMessage[]);


  // Default credentials for manual sign in
  const defaultAccounts = [
    { email: "patient@silentguardian.com", password: "password123", role: "patient", name: "Ramesh Sharma" },
    { email: "hospital@silentguardian.com", password: "password123", role: "hospital", name: "Apollo Command Care" },
    { email: "admin@silentguardian.com", password: "password123", role: "admin", name: "Lead Security Admin" },
  ];
  const registered = getStored('registered_accounts', defaultAccounts);
  setStored('registered_accounts', registered);

  // Default user if none exists
  if (!localStorage.getItem('sg_user')) {
    const defaultUser: User = {
      id: "usr-patient-main",
      email: "patient@silentguardian.com",
      role: "patient",
      created_at: new Date().toISOString(),
      onboarded: true,
      preferred_name: "Ramesh Sharma",
    };
    saveAuth("sg-token-patient", defaultUser);
    
    // Set matching profile with profile photo
    setStored('profile_usr-patient-main', {
      preferred_name: "Ramesh Sharma",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
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
        preferred_name: currentUser?.preferred_name || "Patient",
        age_bracket: "adult",
        language: "en",
        location: "Hyderabad",
        managed_by_guardian: false,
        first_aid_cpr: true,
        blood_group: "O+",
        willing_to_donate: true,
      });
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

      result = {
        patients: 1840,
        hospitals_active: hospitals.filter(h => h.verified).length,
        hospitals_pending: hospitals.filter(h => !h.verified).length,
        guardians: 342,
        first_aid_responders: 129,
        blood_donors: 580,
        total_triages: 412 + triages.length,
        open_alerts: alerts.filter(a => a.status === 'open').length,
      };
    }

    // 13. /admin/verification-queue
    else if (url === '/admin/verification-queue') {
      const hospitals = getStored<Hospital[]>('hospitals', INITIAL_HOSPITALS);
      result = hospitals.filter(h => !h.verified);
    }

    // 14. /feedback
    else if (url === '/feedback') {
      result = getStored<FeedbackItem[]>('feedback', INITIAL_FEEDBACK);
    }

    // 15. /admin/scams
    else if (url === '/admin/scams') {
      result = getStored<ScamReport[]>('scams', INITIAL_SCAMS);
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
      result = getStored<NotificationItem[]>('notifications', generateSeedNotifications());
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

      const user: User = {
        id: `usr-${Date.now()}`,
        email: payload.email,
        phone: payload.phone,
        role,
        created_at: new Date().toISOString(),
        onboarded: false,
        preferred_name: name,
      };
      const token = `token-${user.id}`;
      saveAuth(token, user);

      // Initialize matching profile
      setStored(`profile_${user.id}`, {
        preferred_name: name,
        photo_url: role === 'patient' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" : undefined,
        age_bracket: "adult",
        language: "en",
        location: "Hyderabad",
        managed_by_guardian: false,
        first_aid_cpr: false,
        blood_group: "O+",
        willing_to_donate: true,
      } as Profile);

      result = { token, user };
    }

    // 2. /auth/login
    else if (url === '/auth/login') {
      const accounts = getStored<any[]>('registered_accounts', []);
      const enteredEmail = (payload.email || '').toLowerCase().trim();
      const enteredPass = (payload.password || '').trim();

      if (!enteredEmail || !enteredPass) {
        throw new Error('Please enter both email and password.');
      }

      const match = accounts.find(a => a.email.toLowerCase() === enteredEmail);
      if (match) {
        if (match.password && enteredPass !== match.password) {
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
            photo_url: match.role === 'patient' ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" : undefined,
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
      } else {
        // Unknown account
        throw new Error('Account not found with this email. Please register or check credentials.');
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
          preferred_name: payload.preferred_name,
        });
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
      const res = evaluateSymptomTriage(payload.message);
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

      result = {
        reply: res.message,
        isEmergency: res.isEmergency,
        severity: res.severity,
        specialist: res.specialist,
      };
    }

    // 9. /notifications/read
    else if (url === '/notifications/read') {
      const notifs = getStored<NotificationItem[]>('notifications', generateSeedNotifications());
      const updated = notifs.map(n => n.id === payload.id ? { ...n, read: true } : n);
      setStored('notifications', updated);
      result = { ok: true };
    }

    // 10. /notifications/read-all
    else if (url === '/notifications/read-all') {
      const notifs = getStored<NotificationItem[]>('notifications', generateSeedNotifications());
      const updated = notifs.map(n => ({ ...n, read: true }));
      setStored('notifications', updated);
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

    return { data: result as T };
  }
};

