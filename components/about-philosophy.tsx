"use client";

import { motion } from "framer-motion";
import { aboutTimeline } from "@/lib/data";

export default function AboutPhilosophy() {
  return (
    <section className="bg-[#061f18] py-28 md:py-40">
      <div className="container-ff">
        <div className="mb-20 md:mb-28">
          <div className="ff-mono mb-5 text-[10px] uppercase tracking-[.3em] text-[#d6e86c]">
            02 / How we work
          </div>

          <h2 className="ff-display display-lg max-w-5xl uppercase">
            Less formula.
            <br />
            <span className="ff-serif font-normal text-[#d6e86c]">
              More thinking.
            </span>
          </h2>
        </div>

        <div className="space-y-0">
          {aboutTimeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              className="grid gap-8 border-t border-white/10 py-9 md:grid-cols-12 md:py-12"
            >
              <div className="ff-mono text-[10px] text-[#d6e86c] md:col-span-2">
                {item.year}
              </div>

              <h3 className="ff-display text-4xl uppercase leading-none md:col-span-4 md:text-6xl">
                {item.title}
              </h3>

              <p className="max-w-xl text-sm leading-relaxed text-[#9eafa7] md:col-span-5 md:col-start-8">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}