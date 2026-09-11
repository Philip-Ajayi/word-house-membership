"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { webinars, workshops } from "@/lib/data";

function MediaCard({
  title,
  subtitle,
  image,
  label,
}: {
  title: string;
  subtitle: string;
  image: string;
  label: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -7 }}
      className="group min-w-[300px] md:min-w-[400px]"
    >
      <div className="media-wrap relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#123f32]">
        <img src={image} alt={title} />

        <div className="absolute inset-0 bg-gradient-to-t from-[#061f18]/90 via-transparent to-transparent" />

        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-md">
          <span className="ff-mono text-[8px] uppercase tracking-[.2em] text-[#f3f3d9]">
            {label}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <div className="ff-mono mb-2 text-[8px] uppercase tracking-[.2em] text-[#d6e86c]">
              {subtitle}
            </div>
            <h3 className="max-w-[320px] text-xl font-bold text-[#f3f3d9]">
              {title}
            </h3>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d6e86c] text-[#061f18]">
            <ArrowUpRight size={17} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Academy() {
  return (
    <section id="academy" className="bg-[#0c3b2e] py-28 md:py-40">
      <div className="container-ff">
        <div className="mb-16 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[0.3em] text-[#d6e86c]">
              03 / Cre8ive Academy
            </div>

            <h2 className="ff-display display-lg uppercase">
              BRINGING
              <br />
              <span className="ff-serif font-normal text-[#d6e86c]">
                YOUNG IMAGINATIONS
              </span>
              <br />
              TO LIFE
            </h2>
          </div>

          <p className="max-w-md self-end text-sm leading-relaxed text-[#9eafa7] md:col-span-4">
            Workshops, webinars and mentorship designed to make creativity
            practical, accessible and impossible to keep bottled up.
          </p>
        </div>

        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="ff-mono text-[10px] uppercase tracking-[.25em] text-[#f3f3d9]">
              Workshops
            </h3>

            <span className="text-xs text-[#9eafa7]">
              {workshops.length.toString().padStart(2, "0")} editions
            </span>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {workshops.map((workshop) => (
              <MediaCard
                key={workshop.edition}
                title={workshop.title}
                subtitle={workshop.edition}
                image={workshop.image}
                label="Workshop"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="ff-mono text-[10px] uppercase tracking-[.25em] text-[#f3f3d9]">
              Webinars
            </h3>

            <span className="text-xs text-[#9eafa7]">
              {webinars.length.toString().padStart(2, "0")} sessions
            </span>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {webinars.map((webinar) => (
              <MediaCard
                key={webinar.title}
                title={webinar.title}
                subtitle={webinar.category}
                image={webinar.image}
                label="Webinar"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}