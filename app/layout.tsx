import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: 'MIV Word House Membership Portal',
  description: 'Family Unit Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans bg-[#0f051d] text-slate-100 min-h-screen relative overflow-x-hidden antialiased`}>
        {/* Ambient Agency Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse dynamic-duration-8s" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-orchid-500/10 blur-[150px] animate-pulse dynamic-duration-12s" />
          <div className="absolute inset-0 bg-[radial-gradient(#3b0764_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
