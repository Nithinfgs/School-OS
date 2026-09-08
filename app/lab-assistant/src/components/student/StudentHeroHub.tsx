import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabType } from '../../types/lab';
import { 
  FlaskConical, 
  Atom, 
  Dna, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestItemModal } from './RequestItemModal';
import { MyRequestsView } from './MyRequestsView';

export const StudentHeroHub: React.FC = () => {
  const { items, requests, currentUser, navigateTo } = useLab();
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const chemItems = items.filter((i) => i.labType === 'chemistry');
  const physItems = items.filter((i) => i.labType === 'physics');
  const bioItems = items.filter((i) => i.labType === 'biology');

  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'prepared' || r.status === 'ready');

  const portals: {
    id: LabType;
    title: string;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    itemCount: number;
    tags: string[];
    accentColor: string;
    bgGradient: string;
    borderHover: string;
    badgeStyle: string;
    buttonStyle: string;
  }[] = [
    {
      id: 'chemistry',
      title: 'Chemistry Lab',
      label: 'Reagents & Acids',
      subtitle: 'Acids (1M HCl), bases (NaOH), salts (CuSO4), pH indicators & borosilicate beakers.',
      icon: <FlaskConical className="w-8 h-8 text-[#2D7F9F]" />,
      itemCount: chemItems.length,
      tags: ['HCl & NaOH', 'CuSO4 Salts', 'Phenolphthalein', 'Beakers'],
      accentColor: 'text-[#2D7F9F]',
      bgGradient: 'from-white via-[#E9F3F6]/40 to-[#E9F3F6]/80',
      borderHover: 'hover:border-[#2D7F9F] hover:shadow-[#2D7F9F]/10',
      badgeStyle: 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30',
      buttonStyle: 'bg-[#2D7F9F] hover:bg-[#236F91] text-white shadow-[#2D7F9F]/20',
    },
    {
      id: 'physics',
      title: 'Physics Lab',
      label: 'Optics & Mechanics',
      subtitle: 'Vernier calipers (0.01mm), biconvex lenses, ray boxes, prisms, multimeters & spring kits.',
      icon: <Atom className="w-8 h-8 text-[#4C6073]" />,
      itemCount: physItems.length,
      tags: ['Vernier Calipers', 'Biconvex Lenses', 'Ray Boxes', 'Multimeters'],
      accentColor: 'text-[#4C6073]',
      bgGradient: 'from-white via-[#EDF2F5]/40 to-[#EDF2F5]/80',
      borderHover: 'hover:border-[#4C6073] hover:shadow-[#4C6073]/10',
      badgeStyle: 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30',
      buttonStyle: 'bg-[#253B53] hover:bg-[#1F3547] text-white shadow-[#253B53]/20',
    },
    {
      id: 'biology',
      title: 'Biology Lab',
      label: 'Optics & Histology',
      subtitle: 'Compound light microscopes (40x-1000x), methylene blue, tissue slides & dissection tools.',
      icon: <Dna className="w-8 h-8 text-[#2D7F9F]" />,
      itemCount: bioItems.length,
      tags: ['Light Microscopes', 'Methylene Blue', 'Prepared Slides', 'Dissection'],
      accentColor: 'text-[#2D7F9F]',
      bgGradient: 'from-white via-[#EEF6F8]/40 to-[#EEF6F8]/80',
      borderHover: 'hover:border-[#2D7F9F] hover:shadow-[#2D7F9F]/10',
      badgeStyle: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
      buttonStyle: 'bg-[#2D7F9F] hover:bg-[#236F91] text-white shadow-[#2D7F9F]/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F3F6] text-[#2D7F9F] border border-[#2D7F9F]/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2D7F9F]" />
            <span>Welcome, {currentUser?.name || 'Student'} • Science Requisition Portal</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F3547] leading-tight">
            Science Laboratory Portals
          </h1>
          
          <p className="text-xs sm:text-sm text-[#61728A] max-w-xl leading-relaxed">
            Select a laboratory below to enter its store catalog, browse equipment in stock, and add items to your requisition cart.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Custom Requisition</span>
          </button>

          <button
            onClick={() => setShowMyRequests(!showMyRequests)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F7F9FB] text-[#1F3547] border border-[#DBE4EA] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#2D7F9F]" />
            <span>My Requisitions ({requests.length})</span>
            {pendingRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#B58B4E] animate-ping ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Show My Requests view if toggled */}
      <AnimatePresence>
        {showMyRequests && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs"
          >
            <MyRequestsView onRequestNew={() => setIsRequestModalOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero 3-Portal Interactive Drop-In Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {portals.map((portal, idx) => (
          <motion.div
            key={portal.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => navigateTo('lab-store', portal.id)}
            className={`group bg-gradient-to-b ${portal.bgGradient} rounded-3xl p-7 border border-[#DBE4EA] ${portal.borderHover} shadow-[0_4px_24px_rgba(31,41,51,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
          >
            {/* Top section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#DBE4EA] group-hover:scale-105 transition-transform">
                  {portal.icon}
                </div>
                
                <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${portal.badgeStyle}`}>
                  {portal.itemCount} In Stock
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#61728A]">
                  {portal.label}
                </span>
                <h3 className="text-2xl font-extrabold text-[#1F3547] group-hover:text-[#2D7F9F] transition-colors mt-0.5">
                  {portal.title}
                </h3>
                <p className="text-xs text-[#61728A] mt-2 leading-relaxed">
                  {portal.subtitle}
                </p>
              </div>

              {/* Sample Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {portal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold text-[#4C6073] bg-white/90 px-2.5 py-1 rounded-lg border border-[#DBE4EA]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="pt-6 mt-6 border-t border-[#DBE4EA]/80 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#1F3547] group-hover:text-[#2D7F9F] transition-colors flex items-center gap-1.5">
                <span>Enter Store Catalog</span>
              </span>

              <div className={`p-2.5 rounded-xl ${portal.buttonStyle} shadow-md transition-transform group-hover:translate-x-1 flex items-center justify-center`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Global Requisition Modal */}
      <RequestItemModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

    </div>
  );
};
