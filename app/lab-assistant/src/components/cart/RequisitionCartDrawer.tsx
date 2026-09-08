import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabBadge } from '../common/Badge';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const RequisitionCartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    submitCartRequisition
  } = useLab();

  const [experimentPurpose, setExperimentPurpose] = useState('');
  const [dateNeeded, setDateNeeded] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high'>('normal');

  if (!isCartOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experimentPurpose.trim()) return;

    const success = submitCartRequisition({
      experimentPurpose: experimentPurpose.trim(),
      dateNeeded,
      urgency,
    });

    if (success) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
      setExperimentPurpose('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#253B53]/40 backdrop-blur-xs animate-in fade-in">
      
      {/* Background click to close */}
      <div 
        className="flex-1"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Box */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#DBE4EA] flex flex-col justify-between overflow-hidden text-[#1F3547]"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#253B53] text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5 text-[#2D7F9F]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F3547]">
                Requisition Cart
              </h2>
              <p className="text-xs text-[#61728A]">
                {cart.length} {cart.length === 1 ? 'material' : 'materials'} ready for requisition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-[#61728A] hover:text-[#A65D57] transition-colors p-2 cursor-pointer"
                title="Clear all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-[#F7F9FB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-[#F7F9FB] border border-[#DBE4EA] flex items-center justify-center text-[#61728A] mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#1F3547]">Your cart is empty</h3>
              <p className="text-xs text-[#61728A] max-w-xs mt-1 mb-6">
                Browse through Chemistry, Physics, or Biology catalogs and click <strong>"+ Add to Cart"</strong> on items you need.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 text-xs font-bold bg-[#253B53] hover:bg-[#1F3547] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Browse Lab Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.item.id}
                  className="bg-[#F7F9FB] border border-[#DBE4EA] rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <LabBadge labType={cartItem.item.labType} size="sm" />
                      {cartItem.item.chemicalFormula && (
                        <span className="text-[10px] font-mono text-[#2D7F9F] bg-[#E9F3F6] px-1.5 py-0.5 rounded border border-[#2D7F9F]/30">
                          {cartItem.item.chemicalFormula}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#1F3547] truncate">
                      {cartItem.item.name}
                    </h4>
                    <p className="text-[11px] text-[#61728A]">
                      Location: {cartItem.item.location.room} • {cartItem.item.location.cabinet}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center bg-white border border-[#DBE4EA] rounded-xl p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantityRequested - 1)}
                        className="p-1 text-[#61728A] hover:text-[#1F3547] hover:bg-[#F7F9FB] rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-12 text-center text-xs font-bold font-mono text-[#1F3547]">
                        {cartItem.quantityRequested} {cartItem.unit}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantityRequested + 1)}
                        className="p-1 text-[#61728A] hover:text-[#1F3547] hover:bg-[#F7F9FB] rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="p-2 text-[#61728A] hover:text-[#A65D57] rounded-lg transition-colors cursor-pointer"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Form */}
        {cart.length > 0 && (
          <form onSubmit={handleSubmit} className="p-6 bg-[#F7F9FB] border-t border-[#DBE4EA] space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Experiment Title / Purpose of Practical *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Grade 11 Term 2 Titration & Snell's Law Experiment"
                value={experimentPurpose}
                onChange={(e) => setExperimentPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] font-medium text-[#1F3547]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">
                  Required By Date *
                </label>
                <input
                  type="date"
                  required
                  value={dateNeeded}
                  onChange={(e) => setDateNeeded(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium"
                >
                  <option value="normal">Normal</option>
                  <option value="high">Urgent (Tomorrow)</option>
                  <option value="low">Low (Next Week)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Requisition ({cart.length} items)</span>
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
};
