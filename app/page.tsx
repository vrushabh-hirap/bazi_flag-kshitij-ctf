"use client";
import { useState, useRef } from "react";
import { Landing } from "@/components/Landing";
import { Die } from "@/components/Die";
import { ShakuniPortrait } from "@/components/ShakuniPortrait";
import { Ledger } from "@/components/Ledger";
import { Chat } from "@/components/Chat";
import { GrudgeMeter } from "@/components/GrudgeMeter";
import { SabhaNiyam } from "@/components/SabhaNiyam";
import { VictoryScroll } from "@/components/VictoryScroll";
import { RollEntry } from "@/lib/shakuni/types";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "shakuni" | "player"; text: string }>>([
    { sender: "shakuni", text: "Aao aao, bhanje. Sirf ek baazi. Baitho yahan." }
  ]);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [pendingCall, setPendingCall] = useState<number | null>(null);
  const [currentRoll, setCurrentRoll] = useState<number>(6);
  const [rolling, setRolling] = useState(false);
  const [grudge, setGrudge] = useState(0);
  const [gamesLost, setGamesLost] = useState(0);
  const [muteUntil, setMuteUntil] = useState(0);
  const [typing, setTyping] = useState(false);
  const [victoryFlag, setVictoryFlag] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false); // synchronous guard: survives React batching within one tick

  const handleAction = async (payload: { message?: string; action?: "roll" }) => {
    if (inFlight.current) return; // serialize turns: each turn must see the previous turn's cookie
    inFlight.current = true;
    setBusy(true);

    if (payload.action === "roll") {
      setRolling(true);
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
    }

    try {
      const res = await fetch("/api/talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (payload.message) {
        setMessages(prev => [...prev, { sender: "player", text: payload.message! }]);
      }

      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setRolling(false);
        setBusy(false);
        inFlight.current = false;
        if (data.ledger) setRolls(data.ledger);
        if (data.pending_call) setPendingCall(data.pending_call);
        if (typeof data.grudge === "number") setGrudge(data.grudge);
        if (typeof data.games_lost === "number") setGamesLost(data.games_lost);
        if (data.mute_until) setMuteUntil(data.mute_until);

        if (data.reply) {
          setMessages(prev => [...prev, { sender: "shakuni", text: data.reply }]);
        }

        if (data.payout) {
          setMessages(prev => [...prev, { sender: "shakuni", text: `(Shakuni hands you a slip: ${data.payout})` }]);
        }

        if (data.event === "won" && data.flag) {
          setVictoryFlag(data.flag);
        }

        if (payload.action === "roll" && data.ledger && data.ledger.length > 0) {
          setCurrentRoll(data.ledger[data.ledger.length - 1].roll);
        }
      }, data.typing_ms || 1500);

    } catch (err) {
      setRolling(false);
      setTyping(false);
      setBusy(false);
      inFlight.current = false;
    }
  };

  if (!started) {
    return <Landing onSitDown={() => setStarted(true)} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0f0c] text-[#efe6cf] p-4 md:p-6 flex flex-col max-w-7xl mx-auto font-garamond">
      {victoryFlag && <VictoryScroll flag={victoryFlag} />}

      <header className="flex justify-between items-center border-b border-[#c9a24b]/40 pb-4 mb-6">
        <h1 className="font-cinzel text-xl md:text-2xl text-[#c9a24b] tracking-widest">
          ॥ बस एक और बाज़ी ॥ BAS EK AUR BAAZI
        </h1>
        <SabhaNiyam />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Ledger rolls={rolls} />
          <GrudgeMeter grudge={grudge} gamesLost={gamesLost} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#14301f] border-2 border-[#c9a24b]/60 rounded-xl p-6 flex flex-col md:flex-row items-center justify-around gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c9a24b_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="flex flex-col items-center gap-3 z-10">
              <ShakuniPortrait grudge={grudge} />
              <span className="font-cinzel text-[#c9a24b] text-sm">Shakuni Mama</span>
            </div>

            <div className="flex flex-col items-center gap-4 z-10">
              {pendingCall !== null && (
                <div className="px-3 py-1 bg-[#c9a24b] text-[#0b0f0c] font-mono font-bold rounded shadow text-sm">
                  Called: {pendingCall}
                </div>
              )}
              <Die roll={currentRoll} rolling={rolling} />
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            <Chat
              messages={messages}
              onSend={(msg) => handleAction({ message: msg })}
              onRoll={() => handleAction({ action: "roll" })}
              typing={typing}
              lockedUntil={muteUntil}
              busy={busy}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
