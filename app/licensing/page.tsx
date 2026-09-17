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
  Globe,
  Mail,
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
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md">
                <ShieldAlert size={32} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  Proprietary Enterprise Software License & Perpetual Ownership Covenant
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  SchoolOS License, Exclusivity & 0-Liability Terms
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-1 font-mono">
                  CONFIDENTIAL &amp; PROPRIETARY · OWNERSHIP VESTED IN DEVSTUDIO SOLUTIONS (HTTPS://WWW.DEVSTUDIO.SOLUTIONS/) · devstudionvk@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                <Ban size={13} /> DevStudio IP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck size={13} /> 0-Liability Shield
              </span>
            </div>
          </div>

          <div id="licensing-body" className="space-y-8 text-sm text-slate-700 leading-relaxed">
            {/* Warning Callout Box 1: Mandatory License */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 text-white space-y-3 shadow-sm">
              <div className="flex items-center gap-2 font-black text-base text-white tracking-tight">
                <ShieldAlert size={22} className="text-slate-300" />
                MANDATORY ENTERPRISE LICENSING & PERPETUAL CODE OWNERSHIP
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                THIS SOFTWARE, SOURCE CODE, DATABASE SCHEMAS, AND ALGORITHMIC DESIGNS ARE THE EXCLUSIVE INTELLECTUAL PROPERTY OF <strong>DEVSTUDIO SOLUTIONS (HTTPS://WWW.DEVSTUDIO.SOLUTIONS/) AND ITS FOUNDING MEMBERS</strong>.
              </p>
              <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200 font-semibold leading-relaxed space-y-1.5">
                <p>
                  <strong>PERPETUAL OWNERSHIP:</strong> All legal rights, title, copyright, patents, and source code ownership remain perpetually and unconditionally with DevStudio Solutions (<a href="mailto:devstudionvk@gmail.com" className="text-blue-400 underline">devstudionvk@gmail.com</a>).
                </p>
                <p>
                  <strong>LICENSING CAN BE GRANTED OR TAKEN DOWN:</strong> Commercial or educational licenses may be issued, operated, suspended, or revoked/taken down at will by DevStudio Solutions, but ownership NEVER transfers to any licensee or third-party entity.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">1</span>
                Exclusive Ownership & Institutional Boundaries
              </h2>
              <p>
                DevStudio Solutions grants authorized institutional licensees a limited, non-transferable, non-sublicensable, revocable software license strictly for internal educational administration and coursework.
              </p>
              <p>
                Any deployment, hosting, code extraction, or multi-tenant duplication by unauthorized external organizations constitutes willful copyright infringement and theft of trade secrets under:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                <li><strong>United States Copyright Act (17 U.S.C. § 101 et seq.) &amp; DMCA:</strong> Statutory civil damages up to $150,000 per willful violation plus attorney fees.</li>
                <li><strong>Computer Fraud and Abuse Act (18 U.S.C. § 1030):</strong> Federal civil and criminal liabilities for unauthorized computer access and extraction.</li>
                <li><strong>WIPO &amp; International Copyright Conventions:</strong> Worldwide enforcement across all jurisdictions.</li>
              </ul>
            </section>

            {/* Section 2: Zero-Liability */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">2</span>
                Complete Zero-Liability &amp; &quot;As-Is&quot; Provision
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-mono text-slate-800">
                <p><strong>TOTAL LIABILITY CAP: $0.00 USD.</strong></p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DEVSTUDIO SOLUTIONS, ITS FOUNDING MEMBERS, DEVELOPERS, DIRECTORS, AND AGENTS SHALL BEAR ABSOLUTELY ZERO LIABILITY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, PUNITIVE, OR SPECIAL DAMAGES (INCLUDING GRADING DISPUTES, ADMISSIONS OUTCOMES, MEDICAL EMERGENCIES, BUS DELAYS, SECURITY INCIDENTS, OR DATA LOSS).
                </p>
              </div>
            </section>

            {/* Section 3: Student Creator IP */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">3</span>
                Student &amp; Faculty Creator IP Protection
              </h2>
              <p>
                While DevStudio Solutions exclusively and perpetually owns all software codebase and platform infrastructure, students and teachers retain <strong>100% full intellectual property ownership</strong> of all original coursework, research essays, artworks, lesson plans, and portfolios uploaded to the system.
              </p>
            </section>

            {/* Section 4: Contact */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center">4</span>
                Licensing &amp; Legal Entity Information
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-mono text-slate-700">
                <p><strong>Owner &amp; Developer:</strong> DevStudio Solutions</p>
                <p><strong>Website:</strong> <a href="https://www.devstudio.solutions/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://www.devstudio.solutions/</a></p>
                <p><strong>Legal &amp; Licensing Contact:</strong> <a href="mailto:devstudionvk@gmail.com" className="text-blue-600 underline">devstudionvk@gmail.com</a></p>
                <p><strong>Status:</strong> Active Enterprise Proprietary Software License</p>
              </div>
            </section>
          </div>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
