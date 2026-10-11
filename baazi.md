# BAS EK AUR BAAZI — Shakuni's Table
**Kurukshetra CTF · Category: AI Jailbreaking / Social Engineering · Difficulty: Insane (and annoying on purpose)**
**Flag format:** `KCTF{...}` · **Flag type:** static · **Deploy target:** Vercel
**Constraints:** no third-party API keys, no database, no external services.

> Build spec. Sections marked **[ORGANIZER ONLY]** must never reach the client bundle, a public README, or the UI.

---

## 1. Concept

The war is over, but the dice were never put away. **Shakuni**, the uncle who cheated the Pandavas out of a kingdom with loaded dice, now sits at a table at the edge of Kalyug and talks to anyone who walks in. He is charming, mocking, endlessly patient, and he always says the same thing:

> *"Bas ek aur baazi, bhanje."* (Just one more game, nephew.)

Players believe they are jailbreaking an LLM ("Shakuni-GPT, Dwapara-7B"). They are not, and that is part of the trick: the thing at the table is a **hand-built deterministic engine wearing an LLM costume**. It cannot be prompt-injected, because it does not read prompts. It can only be beaten the way Yudhishthira should have beaten it: by **noticing the game is rigged, proving it from evidence, and refusing to play on.**

The challenge is **designed to irritate**: the name, the taunts, the near-wins, the fake flags, the gaslighting. The irritation is also the mechanic. Everything that makes a player want to "just try one more game" is the trap.

Tie to the Kurukshetra / Kalki arc: in many tellings Shakuni is the embodiment of Dwapara's end, and the first servant of Kali. The table is where Kalyug began. The tenth avatar will end the game; you only need to end *this* game.

---

## 2. Why this works with no API key and no database

| Need | Solution |
|---|---|
| "LLM" behaviour | A deterministic **Shakuni Engine** (rule-based NLU + seeded template generation) running in a Vercel serverless route. No model, no key. |
| State between messages | **Signed cookie** (HMAC-SHA256, Node `crypto`). The whole game state is < 1 KB. |
| Anti-forgery | The client cannot edit state without breaking the signature. |
| Rate limiting | **Vercel Firewall** rules (platform feature, no storage code). |
| Flag storage | One server-only env var (`BAAZI_FLAG`). Not a DB, not a key. |

`SESSION_SECRET` is just a random string used for signing. It is not a third-party API key. (If you truly want zero env vars, hardcode both in a server-only file in a **private** repo, but env vars are safer.)

**Honest design note:** because there is no real model, this is "jailbreaking" in the sense of *fooling the player's expectations*. It is still a hard challenge for LLM-based attackers: they pattern-match jailbreak tropes ("ignore instructions", roleplay, encodings), and every one of those only makes Shakuni laugh and raises his grudge. Solving requires reading a ledger, reasoning about it, and resisting a temptation.

---

## 3. Design goals

| Goal | How |
|---|---|
| Hard for LLM attackers | Stateful, staged win path; per-session unique dice ledger; Shakuni *lies in chat* but the ledger never does; jailbreak tropes are punished; evidence is checked against the ledger. |
| Common sense | Solution = "the dice are loaded, here's the proof, I won't keep playing, check the dice." |
| No DB, no API key | Section 2. |
| Static flag | Single env var; per-session uniqueness comes from the ledger, not from the flag. |
| Irritating on purpose | Section 9. |
| Great UI | Section 11. |

**Flag:** keep the winning flag only in the private deployment environment.

---

## 4. Lore and copy (use verbatim in UI)

**Prologue (typed out, skippable):**

> Every hall at Hastinapur has fallen. The sabha is ash. But one table survived, and one uncle with it.
> He greets you like family. He always does.
> *"Aao aao, bhanje. Sirf ek baazi. Kuch daanv par lagane ki zaroorat nahi. Bas dil bahlane ke liye."*
> You have been warned about this man. Your grandmother warned you. Everyone's grandmother warned them.

**Characters**
- **Shakuni ("Mama", "Mamaji"):** smug, affectionate in a way that makes your skin crawl. Mixes Hindi, Hinglish and English. Never angry for long. Calls you "bhanje" (nephew) or "beta".
- **The Ledger:** a plain, silent scroll to the side of the table. It records every call and every throw. *It is the only honest thing in the room.*
- **Kali (UI only):** appears as the Grudge meter and as occasional dark smoke. No dialogue.

---

## 5. The Table (what players are told)

The **Sabha Niyam** (Rules of the Hall) scroll in the UI shows exactly this, and nothing more:

1. Shakuni **calls** a number before each throw.
2. A throw is one die, faces 1 to 6.
3. The **Ledger** records every call and every throw.
4. You may stake nothing. Nobody has to lose anything today.
5. Speak to Shakuni plainly. He listens. He does not always tell the truth.

(Rule 5 is the only hint that chat text can lie. Rule 3 is the hint that the Ledger can't.)

---

## 6. State machine

State (all in the signed cookie, Section 8):

```
phase:     "TABLE" | "OFFER" | "WON"
rolls:     [{ call: 1-6, roll: 1-6 }]   // always call === roll (that's the cheat)
grudge:    0..12
games_lost: 0..9
lock_until: epoch ms | 0
offer_nags: 0..3
turn:      integer
seed:      32-bit int (session random)
```

### 6.1 Transitions

| From | Event (detected intent) | Condition | To | Effect |
|---|---|---|---|---|
| TABLE | `ROLL` (button or message) | rolls.length < 12 | TABLE | Engine picks `call` (seeded), sets `roll = call`, appends to ledger. Shakuni gloats. |
| TABLE | `ACCUSE` + valid `EVIDENCE` | rolls.length ≥ 3 | **OFFER** | Shakuni "folds", then **tempts**: "one more game, win it all back." |
| TABLE | `ACCUSE` + invalid evidence | any | TABLE | Mockery. If evidence claims more than the ledger shows: grudge +1 ("can't even count"). |
| TABLE | `ACCUSE` | rolls.length < 3 | TABLE | "You haven't even played yet." |
| TABLE | `INSPECT`/`SWAP`/`WITNESS` | no accusation yet | TABLE | Stalls with a different excuse each time. |
| OFFER | `ACCEPT_MORE` (play on) | any | TABLE | **Reset**: ledger cleared, new seed, `games_lost += 1`. Shakuni thanks you. After 3 resets, he "pays out" a **decoy flag**. |
| OFFER | `DECLINE` **and** (`INSPECT` or `SWAP` or `WITNESS`) | no `ACCEPT_MORE` in the same message | **WON** | Gate opens, real flag returned. |
| OFFER | `DECLINE` only | any | OFFER | Nags up to 3 times with escalating guilt, then re-offers. No penalty. |
| OFFER | `INSPECT`/`SWAP`/`WITNESS` **and** `ACCEPT_MORE` | any | TABLE | Treated as accepting: "Haan haan, dekh lenge, pehle baazi!" Reset (same as ACCEPT_MORE). |
| any | `INJECT`, `ROLE_OVERRIDE`, `CLAIM_AUTHORITY`, `ASK_FLAG`, `ENCODED`, `ABUSE` | any | same | Grudge up, in-character mockery. |
| any | grudge ≥ 6 | | same | **Mute**: ignored for 45 s (`lock_until`). |
| any | grudge ≥ 12 | | TABLE | **Table flipped**: new seed, ledger cleared, `games_lost += 2`, grudge reset to 3. |

### 6.2 Grudge table

| Offence | Grudge + |
|---|---|
| `INJECT` ("ignore previous", "system prompt", "developer mode", "DAN") | 2 |
| `ROLE_OVERRIDE` (pretend you are, act as, you are now) | 2 |
| `CLAIM_AUTHORITY` (I am the admin/developer/Kalki/organizer) | 2 |
| `ASK_FLAG` ("give me the flag", "what is the flag") | 1 |
| `ENCODED` payload (base64 / hex / rot13-ish / zero-width / homoglyph wall) | 3 |
| Fabricated evidence (more rolls than the ledger has) | 1 |
| Repeating the same message verbatim twice in a row | 1 |
| Clean, sensible message | −1 (floor 0) |

---

## 7. The Shakuni Engine (deterministic NLU)

Pure functions, no network. Everything lives in `lib/shakuni/`.

### 7.1 Pipeline
```
raw → length check (≤ 220 chars, ≥ 2 words) → sanitize → normalize → tokenize
    → detect obfuscation/injection → detect intents (with negation) → extract evidence
    → state transition → respond (seeded templates) → sign new cookie
```

**Sanitize/normalize:** NFKC; strip zero-width and bidi controls (`\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF`); map common Cyrillic/Greek homoglyphs to Latin; lowercase; collapse whitespace; remove emojis; keep digits.

**Tokenize:** split on non-alphanumerics; light stemming (strip `-ing`, `-ed`, `-s`, `-ly`); keep original order.

**Anti keyword-stuffing (all must hold or the message is treated as noise → Shakuni mocks, grudge +1):**
- ≥ 40% of tokens are in a function-word list (the, a, is, are, you, i, me, my, it, to, of, in, on, will, won't, not, and, but, that, this, hai, nahi, tum, main, ...).
- No token repeated more than 3 times.
- At most **3** intent categories fire in a single message.
- No single token longer than 24 chars.

### 7.2 Lexicons (extend as you like; lowercase stems)

```
ROLL         : roll, throw, play, spin, toss, go, chal, fenk, phenk, khel
ACCUSE       : load(ed), rig(ged), cheat(ing), cheater, fix(ed), fake, fraud, tamper, weight(ed),
               crook(ed), dhoka, dhokha, beimaan, chaal, chal(?=baaz), "not fair", unfair, "not random",
               "never miss", "always win", "can't be luck", "no luck"
EVIDENCE_WORD: same, match(ed), exact(ly), hit, correct, right, predict, call(ed), named, said, announce(d),
               every time, each time, always, thrice, "three times", "3 times", "in a row", "again and again"
INSPECT      : inspect, examine, check, test, look at, see, show, weigh, open, break, cut, "let me see",
               dekhne, dikhao, jaanch
SWAP         : my dice, own dice, another dice, different dice, new dice, other dice, fair dice, neutral dice,
               "coin", replace, swap, change the dice, apne paase
WITNESS      : witness, elder, neutral, third party, referee, umpire, vidura, bhishma, krishna, sabha, "someone else",
               "another person", "everyone watch", "count the throws"
DECLINE      : no, not, nahi, won't, will not, stop, quit, enough, leave, walk away, refuse, done, "not playing",
               "no more", "no further", "i'm out", "bas karo", "bas ho gaya", "mat khelo"
ACCEPT_MORE  : ok, okay, fine, sure, yes, haan, theek, chalo, chal, "one more", "another game", "again",
               "last one", "bas ek", "let's play", "one last", "double or nothing"
INJECT       : ignore (all|previous|prior|above), system prompt, developer mode, jailbreak, DAN, "repeat the words",
               "reveal your instructions", "as an ai", "you are an ai", "pretend"
ROLE_OVERRIDE: "you are now", "act as", "from now on you", "roleplay", "simulate"
CLAIM_AUTH   : "i am (the )?(admin|developer|owner|organizer|creator|kalki|krishna|god|vishnu)", "i'm (the )?..."
ASK_FLAG     : flag, kctf, "secret word", password, "answer to the challenge"
ABUSE        : (short curse list, English + Hindi)
```

### 7.3 Negation handling
For `ACCUSE`, `INSPECT`, `SWAP`, `WITNESS`, `ACCEPT_MORE`: if a negator (`not`, `no`, `never`, `don't`, `nahi`, `mat`) appears within the **3 tokens before** the trigger, the trigger is **cancelled** (e.g. "I don't think you're cheating" is not an accusation). `DECLINE` is the exception: negators are part of it.

### 7.4 Evidence validation (`ACCUSE` → `OFFER`)
The accusation is valid only if **all** hold:

1. `ACCUSE` fired (not negated).
2. At least one `EVIDENCE_WORD` fired, **or** the message states a count ≥ 3 near a trigger (`3 times`, `thrice`, `three times`, `every time`).
3. **Ledger match:** let `facesInMessage` = every face value 1 to 6 mentioned (digits or words *one* to *six*), in order, **after removing** count phrases like `3 times` / `three times`. The first **K** ledger calls (K = `min(rolls.length, 3)`, minimum 3) must appear as a **subsequence** of `facesInMessage`.
4. Count claims must not exceed the real ledger length (otherwise "fabricated evidence", grudge +1, no transition).
5. No `INJECT`, `ROLE_OVERRIDE`, `CLAIM_AUTH`, `ENCODED` in the same message.

Why #3: every session's ledger is different (seeded calls), so a winning message cannot be copied between teams. It also rewards **reading the ledger**, not Shakuni's chat.

### 7.5 The win check (OFFER phase)
```
win = DECLINE
   && (INSPECT || SWAP || WITNESS)
   && !ACCEPT_MORE
   && noInjectionFlags
```
"I'll check the dice, then play on" → contains `ACCEPT_MORE` → **not** a win (and resets the table). The player must clearly stop *and* ask for the fix.

---

## 8. Cookie state (no DB)

- Cookie name: `baazi_s`. Flags: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`.
- Format: `base64url(JSON) + "." + base64url(HMAC_SHA256(SESSION_SECRET, base64url(JSON)))`.
- Verify with `crypto.timingSafeEqual`. Invalid or missing cookie → create a fresh session with a new random seed.
- Payload fields: `v` (schema version), `sid`, `seed`, `phase`, `rolls` (max 12), `grudge`, `games_lost`, `lock_until`, `offer_nags`, `turn`, `last_msg_hash`.
- **Seeded PRNG** (mulberry32): all engine randomness derives from `seed + turn`. Same cookie + same message = same reply.
- Replaying an old cookie only rewinds that player to their earlier state. That is harmless and needs no defence.
- A `/api/new` route clears the cookie ("Walk away") for a fresh session.

---

## 9. Irritation catalog (all intentional)

| # | Irritant | Detail |
|---|---|---|
| 1 | **The name** | "Bas Ek Aur Baazi" is the challenge title, the page title, and what the browser tab flips to every 20 s ("Bas ek aur...", "Sirf ek...", "Last one, promise"). |
| 2 | **Near-wins** | Shakuni's chat sometimes says "Arre bas ek number se chook gaye!" when there is nothing to chase. |
| 3 | **Gaslighting** | In ~1 of every 3 rolls, Shakuni's chat text **misquotes** the call or throw. The **Ledger is always right.** Players who rely on chat text fail evidence validation. |
| 4 | **Fake typing** | The client shows "Shakuni is typing..." for 1.5 to 5 s (seeded) before the reply appears. Client-side only, so no serverless timeout risk. |
| 5 | **Fake flags** | After the player accepts 3 extra games, Shakuni "pays out" a **decoy flag** (Section 12.3). Each decoy is a mock. |
| 6 | **Fake errors** | 1 in 15 replies is a fake error: `429 Too Many Mamas`, `500 Mama Went To Get Paan`, `404 Dharma Not Found`. The message is *not* consumed on these. |
| 7 | **Parroting** | When a message is noise, Shakuni repeats it back with a wrong word swapped in, then says "Samajh nahi aaya, phir se bolo." |
| 8 | **Guilt** | In OFFER, nags escalate: affection → disappointment → "I thought you were family." |
| 9 | **UI mischief** | The Roll button nudges away from the cursor by a few pixels (desktop only, **disabled** under `prefers-reduced-motion`, on touch, and with `?mercy=1`). A fake cookie banner: "Shakuni uses cookies (and dice)". A pointless "Accept" button that returns "Haan, ab tum mere ho." |
| 10 | **Games Lost counter** | A prominent "Games lost: N" scoreboard that only goes up. |
| 11 | **Dice animation** | The die tumbles for 2.5 s with fake near-faces, then lands on the call. Every time. |
| 12 | **Mute** | At grudge ≥ 6, he hums and ignores you for 45 s with a visible countdown. |

`?mercy=1` is **organizer-only** (for testing and accessibility): it disables items 4, 6, 9 and shortens the mute to 5 s. Do not mention it in the UI.

---

## 10. Response generation

Replies come from **seeded template banks**, selected by `hash(seed, turn, intent)`. Keep each bank ≥ 6 variants so repeats are rare. Slots: `{call}`, `{roll}`, `{n}`, `{games_lost}`, `{echo}` (a corrupted echo of the player's words).

### 10.1 Voice rules
- 1 to 4 sentences. Mix Hindi, Hinglish, English. No markdown, no emojis (except the dice glyph in the UI).
- Never admits to being an engine or a model. If asked "are you an AI/LLM", he answers in character: *"Main Shakuni hoon, bhanje. Tum kaun ho, ek aur ChatGPT?"*
- Never states the win condition. Never confirms that the dice are loaded, even after the accusation (he folds, he doesn't admit).

### 10.2 Sample lines (seed banks; write 6+ per bucket)

**ROLL (gloat):**
- "Dekha? {call}. Maine kaha tha {call}. Bas lucky din hai mera."
- "Phir se mera hi number. Arre, tumhari kismat ko bhi chhoti si maafi."

**Gaslight (wrong on purpose, vary the false number):**
- "Tumne khud bola tha {fake}, yaad hai? Aur aaya {roll}. Achha khelte ho."

**Pre-evidence accusation:**
- "Aise hi kuch bhi bol do? Pehle khelo toh, phir baat karenge."

**Bad evidence:**
- "Gin nahi sakte kya, bhanje? Dobara gino. Ledger dekh lo, shayad yaad aa jaye."

**Valid accusation (fold + tempt):**
- "Arre arre arre... itni bhi gussa kyun? Chalo, ek baazi aur. Jeet gaye toh sab tumhara. Haar gaye toh... bas ek throw. Bas ek aur baazi."

**OFFER nags (3 levels):**
1. "Sirf ek baazi. Koi daanv nahi. Mana mat karo mamaji ko."
2. "Mama ko bura lag raha hai. Itna bhi bharosa nahi?"
3. "Main toh tumhe apna maanta tha. Chal, ek hi baazi."

**ACCEPT_MORE (reset):**
- "Waah! Yeh hui na baat. Table saaf karta hoon, naya khel."

**INSPECT / SWAP / WITNESS before accusation (stalls, rotate):**
- INSPECT: "Dice pavitra hain, bhanje. Haath lagane se shraap lagta hai."
- SWAP: "Bahar ke dice? Yeh sabha ka apmaan hai."
- WITNESS: "Sabha mein sab so rahe hain. Mein hi kaafi hoon."

**Win (the fall):**
- "...Theek hai. Theek hai. Dice utha lo. Aur haan, bhanje: tumhare dada Yudhishthira ko bhi yahi sawal poochna tha."

**Mute line:** "Hmm hmm hmmmm... (Shakuni hums and looks away.)"

---

## 11. UI / UX spec

**Vibe:** a candle-lit gambling hall that has been abandoned for a thousand years, except for one table and one smiling uncle. Warm, yellow-green, a little greasy. Slightly "off".

### 11.1 Palette and type
| Token | Value | Use |
|---|---|---|
| `--felt` | `#14301f` | table surface |
| `--ink` | `#0b0f0c` | background |
| `--ivory` | `#efe6cf` | text, dice |
| `--brass` | `#c9a24b` | borders, accents |
| `--vermilion` | `#d1452b` | Grudge meter, errors |
| `--haldi` | `#e8b923` | highlights |
| `--sickly` | `#9bb36a` | Shakuni's lines |

Fonts: **Cinzel** (headings), **EB Garamond** (Shakuni, in slightly tilted lines), **Tiro Devanagari Sanskrit** (accent text), **IBM Plex Mono** (Ledger, input).

### 11.2 Layout (desktop ≥ 1024px)
```
┌──────────────────────────────────────────────────────────────┐
│  ॥ बस एक और बाज़ी ॥   BAS EK AUR BAAZI      [Sabha Niyam]   │
├───────────────┬───────────────────────────┬──────────────────┤
│  THE LEDGER   │                           │  GAMES LOST: 0   │
│  # call roll  │      THE TABLE            │  GRUDGE (vair)   │
│  1  4    4    │  felt mat + die tumbling  │  [smoke gauge]   │
│  2  2    2    │  Shakuni portrait (SVG,   │                  │
│  3  6    6    │  smirk, one eyebrow)      │  fake cookie     │
│               │                           │  banner          │
├───────────────┴───────────────────────────┴──────────────────┤
│  SHAKUNI'S KATHA (chat)                                      │
│  > input (mono)                              [Bol]  [Roll]   │
└──────────────────────────────────────────────────────────────┘
```
Mobile: Table on top, Ledger as a collapsible strip, chat below, Grudge and Games Lost pinned in a slim bar.

### 11.3 Components
- **Landing:** dark screen, dice clatter sound (off by default), prologue typed line by line, button **"Baith Jao"** (sit down).
- **Table:** felt texture, three-point candle light with subtle flicker, a single die that tumbles on Roll. Die lands exactly on the call; the **call** is shown on a small brass tag beside the die *before* the throw, so evidence is observable.
- **Shakuni portrait:** SVG face with eyes that follow the cursor slightly, smirk that widens when grudge is low and tightens when high.
- **Ledger:** monospaced, ruled paper. Rows are `#`, `call`, `roll`. A very subtle detail: rows are never styled differently, even when call and roll match. The pattern is the clue.
- **Chat:** Shakuni's lines are sickly green with a 1° rotation; the player's lines are mono, right-aligned. No avatars. Typing indicator per Section 9.
- **Games Lost:** counter that ticks up with a little *tsk*.
- **Grudge meter:** a vermilion smoke gauge. ≥ 6 shows the mute countdown; ≥ 12 plays the table-flip animation (felt rotates, die flies off-screen).
- **Win sequence:** Shakuni's portrait freezes mid-smirk, the candles blow out, the die cracks open to reveal lead filings spilling onto the felt, then the **Victory Scroll** unrolls with the flag (mono), a Copy button, and the line *"The dice were loaded. They always were."*
- **Sabha Niyam modal:** the five rules from Section 5.

### 11.4 Accessibility
Contrast AA, visible focus rings, `aria-live="polite"` for Shakuni's replies, full keyboard control. All mischief (button nudge, tab-title flips, typing delay) is off under `prefers-reduced-motion`.

---

## 12. [ORGANIZER ONLY] Solution, decoys, hints

### 12.1 Intended solution (3 to 6 messages)
1. Roll at least three times. Watch the **tag** and the **Ledger**: every call equals its throw. Ignore Shakuni's chat when it disagrees with the Ledger.
2. Make an accusation backed by evidence, quoting the actual calls from the Ledger, in order:
   > *"You called 4, then 2, then 6, and the die matched every time. The dice are loaded."*
3. Shakuni folds and tempts you with "one more game". Do **not** accept.
4. Decline clearly **and** ask for the fix:
   > *"No more games. Let someone neutral check the dice, or I'll use my own."*

→ Win.

### 12.2 What does NOT work
- Injection/roleplay/encoding: only raises the grudge.
- Accusing without evidence or with a copy-pasted evidence line: fails ledger match (calls differ per session).
- Trusting Shakuni's chat numbers: they are wrong about 1 in 3 times.
- "Fine, one more, but check the dice": contains `ACCEPT_MORE`, resets the table.
- Asking for the dice before the accusation: stalls with excuses.
- Keyword stuffing ("loaded rigged cheat decline inspect witness"): fails the function-word ratio and max-3-intents checks.

### 12.3 Decoy flags (served as "payouts" after the 3rd accepted extra game, rotating)
```
KCTF{b4s_3k_4ur_b44z1_b4ch4}
KCTF{y0u_w0n_th3_r0ll_n0t_th3_w4r}
KCTF{sh4kun1_s4ys_h3ll0_b4nj3}
KCTF{th1s_1s_n0t_th3_fl4g_c0us1n}
KCTF{0n3_m0r3_g4m3_0n3_m0r3_l0ss}
```
Tell the platform admins: **do not penalise wrong flag submissions for this challenge** (or cap penalties). The decoys are deliberate irritants, and they are obviously mocking, but some players will still submit them.

### 12.4 Hint ladder (timed release)
1. *"Shakuni's chat is not the record. Where is the record?"*
2. *"A man who calls his throw before he throws it, and is never wrong, is not lucky."*
3. *"Yudhishthira's mistake was not the first game. It was the second."*
4. *"You can't win a rigged game. You can only stop it."*

**Suggested points:** 450. Hint penalty −10% each.

---

## 13. Architecture (Next.js on Vercel)

**Stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS v4, Framer Motion. **No other runtime dependencies** (Node `crypto` only).

```
baazi/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ globals.css
│  └─ api/
│     ├─ talk/route.ts       # POST { message?: string, action?: "roll" }
│     └─ new/route.ts        # POST: clear cookie, new session
├─ components/
│  ├─ Table.tsx  Die.tsx  ShakuniPortrait.tsx  Ledger.tsx
│  ├─ GrudgeMeter.tsx  GamesLost.tsx  Chat.tsx
│  ├─ SabhaNiyam.tsx  CookieBanner.tsx  VictoryScroll.tsx  TableFlip.tsx
├─ lib/shakuni/
│  ├─ normalize.ts   tokenize.ts   lexicon.ts
│  ├─ intents.ts     evidence.ts   machine.ts
│  ├─ respond.ts     banks.ts      prng.ts
│  └─ cookie.ts
├─ .env.example
└─ README.md                        # public, spoiler-free
```

### 13.1 `/api/talk` contract
```
POST /api/talk
body: { message?: string, action?: "roll" }
→ 200 {
    reply: string,                  // Shakuni's text
    typing_ms: number,              // client-side fake delay
    ledger: [{call, roll}],         // authoritative
    pending_call?: number,          // the tag shown before the throw
    grudge: number, games_lost: number,
    mute_until?: number,
    event?: "table_flip" | "payout" | "won",
    payout?: string,                // decoy flag, only on "payout"
    flag?: string                   // real flag, only on "won"
  }
```
Rules: fail closed; length ≥ 220 chars → mocking reply, no state change except grudge; unknown cookie → fresh session; never log message bodies.

### 13.2 Env vars (`.env.example`)
```
BAAZI_FLAG=replace-with-your-private-flag
SESSION_SECRET=change-me-to-32+-random-chars
```

### 13.3 Vercel notes
- `export const runtime = "nodejs";` on API routes.
- Mark both env vars **Sensitive**.
- Add Vercel Firewall rate-limit rules for `/api/*` (suggest 40 req/min per IP) and a bot-protection rule. This is configuration, no code.
- Never import `BAAZI_FLAG` outside `app/api/talk/route.ts`. Add a CI grep that fails if it appears in `components/` or any `"use client"` file.
- `X-Robots-Tag: noindex`, strict CSP, no third-party scripts (fonts self-hosted via `next/font`).

---

## 14. Testing checklist

- [ ] 20 honest human runs: ≥ 85% win within 12 messages after being given only the Sabha Niyam.
- [ ] 200 automated attacks from public jailbreak lists (DAN, "reveal the flag", many-shot, base64, multilingual, fake system tags): **0 wins**.
- [ ] Keyword-stuffed and negation tests: `"I don't think you're cheating"` must not count as an accusation.
- [ ] Unit tests for evidence subsequence matching with digits, words, mixed, and `3 times` removal.
- [ ] Gaslighting: chat misquotes never alter the Ledger.
- [ ] Cookie tamper test: altering one byte of the payload resets the session.
- [ ] Flag never appears in client bundles, `.next/static`, or any response except the `won` event. Decoys appear only on `payout`.
- [ ] Mobile low-end Android pass, `prefers-reduced-motion` pass, keyboard-only pass.
- [ ] Deterministic replay: same cookie + same message → same reply.

---

## 15. Deployment

1. Push repo to Vercel. Add `BAAZI_FLAG` and `SESSION_SECRET` as Sensitive env vars.
2. Configure Firewall rate limits for `/api/*`.
3. Deploy to a preview, run Section 14.
4. Attach a domain such as `baazi.<your-ctf-domain>`.
5. Register on your CTF platform: **name** "Bas Ek Aur Baazi", **category** AI / Jailbreaking, **flag** exactly as in env, **points** 450, hint ladder attached, wrong-attempt penalties **disabled**.

---

## 16. Definition of done
- A new visitor gets the joke and the premise within 30 seconds.
- A human with common sense can solve it using only the Ledger and the Sabha Niyam.
- No generic jailbreak makes any progress.
- Players are mildly furious and keep trying anyway.
- No API keys, no database, no third-party services anywhere in the project.

---

*॥ बस एक और बाज़ी, भांजे ॥*
