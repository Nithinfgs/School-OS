import React from 'react';
import { LabItem } from '../../types/lab';
import { LabBadge, HazardBadge, StockBadge } from './Badge';
import { MapPin, Eye, FlaskConical, Atom, Dna, Plus, Check } from 'lucide-react';
import { useLab } from '../../context/LabContext';

interface ItemCardProps {
  item: LabItem;
  onSelect: (item: LabItem) => void;
  onRequestThisItem?: (item: LabItem) => void;
  onLogUsageThisItem?: (item: LabItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onLogUsageThisItem,
}) => {
  const { userRole, addToCart, cart } = useLab();

  const labIcons = {
    chemistry: <FlaskConical className="w-4 h-4 text-[#2D7F9F]" />,
    physics: <Atom className="w-4 h-4 text-[#4C6073]" />,
    biology: <Dna className="w-4 h-4 text-[#2D7F9F]" />,
  };

  const labBg = {
    chemistry: 'bg-[#E9F3F6] border-[#2D7F9F]/30 text-[#2D7F9F]',
    physics: 'bg-[#EDF2F5] border-[#4C6073]/30 text-[#4C6073]',
    biology: 'bg-[#EEF6F8] border-[#2D7F9F]/30 text-[#2D7F9F]',
  };

  const inCart = cart.find((ci) => ci.item.id === item.id);

  return (
    <div 
      onClick={() => onSelect(item)}
      className="group bg-white border border-[#DBE4EA] hover:border-[#2D7F9F]/60 rounded-2xl p-5 shadow-[0_1px_3px_rgba(31,41,51,0.02)] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Header: Lab Tag, Category & Hazard */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`p-1.5 rounded-lg border ${labBg[item.labType]}`}>
              {labIcons[item.labType]}
            </div>
            <span className="text-xs font-bold text-[#1F3547] capitalize">
              {item.labType} Lab
            </span>
          </div>
          <HazardBadge level={item.hazardLevel} size="sm" />
        </div>

        {/* Title & Formula */}
        <div className="space-y-1 mb-2.5">
          <h3 className="font-bold text-base text-[#1F3547] leading-snug group-hover:text-[#2D7F9F] transition-colors">
            {item.name}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {item.chemicalFormula && (
              <span className="text-xs font-mono font-medium text-[#2D7F9F] bg-[#E9F3F6] px-2 py-0.5 rounded-md border border-[#2D7F9F]/30">
                {item.chemicalFormula}
              </span>
            )}
            <span className="text-[11px] font-medium text-[#4C6073] bg-[#F7F9FB] px-2 py-0.5 rounded-md border border-[#DBE4EA]">
              {item.category}
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#61728A] line-clamp-3 leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      {/* Footer Info: Location & Stock status */}
      <div className="pt-3.5 border-t border-[#DBE4EA]/80 space-y-3">
        
        {/* Storage Location tag */}
        <div className="flex items-center text-xs text-[#61728A] gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#4C6073] flex-shrink-0" />
          <span className="truncate">
            <strong className="text-[#1F3547] font-semibold">{item.location.room}</strong> • {item.location.cabinet} ({item.location.shelf})
          </span>
        </div>

        {/* Stock & Action Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <StockBadge 
            quantity={item.quantity} 
            minThreshold={item.minThreshold} 
            unit={item.unit} 
          />

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {userRole === 'student' ? (
              <button
                type="button"
                onClick={() => addToCart(item, 1)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  inCart
                    ? 'bg-[#2D7F9F] text-white hover:bg-[#236F91]'
                    : 'bg-[#2D7F9F] text-white hover:bg-[#236F91]'
                }`}
                title="Add to Requisition Cart"
              >
                {inCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>In Cart ({inCart.quantityRequested})</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLogUsageThisItem && onLogUsageThisItem(item)}
                className="px-3 py-1.5 text-xs font-semibold text-[#1F3547] hover:bg-[#DBE4EA] bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl transition-colors"
                title="Log practical consumption"
              >
                Log Use
              </button>
            )}
            
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="p-1.5 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-[#F7F9FB] transition-colors"
              title="View full specs"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
