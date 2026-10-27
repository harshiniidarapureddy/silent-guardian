# Silent Guardian - Cross-Framework React Rewrite

Complete rewrite and migration of the **Silent Guardian** healthcare safety net platform from Dynamic/hybrid Python to a unified, production-grade **React SPA with Vite and Tailwind CSS**, featuring interactive health triage, multi-portal workflows (Patient, Hospital Command, Platform Admin), persistent local store with verified facility data, and emergency SOS dispatch.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive clarification:
> - **AI Health Triage**: Interactive in-browser triage engine strictly adhering to emergency escalation protocols, specialist matching, safe home care, and non-alarming guidance.
> - **Data & Persistence**: Complete client-side storage engine using `localStorage` pre-seeded with 15 verified hospitals, realistic patient intake queues, blood donor requests, emergency alerts, and pharmacy inventory.
> - **Portal Prioritization**: Defaults to the Patient Portal with an omnipresent quick-access switcher in the header to effortlessly test and navigate between Patient, Hospital Command Center, and Platform Admin consoles.

---

## 1. Overview & Core Concept

- **What It Does**: Silent Guardian is a community-grade healthcare safety net designed for everyday health guidance, emergency escalation, and facility coordination. It connects patients needing triage with nearby verified hospitals, community blood donors, and first-aid responders while giving hospital administrators real-time visibility into bed capacities, triage intake, and ambulance fleets.
- **Target Personas**:
  - *Patients & Families*: Seeking symptom triage, finding specialized hospitals with available emergency beds, managing emergency contacts/guardians, and responding to blood donor alerts.
  - *Hospital Staff & Command*: Monitoring live patient intake, bed/ICU/ventilator capacity, ambulance dispatch, and pharmacy stock.
  - *Platform Administrators*: Verifying healthcare facility credentials, publishing multilingual public health awareness articles, monitoring scams, and auditing network analytics.
- **Key Value**: Low-friction triage that mitigates healthcare panic, provides actionable home-care or specialist directions, and accelerates emergency response during critical situations.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Landing & Onboarding**:
   - Clean, modern landing experience highlighting core safety net pillars (AI Triage, Verified Hospitals, Blood Network, 5 Languages).
   - Multi-step onboarding collecting preferred name, language (English, Hindi, Telugu, Tamil, Spanish), life stage, guardian contact, first-aid CPR capability, and blood group.
2. **Patient Experience**:
   - *Overview*: Quick health stats (blood group, life stage, language, first-aid readiness) and direct shortcuts to AI Triage and SOS.
   - *AI Triage*: Real-time conversational symptom checker with voice dictation toggle, instant emergency symptom detection (red escalation warning if chest pain, stroke signs, or severe trauma), specialist recommendations, and safe guidance.
   - *Hospital Finder*: Searchable directory filtering by specialty (Cardiology, Pediatrics, Emergency, etc.) and search query, showing verified badges, address, contact, and live bed availability.
   - *Blood Network*: Urgent blood donation requests with required group badges, hospital names, contact triggers, and a "Register as Donor" toggle.
   - *Alerts & SOS*: Rapid trigger modal for Medical, Blood, or First-Aid emergencies with GPS location, notes, and severity level.
   - *Medicine Guide & Wellness*: Searchable OTC and prescription guide, daily hydration tracker, and guardian check-in status.
3. **Hospital Command Center**:
   - High-level metric cards for total intake, critical cases, bed occupancy (General, ICU, ER, Ventilators), and ambulance status.
   - Full patient intake data table with live filters for severity, gender, and issue, with one-click status transitions (Triage $\leftrightarrow$ Admitted).
   - Bed management sliders/controls to update real-time facility capacity.
4. **Platform Admin**:
   - Network analytics breakdown (active patients, verified vs pending hospitals, registered responders).
   - Verification queue with one-click "Approve" or "Reject" actions for pending clinics.
   - Multilingual awareness publishing tool allowing immediate broadcast of health tips to patient feeds.

### Visual Identity & Theme
- **Aesthetic Direction**: High-trust clinical minimalism. Clean white and light slate canvases with deep teal and emerald safety accents.
- **Color System (60-30-10 Rule)**:
  - Canvas (60%): Crisp `#F8FAFC` background with subtle dot grid accents (`sg-grid-bg`).
  - Structural Surfaces (30%): Pure white `#FFFFFF` cards with hairline slate borders (`border-slate-200`) and soft shadows.
  - Accent Budget (10%): Primary Teal (`#0F766E` / `bg-teal-700`) for navigation and patient actions; Amber (`#D97706`) for hospital operations; Slate (`#0F172A`) for administration; Crimson (`#DC2626`) strictly for emergency alerts.
- **Typography & Tabular Discipline**:
  - Display Font: `Plus Jakarta Sans` for headers and metric callouts.
  - Body Font: `DM Sans` / `Inter` for legibility.
  - Tabular Figures: `font-mono tabular-nums` for all stats, bed counts, timestamps, and patient metrics.
- **Anti-Slop Discipline**: No arbitrary pulsing dots on static text, no fake AI innovation scores, no code comments in UI, and unboxed inline metadata separated with `·`.

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side Reactive Data Store (`src/lib/api.ts`)**:
  - *Chosen Approach*: Replace the external MongoDB and FastAPI dependency with an in-browser persistent data layer (`localStorage`) maintaining the exact REST API contract of `app.py`.
  - *Why*: Guarantees instant 0ms latency, zero cold starts, offline resilience, and full interactive fidelity without needing an external database daemon.
- **Deterministic AI Triage Simulator with Safety Rules**:
  - *Chosen Approach*: Implement a structured symptom evaluation engine modeled after the exact `TRIAGE_SYSTEM` prompt, evaluating keywords for red-flag emergencies (angina, dyspnea, stroke, hemorrhage) and providing structured severity, specialist referrals, and safe home remedies.
  - *Why*: Eliminates dependency on external LLM token quotas while preserving 100% of the conversational UX, speech input, and medical triage safety guidelines.
- **Global Portal Switcher**:
  - *Chosen Approach*: Include a discreet top-bar role switcher ("Patient", "Hospital", "Admin") in development and demo modes, allowing instant persona toggling without manual re-login.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Vite React SPA                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 React Router v6                     │   │
│   │  /        /auth     /onboarding   /patient/*        │   │
│   │  /hospital/*        /admin/*                        │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                 DashShell & Layouts                 │   │
│   │  - Patient Portal (Overview, Triage, Hospitals,     │   │
│   │    Awareness, Blood Network, SOS Alerts, Meds)      │   │
│   │  - Hospital Portal (Overview, Intake, Beds, Fleet)  │   │
│   │  - Admin Portal (Network Stats, Verification, Feed) │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │             In-Memory & LocalStorage API            │   │
│   │  - Auth state (JWT emulation & User Session)        │   │
│   │  - Pre-seeded Hospitals, Beds, and Ambulances       │   │
│   │  - Patient Intake Table & Admission Controls        │   │
│   │  - Emergency Alerts & Blood Requests                │   │
│   │  - Rule-Based AI Triage with Emergency Escalations  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component & File Mapping
- `index.html`: Entry point with updated `<title>Silent Guardian · Healthcare Safety Net</title>` and meta tags.
- `vite.config.ts`: Vite React plugin with server config listening on port 3000, host `0.0.0.0`.
- `src/main.tsx` & `src/App.tsx`: App root with router, route guards (`Protected`), and `sonner` toaster.
- `src/lib/api.ts`: API emulator providing endpoints (`/auth/*`, `/profile`, `/triage/*`, `/hospitals`, `/patients`, `/alerts`, `/blood/requests`, `/awareness`, `/medicines`, `/hospital/overview`, `/admin/*`).
- `src/lib/mockData.ts`: Realistic initial seeds (15 hospitals, 20 patients, 5 blood requests, multilingual awareness articles).
- `src/components/DashShell.tsx`: Responsive navigation shell with live status indicators, portal switcher, and user profile drawer.
- `src/components/ui/*`: Tailored UI primitives (`Button`, `Input`, `Textarea`, `Select`, `Switch`, `Badge`, `Tabs`, `Table`, `Label`).
- `src/pages/*`: Fully ported, type-safe pages (`Landing`, `Auth`, `Onboarding`, `PatientDashboard`, `HospitalDashboard`, `AdminDashboard`).

---

## 5. Verification & Cleanup Plan

1. Verify dependencies in `package.json` and install with `npm install`.
2. Implement all source files in `src/`.
3. Test compilation using `compile_applet`.
4. Once compilation succeeds, clean up original legacy Python/root files (`app.py`, `requirements.txt`, loose `.jsx` files at root) per the rewrite skill instructions.
5. Update `README.md` to reflect the new React architecture.
