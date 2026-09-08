import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem, LabType, UnitType } from '../../types/lab';
import { X, Send, Sparkles } from 'lucide-react';

interface RequestItemModalProps {
  initialItem?: LabItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestItemModal: React.FC<RequestItemModalProps> = ({
  initialItem,
  isOpen,
  onClose,
}) => {
  const { createRequest, currentUser, selectedLabPortal } = useLab();

  const [itemName, setItemName] = useState('');
  const [labType, setLabType] = useState<LabType>(selectedLabPortal || 'chemistry');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('pcs');
  const [experimentPurpose, setExperimentPurpose] = useState('');
  const [dateNeeded, setDateNeeded] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high'>('normal');

  useEffect(() => {
    if (initialItem) {
      setItemName(initialItem.name);
      setLabType(initialItem.labType);
      setUnit(initialItem.unit);
      setQuantity(1);
    } else {
      setItemName('');
      setLabType(selectedLabPortal || 'chemistry');
      setUnit('pcs');
      setQuantity(1);
    }
  }, [initialItem, isOpen, selectedLabPortal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !experimentPurpose.trim()) return;

    createRequest({
      studentName: currentUser?.name || 'Student',
      studentEmail: currentUser?.email || 'student@school.edu',
      studentGrade: currentUser?.grade || 'Student',
      itemName: itemName.trim(),
      itemId: initialItem?.id,
      labType,
      quantityRequested: Number(quantity),
      unit,
      experimentPurpose: experimentPurpose.trim(),
      dateNeeded,
      urgency,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#DBE4EA] overflow-hidden font-sans text-[#1F3547]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9F3F6] border border-[#2D7F9F]/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-[#2D7F9F]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F3547]">
                Submit Material Requisition
              </h2>
              <p className="text-xs text-[#61728A]">
                Request lab equipment or reagents for your practical experiment.
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
          
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Material or Chemical Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Sodium Hydroxide pellets or Concave Lens"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-medium text-[#1F3547]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Lab Department *
              </label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as LabType)}
                className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="chemistry">Chemistry Lab</option>
                <option value="physics">Physics Lab</option>
                <option value="biology">Biology Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Quantity & Unit *
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-20 px-2 py-2 text-xs font-bold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl text-center text-[#1F3547]"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="flex-1 px-2 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl text-[#1F3547] font-medium cursor-pointer"
                >
                  <option value="g">g</option>
                  <option value="mL">mL</option>
                  <option value="pcs">pcs</option>
                  <option value="sets">sets</option>
                  <option value="bottles">bottles</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
              Experiment Purpose / Topic *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Acid-Base Titration Practical for Board Exam"
              value={experimentPurpose}
              onChange={(e) => setExperimentPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-medium text-[#1F3547]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Required By Date *
              </label>
              <input
                type="date"
                required
                value={dateNeeded}
                onChange={(e) => setDateNeeded(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1.5">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="high">Urgent (Tomorrow)</option>
                <option value="low">Low (Next Week)</option>
              </select>
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Lab Assistant</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
