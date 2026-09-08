import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import { RequestBookPurchaseModal } from './RequestBookPurchaseModal';
import { 
  BookmarkCheck, 
  Hourglass, 
  BookPlus, 
  History, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X,
  Plus
} from 'lucide-react';

export const MyLoansAndWaitlistView: React.FC = () => {
  const { 
    loans, 
    waitlist, 
    purchaseRequests, 
    leaveWaitlist, 
    renewLoan, 
    returnBook, 
    currentUser, 
    navigateTo 
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'loans' | 'waitlist' | 'requests' | 'history'>('loans');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const studentEmail = currentUser?.email || 'rohan.verma@school.edu';

  const myLoans = loans.filter((l) => l.studentEmail === studentEmail);
  const activeLoans = myLoans.filter((l) => l.status === 'active' || l.status === 'overdue' || l.status === 'renewed');
  const returnedLoans = myLoans.filter((l) => l.status === 'returned');

  const myWaitlist = waitlist.filter((w) => w.studentEmail === studentEmail && w.status !== 'cancelled');
  const myRequests = purchaseRequests.filter((r) => r.studentEmail === studentEmail);

  const calculateDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('student-hub')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#1F3547] hover:bg-[#F8FAFC] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D7F9F]" />
            <span>Back to Hub</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1F3547] tracking-tight">
              My Library Portal & Records 🗂️
            </h1>
            <p className="text-xs text-[#64748B]">
              Manage active borrowed books, waitlist queue status, and acquisition requests
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPurchaseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Book</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl w-fit border border-[#E2E8F0] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'loans'
              ? 'bg-white text-[#1F3547] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F3547]'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-[#2D7F9F]" />
          <span>Active Loans ({activeLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'waitlist'
              ? 'bg-white text-[#1F3547] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F3547]'
          }`}
        >
          <Hourglass className="w-4 h-4 text-[#B45309]" />
          <span>Waitlists & Reservations ({myWaitlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-white text-[#1F3547] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F3547]'
          }`}
        >
          <BookPlus className="w-4 h-4 text-[#2B7796]" />
          <span>Book Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-[#1F3547] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F3547]'
          }`}
        >
          <History className="w-4 h-4 text-[#64748B]" />
          <span>Past Returns ({returnedLoans.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Loans */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
              <BookmarkCheck className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1F3547]">No Active Loans</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1 mb-4">
                You have returned all borrowed books. Browse the catalog to pick your next reading adventure!
              </p>
              <button
                onClick={() => navigateTo('book-store')}
                className="px-5 py-2.5 bg-[#2D7F9F] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
              {activeLoans.map((loan) => {
                const daysLeft = calculateDaysRemaining(loan.dueDate);
                const isOverdue = daysLeft < 0;

                return (
                  <div key={loan.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={loan.collection === 'academic' ? 'academic' : 'fiction'} size="sm">
                          {loan.bookCategory}
                        </Badge>
                        {isOverdue ? (
                          <Badge variant="error" size="sm" dot>
                            ⚠️ {Math.abs(daysLeft)} Day{Math.abs(daysLeft) !== 1 ? 's' : ''} Past Due
                          </Badge>
                        ) : daysLeft <= 2 ? (
                          <Badge variant="warning" size="sm" dot>
                            Due in {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" dot>
                            {daysLeft} Days Remaining
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-[#1F3547]">
                        {loan.bookTitle}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        By <span className="font-semibold text-[#334155]">{loan.bookAuthor}</span> • Issued by {loan.issuedByStaff}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        Borrowed on {new Date(loan.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Due on <strong className="text-[#1F3547]">{new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => renewLoan(loan.id)}
                        disabled={loan.renewCount >= loan.maxRenewals}
                        className="flex items-center gap-1 py-2 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] disabled:opacity-50 text-[#334155] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew ({loan.renewCount}/{loan.maxRenewals})</span>
                      </button>

                      <button
                        onClick={() => returnBook(loan.id)}
                        className="py-2 px-4 bg-[#EBF5EE] hover:bg-[#D4EDDA] text-[#2D7F9F] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Return Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Waitlists & Reservations */}
      {activeTab === 'waitlist' && (
        <div className="space-y-4">
          {myWaitlist.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
              <Hourglass className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1F3547]">No Active Waitlists</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
                When a popular book is out of stock, you can click "Join Waitlist" to secure your spot in line.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
              {myWaitlist.map((entry) => (
                <div key={entry.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.collection === 'academic' ? 'academic' : 'fiction'} size="sm">
                        {entry.category}
                      </Badge>
                      {entry.status === 'ready_for_pickup' ? (
                        <Badge variant="success" size="sm" dot>
                          🔔 Ready for Pickup!
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" dot>
                          Queue Position #{entry.queuePosition}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-[#1F3547]">
                      {entry.bookTitle}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      By {entry.bookAuthor} • Joined waitlist on {new Date(entry.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>

                    {entry.status === 'ready_for_pickup' && entry.pickupDeadline && (
                      <p className="text-xs font-bold text-[#2D7F9F] bg-[#EBF5EE] p-2 rounded-xl border border-[#2D7F9F]/20 mt-1">
                        A copy has been returned and held for you! Please pick it up at the Library Desk before {new Date(entry.pickupDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => leaveWaitlist(entry.id)}
                      className="flex items-center gap-1 py-2 px-3 text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Leave Queue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Book Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
              <BookPlus className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1F3547]">No Book Requests</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1 mb-4">
                Want a specific book that the school doesn't own? Request the library to acquire it!
              </p>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="px-5 py-2.5 bg-[#2D7F9F] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                + Request New Book
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
              {myRequests.map((req) => {
                const statusStyles = {
                  pending: { variant: 'warning' as const, label: 'Under Librarian Review' },
                  approved: { variant: 'info' as const, label: 'Approved for Acquisition' },
                  ordered: { variant: 'academic' as const, label: 'Order Dispatched' },
                  arrived: { variant: 'success' as const, label: 'Cataloged & On Shelf' },
                  rejected: { variant: 'error' as const, label: 'Declined' },
                }[req.status];

                return (
                  <div key={req.id} className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusStyles.variant} size="sm" dot>
                          {statusStyles.label}
                        </Badge>
                        <span className="text-xs font-semibold text-[#64748B]">
                          {req.subjectGenre}
                        </span>
                      </div>
                      <span className="text-xs text-[#94A3B8]">
                        Submitted {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#1F3547]">
                      {req.bookTitle}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      By <span className="font-semibold">{req.author}</span> {req.publisher && `• ${req.publisher}`} {req.estimatedPrice && `• ${req.estimatedPrice}`}
                    </p>

                    <p className="text-xs text-[#334155] italic bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      Reason: "{req.reasonForPurchase}"
                    </p>

                    {req.adminNotes && (
                      <p className="text-xs text-[#2D7F9F] bg-[#EBF5EE] p-2.5 rounded-xl border border-[#2D7F9F]/20">
                        Librarian Note: <strong>{req.adminNotes}</strong> {req.reviewedBy && `(Reviewed by ${req.reviewedBy})`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Past Returns */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {returnedLoans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
              <History className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1F3547]">No Returned Books Yet</h3>
              <p className="text-xs text-[#94A3B8]">
                Your returned book records will appear here for reference and reading history.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
              {returnedLoans.map((loan) => (
                <div key={loan.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1F3547]">
                      {loan.bookTitle}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      By {loan.bookAuthor} • {loan.bookCategory}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Returned on: {loan.returnedDate ? new Date(loan.returnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Returned'}
                    </p>
                  </div>

                  <Badge variant="success" size="sm">
                    Returned
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Book Purchase Modal */}
      <RequestBookPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

    </div>
  );
};
