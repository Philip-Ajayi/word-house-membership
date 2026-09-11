"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = glow.current;

    if (!element) return;

    const move = (event: MouseEvent) => {
      element.animate(
        {
          left: `${event.clientX}px`,
          top: `${event.clientY}px`,
        },
        {
          duration: 650,
          fill: "forwards",
          easing: "cubic-bezier(.2,.8,.2,1)",
        },
      );
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={glow}
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-1/2 z-[90] hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1ba05c]/10 blur-3xl lg:block"
    />
  );
}