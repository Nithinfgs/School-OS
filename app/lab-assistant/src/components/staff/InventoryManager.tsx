import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem } from '../../types/lab';
import { LabBadge, HazardBadge, StockBadge } from '../common/Badge';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ClipboardList, 
  MapPin, 
  AlertTriangle, 
  PackagePlus,
  FlaskConical,
  Atom,
  Dna
} from 'lucide-react';

interface InventoryManagerProps {
  onAddNewItem: () => void;
  onEditItem: (item: LabItem) => void;
  onLogUsageItem: (item: LabItem) => void;
  onSelectItem: (item: LabItem) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  onAddNewItem,
  onEditItem,
  onLogUsageItem,
  onSelectItem,
}) => {
  const { items, selectedLab, updateItem, deleteItem, addToast } = useLab();
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);

  const filtered = items.filter((item) => {
    if (selectedLab !== 'all' && item.labType !== selectedLab) return false;
    if (filterLowStock && item.quantity > item.minThreshold) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.chemicalFormula?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        `${item.location.room} ${item.location.cabinet} ${item.location.shelf}`.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRestock = (item: LabItem) => {
    if (restockAmount <= 0) return;
    const newQty = item.quantity + Number(restockAmount);
    updateItem(item.id, { quantity: newQty });
    setRestockItemId(null);
    setRestockAmount(50);
    addToast({
      type: 'success',
      title: 'Stock Replenished',
      message: `Added ${restockAmount} ${item.unit} to ${item.name}. New total: ${newQty} ${item.unit}.`
    });
  };

  const labIcons = {
    chemistry: <FlaskConical className="w-4 h-4 text-[#2D7F9F]" />,
    physics: <Atom className="w-4 h-4 text-[#4C6073]" />,
    biology: <Dna className="w-4 h-4 text-[#2D7F9F]" />,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Search Controls */}
      <div className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1F3547]">
        <div>
          <h2 className="text-xl font-bold text-[#1F3547]">
            Laboratory Inventory Master List
          </h2>
          <p className="text-xs text-[#61728A] mt-1">
            Manage chemicals, apparatus, exact shelf locations, safety classifications, and restock supplies.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Low stock toggle */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              filterLowStock
                ? 'bg-[#B58B4E] text-white border-[#B58B4E] shadow-xs'
                : 'bg-[#F7F9FB] text-[#1F3547] border-[#DBE4EA] hover:bg-[#DBE4EA]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Filter</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#61728A]" />
            <input
              type="text"
              placeholder="Search inventory & shelf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
            />
          </div>

          {/* Add New Item Button */}
          <button
            onClick={onAddNewItem}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Material</span>
          </button>
        </div>
      </div>

      {/* Table of items */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[#61728A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">No matching lab materials</h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1 mb-4">
            No items matched your query or selected lab filters.
          </p>
          <button
            onClick={onAddNewItem}
            className="px-4 py-2 text-xs font-bold bg-[#2D7F9F] text-white rounded-xl shadow-xs hover:bg-[#236F91] cursor-pointer"
          >
            Add New Lab Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#DBE4EA] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1F3547]">
              <thead className="bg-[#F7F9FB] border-b border-[#DBE4EA] text-[11px] font-bold uppercase tracking-wider text-[#61728A]">
                <tr>
                  <th className="px-5 py-3.5">Material / Chemical</th>
                  <th className="px-4 py-3.5">Lab & Category</th>
                  <th className="px-4 py-3.5">Storage Location</th>
                  <th className="px-4 py-3.5">Current Stock</th>
                  <th className="px-4 py-3.5">Hazard Safety</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE4EA]/60 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                    
                    {/* Item Name & Formula */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#F7F9FB] border border-[#DBE4EA] flex-shrink-0 mt-0.5">
                          {labIcons[item.labType]}
                        </div>
                        <div className="space-y-0.5">
                          <button
                            onClick={() => onSelectItem(item)}
                            className="font-bold text-[#1F3547] text-sm hover:text-[#2D7F9F] transition-colors text-left cursor-pointer"
                          >
                            {item.name}
                          </button>
                          {item.chemicalFormula && (
                            <p className="text-[11px] font-mono font-medium text-[#2D7F9F]">
                              {item.chemicalFormula}
                            </p>
                          )}
                          <p className="text-[11px] text-[#61728A] font-mono">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Lab & Category */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <LabBadge labType={item.labType} size="sm" />
                        <span className="text-[11px] text-[#61728A] font-medium">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Storage Location */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5 text-[#1F3547]">
                        <p className="font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#4C6073]" />
                          {item.location.room}
                        </p>
                        <p className="text-[11px] text-[#61728A]">
                          {item.location.cabinet} • <span className="font-medium text-[#1F3547]">{item.location.shelf}</span>
                        </p>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <StockBadge
                          quantity={item.quantity}
                          minThreshold={item.minThreshold}
                          unit={item.unit}
                        />
                        <p className="text-[10px] text-[#61728A]">
                          Min Alert: {item.minThreshold} {item.unit}
                        </p>
                      </div>
                    </td>

                    {/* Hazard */}
                    <td className="px-4 py-4">
                      <HazardBadge level={item.hazardLevel} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Restock Action */}
                        {restockItemId === item.id ? (
                          <div className="flex items-center gap-1 bg-[#F7F9FB] p-1 rounded-xl border border-[#DBE4EA]">
                            <input
                              type="number"
                              min="1"
                              value={restockAmount}
                              onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-white border border-[#DBE4EA] rounded-lg text-center font-bold"
                              placeholder="+Qty"
                            />
                            <button
                              onClick={() => handleRestock(item)}
                              className="px-2 py-1 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setRestockItemId(null)}
                              className="px-1 text-xs text-[#61728A] hover:text-[#1F3547] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRestockItemId(item.id)}
                            className="p-1.5 text-[#61728A] hover:text-[#2D7F9F] hover:bg-[#EEF6F8] rounded-lg transition-colors cursor-pointer"
                            title="Restock this item"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Log Usage */}
                        <button
                          onClick={() => onLogUsageItem(item)}
                          className="p-1.5 text-[#61728A] hover:text-[#1F3547] hover:bg-[#F7F9FB] rounded-lg transition-colors cursor-pointer"
                          title="Log practical usage"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>

                        {/* Edit item */}
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-[#61728A] hover:text-[#2D7F9F] hover:bg-[#E9F3F6] rounded-lg transition-colors cursor-pointer"
                          title="Edit specifications"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete item */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${item.name}" from inventory?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-[#61728A] hover:text-[#A65D57] hover:bg-[#FAF1F0] rounded-lg transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
