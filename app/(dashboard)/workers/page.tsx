'use strict';
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Users, AlertTriangle, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

interface AbsentWorker {
  id: string;
  firstName: string;
  lastName: string | null;
  family: { name: string };
  missedCount: number;
  phoneNumbers: string[];
}

export default function WorkerDashboard() {
  const [absentees, setAbsentees] = useState<AbsentWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallDropdown, setActiveCallDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchAbsentees() {
      try {
        const res = await fetch('/api/workers/insights/absentees');
        if (res.ok) {
          const data = await res.json();
          setAbsentees(data);
        }
      } catch (err) {
        console.error('Error fetching worker absentee data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAbsentees();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveCallDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToCSV = () => {
    const headers = ['Rank,Name,Family,Training Sessions Missed,Phone Numbers\n'];
    const rows = absentees.map((m, index) => {
      const fullName = `"${m.firstName} ${m.lastName || ''}"`;
      const familyName = `"${m.family.name}"`;
      const phones = `"${m.phoneNumbers.join(' / ')}"`;
      return `${index + 1},${fullName},${familyName},${m.missedCount},${phones}`;
    });
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Worker_Training_Absentees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = absentees.map((m, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; color: #64748b;">#${index + 1}</td>
        <td style="padding: 12px; font-weight: bold; color: #1e293b;">${m.firstName} ${m.lastName || ''}</td>
        <td style="padding: 12px; color: #4f46e5;">${m.family.name}</td>
        <td style="padding: 12px; font-weight: bold;">${m.missedCount} Sessions</td>
        <td style="padding: 12px; color: #475569; font-family: monospace;">${m.phoneNumbers.join(', ') || 'None'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Worker Training Absentee Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
            p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background-color: #f8fafc; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>Urgent Worker Follow‑Up List</h1>
          <p>Generated on ${new Date().toLocaleDateString()} — Workers absent from training over 7 days.</p>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Worker Name</th>
                <th>Family</th>
                <th>Missed Sessions</th>
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
      alert('This worker has no recorded phone numbers.');
      return;
    }
    if (numbers.length === 1) {
      window.location.href = `tel:${numbers[0]}`;
      return;
    }
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
      {/* Hero Cards – Worker Training Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-950/20 to-transparent border border-purple-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="w-24 h-24 text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase">Training Status</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">ACTIVE</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 via-indigo-950/20 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-24 h-24 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">Next Training</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">TBA</p>
          <span className="text-xs font-medium text-slate-400 block mt-1">Check schedule</span>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-900/20 via-indigo-950/20 to-transparent border border-rose-500/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-24 h-24 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-widest text-rose-400 uppercase">Urgent Outreach</h3>
          <p className="text-4xl font-black mt-2 tracking-tight text-white">{absentees.length} Workers</p>
          <span className="text-xs font-medium text-slate-400 block mt-1">Missed training over 7 days</span>
        </div>
      </div>

      {/* Absent Worker Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Training Follow‑Up</h2>
            <p className="text-xs text-slate-400">Workers with critical training absences needing intervention</p>
          </div>

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
                  <th className="p-4">Worker Name</th>
                  <th className="p-4">Family</th>
                  <th className="p-4">Sessions Missed</th>
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
                          {m.missedCount} Missed
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
                      All workers are currently up‑to‑date with training attendance.
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