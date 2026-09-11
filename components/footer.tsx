import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";
import { FaTiktok, FaInstagram, FaLinkedin, FaFacebook} from "react-icons/fa";
import { site } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#061f18]">
      <div className="absolute -bottom-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#1ba05c]/10 blur-[130px]" />

      <div className="container-ff relative py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_.5fr_.5fr]">
          <div>
            <div className="ff-mono mb-6 text-[10px] uppercase tracking-[0.3em] text-[#d6e86c]">
              FreeFlow Creative Hub Ltd.
            </div>

            <h2 className="ff-display max-w-4xl text-6xl leading-[.82] tracking-[-.07em] text-[#f3f3d9] md:text-[8rem]">
              LET'S MAKE
              <br />
              <span className="text-[#d6e86c]">SOMETHING.</span>
            </h2>

            <a
              href={`mailto:${site.email}`}
              className="mt-10 inline-flex items-center gap-3 border-b border-[#d6e86c]/50 pb-2 text-sm font-bold text-[#d6e86c]"
            >
              {site.email}
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[0.25em] text-[#9eafa7]">
              Explore
            </div>

            <div className="space-y-3 text-sm text-[#f3f3d9]/70">
              <Link className="block hover:text-[#d6e86c]" href="/">
                Home
              </Link>
              <Link className="block hover:text-[#d6e86c]" href="/about">
                About
              </Link>
              <a className="block hover:text-[#d6e86c]" href="/#work">
                Work
              </a>
              <a className="block hover:text-[#d6e86c]" href="/#academy">
                Academy
              </a>
            </div>
          </div>

          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[0.25em] text-[#9eafa7]">
              Connect
            </div>

            <div className="space-y-3 text-sm text-[#f3f3d9]/70">
              <a className="block hover:text-[#d6e86c]" href={site.instagram}>
                Instagram
              </a>
              <a className="block hover:text-[#d6e86c]" href={site.facebook}>
                Facebook
              </a>
              <a className="block hover:text-[#d6e86c]" href={site.linkedin}>
                LinkedIn
              </a>
              <a className="block hover:text-[#d6e86c]" href={site.tiktok}>
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.16em] text-[#70847c] md:flex-row">
          <span>© {new Date().getFullYear()} FreeFlow Creative Hub Ltd.</span>
          <span>Ideas to go.</span>
        </div>
      </div>
    </footer>
  );
}