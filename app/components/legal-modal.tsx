'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  Award,
  Printer,
  Check,
  Copy,
  Search,
  Mail,
  FileCheck,
  ShieldAlert,
  Ban,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type LegalTab = 'licensing' | 'liability' | 'privacy' | 'terms' | 'security' | 'dpo';

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: LegalTab;
}

export function LegalModal({
  open,
  onOpenChange,
  initialTab = 'licensing',
}: LegalModalProps) {
  const [tab, setTab] = useState<LegalTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const copyLegalText = () => {
    const text = document.getElementById('legal-content-area')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl md:rounded-3xl">
        {/* Compact Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    SchoolOS Legal, Privacy & Governance Hub
                  </DialogTitle>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hidden sm:inline-block">
                    Proprietary Software
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exclusive Ownership Vested in <a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-600">DevStudio Solutions</a> (devstudionvk@gmail.com)
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLegalText}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Text'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50"
              >
                <Printer size={13} />
                Print
              </Button>
            </div>
          </div>

          {/* Navigation Tabs Bar (Horizontal Scrollable) */}
          <div className="flex items-center gap-1.5 mt-3 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setTab('licensing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'licensing'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale size={13} />
              <span>Enterprise License & Ownership</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('liability')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'liability'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert size={13} />
              <span>Zero-Liability Shield</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('privacy')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'privacy'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock size={13} />
              <span>Privacy & FERPA</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('terms')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'terms'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>Terms of Service</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('security')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'security'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award size={13} />
              <span>Security Controls</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('dpo')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                tab === 'dpo'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail size={13} />
              <span>DevStudio Legal Contact</span>
            </button>
          </div>
        </div>

        {/* Search & Status Bar */}
        <div className="px-5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search policy clauses..."
              className="pl-8 h-7 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Ban size={11} /> DevStudio Solutions IP
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <ShieldCheck size={11} /> 0-Liability Shield
            </span>
          </div>
        </div>

        {/* Full Open Scrollable Content Body */}
        <div
          id="legal-content-area"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          {/* TAB: LICENSING & EXCLUSIVITY */}
          {tab === 'licensing' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-base text-white tracking-tight">
                  <ShieldAlert size={20} className="text-slate-300 shrink-0" />
                  MANDATORY ENTERPRISE LICENSING & PERPETUAL OWNERSHIP COVENANT
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  THIS SOFTWARE, SOURCE CODE, DATABASE ARCHITECTURES, AND INTELLECTUAL PROPERTY ARE THE <strong>EXCLUSIVE PROPERTY OF DEVSTUDIO SOLUTIONS (HTTPS://WWW.DEVSTUDIO.SOLUTIONS/) AND ITS FOUNDING MEMBERS</strong>.
                </p>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-200 font-semibold leading-relaxed space-y-1.5">
                  <p>
                    <strong>PERPETUAL OWNERSHIP GUARANTEE:</strong> All legal rights, title, patents, source code, and design assets remain perpetually and unconditionally vested with DevStudio Solutions (<a href="mailto:devstudionvk@gmail.com" className="text-blue-400 underline">devstudionvk@gmail.com</a>).
                  </p>
                  <p>
                    <strong>LICENSING CAN BE GRANTED OR REVOKED:</strong> Commercial or educational licenses may be issued, operated, suspended, or revoked/taken down at will by DevStudio Solutions, but title and ownership NEVER transfer to any licensee or third-party organization under any circumstance.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">1</span>
                  Exclusive License Scope & Organizational Boundaries
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  DevStudio Solutions grants authorized institutional licensees a limited, non-transferable, non-sublicensable, revocable software access license strictly for educational administration.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Any deployment, hosting, code extraction, or operation by unauthorized organizations is strictly prohibited and subject to immediate international legal injunction and statutory damages.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">2</span>
                  Statutory Damages for Unlicensed Deployment
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Any unauthorized duplication, multi-tenant cloning, commercial extraction, or deployment by non-licensed entities constitutes willful copyright infringement under:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <strong className="text-slate-900 dark:text-white">17 U.S.C. § 101 et seq. & DMCA</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Statutory civil damages up to $150,000 per willful infringement plus attorney fees.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <strong className="text-slate-900 dark:text-white">18 U.S.C. § 1030 (CFAA) & WIPO</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Federal criminal and cross-border international intellectual property enforcement.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">3</span>
                  Student & Educator Creator IP Guarantee
                </h3>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block">100% Creator Ownership Principle</strong>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    While the software platform and code are exclusively owned by DevStudio Solutions, students and teachers retain <strong>100% full intellectual property ownership</strong> of all original works created or uploaded (assignments, research, syllabi, lesson plans, and portfolios).
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB: ZERO LIABILITY & INDEMNIFICATION */}
          {tab === 'liability' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-3 shadow-md">
                <div className="flex items-center gap-2 font-bold text-base text-white tracking-tight">
                  <ShieldAlert size={20} className="text-slate-300 shrink-0" />
                  TOTAL ZERO LIABILITY & COMPLETE INDEMNIFICATION COVENANT
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVSTUDIO SOLUTIONS, ITS FOUNDING MEMBERS, DEVELOPERS, AND AFFILIATES (THE &quot;RELEASED PARTIES&quot;) SHALL BEAR <strong>ABSOLUTELY ZERO FINANCIAL, LEGAL, OR OPERATIONAL LIABILITY ($0.00 USD CAP)</strong> ARISING OUT OF OR IN CONNECTION WITH THE SOFTWARE.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">1</span>
                  Total Disclaimer of All Warranties (&quot;As-Is&quot; Provision)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  THE SOFTWARE IS PROVIDED STRICTLY &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITH ALL FAULTS AND DEFECTS. THE RELEASED PARTIES EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, FREEDOM FROM BUGS, UNINTERRUPTED UPTIME, DATA INTEGRITY, OR NON-INFRINGEMENT.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">2</span>
                  Absolute Limitation of Liability ($0.00 Maximum Cap)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  UNDER NO CIRCUMSTANCES SHALL THE RELEASED PARTIES BE LIABLE FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, PUNITIVE, SPECIAL, OR INCIDENTAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, GRADING DISPUTES, COLLEGE ADMISSIONS OUTCOMES, SECURITY BREACHES BY THIRD PARTIES, HEALTH/NURSE INCIDENTS, TRANSPORTATION DELAYS, OR SYSTEM OUTAGES.
                </p>
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                  MAXIMUM AGGREGATE LIABILITY CAP: IN NO EVENT SHALL TOTAL LIABILITY EXCEED EXACTLY ZERO DOLLARS ($0.00 USD).
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold inline-flex items-center justify-center">3</span>
                  Complete Defense & Indemnification (Hold Harmless)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  All users, deploying institutions, and third parties agree to fully <strong>DEFEND, INDEMNIFY, AND HOLD HARMLESS</strong> DevStudio Solutions and its Founding Members from and against any and all claims, liabilities, lawsuits, judgments, fines, and legal expenses (including attorney fees) arising from software usage, data handling, or breach of licensing terms.
                </p>
              </section>
            </div>
          )}

          {/* TAB: PRIVACY & FERPA */}
          {tab === 'privacy' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <ShieldCheck size={18} className="text-slate-300" />
                  Student Data Privacy & FERPA Compliance
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Strict educational purpose limitation. We <strong>never sell, lease, or monetize</strong> student, parent, or faculty personal data. Zero commercial advertising profiles or third-party ad brokers.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Regulatory Standards</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Full compliance with FERPA (34 CFR Part 99), COPPA (16 CFR Part 312), GDPR (Articles 6 & 9), and Student Privacy Consortium pledges.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Technical Encryption & Isolation</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  All records encrypted with military-grade AES-256-GCM at rest, TLS 1.3 in transit, and multi-tenant cryptographic isolation.
                </p>
              </section>
            </div>
          )}

          {/* TAB: TERMS */}
          {tab === 'terms' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <FileCheck size={18} className="text-slate-300" />
                  Campus Terms of Service & Acceptable Use
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Strict acceptable use policies ensuring academic integrity, digital citizenship, and safe campus collaboration.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Authorized Institutional Scope</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Access is strictly reserved for authenticated students, faculty, and guardians of the licensed institution under an active Enterprise Licensing Agreement issued by DevStudio Solutions.
                </p>
              </section>
            </div>
          )}

          {/* TAB: SECURITY */}
          {tab === 'security' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Award size={18} className="text-slate-300" />
                  Enterprise-Grade Security Safeguards
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  SOC 2 Type II and ISO/IEC 27001 aligned security architecture with automated continuous encryption.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <strong className="text-slate-900 dark:text-white">AES-256-GCM Storage</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Encrypted persistent database storage and backups.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <strong className="text-slate-900 dark:text-white">TLS 1.3 & HSTS Enforced</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Strict end-to-end transport layer security.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DPO */}
          {tab === 'dpo' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Mail size={18} className="text-slate-300" />
                  DevStudio Solutions — Intellectual Property & Legal Office
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  For formal licensing agreements, IP verification, audits, or takedown notices.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-mono space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>Legal Entity / Owner:</strong> DevStudio Solutions</p>
                <p><strong>Official Website:</strong> <a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://www.devstudio.solutions/</a></p>
                <p><strong>Legal & Licensing Email:</strong> <a href="mailto:devstudionvk@gmail.com" className="text-blue-600 underline">devstudionvk@gmail.com</a></p>
                <p><strong>Jurisdiction & Rights:</strong> All Rights Reserved Worldwide · Full Perpetual Ownership with DevStudio Solutions</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>SchoolOS · Owned by DevStudio Solutions (devstudionvk@gmail.com) · 0 Liability</span>
          </div>
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="h-7 px-3.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
