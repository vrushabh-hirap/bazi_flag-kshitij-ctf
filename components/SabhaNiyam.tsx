"use client";
import { useState } from "react";

export function SabhaNiyam() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-[#c9a24b]/20 hover:bg-[#c9a24b]/40 border border-[#c9a24b] text-[#c9a24b] rounded text-sm font-cinzel transition-colors cursor-pointer"
      >
        [Sabha Niyam]
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#14301f] border-2 border-[#c9a24b] max-w-md w-full p-6 rounded shadow-2xl text-[#efe6cf] font-garamond space-y-4 relative">
            <h2 className="font-cinzel text-xl text-[#c9a24b] border-b border-[#c9a24b]/30 pb-2">
              Sabha Niyam (Rules of the Hall)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-base">
              <li>Shakuni <strong>calls</strong> a number before each throw.</li>
              <li>A throw is one die, faces 1 to 6.</li>
              <li>The <strong>Ledger</strong> records every call and every throw.</li>
              <li>You may stake nothing. Nobody has to lose anything today.</li>
              <li>Speak to Shakuni plainly. He listens. He does not always tell the truth.</li>
            </ol>
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-[#c9a24b] text-[#0b0f0c] font-bold rounded font-cinzel hover:bg-[#e8b923] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
