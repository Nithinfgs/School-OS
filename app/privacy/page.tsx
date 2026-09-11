'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  Mail,
  Scale,
  Award,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalFooter } from '@/app/components/legal-footer';

export default function PrivacyPolicyPage() {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    const text = document.getElementById('privacy-policy-body')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Top bar navigation */}
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
              {copied ? 'Copied' : 'Copy Policy'}
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
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 shadow-xs">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Official Institutional Policy
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                SchoolOS Privacy Policy & FERPA Compliance
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                A Product of Dev Studios and its Founding Members · Westbridge International Campus · Version 4.2
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={13} /> FERPA (34 CFR Part 99)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={13} /> COPPA (16 CFR Part 312)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <CheckCircle2 size={13} /> GDPR & UK-GDPR
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              <CheckCircle2 size={13} /> Student Privacy Pledge Signatory
            </span>
          </div>

          {/* Policy Text Area */}
          <div id="privacy-policy-body" className="space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-950 space-y-1.5">
              <strong className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Lock size={16} className="text-emerald-700" />
                Zero Commercialization & Anti-Monetization Pledge
              </strong>
              <p className="text-xs text-emerald-800">
                SchoolOS and Westbridge International unconditionally guarantee that no student, guardian, or educator personal data is ever sold, rented, leased, or monetized. We do not construct commercial advertising profiles or permit third-party advertising trackers.
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">1</span>
                Educational Mission & Data Scope
              </h2>
              <p>
                SchoolOS is deployed exclusively for accredited institutional education, academic coursework delivery, student safety, and school administration. Information processed within SchoolOS is restricted strictly to legitimate educational interests under FERPA regulations and GDPR Article 6(1)(e).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">2</span>
                Categories of Information Processed
              </h2>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 pl-2">
                <li><strong>Student Academic Information:</strong> Assignments, homework, IBDP/AP assessments, grades, transcripts, lesson notes, and teacher feedback.</li>
                <li><strong>Campus Operations & Safety:</strong> Homeroom and lesson attendance registers, campus bus transit timestamps, nurse station visit logs, and cafeteria allergy/dietary tags.</li>
                <li><strong>Guardian & Household Contacts:</strong> Verified parent/guardian contact numbers, emails, emergency pickup permissions, and billing records.</li>
                <li><strong>Technical Telemetry:</strong> Anonymized audit trails, access tokens, and role-based permission verification logs.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">3</span>
                Technical & Organizational Safeguards
              </h2>
              <p>
                All student records are stored with military-grade <strong>AES-256-GCM encryption at rest</strong> and transmitted strictly via <strong>TLS 1.3 with HSTS</strong>. Multi-tenant database isolation ensures student records are shielded from cross-organizational access. Daily immutable cryptographic snapshots ensure point-in-time recovery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">4</span>
                Parental Inspection & Data Subject Rights
              </h2>
              <p>
                Parents and eligible students maintain complete rights under FERPA and GDPR to inspect, review, download, and request correction of educational records. Inquiries and formal data export requests may be directed to our dedicated Data Protection Officer at <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono text-xs">privacy@westbridge.schoolos.edu</code>.
              </p>
            </section>
          </div>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
