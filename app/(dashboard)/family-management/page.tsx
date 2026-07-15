'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  FolderHeart, 
  RefreshCw, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';

interface Family {
  id: string;
  name: string;
}

export default function FamilyManagementPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<string | null>(null); // tracks active updates

  // Creation State
  const [newFamilyName, setNewFamilyName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Safety-Net Delete Modal Overlay State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    familyId: string | null;
    familyName: string;
    error: string | null;
  }>({
    open: false,
    familyId: null,
    familyName: '',
    error: null,
  });

  // Hydrate family records on mount
  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/families');
      if (res.ok) {
        const data = await res.json();
        setFamilies(data);
      }
    } catch (err) {
      console.error('Failed to resolve family list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // Initialize a new family
  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    setCreateError(null);
    setSyncing('create');

    try {
      const res = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFamilyName }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewFamilyName('');
        // Animate the new family onto the list
        setFamilies((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setCreateError(data.error || 'Failed to create family unit.');
      }
    } catch (err) {
      setCreateError('Network exception encountered.');
    } finally {
      setSyncing(null);
    }
  };

  // Update an existing family name
  const handleUpdateFamily = async (id: string) => {
    if (!editingName.trim()) return;

    setSyncing(id);
    try {
      const res = await fetch(`/api/families/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      if (res.ok) {
        setFamilies((prev) =>
          prev
            .map((f) => (f.id === id ? { ...f, name: editingName.trim() } : f))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        setEditingName('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update name.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(null);
    }
  };

  // Execute structural deletion
  const handleDeleteFamily = async () => {
    const id = deleteModal.familyId;
    if (!id) return;

    setSyncing(id);
    setDeleteModal((prev) => ({ ...prev, error: null }));

    try {
      const res = await fetch(`/api/families/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setFamilies((prev) => prev.filter((f) => f.id !== id));
        setDeleteModal({ open: false, familyId: null, familyName: '', error: null });
      } else {
        // Capture restriction parameters (such as member relations blocking deletion)
        setDeleteModal((prev) => ({
          ...prev,
          error: data.details || data.error || 'Failed to delete structural group.',
        }));
      }
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, error: 'Network transition error.' }));
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* HEADER COMMAND ZONE */}
      <div className="bg-gradient-to-r from-purple-950/30 via-[#0e041d] to-slate-900/30 border border-purple-500/15 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <FolderHeart className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Word House Membership Structure</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider mt-0.5">
              Family Management
            </p>
          </div>
        </div>
      </div>

      {/* SPLIT PANEL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT BLOCK: ACTIVE FAMILY REGISTRY */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Current Family Units ({families.length})
            </h2>
            <button 
              onClick={fetchFamilies} 
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Fetching Registers...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <AnimatePresence initial={false} mode="popLayout">
                {families.map((family) => (
                  <motion.div
                    key={family.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 group hover:border-white/10 transition-all"
                  >
                    {editingId === family.id ? (
                      // IN-LINE EDITING STATE
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 bg-[#0a0314]/80 border border-purple-500/40 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => handleUpdateFamily(family.id)}
                          disabled={syncing === family.id}
                          className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                          className="p-1.5 bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // STATIC STATE
                      <>
                        <div>
                          <h3 className="font-bold text-white text-sm tracking-tight group-hover:text-purple-300 transition-colors">
                            {family.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingId(family.id);
                              setEditingName(family.name);
                            }}
                            className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({
                              open: true,
                              familyId: family.id,
                              familyName: family.name,
                              error: null
                            })}
                            className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {families.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs">
                  No active families found in the database.
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT BLOCK: ADD NEW FAMILY UNIT */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#110729] to-[#05010b] border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
               Register Family Unit
            </h2>
          </div>

          <form onSubmit={handleCreateFamily} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Family Name
              </label>
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="e.g. Zion, Agape"
                className="w-full bg-[#0a0314]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-all"
              />
            </div>

            {createError && (
              <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={syncing === 'create'}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {syncing === 'create' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Family
            </button>
          </form>
        </div>
      </div>

      {/* OVERLAY SAFETY-NET MODAL: BLOCKING DELETION CHECK */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0e041d] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Confirm Pillar Purge?</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                You are about to delete <span className="text-white font-bold">{deleteModal.familyName}</span> from the central database ledger.
              </p>

              {deleteModal.error && (
                <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 p-3 rounded-lg leading-relaxed">
                  <p className="font-bold mb-1">Restricted Action:</p>
                  {deleteModal.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ open: false, familyId: null, familyName: '', error: null })}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFamily}
                  disabled={syncing === deleteModal.familyId}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-500 flex items-center gap-1.5"
                >
                  {syncing === deleteModal.familyId && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Purge Unit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}