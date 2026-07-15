'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  User, 
  Check,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface MemberWithFamily {
  id: string;
  firstName: string;
  lastName: string | null;
  img: string | null;
  family: {
    name: string;
  };
}

interface SyncStatus {
  [memberId: string]: 'saved' | 'saving' | 'error' | null;
}

export default function AttendanceLedgerPage() {
  // ISO Date format tracking string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-10');
  const [members, setMembers] = useState<MemberWithFamily[]>([]);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});
  const [exporting, setExporting] = useState<boolean>(false);

  // Core Data Aggregation
  useEffect(() => {
    async function loadAttendanceLedger() {
      setLoading(true);
      try {
        const [membersRes, attendanceRes] = await Promise.all([
          fetch('/api/members'),
          fetch(`/api/attendance?date=${selectedDate}`)
        ]);

        if (membersRes.ok && attendanceRes.ok) {
          const membersData = await membersRes.json();
          const attendanceData: { memberId: string }[] = await attendanceRes.json();

          // Alphabetical Sort by First Name
          const sortedMembers = membersData.sort((a: MemberWithFamily, b: MemberWithFamily) =>
            a.firstName.localeCompare(b.firstName)
          );

          setMembers(sortedMembers);
          setPresentIds(new Set(attendanceData.map((record) => record.memberId)));
        }
      } catch (err) {
        console.error('Failed aggregating database ledger data frames:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendanceLedger();
  }, [selectedDate]);

  // Adjust Date Selection Chronologically
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Atomic state modification toggles
  const handleToggleAttendance = async (memberId: string, targetState: boolean) => {
    setSyncStatus(prev => ({ ...prev, [memberId]: 'saving' }));
    
    // Immediate optimistic state update
    setPresentIds(prev => {
      const next = new Set(prev);
      if (targetState) next.add(memberId);
      else next.delete(memberId);
      return next;
    });

    try {
      const res = await fetch('/api/attendance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, date: selectedDate, present: targetState })
      });

      if (res.ok) {
        setSyncStatus(prev => ({ ...prev, [memberId]: 'saved' }));
        setTimeout(() => {
          setSyncStatus(prev => ({ ...prev, [memberId]: null }));
        }, 2500);
      } else {
        throw new Error('Persistence exception');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus(prev => ({ ...prev, [memberId]: 'error' }));
      // Revert state change on absolute transactional failure
      setPresentIds(prev => {
        const next = new Set(prev);
        if (!targetState) next.add(memberId);
        else next.delete(memberId);
        return next;
      });
    }
  };

  // Bulk Status Modification Routines
  const handleBulkMark = async (markAllPresent: boolean) => {
    const filteredIds = filteredMembers.map(m => m.id);
    if (filteredIds.length === 0) return;

    // Optimistic batch layout updates
    setPresentIds(prev => {
      const next = new Set(prev);
      filteredIds.forEach(id => {
        if (markAllPresent) next.add(id);
        else next.delete(id);
      });
      return next;
    });

    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: filteredIds, date: selectedDate, present: markAllPresent })
      });
      if (!res.ok) throw new Error('Bulk operation update rejected.');
    } catch (err) {
      console.error(err);
      // Simple reload fallback strategy to ensure structural synchronization
      window.location.reload();
    }
  };

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstName} ${m.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || m.family.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Prep data sorted with Absent members prioritized over Present members
  const getSortedAttendanceData = () => {
    return [...filteredMembers].sort((a, b) => {
      const aPresent = presentIds.has(a.id);
      const bPresent = presentIds.has(b.id);
      if (aPresent === bPresent) {
        return a.firstName.localeCompare(b.firstName); // secondary sorting alpha
      }
      return aPresent ? 1 : -1; // Absent (false) comes first
    });
  };

  // Export CSV Routine
  const handleExportCSV = () => {
    const sortedList = getSortedAttendanceData();
    const headers = ['First Name', 'Last Name', 'Family Group', 'Status'];
    
    const rows = sortedList.map(member => [
      member.firstName,
      member.lastName || '',
      member.family.name,
      presentIds.has(member.id) ? 'Present' : 'Absent'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Routine (Native print layout - no external npm packages required)
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const sortedList = getSortedAttendanceData();
      
      // Create an iframe to hold the print layout privately
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) throw new Error('Could not access print document context');

      // Build a clean, styled HTML template matching the application theme
      const rowsHtml = sortedList.map(member => {
        const isPresent = presentIds.has(member.id);
        const statusText = isPresent ? 'PRESENT' : 'ABSENT';
        const statusColor = isPresent ? '#10b981' : '#ef4444'; // Emerald Green vs Red

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 10px; font-size: 13px; color: #1e293b;">
              ${member.firstName} ${member.lastName || ''}
            </td>
            <td style="padding: 12px 10px; font-size: 13px; color: #475569;">
              ${member.family.name}
            </td>
            <td style="padding: 12px 10px; font-size: 12px; font-weight: bold; color: ${statusColor}; text-align: right; letter-spacing: 0.05em;">
              ${statusText}
            </td>
          </tr>
        `;
      }).join('');

      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Attendance Report - ${selectedDate}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; margin: 0; background-color: #ffffff; color: #1e293b; }
              header { margin-bottom: 30px; border-bottom: 2px solid #7c3aed; padding-bottom: 15px; }
              h1 { margin: 0; font-size: 24px; color: #1e1b4b; }
              p { margin: 5px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { text-align: left; padding: 12px 10px; background-color: #7c3aed; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; }
              th:last-child { text-align: right; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <header>
              <h1>Attendance Register</h1>
              <p>DATE OF REGISTRY: ${selectedDate}</p>
              <p>EXPORTED: ${new Date().toLocaleDateString()}</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th style="border-top-left-radius: 6px; border-bottom-left-radius: 6px;">Member Name</th>
                  <th>Family Association Group</th>
                  <th style="border-top-right-radius: 6px; border-bottom-right-radius: 6px; text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `);
      doc.close();

      // Give the document context time to render cleanly, then focus and invoke the print dialog
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove the helper element safely from the DOM
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);

    } catch (error) {
      console.error('Failed to generate native print layout stream:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* HEADER NODAL CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Attendance</h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mt-1">Roll Call • Attendance Management</p>
        </div>
        
        {/* EXPORT ACTION CONTROLS */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={loading || members.length === 0}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Download CSV report (Absents listed first)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            CSV Export
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading || members.length === 0 || exporting}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Download PDF report (Absents listed first)"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-purple-400" />
            )}
            PDF Export
          </button>
        </div>
      </div>

      {/* CALENDAR NAVIGATION RIBBON */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Target Date:
          </label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#0a0314]/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <button 
            onClick={() => shiftDate(-1)}
            className="bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="bg-purple-600/10 border border-purple-500/20 text-purple-300 py-2.5 px-4 rounded-xl text-xs font-black uppercase text-center flex items-center justify-center tracking-wider">
            Active Day
          </div>
          <button 
            onClick={() => shiftDate(1)}
            className="bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER & GROUP BULK ACTION MATRICES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Filter by name or family unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0314]/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-all backdrop-blur-xl"
          />
        </div>
        <div className="lg:col-span-6 grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={() => handleBulkMark(false)}
            className="py-3 px-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Mark All Absent
          </button>
          <button
            type="button"
            onClick={() => handleBulkMark(true)}
            className="py-3 px-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Mark All Present
          </button>
        </div>
      </div>

      {/* MAIN REGISTRY GRID VIEWER */}
      {loading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Re-indexing...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member) => {
              const isPresent = presentIds.has(member.id);
              const currentSync = syncStatus[member.id];

              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0a0314] border border-purple-500/30 flex-shrink-0 relative">
                      {member.img ? (
                        <img src={member.img} alt={member.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-purple-400 uppercase">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-white truncate">{member.firstName} {member.lastName}</h3>
                      <p className="text-xs text-purple-300 font-medium truncate mt-0.5">{member.family.name}</p>
                    </div>
                  </div>

                  {/* INTERACTIVE TOGGLE ZONE */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 min-h-[1.5rem]">
                      {currentSync === 'saving' && (
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                        </span>
                      )}
                      {currentSync === 'saved' && (
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3 animate-bounce" /> Saved successfully
                        </span>
                      )}
                      {currentSync === 'error' && (
                        <span className="text-[10px] uppercase tracking-widest text-rose-400 font-mono">
                          ✕ Direct write failure
                        </span>
                      )}
                      {!currentSync && (
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                          {isPresent ? 'Status confirmed' : 'Unmarked from register'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(member.id, !isPresent)}
                      className={`relative w-28 h-8 rounded-full px-1.5 flex items-center justify-between font-bold text-[10px] uppercase tracking-wider transition-all shadow-inner ${
                        isPresent 
                          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex-row' 
                          : 'bg-rose-950/80 border border-rose-500/30 text-rose-400 flex-row-reverse'
                      }`}
                    >
                      <span className="px-1.5">{isPresent ? 'Present 🟢' : 'Absent 🔴'}</span>
                      <motion.div 
                        layout
                        className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
                          isPresent ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </motion.div>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* EMPTY MATRIX FALLBACK DISPLAY */}
      {!loading && filteredMembers.length === 0 && (
        <div className="w-full text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <p className="text-sm text-slate-400 font-medium">No matching congregant identity nodes discovered in current view matrix.</p>
        </div>
      )}
    </div>
  );
}