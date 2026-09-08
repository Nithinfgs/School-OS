import React from 'react';
import { useLab } from '../../context/LabContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLab();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            error: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
          };

          const borderColors = {
            success: 'border-emerald-200 bg-white/95 text-slate-800',
            warning: 'border-amber-200 bg-white/95 text-slate-800',
            error: 'border-rose-200 bg-white/95 text-slate-800',
            info: 'border-blue-200 bg-white/95 text-slate-800',
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${borderColors[toast.type]}`}
            >
              <div className="mt-0.5">{icons[toast.type]}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
