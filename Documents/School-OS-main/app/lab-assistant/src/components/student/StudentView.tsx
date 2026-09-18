import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem, LabType, Category } from '../../types/lab';
import { ItemCard } from '../common/ItemCard';
import { ItemDetailModal } from '../common/ItemDetailModal';
import { RequestItemModal } from './RequestItemModal';
import { MyRequestsView } from './MyRequestsView';
import { 
  FlaskConical, 
  Atom, 
  Dna, 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Sparkles, 
  AlertCircle, 
  Package, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const { 
    items, 
    selectedLab, 
    setSelectedLab, 
    searchQuery, 
    setSearchQuery, 
    requests,
    currentUser 
  } = useLab();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'requests'>('catalog');
  const [selectedItem, setSelectedItem] = useState<LabItem | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetItem, setRequestTargetItem] = useState<LabItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');

  // Filter items
  const filteredItems = items.filter((item) => {
    // Lab type
    if (selectedLab !== 'all' && item.labType !== selectedLab) return false;
    
    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Stock Filter
    if (stockFilter === 'in_stock' && item.quantity === 0) return false;
    if (stockFilter === 'low_stock' && item.quantity > item.minThreshold) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchFormula = item.chemicalFormula?.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchLocation = `${item.location.room} ${item.location.cabinet}`.toLowerCase().includes(q);
      return matchName || matchFormula || matchDesc || matchCat || matchLocation;
    }

    return true;
  });

  // Extract unique categories for current view
  const availableCategories = Array.from(
    new Set(
      items
        .filter((i) => selectedLab === 'all' || i.labType === selectedLab)
        .map((i) => i.category)
    )
  );

  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'prepared');

  const handleRequestItem = (item: LabItem) => {
    setRequestTargetItem(item);
    setIsRequestModalOpen(true);
  };

  const handleOpenGeneralRequest = () => {
    setRequestTargetItem(null);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>School Science Lab Material Requisition & Inventory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Explore Lab Chemicals, Optics & Biology Apparatus
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2.5 max-w-2xl leading-relaxed">
            Check live inventory before your practical experiments. Browse stock in <strong>Chemistry</strong>, <strong>Physics</strong>, and <strong>Biology</strong> labs. Need a missing chemical or reagent? Submit a requisition directly to the lab attendant.
          </p>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={handleOpenGeneralRequest}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Request New Lab Material</span>
            </button>

            <button
              onClick={() => setActiveSubTab('requests')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/15 backdrop-blur-sm transition-all"
            >
              <Clock className="w-4 h-4 text-blue-300" />
              <span>My Requisitions ({requests.length})</span>
            </button>
          </div>
        </div>

        {/* Live Lab Stats Quick Cards in Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
          <div 
            onClick={() => setSelectedLab('chemistry')}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              selectedLab === 'chemistry' 
                ? 'bg-blue-600/30 border-blue-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-300">Chemistry Lab</span>
              <FlaskConical className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold mt-1 text-white">
              {items.filter((i) => i.labType === 'chemistry').length} Items
            </p>
            <span className="text-[11px] text-slate-400">Reagents, Acids, Glassware</span>
          </div>

          <div 
            onClick={() => setSelectedLab('physics')}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              selectedLab === 'physics' 
                ? 'bg-purple-600/30 border-purple-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300">Physics Lab</span>
              <Atom className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold mt-1 text-white">
              {items.filter((i) => i.labType === 'physics').length} Items
            </p>
            <span className="text-[11px] text-slate-400">Optics, Calipers, Circuits</span>
          </div>

          <div 
            onClick={() => setSelectedLab('biology')}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              selectedLab === 'biology' 
                ? 'bg-emerald-600/30 border-emerald-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">Biology Lab</span>
              <Dna className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold mt-1 text-white">
              {items.filter((i) => i.labType === 'biology').length} Items
            </p>
            <span className="text-[11px] text-slate-400">Microscopes, Stains, Slides</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation: Catalog vs My Requests */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'catalog'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Store Material Catalog</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Request Status & Track</span>
            {pendingRequests.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-200">
                {pendingRequests.length} active
              </span>
            )}
          </button>
        </div>

        {activeSubTab === 'catalog' && (
          <button
            onClick={handleOpenGeneralRequest}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors mb-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Can't find an item? Request it</span>
          </button>
        )}
      </div>

      {/* View Content */}
      {activeSubTab === 'requests' ? (
        <MyRequestsView onRequestNew={handleOpenGeneralRequest} />
      ) : (
        <div className="space-y-6">
          
          {/* Filter & Category Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Stock Filter Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">Available in Lab Only</option>
                <option value="low_stock">Low Stock Items</option>
              </select>
            </div>
          </div>

          {/* Grid of Materials */}
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                No lab materials match your search
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                We couldn't find "{searchQuery}" in {selectedLab === 'all' ? 'the science labs' : `${selectedLab} lab`}. You can submit a material requisition for the lab assistant to procure or prepare it.
              </p>
              <button
                onClick={handleOpenGeneralRequest}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
              >
                + Request "{searchQuery || 'Missing Chemical / Item'}"
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={(it) => setSelectedItem(it)}
                  onRequestThisItem={(it) => handleRequestItem(it)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRequestItem={(it) => handleRequestItem(it)}
      />

      {/* Request Modal */}
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
