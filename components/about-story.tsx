"use client";

import { motion } from "framer-motion";

export default function AboutStory() {
  return (
    <section className="bg-[#f3f3d9] py-28 text-[#0c3b2e] md:py-40">
      <div className="container-ff">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="ff-mono sticky top-28 text-[10px] uppercase tracking-[.25em] opacity-45">
              01 / The idea
            </div>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <motion.p
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="ff-display text-4xl uppercase leading-[.95] tracking-[-.05em] md:text-6xl"
            >
              FreeFlow exists because creativity shouldn't have to choose
              between imagination and intention.
            </motion.p>

            <p className="mt-10 max-w-2xl text-base leading-[1.8] opacity-65">
              We are a creative studio and learning community working across
              branding, publishing and creative education. We help people
              shape ideas into identities, books, experiences and skills that
              can exist beyond the moment.
            </p>

            <p className="mt-6 max-w-2xl text-base leading-[1.8] opacity-65">
              Our work sits at the intersection of strategy and expression.
              We care about the idea first, then obsess over how beautifully
              that idea can be brought into the world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}