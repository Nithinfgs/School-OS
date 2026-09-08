import React, { useState } from 'react';
import { BookItem } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from './Badge';
import { 
  X, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Hash, 
  Building2, 
  Layers, 
  Star, 
  CheckCircle2, 
  Hourglass, 
  ShoppingBag,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookDetailModalProps {
  book: BookItem | null;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { addToCart, borrowBookDirect, joinWaitlist, waitlist, userRole, addToast } = useLibrary();
  const [borrowDuration, setBorrowDuration] = useState<number>(14);

  if (!book) return null;

  const isOutOfStock = book.availableCopies <= 0;
  const activeWaitlistForBook = waitlist.filter((w) => w.bookId === book.id && w.status === 'waiting');

  const handleShare = () => {
    navigator.clipboard?.writeText(`${book.title} by ${book.author} (Call #: ${book.location.callNumber})`);
    addToast({
      type: 'info',
      title: 'Copied Call Number',
      message: `"${book.title}" location details copied to clipboard.`
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div 
            className="p-6 text-white relative overflow-hidden"
            style={{ backgroundColor: book.coverColor || '#253B53' }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>

              <div>
                {book.seriesName && (
                  <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-md w-fit mb-1">
                    <Layers className="w-3 h-3" />
                    <span>{book.seriesName} {book.seriesVolume ? `• Part ${book.seriesVolume}` : ''}</span>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  {book.title}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  By <span className="font-semibold text-white">{book.author}</span>
                  {book.coAuthors && ` with ${book.coAuthors.join(', ')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Quick Badges & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={book.collection === 'academic' ? 'academic' : 'fiction'}>
                  {book.category}
                </Badge>
                {book.readingLevel && (
                  <Badge variant="neutral">
                    {book.readingLevel}
                  </Badge>
                )}
                {book.edition && (
                  <span className="text-xs font-semibold bg-[#F8FAFC] text-[#475569] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                    {book.edition}
                  </span>
                )}
              </div>

              {book.rating && (
                <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-bold border border-[#FDE68A]">
                  <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                  <span>{book.rating} / 5.0</span>
                  <span className="text-[10px] text-[#B45309]">({book.totalBorrowsCount} total reads)</span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                Synopsis & Description
              </h4>
              <p className="text-sm text-[#334155] leading-relaxed">
                {book.synopsis}
              </p>
            </div>

            {/* Location & Shelf Finder Card */}
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#2D7F9F]/10 text-[#2D7F9F] mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase text-[#475569]">
                    Library Shelf Location
                  </h5>
                  <p className="text-sm font-extrabold text-[#1F3547] mt-0.5">
                    {book.location.floor} • {book.location.wing}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {book.location.aisle} • {book.location.shelf}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                  Call Number
                </span>
                <span className="font-mono text-xs font-bold text-[#1F3547]">
                  {book.location.callNumber}
                </span>
              </div>
            </div>

            {/* Publication & Catalog Specs Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                Book Metadata & Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Publisher</span>
                  </div>
                  <p className="text-xs font-bold text-[#1F3547] truncate">
                    {book.publisher}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </div>
                  <p className="text-xs font-bold text-[#1F3547]">
                    {book.publishedYear}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span>ISBN</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#1F3547] truncate">
                    {book.isbn}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Page Count</span>
                  </div>
                  <p className="text-xs font-bold text-[#1F3547]">
                    {book.pageCount} pages
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Available Copies</span>
                  </div>
                  <p className="text-xs font-bold text-[#1F3547]">
                    {book.availableCopies} of {book.totalCopies}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>Waitlist Queue</span>
                  </div>
                  <p className="text-xs font-bold text-[#1F3547]">
                    {activeWaitlistForBook.length} students waiting
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Keywords & Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-[#F1F5F9] text-[#475569] px-2.5 py-1 rounded-lg border border-[#E2E8F0]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Controls */}
          <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#1F3547] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Call Info</span>
            </button>

            {userRole === 'student' ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isOutOfStock ? (
                  <button
                    onClick={() => {
                      joinWaitlist(book);
                      onClose();
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#B45309]/20 transition-all cursor-pointer"
                  >
                    <Hourglass className="w-4 h-4" />
                    <span>Join Waitlist ({activeWaitlistForBook.length} in queue)</span>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2">
                      <span className="text-xs text-[#64748B]">Duration:</span>
                      <select
                        value={borrowDuration}
                        onChange={(e) => setBorrowDuration(Number(e.target.value))}
                        className="text-xs font-bold text-[#1F3547] bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days (Standard)</option>
                        <option value={21}>21 Days</option>
                        <option value={30}>30 Days (Extended)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(book, borrowDuration);
                        onClose();
                      }}
                      className="p-2.5 bg-white hover:bg-[#E2E8F0] text-[#334155] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
                      title="Add to Borrow Bag"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#2D7F9F]" />
                    </button>

                    <button
                      onClick={() => {
                        borrowBookDirect(book, borrowDuration);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#2D7F9F]/20 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Borrow Book</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-xs font-medium text-[#64748B]">
                Staff mode active. Manage copies in Inventory tab.
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
