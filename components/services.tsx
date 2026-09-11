"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="work" className="relative overflow-hidden bg-[#f3f3d9] py-28 text-[#0c3b2e] md:py-40">
      <div className="container-ff">
        <div className="mb-20 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[0.3em] opacity-50">
              01 / What we do
            </div>

            <h2 className="ff-display display-lg uppercase">
              Three ways
              <br />
              <span className="ff-serif font-normal">to flow.</span>
            </h2>
          </div>

          <div className="md:col-span-4 md:col-start-9 md:pt-10">
            <p className="text-base leading-relaxed opacity-65">
              Different problems. Different people. One philosophy:
              thoughtful creativity should move ideas forward.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => {
            const [firstWord, ...restWords] = service.title.split("\n");
            const secondWord = restWords.join(" ");

            return (
              <motion.article
                key={service.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.08 }}
                className={`group relative overflow-hidden rounded-[2rem] border border-[#0c3b2e]/10 p-6 md:p-10 ${
                  service.color === "lime"
                    ? "bg-[#d6e86c]"
                    : service.color === "green"
                      ? "bg-[#1ba05c] text-[#f3f3d9]"
                      : "bg-[#0c3b2e] text-[#f3f3d9]"
                }`}
              >
                <div className="relative z-10 grid gap-12 md:grid-cols-12">
                  <div className="md:col-span-2">
                    <span className="ff-mono text-[10px] opacity-50">
                      {service.number}
                    </span>
                  </div>

                  <div className="md:col-span-5">
                    <span className="ff-mono text-[9px] uppercase tracking-[.2em] opacity-60">
                      {service.eyebrow}
                    </span>

                    <h3 className="ff-display mt-5 uppercase leading-[.84] tracking-[-.07em]">
                      <span className="block text-2xl tracking-normal opacity-80 md:text-3xl">
                        {firstWord}
                      </span>
                      <span className="block text-5xl md:text-7xl">
                        {secondWord}
                      </span>
                    </h3>
                  </div>

                  <div className="md:col-span-4 md:col-start-9">
                    <p className="mb-7 max-w-sm text-sm leading-relaxed opacity-70">
                      {service.description}
                    </p>

                    <ul className="border-t border-current/15">
                      {service.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center justify-between border-b border-current/15 py-3 text-xs"
                        >
                          <span>{item}</span>
                          <Plus
                            size={14}
                            className="opacity-40 transition group-hover:rotate-90"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <ArrowUpRight
                  className="absolute bottom-7 right-7 opacity-30 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                  size={24}
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}