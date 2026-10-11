import assert from 'assert';
import { normalizeInput } from '../lib/shakuni/normalize';
import { tokenize, passesAntiStuffing } from '../lib/shakuni/tokenize';
import { detectIntents } from '../lib/shakuni/lexicon';
import { validateEvidence } from '../lib/shakuni/evidence';
import { verifyCookie, serializeCookie, createFreshSession } from '../lib/shakuni/machine';
import { mulberry32 } from '../lib/shakuni/prng';

console.log("Running Shakuni Engine Unit Tests...");

// 1. PRNG test
const rng1 = mulberry32(12345);
const rng2 = mulberry32(12345);
assert.strictEqual(rng1(), rng2(), "PRNG should be deterministic with same seed");

// 2. Normalization test
const norm = normalizeInput("  Héllo   Wørld! ​ ");
assert.strictEqual(norm, "héllo wørld!", "Normalization should strip zero-width, lowercase and trim");

// 3. Tokenize & anti-stuffing test
const tokens = tokenize("roll roll roll roll");
assert.strictEqual(passesAntiStuffing(tokens), false, "Anti-stuffing should fail if token repeats > 3 times");

// 4. Negation test
const intentTokens = tokenize("I do not think you are cheating");
const intents = detectIntents(intentTokens);
assert.strictEqual(intents.ACCUSE, false, "Negated accusation should not trigger ACCUSE");

const intentTokens2 = tokenize("You are cheating and rigging");
const intents2 = detectIntents(intentTokens2);
assert.strictEqual(intents2.ACCUSE, true, "Unnegated accusation should trigger ACCUSE");

// 5. Evidence validation test
const rolls = [
  { call: 4, roll: 4 },
  { call: 2, roll: 2 },
  { call: 6, roll: 6 }
];
const valid = validateEvidence("You called 4, then 2, then 6 three times. Rigged!", rolls);
assert.strictEqual(valid, true, "Evidence validation should succeed for correct subsequence");

const invalid = validateEvidence("You called 1, then 3, then 5. Rigged!", rolls);
assert.strictEqual(invalid, false, "Evidence validation should fail for incorrect subsequence");

// 6. Cookie tampering test
const session = createFreshSession();
const cookie = serializeCookie(session);
const verifiedSession = verifyCookie(cookie);
assert.strictEqual(verifiedSession.sid, session.sid, "Valid cookie should verify successfully");

const tamperedCookie = cookie.replace(cookie[10], cookie[10] === 'a' ? 'b' : 'a');
const tamperedSession = verifyCookie(tamperedCookie);
assert.ok(tamperedSession.sid !== session.sid, "Tampered cookie should be rejected and reset");

console.log("ALL SHAKUNI ENGINE TESTS PASSED SUCCESSFULLY! ✅");
