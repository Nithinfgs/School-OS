import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem, BreakageStatus } from '../../types/lab';
import { X, AlertOctagon, Wrench } from 'lucide-react';

interface BreakageLoggerModalProps {
  initialItem?: LabItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BreakageLoggerModal: React.FC<BreakageLoggerModalProps> = ({
  initialItem,
  isOpen,
  onClose,
}) => {
  const { items, logBreakage } = useLab();

  const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || items[0]?.id || '');
  const [quantityBroken, setQuantityBroken] = useState<number>(1);
  const [incidentDetails, setIncidentDetails] = useState<string>('Accidentally cracked during practical experiment.');
  const [reportedBy, setReportedBy] = useState<string>('Grade 11 Practical Batch');
  const [status, setStatus] = useState<BreakageStatus>('written-off');
  const [estimatedCost, setEstimatedCost] = useState<string>('$15.00');
  const [actionTaken, setActionTaken] = useState<string>('Safely disposed into broken glass bin. Replacement needed.');
  const [deductStock, setDeductStock] = useState<boolean>(true);

  React.useEffect(() => {
    if (initialItem) {
      setSelectedItemId(initialItem.id);
    }
  }, [initialItem]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantityBroken <= 0) return;

    const success = logBreakage({
      itemId: selectedItemId,
      quantityBroken: Number(quantityBroken),
      incidentDetails: incidentDetails.trim(),
      reportedBy: reportedBy.trim(),
      status,
      estimatedCost: estimatedCost.trim() || undefined,
      actionTaken: actionTaken.trim(),
      deductStock,
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
            <div className="w-10 h-10 rounded-xl bg-[#FAF1F0] border border-[#A65D57]/30 text-[#A65D57] flex items-center justify-center shadow-xs">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F3547]">
                Log Broken / Damaged Equipment
              </h2>
              <p className="text-xs text-[#61728A]">
                Record breakages, repair needs, and write-offs with audit tracking.
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
          
          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Select Broken / Damaged Apparatus *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 font-semibold text-[#1F3547] cursor-pointer"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.labType.toUpperCase()}] {item.name} ({item.quantity} {item.unit} available)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Quantity Damaged *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityBroken}
                  onChange={(e) => setQuantityBroken(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#61728A]">
                  {currentItem?.unit || 'pcs'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Current Condition / Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BreakageStatus)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="written-off">Written Off / Disposed</option>
                <option value="under-repair">Under Repair (Technician)</option>
                <option value="damaged">Damaged (Minor defect)</option>
                <option value="replaced">Replaced</option>
              </select>
            </div>
          </div>

          {/* Incident Details */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Incident Cause & Description *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g., Dropped on tile floor during optics focal length test."
              value={incidentDetails}
              onChange={(e) => setIncidentDetails(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
            />
          </div>

          {/* Reported by and Estimated Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Reported By (Class/Teacher) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Grade 11 - Section B"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Estimated Replacement Cost
              </label>
              <input
                type="text"
                placeholder="e.g., $20.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Action Taken / Disposal Status *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Placed in glass disposal unit; supplier contacted for spare."
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
            />
          </div>

          {/* Deduct checkbox */}
          <div className="flex items-center gap-2 p-3 bg-[#FAF1F0] border border-[#A65D57]/30 rounded-xl">
            <input
              type="checkbox"
              id="deductStock"
              checked={deductStock}
              onChange={(e) => setDeductStock(e.target.checked)}
              className="rounded text-[#A65D57] focus:ring-[#A65D57] cursor-pointer"
            />
            <label htmlFor="deductStock" className="text-xs text-[#1F3547] font-semibold cursor-pointer">
              Automatically subtract {quantityBroken} {currentItem?.unit || 'units'} from active stock inventory
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DBE4EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#61728A] hover:text-[#1F3547] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-[#A65D57] hover:bg-[#8F4E48] text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Log Equipment Damage
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
