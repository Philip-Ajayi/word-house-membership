"use client";

import { books } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Books() {
  return (
    <section className="overflow-hidden bg-[#061f18] py-28 md:py-40">
      <div className="container-ff">
        <div className="mb-14 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[0.3em] text-[#d6e86c]">
              02 / Publishing
            </div>

            <h2 className="ff-display display-md uppercase">
              Ideas you
              <br />
              <span className="ff-serif font-normal text-[#d6e86c]">
                can hold.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-[#9eafa7]">
            A selection of books and publications we've helped shape from
            manuscript to finished object.
          </p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {books.map((book, index) => (
            <motion.article
              key={book.title}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group min-w-[230px] md:min-w-[270px]"
            >
              <div className="media-wrap aspect-[3/4] rounded-2xl bg-[#123f32]">
                <img src={book.image} alt={book.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[#d6e86c] text-[#061f18] opacity-0 transition duration-500 group-hover:opacity-100">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-bold text-[#f3f3d9]">{book.title}</h3>
                <p className="mt-1 text-xs text-[#9eafa7]">{book.author}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}