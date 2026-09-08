import React, { useState } from 'react';
import { LabItem } from '../../types/lab';
import { LabBadge, HazardBadge, StockBadge } from './Badge';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  FlaskConical, 
  Atom, 
  Dna, 
  ShoppingCart,
  Plus,
  Minus,
  ClipboardList,
  Mail,
  Phone,
  Building2,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';
import { useLab } from '../../context/LabContext';

interface ItemDetailModalProps {
  item: LabItem | null;
  onClose: () => void;
  onRequestItem?: (item: LabItem) => void;
  onLogUsage?: (item: LabItem) => void;
  onEditItem?: (item: LabItem) => void;
  onReportBroken?: (item: LabItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onRequestItem,
  onLogUsage,
  onEditItem,
  onReportBroken,
}) => {
  const { userRole, addToCart } = useLab();
  const [requestQty, setRequestQty] = useState(1);

  if (!item) return null;

  const labIcons = {
    chemistry: <FlaskConical className="w-5 h-5 text-[#2D7F9F]" />,
    physics: <Atom className="w-5 h-5 text-[#4C6073]" />,
    biology: <Dna className="w-5 h-5 text-[#2D7F9F]" />,
  };

  const labBg = {
    chemistry: 'bg-[#E9F3F6] border-[#2D7F9F]/30 text-[#2D7F9F]',
    physics: 'bg-[#EDF2F5] border-[#4C6073]/30 text-[#4C6073]',
    biology: 'bg-[#EEF6F8] border-[#2D7F9F]/30 text-[#2D7F9F]',
  };

  const handleAddToCart = () => {
    addToCart(item, requestQty);
    if (onRequestItem) onRequestItem(item);
    onClose();
  };

  const handleEmailSupplier = () => {
    if (!item.supplier?.email) return;
    const subject = encodeURIComponent(`School Science Lab Requisition & Supply Order: ${item.name} (Ref: ${item.id})`);
    const body = encodeURIComponent(
      `Hello ${item.supplier.name || 'Sales Team'},\n\n` +
      `We would like to request a quotation / restock order for our school science laboratories:\n\n` +
      `• Item Name: ${item.name}\n` +
      `• Chemical Formula / Model: ${item.chemicalFormula || 'N/A'}\n` +
      `• Catalog Number: ${item.supplier.catalogNumber || 'N/A'}\n` +
      `• Department: ${item.labType.toUpperCase()} Laboratory\n` +
      `• Current Stock on Hand: ${item.quantity} ${item.unit}\n\n` +
      `Please provide current pricing, package sizes, and delivery timeline to our school address.\n\n` +
      `Thank you,\n` +
      `School Science Laboratory Department`
    );
    window.location.href = `mailto:${item.supplier.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DBE4EA] flex flex-col text-[#1F3547] font-sans">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border ${labBg[item.labType]} flex-shrink-0 mt-0.5`}>
              {labIcons[item.labType]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <LabBadge labType={item.labType} size="sm" />
                <HazardBadge level={item.hazardLevel} size="sm" />
                <span className="text-xs bg-[#F7F9FB] text-[#4C6073] px-2.5 py-0.5 rounded-md font-semibold border border-[#DBE4EA]">
                  {item.category}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F3547]">
                {item.name}
              </h2>
              {item.chemicalFormula && (
                <p className="text-xs font-mono font-medium text-[#2D7F9F] mt-0.5 bg-[#E9F3F6] inline-block px-2 py-0.5 rounded border border-[#2D7F9F]/30">
                  Formula: {item.chemicalFormula}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#61728A] hover:text-[#1F3547] hover:bg-[#F7F9FB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Stock & Storage Location Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F9FB] border border-[#DBE4EA]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#61728A] mb-1">
                Current Inventory Stock
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1F3547] font-mono">
                  {item.quantity}
                </span>
                <span className="text-sm font-medium text-[#4C6073]">
                  {item.unit} available
                </span>
              </div>
              <div className="mt-1.5">
                <StockBadge 
                  quantity={item.quantity} 
                  minThreshold={item.minThreshold} 
                  unit={item.unit} 
                />
              </div>
            </div>

            <div className="sm:border-l sm:border-[#DBE4EA] sm:pl-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#61728A] mb-1">
                Storage Location
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3547]">
                <MapPin className="w-4 h-4 text-[#2D7F9F] flex-shrink-0" />
                <span>{item.location.room}</span>
              </div>
              <p className="text-xs text-[#4C6073] mt-1">
                Cabinet: <strong className="text-[#1F3547]">{item.location.cabinet}</strong> • Shelf: <strong className="text-[#1F3547]">{item.location.shelf}</strong>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#61728A] mb-2">
              Item Overview & Purpose
            </h4>
            <p className="text-sm text-[#1F3547] leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Supplier Contact Info Card */}
          {item.supplier && (
            <div className="p-4 rounded-2xl bg-[#F7F9FB] border border-[#DBE4EA] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2D7F9F]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3547]">
                    Supplier & Restock Contact
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleEmailSupplier}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Supplier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#4C6073] pt-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#61728A]">Company / Vendor</p>
                  <p className="font-semibold text-[#1F3547]">{item.supplier.company || item.supplier.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#61728A]">Supplier Email</p>
                  <p className="font-mono text-[#2D7F9F]">{item.supplier.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#61728A]">Phone / Catalog #</p>
                  <p className="text-[#1F3547]">{item.supplier.phone || item.supplier.catalogNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {item.specifications && item.specifications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#61728A] mb-2">
                Technical Specifications
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.specifications.map((spec, index) => (
                  <li
                    key={index}
                    className="text-xs text-[#1F3547] bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl p-2.5 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D7F9F] flex-shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Precautions & Hazard Notes */}
          <div className="p-4 rounded-2xl bg-[#FBF6EE] border border-[#B58B4E]/30">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[#B58B4E]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B58B4E]">
                Lab Safety & Handling Rules
              </h4>
            </div>
            {item.hazardNotes && (
              <p className="text-xs text-[#1F3547] mb-2 font-medium">
                {item.hazardNotes}
              </p>
            )}
            {item.handlingPrecautions && item.handlingPrecautions.length > 0 && (
              <ul className="space-y-1 text-xs text-[#4C6073] list-disc list-inside font-medium">
                {item.handlingPrecautions.map((precaution, idx) => (
                  <li key={idx}>{precaution}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-[#61728A] pt-2 border-t border-[#DBE4EA]">
            <span>Identifier: <code className="font-mono text-[#1F3547]">{item.id}</code></span>
            {item.lastUsedBy && (
              <span>Recent practical: <strong className="text-[#1F3547]">{item.lastUsedBy}</strong></span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F7F9FB] border-t border-[#DBE4EA] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#61728A] hover:text-[#1F3547] transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {userRole === 'student' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-[#DBE4EA] rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setRequestQty(Math.max(1, requestQty - 1))}
                    className="p-1 text-[#61728A] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold font-mono text-[#1F3547]">
                    {requestQty} {item.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRequestQty(requestQty + 1)}
                    className="p-1 text-[#61728A] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>+ Add to Cart</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onReportBroken && onReportBroken(item);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#FAF1F0] border border-[#A65D57]/30 text-[#A65D57] hover:bg-[#A65D57] hover:text-white rounded-xl transition-all cursor-pointer"
                  title="Report damaged / broken unit"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Report Broken</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onEditItem && onEditItem(item);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-[#DBE4EA] text-[#1F3547] hover:bg-[#F7F9FB] rounded-xl transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
                
                <button
                  onClick={() => {
                    onClose();
                    onLogUsage && onLogUsage(item);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#253B53] text-white hover:bg-[#1F3547] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Log Material Usage</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
