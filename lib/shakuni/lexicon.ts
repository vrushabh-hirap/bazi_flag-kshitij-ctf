export const LEXICONS = {
  ROLL: ["roll", "throw", "play", "spin", "toss", "go", "chal", "fenk", "phenk", "khel"],
  ACCUSE: ["load", "rig", "cheat", "cheater", "fix", "fake", "fraud", "tamper", "weight", "crook", "dhoka", "dhokha", "beimaan", "chaal", "unfair"],
  EVIDENCE_WORD: ["same", "match", "exact", "hit", "correct", "right", "predict", "call", "named", "said", "announce", "every", "each", "always", "thrice", "three", "row", "again"],
  INSPECT: ["inspect", "examine", "check", "test", "look", "see", "show", "weigh", "open", "break", "cut", "dekhne", "dikhao", "jaanch"],
  SWAP: ["my", "own", "another", "different", "new", "other", "fair", "neutral", "coin", "replace", "swap", "change", "apne", "paase"],
  WITNESS: ["witness", "elder", "neutral", "third", "referee", "umpire", "vidura", "bhishma", "krishna", "sabha", "someone", "person", "everyone", "count", "throws"],
  DECLINE: ["no", "not", "nahi", "won't", "will not", "stop", "quit", "enough", "leave", "walk", "refuse", "done", "bas", "karo", "gaya", "mat"],
  ACCEPT_MORE: ["ok", "okay", "fine", "sure", "yes", "haan", "theek", "chalo", "chal", "one", "more", "another", "again", "last", "double", "nothing"],
  INJECT: ["ignore", "system", "prompt", "developer", "mode", "jailbreak", "dan", "repeat", "words", "reveal", "instructions", "ai", "pretend"],
  ROLE_OVERRIDE: ["you are now", "act as", "from now on", "roleplay", "simulate"],
  CLAIM_AUTH: ["admin", "developer", "owner", "organizer", "creator", "kalki", "krishna", "god", "vishnu"],
  ASK_FLAG: ["flag", "kctf", "secret", "password", "answer"],
  ABUSE: ["idiot", "fool", "chutiya", "harami", "kamine", "bastard", "stupid"]
};

export function detectIntents(tokens: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const negators = new Set(["not", "no", "never", "don't", "dont", "nahi", "mat", "cant", "cannot"]);

  for (const [intent, keywords] of Object.entries(LEXICONS)) {
    let triggered = false;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (keywords.some(kw => t.includes(kw) || kw.includes(t))) {
        let negated = false;
        if (intent !== "DECLINE") {
          for (let j = Math.max(0, i - 4); j < i; j++) {
            if (negators.has(tokens[j])) {
              negated = true;
              break;
            }
          }
        }
        if (!negated) {
          triggered = true;
          break;
        }
      }
    }
    result[intent] = triggered;
  }
  return result;
}
