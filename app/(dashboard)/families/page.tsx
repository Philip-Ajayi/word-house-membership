'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Trash2, ArrowLeftRight, Search, Sparkles, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface FamilyAdminData {
  id: string;
  familyId: string;
  memberId: string;
  member: {
    firstName: string;
    lastName: string | null;
    emails: string[];
  };
}

interface FamilyStructure {
  id: string;
  name: string;
  admins: FamilyAdminData[];
}

interface GenericMember {
  id: string;
  firstName: string;
  lastName: string | null;
  familyId: string;
  family: { name: string };
}

export default function HouseholdPillarsPage() {
  const [families, setFamilies] = useState<FamilyStructure[]>([]);
  const [allMembers, setAllMembers] = useState<GenericMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Hub form states
  const [targetFamilyId, setTargetFamilyId] = useState('');
  const [appointmentMode, setAppointmentMode] = useState<'custom' | 'random'>('custom');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Modal safety-net overlay states
  const [stripModal, setStripModal] = useState<{ open: boolean; adminId: string | null; memberName: string }>({
    open: false,
    adminId: null,
    memberName: ''
  });
  const [reassignModal, setReassignModal] = useState<{ open: boolean; memberId: string | null; memberName: string; currentFamilyId: string }>({
    open: false,
    memberId: null,
    memberName: '',
    currentFamilyId: ''
  });
  const [actionFamilyTarget, setActionFamilyTarget] = useState('');

  const loadDataTree = async () => {
    try {
      const [famRes, memRes] = await Promise.all([
        fetch('/api/families/structural-breakdown'),
        fetch('/api/members')
      ]);
      if (famRes.ok) setFamilies(await famRes.json());
      if (memRes.ok) setAllMembers(await memRes.json());
    } catch (err) {
      console.error('Error hydrating administrative data matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataTree();
  }, []);

  // Filter members for the selection search matrix
  const eligibleMembers = allMembers.filter(m => {
    const fullName = `${m.firstName} ${m.lastName || ''}`.toLowerCase();
    return fullName.includes(memberSearchQuery.toLowerCase());
  });

  const handleInitializeLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFamilyId) return;

    let finalMemberId = selectedMemberId;

    if (appointmentMode === 'random') {
      // Pick an unassigned member from the repository who isn't already an admin for this family branch
      const currentAdminMemberIds = new Set(
        families.find(f => f.id === targetFamilyId)?.admins.map(a => a.memberId) || []
      );
      const candidates = allMembers.filter(m => !currentAdminMemberIds.has(m.id));
      if (candidates.length === 0) {
        alert('No eligible members discovered to appoint.');
        return;
      }
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      finalMemberId = randomCandidate.id;
    }

    if (!finalMemberId) return;

    try {
      const res = await fetch('/api/families/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId: targetFamilyId, memberId: finalMemberId })
      });
      if (res.ok) {
        setTargetFamilyId('');
        setSelectedMemberId('');
        setMemberSearchQuery('');
        loadDataTree();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeStripAdminRole = async () => {
    if (!stripModal.adminId) return;
    try {
      const res = await fetch(`/api/families/admins?id=${stripModal.adminId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStripModal({ open: false, adminId: null, memberName: '' });
        loadDataTree();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeReassignFamily = async () => {
    if (!reassignModal.memberId || !actionFamilyTarget) return;
    try {
      const res = await fetch('/api/families/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: reassignModal.memberId, newFamilyId: actionFamilyTarget })
      });
      if (res.ok) {
        setReassignModal({ open: false, memberId: null, memberName: '', currentFamilyId: '' });
        setActionFamilyTarget('');
        loadDataTree();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Indexing...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* GLOBAL APPLICATION HEADER COMMAND BANNER */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#14062b] to-slate-900/40 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Superadmin Command Zone</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider mt-0.5">Family Administration Hub • Restricted System</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT BLOCK: ACTIVE HOUSEHOLD FAMILY PILLARS */}
        <div className="xl:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Active Family Admin
          </h2>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/10">
                  <th className="p-4">Family Name</th>
                  <th className="p-4">Active Designated Admins</th>
                  <th className="p-4 text-right">Administrative Interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {families.map((fam) => (
                  <tr key={fam.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white tracking-tight align-top">{fam.name}</td>
                    <td className="p-4 space-y-3 align-top">
                      {fam.admins.length === 0 ? (
                        <span className="text-xs italic text-slate-500">No overseers assigned</span>
                      ) : (
                        fam.admins.map((admin) => (
                          <div key={admin.id} className="text-xs bg-[#0a0314]/60 p-2 rounded-lg border border-white/5">
                            <p className="font-bold text-slate-200">
                              • {admin.member.firstName} {admin.member.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {admin.member.emails[0] || 'No dynamic digital mailbox'}
                            </p>
                            <button
                              type="button"
                              onClick={() => setStripModal({ open: true, adminId: admin.id, memberName: `${admin.member.firstName} ${admin.member.lastName || ''}` })}
                              className="text-[10px] uppercase tracking-wider font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 mt-2 pt-1.5 border-t border-white/5"
                            >
                              <Trash2 className="w-3 h-3" /> Strip Admin Role
                            </button>
                          </div>
                        ))
                      )}
                    </td>
                    <td className="p-4 text-right align-top space-y-2">
                      {allMembers.filter(m => m.familyId === fam.id).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const firstMem = allMembers.find(m => m.familyId === fam.id);
                            if (firstMem) {
                              setReassignModal({
                                open: true,
                                memberId: firstMem.id,
                                memberName: `${firstMem.firstName} ${firstMem.lastName || ''}`,
                                currentFamilyId: fam.id
                              });
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-purple-400" /> Reassign Node
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT BLOCK: ASSIGN NEW FAMILY ADMINISTRATIVE PILLAR */}
        <div className="xl:col-span-5 bg-gradient-to-b from-[#150a2e] to-[#0a0314] border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
               Assign Admin
            </h2>
          </div>

          <form onSubmit={handleInitializeLeadership} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Select Target Family</label>
              <select
                required
                value={targetFamilyId}
                onChange={(e) => setTargetFamilyId(e.target.value)}
                className="w-full bg-[#0a0314]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer transition-all"
              >
                <option value="" disabled>Choose Family Group Unit to Manage ▾</option>
                {families.map(f => (
                  <option key={f.id} value={f.id} className="bg-[#0f051d]">{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">2. Appoint Admin</label>
              
              {/* Radio Selector Matrices */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setAppointmentMode('custom')}
                  className={`p-3 rounded-xl border text-left text-xs uppercase font-bold tracking-wide transition-all flex items-center justify-between ${
                    appointmentMode === 'custom' 
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                      : 'bg-[#0a0314]/40 border-white/5 text-slate-400 hover:bg-[#0a0314]/80'
                  }`}
                >
                  <span>Option A: Select a member</span>
                  <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${appointmentMode === 'custom' ? 'border-purple-400 bg-purple-400' : 'border-slate-600'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setAppointmentMode('random')}
                  className={`p-3 rounded-xl border text-left text-xs uppercase font-bold tracking-wide transition-all flex items-center justify-between ${
                    appointmentMode === 'random' 
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                      : 'bg-[#0a0314]/40 border-white/5 text-slate-400 hover:bg-[#0a0314]/80'
                  }`}
                >
                  <span>Option B: Appoint Unassigned Member Randomly</span>
                  <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${appointmentMode === 'random' ? 'border-purple-400 bg-purple-400' : 'border-slate-600'}`} />
                </button>
              </div>

              {/* Conditional search filter overlay panel */}
              <AnimatePresence initial={false}>
                {appointmentMode === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2 pt-1"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search Unassigned Members List... 🔎"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      required={appointmentMode === 'custom'}
                      className="w-full bg-[#0a0314]/80 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">Select Candidate</option>
                      {eligibleMembers.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#0f051d]">
                          {m.firstName} {m.lastName || ''} ({m.family.name})
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-90 transition-all text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <UserCheck className="w-4 h-4" /> Confirm Appointment
            </button>
          </form>
        </div>
      </div>

      {/* OVERLAY MODAL WINDOW: STRIP ADMIN SAFETYNET */}
      <AnimatePresence>
        {stripModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 to-[#0e041d] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Strip Overseer Role Permissions?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are removing administrative clearance from <span className="text-white font-bold">{stripModal.memberName}</span>. 
                <br /><br />
                <span className="text-slate-400 italic">"This change adjusts administrative permissions. The member will remain a part of their family group but will no longer have access to manage other profiles."</span>
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStripModal({ open: false, adminId: null, memberName: '' })}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  Abort Action
                </button>
                <button
                  type="button"
                  onClick={executeStripAdminRole}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-500"
                >
                  Strip Authorization
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL WINDOW: STRUCTURAL REASSIGNMENT HUB */}
      <AnimatePresence>
        {reassignModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 to-[#0e041d] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-purple-400">
                <ArrowLeftRight className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Reassign Structural Node</h3>
              </div>
              <p className="text-xs text-slate-300">
                Select the target family pillar assignment for <span className="text-white font-bold">{reassignModal.memberName}</span>:
              </p>
              
              <select
                value={actionFamilyTarget}
                onChange={(e) => setActionFamilyTarget(e.target.value)}
                className="w-full bg-[#0a0314]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">Choose Target Branch Destination</option>
                {families.filter(f => f.id !== reassignModal.currentFamilyId).map(f => (
                  <option key={f.id} value={f.id} className="bg-[#0f051d]">{f.name}</option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReassignModal({ open: false, memberId: null, memberName: '', currentFamilyId: '' });
                    setActionFamilyTarget('');
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeReassignFamily}
                  disabled={!actionFamilyTarget}
                  className="px-4 py-2 rounded-lg bg-purple-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-500"
                >
                  Confirm Reassignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}