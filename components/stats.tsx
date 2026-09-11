"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/data";

export default function Stats() {
  return (
    <section className="bg-[#f3f3d9] py-7 text-[#0c3b2e]">
      <div className="container-ff">
        <div className="grid grid-cols-2 divide-x divide-[#0c3b2e]/10 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="px-4 py-5 first:pl-0 last:pr-0 md:px-8"
            >
              <div className="ff-display text-4xl tracking-[-.07em] md:text-6xl">
                {stat.value}
              </div>
              <div className="ff-mono mt-2 text-[8px] uppercase tracking-[0.18em] opacity-50">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}