# Silent Guardian · Healthcare Safety Net

A modern, clinical-grade React web application providing an integrated community healthcare safety net.

## Key Capabilities

1. **AI Health Triage**:
   - Interactive conversational symptom evaluator.
   - Detects acute emergency red flags (chest tightness with diaphoresis, stroke F.A.S.T. signs, respiratory distress) with instant emergency escalations.
   - Specialist recommendations (Cardiology, Neurology, Pediatrics, ENT, Orthopedics) and safe home-care guidance.
   - Browser speech recognition for voice input.

2. **Hospital & Emergency Resource Locator (520+ Facilities)**:
   - Searchable directory of 520+ hospitals across metropolitan regions.
   - Real-time ICU, Emergency Room (ER), and ventilator bed capacity counters.
   - Filter by clinical specialty with direct emergency desk contacts.

3. **Multilingual Emergency Video Awareness Feed**:
   - Interactive emergency instructional guides with video player simulations.
   - Multi-language coverage in English, हिन्दी (Hindi), తెలుగు (Telugu), தமிழ் (Tamil), and Español (Spanish).
   - Step-by-step emergency action checklists and key clinical Dos and Don'ts.

4. **Emergency Blood Network**:
   - Urgent donor calls with blood group filtering, required unit counts, and direct hospital coordinates.
   - Voluntary community donor registry.

5. **Hospital Command Center & Intake Queue (550+ Patients)**:
   - High-performance intake table with live filters for severity, gender, and condition.
   - One-click admission and triage discharge toggles.
   - Bed and capacity sliders for general ward, ICU, ER, and mechanical ventilators.
   - Ambulance fleet monitoring with live vehicle dispatch.

6. **Platform Admin & Verification Queue**:
   - Network analytics and community telemetry.
   - Clinical credential verification queue supporting one-click Approve, Reject, and Request Additional Compliance Documents.
   - Multilingual public health bulletin publisher.
   - Medical fraud and unauthorized blood service watchlist.

## Architecture

- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with Plus Jakarta Sans & DM Sans typography
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Data & State**: Client-side reactive persistent store in `src/lib/api.ts` with 500+ pre-seeded realistic clinical datasets.
