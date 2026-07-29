'use strict';
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Search, UserPlus, Filter, Mail, Phone, Briefcase, Trash2, Edit, MapPin, Home } from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: string;
  firstName: string;
  lastName: string | null;
  occupation: string[];
  address: string[];
  unit: string[];
  phoneNumbers: string[];
  emails: string[];
  img: string | null;
  familyId: string;
  family: { id: string; name: string };
}

interface Family {
  id: string;
  name: string;
}

export default function MembersDirectory() {
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [memRes, famRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/families')
        ]);
        setMembers(await memRes.json());
        setFamilies(await famRes.json());
      } catch (err) {
        console.error("Error loading administrative data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Failed to update registry status:", err);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = `${m.firstName} ${m.lastName || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesFamily = selectedFamilyId === 'ALL' || m.familyId === selectedFamilyId;
    return matchesSearch && matchesFamily;
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="relative w-12 h-12 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 relative min-h-screen">
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_50%_120%,#a855f7,transparent_50%)]" />

      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            placeholder="Search Member Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#120726]/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-all text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="relative flex items-center bg-[#120726]/60 border border-white/10 rounded-xl px-3 group">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFamilyId}
              onChange={(e) => setSelectedFamilyId(e.target.value)}
              className="bg-transparent pl-2 pr-8 py-2.5 text-sm focus:outline-none text-white cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-[#0f051d]">Filter By Family: ALL</option>
              {families.map((fam) => (
                <option key={fam.id} value={fam.id} className="bg-[#0f051d]">{fam.name}</option>
              ))}
            </select>
          </div>
          <Link href="/members/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-purple-600/20 whitespace-nowrap">
            <UserPlus className="w-4 h-4" />
            Add Member
          </Link>
        </div>
      </div>

      {/* FAMILY PILLS */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-white/5">
        <button
          onClick={() => setSelectedFamilyId('ALL')}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all border shrink-0 ${
            selectedFamilyId === 'ALL'
              ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
              : 'bg-transparent border-transparent text-slate-400 hover:text-white'
          }`}
        >
          All Members
        </button>
        {families.map((fam) => (
          <button
            key={fam.id}
            onClick={() => setSelectedFamilyId(fam.id)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all border shrink-0 ${
              selectedFamilyId === fam.id
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {fam.name}
        </button>
      ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Avatar</th>
              <th className="p-4">Congregant Name</th>
              <th className="p-4">Family</th>
              <th className="p-4">Contact</th>
              <th className="p-4 pr-6 text-right">Management Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            <AnimatePresence>
              {filteredMembers.map((m) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="group relative transition-all duration-200 hover:bg-purple-950/10"
                >
                  <td className="p-4 pl-6 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-950 border border-purple-500/30 flex items-center justify-center relative">
                      {m.img ? (
                        <img src={m.img} alt={m.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-purple-400 font-bold text-xs">{m.firstName[0]}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white text-base leading-tight">{m.firstName} {m.lastName}</p>
                    {m.occupation[0] && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Briefcase className="w-3 h-3 text-purple-400" /> {m.occupation[0]}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      {m.family.name}
                    </span>
                  </td>
                  <td className="p-4 space-y-1">
                    {m.phoneNumbers[0] && (
                      <p className="text-xs text-slate-300 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {m.phoneNumbers[0]}</p>
                    )}
                    {m.emails[0] && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {m.emails[0]}</p>
                    )}
                    {m.address[0] && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-500" /> {m.address[0]}</p>
                    )}
                    {m.unit[0] && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Home className="w-3 h-3 text-slate-500" /> {m.unit[0]}</p>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/members/${m.id}`} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-300 hover:text-white transition-all transform active:scale-90">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 hover:text-rose-300 transition-all transform active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="block md:hidden space-y-4">
        <AnimatePresence>
          {filteredMembers.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) {
                    setDeleteConfirmId(m.id);
                  }
                }}
                className="p-4 bg-[#0f051d]/90 relative z-10 flex items-center gap-4 cursor-grab active:cursor-grabbing"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-950 border border-purple-500/30 flex items-center justify-center shrink-0">
                  {m.img ? (
                    <img src={m.img} alt={m.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-purple-400 font-bold text-sm">{m.firstName[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white truncate">{m.firstName} {m.lastName}</p>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md">
                      {m.family.name}
                    </span>
                  </div>
                  {m.occupation[0] && <p className="text-xs text-slate-400 mt-0.5 truncate">{m.occupation[0]}</p>}
                  <div className="flex flex-col gap-0.5 mt-2 text-xs text-slate-300">
                    {m.phoneNumbers[0] && <span className="truncate">📞 {m.phoneNumbers[0]}</span>}
                    {m.emails[0] && <span className="truncate text-slate-400">✉️ {m.emails[0]}</span>}
                    {m.address[0] && <span className="truncate text-slate-400"><MapPin className="w-3 h-3 inline mr-1" />{m.address[0]}</span>}
                    {m.unit[0] && <span className="truncate text-slate-400"><Home className="w-3 h-3 inline mr-1" />{m.unit[0]}</span>}
                  </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 right-0 bg-gradient-to-l from-rose-600 to-rose-950 flex items-center justify-end pr-6 pointer-events-none z-0">
                <div className="flex flex-col items-center gap-1 text-white">
                  <Trash2 className="w-5 h-5 animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Delete</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gradient-to-b from-[#180831] to-[#0a0314] border border-rose-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl shadow-black/50"
            >
              <h3 className="text-xl font-black text-white tracking-tight">Preserve Assembly Registry</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Alert: Deleting this profile completely removes all record.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/20 transition-all transform active:scale-95"
                >
                  Confirm Removal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}