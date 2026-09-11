import AboutHero from "@/components/about-hero";
import AboutStory from "@/components/about-story";
import AboutPhilosophy from "@/components/about-philosophy";
import AboutPillars from "@/components/about-pillars";
import AboutStatement from "@/components/about-statement";
import { stats } from "@/lib/data";

export const metadata = {
  title: "About — FreeFlow Creative Hub",
  description:
    "The story, philosophy and creative disciplines behind FreeFlow Creative Hub.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />

      <AboutStory />

      <section className="bg-[#f3f3d9] pb-28 text-[#0c3b2e] md:pb-40">
        <div className="container-ff">
          <div className="grid grid-cols-2 border-y border-[#0c3b2e]/10 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-r border-[#0c3b2e]/10 px-4 py-8 last:border-r-0 md:px-8 md:py-12"
              >
                <div className="ff-display text-5xl tracking-[-.08em] md:text-7xl">
                  {stat.value}
                </div>

                <div className="ff-mono mt-3 text-[8px] uppercase tracking-[.18em] opacity-45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AboutPhilosophy />

      <AboutPillars />

      <AboutStatement />

      <section className="bg-[#f3f3d9] py-28 text-[#0c3b2e] md:py-36">
        <div className="container-ff">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="ff-mono text-[10px] uppercase tracking-[.3em] opacity-45">
                Ready when you are
              </span>

              <h2 className="ff-display mt-5 text-6xl uppercase leading-[.82] tracking-[-.07em] md:text-[8rem]">
                Bring us
                <br />
                the
                <br />
                <span className="ff-serif font-normal">idea.</span>
              </h2>
            </div>

            <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p className="text-sm leading-relaxed opacity-60">
                Whether you're building a brand, publishing a book or looking
                for your next creative challenge, we'd love to hear what you're
                thinking about.
              </p>

              <a
                href="mailto:hello@ffch.com"
                className="ff-button ff-button-dark mt-7 w-fit"
              >
                hello@ffch.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}