"use client";

export function GrudgeMeter({ grudge, gamesLost }: { grudge: number; gamesLost: number }) {
  const heightPercent = Math.min(100, (grudge / 12) * 100);

  return (
    <div className="bg-[#14301f]/80 border border-[#c9a24b]/40 rounded p-4 flex flex-col gap-4 text-sm font-garamond">
      <div className="flex justify-between items-center font-cinzel text-[#c9a24b]">
        <span>GAMES LOST</span>
        <span className="text-xl font-bold text-[#efe6cf]">{gamesLost}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[#efe6cf]/80">
          <span>GRUDGE (vair)</span>
          <span>{grudge}/12</span>
        </div>
        <div className="w-full h-6 bg-[#0b0f0c] rounded border border-[#d1452b]/50 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-t from-[#d1452b] to-[#e8b923] transition-all duration-500"
            style={{ width: `${heightPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
