import Hero from "@/components/hero";
import Stats from "@/components/stats";
import Services from "@/components/services";
import Books from "@/components/books";
import Academy from "@/components/academy";
import Blog from "@/components/blog";
import Testimonial from "@/components/testimonial";
import Events from "@/components/events";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Stats />

      <section className="bg-[#0c3b2e] px-6 py-6 md:px-12">
        <div className="marquee border-y border-white/10 py-5">
          <div className="marquee-inner">
            <span className="ff-display mr-12 text-4xl uppercase text-[#d6e86c] md:text-6xl">
              BRAND · BOOKS · CULTURE · LEARNING · BRAND · BOOKS · CULTURE ·
              LEARNING ·
            </span>

            <span className="ff-display text-4xl uppercase text-[#d6e86c] md:text-6xl">
              BRAND · BOOKS · CULTURE · LEARNING · BRAND · BOOKS · CULTURE ·
              LEARNING ·
            </span>
          </div>
        </div>
      </section>

      <Services />

      <Books />

      <Academy />

      <Blog />

      <Testimonial />

      <Events />

      <section className="bg-[#f3f3d9] px-6 py-20 text-[#0c3b2e] md:px-12 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="ff-mono text-[10px] uppercase tracking-[.3em] opacity-50">
                One last thing
              </span>

              <h2 className="ff-display mt-5 text-6xl uppercase leading-[.8] tracking-[-.07em] md:text-[9rem]">
                Have an
                <br />
                <span className="ff-serif font-normal">idea?</span>
              </h2>
            </div>

            <div className="self-end md:col-span-4">
              <p className="max-w-sm text-sm leading-relaxed opacity-60">
                A new brand. A book. A workshop. A strange idea that refuses
                to leave you alone.
              </p>

              <a
                href="mailto:hello@ffch.com"
                className="ff-button ff-button-dark mt-7"
              >
                Start the conversation
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}