import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { DamageLoggerModal } from './DamageLoggerModal';
import { DamageActionStatus } from '../../types/library';
import { Badge } from '../common/Badge';
import { 
  AlertTriangle, 
  Plus, 
  BookOpen, 
  Wrench, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';

export const DamageManager: React.FC = () => {
  const { damageLogs, updateDamageStatus } = useLibrary();
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-extrabold text-[#1F3547]">
            Damaged & Lost Books Log
          </h3>
          <p className="text-xs text-[#64748B]">
            Archival bookbinding repairs, water damage, torn pages & replacement records
          </p>
        </div>

        <button
          onClick={() => setIsDamageModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Damage / Loss</span>
        </button>
      </div>

      {/* Damage Incident Cards */}
      <div className="space-y-4">
        {damageLogs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
            <AlertTriangle className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#1F3547]">No Damaged Books Logged</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
              All books in circulation are in healthy condition.
            </p>
          </div>
        ) : (
          damageLogs.map((log) => {
            const statusConfig = {
              under_repair: { variant: 'warning' as const, label: 'Under Repair' },
              rebound: { variant: 'success' as const, label: 'Rebound & Restored' },
              written_off: { variant: 'error' as const, label: 'Written Off' },
              replaced: { variant: 'info' as const, label: 'Replaced Copy' },
            }[log.status];

            return (
              <div
                key={log.id}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant} size="sm" dot>
                      {statusConfig.label}
                    </Badge>
                    <span className="text-xs font-bold uppercase text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded">
                      {log.condition.replace('_', ' ')}
                    </span>
                    {log.fineAssessed && (
                      <span className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                        Fee: {log.fineAssessed}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-[#94A3B8]">
                    Logged on {new Date(log.loggedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-[#1F3547]">
                    {log.bookTitle}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Reported by {log.reportedBy}
                  </p>
                </div>

                <p className="text-xs text-[#334155] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  Incident: {log.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <span className="text-[#64748B]">
                    Action Taken: <strong className="text-[#1F3547]">{log.actionTaken}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Change Status:</span>
                    <select
                      value={log.status}
                      onChange={(e) => updateDamageStatus(log.id, e.target.value as DamageActionStatus)}
                      className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2 py-1 font-bold text-[#1F3547] focus:outline-none cursor-pointer"
                    >
                      <option value="under_repair">Under Repair</option>
                      <option value="rebound">Rebound & Restored</option>
                      <option value="written_off">Written Off</option>
                      <option value="replaced">Replaced</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <DamageLoggerModal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
      />

    </div>
  );
};
