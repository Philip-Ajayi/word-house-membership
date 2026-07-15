'use strict';
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import { Phone, Calendar, Users, AlertTriangle, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-cards';

interface BirthdayMember {
  id: string;
  firstName: string;
  lastName: string | null;
  family: { name: string };
  birthDay: number;
}

interface BirthdayData {
  tomorrow: BirthdayMember[];
  dayAfterTomorrow: BirthdayMember[];
  inThreeDays: BirthdayMember[];
}

interface AbsentMember {
  id: string;
  firstName: string;
  lastName: string | null;
  family: { name: string };
  missedCount: number;
  phoneNumbers: string[];
}

export default function DashboardHome() {
  const [birthdays, setBirthdays] = useState<BirthdayData>({ tomorrow: [], dayAfterTomorrow: [], inThreeDays: [] });
  const [absentees, setAbsentees] = useState<AbsentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallDropdown, setActiveCallDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initDashboard() {
      try {
        const [bdRes, absRes] = await Promise.all([
          fetch('/api/insights/birthdays'),
          fetch('/api/insights/absentees')
        ]);
        setBirthdays(await bdRes.json());
        setAbsentees(await absRes.json());
      } catch (err) {
        console.error('Error hydrating management metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  // Close phone action menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveCallDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CSV Exporter
  const exportToCSV = () => {
    const headers = ['Rank,Name,Family,Absences Logged,Phone Numbers\n'];
    const rows = absentees.map((m, index) => {
      const fullName = `"${m.firstName} ${m.lastName || ''}"`;
      const familyName = `"${m.family.name}"`;
      const phones = `"${m.phoneNumbers.join(' / ')}"`;
      return `${index + 1},${fullName},${familyName},${m.missedCount},${phones}`;
    });

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Absent_Members_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Raw DOM Browser PDF/Print engine generator
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = absentees.map((m, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; color: #64748b;">#${index + 1}</td>
        <td style="padding: 12px; font-weight: bold; color: #1e293b;">${m.firstName} ${m.lastName || ''}</td>
        <td style="padding: 12px; color: #4f46e5;">${m.family.name}</td>
        <td style="padding: 12px; font-weight: bold;">${m.missedCount} Days</td>
        <td style="padding: 12px; color: #475569; font-family: monospace;">${m.phoneNumbers.join(', ') || 'None'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Absentee Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
            p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background-color: #f8fafc; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>Urgent Outreach Call List</h1>
          <p>Generated on ${new Date().toLocaleDateString()} — Absentees logged over 6 days.</p>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member Name</th>
                <th>Family</th>
                <th>Absences</th>
                <th>Phone List</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCallInitiation = (numbers: string[], memberId: string) => {
    if (numbers.length === 0) {
      alert('This member has no recorded phone numbers.');
      return;
    }
    if (numbers.length === 1) {
      window.location.href = `tel:${numbers[0]}`;
      return;
    }
    // Toggle dropdown action panel for multiple numbers
    setActiveCallDropdown(activeCallDropdown === memberId ? null : memberId);
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Dynamic Structural Hero Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-950/20 to-transparent border border-purple-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users className="w-24 h-24 text-purple-400" /></div>
          <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase">Operational Status</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">ACTIVE</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 via-indigo-950/20 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Calendar className="w-24 h-24 text-amber-400" /></div>
          <h3 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">Next Celebration Window</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">3 Days</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-900/20 via-indigo-950/20 to-transparent border border-rose-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle className="w-24 h-24 text-rose-400" /></div>
          <h3 className="text-sm font-semibold tracking-widest text-rose-400 uppercase">Urgent Outreach Alert</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">{absentees.length} Members</p>
          <span className="text-xs font-medium text-slate-400 block mt-1">Absent over six days</span>
        </div>
      </div>

      {/* SECTION 1: CELEBRATION MATRIX */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Celebrating anniversary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TOMORROW LAYER */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full mb-4">Tomorrow</span>
            {birthdays.tomorrow.length === 0 ? (
              <p className="text-xs font-medium text-slate-500 py-4">No births registered for tomorrow.</p>
            ) : (
              <Swiper modules={[EffectCards, Autoplay]} effect="cards" grabCursor={true} autoplay={{ delay: 3000 }} className="w-full max-w-[280px]">
                {birthdays.tomorrow.map((m) => (
                  <SwiperSlide key={m.id} className="bg-gradient-to-b from-purple-900 to-[#1c0d3a] border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between shadow-2xl min-h-[140px]">
                    <div>
                      <h4 className="font-bold text-white text-base tracking-tight">{m.firstName} {m.lastName}</h4>
                      <p className="text-xs text-purple-300 font-medium">{m.family.name}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-2">Day: {m.birthDay}</span>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* DAY AFTER TOMORROW */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full mb-4">Day After Tomorrow</span>
            {birthdays.dayAfterTomorrow.length === 0 ? (
              <p className="text-xs font-medium text-slate-500 py-4">No births registered.</p>
            ) : (
              <Swiper modules={[EffectCards, Autoplay]} effect="cards" grabCursor={true} autoplay={{ delay: 3500 }} className="w-full max-w-[280px]">
                {birthdays.dayAfterTomorrow.map((m) => (
                  <SwiperSlide key={m.id} className="bg-gradient-to-b from-indigo-900 to-[#0e163a] border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between shadow-2xl min-h-[140px]">
                    <div>
                      <h4 className="font-bold text-white text-base tracking-tight">{m.firstName} {m.lastName}</h4>
                      <p className="text-xs text-indigo-300 font-medium">{m.family.name}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-2">Day: {m.birthDay}</span>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* IN THREE DAYS */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full mb-4">In Three Days</span>
            {birthdays.inThreeDays.length === 0 ? (
              <p className="text-xs font-medium text-slate-500 py-4">No births registered.</p>
            ) : (
              <Swiper modules={[EffectCards, Autoplay]} effect="cards" grabCursor={true} autoplay={{ delay: 4000 }} className="w-full max-w-[280px]">
                {birthdays.inThreeDays.map((m) => (
                  <SwiperSlide key={m.id} className="bg-gradient-to-b from-amber-950 to-[#2c1a06] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between shadow-2xl min-h-[140px]">
                    <div>
                      <h4 className="font-bold text-white text-base tracking-tight">{m.firstName} {m.lastName}</h4>
                      <p className="text-xs text-amber-300 font-medium">{m.family.name}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-2">Day: {m.birthDay}</span>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: SHEPHERDING ATTENTION METRIC */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Reaching out</h2>
            <p className="text-xs text-slate-400">Members with critical absences needing follow-up</p>
          </div>
          
          {/* Export Action Tools panel */}
          {absentees.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md" ref={dropdownRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Rank</th>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Family</th>
                  <th className="p-4">Absences Logged</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {absentees.map((m, index) => {
                  const rowBg = m.missedCount > 12 ? 'hover:bg-rose-950/30' : m.missedCount > 8 ? 'hover:bg-amber-950/20' : 'hover:bg-purple-950/10';
                  
                  return (
                    <motion.tr 
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${rowBg}`}
                    >
                      <td className="p-4 pl-6 font-bold text-slate-400">#{index + 1}</td>
                      <td className="p-4 font-bold text-white">
                        <div>
                          {m.firstName} {m.lastName}
                          {m.phoneNumbers.length > 0 && (
                            <span className="block text-[10px] text-slate-400 font-normal font-mono mt-0.5">
                              {m.phoneNumbers.length === 1 ? m.phoneNumbers[0] : `${m.phoneNumbers.length} numbers loaded`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-purple-300 font-medium">{m.family.name}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          m.missedCount > 12 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {m.missedCount} Days Missed
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right relative">
                        <button 
                          onClick={() => handleCallInitiation(m.phoneNumbers, m.id)}
                          disabled={m.phoneNumbers.length === 0}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-all transform active:scale-95 shadow-md shadow-purple-600/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Initiate Call
                          {m.phoneNumbers.length > 1 && <ChevronDown className="w-3 h-3 ml-0.5" />}
                        </button>

                        {/* Dropdown Menu for choosing numbers when multiple exist */}
                        <AnimatePresence>
                          {activeCallDropdown === m.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute right-6 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-2xl z-50 overflow-hidden text-left"
                            >
                              <div className="p-2 border-b border-white/5 bg-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-2">Select Number</span>
                              </div>
                              <div className="py-1">
                                {m.phoneNumbers.map((num, i) => (
                                  <a
                                    key={i}
                                    href={`tel:${num}`}
                                    onClick={() => setActiveCallDropdown(null)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-white hover:bg-purple-600 transition-colors font-mono"
                                  >
                                    <Phone className="w-3 h-3 text-purple-400" />
                                    {num}
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
                {absentees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      All members actively accounted for inside the current tracking parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}