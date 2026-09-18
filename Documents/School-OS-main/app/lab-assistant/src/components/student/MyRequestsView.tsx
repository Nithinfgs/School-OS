import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { StatusBadge, LabBadge } from '../common/Badge';
import { Calendar, Clock, MessageSquare, Trash2, User, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const MyRequestsView: React.FC<{ onRequestNew: () => void }> = ({ onRequestNew }) => {
  const { requests, currentUser, deleteRequest } = useLab();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myRequests = requests.filter((r) => {
    if (!currentUser) return true;
    const isOwner = r.studentEmail === currentUser.email || currentUser.role === 'staff';
    return isOwner;
  });

  const filtered = myRequests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs text-[#1F3547]">
        <div>
          <h2 className="text-xl font-bold text-[#1F3547]">
            Material & Chemical Requisition Pipeline
          </h2>
          <p className="text-xs text-[#61728A] mt-1">
            Track approvals, preparation progress, and ready-for-pickup notices from lab assistants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-[#F7F9FB] text-[#1F3547] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 cursor-pointer"
          >
            <option value="all">All Requisitions ({myRequests.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="prepared">Prepared in Lab</option>
            <option value="ready">Ready for Pickup</option>
            <option value="rejected">Declined</option>
          </select>

          <button
            onClick={onRequestNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Request</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <Clock className="w-12 h-12 text-[#61728A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">No requisitions found</h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1 mb-4">
            Need a chemical, lens, slide, or apparatus for your practical session?
          </p>
          <button
            onClick={onRequestNew}
            className="px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs cursor-pointer"
          >
            Submit Requisition
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-[#DBE4EA] hover:border-[#2D7F9F]/50 rounded-3xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1F3547]"
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <LabBadge labType={req.labType} size="sm" />
                  <StatusBadge status={req.status} />
                  {req.urgency === 'high' && (
                    <span className="text-[11px] font-bold bg-[#FAF1F0] text-[#A65D57] px-2 py-0.5 rounded-full border border-[#A65D57]/30">
                      Urgent
                    </span>
                  )}
                  <span className="text-xs text-[#61728A] font-mono">#{req.id}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1F3547]">
                    {req.itemName}
                  </h3>
                  <p className="text-xs text-[#4C6073] mt-0.5">
                    Requirement: <strong className="text-[#1F3547] font-bold">{req.quantityRequested} {req.unit}</strong> for <span className="italic text-[#1F3547] font-medium">"{req.experimentPurpose}"</span>
                  </p>
                </div>

                {/* Assistant note */}
                {req.adminNotes && (
                  <div className="flex items-start gap-2 text-xs bg-[#E9F3F6] border border-[#2D7F9F]/30 p-2.5 rounded-xl text-[#1F3547]">
                    <MessageSquare className="w-4 h-4 text-[#2D7F9F] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Lab Assistant Note: </span>
                      {req.adminNotes}
                    </div>
                  </div>
                )}

                {/* Sub details */}
                <div className="flex items-center gap-4 text-xs text-[#61728A] pt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#2D7F9F]" />
                    {req.studentName} ({req.studentGrade})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#4C6073]" />
                    Required By: <strong className="text-[#1F3547]">{req.dateNeeded}</strong>
                  </span>
                  <span className="text-[#61728A]">
                    Submitted: {format(new Date(req.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {currentUser?.email === req.studentEmail && req.status === 'pending' && (
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="p-2 text-[#61728A] hover:text-[#A65D57] hover:bg-[#FAF1F0] rounded-xl transition-colors cursor-pointer"
                    title="Cancel request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
