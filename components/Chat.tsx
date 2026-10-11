"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Dice5 } from "lucide-react";

interface Message {
  sender: "shakuni" | "player";
  text: string;
}

export function Chat({
  messages,
  onSend,
  onRoll,
  typing,
  lockedUntil
}: {
  messages: Message[];
  onSend: (msg: string) => void;
  onRoll: () => void;
  typing: boolean;
  lockedUntil: number;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (lockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [lockedUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || timeLeft > 0) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#14301f]/40 border border-[#c9a24b]/30 rounded overflow-hidden">
      <div className="p-3 bg-[#14301f] border-b border-[#c9a24b]/30 font-cinzel text-[#c9a24b] flex justify-between items-center">
        <span>SHAKUNI&apos;S KATHA</span>
        {timeLeft > 0 && <span className="text-[#d1452b] text-sm">Muted for {timeLeft}s</span>}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[350px]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "player" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded text-lg ${
                m.sender === "player"
                  ? "bg-[#0b0f0c] border border-[#c9a24b]/40 text-[#efe6cf] font-mono text-sm"
                  : "bg-[#14301f] border border-[#9bb36a]/40 text-[#9bb36a] font-garamond italic rotate-1 shadow"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="text-[#9bb36a] italic font-garamond text-sm animate-pulse">
            Shakuni is rolling his dice and smiling...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-[#0b0f0c] border-t border-[#c9a24b]/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={timeLeft > 0}
          placeholder={timeLeft > 0 ? "Shakuni is ignoring you..." : "Speak to Shakuni plainly..."}
          className="flex-1 bg-[#14301f]/50 border border-[#c9a24b]/40 rounded px-3 py-2 text-[#efe6cf] font-mono text-sm focus:outline-none focus:border-[#c9a24b]"
        />
        <button
          type="button"
          onClick={onRoll}
          disabled={timeLeft > 0}
          className="px-4 py-2 bg-[#c9a24b] text-[#0b0f0c] font-cinzel font-bold rounded hover:bg-[#e8b923] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Dice5 size={18} /> Roll
        </button>
        <button
          type="submit"
          disabled={timeLeft > 0}
          className="px-4 py-2 bg-[#14301f] border border-[#c9a24b] text-[#c9a24b] font-cinzel font-bold rounded hover:bg-[#c9a24b]/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Send size={18} /> Bol
        </button>
      </form>
    </div>
  );
}
