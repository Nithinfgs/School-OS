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
                Proprietary Technology Owned Exclusively by <a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-600">DevStudio Solutions</a> (devstudionvk@gmail.com) · Westbridge International Campus
              </p>
            </div>
          </div>

          <div id="terms-body" className="space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">1</span>
                Exclusive Ownership & Mandatory Enterprise License
              </h2>
              <p>
                SchoolOS is proprietary educational software developed and owned exclusively by <strong>DevStudio Solutions</strong> (<a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://www.devstudio.solutions/</a>). It <strong>may only be utilized pursuant to an active, validly executed Enterprise Licensing Agreement</strong> issued by DevStudio Solutions. Full legal title and ownership perpetual remain with DevStudio Solutions (<a href="mailto:devstudionvk@gmail.com" className="text-blue-600 underline">devstudionvk@gmail.com</a>).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">2</span>
                Acceptable Digital Use & Campus Community Standards
              </h2>
              <p>
                All students, faculty, staff, and guardians accessing SchoolOS agree to use digital resources in support of academic excellence, mutual respect, and digital citizenship. Unauthorized tampering, transmission of harmful material, reverse engineering, unauthorized extraction, or harassment is strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">3</span>
                Total Zero Liability Immunity ($0.00 USD Cap)
              </h2>
              <p>
                Under no legal theory shall DevStudio Solutions, its developers, or founding members be held liable for any damages, errors, interruptions, admissions outcomes, or data issues. Maximum liability is strictly capped at $0.00 USD.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">4</span>
                Legal Inquiries & DevStudio Ownership Verification
              </h2>
              <p>
                For official licensing agreements, copyright audits, or general inquiries, contact:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono space-y-1 text-slate-700">
                <p><strong>Owner:</strong> DevStudio Solutions</p>
                <p><strong>Website:</strong> <a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://www.devstudio.solutions/</a></p>
                <p><strong>Email:</strong> <a href="mailto:devstudionvk@gmail.com" className="text-blue-600 underline">devstudionvk@gmail.com</a></p>
              </div>
            </section>
          </div>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
