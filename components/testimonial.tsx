"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/lib/data";

const AUTOPLAY_DURATION = 5000;

export default function Testimonial() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const previous = () => {
    setActive((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const next = () => {
    setActive((current) =>
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  // Auto-play
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setActive((current) =>
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, AUTOPLAY_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, active]);

  const testimonial = testimonials[active];

  return (
    <section
      className="relative overflow-hidden bg-[#d6e86c] py-28 text-[#061f18] md:py-40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full border border-[#0c3b2e]/10" />

      <div className="container-ff relative">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Quote Icon */}
          <div className="md:col-span-2">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-[#0c3b2e]/20">
              <Quote size={20} />
            </div>
          </div>

          {/* Testimonial */}
          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="ff-display text-4xl uppercase leading-[.94] tracking-[-.05em] md:text-7xl">
                  “{testimonial.quote}”
                </p>

                <div className="mt-10 flex items-center gap-4">
                  <div className="h-px w-12 bg-[#0c3b2e]/30" />

                  <div>
                    <div className="text-sm font-bold">{testimonial.name}</div>

                    <div className="ff-mono mt-1 text-[8px] uppercase tracking-[.2em] opacity-50">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-14 flex items-center justify-between border-t border-[#0c3b2e]/20 pt-6">
              {/* Pagination */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    aria-label={`Show testimonial ${index + 1}`}
                    className={`h-1.5 transition-all duration-300 ${
                      index === active
                        ? "w-10 bg-[#0c3b2e]"
                        : "w-2 bg-[#0c3b2e]/30"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <button
                  onClick={previous}
                  aria-label="Previous testimonial"
                  className="grid h-11 w-11 place-items-center rounded-full border border-[#0c3b2e]/30 transition hover:bg-[#0c3b2e] hover:text-[#d6e86c]"
                >
                  <ArrowLeft size={17} />
                </button>

                <button
                  onClick={next}
                  aria-label="Next testimonial"
                  className="grid h-11 w-11 place-items-center rounded-full border border-[#0c3b2e]/30 transition hover:bg-[#0c3b2e] hover:text-[#d6e86c]"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}