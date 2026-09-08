import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabItem } from '../../types/lab';
import { InventoryManager } from './InventoryManager';
import { RequestManager } from './RequestManager';
import { UsageHistoryView } from './UsageHistoryView';
import { BreakageManager } from './BreakageManager';
import { ItemFormModal } from './ItemFormModal';
import { UsageLoggerModal } from './UsageLoggerModal';
import { BreakageLoggerModal } from './BreakageLoggerModal';
import { ItemDetailModal } from '../common/ItemDetailModal';
import { 
  Package, 
  Clock, 
  ClipboardList, 
  AlertTriangle, 
  Plus,
  AlertOctagon,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  exportInventoryToCSV, 
  exportUsageLogsToCSV, 
  exportBreakageLogsToCSV, 
  exportRequestsToCSV 
} from '../../utils/exportCsv';

export const StaffView: React.FC = () => {
  const { items, requests, usageLogs, breakageLogs } = useLab();

  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'history' | 'breakage'>('inventory');
  
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabItem | null>(null);
  
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageItem, setUsageItem] = useState<LabItem | null>(null);

  const [isBreakageModalOpen, setIsBreakageModalOpen] = useState(false);
  const [breakageItem, setBreakageItem] = useState<LabItem | null>(null);
  
  const [selectedDetailItem, setSelectedDetailItem] = useState<LabItem | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const lowStockItems = items.filter((i) => i.quantity <= i.minThreshold);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const totalLogs = usageLogs.length;
  const totalBreakage = breakageLogs.length;

  const handleAddNewItem = () => {
    setEditingItem(null);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (item: LabItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const handleLogUsageItem = (item: LabItem) => {
    setUsageItem(item);
    setIsUsageModalOpen(true);
  };

  const handleOpenGeneralLog = () => {
    setUsageItem(null);
    setIsUsageModalOpen(true);
  };

  const handleOpenBreakage = (item?: LabItem) => {
    setBreakageItem(item || null);
    setIsBreakageModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Academic Slate Navy Banner */}
      <div className="bg-[#253B53] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#253B53]/10 border border-[#4C6073]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D7F9F]/30 text-[#E9F3F6] text-xs font-semibold border border-[#2D7F9F]/40">
            <span className="w-2 h-2 rounded-full bg-[#2D7F9F] animate-pulse" />
            <span>School Lab Administration & Stock Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Lab Assistant & Teacher Management Console
          </h1>
          <p className="text-xs sm:text-sm text-[#DBE4EA] leading-relaxed">
            Oversee Chemistry, Physics, and Biology laboratory equipment, process student requisitions, log practical consumption & broken apparatus, and export audit sheets.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4C6073] hover:bg-[#414E56] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Data</span>
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DBE4EA] py-2 z-30 animate-in fade-in text-xs text-[#1F3547]"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#61728A] tracking-wider border-b border-[#DBE4EA]">
                  Download CSV Spreadsheets
                </div>
                <button
                  onClick={() => {
                    exportInventoryToCSV(items);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F9FB] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2D7F9F]" />
                  <span>Inventory Catalog (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    exportUsageLogsToCSV(usageLogs);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F9FB] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2D7F9F]" />
                  <span>Practical Consumption (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    exportBreakageLogsToCSV(breakageLogs);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F9FB] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#A65D57]" />
                  <span>Damaged Equipment (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    exportRequestsToCSV(requests);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F7F9FB] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#B58B4E]" />
                  <span>Student Requisitions (.csv)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleOpenBreakage()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#A65D57] hover:bg-[#8F4E48] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Report Broken Equipment</span>
          </button>

          <button
            onClick={handleOpenGeneralLog}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Log Practical Usage</span>
          </button>

          <button
            onClick={handleAddNewItem}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1F3547] hover:bg-[#F7F9FB] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#2D7F9F]" />
            <span>Add New Lab Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total items card */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-[#DBE4EA] shadow-[0_1px_3px_rgba(31,41,51,0.02)] cursor-pointer hover:border-[#2D7F9F] transition-all text-[#1F3547]"
        >
          <div className="flex items-center justify-between text-[#61728A]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Materials</span>
            <Package className="w-4 h-4 text-[#2D7F9F]" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-[#1F3547]">
            {items.length}
          </p>
          <p className="text-[11px] text-[#61728A] mt-1">
            Across Chem, Phys & Bio labs
          </p>
        </div>

        {/* Pending Requests card */}
        <div 
          onClick={() => setActiveTab('requests')}
          className="bg-white p-5 rounded-2xl border border-[#DBE4EA] shadow-[0_1px_3px_rgba(31,41,51,0.02)] cursor-pointer hover:border-[#2D7F9F] transition-all text-[#1F3547]"
        >
          <div className="flex items-center justify-between text-[#61728A]">
            <span className="text-xs font-bold uppercase tracking-wider">Student Requisitions</span>
            <Clock className="w-4 h-4 text-[#B58B4E]" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-[#1F3547]">
            {pendingRequests.length} Pending
          </p>
          <p className="text-[11px] text-[#61728A] mt-1">
            {requests.length} total requisitions
          </p>
        </div>

        {/* Low Stock Alerts card */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            lowStockItems.length > 0
              ? 'bg-[#FBF6EE] border-[#B58B4E]/40 shadow-xs'
              : 'bg-white border-[#DBE4EA]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B58B4E]">
              Low Stock Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-[#B58B4E]" />
          </div>
          <p className="text-2xl font-bold text-[#1F3547] mt-2 font-mono">
            {lowStockItems.length} Items Low
          </p>
          <p className="text-[11px] text-[#B58B4E] mt-1">
            Below threshold warning limit
          </p>
        </div>

        {/* Damaged Equipment KPI */}
        <div 
          onClick={() => setActiveTab('breakage')}
          className="bg-white p-5 rounded-2xl border border-[#DBE4EA] shadow-[0_1px_3px_rgba(31,41,51,0.02)] cursor-pointer hover:border-[#A65D57] transition-all text-[#1F3547]"
        >
          <div className="flex items-center justify-between text-[#61728A]">
            <span className="text-xs font-bold uppercase tracking-wider">Broken / Damage Log</span>
            <AlertOctagon className="w-4 h-4 text-[#A65D57]" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-[#1F3547]">
            {totalBreakage} Recorded
          </p>
          <p className="text-[11px] text-[#61728A] mt-1">
            Repair & write-off registry
          </p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-[#DBE4EA] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-[#2D7F9F] text-[#2D7F9F]'
              : 'border-transparent text-[#61728A] hover:text-[#1F3547]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory Master List</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7F9FB] text-[#4C6073] font-semibold border border-[#DBE4EA]">
            {items.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-[#2D7F9F] text-[#2D7F9F]'
              : 'border-transparent text-[#61728A] hover:text-[#1F3547]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Student Requisitions</span>
          {pendingRequests.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBF6EE] text-[#B58B4E] font-bold border border-[#B58B4E]/30">
              {pendingRequests.length} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-[#2D7F9F] text-[#2D7F9F]'
              : 'border-transparent text-[#61728A] hover:text-[#1F3547]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Lab Consumption Audit</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7F9FB] text-[#4C6073] font-semibold border border-[#DBE4EA]">
            {totalLogs}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('breakage')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'breakage'
              ? 'border-[#A65D57] text-[#A65D57]'
              : 'border-transparent text-[#61728A] hover:text-[#1F3547]'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-[#A65D57]" />
          <span>Damaged Equipment Register</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF1F0] text-[#A65D57] font-bold border border-[#A65D57]/30">
            {totalBreakage}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' && (
        <InventoryManager
          onAddNewItem={handleAddNewItem}
          onEditItem={handleEditItem}
          onLogUsageItem={handleLogUsageItem}
          onSelectItem={(item) => setSelectedDetailItem(item)}
        />
      )}

      {activeTab === 'requests' && <RequestManager />}

      {activeTab === 'history' && (
        <UsageHistoryView onLogNewUsage={handleOpenGeneralLog} />
      )}

      {activeTab === 'breakage' && (
        <BreakageManager onLogNewBreakage={() => handleOpenBreakage()} />
      )}

      {/* Item Form Modal */}
      <ItemFormModal
        itemToEdit={editingItem}
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Usage Logger Modal */}
      <UsageLoggerModal
        initialItem={usageItem}
        isOpen={isUsageModalOpen}
        onClose={() => {
          setIsUsageModalOpen(false);
          setUsageItem(null);
        }}
      />

      {/* Breakage Logger Modal */}
      <BreakageLoggerModal
        initialItem={breakageItem}
        isOpen={isBreakageModalOpen}
        onClose={() => {
          setIsBreakageModalOpen(false);
          setBreakageItem(null);
        }}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEditItem={handleEditItem}
        onLogUsage={handleLogUsageItem}
        onReportBroken={(item) => handleOpenBreakage(item)}
      />

    </div>
  );
};
