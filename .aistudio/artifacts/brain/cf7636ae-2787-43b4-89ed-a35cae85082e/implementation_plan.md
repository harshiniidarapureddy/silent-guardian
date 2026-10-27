# Silent Guardian - Cross-Framework React Rewrite (Revised)

Immediate resolution of dev server startup and complete migration of **Silent Guardian** into a verified **React SPA with Vite, TypeScript, and Tailwind CSS** running on port 3000 (host `0.0.0.0`).

## Immediate Action: Dev Server Fix & Startup

> [!IMPORTANT]
> **Priority 1: Immediate Dev Server Recovery**
> The root cause of the dev server not starting is that the imported GitHub project lacked a configured build toolchain (`vite.config.ts`, `index.html`, and installed `node_modules`). 
> Execution begins immediately with:
> 1. Setting up `vite.config.ts`, `index.html`, `tsconfig.json`, and Tailwind CSS configuration.
> 2. Installing all dependencies via `npm install` (`install_applet_dependencies`).
> 3. Launching and validating the Vite dev server on `0.0.0.0:3000`.

---

## 1. Overview & Ported Capabilities

Silent Guardian is a comprehensive community healthcare safety net offering:
- **Patient Portal**:
  - Personal health profile & life-stage setup.
  - Interactive AI Triage with safety escalation for life-threatening symptoms, specialist recommendations, and safe home remedies.
  - Searchable verified hospital directory with live emergency bed indicators.
  - Multilingual health awareness feed (English, Hindi, Telugu, Tamil, Spanish).
  - Community blood donation network with live urgent donor calls.
  - Instant Emergency SOS alerts with GPS/location coordinates.
  - Drug catalog & medicine safety guide.
  - Daily personal wellness check-in and guardian connectivity.
- **Hospital Command Center**:
  - Live patient triage intake queue with search and multi-criteria filters.
  - Real-time bed and capacity management (General, ICU, ER, Ventilators).
  - Ambulance fleet status and dispatch coordination.
  - Pharmacy stock and medical inventory monitor.
- **Platform Admin Console**:
  - Health network statistics and responder counts.
  - Hospital credential verification queue with one-click approve/reject actions.
  - Health bulletin publisher broadcasting awareness articles across 5 languages.
  - Community feedback and medical fraud/scam report review.
- **Global Role Switcher**:
  - Direct quick-switch banner allowing instant transitions between Patient, Hospital, and Admin interfaces.

---

## 2. Technical Architecture & Phased Execution

```
┌─────────────────────────────────────────────────────────────┐
│                 Phase 1: Dev Server & Core                  │
│   vite.config.ts + index.html + package.json + npm install  │
│   ──> Dev server active on 0.0.0.0:3000                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Phase 2: Data Engine & UI Shell                │
│   src/lib/api.ts (Persistent local storage & REST emulator) │
│   src/lib/mockData.ts (15 hospitals, 20 patients, alerts)   │
│   src/components/DashShell.tsx + Tailwind + Lucide Icons    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           Phase 3: Pages & Feature Implementation           │
│   Landing -> Auth -> Onboarding -> Patient -> Hospital      │
│   -> Admin Dashboards with working event handlers           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Phase 4: Compilation & Cleanup                  │
│   compile_applet validation -> Remove legacy root files     │
│   -> Update README.md                                       │
└─────────────────────────────────────────────────────────────┘
```

### File Hierarchy to Build
- `index.html`: Entry point with meta tags and Google fonts (`Plus Jakarta Sans`, `Inter`).
- `vite.config.ts`: Vite setup configured for `host: "0.0.0.0"` and `port: 3000`.
- `tailwind.config.js` & `postcss.config.js`: Tailwind styling supporting `.sg-grid-bg`, `.sg-emergency-pulse`, and color tokens.
- `src/main.tsx` & `src/App.tsx`: React router application root with route guards and `sonner` notifications.
- `src/lib/api.ts`: Complete localStorage-backed API client matching all endpoints from `app.py`.
- `src/lib/mockData.ts`: Rich pre-seeded data for hospitals, patients, beds, blood requests, and awareness articles.
- `src/components/DashShell.tsx`: Navigation sidebar, live status banner, and quick portal switcher.
- `src/components/ui/*`: Reusable UI components (`button`, `input`, `textarea`, `select`, `switch`, `badge`, `tabs`, `table`, `label`).
- `src/pages/*`: All ported screens (`Landing`, `Auth`, `Onboarding`, `PatientDashboard`, `HospitalDashboard`, `AdminDashboard`).

---

## 3. Plan Approval Checkpoint

Upon approval of this revised plan:
1. Dependencies will be installed immediately to bring up the dev server.
2. The full React application will be constructed and verified with `compile_applet`.
3. Legacy files will be cleaned up in accordance with the `github-import-rewrite` skill.
