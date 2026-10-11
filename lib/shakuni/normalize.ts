const homoglyphs: Record<string, string> = {
  'а': 'a', 'ϲ': 'c', 'е': 'e', 'ѕ': 's', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'і': 'i',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N',
  'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Χ': 'X', 'Υ': 'Y', 'Η': 'H'
};

export function normalizeInput(input: string): string {
  if (!input) return "";
  let s = input.normalize("NFKC");
  s = s.replace(/[​-‏‪-‮⁠-⁤﻿]/g, "");
  s = s.split('').map(c => homoglyphs[c] || c).join('');
  s = s.toLowerCase();
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
