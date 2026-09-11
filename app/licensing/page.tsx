'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  Lock,
  Building2,
  FileCheck,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/app/components/legal-footer';

export default function LicensingPage() {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    const text = document.getElementById('licensing-body')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft size={15} /> Back to SchoolOS
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyText}
              className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-white border-slate-300 shadow-xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? 'Copied Full License' : 'Copy All Terms'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-white border-slate-300 shadow-xs"
            >
              <Printer size={14} /> Print / Export PDF
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-10 shadow-md space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-md">
                <ShieldAlert size={32} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-rose-700 uppercase tracking-widest">
                  Proprietary Enterprise Software License & Zero-Liability Covenant
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  SchoolOS License, Exclusivity & 0-Liability Terms
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-1 font-mono">
                  CONFIDENTIAL &amp; PROPRIETARY · ALL RIGHTS RESERVED WORLDWIDE · Copyright © 2026 Westbridge International / SchoolOS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <Ban size={13} /> Strict Exclusivity
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck size={13} /> 0-Liability Shield
              </span>
            </div>
          </div>

          <div id="licensing-body" className="space-y-8 text-sm text-slate-700 leading-relaxed">
            {/* Warning Callout Box 1: Mandatory License */}
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 text-rose-950 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 font-black text-base text-rose-900 tracking-tight">
                <AlertCircle size={20} className="text-rose-700 shrink-0" />
                MANDATORY ACTIVE ENTERPRISE LICENSING AGREEMENT REQUIREMENT
              </div>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-semibold">
                THIS PLATFORM IS STRICTLY PROPRIETARY AND RESTRICTED. <strong>IT CAN ONLY BE ACCESSED, DEPLOYED, RUN, HOSTED, OR OPERATED UNDER A DIRECT, FULLY EXECUTED COMMERCIAL ENTERPRISE LICENSING AGREEMENT</strong> WITH WESTBRIDGE INTERNATIONAL / SCHOOLOS.
              </p>
              <div className="p-4 bg-white rounded-xl border border-rose-300 text-xs sm:text-sm text-rose-950 font-black leading-snug">
                ⛔ STRICT PROHIBITION ON UNLICENSED ORGANIZATIONS: NO OTHER PERSON, SCHOOL, UNIVERSITY, DISTRICT, CORPORATION, OR THIRD-PARTY ORGANIZATION APART FROM THE AUTHORIZED LICENSEE / OWNER HAS ANY RIGHT, PERMISSION, TITLE, OR LICENSE TO ACCESS, USE, RUN, HOST, REPRODUCE, FORK, MODIFY, SUBLICENSE, OR OPERATE THIS SOFTWARE.
              </div>
            </div>

            {/* Warning Callout Box 2: Total 0-Liability */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white space-y-3 shadow-lg">
              <div className="flex items-center gap-2 font-black text-base text-rose-400 tracking-tight">
                <ShieldAlert size={20} className="text-rose-400 shrink-0" />
                ABSOLUTE ZERO LIABILITY & COMPLETE DISCLAIMER (0 LIABILITY FOR US)
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LICENSOR, ITS OWNERS, DEVELOPERS, FOUNDERS, DIRECTORS, AND AFFILIATES (THE &quot;RELEASED PARTIES&quot;) SHALL BEAR <strong>ABSOLUTELY ZERO FINANCIAL, LEGAL, OR OPERATIONAL LIABILITY ($0.00 USD CAP)</strong> UNDER ANY CIRCUMSTANCES OR LEGAL THEORY.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">1</span>
                Exclusive License Grant & Tenant Boundaries
              </h2>
              <p>
                Licensor grants the designated licensee educational institution a non-exclusive, non-transferable, revocable enterprise license to access and operate the SchoolOS software exclusively for its enrolled students, employed teachers, and authorized staff members.
              </p>
              <p>
                This license is strictly bound to authorized institutional domains (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">westbridge.schoolos.edu</code>). Sublicensing, reselling, time-sharing, or providing multi-tenant SaaS services to unapproved external entities is strictly prohibited.
              </p>
            </section>

            {/* Section 2: Complete Disclaimer & Zero Liability */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">2</span>
                Complete Disclaimer of Warranties & Total Zero Liability
              </h2>
              <p>
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITH ALL DEFECTS. THE RELEASED PARTIES EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, UPTIME AVAILABILITY, ACCURACY OF ACADEMIC OR MEDICAL LOGS, FREEDOM FROM GLITCHES, OR NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL THE RELEASED PARTIES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING DATA LOSS, ACADEMIC OR ADMISSION DISPUTES, LOST REVENUE, FACILITY ACCIDENTS, DELAYS, OR DOWNTIME.
              </p>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900">
                AGGREGATE LIABILITY CEILING: MAXIMUM AGGREGATE LIABILITY ACROSS ALL CLAIMS IS PERMANENTLY CAPPED AT ZERO DOLLARS ($0.00 USD).
              </div>
            </section>

            {/* Section 3: Indemnification */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">3</span>
                Complete Hold Harmless & Defense Indemnification
              </h2>
              <p>
                Users, deploying organizations, and unauthorized third parties agree to fully <strong>DEFEND, INDEMNIFY, AND HOLD HARMLESS</strong> the Released Parties from and against any and all claims, lawsuits, liabilities, damages, judgments, fines, and legal costs (including attorney fees) arising from software usage, data handling, school disputes, or breach of license agreements.
              </p>
            </section>

            {/* Section 4: Creator IP */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">4</span>
                Student & Educator Creator Intellectual Property Guarantee
              </h2>
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-950 space-y-1.5">
                <strong className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  100% Creator Ownership Guarantee
                </strong>
                <p className="text-xs text-emerald-800">
                  While the underlying software platform is proprietary, students and teachers retain <strong>100% full intellectual property ownership</strong> of all original coursework, research, syllabi, lesson plans, and portfolios created on or submitted through SchoolOS.
                </p>
              </div>
            </section>

            {/* Section 5: Statutory Damages */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">5</span>
                Civil & Criminal Penalties for Unlicensed Deployment
              </h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                <li><strong>United States Copyright Act (17 U.S.C. § 101 et seq.) & DMCA:</strong> Statutory civil damages up to $150,000 per willful violation plus attorney's fees.</li>
                <li><strong>Computer Fraud and Abuse Act (18 U.S.C. § 1030):</strong> Federal civil and criminal liabilities for unauthorized computer access.</li>
                <li><strong>WIPO Copyright Treaty & Berne Convention:</strong> Worldwide cross-jurisdictional enforcement and immediate domain seizure.</li>
              </ul>
            </section>
          </div>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
