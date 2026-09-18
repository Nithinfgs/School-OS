'use client';

import React, { useState, useEffect } from 'react';
import {
  TimetableSlot,
  KNOWN_SUBJECTS,
  DEFAULT_DP2_GRID,
  getCellClass,
} from '@/lib/timetable-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, RotateCcw, Sparkles, BookOpen, User, MapPin, Clock } from 'lucide-react';

interface TimetableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  periodKey: string;
  periodLabel: string;
  currentSlot: TimetableSlot;
  onSave: (day: string, periodKey: string, slot: TimetableSlot) => void;
}

export function TimetableEditorModal({
  isOpen,
  onClose,
  day,
  periodKey,
  periodLabel,
  currentSlot,
  onSave,
}: TimetableEditorModalProps) {
  const [slot, setSlot] = useState<TimetableSlot>(currentSlot);

  useEffect(() => {
    setSlot(currentSlot);
  }, [currentSlot, day, periodKey]);

  if (!isOpen) return null;

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (!code) return;
    const found = KNOWN_SUBJECTS.find((s) => s.code === code);
    if (found) {
      setSlot((prev) => ({
        ...prev,
        code: found.code,
        title: found.title,
        teacher: found.teacher,
        room: found.room,
      }));
    }
  };

  const handleResetToDefault = () => {
    const def = DEFAULT_DP2_GRID[day]?.[periodKey];
    if (def) {
      setSlot({ ...def, isCustomized: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(day, periodKey, {
      ...slot,
      isCustomized: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${getCellClass(slot.code) || 'bg-blue-600 text-white'}`}>
              {slot.code || 'P'}
            </div>
            <div>
              <h3 id="timetable-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Edit Timetable Slot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {day} · {periodLabel} ({slot.time})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </Button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Auto-fill from Course Catalog
            </label>
            <select
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSelectPreset}
              defaultValue=""
            >
              <option value="" disabled>
                Select a standard subject or course...
              </option>
              {KNOWN_SUBJECTS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.title} ({s.teacher})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Subject Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <BookOpen size={13} className="text-blue-500" /> Code
              </label>
              <Input
                value={slot.code}
                onChange={(e) => setSlot({ ...slot, code: e.target.value.toUpperCase() })}
                placeholder="e.g. C1, C3, TOK"
                required
                className="text-sm font-medium"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-emerald-500" /> Slot Time
              </label>
              <Input
                value={slot.time}
                onChange={(e) => setSlot({ ...slot, time: e.target.value })}
                placeholder="e.g. 08:30–09:10"
                required
                className="text-sm"
              />
            </div>
          </div>

          {/* Subject Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject / Course Title
            </label>
            <Input
              value={slot.title}
              onChange={(e) => setSlot({ ...slot, title: e.target.value })}
              placeholder="e.g. Mathematics Analysis & Approaches HL"
              required
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Teacher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User size={13} className="text-purple-500" /> Teacher / Staff
              </label>
              <Input
                value={slot.teacher}
                onChange={(e) => setSlot({ ...slot, teacher: e.target.value })}
                placeholder="e.g. Mr. Pramod"
                required
                className="text-sm"
              />
            </div>

            {/* Room */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-rose-500" /> Room / Lab
              </label>
              <Input
                value={slot.room}
                onChange={(e) => setSlot({ ...slot, room: e.target.value })}
                placeholder="e.g. Room 204, Lab 101"
                required
                className="text-sm"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slot Notes or Substitution Details (Optional)
            </label>
            <Input
              value={slot.notes || ''}
              onChange={(e) => setSlot({ ...slot, notes: e.target.value })}
              placeholder="e.g. Guest lecturer / Special lab practical"
              className="text-sm"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="text-xs text-slate-600 dark:text-slate-400 gap-1.5"
            >
              <RotateCcw size={13} /> Reset to Default
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
                <Check size={14} /> Save Slot
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
