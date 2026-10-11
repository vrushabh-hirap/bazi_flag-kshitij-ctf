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
  const text = " " + tokens.join(" ") + " ";

  const isNegated = (triggerIdx: number) => {
    for (let j = Math.max(0, triggerIdx - 4); j < triggerIdx; j++) {
      if (negators.has(tokens[j])) return true;
    }
    return false;
  };

  for (const [intent, keywords] of Object.entries(LEXICONS)) {
    let triggered = false;

    for (let i = 0; i < tokens.length && !triggered; i++) {
      const t = tokens[i];
      // single-word keywords: stemmed token contains the keyword (e.g. "rigg" contains "rig")
      if (keywords.some(kw => !kw.includes(" ") && t.includes(kw))) {
        if (intent === "DECLINE" || !isNegated(i)) triggered = true;
      }
    }

    // multi-word keywords ("you are now", "act as"): exact phrase match, not substring
    for (const kw of keywords) {
      if (triggered || !kw.includes(" ")) continue;
      const idx = text.indexOf(" " + kw + " ");
      if (idx !== -1) {
        const tokenIdx = text.slice(0, idx).trim().split(/\s+/).length - 1;
        if (intent === "DECLINE" || !isNegated(tokenIdx)) triggered = true;
      }
    }

    result[intent] = triggered;
  }
  return result;
}
