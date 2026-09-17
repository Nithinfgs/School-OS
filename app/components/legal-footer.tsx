'use client';

import { useState } from 'react';
import { ShieldCheck, Scale, Lock, FileText } from 'lucide-react';
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
        <div className={`flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 py-3 border-t border-slate-200/70 dark:border-slate-800/70 mt-6 ${className}`}>
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <ShieldCheck size={13} className="text-slate-500 dark:text-slate-400" />
            <span>FERPA & COPPA Protected · SchoolOS 2026</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openTab('privacy')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => openTab('licensing')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Licensing & IP
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => openTab('terms')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
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
      <footer className={`mt-10 pt-6 pb-8 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-4 ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-xs">
                SchoolOS Enterprise Educational Platform
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                A Product of Dev Studios and its Founding Members · Westbridge International Campus
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => openTab('licensing')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <Scale size={13} className="text-slate-400 dark:text-slate-500" />
              <span>License & Exclusivity</span>
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button
              type="button"
              onClick={() => openTab('liability')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <ShieldCheck size={13} className="text-slate-400 dark:text-slate-500" />
              <span>0-Liability Shield</span>
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button
              type="button"
              onClick={() => openTab('privacy')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <Lock size={13} className="text-slate-400 dark:text-slate-500" />
              <span>Privacy & FERPA</span>
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button
              type="button"
              onClick={() => openTab('terms')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <FileText size={13} className="text-slate-400 dark:text-slate-500" />
              <span>Terms</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
          <p>
            © 2026 Dev Studios and its Founding Members. All rights reserved. Restricted to authorized institutional licensees with an active licensing agreement.
          </p>
          <div className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>A Product of Dev Studios · 0 Liability</span>
          </div>
        </div>
      </footer>
      <LegalModal open={legalOpen} onOpenChange={setLegalOpen} initialTab={activeTab} />
    </>
  );
}
