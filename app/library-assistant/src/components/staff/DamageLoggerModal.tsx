import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookItem, DamageCondition, DamageActionStatus } from '../../types/library';
import { X, AlertTriangle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DamageLoggerModalProps {
  initialBook?: BookItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DamageLoggerModal: React.FC<DamageLoggerModalProps> = ({
  initialBook,
  isOpen,
  onClose,
}) => {
  const { books, logDamage, currentUser } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>(initialBook?.id || (books[0]?.id || ''));
  const [condition, setCondition] = useState<DamageCondition>('torn_pages');
  const [description, setDescription] = useState('');
  const [fineAssessed, setFineAssessed] = useState('');
  const [actionStatus, setActionStatus] = useState<DamageActionStatus>('under_repair');
  const [actionTaken, setActionTaken] = useState('');

  if (!isOpen) return null;

  const targetBook = books.find((b) => b.id === selectedBookId) || books[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBook) return;

    logDamage({
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      collection: targetBook.collection,
      condition,
      description,
      reportedBy: currentUser?.name || 'Mrs. Eleanor Vance',
      fineAssessed: fineAssessed || undefined,
      status: actionStatus,
      actionTaken: actionTaken || 'Sent to library preservation tech bench.',
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
              <div className="p-2.5 rounded-xl bg-[#DC2626]/20 text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Log Damaged or Lost Book
                </h3>
                <p className="text-xs text-white/70">
                  Record torn pages, water spills, spine fractures or lost inventory
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
                Select Book *
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547] cursor-pointer"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.location.callNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Condition / Damage Type *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as DamageCondition)}
                  className="w-full text-xs font-bold px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  <option value="torn_pages">Torn / Ripped Pages</option>
                  <option value="water_damaged">Water / Liquid Spill</option>
                  <option value="spine_broken">Broken Spine / Loose Binding</option>
                  <option value="minor_wear">Heavy Wear / Scribbles</option>
                  <option value="lost">Lost / Unreturned Copy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Preservation Status *
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as DamageActionStatus)}
                  className="w-full text-xs font-bold px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  <option value="under_repair">Under Mending / Repair</option>
                  <option value="rebound">Rebound & Restored</option>
                  <option value="written_off">Written Off (Discarded)</option>
                  <option value="replaced">Replaced with New Copy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Incident Description *
              </label>
              <textarea
                rows={3}
                placeholder="Details on affected page numbers, borrower involved, nature of physical wear..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Fine / Repair Fee (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $10.00 (Binding Fee)"
                  value={fineAssessed}
                  onChange={(e) => setFineAssessed(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Action Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mended with archival tape"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#DC2626]/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Log Damage Record</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
