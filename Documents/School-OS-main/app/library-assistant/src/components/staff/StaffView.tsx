import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Navbar } from '../common/Navbar';
import { CirculationManager } from './CirculationManager';
import { InventoryManager } from './InventoryManager';
import { WaitlistManager } from './WaitlistManager';
import { PurchaseRequestsManager } from './PurchaseRequestsManager';
import { DamageManager } from './DamageManager';
import { exportLoansToCsv, exportBooksToCsv } from '../../utils/exportCsv';
import { 
  BookmarkCheck, 
  Layers, 
  Hourglass, 
  BookPlus, 
  AlertTriangle, 
  RotateCcw,
  BookOpen,
  Clock,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { 
    books, 
    loans, 
    waitlist, 
    purchaseRequests, 
    damageLogs, 
    resetToDefaultData,
    addToast
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<
    'circulation' | 'inventory' | 'waitlist' | 'requests' | 'damage'
  >('circulation');

  const overdueCount = loans.filter((l) => {
    const due = new Date(l.dueDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 3600 * 24)) < 0 && l.status !== 'returned';
  }).length;

  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailable = books.reduce((acc, b) => acc + b.availableCopies, 0);

  const handleExportSharedBooks = () => {
    exportLoansToCsv(loans);
    addToast({
      type: 'success',
      title: 'Shared Books CSV Exported! 📊',
      message: `Exported ${loans.length} active and historical circulation records.`
    });
  };

  const handleExportCatalog = () => {
    exportBooksToCsv(books);
    addToast({
      type: 'success',
      title: 'Book Catalog CSV Exported! 📚',
      message: `Exported ${books.length} book titles and inventory locations.`
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Staff Dashboard Top Banner */}
          <div className="bg-gradient-to-r from-[#253B53] to-[#1F3547] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#73CAD1]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Librarian Central Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Circulation, Catalog & Waitlist Dashboard 📚
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                Track which books are shared and borrowed by students, due dates, past due alerts, auto-promote waitlists, and manage library inventory.
              </p>

              {/* Quick CSV Export Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={handleExportSharedBooks}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2D7F9F]/30 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#C8EDF0]" />
                  <span>Export Shared Books CSV</span>
                </button>

                <button
                  onClick={handleExportCatalog}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white/80" />
                  <span>Export Full Catalog CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 w-full lg:w-auto">
              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Titles</span>
                <span className="text-lg font-black text-white">{books.length}</span>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Copies</span>
                <span className="text-lg font-black text-white">{totalAvailable}/{totalCopies}</span>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/60 block">On Loan</span>
                <span className="text-lg font-black text-[#73CAD1]">{loans.filter((l) => l.status !== 'returned').length}</span>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Overdue</span>
                <span className="text-lg font-black text-[#FC8181]">{overdueCount}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#E2E8F0] overflow-x-auto no-scrollbar max-w-full">
              
              <button
                onClick={() => setActiveTab('circulation')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'circulation'
                    ? 'bg-white text-[#1F3547] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#2D7F9F]" />
                <span>Circulation & Shared Books ({loans.filter((l) => l.status !== 'returned').length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-white text-[#1F3547] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#2B7796]" />
                <span>Book Catalog ({books.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'waitlist'
                    ? 'bg-white text-[#1F3547] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <Hourglass className="w-4 h-4 text-[#B45309]" />
                <span>Waitlist Queues ({waitlist.filter((w) => w.status !== 'cancelled').length})</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'requests'
                    ? 'bg-white text-[#1F3547] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <BookPlus className="w-4 h-4 text-[#1E7492]" />
                <span>Acquisition Requests ({purchaseRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('damage')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'damage'
                    ? 'bg-white text-[#1F3547] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                <span>Damaged / Lost ({damageLogs.length})</span>
              </button>

            </div>

            {/* Reset Data Button */}
            <button
              onClick={resetToDefaultData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#DC2626] transition-colors cursor-pointer"
              title="Restore initial seed catalog & loans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Clean Data</span>
            </button>
          </div>

          {/* Active Tab View */}
          <main>
            {activeTab === 'circulation' && <CirculationManager />}
            {activeTab === 'inventory' && <InventoryManager />}
            {activeTab === 'waitlist' && <WaitlistManager />}
            {activeTab === 'requests' && <PurchaseRequestsManager />}
            {activeTab === 'damage' && <DamageManager />}
          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Library Assistant • School Resource Management System</p>
          <p className="text-[11px] text-[#94A3B8]">
            Connected to Central Circulation Database
          </p>
        </div>
      </footer>
    </div>
  );
};
