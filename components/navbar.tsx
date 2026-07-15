'use strict';
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
  userContext?: {
    role: 'SUPERADMIN' | 'FAMILY_ADMIN';
    familyName?: string;
  };
}

export default function Navbar({ userContext = { role: 'SUPERADMIN' } }: NavbarProps) {
  const isSuper = userContext.role === 'SUPERADMIN';

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl bg-[#0f051d]/60 px-4 lg:px-8 py-3 flex items-center justify-between"
    >
      {/* Brand / Logo Area */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
          <Image 
            src="/wordHouseLogo/darkBackground.png" 
            alt="Word House Logo" 
            width={40} 
            height={40} 
            className="object-cover"
          />
          <div className="absolute inset-0 rounded-xl border border-white/30 animate-ping opacity-25 pointer-events-none" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-purple-400 block leading-none">Word House </span>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-purple-300">PORTAL</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
        <Link href="/dashboard" className="px-5 py-2 text-sm font-medium rounded-full bg-white/10 text-white transition-all shadow-inner">Dashboard</Link>
        <Link href="/members" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all">Members</Link>
        <Link href="/attendance" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all">Attendance</Link>
        
        {isSuper && (
          <>
            <Link href="/families" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all">
              Family Admin
            </Link>
            <Link href="/family-management" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all">
              Family Management
            </Link>
          </>
        )}
      </nav>

      {/* User Context Badge */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-3 bg-purple-950/40 border border-purple-500/20 rounded-full py-1.5 pl-3 pr-4 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-purple-200">
            {isSuper ? 'Superadmin' : `Overseer: ${userContext.familyName || 'Family Admin'}`}
          </span>
        </div>
      </div>
    </motion.header>
  );
}