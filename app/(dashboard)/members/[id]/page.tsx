'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Shield, Sparkles, Camera, Plus, Trash2, ArrowLeft, Save, XCircle, Info, MapPin, Home } from 'lucide-react';

interface Family {
  id: string;
  name: string;
}

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  birthMonth: number | null;
  birthDay: number | null;
  occupation: string[];
  address: string[];
  unit: string[];
  phoneNumbers: string[];
  emails: string[];
  img: string | null;
  familyId: string;
  lastAttendance: string | null;
  family: { name: string };
}

export default function EditMemberHub() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [lastAttendanceText, setLastAttendanceText] = useState('No attendance record');

  // Multi-valued arrays
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [occupations, setOccupations] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  const [originalEmails, setOriginalEmails] = useState<string[]>([]);
  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [familiesRes, memberRes] = await Promise.all([
          fetch('/api/families'),
          fetch(`/api/members/${id}`)
        ]);

        if (familiesRes.ok) setFamilies(await familiesRes.json());

        if (memberRes.ok) {
          const data: MemberDetail = await memberRes.json();
          setFirstName(data.firstName);
          setLastName(data.lastName || '');
          setFamilyId(data.familyId); // fixed typo
          setBirthMonth(data.birthMonth?.toString() || '');
          setBirthDay(data.birthDay?.toString() || '');

          setImagePreview(data.img);

          setPhoneNumbers(data.phoneNumbers.length ? data.phoneNumbers : ['']);
          setEmails(data.emails.length ? data.emails : ['']);
          setOriginalEmails(data.emails);
          setOccupations(data.occupation.length ? data.occupation : ['']);
          setAddresses(data.address?.length ? data.address : ['']);
          setUnits(data.unit?.length ? data.unit : ['']);

          if (data.lastAttendance) {
            const lastDate = new Date(data.lastAttendance);
            const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setLastAttendanceText(`${diffDays} Days Ago`);
          }
        }
      } catch (err) {
        console.error('Failure reloading core ledger data nodes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (JSON.stringify(emails) !== JSON.stringify(originalEmails)) {
      setEmailChanged(true);
    } else {
      setEmailChanged(false);
    }
  }, [emails, originalEmails]);

  const handleArrayChange = (index: number, val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeArrayItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, currentArr: string[]) => {
    if (currentArr.length > 1) {
      setter((prev) => prev.filter((_, i) => i !== index));
    } else {
      setter(['']);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !familyId || saving) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName || '');
      formData.append('familyId', familyId);
      formData.append('birthMonth', birthMonth || '');
      formData.append('birthDay', birthDay || '');

      formData.append('phoneNumbers', JSON.stringify(phoneNumbers.filter(p => p.trim() !== '')));
      formData.append('emails', JSON.stringify(emails.filter(em => em.trim() !== '')));
      formData.append('occupation', JSON.stringify(occupations.filter(o => o.trim() !== '')));
      formData.append('address', JSON.stringify(addresses.filter(a => a.trim() !== '')));
      formData.append('unit', JSON.stringify(units.filter(u => u.trim() !== '')));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        router.push('/members');
      }
    } catch (err) {
      console.error('ledger update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="relative w-12 h-12 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-purple-400">Member ID: #{id}</p>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Profiling Hub</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
        </div>
      </div>

      <form onSubmit={onUpdateSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CARD */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-gradient-to-b from-[#1c0c35] to-[#0b0314] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-2 left-2 text-amber-400/40 font-serif text-sm pointer-events-none">✦</div>
            <div className="absolute top-2 right-2 text-amber-400/40 font-serif text-sm pointer-events-none">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-400/40 font-serif text-sm pointer-events-none">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-400/40 font-serif text-sm pointer-events-none">✦</div>

            <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 shadow-xl relative group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0314] relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-purple-400">
                    {firstName ? firstName[0] : '—'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 border border-white/20 text-white cursor-pointer hover:bg-purple-500 shadow-md transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              </label>
            </div>

            <div className="text-center mt-6 space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{firstName || '—'} {lastName}</h3>
              <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full inline-block">
                {families.find(f => f.id === familyId)?.name || 'Unassigned Family'}
              </p>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
                <span>Last Attendance:</span>
                <span className="font-mono font-bold text-slate-200">{lastAttendanceText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-8 space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
          {/* PROFILE UPDATES */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-purple-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Profile Updates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Family</label>
                <select
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0f051d]">{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BIRTHDAY */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-xs uppercase tracking-widest font-bold text-purple-400 flex items-center gap-2">Birth Day</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="" className="bg-[#0f051d]">Not Stated</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-[#0f051d]">{i + 1} ({new Date(2000, i).toLocaleString('en', { month: 'short' })})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Day</label>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="" className="bg-[#0f051d]">Not Stated</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-[#0f051d]">{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC ARRAYS */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase tracking-widest font-bold text-purple-400">Other details</h4>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase font-medium">Phone Numbers</label>
                <button type="button" onClick={() => addArrayItem(setPhoneNumbers)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Phone</button>
              </div>
              <AnimatePresence initial={false}>
                {phoneNumbers.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={p}
                      onChange={(e) => handleArrayChange(i, e.target.value, setPhoneNumbers)}
                      className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <button type="button" onClick={() => removeArrayItem(i, setPhoneNumbers, phoneNumbers)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Emails */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase font-medium">Email addresses</label>
                <button type="button" onClick={() => addArrayItem(setEmails)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Email</button>
              </div>
              {emails.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={m}
                      onChange={(e) => handleArrayChange(i, e.target.value, setEmails)}
                      className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <button type="button" onClick={() => removeArrayItem(i, setEmails, emails)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Occupations */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase font-medium">Occupations</label>
                <button type="button" onClick={() => addArrayItem(setOccupations)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Occupation</button>
              </div>
              {occupations.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={o}
                    onChange={(e) => handleArrayChange(i, e.target.value, setOccupations)}
                    className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button type="button" onClick={() => removeArrayItem(i, setOccupations, occupations)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Addresses */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Addresses</label>
                <button type="button" onClick={() => addArrayItem(setAddresses)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Address</button>
              </div>
              {addresses.map((addr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addr}
                    onChange={(e) => handleArrayChange(i, e.target.value, setAddresses)}
                    placeholder="Street, City, State"
                    className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button type="button" onClick={() => removeArrayItem(i, setAddresses, addresses)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Units */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase font-medium flex items-center gap-1"><Home className="w-3 h-3" /> Unit / Apartment</label>
                <button type="button" onClick={() => addArrayItem(setUnits)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Unit</button>
              </div>
              {units.map((unit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => handleArrayChange(i, e.target.value, setUnits)}
                    placeholder="Apt 4B"
                    className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button type="button" onClick={() => removeArrayItem(i, setUnits, units)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => router.push('/members')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel and Revert
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? 'Preserving Changes...' : 'Save All Permanent Profile Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}