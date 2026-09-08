import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { MaterialRequest } from '../../types/lab';
import { StatusBadge, LabBadge } from '../common/Badge';
import { 
  Check, 
  X, 
  CheckCircle2, 
  PackageCheck, 
  User, 
  Calendar, 
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export const RequestManager: React.FC = () => {
  const { requests, updateRequestStatus } = useLab();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const filteredRequests = requests.filter((r) => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const preparedCount = requests.filter((r) => r.status === 'prepared').length;

  const handleOpenNote = (req: MaterialRequest) => {
    setEditingNoteId(req.id);
    setNoteText(req.adminNotes || '');
  };

  const handleSaveNote = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (target) {
      updateRequestStatus(requestId, target.status, noteText);
    }
    setEditingNoteId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Stats */}
      <div className="bg-white p-6 rounded-3xl border border-[#DBE4EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1F3547]">
        <div>
          <h2 className="text-xl font-bold text-[#1F3547]">
            Student Material Requisitions & Approvals
          </h2>
          <p className="text-xs text-[#61728A] mt-1">
            Review incoming requests from students, allocate apparatus, and notify students when prepared.
          </p>
        </div>

        {/* Status Filter Tabs in Academic Slate */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-[#253B53] text-white border-[#253B53]'
                : 'bg-[#F7F9FB] text-[#4C6073] border-[#DBE4EA] hover:bg-[#DBE4EA]'
            }`}
          >
            All ({requests.length})
          </button>
          
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'pending'
                ? 'bg-[#B58B4E] text-white border-[#B58B4E]'
                : 'bg-[#FBF6EE] text-[#B58B4E] border-[#B58B4E]/30 hover:bg-[#B58B4E]/10'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'approved'
                ? 'bg-[#2D7F9F] text-white border-[#2D7F9F]'
                : 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30 hover:bg-[#2D7F9F]/10'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setSelectedStatus('prepared')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'prepared'
                ? 'bg-[#4C6073] text-white border-[#4C6073]'
                : 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30 hover:bg-[#4C6073]/10'
            }`}
          >
            Prepared ({preparedCount})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-[#DBE4EA] rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#2D7F9F] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">
            No requests in this view
          </h3>
          <p className="text-xs text-[#61728A] max-w-sm mx-auto mt-1">
            All student requisitions for this status filter have been processed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-[#DBE4EA] hover:border-[#2D7F9F]/50 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all text-[#1F3547]"
            >
              <div className="space-y-3 flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <LabBadge labType={req.labType} size="sm" />
                  <StatusBadge status={req.status} />
                  {req.urgency === 'high' && (
                    <span className="text-[11px] font-bold bg-[#FAF1F0] text-[#A65D57] px-2 py-0.5 rounded-full border border-[#A65D57]/30">
                      URGENT
                    </span>
                  )}
                  <span className="text-xs text-[#61728A] font-mono">ID: {req.id}</span>
                </div>

                {/* Item title & experiment details */}
                <div>
                  <h3 className="text-base font-bold text-[#1F3547]">
                    {req.itemName}
                  </h3>
                  <div className="text-xs text-[#4C6073] mt-1 space-y-0.5">
                    <p>
                      Quantity Needed: <strong className="text-[#1F3547] font-bold">{req.quantityRequested} {req.unit}</strong>
                    </p>
                    <p>
                      Experiment Purpose: <span className="italic text-[#1F3547] font-medium">"{req.experimentPurpose}"</span>
                    </p>
                  </div>
                </div>

                {/* Student Info & Timestamps */}
                <div className="flex items-center gap-4 text-xs text-[#61728A] pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium text-[#1F3547]">
                    <User className="w-3.5 h-3.5 text-[#2D7F9F]" />
                    {req.studentName} ({req.studentGrade}) - {req.studentEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#4C6073]" />
                    Required By: <strong className="text-[#1F3547]">{req.dateNeeded}</strong>
                  </span>
                  <span className="text-[#61728A]">
                    Submitted: {format(new Date(req.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>

                {/* Assistant Notes Section */}
                {editingNoteId === req.id ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add preparation note (e.g., Kept on Bench 3 in dropper bottle)..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveNote(req.id)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#253B53] hover:bg-[#1F3547] text-white rounded-xl cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-2 py-1.5 text-xs text-[#61728A] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    {req.adminNotes ? (
                      <div className="flex items-center gap-1.5 text-xs bg-[#E9F3F6] border border-[#2D7F9F]/30 text-[#1F3547] px-3 py-1 rounded-xl">
                        <MessageSquare className="w-3.5 h-3.5 text-[#2D7F9F]" />
                        <span><strong>Assistant Note:</strong> {req.adminNotes}</span>
                      </div>
                    ) : null}
                    <button
                      onClick={() => handleOpenNote(req)}
                      className="text-[11px] text-[#2D7F9F] hover:text-[#236F91] hover:underline font-semibold cursor-pointer"
                    >
                      {req.adminNotes ? 'Edit Note' : '+ Add Note for Student'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status Action Buttons in Academic Slate */}
              <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-[#DBE4EA] pt-3 lg:pt-0 lg:pl-5 self-stretch lg:self-center justify-end">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(req.id, 'approved')}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#E9F3F6] hover:bg-[#2D7F9F] hover:text-white text-[#2D7F9F] border border-[#2D7F9F]/30 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateRequestStatus(req.id, 'rejected')}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#FAF1F0] hover:bg-[#A65D57] hover:text-white text-[#A65D57] border border-[#A65D57]/30 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {req.status === 'approved' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'prepared')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#4C6073] hover:bg-[#414E56] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Mark Prepared in Lab</span>
                  </button>
                )}

                {req.status === 'prepared' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'ready')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready for Student Pickup</span>
                  </button>
                )}

                {req.status === 'ready' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'fulfilled')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F7F9FB] hover:bg-[#DBE4EA] text-[#1F3547] border border-[#DBE4EA] rounded-xl transition-all cursor-pointer"
                  >
                    <span>Mark Completed</span>
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
