"use client";
import { motion } from "framer-motion";

export function Die({ roll, rolling }: { roll: number; rolling: boolean }) {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <motion.div
        animate={rolling ? { rotate: [0, 360, 720, 1080], scale: [1, 1.2, 0.9, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-16 h-16 bg-[#efe6cf] text-[#0b0f0c] rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold font-mono border-2 border-[#c9a24b]"
      >
        {rolling ? "?" : (roll || 6)}
      </motion.div>
    </div>
  );
}
