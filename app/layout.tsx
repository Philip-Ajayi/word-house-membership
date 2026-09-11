import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SmoothScroll from "@/components/smooth-scroll";
import CursorGlow from "@/components/cursor-glow";

export const metadata: Metadata = {
  title: "FreeFlow Creative Hub — Ideas in Motion",
  description:
    "FreeFlow Creative Hub builds brands, publishes ideas and develops the next generation of creatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise">
        <SmoothScroll />
        <CursorGlow />
        <Navbar />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}