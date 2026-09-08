import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem, LabType, Category, HazardLevel, UnitType } from '../../types/lab';
import { X, Plus, Save, Building2 } from 'lucide-react';

interface ItemFormModalProps {
  itemToEdit: LabItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  itemToEdit,
  isOpen,
  onClose,
}) => {
  const { addItem, updateItem } = useLab();

  const [name, setName] = useState('');
  const [chemicalFormula, setChemicalFormula] = useState('');
  const [labType, setLabType] = useState<LabType>('chemistry');
  const [category, setCategory] = useState<Category>('Salts & Reagents');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<UnitType>('g');
  const [minThreshold, setMinThreshold] = useState<number>(20);
  const [room, setRoom] = useState('Chemistry Lab Prep Room');
  const [cabinet, setCabinet] = useState('Cabinet A');
  const [shelf, setShelf] = useState('Shelf 2');
  const [hazardLevel, setHazardLevel] = useState<HazardLevel>('safe');
  const [hazardNotes, setHazardNotes] = useState('');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  // Supplier Info inputs
  const [supplierName, setSupplierName] = useState('Apex Scientific Chemicals Ltd.');
  const [supplierEmail, setSupplierEmail] = useState('orders@apexscientific.com');
  const [supplierPhone, setSupplierPhone] = useState('+1 (800) 555-0143');
  const [catalogNumber, setCatalogNumber] = useState('APX-101');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setChemicalFormula(itemToEdit.chemicalFormula || '');
      setLabType(itemToEdit.labType);
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
      setUnit(itemToEdit.unit);
      setMinThreshold(itemToEdit.minThreshold);
      setRoom(itemToEdit.location.room);
      setCabinet(itemToEdit.location.cabinet);
      setShelf(itemToEdit.location.shelf);
      setHazardLevel(itemToEdit.hazardLevel);
      setHazardNotes(itemToEdit.hazardNotes || '');
      setDescription(itemToEdit.description);
      setSpecsText(itemToEdit.specifications?.join('\n') || '');
      setSupplierName(itemToEdit.supplier?.name || itemToEdit.supplier?.company || '');
      setSupplierEmail(itemToEdit.supplier?.email || '');
      setSupplierPhone(itemToEdit.supplier?.phone || '');
      setCatalogNumber(itemToEdit.supplier?.catalogNumber || '');
    } else {
      setName('');
      setChemicalFormula('');
      setLabType('chemistry');
      setCategory('Salts & Reagents');
      setQuantity(100);
      setUnit('g');
      setMinThreshold(20);
      setRoom('Chemistry Lab Prep Room');
      setCabinet('Cabinet A');
      setShelf('Shelf 1');
      setHazardLevel('safe');
      setHazardNotes('');
      setDescription('');
      setSpecsText('');
      setSupplierName('Apex Scientific Chemicals Ltd.');
      setSupplierEmail('orders@apexscientific.com');
      setSupplierPhone('+1 (800) 555-0143');
      setCatalogNumber('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specs = specsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const supplier = supplierEmail.trim() ? {
      name: supplierName.trim() || 'Vendor',
      company: supplierName.trim() || 'Vendor',
      email: supplierEmail.trim(),
      phone: supplierPhone.trim() || undefined,
      catalogNumber: catalogNumber.trim() || undefined,
    } : undefined;

    if (itemToEdit) {
      updateItem(itemToEdit.id, {
        name: name.trim(),
        chemicalFormula: chemicalFormula.trim() || undefined,
        labType,
        category,
        quantity: Number(quantity),
        unit,
        minThreshold: Number(minThreshold),
        location: { room, cabinet, shelf },
        hazardLevel,
        hazardNotes: hazardNotes.trim() || undefined,
        description: description.trim(),
        specifications: specs,
        supplier,
      });
    } else {
      addItem({
        name: name.trim(),
        chemicalFormula: chemicalFormula.trim() || undefined,
        labType,
        category,
        quantity: Number(quantity),
        unit,
        minThreshold: Number(minThreshold),
        location: { room, cabinet, shelf },
        hazardLevel,
        hazardNotes: hazardNotes.trim() || undefined,
        description: description.trim(),
        specifications: specs,
        supplier,
        isAvailableForStudentRequest: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DBE4EA] flex flex-col font-sans text-[#1F3547]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1F3547]">
              {itemToEdit ? 'Edit Laboratory Item & Supplier' : 'Add New Laboratory Item & Supplier'}
            </h2>
            <p className="text-xs text-[#61728A]">
              {itemToEdit ? 'Modify material specifications, shelf locations, and procurement contacts.' : 'Add new chemical, specimen, or apparatus to the inventory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-[#F7F9FB] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: Name & Formula */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Item / Chemical Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Hydrochloric Acid 1M"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 font-semibold text-[#1F3547]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Formula (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., HCl"
                value={chemicalFormula}
                onChange={(e) => setChemicalFormula(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Row 2: Lab Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Laboratory Department *
              </label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as LabType)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="chemistry">Chemistry Lab</option>
                <option value="physics">Physics Lab</option>
                <option value="biology">Biology Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Acids & Bases, Optics, Stains"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Row 3: Quantity, Unit & Min Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Current Stock Qty *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="L">Liters (L)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="sets">Sets</option>
                <option value="boxes">Boxes</option>
                <option value="vials">Vials</option>
                <option value="bottles">Bottles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Min Stock Alert *
              </label>
              <input
                type="number"
                min="0"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Supplier Section */}
          <div className="p-3.5 bg-[#F7F9FB] border border-[#DBE4EA] rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F3547]">
              <Building2 className="w-4 h-4 text-[#2D7F9F]" />
              <span>Supplier & Procurement Contact (1-Click Reordering)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#61728A] mb-1">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apex Scientific Ltd."
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DBE4EA] rounded-xl text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#61728A] mb-1">
                  Supplier Email (For Direct Reordering)
                </label>
                <input
                  type="email"
                  placeholder="orders@vendor.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DBE4EA] rounded-xl text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#61728A] mb-1">
                  Supplier Phone / Support
                </label>
                <input
                  type="text"
                  placeholder="+1 (800) 555-0100"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DBE4EA] rounded-xl text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#61728A] mb-1">
                  Supplier Catalog / SKU #
                </label>
                <input
                  type="text"
                  placeholder="e.g., APX-HCL-1M"
                  value={catalogNumber}
                  onChange={(e) => setCatalogNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DBE4EA] rounded-xl text-[#1F3547]"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Storage Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Room Location
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Cabinet / Locker
              </label>
              <input
                type="text"
                value={cabinet}
                onChange={(e) => setCabinet(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Shelf Number
              </label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Row 5: Hazard Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Hazard Classification *
              </label>
              <select
                value={hazardLevel}
                onChange={(e) => setHazardLevel(e.target.value as HazardLevel)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547] font-medium cursor-pointer"
              >
                <option value="safe">Non-Hazardous / Safe</option>
                <option value="caution">Caution / Irritant</option>
                <option value="corrosive">Corrosive (Acid/Base)</option>
                <option value="flammable">Flammable (Solvent)</option>
                <option value="toxic">Toxic / Poisonous</option>
                <option value="biohazard">Biohazard</option>
                <option value="fragile">Fragile Precision Glassware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">
                Hazard Warning Notes
              </label>
              <input
                type="text"
                placeholder="e.g., Handle with nitrile gloves under fume hood."
                value={hazardNotes}
                onChange={(e) => setHazardNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1">
              Description & Practical Purpose *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe grade level usage, experiments, and handling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
            />
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Create Material'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
