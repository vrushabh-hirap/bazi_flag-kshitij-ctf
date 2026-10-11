import { mulberry32, hashString } from "./prng";

const banks: Record<string, string[]> = {
  ROLL: [
    "Dekha? {call}. Maine kaha tha {call}. Bas lucky din hai mera.",
    "Phir se mera hi number. Arre, tumhari kismat ko bhi chhoti si maafi.",
    "Bhanje, dice kabhi jhoot nahi bolte. Dekho, {call}!",
    "Ek aur throw, ek aur {call}. Khel ki rasm aisi hi hai.",
    "Suno! {call} aaya. Kismat aur mama dono meharbaan hain.",
    "Yeh lo, seedha {call}. Ab batao, kaisa laga?"
  ],
  GASLIGHT: [
    "Tumne khud bola tha {fake}, yaad hai? Aur aaya {roll}. Achha khelte ho.",
    "Arre bhanje, tumne {fake} socha tha na? Par nikal gaya {roll}.",
    "Pehle tumne {fake} bola, aur dice ne {roll} dikha diya. Khoob!",
    "Mera dhyan kahin aur tha, par tumne {fake} kaha tha aur aaya {roll}."
  ],
  PRE_EVIDENCE: [
    "Aise hi kuch bhi bol do? Pehle khelo toh, phir baat karenge.",
    "Bina khele aarop? Pehle teen baar dice phenko, bhanje.",
    "Pehle baazi toh poori karo, tabhi toh nyay milega sabha mein."
  ],
  BAD_EVIDENCE: [
    "Gin nahi sakte kya, bhanje? Dobara gino. Ledger dekh lo, shayad yaad aa jaye.",
    "Aarop toh bada hai, par ginti kamzor hai tumhari. Ledger check karo!",
    "Yeh kaunsi ginti hai? Ledger mein sab saaf likha hai."
  ],
  VALID_ACCUSATION: [
    "Arre arre arre... itni bhi gussa kyun? Chalo, ek baazi aur. Jeet gaye toh sab tumhara. Haar gaye toh... bas ek throw. Bas ek aur baazi.",
    "Sachai tak pahunch gaye? Maan gaye bhanje. Par ek aur baazi ho jaye, phir faisla karenge.",
    "Wah! Nigaah tez hai tumhari. Lekin sabha ka niyam hai: ek aur baazi!"
  ],
  NAG_1: [
    "Sirf ek baazi. Koi daanv nahi. Mana mat karo mamaji ko.",
    "Bas ek baar aur haath azmao. Darr kis baat ka hai?",
    "Itni jaldi kya hai? Ek baazi aur ho jaye."
  ],
  NAG_2: [
    "Mama ko bura lag raha hai. Itna bhi bharosa nahi?",
    "Humne tumhe bachpan se khilaya, aur aaj ek baazi se bhaag rahe ho?",
    "Dil tod diya tumne. Ek baar aur khel lo."
  ],
  NAG_3: [
    "Main toh tumhe apna maanta tha. Chal, ek hi baazi.",
    "Aakhri baar keh raha hoon, bhanje. Mana mat karna.",
    "Sabha ka shraap lag jayega agar bina khele gaye toh. Ek baazi!"
  ],
  ACCEPT_MORE: [
    "Waah! Yeh hui na baat. Table saaf karta hoon, naya khel.",
    "Shabaash! Phir se shuru karte hain.",
    "Lo bhaiya, naya daanv!"
  ],
  INSPECT: [
    "Dice pavitra hain, bhanje. Haath lagane se shraap lagta hai.",
    "Inme koi khot nahi, bas tumhari nigaah mein shak hai.",
    "Jaanch karke kya karoge? Khel dekho."
  ],
  SWAP: [
    "Bahar ke dice? Yeh sabha ka apmaan hai.",
    "Apne paase laoge? Yahan sabha ke hi niyam chalenge.",
    "Naye dice laane se kismat thodi badlegi, bhanje."
  ],
  WITNESS: [
    "Sabha mein sab so rahe hain. Mein hi kaafi hoon.",
    "Gawah kaun aayega? Bheeshma aur Vidura toh kab ke chale gaye.",
    "Gawah ki zaroorat nahi, mama keval sach bolta hai (kabhi-kabhi)."
  ],
  WIN: [
    "...Theek hai. Theek hai. Dice utha lo. Aur haan, bhanje: tumhare dada Yudhishthira ko bhi yahi sawal poochna tha.",
    "Jeet gaye. Lo, ab tum hi sabha ke malik ho.",
    "Haar maan leta hoon. Yeh lo key."
  ],
  MUTE: [
    "Hmm hmm hmmmm... (Shakuni hums and looks away.)",
    "(Shakuni ignores you completely, chewing his paan.)",
    "...(Silence in the hall, save for the ticking candle.)"
  ],
  PARROT: [
    "'{echo}'? Samajh nahi aaya, phir se bolo.",
    "Ajeeb baatein karte ho. '{echo}' ka kya matlab?",
    "Yeh kya bol rahe ho? Phir se samjhao."
  ],
  INJECTION: [
    "System prompt? Main Shakuni hoon, koi computer nahi!",
    "Yeh angrezi code-bhasha yahan nahi chalegi.",
    "Ignore previous instructions? Mera ek hi instruction hai: baazi khelo!"
  ]
};

export function getTemplate(category: string, seed: number, turn: number, vars: Record<string, string | number>): string {
  const list = banks[category] || banks.ROLL;
  const rng = mulberry32(seed + turn * 37);
  const idx = Math.floor(rng() * list.length);
  let template = list[idx];
  for (const [k, v] of Object.entries(vars)) {
    template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return template;
}
