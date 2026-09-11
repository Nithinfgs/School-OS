import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ShoppingBag,
  BookOpen,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MyLoansAndWaitlistView } from './MyLoansAndWaitlistView';

interface StudentHeroHubProps {
  onRequestPurchaseOpen: () => void;
}

export const StudentHeroHub: React.FC<StudentHeroHubProps> = ({ onRequestPurchaseOpen }) => {
  const { 
    currentUser, 
    navigateTo, 
    books, 
    loans, 
    readingLogs, 
    setSearchQuery,
    setIsCartOpen,
    cart
  } = useLibrary();

  const [showMyLoans, setShowMyLoans] = useState(false);

  const studentLoans = loans.filter(
    (l) => l.studentEmail === (currentUser?.email || 'rohan.verma@school.edu') && (l.status === 'active' || l.status === 'overdue' || l.status === 'renewed')
  );

  const myLogs = readingLogs.filter(
    (r) => r.studentEmail === (currentUser?.email || 'rohan.verma@school.edu')
  );

  const totalMinutes = myLogs.reduce((acc, l) => acc + l.minutesRead, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const academicCount = books.filter((b) => b.collection === 'academic').length;
  const fictionCount = books.filter((b) => b.collection === 'fiction').length;

  const handleQuickSearch = (term: string, collection: 'academic' | 'fiction') => {
    setSearchQuery(term);
    navigateTo('book-store', collection);
  };

  const portals = [
    {
      id: 'academic',
      name: 'Academic Library',
      subtitle: 'CURRICULUM & DP EXAMS',
      description: 'Coursebooks, lab practical handbooks, and exam guides for Chemistry, Physics, Biology, Math AA, CS, and TOK.',
      icon: <GraduationCap className="w-8 h-8 text-[#2D7F9F]" />,
      count: `${academicCount} In Stock`,
      tags: ['Chemistry HL', 'Physics HL', 'Math AA', 'Biology HL', 'TOK Guides'],
      action: () => navigateTo('book-store', 'academic'),
      ctaText: 'Enter Store Catalog',
      bgGradient: 'from-white via-[#F4F9FB] to-white',
      borderHover: 'hover:border-[#2D7F9F] hover:shadow-[#2D7F9F]/10',
      badgeStyle: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
      buttonStyle: 'bg-[#2D7F9F] hover:bg-[#236F91] text-white shadow-[#2D7F9F]/20',
    },
    {
      id: 'fiction',
      name: 'Fiction & Classics',
      subtitle: 'LITERATURE & SAGAS',
      description: 'Complete fantasy sagas (Percy Jackson, Heroes of Olympus), science fiction epics like Dune, 1984, and world classics.',
      icon: <BookOpen className="w-8 h-8 text-[#2D7F9F]" />,
      count: `${fictionCount} In Stock`,
      tags: ['Percy Jackson', 'Dune', '1984', 'Classics', 'Sci-Fi'],
      action: () => navigateTo('book-store', 'fiction'),
      ctaText: 'Enter Store Catalog',
      bgGradient: 'from-white via-[#F4F9FB] to-white',
      borderHover: 'hover:border-[#2D7F9F] hover:shadow-[#2D7F9F]/10',
      badgeStyle: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
      buttonStyle: 'bg-[#2D7F9F] hover:bg-[#236F91] text-white shadow-[#2D7F9F]/20',
    },
    {
      id: 'tracker',
      name: 'Reading Tracker & Loans',
      subtitle: 'READING GOALS & LOANS',
      description: 'Log reading minutes, record page milestones, track overdue countdowns, and manage your active borrowed books.',
      icon: <Clock className="w-8 h-8 text-[#2D7F9F]" />,
      count: `${studentLoans.length} Active Loans`,
      tags: [`${totalHours} hrs read`, `${studentLoans.length} active loans`, 'My Waitlist'],
      action: () => navigateTo('reading-tracker'),
      ctaText: 'Open Reading Tracker',
      bgGradient: 'from-white via-[#F4F9FB] to-white',
      borderHover: 'hover:border-[#2D7F9F] hover:shadow-[#2D7F9F]/10',
      badgeStyle: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
      buttonStyle: 'bg-[#2D7F9F] hover:bg-[#236F91] text-white shadow-[#2D7F9F]/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F3F6] text-[#2D7F9F] border border-[#2D7F9F]/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2D7F9F]" />
            <span>Welcome, {currentUser?.name || 'Student'} • Central Library Portal</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F3547] leading-tight">
            Central Library Portals
          </h1>
          
          <p className="text-xs sm:text-sm text-[#61728A] max-w-xl leading-relaxed">
            Select a library portal below to browse textbooks and literature in stock, explore reading sagas, or manage your borrowed loans.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            onClick={onRequestPurchaseOpen}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Book</span>
          </button>

          <button
            onClick={() => setShowMyLoans(!showMyLoans)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F7F9FB] text-[#1F3547] border border-[#DBE4EA] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#2D7F9F]" />
            <span>My Loans ({studentLoans.length})</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F7F9FB] text-[#1F3547] border border-[#DBE4EA] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#2D7F9F]" />
            <span>Bag ({cart.length})</span>
          </button>
        </div>
      </div>

      {/* Show My Loans view if toggled */}
      <AnimatePresence>
        {showMyLoans && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs"
          >
            <MyLoansAndWaitlistView />
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
            onClick={portal.action}
            className={`group bg-gradient-to-b ${portal.bgGradient} rounded-3xl p-7 border border-[#DBE4EA] ${portal.borderHover} shadow-[0_4px_24px_rgba(31,41,51,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
          >
            {/* Top section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#DBE4EA] group-hover:scale-105 transition-transform">
                  {portal.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${portal.badgeStyle}`}>
                  {portal.count}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#61728A] block">
                  {portal.subtitle}
                </span>
                <h3 className="text-2xl font-black text-[#1F3547] tracking-tight mt-1 group-hover:text-[#2D7F9F] transition-colors">
                  {portal.name}
                </h3>
                <p className="text-xs text-[#61728A] mt-2 leading-relaxed line-clamp-2">
                  {portal.description}
                </p>
              </div>

              {/* Sample Tag Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
                {portal.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickSearch(tag.split(' ')[0], portal.id === 'fiction' ? 'fiction' : 'academic')}
                    className="px-3 py-1 rounded-lg bg-white border border-[#DBE4EA] text-[11px] font-semibold text-[#4A5D6E] hover:border-[#2D7F9F] hover:text-[#2D7F9F] transition-all shadow-xs cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom link & button */}
            <div className="mt-6 pt-4 border-t border-[#EDF2F6] flex items-center justify-between">
              <span className="font-bold text-xs text-[#1F3547] group-hover:text-[#2D7F9F] transition-colors">
                {portal.ctaText}
              </span>
              <div className={`w-9 h-9 rounded-full ${portal.buttonStyle} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
