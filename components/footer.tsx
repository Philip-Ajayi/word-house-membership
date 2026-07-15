'use strict';
'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-[#0b0314] px-4 lg:px-8 py-6 text-center md:text-left">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs text-slate-500 font-medium">
            &copy; Word House Portal.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
          <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}