"use client";

import { motion } from "motion/react";

/**
 * Three slow-drifting accent blobs — one per concept — behind the hero.
 * Pure decoration; pointer-events-none and aria-hidden.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -left-32 top-0 size-[34rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--encrypt), transparent 65%)", opacity: 0.22 }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-10 size-[30rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--hash), transparent 65%)", opacity: 0.16 }}
        animate={{ x: [0, -50, 20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-40 size-[26rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--encode), transparent 65%)", opacity: 0.12 }}
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
