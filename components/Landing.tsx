"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export function Landing({ onSitDown }: { onSitDown: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f0c] text-[#efe6cf] flex flex-col items-center justify-center p-6 select-none font-garamond">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl text-center space-y-6"
      >
        <h1 className="font-cinzel text-3xl md:text-4xl text-[#c9a24b] tracking-wider">
          ॥ बस एक और बाज़ी ॥
        </h1>
        <p className="text-xl italic text-[#9bb36a]">
          &ldquo;Every hall at Hastinapur has fallen. The sabha is ash. But one table survived, and one uncle with it.&rdquo;
        </p>
        <div className="text-left bg-[#14301f]/60 p-6 rounded border border-[#c9a24b]/30 space-y-3 text-lg">
          <p>He greets you like family. He always does.</p>
          <p className="font-sanskrit text-[#e8b923] text-xl">
            &ldquo;Aao aao, bhanje. Sirf ek baazi. Kuch daanv par lagane ki zaroorat nahi. Bas dil bahlane ke liye.&rdquo;
          </p>
          <p className="text-sm text-[#efe6cf]/70 italic">
            You have been warned about this man. Your grandmother warned you. Everyone&apos;s grandmother warned them.
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={onSitDown}
            className="px-8 py-3 bg-[#c9a24b] text-[#0b0f0c] font-cinzel font-bold rounded shadow-lg hover:bg-[#e8b923] transition-colors cursor-pointer"
          >
            Baith Jao (Sit Down)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
