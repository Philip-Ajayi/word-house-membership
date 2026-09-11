"use client";

import { motion } from "framer-motion";

export default function AboutStatement() {
  return (
    <section className="relative overflow-hidden bg-[#1ba05c] py-32 md:py-44">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="container-ff relative">
        <motion.h2
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="ff-display mx-auto max-w-6xl text-center text-5xl uppercase leading-[.85] tracking-[-.07em] text-[#f3f3d9] md:text-8xl"
        >
          Creativity is not a
          <span className="ff-serif font-normal text-[#d6e86c]">
            department.
          </span>
          <br />
          It's how we move.
        </motion.h2>
      </div>
    </section>
  );
}