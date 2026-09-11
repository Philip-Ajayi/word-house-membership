"use client";

import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="mesh relative min-h-[85svh] overflow-hidden bg-[#0c3b2e]">
      <div className="container-ff flex min-h-[85svh] flex-col justify-end pb-12 pt-40 md:pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ff-mono mb-6 text-[10px] uppercase tracking-[.3em] text-[#d6e86c]"
        >
          About the studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="ff-display max-w-[1200px] text-[17vw] uppercase leading-[.76] tracking-[-.08em] text-[#f3f3d9] md:text-[13vw]"
        >
          We make
          <br />
          <span className="ff-serif font-normal text-[#d6e86c]">
            ideas move.
          </span>
        </motion.h1>

        <div className="mt-12 flex max-w-3xl justify-between gap-8 border-t border-white/10 pt-5 text-xs text-[#9eafa7]">
          <span>FreeFlow Creative Hub Ltd.</span>
          <span className="hidden sm:block">
            Branding · Publishing · Academy
          </span>
        </div>
      </div>
    </section>
  );
}