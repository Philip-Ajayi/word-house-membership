'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Circle, UploadCloud, Plus, X, BookOpen, MapPin, Home } from 'lucide-react';

interface Family {
  id: string;
  name: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [familyId, setFamilyId] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  const [occupations, setOccupations] = useState<string[]>(['']);
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [units, setUnits] = useState<string[]>(['']);

  useEffect(() => {
    async function loadFamilies() {
      try {
        const res = await fetch('/api/families');
        if (res.ok) setFamilies(await res.json());
      } catch (err) {
        console.error('Failed to load structural family units:', err);
      }
    }
    loadFamilies();
  }, []);

  const isStage1Complete = firstName.trim() !== '' && familyId !== '';
  const isFormValid = isStage1Complete;

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, valArray: string[]) => {
    if (valArray.length > 1) {
      setter((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFieldChange = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleImageUploadPlaceholder = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName || '');
      formData.append('familyId', familyId);

      if (birthMonth) formData.append('birthMonth', birthMonth);
      if (birthDay) formData.append('birthDay', birthDay);

      formData.append('phoneNumbers', JSON.stringify(phoneNumbers.filter(p => p.trim() !== '')));
      formData.append('emails', JSON.stringify(emails.filter(em => em.trim() !== '')));
      formData.append('occupation', JSON.stringify(occupations.filter(o => o.trim() !== '')));
      formData.append('address', JSON.stringify(addresses.filter(a => a.trim() !== '')));
      formData.append('unit', JSON.stringify(units.filter(u => u.trim() !== '')));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/members/create', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        router.push('/members');
      } else {
        console.error('Failed to write record to ledger.');
      }
    } catch (err) {
      console.error('Error writing soul record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        type="button"
        onClick={() => router.push('/members')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        Return
      </button>

      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Add new member</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* STAGE 1: IDENTITY */}
        <div className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5">
          <button
            type="button"
            onClick={() => setActiveStage(1)}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-white bg-white/5"
          >
            <span className="flex items-center gap-3">
              {isStage1Complete ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-purple-400" />}
              STAGE 1: Identity
            </span>
            <span className="text-xs tracking-wider uppercase opacity-60">
              {activeStage === 1 ? '[Active Open]' : '[✓ Complete]'}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {activeStage === 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 bg-[#120726]/30">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-400">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#0a0314]/60 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                      placeholder="e.g. Gideon"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#0a0314]/60 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                      placeholder="e.g. Smith"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Family *</label>
                    <select
                      required
                      value={familyId}
                      onChange={(e) => setFamilyId(e.target.value)}
                      className="w-full bg-[#0a0314]/80 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0f051d]">Select Family</option>
                      {families.map((f) => (
                        <option key={f.id} value={f.id} className="bg-[#0f051d]">{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STAGE 2: IMAGE */}
        <div className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5">
          <button
            type="button"
            onClick={() => setActiveStage(2)}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-white bg-white/5"
          >
            <span className="flex items-center gap-3">
              {imageFile ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-500" />}
              STAGE 2: Add Image
            </span>
            <span className="text-xs tracking-wider uppercase opacity-60">
              {activeStage === 2 ? '[Active Open]' : '[Pending Unlocked]'}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {activeStage === 2 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 border-t border-white/5 bg-[#120726]/30">
                  <div className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-xl p-8 bg-[#0a0314]/40 transition-colors text-center group cursor-pointer flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadPlaceholder}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-purple-500" />
                        <p className="text-xs text-purple-400 font-medium">Image Loaded - Click or drag to replace</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-purple-400 animate-pulse mb-3" />
                        <p className="text-sm font-bold text-slate-200">Drag & drop profile picture or click to select media</p>
                        <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STAGE 3: CONTACT & LIFE DETAILS */}
        <div className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5">
          <button
            type="button"
            onClick={() => setActiveStage(3)}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-white bg-white/5"
          >
            <span className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-slate-500" />
              STAGE 3: Contact & Life Details
            </span>
            <span className="text-xs tracking-wider uppercase opacity-60">
              {activeStage === 3 ? '[Active Open]' : '[Pending Unlocked]'}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {activeStage === 3 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-6 border-t border-white/5 bg-[#120726]/30">
                  {/* BIRTHDAY */}
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">Anniversary of Birth</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="bg-[#0a0314]/80 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1} className="bg-[#0f051d]">{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>
                        ))}
                      </select>
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="bg-[#0a0314]/80 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1} className="bg-[#0f051d]">{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* PHONE NUMBERS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Phone Numbers</label>
                      <button type="button" onClick={() => handleAddField(setPhoneNumbers)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Phone Numbers
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {phoneNumbers.map((phone, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => handleFieldChange(index, e.target.value, setPhoneNumbers)}
                            className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            placeholder="+234-803-000-0000"
                          />
                          <button type="button" onClick={() => handleRemoveField(index, setPhoneNumbers, phoneNumbers)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* EMAILS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Email Addresses</label>
                      <button type="button" onClick={() => handleAddField(setEmails)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Email
                      </button>
                    </div>
                    {emails.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleFieldChange(index, e.target.value, setEmails)}
                          className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          placeholder="name@sanctuary.org"
                        />
                        <button type="button" onClick={() => handleRemoveField(index, setEmails, emails)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* OCCUPATIONS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Occupation</label>
                      <button type="button" onClick={() => handleAddField(setOccupations)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Occupation
                      </button>
                    </div>
                    {occupations.map((occ, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={occ}
                          onChange={(e) => handleFieldChange(index, e.target.value, setOccupations)}
                          className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          placeholder="e.g. Software Engineer"
                        />
                        <button type="button" onClick={() => handleRemoveField(index, setOccupations, occupations)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ADDRESSES */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</label>
                      <button type="button" onClick={() => handleAddField(setAddresses)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Address
                      </button>
                    </div>
                    {addresses.map((addr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={addr}
                          onChange={(e) => handleFieldChange(index, e.target.value, setAddresses)}
                          className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          placeholder="123 Main St, City"
                        />
                        <button type="button" onClick={() => handleRemoveField(index, setAddresses, addresses)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* UNITS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1"><Home className="w-3 h-3" /> Unit / Apartment</label>
                      <button type="button" onClick={() => handleAddField(setUnits)} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Unit
                      </button>
                    </div>
                    {units.map((unit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => handleFieldChange(index, e.target.value, setUnits)}
                          className="flex-1 bg-[#0a0314]/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          placeholder="Apt 4B"
                        />
                        <button type="button" onClick={() => handleRemoveField(index, setUnits, units)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold tracking-wide text-sm uppercase transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-2xl ${
              isFormValid
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-90 text-white shadow-purple-500/20'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
}