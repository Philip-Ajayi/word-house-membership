'use strict';
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      {/* CONTAINER BOUNDARY WITH RADIAL GRADIENT CORRECTIONS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-gradient-to-b from-red-950/20 to-black/40 border border-red-500/20 p-8 md:p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* SHIELD ACCESS ICON ANIM MATRIX */}
        <div className="flex justify-center mb-6">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.2)", "0 0 0 24px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"] 
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400"
          >
            <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
          </motion.div>
        </div>

        {/* MESSAGING NODAL MATRIX */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Access Refused
          </h1>
          
          <div className="h-px bg-white/5 my-6" />

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            You do not have clearance. This domain is reserved exclusively for Membership unit member and family leaders.
          </p>
        </div>

        {/* SYSTEM INSTRUCTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/5">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-left">
            <HelpCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Request Access</h4>
              <p className="text-[11px] text-slate-400 mt-1">Contact the membership unit</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Identity Check</h4>
              <p className="text-[11px] text-slate-400 mt-1">Ensure you are logged into your exact designated system.</p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION BACKPLANE ROUTINE */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ x: -4 }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go to homepage
            </motion.button>
          </Link>
          
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all shadow-inner"
            >
              Login again
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}