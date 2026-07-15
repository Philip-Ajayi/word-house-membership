'use strict';
'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030008] flex items-center justify-center p-4 overflow-hidden">
      {/* IMMERSIVE PARALLAX AMBIENT BACKGROUND GRADIENTS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* METICULOUS LINE BACKGROUND GRID PATTERN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* CARD GRID CONTAINER MATRIX */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-purple-950/20 text-center"
      >
        {/* LOGO GLOW GRAPHIC */}
        <div className="mx-auto w-12 h-12 flex items-center justify-center mb-6">
          <Image 
            src="/wordHouseLogo/darkBackground.png" 
            alt="Word House Logo" 
            width={48} 
            height={48} 
            className="object-cover"
          />
        </div>

        {/* TYPOGRAPHY ANIMS */}
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          Word House Membership Portal
        </h1>
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1.5">
          Membership Management
        </p>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* INTERACTIVE GOOGLE AUTH DIRECTIVE BUTTON */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-sm font-bold text-slate-200 tracking-wide transition-all duration-300 group"
        >
          {/* INLINE CUSTOM SVG GOOGLE SPECIFICATION VECTOR */}
          <svg className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.917 11.917 0 0012 .001C7.59 0 3.793 2.582 2 6.331l3.266 3.434z"
            />
            <path
              fill="#4285F4"
              d="M23.738 12.218c0-.814-.068-1.636-.214-2.436H12v4.618h6.61A5.649 5.649 0 0116.16 18.1l3.19 2.473c1.873-1.727 2.388-4.664 2.388-8.355z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235L2 17.669a11.933 11.933 0 0010 6.33c2.72 0 5.255-.89 7.345-2.427l-3.19-2.473a7.042 7.042 0 01-4.155 1.19 7.078 7.078 0 01-6.734-4.854z"
            />
            <path
              fill="#34A853"
              d="M5.266 9.765A7.027 7.027 0 014.91 12c0 .782.13 1.536.356 2.235L2 17.669A11.895 11.895 0 010 12c0-2.073.532-4.027 1.464-5.73l3.802 3.496z"
            />
          </svg>
          Sign In with Google
        </motion.button>

        <p className="text-[10px] text-slate-500 font-mono leading-relaxed mt-6">
          Access restricted exclusively to Membership Unit and Family Leaders.
        </p>
      </motion.div>
    </div>
  );
}
