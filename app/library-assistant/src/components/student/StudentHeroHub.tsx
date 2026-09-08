import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  BookmarkCheck, 
  ArrowRight, 
  BookPlus, 
  ShoppingBag
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

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
    waitlist, 
    setSearchQuery,
    setIsCartOpen,
    cart
  } = useLibrary();

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

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  };

  // Falling into place card animation
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 120,
      },
    },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Header greeting & quick action row */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D7F9F] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Central Library Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F3547] tracking-tight mt-1">
            Welcome, <span className="text-[#2D7F9F]">{currentUser?.name}</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Select a portal to explore academic texts, fiction sagas, or track your reading goals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#1F3547] text-xs font-bold rounded-xl border border-[#CBD5E1] transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#2D7F9F]" />
            <span>Bag ({cart.length})</span>
          </button>

          <button
            onClick={onRequestPurchaseOpen}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer"
          >
            <BookPlus className="w-4 h-4" />
            <span>Request Book</span>
          </button>
        </div>
      </motion.div>

      {/* Main 4 Animated Portal Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        
        {/* Portal Card 1: Academic Library */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
          onClick={() => navigateTo('book-store', 'academic')}
          className="group relative bg-white rounded-3xl p-7 border border-[#E2E8F0] hover:border-[#2B7796]/40 shadow-sm hover:shadow-2xl hover:shadow-[#2B7796]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle warm animated ambient hue */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E9F3F6] to-transparent rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E9F3F6] text-[#2B7796] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#E9F3F6] text-[#2B7796] border border-[#C6E2EA]">
                {academicCount} Textbooks
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F3547] tracking-tight group-hover:text-[#2B7796] transition-colors">
                Academic & DP Subject Texts
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Coursebooks, lab practical handbooks, and exam guides for Chemistry, Physics, Biology, Math AA HL, Computer Science, and Theory of Knowledge.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
              {['Chemistry', 'Physics', 'Biology', 'Mathematics', 'Computer Science', 'IB DP'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleQuickSearch(sub, 'academic')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#E9F3F6] text-[#475569] hover:text-[#2B7796] border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#2B7796] relative z-10">
            <span>Browse Academic Books</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

        {/* Portal Card 2: Fiction & Non-Fiction */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
          onClick={() => navigateTo('book-store', 'fiction')}
          className="group relative bg-white rounded-3xl p-7 border border-[#E2E8F0] hover:border-[#1E7492]/40 shadow-sm hover:shadow-2xl hover:shadow-[#1E7492]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle warm animated ambient hue */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EAF5F7] to-transparent rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5F7] text-[#1E7492] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#EAF5F7] text-[#1E7492] border border-[#C8E7ED]">
                {fictionCount} Titles
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F3547] tracking-tight group-hover:text-[#1E7492] transition-colors">
                Fiction & Non-Fiction
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Complete fantasy sagas (Percy Jackson Books 1-5, Heroes of Olympus), science fiction epics like Dune, 1984, timeless classics, and non-fiction memoirs.
              </p>
            </div>

            {/* Quick Series Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
              {['Percy Jackson (Parts 1-5)', 'Dune', '1984', 'Classics', 'Sci-Fi', 'Non-Fiction'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickSearch(tag.split(' ')[0], 'fiction')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#EAF5F7] text-[#475569] hover:text-[#1E7492] border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#1E7492] relative z-10">
            <span>Explore Fiction & Non-Fiction</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

        {/* Portal Card 3: Reading Tracker & Journey */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
          onClick={() => navigateTo('reading-tracker')}
          className="group relative bg-white rounded-3xl p-7 border border-[#E2E8F0] hover:border-[#B45309]/40 shadow-sm hover:shadow-2xl hover:shadow-[#B45309]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle warm animated ambient hue */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FEF3C7] to-transparent rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                {totalHours} Hours Read
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F3547] tracking-tight group-hover:text-[#B45309] transition-colors">
                My Reading Tracker & Deadlines
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Log reading minutes, record page milestones, track overdue countdowns, write reflections, and celebrate completed books!
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
              <div className="flex justify-between">
                <span>Total Study Logs:</span>
                <strong className="text-[#1F3547]">{myLogs.length} entries</strong>
              </div>
              <div className="flex justify-between">
                <span>Books In Progress:</span>
                <strong className="text-[#B45309]">{studentLoans.length} active</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#B45309] relative z-10">
            <span>Open Reading Tracker</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

        {/* Portal Card 4: My Loans & Waitlists */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
          onClick={() => navigateTo('my-loans')}
          className="group relative bg-white rounded-3xl p-7 border border-[#E2E8F0] hover:border-[#2D7F9F]/40 shadow-sm hover:shadow-2xl hover:shadow-[#2D7F9F]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle warm animated ambient hue */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF5EE] to-transparent rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#2D7F9F] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#EBF5EE] text-[#2D7F9F] border border-[#2D7F9F]/20">
                {studentLoans.length} Active Loans
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F3547] tracking-tight group-hover:text-[#2D7F9F] transition-colors">
                My Loans, Waitlists & Requests
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                View your active borrowed titles, check your waitlist reservation queue position (#1, #2), and track book purchase proposals submitted to the librarian.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
              <div className="flex justify-between">
                <span>Active Reservations:</span>
                <strong className="text-[#1F3547]">{waitlist.filter((w) => w.studentEmail === currentUser?.email && w.status === 'waiting').length} waitlists</strong>
              </div>
              <div className="flex justify-between">
                <span>Acquisition Requests:</span>
                <strong className="text-[#2D7F9F]">Active Review</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#2D7F9F] relative z-10">
            <span>View Loans & Records</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

      </motion.div>

    </div>
  );
};
