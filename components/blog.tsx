"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  title: string;
  summary: string;
  post: string;
  category: string;
  image: string | null;
  date: string | null;
  time: string | null;
  publishedAt: string | null;
  url: string | null;
  author: string;
}

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch("/api/featuredblog");
        const data = await response.json();

        if (data.success && Array.isArray(data.posts)) {
          setBlogs(data.posts);
        }
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#f3f3d9] py-28 text-[#0c3b2e] md:py-40">
        <div className="container-ff flex justify-center items-center min-h-[300px]">
          <span className="ff-mono text-xs uppercase tracking-[.2em] opacity-50">
            Loading Journal...
          </span>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  const featured = blogs[0];
  const secondaryBlogs = blogs.slice(1, 3);

  return (
    <section className="bg-[#f3f3d9] py-28 text-[#0c3b2e] md:py-40">
      <div className="container-ff">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="ff-mono mb-5 text-[10px] uppercase tracking-[.3em] opacity-50">
              04 / Journal
            </div>

            <h2 className="ff-display display-md uppercase">
              From the
              <br />
              <span className="ff-serif font-normal">flow.</span>
            </h2>
          </div>

          <span className="hidden text-xs opacity-50 md:block">
            Ideas · Culture · Process
          </span>
        </div>

        {/* Featured Post */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group grid overflow-hidden rounded-[2rem] bg-[#0c3b2e] text-[#f3f3d9] md:grid-cols-2"
        >
          <div className="media-wrap aspect-[4/3] min-h-[340px] md:aspect-auto">
            {featured.image ? (
              <img src={featured.image} alt={featured.title} />
            ) : (
              <div className="h-full w-full bg-[#082a21]" />
            )}
          </div>

          <div className="flex flex-col justify-between p-7 md:p-12">
            <div>
              <div className="mb-10 flex items-center justify-between">
                <span className="ff-mono text-[9px] uppercase tracking-[.2em] text-[#d6e86c]">
                  Featured story
                </span>

                <span className="ff-mono text-[9px] text-[#9eafa7]">
                  {featured.date}
                </span>
              </div>

              <h3 className="ff-display max-w-xl text-4xl uppercase leading-[.9] tracking-[-.055em] md:text-6xl">
                {featured.title}
              </h3>

              <p className="mt-7 max-w-lg text-sm leading-relaxed text-[#9eafa7]">
                {featured.summary}
              </p>
            </div>

            <a
              href={featured.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-12 flex w-fit items-center gap-3 border-b border-[#d6e86c]/40 pb-2 text-xs font-bold uppercase tracking-[.15em] text-[#d6e86c]"
            >
              Read article
              <ArrowUpRight size={15} />
            </a>
          </div>
        </motion.article>

        {/* Secondary Posts */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {secondaryBlogs.map((blog) => (
            <a
              key={blog.title}
              href={blog.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <article className="grid grid-cols-[120px_1fr] gap-5 border-t border-[#0c3b2e]/15 pt-5">
                <div className="media-wrap aspect-square rounded-xl overflow-hidden bg-[#0c3b2e]/10">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} />
                  ) : (
                    <div className="h-full w-full bg-[#0c3b2e]/10" />
                  )}
                </div>

                <div>
                  <div className="ff-mono text-[8px] uppercase tracking-[.2em] opacity-45">
                    {blog.category}
                  </div>

                  <h3 className="mt-2 text-lg font-bold leading-tight group-hover:underline">
                    {blog.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed opacity-55">
                    {blog.summary}
                  </p>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}