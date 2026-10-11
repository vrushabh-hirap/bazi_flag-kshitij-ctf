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
