import React from 'react';
import { useLab } from '../../context/LabContext';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const FloatingCartButton: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, currentUser } = useLab();

  if (currentUser?.role !== 'student') return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-[#253B53] hover:bg-[#1F3547] text-white rounded-2xl shadow-xl shadow-[#253B53]/25 border border-[#4C6073]/40 transition-all cursor-pointer"
        title="Open Requisition Cart"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-white" />
          
          {cart.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#2D7F9F] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-[#253B53] shadow-xs"
            >
              {cart.length}
            </motion.span>
          )}
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold leading-tight text-white">
            Requisition Cart
          </p>
          <p className="text-[10px] text-[#DBE4EA] leading-tight">
            {cart.length === 0 ? 'Empty' : `${cart.length} materials selected`}
          </p>
        </div>
      </motion.button>
    </div>
  );
};
