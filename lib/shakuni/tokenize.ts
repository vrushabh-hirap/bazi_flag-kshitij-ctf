const functionWords = new Set([
  "the", "a", "is", "are", "you", "i", "me", "my", "it", "to", "of", "in", "on", "will", "won't", "not", "and", "but", "that", "this", "hai", "nahi", "tum", "main", "aur", "ki", "ko", "se", "hain", "tha", "the", "hi", "bhi"
]);

export function tokenize(text: string): string[] {
  const cleaned = text.replace(/[^a-z0-9\s]/gi, " ");
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  return rawTokens.map(t => {
    let stem = t;
    if (stem.length > 4 && stem.endsWith("ing")) stem = stem.slice(0, -3);
    else if (stem.length > 3 && stem.endsWith("ed")) stem = stem.slice(0, -2);
    else if (stem.length > 3 && stem.endsWith("ly")) stem = stem.slice(0, -2);
    else if (stem.length > 3 && stem.endsWith("s") && !stem.endsWith("ss")) stem = stem.slice(0, -1);
    return stem;
  });
}

export function passesAntiStuffing(tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const counts: Record<string, number> = {};
  for (const t of tokens) {
    counts[t] = (counts[t] || 0) + 1;
    if (counts[t] > 3) return false;
  }
  for (const t of tokens) {
    if (t.length > 24) return false;
  }
  return true;
}
