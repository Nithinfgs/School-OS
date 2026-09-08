import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookLoan } from '../../types/library';
import { X, Clock, BookOpen, Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogReadingSessionModalProps {
  initialLoan?: BookLoan | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogReadingSessionModal: React.FC<LogReadingSessionModalProps> = ({
  initialLoan,
  isOpen,
  onClose,
}) => {
  const { loans, books, logReadingSession, currentUser } = useLibrary();

  const activeLoans = loans.filter(
    (l) => l.studentEmail === currentUser?.email && (l.status === 'active' || l.status === 'overdue' || l.status === 'renewed')
  );

  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [minutesRead, setMinutesRead] = useState<number>(30);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(350);
  const [reflections, setReflections] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [completedBook, setCompletedBook] = useState<boolean>(false);

  useEffect(() => {
    if (initialLoan) {
      setSelectedBookId(initialLoan.bookId);
      const matchedBook = books.find((b) => b.id === initialLoan.bookId);
      if (matchedBook) {
        setTotalPages(matchedBook.pageCount);
      }
    } else if (activeLoans.length > 0) {
      setSelectedBookId(activeLoans[0].bookId);
      const matchedBook = books.find((b) => b.id === activeLoans[0].bookId);
      if (matchedBook) {
        setTotalPages(matchedBook.pageCount);
      }
    }
  }, [initialLoan, isOpen]);

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const matched = books.find((b) => b.id === bookId);
    if (matched) {
      setTotalPages(matched.pageCount);
    }
  };

  if (!isOpen) return null;

  const currentBook = books.find((b) => b.id === selectedBookId);
  const currentLoan = activeLoans.find((l) => l.bookId === selectedBookId);
  const bookTitle = currentBook?.title || currentLoan?.bookTitle || 'Selected Book';

  const pagesReadThisSession = Math.max(0, endPage - startPage);
  const percentComplete = Math.min(100, Math.round((endPage / (totalPages || 1)) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    logReadingSession({
      bookId: selectedBookId,
      bookTitle,
      minutesRead,
      startPage,
      endPage,
      totalPages,
      reflections,
      rating,
      completedBook,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-[#253B53] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#B45309]/20 text-[#F59E0B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Log Reading Session
                </h3>
                <p className="text-xs text-white/70">
                  Track reading duration, page milestones & reflections
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Book Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Select Borrowed Book
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => handleBookChange(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 focus:border-[#B45309] text-[#1F3547] cursor-pointer"
              >
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.bookId}>
                    {l.bookTitle} ({l.bookCategory})
                  </option>
                ))}
                {activeLoans.length === 0 && (
                  <option value="">No currently active loans</option>
                )}
              </select>
            </div>

            {/* Minutes Read */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Time Read (Minutes)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="number"
                    min={5}
                    max={600}
                    step={5}
                    value={minutesRead}
                    onChange={(e) => setMinutesRead(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 text-[#1F3547]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Total Book Pages
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalPages}
                  onChange={(e) => setTotalPages(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 text-[#1F3547]"
                  required
                />
              </div>
            </div>

            {/* Page Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Start Page
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={startPage}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  End Page Reached
                </label>
                <input
                  type="number"
                  min={startPage}
                  max={totalPages}
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                  required
                />
              </div>
            </div>

            {/* Live Progress Bar Preview */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#475569]">
                  {pagesReadThisSession} pages read this session
                </span>
                <span className="font-extrabold text-[#B45309]">
                  {percentComplete}% Completed
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#B45309] to-[#F59E0B] rounded-full transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            {/* Notes & Reflections */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Reading Notes & Key Takeaways
              </label>
              <textarea
                rows={3}
                placeholder="What occurred in this chapter? Formulae derived, plot twists, character insights..."
                value={reflections}
                onChange={(e) => setReflections(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 text-[#1F3547]"
              />
            </div>

            {/* Rating & Mark as Completed Checkbox */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#64748B]">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : 'text-[#CBD5E1]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1F3547]">
                <input
                  type="checkbox"
                  checked={completedBook}
                  onChange={(e) => setCompletedBook(e.target.checked)}
                  className="w-4 h-4 text-[#2D7F9F] rounded border-[#CBD5E1] focus:ring-[#2D7F9F]"
                />
                <span>🎉 Finished entire book!</span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!selectedBookId}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#B45309] hover:bg-[#92400E] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#B45309]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Reading Session</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
