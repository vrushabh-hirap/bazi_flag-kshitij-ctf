"use client";
import { RollEntry } from "@/lib/shakuni/types";

export function Ledger({ rolls }: { rolls: RollEntry[] }) {
  return (
    <div className="bg-[#14301f]/80 border border-[#c9a24b]/40 rounded p-4 font-mono text-sm shadow-md max-h-64 overflow-y-auto">
      <div className="text-[#c9a24b] font-bold border-b border-[#c9a24b]/30 pb-2 mb-2 flex justify-between">
        <span>THE LEDGER</span>
        <span># call roll</span>
      </div>
      {rolls.length === 0 ? (
        <div className="text-[#efe6cf]/50 italic text-center py-4 font-garamond">No throws recorded yet...</div>
      ) : (
        <div className="space-y-1">
          {rolls.map((r, i) => (
            <div key={i} className="flex justify-between text-[#efe6cf]">
              <span className="text-[#c9a24b]">{i + 1}</span>
              <span>{r.call}</span>
              <span>{r.roll}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
