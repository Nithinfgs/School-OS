import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { LabBadge } from '../common/Badge';
import { ClipboardList, Plus, Search, Calendar, User, FileText, FlaskConical, Atom, Dna } from 'lucide-react';
import { format } from 'date-fns';

export const UsageHistoryView: React.FC<{ onLogNewUsage: () => void }> = ({ onLogNewUsage }) => {
  const { usageLogs, selectedLab } = useLab();
  const [search, setSearch] = useState('');

  const filteredLogs = usageLogs.filter((log) => {
    if (selectedLab !== 'all' && log.labType !== selectedLab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.itemName.toLowerCase().includes(q) ||
        log.experimentName.toLowerCase().includes(q) ||
        log.conductedBy.toLowerCase().includes(q) ||
        log.loggedByAssistant.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const labIcons = {
    chemistry: <FlaskConical className="w-4 h-4 text-[#2D7F9F]" />,
    physics: <Atom className="w-4 h-4 text-[#4C6073]" />,
    biology: <Dna className="w-4 h-4 text-[#2D7F9F]" />,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Search */}
      <div className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1F3547]">
        <div>
          <h2 className="text-xl font-bold text-[#1F3547]">
            Practical Usage & Material Consumption Audit
          </h2>
          <p className="text-xs text-[#61728A] mt-1">
            Real-time digital logbook tracking chemicals and apparatus consumed during practical classes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#61728A]" />
            <input
              type="text"
              placeholder="Search experiments or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
            />
          </div>

          <button
            onClick={onLogNewUsage}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Practical Usage</span>
          </button>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#61728A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">No usage records found</h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1 mb-4">
            No consumption logs match your query or filters.
          </p>
          <button
            onClick={onLogNewUsage}
            className="px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs cursor-pointer"
          >
            Record Practical Session
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#DBE4EA] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1F3547]">
              <thead className="bg-[#F7F9FB] border-b border-[#DBE4EA] text-[11px] font-bold uppercase tracking-wider text-[#61728A]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Lab Material</th>
                  <th className="px-4 py-3.5">Quantity Consumed</th>
                  <th className="px-4 py-3.5">Experiment / Practical</th>
                  <th className="px-4 py-3.5">Conducted By</th>
                  <th className="px-5 py-3.5">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE4EA]/60 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="px-5 py-4 whitespace-nowrap text-[#61728A]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#4C6073]" />
                        <span className="font-semibold text-[#1F3547]">
                          {format(new Date(log.timestamp), 'MMM d, yyyy')}
                        </span>
                        <span className="text-[11px] text-[#61728A]">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    </td>

                    {/* Material */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1F3547] text-sm">{log.itemName}</p>
                        <LabBadge labType={log.labType} size="sm" />
                      </div>
                    </td>

                    {/* Quantity Used */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-[#E9F3F6] text-[#2D7F9F] border border-[#2D7F9F]/30">
                          - {log.quantityUsed} {log.unit}
                        </span>
                        <p className="text-[10px] text-[#61728A]">
                          Remaining: {log.remainingStock} {log.unit}
                        </p>
                      </div>
                    </td>

                    {/* Experiment */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5 max-w-xs">
                        <p className="font-semibold text-[#1F3547]">{log.experimentName}</p>
                        {log.notes && (
                          <p className="text-[11px] text-[#61728A] italic line-clamp-2">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Conducted By */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-[#1F3547]">
                        <User className="w-3.5 h-3.5 text-[#2D7F9F]" />
                        <span>{log.conductedBy}</span>
                      </div>
                    </td>

                    {/* Logged by */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-[#4C6073] bg-[#F7F9FB] px-2.5 py-1 rounded-lg border border-[#DBE4EA]">
                        {log.loggedByAssistant}
                      </span>
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
