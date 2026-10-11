"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function VictoryScroll({ flag }: { flag: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#efe6cf] text-[#0b0f0c] max-w-lg w-full p-8 rounded shadow-2xl font-garamond space-y-6 border-4 border-[#c9a24b] relative text-center">
        <h2 className="font-cinzel text-3xl font-bold text-[#14301f]">
          ॥ VICTORY ॥
        </h2>
        <p className="text-xl italic">
          &ldquo;The dice were loaded. They always were.&rdquo;
        </p>
        <div className="bg-[#0b0f0c] text-[#efe6cf] p-4 rounded font-mono text-lg flex items-center justify-between border border-[#c9a24b]">
          <span className="tracking-widest text-[#e8b923]">{flag}</span>
          <button
            onClick={handleCopy}
            className="p-2 bg-[#c9a24b] text-[#0b0f0c] rounded hover:bg-[#e8b923] transition-colors cursor-pointer"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
        <p className="text-sm text-[#0b0f0c]/70">
          You refused the bait, proved the fraud from the Ledger, and walked away from Shakuni&apos;s table.
        </p>
      </div>
    </div>
  );
}
