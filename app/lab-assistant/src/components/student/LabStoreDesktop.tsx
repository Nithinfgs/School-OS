import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem, LabType, SortOption } from '../../types/lab';
import { ItemCard } from '../common/ItemCard';
import { ItemDetailModal } from '../common/ItemDetailModal';
import { RequestItemModal } from './RequestItemModal';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  ArrowUpDown, 
  Package, 
  FlaskConical, 
  Atom, 
  Dna,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LabStoreDesktop: React.FC = () => {
  const { 
    items, 
    selectedLabPortal, 
    setSelectedLabPortal, 
    navigateTo, 
    searchQuery, 
    setSearchQuery,
    setIsCartOpen,
    cart
  } = useLab();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical-asc');
  const [selectedItem, setSelectedItem] = useState<LabItem | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetItem, setRequestTargetItem] = useState<LabItem | null>(null);

  const labItems = items.filter((i) => i.labType === selectedLabPortal);
  const categories = Array.from(new Set(labItems.map((i) => i.category)));

  let filtered = labItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    if (stockFilter === 'in_stock' && item.quantity === 0) return false;
    if (stockFilter === 'low_stock' && item.quantity > item.minThreshold) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchFormula = item.chemicalFormula?.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchLoc = `${item.location.room} ${item.location.cabinet} ${item.location.shelf}`.toLowerCase().includes(q);
      return matchName || matchFormula || matchDesc || matchCat || matchLoc;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'alphabetical-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'alphabetical-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'quantity-desc') return b.quantity - a.quantity;
    if (sortBy === 'quantity-asc') return a.quantity - b.quantity;
    if (sortBy === 'hazard') return a.hazardLevel.localeCompare(b.hazardLevel);
    return 0;
  });

  const portalConfig = {
    chemistry: {
      name: 'Chemistry Lab Store',
      icon: <FlaskConical className="w-5 h-5 text-[#2D7F9F]" />,
      badge: 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30',
    },
    physics: {
      name: 'Physics Lab Store',
      icon: <Atom className="w-5 h-5 text-[#4C6073]" />,
      badge: 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30',
    },
    biology: {
      name: 'Biology Lab Store',
      icon: <Dna className="w-5 h-5 text-[#2D7F9F]" />,
      badge: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
    },
  }[selectedLabPortal];

  const handleOpenGeneralRequisition = () => {
    setRequestTargetItem(null);
    setIsRequestModalOpen(true);
  };

  const labIcons = {
    chemistry: <FlaskConical className="w-3.5 h-3.5" />,
    physics: <Atom className="w-3.5 h-3.5" />,
    biology: <Dna className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* Top Breadcrumb & Quick Portal Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DBE4EA]">
        
        {/* Breadcrumb back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('student-hub')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DBE4EA] text-[#1F3547] hover:bg-[#F7F9FB] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D7F9F]" />
            <span>Back to Lab Portals</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl border ${portalConfig.badge}`}>
              {portalConfig.icon}
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F3547] tracking-tight leading-tight">
                {portalConfig.name}
              </h1>
              <p className="text-[11px] text-[#61728A]">
                School Science Inventory & Requisition Catalog
              </p>
            </div>
          </div>
        </div>

        {/* Quick Portal Switcher Pills with clean vector icons */}
        <div className="flex items-center gap-1.5 bg-[#F7F9FB] p-1 rounded-2xl border border-[#DBE4EA] overflow-x-auto no-scrollbar">
          {(['chemistry', 'physics', 'biology'] as LabType[]).map((lab) => {
            const isActive = selectedLabPortal === lab;
            const names = { chemistry: 'Chemistry', physics: 'Physics', biology: 'Biology' };
            return (
              <button
                key={lab}
                onClick={() => {
                  setSelectedLabPortal(lab);
                  setSelectedCategory('all');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2D7F9F] text-white shadow-xs'
                    : 'text-[#4C6073] hover:text-[#1F3547]'
                }`}
              >
                {labIcons[lab]}
                <span>{names[lab]}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Store Desktop Controls Box */}
      <div className="bg-white rounded-3xl p-5 border border-[#DBE4EA] shadow-xs space-y-4">
        
        {/* Row 1: Search, Sort Dropdown & Top-Right Requisition / Cart Triggers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
            <input
              type="text"
              placeholder={`Search ${selectedLabPortal} chemicals, apparatus, formula, cabinets...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#61728A] hover:text-[#1F3547] bg-[#DBE4EA] px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Controls: Sort + Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#4C6073]" />
              <span className="text-xs font-semibold text-[#61728A]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold bg-transparent text-[#1F3547] focus:outline-none cursor-pointer"
              >
                <option value="alphabetical-asc">A to Z (Alphabetical)</option>
                <option value="alphabetical-desc">Z to A (Reverse)</option>
                <option value="quantity-desc">Quantity: High to Low</option>
                <option value="quantity-asc">Quantity: Low to High</option>
                <option value="hazard">Hazard Classification</option>
              </select>
            </div>

            {/* View Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F7F9FB] hover:bg-[#DBE4EA] text-[#1F3547] text-xs font-bold rounded-xl border border-[#DBE4EA] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#2D7F9F]" />
              <span>Cart ({cart.length})</span>
            </button>

            {/* Custom Requisition Button */}
            <button
              onClick={handleOpenGeneralRequisition}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Custom Request</span>
            </button>

          </div>
        </div>

        {/* Row 2: Category Filter Chips & Stock Availability Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#DBE4EA]">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#61728A] flex-shrink-0 mr-1">
              Categories:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#253B53] text-white shadow-xs'
                  : 'bg-[#F7F9FB] text-[#4C6073] hover:bg-[#DBE4EA]'
              }`}
            >
              All Categories ({labItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#253B53] text-white shadow-xs'
                    : 'bg-[#F7F9FB] text-[#4C6073] hover:bg-[#DBE4EA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stock Filter Dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4C6073]" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="text-xs font-semibold bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl px-3 py-1.5 text-[#1F3547] focus:outline-none cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock Warnings</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#61728A] px-1">
        <span>
          Showing <strong className="text-[#1F3547] font-bold">{filtered.length}</strong> materials in {portalConfig.name}
        </span>
        <span className="hidden sm:inline">
          Click <strong>"+ Add to Cart"</strong> to bundle reagents & apparatus into your requisition.
        </span>
      </div>

      {/* Store Desktop Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <Package className="w-12 h-12 text-[#61728A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">
            No materials found
          </h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1 mb-4">
            Could not find "{searchQuery}" in {portalConfig.name}. You can submit a custom requisition for the school to prepare or procure it.
          </p>
          <button
            onClick={handleOpenGeneralRequisition}
            className="px-5 py-2.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-md transition-colors cursor-pointer"
          >
            + Request "{searchQuery || 'Missing Item'}"
          </button>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.04 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
            >
              <ItemCard
                item={item}
                onSelect={(it) => setSelectedItem(it)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Requisition Modal */}
      <RequestItemModal
        initialItem={requestTargetItem}
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setRequestTargetItem(null);
        }}
      />

    </div>
  );
};
