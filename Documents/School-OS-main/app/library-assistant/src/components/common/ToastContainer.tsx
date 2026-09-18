import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#2D7F9F]" />,
    error: <AlertCircle className="w-5 h-5 text-[#DC2626]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#D97706]" />,
    info: <Info className="w-5 h-5 text-[#2563EB]" />,
  };

  const borders = {
    success: 'border-l-4 border-l-[#2D7F9F]',
    error: 'border-l-4 border-l-[#DC2626]',
    warning: 'border-l-4 border-l-[#D97706]',
    info: 'border-l-4 border-l-[#2563EB]',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 flex items-start gap-3 ${borders[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 pr-2">
              <h4 className="text-xs font-bold text-[#253B53] leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#94A3B8] hover:text-[#475569] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
