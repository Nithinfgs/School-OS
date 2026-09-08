import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { X, Plus, BookPlus, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestBookPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBookPurchaseModal: React.FC<RequestBookPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createPurchaseRequest, currentUser } = useLibrary();

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [subjectGenre, setSubjectGenre] = useState('Physics');
  const [isbn, setIsbn] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [reasonForPurchase, setReasonForPurchase] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high'>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !author.trim()) return;

    createPurchaseRequest({
      studentName: currentUser?.name || 'Rohan Verma',
      studentEmail: currentUser?.email || 'rohan.verma@school.edu',
      studentGrade: currentUser?.grade || 'Grade 11 - Section A',
      bookTitle,
      author,
      publisher,
      subjectGenre,
      isbn,
      estimatedPrice,
      reasonForPurchase,
      urgency,
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
              <div className="p-2.5 rounded-xl bg-[#2D7F9F]/20 text-[#2D7F9F]">
                <BookPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Request New Book
                </h3>
                <p className="text-xs text-white/70">
                  Propose academic texts or fiction for the library to add to catalog
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                placeholder="e.g. The House of Hades, IB Math HL Guide..."
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Author *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rick Riordan"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Subject / Category
                </label>
                <select
                  value={subjectGenre}
                  onChange={(e) => setSubjectGenre(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="IB DP & AP Guides">IB DP & AP Guides</option>
                  <option value="Fantasy & Mythology">Fantasy & Mythology (Percy Jackson/Sagas)</option>
                  <option value="Sci-Fi & Dystopian">Sci-Fi & Dystopian</option>
                  <option value="Classics & World Literature">Classics & World Literature</option>
                  <option value="Young Adult & Contemporary">Young Adult</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Publisher (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge, Disney-Hyperion"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  ISBN / Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 978-0141036144"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Why Should the Library Add This Book? *
              </label>
              <textarea
                rows={3}
                placeholder="Explain academic requirement, course syllabus reference, continuation of a popular series, or club project..."
                value={reasonForPurchase}
                onChange={(e) => setReasonForPurchase(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Estimated Price (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $14.99"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Urgency / Need Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  <option value="low">Low (General Recommendation)</option>
                  <option value="normal">Normal (Next Term Requirement)</option>
                  <option value="high">High (Immediate IA / Exam Prep)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#2D7F9F]/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Book Request</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
