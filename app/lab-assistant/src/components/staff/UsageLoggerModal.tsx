import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem } from '../../types/lab';
import { X, ClipboardList, AlertTriangle } from 'lucide-react';

interface UsageLoggerModalProps {
  initialItem: LabItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UsageLoggerModal: React.FC<UsageLoggerModalProps> = ({
  initialItem,
  isOpen,
  onClose,
}) => {
  const { items, logUsage, currentUser } = useLab();

  const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || items[0]?.id || '');
  const [quantityUsed, setQuantityUsed] = useState<number>(10);
  const [experimentName, setExperimentName] = useState<string>('Redox Titration Practical');
  const [conductedBy, setConductedBy] = useState<string>('Grade 11 - Section A');
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (initialItem) {
      setSelectedItemId(initialItem.id);
    }
  }, [initialItem]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantityUsed <= 0) return;

    const success = logUsage({
      itemId: selectedItemId,
      quantityUsed: Number(quantityUsed),
      experimentName: experimentName.trim(),
      conductedBy: conductedBy.trim(),
      notes: notes.trim() || undefined,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#DBE4EA] overflow-hidden font-sans text-[#1F3547]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#253B53] text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-5 h-5 text-[#2D7F9F]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F3547]">
                Log Practical Material Usage
              </h2>
              <p className="text-xs text-[#61728A]">
                Deducts stock in real-time and logs the practical logbook entry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-[#F7F9FB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Material */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Select Lab Material / Chemical *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-semibold text-[#1F3547] cursor-pointer"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.labType.toUpperCase()}] {item.name} ({item.quantity} {item.unit} in stock)
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {currentItem && (
            <div className="p-3 bg-[#F7F9FB] border border-[#DBE4EA] rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[#61728A]">Location: </span>
                <strong className="text-[#1F3547]">{currentItem.location.room} • {currentItem.location.cabinet}</strong>
              </div>
              <div>
                <span className="text-[#61728A]">Current: </span>
                <strong className="font-mono text-[#2D7F9F] font-bold">{currentItem.quantity} {currentItem.unit}</strong>
              </div>
            </div>
          )}

          {/* Quantity Used */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Quantity Consumed / Used *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#61728A]">
                {currentItem?.unit || 'units'}
              </span>
            </div>
          </div>

          {/* Experiment Name */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Experiment / Practical Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Determination of Refractive Index of Glass Slab"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-medium text-[#1F3547]"
            />
          </div>

          {/* Conducted by */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Conducted By (Class / Batch / Teacher) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Grade 12 - Section B or Mr. Sharma"
              value={conductedBy}
              onChange={(e) => setConductedBy(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-medium text-[#1F3547]"
            />
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Additional Notes / Observations (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., 2 mL spilled during burette loading, residue cleaned."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DBE4EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#61728A] hover:text-[#1F3547] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Log & Deduct Stock
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
