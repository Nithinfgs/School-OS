'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/app/components/legal-footer';

export default function TermsOfServicePage() {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    const text = document.getElementById('terms-body')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft size={14} /> Back to SchoolOS
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyText}
              className="h-8 text-xs font-semibold gap-1.5 bg-white border-slate-200 shadow-xs"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy Terms'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 text-xs font-semibold gap-1.5 bg-white border-slate-200 shadow-xs"
            >
              <Printer size={13} /> Print
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200 shadow-xs">
              <FileCheck size={28} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Institutional Terms & Acceptable Use
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                SchoolOS Campus Terms of Service
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                A Product of Dev Studios and its Founding Members · Westbridge International Campus
              </p>
            </div>
          </div>

          <div id="terms-body" className="space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">1</span>
                Authorized Institutional Scope & License Requirement
              </h2>
              <p>
                SchoolOS is proprietary educational software that <strong>may only be utilized pursuant to an active, validly executed Enterprise Licensing Agreement</strong> with Westbridge International / SchoolOS. Access is strictly reserved for authenticated students, faculty, and guardians of the licensed institution. Use by any unauthorized third-party organization is strictly forbidden.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">2</span>
                Acceptable Digital Use & Campus Community Standards
              </h2>
              <p>
                All students, faculty, staff, and guardians accessing SchoolOS agree to use digital resources in support of academic excellence, mutual respect, and digital citizenship. Unauthorized tampering, transmission of harmful material, or harassment is strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">3</span>
                Academic Honesty & Responsible AI Utilization
              </h2>
              <p>
                Students are required to maintain strict academic integrity. Work assisted by laboratory or library AI assistants must be properly cited in submissions in accordance with Westbridge International academic guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">4</span>
                Absolute Zero Liability & Total Hold Harmless Covenant
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WESTBRIDGE INTERNATIONAL, SCHOOLOS, ITS DEVELOPERS, OWNERS, AND AFFILIATES SHALL BEAR ABSOLUTELY ZERO LIABILITY ($0.00 USD CAP) FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM THE USE OR INABILITY TO USE THE PLATFORM. USERS AND INSTITUTIONS AGREE TO DEFEND, INDEMNIFY, AND HOLD HARMLESS THE PLATFORM OPERATORS FROM ANY CLAIMS.
              </p>
            </section>
          </div>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
