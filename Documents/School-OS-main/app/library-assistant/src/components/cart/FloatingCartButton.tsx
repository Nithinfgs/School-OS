import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingCartButton: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, userRole, page } = useLibrary();

  if (userRole !== 'student' || isCartOpen || page === 'login') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={() => setIsCartOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-[#253B53] hover:bg-[#1F3547] text-white rounded-full shadow-2xl hover:shadow-[#2D7F9F]/30 transition-all duration-200 cursor-pointer border border-white/10"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#2D7F9F] group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#DC2626] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Borrow Bag</p>
            <p className="text-[10px] text-[#94A3B8] leading-tight">
              {cart.length === 0 ? 'Empty' : `${cart.length} title${cart.length > 1 ? 's' : ''} queued`}
            </p>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
