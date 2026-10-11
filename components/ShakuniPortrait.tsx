"use client";

export function ShakuniPortrait({ grudge }: { grudge: number }) {
  const smirkWidth = Math.max(10, 30 - grudge * 1.5);

  return (
    <div className="relative w-36 h-36 rounded-full bg-[#14301f] border-2 border-[#c9a24b] flex items-center justify-center overflow-hidden shadow-inner">
      <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#efe6cf]">
        <circle cx="50" cy="50" r="35" fill="#e2c098" stroke="#c9a24b" strokeWidth="2" />
        <path d="M 20 40 Q 50 10 80 40 Q 70 25 50 25 Q 30 25 20 40 Z" fill="#14301f" stroke="#c9a24b" strokeWidth="1.5" />
        <path d="M 35 65 Q 50 75 65 65 Q 50 68 35 65 Z" fill="#0b0f0c" />
        <path d={`M 40 70 Q 50 ${70 + smirkWidth/3} 65 68`} stroke="#0b0f0c" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="38" cy="45" r="4" fill="#0b0f0c" />
        <circle cx="62" cy="43" r="4" fill="#0b0f0c" />
        <path d="M 33 39 Q 38 36 43 40" stroke="#0b0f0c" strokeWidth="2" fill="none" />
        <path d="M 57 37 Q 62 33 67 38" stroke="#0b0f0c" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  );
}
