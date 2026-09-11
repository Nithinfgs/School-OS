'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  Award,
  Download,
  Printer,
  Check,
  Copy,
  Search,
  ExternalLink,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileCheck,
  ShieldAlert,
  Flame,
  Ban,
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
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');

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

  const handleDataExportRequest = () => {
    setExportStatus('exporting');
    setTimeout(() => {
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 4000);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white text-slate-900 border-slate-300 shadow-2xl rounded-3xl">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/95">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md">
                <ShieldAlert size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                    SchoolOS Enterprise Legal & Zero-Liability Hub
                  </DialogTitle>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                    Strict Proprietary
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-600 font-medium mt-0.5">
                  A Product of Dev Studios and its Founding Members · Active Enterprise License Required · 0 Liability Covenant
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLegalText}
                className="h-9 px-3 text-xs font-bold gap-1.5 bg-white border-slate-300 shadow-xs hover:bg-slate-50"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy All Terms'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 px-3 text-xs font-bold gap-1.5 bg-white border-slate-300 shadow-xs hover:bg-slate-50"
              >
                <Printer size={14} />
                Print / PDF
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5 p-1 bg-slate-200/90 rounded-2xl border border-slate-300/80">
            <button
              type="button"
              onClick={() => setTab('licensing')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'licensing'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale size={14} className={tab === 'licensing' ? 'text-blue-600' : 'text-slate-500'} />
              <span>Enterprise License & Exclusivity</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('liability')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'liability'
                  ? 'bg-rose-600 shadow-sm text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert size={14} className={tab === 'liability' ? 'text-white' : 'text-rose-600'} />
              <span>Zero-Liability & Indemnity</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('privacy')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'privacy'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock size={14} className={tab === 'privacy' ? 'text-emerald-600' : 'text-slate-500'} />
              <span>Privacy & FERPA</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('terms')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'terms'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} className={tab === 'terms' ? 'text-amber-600' : 'text-slate-500'} />
              <span>Terms of Service</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('security')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'security'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={14} className={tab === 'security' ? 'text-purple-600' : 'text-slate-500'} />
              <span>Security Controls</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('dpo')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'dpo'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail size={14} className={tab === 'dpo' ? 'text-rose-600' : 'text-slate-500'} />
              <span>DPO & Legal Contact</span>
            </button>
          </div>
        </div>

        {/* Search within policy */}
        <div className="px-6 sm:px-8 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clauses (e.g. Liability, Exclusivity, FERPA, Indemnity)..."
              className="pl-9 h-8 text-xs bg-slate-50 border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <Ban size={12} /> Active License Required
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={12} /> Total 0-Liability Shield
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          id="legal-content-area"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed max-h-[58vh]"
        >
          {/* TAB: LICENSING & EXCLUSIVITY */}
          {tab === 'licensing' && (
            <div className="space-y-6">
              <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 sm:p-6 text-rose-950 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-black text-base text-rose-900 tracking-tight">
                  <ShieldAlert size={22} className="text-rose-700 shrink-0" />
                  MANDATORY ENTERPRISE LICENSING AGREEMENT & STRICT EXCLUSIVITY CLAUSE
                </div>
                <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-semibold">
                  A PRODUCT OF DEV STUDIOS AND ITS FOUNDING MEMBERS. THIS SOFTWARE AND PLATFORM IS STRICTLY PROPRIETARY AND RESTRICTED. <strong>IT CAN ONLY BE ACCESSED, DEPLOYED, RUN, HOSTED, OR OPERATED UNDER A DIRECT, FULLY EXECUTED COMMERCIAL ENTERPRISE LICENSING AGREEMENT</strong> WITH DEV STUDIOS AND ITS FOUNDING MEMBERS.
                </p>
                <div className="p-3.5 bg-white rounded-xl border border-rose-300 text-xs sm:text-sm text-rose-950 font-black leading-snug">
                  ⛔ ABSOLUTE PROHIBITION ON UNLICENSED ORGANIZATIONS: NO OTHER PERSON, SCHOOL, UNIVERSITY, DISTRICT, CORPORATION, OR THIRD-PARTY ORGANIZATION APART FROM THE AUTHORIZED LICENSEE / OWNER HAS ANY RIGHT, PERMISSION, TITLE, OR LICENSE TO ACCESS, USE, RUN, HOST, REPRODUCE, FORK, MODIFY, OR OPERATE THIS SOFTWARE.
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">1</span>
                  Exclusive License Scope & Organizational Boundaries
                </h3>
                <p className="text-xs text-slate-600">
                  Dev Studios and its Founding Members grant authorized members of the licensed institution a non-transferable, non-sublicensable, revocable, role-based software access license strictly for internal educational administration and coursework management.
                </p>
                <p className="text-xs text-slate-600">
                  Access is cryptographically bound to authorized institutional domains (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">westbridge.schoolos.edu</code>). Any deployment or instance operated by or for an unauthorized external organization is strictly illegal and subject to immediate injunction.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">2</span>
                  Statutory Damages for Unlicensed Deployment
                </h3>
                <p className="text-xs text-slate-600">
                  Any unauthorized duplication, unapproved multi-tenant cloning, commercial extraction, or deployment by non-licensed entities constitutes willful copyright infringement and trade secret theft under:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900">17 U.S.C. § 101 et seq. & DMCA</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Statutory civil damages up to $150,000 per willful infringement plus legal fees.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900">18 U.S.C. § 1030 (CFAA) & WIPO</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Federal criminal and cross-border international intellectual property enforcement.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">3</span>
                  Student & Educator Creator IP Guarantee
                </h3>
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                  <strong className="text-xs font-bold text-emerald-950 block">100% Creator Ownership Principle</strong>
                  <p className="text-xs text-emerald-900">
                    While the software platform is proprietary, students and teachers retain <strong>100% full intellectual property ownership</strong> of all original works created or uploaded (assignments, research, syllabi, lesson plans, and portfolios). SchoolOS holds only a non-exclusive license solely to render and grade coursework.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB: ZERO LIABILITY & INDEMNIFICATION */}
          {tab === 'liability' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-3 shadow-lg">
                <div className="flex items-center gap-2 font-black text-base text-rose-400 tracking-tight">
                  <ShieldAlert size={22} className="text-rose-400 shrink-0" />
                  TOTAL ZERO LIABILITY & COMPLETE INDEMNIFICATION COVENANT (0 LIABILITY FOR US)
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEV STUDIOS, ITS FOUNDING MEMBERS, OWNERS, DEVELOPERS, DIRECTORS, AND AFFILIATES (THE &quot;RELEASED PARTIES&quot;) SHALL BEAR <strong>ABSOLUTELY ZERO FINANCIAL, LEGAL, OR OPERATIONAL LIABILITY ($0.00 USD CAP)</strong> ARISING OUT OF OR IN CONNECTION WITH THE SOFTWARE.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">1</span>
                  Total Disclaimer of All Warranties (&quot;As-Is&quot; Provision)
                </h3>
                <p className="text-xs text-slate-600">
                  THE SOFTWARE IS PROVIDED STRICTLY &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITH ALL FAULTS AND DEFECTS. THE RELEASED PARTIES EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, FREEDOM FROM BUGS, UNINTERRUPTED UPTIME, DATA INTEGRITY, OR NON-INFRINGEMENT.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">2</span>
                  Absolute Limitation of Liability ($0.00 Maximum Cap)
                </h3>
                <p className="text-xs text-slate-600">
                  UNDER NO CIRCUMSTANCES SHALL THE RELEASED PARTIES BE LIABLE FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, PUNITIVE, SPECIAL, OR INCIDENTAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, GRADING DISPUTES, COLLEGE ADMISSIONS OUTCOMES, SECURITY BREACHES BY THIRD PARTIES, HEALTH/NURSE INCIDENTS, TRANSPORTATION DELAYS, OR SYSTEM OUTAGES.
                </p>
                <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900">
                  MAXIMUM AGGREGATE LIABILITY CAP: IN NO EVENT SHALL TOTAL LIABILITY EXCEED EXACTLY ZERO DOLLARS ($0.00 USD).
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">3</span>
                  Complete Defense & Indemnification (Hold Harmless)
                </h3>
                <p className="text-xs text-slate-600">
                  All users, deploying institutions, and third parties agree to fully <strong>DEFEND, INDEMNIFY, AND HOLD HARMLESS</strong> the Released Parties from and against any and all claims, liabilities, lawsuits, judgments, fines, and legal expenses (including attorney fees) arising from software usage, data handling, or breach of licensing terms.
                </p>
              </section>
            </div>
          )}

          {/* TAB: PRIVACY & FERPA */}
          {tab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <ShieldCheck size={18} className="text-emerald-700" />
                  Bulletproof Student Data Privacy & FERPA Compliance
                </div>
                <p className="text-xs text-emerald-800">
                  Strict educational purpose limitation. We <strong>never sell, lease, or monetize</strong> student, parent, or faculty personal data. Zero commercial advertising profiles or third-party ad brokers.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">1. Regulatory Standards</h3>
                <p className="text-xs text-slate-600">
                  Full compliance with FERPA (34 CFR Part 99), COPPA (16 CFR Part 312), GDPR (Articles 6 &amp; 9), and Student Privacy Consortium pledges.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">2. Technical Encryption & Isolation</h3>
                <p className="text-xs text-slate-600">
                  All records encrypted with military-grade AES-256-GCM at rest, TLS 1.3 in transit, and multi-tenant cryptographic isolation.
                </p>
              </section>
            </div>
          )}

          {/* TAB: TERMS */}
          {tab === 'terms' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <FileCheck size={18} className="text-amber-700" />
                  Campus Terms of Service & Acceptable Use
                </div>
                <p className="text-xs text-amber-800">
                  Strict acceptable use policies ensuring academic integrity, digital citizenship, and safe campus collaboration.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">1. Authorized Institutional Scope</h3>
                <p className="text-xs text-slate-600">
                  Access is strictly reserved for authenticated students, faculty, and guardians of the licensed institution under an active Enterprise Licensing Agreement.
                </p>
              </section>
            </div>
          )}

          {/* TAB: SECURITY */}
          {tab === 'security' && (
            <div className="space-y-6">
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 text-purple-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                  <Award size={18} className="text-purple-700" />
                  Enterprise-Grade Security Safeguards
                </div>
                <p className="text-xs text-purple-800">
                  SOC 2 Type II and ISO/IEC 27001 aligned security architecture with automated continuous encryption.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <strong>AES-256-GCM Storage</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Encrypted persistent database storage and backups.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <strong>TLS 1.3 &amp; HSTS Enforced</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Strict end-to-end transport layer security.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DPO */}
          {tab === 'dpo' && (
            <div className="space-y-6">
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                  <Mail size={18} className="text-rose-700" />
                  Data Protection &amp; Legal Licensing Office
                </div>
                <p className="text-xs text-rose-800">
                  For formal licensing verification, institutional access agreements, or privacy requests.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono space-y-1">
                <p><strong>Licensing &amp; Legal:</strong> legal@westbridge.schoolos.edu</p>
                <p><strong>Privacy Office:</strong> privacy@westbridge.schoolos.edu</p>
                <p><strong>Campus:</strong> 100 Academic Way, Westbridge Campus</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert size={15} className="text-rose-600" />
            <span>SchoolOS 2026 · A Product of Dev Studios and its Founding Members · Active Enterprise License Required · 0 Liability</span>
          </div>
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="h-8 px-4 text-xs font-bold">
            Acknowledge &amp; Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
