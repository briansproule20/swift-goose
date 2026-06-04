"use client";

import { motion } from "motion/react";

/**
 * A single slow cobalt wash behind the hero — quiet, not a light show.
 * Decoration only: pointer-events-none, aria-hidden.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, var(--hash), transparent 65%)",
          opacity: 0.16,
        }}
        animate={{ y: [0, 28, 0], opacity: [0.13, 0.18, 0.13] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
