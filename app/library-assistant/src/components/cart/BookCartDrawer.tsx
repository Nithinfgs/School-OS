import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  X, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookCartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateCartDuration, 
    clearCart, 
    submitCartBorrowRequest,
    currentUser 
  } = useLibrary();

  const [checkoutNotes, setCheckoutNotes] = useState('');

  if (!isCartOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCartBorrowRequest(checkoutNotes);
    setCheckoutNotes('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 bg-[#253B53] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10">
                  <BookOpen className="w-5 h-5 text-[#2D7F9F]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Borrow Bag Checkout
                  </h3>
                  <p className="text-xs text-white/70">
                    {cart.length} book{cart.length !== 1 ? 's' : ''} queued for loan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#64748B]">
                  <BookOpen className="w-12 h-12 text-[#CBD5E1] mb-3" />
                  <h4 className="text-sm font-bold text-[#253B53]">Your Borrow Bag is Empty</h4>
                  <p className="text-xs text-[#94A3B8] max-w-xs mt-1">
                    Browse Academic texts or Fiction sagas and click "+ Add to Bag" or "Borrow Now".
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Selected Titles
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {cart.map(({ book, borrowDurationDays }) => (
                    <div
                      key={book.id}
                      className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]"
                            style={{ backgroundColor: book.coverColor || '#253B53' }}
                          >
                            {book.collection === 'academic' ? (
                              <GraduationCap className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[#1F3547] line-clamp-1">
                              {book.title}
                            </h4>
                            <p className="text-[11px] text-[#64748B]">
                              {book.author}
                            </p>
                            <span className="text-[10px] font-mono text-[#94A3B8]">
                              {book.location.callNumber}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(book.id)}
                          className="text-[#94A3B8] hover:text-[#DC2626] p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove from bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Borrow Duration Selector per item */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]/60 text-xs">
                        <div className="flex items-center gap-1.5 text-[#64748B]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Loan Duration:</span>
                        </div>
                        <select
                          value={borrowDurationDays}
                          onChange={(e) => updateCartDuration(book.id, Number(e.target.value))}
                          className="text-xs font-bold text-[#1F3547] bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value={7}>7 Days</option>
                          <option value={14}>14 Days (Standard)</option>
                          <option value={21}>21 Days</option>
                          <option value={30}>30 Days</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Drawer Footer & Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleSubmit} className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Course / Reading Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IB Chem IA research, Pleasure reading..."
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547]"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
                  <div className="flex justify-between">
                    <span>Borrower:</span>
                    <strong className="text-[#1F3547]">{currentUser?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Class / Grade:</span>
                    <strong className="text-[#1F3547]">{currentUser?.grade}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#2D7F9F]/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Check Out {cart.length} Book{cart.length !== 1 ? 's' : ''}</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
