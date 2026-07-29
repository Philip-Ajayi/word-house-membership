'use strict';
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  CheckSquare,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  CalendarCheck,
} from 'lucide-react';
import AuthProvider from '@/components/AuthProvider';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const canAccessWorkers = session?.user?.canAccessWorkers ?? false;
  const canAccessFamilyAdmin = session?.user?.canAccessFamilyAdmin ?? false;
  const userRole = session?.user?.role?.toUpperCase() ?? 'USER';

  const baseMenu = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Members', href: '/members', icon: Users },
    { label: 'Attendance', href: '/attendance', icon: CheckSquare },
  ];

  if (canAccessFamilyAdmin) {
    baseMenu.push(
      { label: 'Family Admin', href: '/families', icon: ShieldCheck },
      { label: 'Family Management', href: '/family-management', icon: HeartHandshake }
    );
  }

  if (canAccessWorkers) {
    baseMenu.push(
      { label: 'Workers', href: '/workers', icon: Briefcase },
      { label: 'Worker Attendance', href: '/workers/attendance', icon: CalendarCheck }
    );
  }

  // Mobile bottom dock: show up to 5 items
  const mobileItems = baseMenu.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar
        userContext={{
          role: userRole as 'SUPERADMIN' | 'FAMILY_ADMIN',
          familyName: undefined,   // you could pass family name if needed
          canAccessWorkers,
          canAccessFamilyAdmin,
        }}
      />

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0a0314]/80 backdrop-blur-xl border-r border-white/5 p-4 sticky top-[65px] h-[calc(100vh-65px)]">
          <div className="space-y-1.5 py-4">
            {baseMenu.map((item) => {
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

        <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#0a0314]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex justify-between items-center shadow-black/80">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
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
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}