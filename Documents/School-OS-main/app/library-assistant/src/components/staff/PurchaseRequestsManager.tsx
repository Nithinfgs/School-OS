import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookPurchaseRequest, PurchaseRequestStatus } from '../../types/library';
import { exportPurchaseRequestsToCsv } from '../../utils/exportCsv';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  Package, 
  X, 
  BookPlus, 
  Send 
} from 'lucide-react';

export const PurchaseRequestsManager: React.FC = () => {
  const { purchaseRequests, updatePurchaseRequestStatus, deletePurchaseRequest } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'ordered' | 'arrived'>('all');
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});

  const filtered = purchaseRequests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.bookTitle.toLowerCase().includes(q) ||
        req.author.toLowerCase().includes(q) ||
        req.studentName.toLowerCase().includes(q) ||
        req.subjectGenre.toLowerCase().includes(q) ||
        req.studentEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = purchaseRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Search & Export Header */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search proposals by title, student, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#1F3547] focus:outline-none cursor-pointer"
          >
            <option value="all">All Proposals ({purchaseRequests.length})</option>
            <option value="pending">Pending Review ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="ordered">Dispatched / Ordered</option>
            <option value="arrived">Cataloged & Arrived</option>
          </select>

          <button
            onClick={() => exportPurchaseRequestsToCsv(filtered)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1F3547] text-xs font-bold rounded-xl border border-[#CBD5E1] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2D7F9F]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
            <BookPlus className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#1F3547]">No Acquisition Requests</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
              Student book purchase proposals will appear here for review and ordering.
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const statusConfig = {
              pending: { variant: 'warning' as const, label: 'Pending Review' },
              approved: { variant: 'info' as const, label: 'Approved for Acquisition' },
              ordered: { variant: 'academic' as const, label: 'Order Dispatched' },
              arrived: { variant: 'success' as const, label: 'Cataloged & On Shelf' },
              rejected: { variant: 'error' as const, label: 'Declined' },
            }[req.status];

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig.variant} size="sm" dot>
                        {statusConfig.label}
                      </Badge>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {req.subjectGenre}
                      </span>
                      {req.urgency === 'high' && (
                        <span className="text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded">
                          Urgent Requirement
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-[#1F3547]">
                      {req.bookTitle}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      By <span className="font-semibold text-[#334155]">{req.author}</span> {req.publisher && `• Publisher: ${req.publisher}`} {req.estimatedPrice && `• Est. Price: ${req.estimatedPrice}`}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Requested by <strong className="text-[#1F3547]">{req.studentName}</strong> ({req.studentGrade}) on {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <button
                    onClick={() => deletePurchaseRequest(req.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer self-start"
                    title="Remove proposal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] text-xs text-[#334155] italic">
                  Student Justification: "{req.reasonForPurchase}"
                </div>

                {/* Librarian Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Add librarian procurement notes (e.g. PO # dispatched)..."
                      value={adminNoteInput[req.id] !== undefined ? adminNoteInput[req.id] : (req.adminNotes || '')}
                      onChange={(e) => setAdminNoteInput({ ...adminNoteInput, [req.id]: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white text-[#1F3547]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => updatePurchaseRequestStatus(req.id, 'approved', adminNoteInput[req.id])}
                      className="px-3 py-1.5 bg-[#E9F3F6] hover:bg-[#DCEFF4] text-[#2B7796] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updatePurchaseRequestStatus(req.id, 'ordered', adminNoteInput[req.id])}
                      className="px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Mark Ordered
                    </button>

                    <button
                      onClick={() => updatePurchaseRequestStatus(req.id, 'arrived', adminNoteInput[req.id])}
                      className="px-3.5 py-1.5 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Arrived & Cataloged
                    </button>

                    <button
                      onClick={() => updatePurchaseRequestStatus(req.id, 'rejected', adminNoteInput[req.id])}
                      className="px-2.5 py-1.5 text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
