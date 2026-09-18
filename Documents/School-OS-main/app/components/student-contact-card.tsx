'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Heart,
  Calendar,
  User,
  Users,
  ShieldAlert,
  Bus,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Sparkles,
  HeartPulse,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StudentContactData {
  id?: string;
  name: string;
  studentId?: string;
  admissionNumber?: string;
  grade?: string;
  class?: string;
  homeroom?: string;
  homeroomTeacher?: string;
  homeroomTeacherEmail?: string;
  homeroomTeacherPhone?: string;
  studentEmail?: string;
  studentPhone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;

  primaryParentName?: string;
  primaryParentRelation?: string;
  primaryParentPhone?: string;
  primaryParentEmail?: string;
  primaryParentOccupation?: string;

  secondaryParentName?: string;
  secondaryParentRelation?: string;
  secondaryParentPhone?: string;
  secondaryParentEmail?: string;
  secondaryParentOccupation?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  transportMode?: string;
  busRoute?: string;
  medicalNotes?: string;
  dietaryPreference?: string;
  status?: string;
  [key: string]: any;
}

export function StudentContactCard({
  student,
  onClose,
  onAction,
  compact = false,
  palette = 'dark',
}: {
  student:
    | StudentContactData
    | { name: string; data?: Record<string, any>; id?: string };
  onClose?: () => void;
  onAction?: (action: string, data: any) => void;
  compact?: boolean;
  palette?: 'dark' | 'school';
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize student properties from either root object or .data container
  const rawData = (student as any)?.data || student || {};
  const name = student?.name || rawData?.name || 'Student';
  const data: StudentContactData = {
    ...rawData,
    name,
    id: (student as any)?.id || rawData?.id,
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyFullSummary = () => {
    const summary = `
========================================
WESTBRIDGE INTERNATIONAL - STUDENT PROFILE
========================================
Student Name: ${data.name}
Student ID: ${data.studentId || 'N/A'} (Grade: ${data.grade || data.class || 'N/A'} · Homeroom: ${data.homeroom || 'N/A'})
Email: ${data.studentEmail || 'N/A'}
Phone: ${data.studentPhone || 'N/A'}
DOB: ${data.dateOfBirth || 'N/A'} | Blood Group: ${data.bloodGroup || 'N/A'}
Address: ${data.address || 'N/A'}

PRIMARY GUARDIAN:
Name: ${data.primaryParentName || 'N/A'} (${data.primaryParentRelation || 'Guardian'})
Phone: ${data.primaryParentPhone || 'N/A'}
Email: ${data.primaryParentEmail || 'N/A'}
Occupation: ${data.primaryParentOccupation || 'N/A'}

SECONDARY GUARDIAN:
Name: ${data.secondaryParentName || 'N/A'} (${data.secondaryParentRelation || 'Guardian'})
Phone: ${data.secondaryParentPhone || 'N/A'}
Email: ${data.secondaryParentEmail || 'N/A'}

SAFETY & LOGISTICS:
Emergency Contact: ${data.emergencyContactName || data.primaryParentName || 'N/A'} (${data.emergencyContactPhone || data.primaryParentPhone || 'N/A'})
Class Teacher: ${data.homeroomTeacher || 'N/A'} (${data.homeroomTeacherPhone || data.homeroomTeacherEmail || 'N/A'})
Transport: ${data.transportMode || data.busRoute || 'N/A'}
Medical/Allergies: ${data.medicalNotes || 'None'}
========================================`.trim();

    copyToClipboard(summary, 'fullSummary');
  };

  const initials = name
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`student-contact-card ${palette === 'school' ? 'school-palette' : ''} bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden ${compact ? 'p-4' : 'p-6'} transition-all`}
    >
      {/* Top Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[2px] shadow-lg shadow-emerald-950/50 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-lg text-emerald-400">
              {initials}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold tracking-tight text-white m-0">
                {data.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {data.status || 'Active Enrolled'}
              </span>
              {data.bloodGroup && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                  <HeartPulse size={12} /> {data.bloodGroup}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>
                ID:{' '}
                <b className="text-slate-200">
                  {data.studentId || data.admissionNumber || 'WB-STU'}
                </b>
              </span>
              <span>·</span>
              <span>
                Class:{' '}
                <b className="text-slate-200">
                  {data.class || data.grade || 'DP2'}
                </b>
              </span>
              <span>·</span>
              <span>
                Homeroom:{' '}
                <b className="text-slate-200">{data.homeroom || 'DP-2'}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Top Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={copyFullSummary}
            className="text-xs bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:text-white"
          >
            {copiedKey === 'fullSummary' ? (
              <>
                <Check size={14} className="text-emerald-400 mr-1.5" /> Copied
                summary!
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1.5" /> Copy profile
              </>
            )}
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* 1. Student Direct Contact Card */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <User size={14} className="text-emerald-400" /> Student Direct
              Info
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Student Email
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`mailto:${data.studentEmail || ''}`}
                    className="text-emerald-400 hover:underline truncate font-mono text-[11px]"
                  >
                    {data.studentEmail || 'student@westbridge.edu'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(data.studentEmail || '', 'studentEmail')
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy student email"
                  >
                    {copiedKey === 'studentEmail' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Student Mobile
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`tel:${data.studentPhone || ''}`}
                    className="text-slate-200 hover:text-emerald-400 font-mono text-[11px]"
                  >
                    {data.studentPhone || '+91 98401 22334'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(data.studentPhone || '', 'studentPhone')
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy student phone"
                  >
                    {copiedKey === 'studentPhone' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Date of Birth
                  </div>
                  <div className="text-slate-200 font-medium mt-0.5">
                    {data.dateOfBirth || '2008-04-14'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Gender
                  </div>
                  <div className="text-slate-200 font-medium mt-0.5">
                    {data.gender || 'Male'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
            <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <span className="truncate">
              {data.address || 'Chennai, Tamil Nadu'}
            </span>
          </div>
        </div>

        {/* 2. Primary Parent / Guardian */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Users size={14} className="text-blue-400" /> Primary Guardian
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {data.primaryParentRelation || 'Father'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-slate-100 font-bold text-sm">
                  {data.primaryParentName || 'Parent Contact'}
                </div>
                {data.primaryParentOccupation && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Briefcase size={11} className="text-slate-400" />{' '}
                    {data.primaryParentOccupation}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Phone Number
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`tel:${data.primaryParentPhone || ''}`}
                    className="text-blue-400 hover:underline font-mono font-medium"
                  >
                    {data.primaryParentPhone || '+91 98840 55123'}
                  </a>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          data.primaryParentPhone || '',
                          'pParentPhone',
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Copy primary parent phone"
                    >
                      {copiedKey === 'pParentPhone' ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Email Address
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`mailto:${data.primaryParentEmail || ''}`}
                    className="text-slate-300 hover:text-white truncate font-mono text-[11px]"
                  >
                    {data.primaryParentEmail || 'parent@gmail.com'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        data.primaryParentEmail || '',
                        'pParentEmail',
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy primary parent email"
                  >
                    {copiedKey === 'pParentEmail' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Preferred Mode:</span>
            <span className="text-slate-200 font-medium">Phone / WhatsApp</span>
          </div>
        </div>

        {/* 3. Secondary Parent / Guardian */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Users size={14} className="text-purple-400" /> Secondary
                Guardian
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {data.secondaryParentRelation || 'Mother'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-slate-100 font-bold text-sm">
                  {data.secondaryParentName || 'Secondary Guardian'}
                </div>
                {data.secondaryParentOccupation && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Briefcase size={11} className="text-slate-400" />{' '}
                    {data.secondaryParentOccupation}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Phone Number
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`tel:${data.secondaryParentPhone || ''}`}
                    className="text-purple-400 hover:underline font-mono font-medium"
                  >
                    {data.secondaryParentPhone || '+91 98840 66123'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        data.secondaryParentPhone || '',
                        'sParentPhone',
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy secondary parent phone"
                  >
                    {copiedKey === 'sParentPhone' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Email Address
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`mailto:${data.secondaryParentEmail || ''}`}
                    className="text-slate-300 hover:text-white truncate font-mono text-[11px]"
                  >
                    {data.secondaryParentEmail || 'parent2@gmail.com'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        data.secondaryParentEmail || '',
                        'sParentEmail',
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy secondary parent email"
                  >
                    {copiedKey === 'sParentEmail' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Emergency Authorization:</span>
            <span className="text-emerald-400 font-medium">Authorized</span>
          </div>
        </div>

        {/* 4. Class & Homeroom Teacher Contact */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <GraduationCap size={14} className="text-amber-400" /> Class /
                Homeroom Teacher
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Advisory {data.homeroom || 'DP2'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-slate-100 font-bold text-sm">
                  {data.homeroomTeacher || 'Sadahana'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Assigned Homeroom Teacher & Mentor
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Teacher Email
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`mailto:${data.homeroomTeacherEmail || 'teacher.dev@schoolos.local'}`}
                    className="text-amber-400 hover:underline font-mono text-[11px] truncate"
                  >
                    {data.homeroomTeacherEmail || 'teacher.dev@schoolos.local'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        data.homeroomTeacherEmail ||
                          'teacher.dev@schoolos.local',
                        'teacherEmail',
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    {copiedKey === 'teacherEmail' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Teacher Extension / Phone
                </div>
                <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                  {data.homeroomTeacherPhone || '+91 98400 20001'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Class Room:</span>
            <span className="text-slate-200 font-medium">
              Lab 101 / Room 204
            </span>
          </div>
        </div>

        {/* 5. Emergency Contact & Safety */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <ShieldAlert size={14} className="text-red-400" /> Emergency
                Contact
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                Priority 1
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-100 font-bold text-sm">
                  {data.emergencyContactName ||
                    data.primaryParentName ||
                    'Primary Emergency Contact'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {data.emergencyContactRelation || 'Parent (Father)'}
                </div>
              </div>

              <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-2.5 mt-2">
                <div className="text-[11px] text-red-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Phone size={12} /> Emergency Hotline Phone:
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`tel:${data.emergencyContactPhone || data.primaryParentPhone || ''}`}
                    className="text-red-400 font-bold font-mono text-sm hover:underline"
                  >
                    {data.emergencyContactPhone ||
                      data.primaryParentPhone ||
                      '+91 98840 55123'}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        data.emergencyContactPhone ||
                          data.primaryParentPhone ||
                          '',
                        'emPhone',
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    {copiedKey === 'emPhone' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Infirmary Record:</span>
            <span className="text-emerald-400 font-medium">
              Verified for 2026–27
            </span>
          </div>
        </div>

        {/* 6. Medical, Transport & Logistics */}
        <div className="bento-card bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Bus size={14} className="text-teal-400" /> Transport & Health
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Bus size={12} className="text-teal-400" /> Daily Commute
                  Route
                </div>
                <div className="text-slate-200 font-medium mt-0.5">
                  {data.transportMode ||
                    data.busRoute ||
                    'School Bus #12 (Route 4 - Anna Nagar)'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <AlertCircle size={12} className="text-amber-400" /> Medical &
                  Allergies
                </div>
                <div className="text-slate-200 mt-0.5 text-[11px] bg-slate-900/90 border border-slate-800 rounded p-2 text-amber-200/90 font-medium">
                  {data.medicalNotes || 'No known medical allergies'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Dietary Preference
                </div>
                <div className="text-slate-300 mt-0.5">
                  {data.dietaryPreference || 'Vegetarian'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bus Card ID:</span>
            <span className="text-teal-400 font-mono font-medium">
              BC-{data.studentId?.slice(-4) || '9821'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions (Message, Record, etc.) */}
      {onAction && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Authorized Westbridge Student Directory Record · Term 1 2026–27
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('message', data)}
              className="text-xs bg-slate-800/60 border-slate-700 hover:bg-slate-700"
            >
              <MessageSquare size={13} className="mr-1.5" /> Message family
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('studentRecord', data)}
              className="text-xs bg-slate-800/60 border-slate-700 hover:bg-slate-700"
            >
              <GraduationCap size={13} className="mr-1.5" /> Add student record
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('transportNotice', data)}
              className="text-xs bg-slate-800/60 border-slate-700 hover:bg-slate-700"
            >
              <Bus size={13} className="mr-1.5" /> Transport notice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
