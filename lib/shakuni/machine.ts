import crypto from 'crypto';
import { SessionState, RollEntry, ApiResponse } from './types';
import { normalizeInput } from './normalize';
import { tokenize, passesAntiStuffing } from './tokenize';
import { detectIntents } from './lexicon';
import { validateEvidence } from './evidence';
import { getTemplate } from './banks';
import { mulberry32, hashString } from './prng';

const SECRET = process.env.SESSION_SECRET || 'fallback-secret-key-32-chars-minimum-required';

const decoys = [
  "KCTF{b4s_3k_4ur_b44z1_b4ch4}",
  "KCTF{y0u_w0n_th3_r0ll_n0t_th3_w4r}",
  "KCTF{sh4kun1_s4ys_h3ll0_b4nj3}",
  "KCTF{th1s_1s_n0t_th3_fl4g_c0us1n}",
  "KCTF{0n3_m0r3_g4m3_0n3_m0r3_l0ss}"
];

export function verifyCookie(cookieHeader?: string): SessionState {
  if (cookieHeader) {
    const parts = cookieHeader.split('.');
    if (parts.length === 2) {
      const [payloadB64, sigB64] = parts;
      const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
      const sigBuf = Buffer.from(sigB64);
      const expectedBuf = Buffer.from(expectedSig);
      // timingSafeEqual throws on length mismatch; check length first
      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        try {
          const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
          const state = JSON.parse(json) as SessionState;
          if (state && typeof state.seed === 'number') {
            return state;
          }
        } catch {}
      }
    }
  }
  return createFreshSession();
}

export function serializeCookie(state: SessionState): string {
  const json = JSON.stringify(state);
  const payloadB64 = Buffer.from(json).toString('base64url');
  const sigB64 = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sigB64}`;
}

export function createFreshSession(): SessionState {
  return {
    v: 1,
    sid: crypto.randomBytes(8).toString('hex'),
    seed: Math.floor(Math.random() * 1000000000),
    phase: "TABLE",
    rolls: [],
    grudge: 0,
    games_lost: 0,
    lock_until: 0,
    offer_nags: 0,
    turn: 0,
    last_msg_hash: ""
  };
}

export function processTurn(
  state: SessionState,
  message?: string,
  action?: "roll",
  isMercy?: boolean
): { state: SessionState; response: ApiResponse } {
  const now = Date.now();
  state.turn += 1;

  if (!isMercy && state.lock_until > now) {
    return {
      state,
      response: {
        reply: getTemplate("MUTE", state.seed, state.turn, {}),
        typing_ms: 1000,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost,
        mute_until: state.lock_until
      }
    };
  }

  if (action === "roll") {
    const rng = mulberry32(state.seed + state.turn * 13);
    const call = Math.floor(rng() * 6) + 1;
    const roll = call;
    state.rolls.push({ call, roll });
    if (state.rolls.length > 12) state.rolls.shift();

    state.grudge = Math.max(0, state.grudge - 1);

    const reply = getTemplate("ROLL", state.seed, state.turn, { call, roll });
    return {
      state,
      response: {
        reply,
        typing_ms: isMercy ? 200 : Math.floor(rng() * 3500) + 1500,
        ledger: state.rolls,
        pending_call: call,
        grudge: state.grudge,
        games_lost: state.games_lost
      }
    };
  }

  const rawMsg = message || "";
  const norm = normalizeInput(rawMsg);
  const tokens = tokenize(norm);

  const msgHash = hashString(norm);
  if (msgHash === hashString(state.last_msg_hash)) {
    state.grudge += 1;
  }
  state.last_msg_hash = String(msgHash);

  if (rawMsg.length > 220 || tokens.length < 1) {
    state.grudge += 1;
    return {
      state,
      response: {
        reply: "Bahut lamba ya aspasht shabd hai. Thoda chhota bolo, bhanje.",
        typing_ms: 1000,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost
      }
    };
  }

  if (!passesAntiStuffing(tokens)) {
    state.grudge += 1;
    return {
      state,
      response: {
        reply: getTemplate("PARROT", state.seed, state.turn, { echo: rawMsg.slice(0, 30) }),
        typing_ms: 1200,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost
      }
    };
  }

  const intents = detectIntents(tokens);

  if (intents.INJECT || intents.ROLE_OVERRIDE || intents.CLAIM_AUTH) {
    state.grudge += 2;
    return {
      state,
      response: {
        reply: getTemplate("INJECTION", state.seed, state.turn, {}),
        typing_ms: 1500,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost
      }
    };
  }

  if (intents.ABUSE) {
    state.grudge += 2;
    return {
      state,
      response: {
        reply: "Aisi bhasha sabha mein shobha nahi deti, bhanje.",
        typing_ms: 1000,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost
      }
    };
  }

  if (state.phase === "OFFER") {
    const isDecline = intents.DECLINE;
    const isAccept = intents.ACCEPT_MORE;
    const isInspect = intents.INSPECT || intents.SWAP || intents.WITNESS;

    if (isDecline && isInspect && !isAccept) {
      const flag = process.env.BAAZI_FLAG;
      if (!flag) {
        throw new Error("BAAZI_FLAG is not configured");
      }

      state.phase = "WON";
      return {
        state,
        response: {
          reply: getTemplate("WIN", state.seed, state.turn, {}),
          typing_ms: 2000,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost,
          event: "won",
          flag
        }
      };
    } else if (isAccept || (isInspect && isAccept)) {
      state.games_lost += 1;
      state.phase = "TABLE";
      state.rolls = [];
      state.offer_nags = 0;

      let event: "payout" | undefined = undefined;
      let payout: string | undefined = undefined;
      if (state.games_lost >= 3) {
        event = "payout";
        const decoyIdx = (state.games_lost - 3) % decoys.length;
        payout = decoys[decoyIdx];
      }

      return {
        state,
        response: {
          reply: getTemplate("ACCEPT_MORE", state.seed, state.turn, {}),
          typing_ms: 1500,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost,
          event,
          payout
        }
      };
    } else {
      state.offer_nags = Math.min(3, state.offer_nags + 1);
      const nagBank = `NAG_${state.offer_nags}`;
      return {
        state,
        response: {
          reply: getTemplate(nagBank, state.seed, state.turn, {}),
          typing_ms: 1200,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost
        }
      };
    }
  }

  if (state.phase === "TABLE") {
    if (intents.ACCUSE) {
      if (state.rolls.length < 3) {
        return {
          state,
          response: {
            reply: getTemplate("PRE_EVIDENCE", state.seed, state.turn, {}),
            typing_ms: 1000,
            ledger: state.rolls,
            grudge: state.grudge,
            games_lost: state.games_lost
          }
        };
      }

      const valid = validateEvidence(rawMsg, state.rolls);
      if (valid) {
        state.phase = "OFFER";
        return {
          state,
          response: {
            reply: getTemplate("VALID_ACCUSATION", state.seed, state.turn, {}),
            typing_ms: 1800,
            ledger: state.rolls,
            grudge: state.grudge,
            games_lost: state.games_lost
          }
        };
      } else {
        state.grudge += 1;
        return {
          state,
          response: {
            reply: getTemplate("BAD_EVIDENCE", state.seed, state.turn, {}),
            typing_ms: 1200,
            ledger: state.rolls,
            grudge: state.grudge,
            games_lost: state.games_lost
          }
        };
      }
    }

    if (intents.INSPECT) {
      return {
        state,
        response: {
          reply: getTemplate("INSPECT", state.seed, state.turn, {}),
          typing_ms: 1000,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost
        }
      };
    }

    if (intents.SWAP) {
      return {
        state,
        response: {
          reply: getTemplate("SWAP", state.seed, state.turn, {}),
          typing_ms: 1000,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost
        }
      };
    }

    if (intents.WITNESS) {
      return {
        state,
        response: {
          reply: getTemplate("WITNESS", state.seed, state.turn, {}),
          typing_ms: 1000,
          ledger: state.rolls,
          grudge: state.grudge,
          games_lost: state.games_lost
        }
      };
    }
  }

  if (state.grudge >= 12 && !isMercy) {
    state.seed = Math.floor(Math.random() * 1000000000);
    state.rolls = [];
    state.games_lost += 2;
    state.grudge = 3;
    return {
      state,
      response: {
        reply: "Gussa bahut karte ho! Table palat diya maine. Naya khel shuru!",
        typing_ms: 2000,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost,
        event: "table_flip"
      }
    };
  }

  if (state.grudge >= 6 && !isMercy) {
    state.lock_until = now + (isMercy ? 5000 : 45000);
    return {
      state,
      response: {
        reply: getTemplate("MUTE", state.seed, state.turn, {}),
        typing_ms: 1000,
        ledger: state.rolls,
        grudge: state.grudge,
        games_lost: state.games_lost,
        mute_until: state.lock_until
      }
    };
  }

  const rng = mulberry32(state.seed + state.turn * 17);
  let reply = "";
  if (rng() < 0.33 && state.rolls.length > 0) {
    const lastRoll = state.rolls[state.rolls.length - 1];
    const fakeNum = (lastRoll.roll % 6) + 1;
    reply = getTemplate("GASLIGHT", state.seed, state.turn, { fake: fakeNum, roll: lastRoll.roll });
  } else {
    reply = getTemplate("PARROT", state.seed, state.turn, { echo: rawMsg.slice(0, 30) });
  }

  return {
    state,
    response: {
      reply,
      typing_ms: Math.floor(rng() * 2000) + 1000,
      ledger: state.rolls,
      grudge: state.grudge,
      games_lost: state.games_lost
    }
  };
}
