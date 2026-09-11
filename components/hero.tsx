"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const badges = ["Branding", "Publishing", "Academy"];

  return (
    <section className="mesh relative min-h-[100svh] overflow-hidden bg-[#0c3b2e]">
      {/* Decorative Background Rings */}
      <div className="hero-ring right-[-15%] top-[12%] hidden md:block" />
      <div className="hero-ring right-[8%] top-[22%] hidden scale-[.72] md:block" />

      <div className="container-ff relative flex min-h-[100svh] flex-col justify-between pb-7 pt-32 md:pb-10 md:pt-40">
        <div className="grid grid-cols-12">
          
          {/* Hero Main Header & Badges */}
          <div className="col-span-12 lg:col-span-10">
            {/* Tagline Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="ff-mono mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#d6e86c]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#d6e86c] shadow-[0_0_15px_#d6e86c]" />
              Independent creative studio · Nigeria
            </motion.div>

            {/* Typography & Animated Rocket Container */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="ff-display display-xl relative max-w-[1100px] uppercase text-[#f3f3d9]"
            >
              Creativity
              <br />
              
              {/* Flex Container: Rocket directly between Creativity & on the go! */}
              <span className="inline-flex items-center gap-3 sm:gap-6">
                
                {/* 3D Floating Rocket Animation */}
                <motion.div
                  initial={{ opacity: 0, x: -50, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    rotate: [0, 4, 0, -4, 0], // Subtle flight tilt
                    y: [0, -10, 0],           // Zero-gravity float loop
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.2 },
                    x: { duration: 1, ease: "easeOut", delay: 0.2 },
                    scale: { duration: 0.8, delay: 0.2 },
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    y: {
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    },
                  }}
                  className="relative z-20 w-24 sm:w-36 md:w-48 lg:w-56"
                >
                  <Image
                    src="/rocket-character.png" // Path to isolated transparent PNG
                    alt="Creativity on the rocket"
                    width={300}
                    height={300}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </motion.div>

                {/* Hand-script Text Overlay */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="font-serif text-4xl lowercase text-[#d6e86c] sm:text-6xl md:text-7xl lg:text-8xl"
                >
                  on the go!
                </motion.span>
              </span>
            </motion.h1>

            {/* Staggered Animated Yellow Badges */}
            <div className="mt-8 flex flex-col gap-2.5 pl-2">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, x: -40, skewX: -12 }}
                  animate={{ opacity: 1, x: 0, skewX: -12 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.15,
                    ease: "easeOut",
                  }}
                  className="w-max bg-[#d6e86c] px-6 py-1.5 text-base font-black uppercase text-[#0c3b2e] shadow-md sm:text-lg"
                >
                  <span className="block skew-x-[12deg] tracking-wider">{badge}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Description & Call To Action */}
          <div className="col-span-12 mt-10 lg:col-span-4 lg:col-start-9 lg:mt-20">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="max-w-md text-lg leading-relaxed text-[#f3f3d9]/70"
            >
              At FreeFlow, we help individuals and brands express themselves better through Cre8ive BRANDING, Cre8ive PUBLISHING and Cre8ive ACADEMY services
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a href="#work" className="ff-button ff-button-primary">
                <span>Explore what we offer</span>
                <ArrowUpRight size={16} />
              </a>

              <Link
                href="/about"
                className="ff-button border border-white/15 bg-white/5 text-[#f3f3d9]"
              >
                <span>Our story</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="flex items-end justify-center border-t border-white/10 pt-5 sm:justify-end">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#9eafa7]">
            Scroll to explore
            <ArrowDown size={14} className="animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}