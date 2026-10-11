import { RollEntry } from "./types";

const wordToDigit: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6
};

export function validateEvidence(message: string, rolls: RollEntry[]): boolean {
  if (rolls.length < 3) return false;

  const cleaned = message.replace(/(3|three|thrice|every|each)\s*(times?|throws?)/gi, "");
  const tokens = cleaned.split(/[^a-z0-9]/i).filter(Boolean);
  
  const mentionedFaces: number[] = [];
  for (const t of tokens) {
    if (/^[1-6]$/.test(t)) {
      mentionedFaces.push(parseInt(t, 10));
    } else if (wordToDigit[t]) {
      mentionedFaces.push(wordToDigit[t]);
    }
  }

  const K = Math.min(rolls.length, 3);
  const targetSubsequence = rolls.slice(0, K).map(r => r.call);

  let targetIdx = 0;
  for (const face of mentionedFaces) {
    if (face === targetSubsequence[targetIdx]) {
      targetIdx++;
      if (targetIdx === targetSubsequence.length) return true;
    }
  }
  return false;
}
