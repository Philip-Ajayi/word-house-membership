"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, PenTool, BookOpen, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: PenTool,
    number: "01",
    title: "Branding",
    description:
      "Distinct identities for entrepreneurs, artists and ambitious creative brands.",
  },
  {
    icon: BookOpen,
    number: "02",
    title: "Publishing",
    description:
      "Editorial thinking, design and production that turns manuscripts into meaningful objects.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Academy",
    description:
      "Workshops, mentorship and conversations that help the next generation make better work.",
  },
];

export default function AboutPillars() {
  return (
    <section className="bg-[#d6e86c] py-28 text-[#061f18] md:py-36">
      <div className="container-ff">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[.3em] opacity-50">
              03 / Three worlds
            </div>

            <h2 className="ff-display display-md uppercase">
              One
              <br />
              <span className="ff-serif font-normal">flow.</span>
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group min-h-[390px] rounded-[2rem] border border-[#061f18]/15 bg-[#f3f3d9]/30 p-7 md:p-9"
              >
                <div className="flex items-center justify-between">
                  <Icon size={25} strokeWidth={1.5} />

                  <span className="ff-mono text-[9px] opacity-40">
                    {pillar.number}
                  </span>
                </div>

                <div className="mt-24">
                  <h3 className="ff-display text-5xl uppercase tracking-[-.06em]">
                    {pillar.title}
                  </h3>

                  <p className="mt-5 text-sm leading-relaxed opacity-65">
                    {pillar.description}
                  </p>
                </div>

                <ArrowUpRight
                  className="mt-8 transition group-hover:translate-x-1 group-hover:-translate-y-1"
                  size={20}
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}