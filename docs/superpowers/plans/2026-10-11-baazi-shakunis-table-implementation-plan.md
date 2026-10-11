# Bas Ek Aur Baazi (Shakuni's Table) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete "Bas Ek Aur Baazi" CTF challenge Next.js 15 application featuring the deterministic Shakuni engine, signed cookies, rigged dice ledger, multi-stage win conditions, decoys, grudge mechanics, and atmospheric UI.

**Architecture:** Next.js 15 App Router with Node.js runtime serverless routes (`/api/talk`, `/api/new`), HMAC-SHA256 signed cookies for stateless session persistence, pure function NLU & state machine engine in `lib/shakuni/`, and Tailwind CSS v4 components with custom fonts (Cinzel, EB Garamond, IBM Plex Mono, Tiro Devanagari Sanskrit).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Node.js `crypto`.

**Spec:** `docs/superpowers/specs/2026-10-11-baazi-shakunis-table-design.md`

## Global Constraints
- No third-party API keys, no database, no external services.
- Single server-only env var `BAAZI_FLAG` and `SESSION_SECRET`.
- `BAAZI_FLAG` must never reach client bundles or responses except on `"won"`.
- Runtime: Node.js (`export const runtime = "nodejs";`).
- Deterministic engine: same cookie + same message = same reply.

## Review Focus
1. **Cookie Tampering:** Modifying any byte of the signed cookie must invalidate it and reset session.
2. **Evidence Subsequence Match:** Winning accusation requires exact sequence of ledger calls (not Shakuni's chat misquotes).
3. **Acceptance Trap:** Saying "Fine, one more, but check the dice" contains `ACCEPT_MORE` and resets the table instead of winning.
4. **Keyword Stuffing & Negation:** Stuffing keywords or saying "I don't think you're cheating" must not trigger accusations.
5. **Grudge & Mute:** High grudge (≥6) mutes for 45s; grudge ≥12 flips the table.

---

### Task 1: Project Setup, Dependencies & Types

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/globals.css`
- Create: `lib/shakuni/types.ts`

**Interfaces:**
- Consumes: none
- Produces: TypeScript types (`SessionState`, `RollEntry`, `ApiResponse`, `GamePhase`, `IntentType`).

- [ ] **Step 1: Create package.json with dependencies (next, react, react-dom, tailwindcss, framer-motion, lucide-react)**

```json
{
  "name": "baazi",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "framer-motion": "^12.4.0",
    "lucide-react": "^1.16.0",
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Create tsconfig.json and next.config.ts**
- [ ] **Create lib/shakuni/types.ts with type definitions**

```typescript
export type GamePhase = "TABLE" | "OFFER" | "WON";

export interface RollEntry {
  call: number;
  roll: number;
}

export interface SessionState {
  v: number;
  sid: string;
  seed: number;
  phase: GamePhase;
  rolls: RollEntry[];
  grudge: number;
  games_lost: number;
  lock_until: number;
  offer_nags: number;
  turn: number;
  last_msg_hash: string;
}

export interface ApiResponse {
  reply: string;
  typing_ms: number;
  ledger: RollEntry[];
  pending_call?: number;
  grudge: number;
  games_lost: number;
  mute_until?: number;
  event?: "table_flip" | "payout" | "won";
  payout?: string;
  flag?: string;
}
```

- [ ] **Step 4: Commit Task 1**
```bash
git add package.json tsconfig.json next.config.ts app/globals.css lib/shakuni/types.ts
git commit -m "feat: initial project setup and types"
```

---

### Task 2: Shakuni Engine Core (PRNG, Normalize, Tokenize, Lexicons, Machine)

**Files:**
- Create: `lib/shakuni/prng.ts`
- Create: `lib/shakuni/normalize.ts`
- Create: `lib/shakuni/tokenize.ts`
- Create: `lib/shakuni/lexicon.ts`
- Create: `lib/shakuni/banks.ts`
- Create: `lib/shakuni/evidence.ts`
- Create: `lib/shakuni/machine.ts`
- Create: `lib/shakuni/cookie.ts`

**Interfaces:**
- Consumes: `types.ts`
- Produces: `processTurn(state, message, action, isMercy)` returning updated state and response payload.

- [ ] **Step 1: Implement mulberry32 PRNG and hash helper in `prng.ts`**
- [ ] **Step 2: Implement normalization and anti-keyword stuffing in `normalize.ts` and `tokenize.ts`**
- [ ] **Step 3: Implement lexicons and intent extraction with negation in `lexicon.ts`**
- [ ] **Step 4: Implement evidence validation against ledger subsequence in `evidence.ts`**
- [ ] **Step 5: Implement response template banks and gaslighting in `banks.ts`**
- [ ] **Step 6: Implement state machine transitions, grudge logic, and cookie signing in `machine.ts` and `cookie.ts`**
- [ ] **Step 7: Commit Task 2**
```bash
git add lib/shakuni/
git commit -m "feat: implement deterministic Shakuni engine and cookie manager"
```

---

### Task 3: API Routes

**Files:**
- Create: `app/api/talk/route.ts`
- Create: `app/api/new/route.ts`

**Interfaces:**
- Consumes: `lib/shakuni/cookie.ts`, `lib/shakuni/machine.ts`
- Produces: POST endpoints `/api/talk` and `/api/new`.

- [ ] **Step 1: Implement `/api/new` route to clear cookie and start fresh session**
- [ ] **Step 2: Implement `/api/talk` route handling roll action and message input, enforcing Node.js runtime and returning signed cookie**
- [ ] **Step 3: Commit Task 3**
```bash
git add app/api/
git commit -m "feat: implement api routes for talk and new session"
```

---

### Task 4: UI Components & Layout

**Files:**
- Create: `components/Landing.tsx`
- Create: `components/Table.tsx`
- Create: `components/Die.tsx`
- Create: `components/ShakuniPortrait.tsx`
- Create: `components/Ledger.tsx`
- Create: `components/Chat.tsx`
- Create: `components/GrudgeMeter.tsx`
- Create: `components/GamesLost.tsx`
- Create: `components/SabhaNiyam.tsx`
- Create: `components/VictoryScroll.tsx`
- Create: `components/CookieBanner.tsx`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `/api/talk`, `/api/new`
- Produces: Full atmospheric CTF UI matching design spec.

- [ ] **Step 1: Implement Landing screen with prologue and "Baith Jao" button**
- [ ] **Step 2: Implement Die, ShakuniPortrait, and Table felt components**
- [ ] **Step 3: Implement Ledger, Chat, GrudgeMeter, GamesLost, and SabhaNiyam modal**
- [ ] **Step 4: Implement VictoryScroll and page integration in `app/page.tsx`**
- [ ] **Step 5: Commit Task 4**
```bash
git add components/ app/
git commit -m "feat: implement complete frontend UI components and page layout"
```

---

### Task 5: Testing & Verification

**Files:**
- Create: `tests/shakuni.test.ts`

- [ ] **Step 1: Implement unit tests for PRNG, evidence subsequence matching, cookie tampering validation, and negation rules**
- [ ] **Step 2: Run build and verify zero errors**
- [ ] **Step 3: Commit and finish**
```bash
git add tests/
git commit -m "test: add shakuni engine unit tests and verify build"
```
