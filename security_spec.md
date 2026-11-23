# Care Preempt — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Source of Truth
1. **Default Deny**: Every unmatched path under `/databases/{database}/documents` is strictly denied (`allow read, write: if false;`).
2. **PII Isolation (Split Collection)**:
   - Public display metadata lives in `/users/{userId}` (no email, phone, or guardian PII).
   - Sensitive PII (`email`, `phone`, `bloodGroup`, `guardianName`, `guardianPhone`) lives in `/users/{userId}/private/{docId}` and is strictly readable/writable only by `isOwner(userId)` or `isAdmin()`.
3. **Master Gate Relational Sync**:
   - Subcollections under `/users/{userId}` (`/private`, `/accessibility`, `/assistiveDevices`, `/organPledge`) require the parent `/users/{userId}` document to exist (`exists(...)`) and belong to `request.auth.uid` (or `isAdmin()`).
4. **Privilege Escalation Prevention**:
   - Self-registration on `/users/{userId}` strictly enforces `role == 'patient'`. Users cannot self-assign `role: 'admin'` or `role: 'hospital'`, nor mutate `role` during updates.
   - `/admins/{userId}` is completely non-writable via client SDKs.
   - Admin checks require `request.auth.token.email_verified == true` for bootstrapped admin (`prathibhadarapureddy607@gmail.com`) OR existence in `/admins/$(request.auth.uid)`.
5. **Temporal & Immutability Integrity**:
   - All `createdAt` / `updatedAt` fields must equal `request.time`.
   - `uid` and `createdAt` are immutable across updates.
6. **Strict Schema & Boundary Enforcement**:
   - Every document ID path parameter is validated via `isValidId(id)` (`size() <= 128`, `^[a-zA-Z0-9_-]+$`).
   - Every string field enforces explicit `.size()` bounds; every array enforces `.size() <= MAX` and first-element type/allowlist checks.
   - Every `create` enforces `hasAll` + `hasOnly`; every `update` enforces `isValid[Entity](incoming())` + action-based `affectedKeys().hasOnly(...)`.
7. **Secure List Queries**:
   - No blanket `allow list: if isSignedIn();`.
   - `/awarenessVideos` list queries explicitly enforce `resource.data.published == true || isAdmin()`.
   - `/users/{userId}/assistiveDevices` list queries explicitly enforce `resource.data.uid == request.auth.uid || isAdmin()`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)

| # | Attack Class | Target Path | Adversarial Payload / Context | Expected Gate Blocking It |
|---|---|---|---|---|
| 1 | **Role Self-Escalation** | `CREATE /users/u1` | `{ uid: "u1", displayName: "Attacker", role: "admin", language: "English", onboarded: true, createdAt: serverTimestamp, updatedAt: serverTimestamp }` | `incoming().role == 'patient'` on user create |
| 2 | **Shadow Field Injection (Create)** | `CREATE /users/u1` | Valid user fields + `{ isVerified: true, superAdmin: true }` | `data.keys().hasOnly([...])` in `isValidUserPublic` |
| 3 | **Shadow Field Injection (Update)** | `UPDATE /users/u1` | `{ displayName: "Safe", role: "admin", updatedAt: serverTimestamp }` | `affectedKeys().hasOnly(['displayName', 'language', 'onboarded', 'updatedAt'])` |
| 4 | **Identity Spoofing** | `CREATE /users/u1/assistiveDevices/d1` | Authenticated as `u1`, payload `{ uid: "u2", ... }` | `data.uid == request.auth.uid && userId == request.auth.uid` |
| 5 | **Cross-User PII Read** | `GET /users/victim/private/profile` | Authenticated as `attacker` (non-admin) | `isOwner(userId) || isAdmin()` |
| 6 | **Unverified Email Admin Spoof** | `WRITE /awarenessVideos/v1` | Token email `prathibhadarapureddy607@gmail.com` with `email_verified: false` | `request.auth.token.email_verified == true` |
| 7 | **ID Poisoning (1.5KB Key)** | `CREATE /users/u1/assistiveDevices/<1500 chars>` | Valid payload with 1500-char doc ID or `/` chars | `isValidId(deviceId)` (`size() <= 128 && matches(...)`) |
| 8 | **Client Timestamp Forgery** | `CREATE /users/u1` | `createdAt: Timestamp(1999-01-01)` instead of `request.time` | `data.createdAt == request.time && data.updatedAt == request.time` |
| 9 | **Immutable Field Tampering** | `UPDATE /users/u1/assistiveDevices/d1` | Changing `createdAt` or `uid` | `incoming().uid == existing().uid && incoming().createdAt == existing().createdAt` |
| 10 | **Unbounded Array / Type Poisoning** | `CREATE /users/u1/organPledge/current` | `organs: [123, ...15 items]` | `data.organs.size() <= 10 && data.organs[0] is string` |
| 11 | **Stock Invariant Violation** | `UPDATE /hospitalSpecialDevices/hsd1` | `totalStock: 5, assignedUnits: 99` (assigned > total) | `data.assignedUnits >= 0 && data.assignedUnits <= data.totalStock` |
| 12 | **Draft Awareness Leak via List** | `LIST /awarenessVideos` | Non-admin querying drafts (`published: false`) | `allow list: if isSignedIn() && (resource.data.published == true || isAdmin())` |
