import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { BreakageLog, BreakageStatus } from '../../types/lab';
import { LabBadge } from '../common/Badge';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Download, 
  Calendar, 
  DollarSign, 
  Wrench, 
  CheckCircle2, 
  Trash2,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { exportBreakageLogsToCSV } from '../../utils/exportCsv';

export const BreakageManager: React.FC<{ onLogNewBreakage: () => void }> = ({ onLogNewBreakage }) => {
  const { breakageLogs, selectedLab, updateBreakageStatus } = useLab();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = breakageLogs.filter((log) => {
    if (selectedLab !== 'all' && log.labType !== selectedLab) return false;
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.itemName.toLowerCase().includes(q) ||
        log.incidentDetails.toLowerCase().includes(q) ||
        log.reportedBy.toLowerCase().includes(q) ||
        log.actionTaken.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusBadges: Record<BreakageStatus, { label: string; style: string }> = {
    'written-off': { label: 'Written Off', style: 'bg-[#FAF1F0] text-[#A65D57] border-[#A65D57]/30' },
    'under-repair': { label: 'Under Repair', style: 'bg-[#FBF6EE] text-[#B58B4E] border-[#B58B4E]/30' },
    'damaged': { label: 'Damaged', style: 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30' },
    'replaced': { label: 'Replaced', style: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30' },
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Controls Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1F3547]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1F3547]">
              Damaged & Broken Equipment Register
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF1F0] text-[#A65D57] font-bold border border-[#A65D57]/30">
              {breakageLogs.length} Records
            </span>
          </div>
          <p className="text-xs text-[#61728A] mt-1">
            Track laboratory breakages, repair statuses, write-offs, and export damage audit reports.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#61728A]" />
            <input
              type="text"
              placeholder="Search damaged item or incident..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A65D57]/30 text-[#1F3547]"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => exportBreakageLogsToCSV(breakageLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#F7F9FB] hover:bg-[#DBE4EA] text-[#1F3547] border border-[#DBE4EA] rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download full CSV report"
          >
            <Download className="w-3.5 h-3.5 text-[#4C6073]" />
            <span>Export CSV</span>
          </button>

          {/* Log New Damage Button */}
          <button
            onClick={onLogNewBreakage}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#A65D57] hover:bg-[#8F4E48] text-white rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report Broken Equipment</span>
          </button>
        </div>
      </div>

      {/* Breakage List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#2D7F9F] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">No damaged equipment logs</h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1 mb-4">
            No broken or repair items recorded for this filter.
          </p>
          <button
            onClick={onLogNewBreakage}
            className="px-4 py-2 text-xs font-bold bg-[#A65D57] hover:bg-[#8F4E48] text-white rounded-xl shadow-xs cursor-pointer"
          >
            Report an Incident
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((log) => {
            const badge = statusBadges[log.status] || { label: log.status, style: 'bg-slate-100 text-slate-700' };

            return (
              <div
                key={log.id}
                className="bg-white border border-[#DBE4EA] hover:border-[#A65D57]/40 rounded-3xl p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-[#1F3547]"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LabBadge labType={log.labType} size="sm" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-[#61728A] font-mono">ID: {log.id}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1F3547]">
                      {log.itemName}
                    </h3>
                    <p className="text-xs text-[#4C6073] mt-0.5">
                      Quantity Damaged: <strong className="text-[#A65D57] font-bold">{log.quantityBroken} {log.unit}</strong>
                      {log.estimatedCost && (
                        <span> • Est. Cost: <strong className="text-[#1F3547] font-semibold">{log.estimatedCost}</strong></span>
                      )}
                    </p>
                  </div>

                  {/* Incident details box */}
                  <div className="p-3 bg-[#F7F9FB] border border-[#DBE4EA] rounded-2xl text-xs space-y-1">
                    <p>
                      <strong className="text-[#1F3547]">Incident: </strong>
                      <span className="text-[#4C6073]">{log.incidentDetails}</span>
                    </p>
                    <p>
                      <strong className="text-[#1F3547]">Action Taken: </strong>
                      <span className="text-[#4C6073]">{log.actionTaken}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#61728A] pt-0.5 flex-wrap">
                    <span>Reported by: <strong className="text-[#1F3547]">{log.reportedBy}</strong></span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#4C6073]" />
                      {format(new Date(log.timestamp), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                </div>

                {/* Status action toggle */}
                <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-[#DBE4EA] pt-3 lg:pt-0 lg:pl-5 self-stretch lg:self-center justify-end">
                  {log.status === 'under-repair' && (
                    <button
                      onClick={() => updateBreakageStatus(log.id, 'replaced', 'Repairs completed and re-added to catalog.')}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Repaired & Available
                    </button>
                  )}

                  {log.status === 'written-off' && (
                    <button
                      onClick={() => updateBreakageStatus(log.id, 'replaced', 'New replacement units received from supplier.')}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Restocked / Replaced
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
