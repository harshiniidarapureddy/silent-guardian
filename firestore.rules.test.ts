import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RULES_PATH = fs.existsSync(path.resolve("firestore.rules"))
  ? path.resolve("firestore.rules")
  : path.resolve("DRAFT_firestore.rules");

const BLUEPRINT_PATH = path.resolve("firebase-blueprint.json");

test("Firestore rules cover every collection in firebase-blueprint.json with global default-deny", () => {
  const rules = fs.readFileSync(RULES_PATH, "utf8");
  const blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, "utf8"));

  assert.match(rules, /rules_version\s*=\s*'2';/);
  assert.match(
    rules,
    /match\s+\/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/
  );

  const requiredMatches = [
    "match /admins/{userId}",
    "match /users/{userId}",
    "match /private/{docId}",
    "match /accessibility/{docId}",
    "match /assistiveDevices/{deviceId}",
    "match /organPledge/{docId}",
    "match /triageUpdates/{triageId}",
    "match /hospitalSpecialDevices/{deviceId}",
    "match /awarenessVideos/{videoId}",
  ];

  for (const m of requiredMatches) {
    assert.ok(rules.includes(m), `Missing required rules block: ${m}`);
  }

  assert.ok(rules.includes("'vitals_monitoring'"));
  assert.equal(Object.keys(blueprint.firestore).length, 9);
});

test("Dirty Dozen Security Gates: role escalation, shadow updates, PII isolation, email verification, and list query guards", () => {
  const rules = fs.readFileSync(RULES_PATH, "utf8");

  // 1. Self-registration role lock
  assert.ok(rules.includes("incoming().role == 'patient'"));
  // 2. Role immutability for non-admin updates
  assert.ok(rules.includes("incoming().role == existing().role"));
  // 3. Verified email gate for bootstrapped admin & writes
  assert.ok(rules.includes("request.auth.token.email_verified == true"));
  assert.ok(rules.includes("prathibhadarapureddy607@gmail.com"));
  // 4. ID poisoning guard
  assert.ok(
    rules.includes("id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$')")
  );
  // 5. Server timestamp integrity
  assert.ok(rules.includes("incoming().createdAt == request.time"));
  assert.ok(rules.includes("incoming().updatedAt == request.time"));
  // 6. Shadow field & update gap guards
  assert.ok(rules.includes("data.keys().hasAll("));
  assert.ok(rules.includes("data.keys().hasOnly("));
  assert.ok(rules.includes("incoming().diff(existing()).affectedKeys().hasOnly("));
  // 7. Parent relational sync (Master Gate) on user subcollections
  assert.ok(rules.includes("parentUserExists(userId)"));
  // 8. Stock invariant (assigned <= total)
  assert.ok(rules.includes("data.assignedUnits <= data.totalStock"));
  // 9. Bounded array checks (organs <= 10, languages allowlist)
  assert.ok(rules.includes("data.organs.size() <= 10"));
  assert.ok(rules.includes("data.languages.hasOnly(['en', 'hi', 'te', 'ta', 'kn', 'es'])"));
  // 10. No blanket allow list: if isSignedIn();
  assert.equal(/allow\s+list:\s*if\s*isSignedIn\(\)\s*;/.test(rules), false);
  // 11. Draft awareness protection
  assert.ok(rules.includes("resource.data.published == true"));
  // 12. Admins collection non-writable from client
  assert.ok(rules.includes("allow create, update, delete: if false;"));
});
