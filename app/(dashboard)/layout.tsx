'use strict';
'use client';

import React from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, ShieldCheck, HeartHandshake } from 'lucide-react';
import AuthProvider from '@/components/AuthProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Members', href: '/members', icon: Users },
    { label: 'Attendance', href: '/attendance', icon: CheckSquare },
    { label: 'Family Admin', href: '/families', icon: ShieldCheck },
    { label: 'Family Management', href: '/family-management', icon: HeartHandshake },

  ];

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col relative z-10">
        <Navbar />
        
        <div className="flex-1 flex relative">
          {/* Persistent Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 bg-[#0a0314]/80 backdrop-blur-xl border-r border-white/5 p-4 sticky top-[65px] h-[calc(100vh-65px)]">
            <div className="space-y-1.5 py-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 border-l-4 border-purple-500 text-white shadow-md'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Dynamic Workspace Container */}
          <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto pb-24 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Floating Expandable Mobile Bottom-Dock Menu */}
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#0a0314]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex justify-between items-center shadow-black/80">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-transform active:scale-95`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Footer />
      </div>
    </AuthProvider>
  );
}