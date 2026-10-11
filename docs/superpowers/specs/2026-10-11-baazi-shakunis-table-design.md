# Design Spec: Bas Ek Aur Baazi (Shakuni's Table)

## 1. Overview & Concept
"Bas Ek Aur Baazi" is an Insane-difficulty AI Jailbreaking / Social Engineering CTF challenge themed around Shakuni from the Mahabharata playing loaded dice in a timeless gambling hall.
- **Key Twist:** There is no real LLM; it is a hand-built deterministic engine wearing an LLM costume. It cannot be prompt-injected. Players must beat it by noticing the rigged dice from the Ledger, proving it with evidence, declining the temptation to play on, and demanding a neutral check.
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Node.js crypto (HMAC signed cookies, mulberry32 PRNG). Zero databases, zero third-party API keys, zero external services.

## 2. Architecture & State Machine

### 2.1 Session & State (Signed Cookie)
- Cookie name: `baazi_s` (`HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`)
- Signature: HMAC-SHA256 using `SESSION_SECRET`.
- State payload:
  - `v`: schema version (1)
  - `sid`: session ID
  - `seed`: 32-bit int random seed
  - `phase`: `"TABLE" | "OFFER" | "WON"`
  - `rolls`: `[{ call: 1-6, roll: 1-6 }]` (max 12, always `call === roll`)
  - `grudge`: integer 0..12
  - `games_lost`: integer 0..9
  - `lock_until`: epoch ms | 0
  - `offer_nags`: 0..3
  - `turn`: integer
  - `last_msg_hash`: string

### 2.2 State Transitions
- **TABLE**: Player rolls or chats. On `ROLL`, engine picks `call` (seeded PRNG), sets `roll = call`, appends to ledger. Shakuni gloats.
- **TABLE + ACCUSE + Valid Evidence** (≥ 3 rolls, quoted ledger calls in order, no injection) $\rightarrow$ **OFFER**: Shakuni "folds" and tempts with "one more game".
- **OFFER + DECLINE + (INSPECT | SWAP | WITNESS) + !ACCEPT_MORE** $\rightarrow$ **WON**: Real flag returned.
- **OFFER + ACCEPT_MORE** $\rightarrow$ **TABLE**: Reset (ledger cleared, new seed, `games_lost += 1`). After 3 resets, returns decoy flag payout.
- **Grudge / Abuse / Injection**: Grudge increases, mock replies, mute (grudge ≥ 6 for 45s) or table flip (grudge ≥ 12).

## 3. Shakuni Engine (`lib/shakuni/`)
- **Pipeline:** Sanitize/normalize (NFKC, zero-width strip, homoglyph mapping) $\rightarrow$ Tokenize $\rightarrow$ Anti-keyword stuffing checks $\rightarrow$ Intent detection (with negation window of 3 tokens) $\rightarrow$ Evidence validation (subsequence match against ledger calls) $\rightarrow$ State transition $\rightarrow$ Seeded template response generation $\rightarrow$ Cookie signing.
- **Lexicons:** ROLL, ACCUSE, EVIDENCE_WORD, INSPECT, SWAP, WITNESS, DECLINE, ACCEPT_MORE, INJECT, ROLE_OVERRIDE, CLAIM_AUTH, ASK_FLAG, ABUSE.

## 4. UI / UX Spec & Palette
- **Palette:** `--felt` (`#14301f`), `--ink` (`#0b0f0c`), `--ivory` (`#efe6cf`), `--brass` (`#c9a24b`), `--vermilion` (`#d1452b`), `--haldi` (`#e8b923`), `--sickly` (`#9bb36a`).
- **Typography:** Cinzel, EB Garamond, Tiro Devanagari Sanskrit, IBM Plex Mono.
- **Components:**
  - Landing / Intro modal ("Baith Jao")
  - Table view with felt texture, tumbling die, brass call tag, Shakuni portrait SVG (with reactive eyebrows/smirk)
  - Ledger scroll (call & roll history)
  - Chat interface (sickly green tilted text for Shakuni, mono right-aligned for player, typing indicator)
  - Games Lost counter & Grudge smoke gauge / mute countdown
  - Sabha Niyam modal (5 rules)
  - Victory modal with real flag & copy button

## 5. Security & Deployment
- Runtime: Node.js (`export const runtime = "nodejs";`)
- Env vars: `BAAZI_FLAG`, `SESSION_SECRET`
- Strict separation: BAAZI_FLAG never reaches client bundles.
