'use client';

import { useState } from 'react';
import { ShieldCheck, Scale, Lock, FileText, Award } from 'lucide-react';
import { LegalModal, type LegalTab } from './legal-modal';

interface LegalFooterProps {
  className?: string;
  variant?: 'minimal' | 'full' | 'compact';
}

export function LegalFooter({ className = '', variant = 'full' }: LegalFooterProps) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LegalTab>('privacy');

  const openTab = (tab: LegalTab) => {
    setActiveTab(tab);
    setLegalOpen(true);
  };

  if (variant === 'compact') {
    return (
      <>
        <div className={`flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 py-3 border-t border-slate-200/70 mt-6 ${className}`}>
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>FERPA & COPPA Protected · SchoolOS 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openTab('privacy')}
              className="hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => openTab('licensing')}
              className="hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Licensing & IP
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => openTab('terms')}
              className="hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
        <LegalModal open={legalOpen} onOpenChange={setLegalOpen} initialTab={activeTab} />
      </>
    );
  }

  return (
    <>
      <footer className={`mt-10 pt-6 pb-8 border-t border-slate-200/80 text-xs text-slate-500 space-y-4 ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="font-bold text-slate-800 tracking-tight text-xs">
                SchoolOS Enterprise Educational Platform
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                A Product of Dev Studios and its Founding Members · Westbridge International Campus
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => openTab('licensing')}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 font-bold transition-colors"
            >
              <Scale size={12} className="text-blue-600" />
              License & Exclusivity
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => openTab('liability')}
              className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-bold transition-colors"
            >
              <ShieldCheck size={12} className="text-rose-600" />
              0-Liability Shield
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => openTab('privacy')}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-bold transition-colors"
            >
              <Lock size={12} className="text-emerald-600" />
              Privacy & FERPA
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => openTab('terms')}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-amber-700 font-bold transition-colors"
            >
              <FileText size={12} className="text-amber-600" />
              Terms
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <p>
            © 2026 Dev Studios and its Founding Members. All rights reserved. Restricted to authorized institutional licensees with an active licensing agreement.
          </p>
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>A Product of Dev Studios · 0 Liability</span>
          </div>
        </div>
      </footer>
      <LegalModal open={legalOpen} onOpenChange={setLegalOpen} initialTab={activeTab} />
    </>
  );
}
