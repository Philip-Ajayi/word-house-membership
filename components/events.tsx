"use client";

import { ArrowUpRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { upcomingEvents, site } from "@/lib/data";

export default function Events() {
  return (
    <section className="bg-[#0c3b2e] py-28 md:py-36">
      <div className="container-ff">
        <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[.3em] text-[#d6e86c]">
              05 / What's next
            </div>

            <h2 className="ff-display display-md uppercase">
              Upcoming
              <br />
              <span className="ff-serif font-normal text-[#d6e86c]">
                events.
              </span>
            </h2>
          </div>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.article
                key={event.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group grid gap-5 rounded-[1.5rem] border border-white/10 bg-white/[.03] p-4 md:grid-cols-[180px_1fr_auto] md:items-center"
              >
                <div className="media-wrap aspect-[4/3] rounded-xl">
                  <img src={event.image} alt={event.title} />
                </div>

                <div>
                  <div className="ff-mono text-[9px] tracking-[.2em] text-[#d6e86c]">
                    {event.type}
                  </div>

                  <h3 className="mt-3 text-2xl font-bold">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#9eafa7]">
                    {event.location}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-7 md:flex-col md:items-end">
                  <span className="ff-mono text-sm text-[#f3f3d9]">
                    {event.date}
                  </span>

                  <ArrowUpRight
                    size={20}
                    className="transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#d6e86c]"
                  />
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.035] p-7 md:p-14">
            <div className="absolute right-[-80px] top-[-80px] h-[300px] w-[300px] rounded-full bg-[#1ba05c]/20 blur-[80px]" />

            <CalendarDays
              size={30}
              strokeWidth={1.3}
              className="mb-10 text-[#d6e86c]"
            />

            <h3 className="ff-display max-w-4xl text-4xl uppercase leading-[.9] tracking-[-.05em] md:text-7xl">
              Nothing scheduled.
              <br />
              <span className="text-[#d6e86c]">Yet.</span>
            </h3>

            <p className="mt-7 max-w-lg text-sm leading-relaxed text-[#9eafa7]">
              We're cooking up the next workshop, conversation or creative
              experiment. Join the list and we'll let you know when something
              starts moving.
            </p>

            <a
              href={`mailto:${site.email}?subject=Keep me posted`}
              className="ff-button ff-button-primary mt-8"
            >
              <span>Keep me posted</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}