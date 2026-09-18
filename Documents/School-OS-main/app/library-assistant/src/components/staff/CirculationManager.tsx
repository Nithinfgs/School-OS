import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookLoan } from '../../types/library';
import { Badge } from '../common/Badge';
import { exportLoansToCsv } from '../../utils/exportCsv';
import { 
  Search, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Layers, 
  Filter,
  User
} from 'lucide-react';

export const CirculationManager: React.FC = () => {
  const { loans, returnBook, renewLoan, addToast } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'active' | 'returned'>('all');
  const [returnNotesMap, setReturnNotesMap] = useState<Record<string, string>>({});

  const calculateDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 3600 * 24));
  };

  const filteredLoans = loans.filter((loan) => {
    const daysLeft = calculateDaysRemaining(loan.dueDate);
    const isOverdue = daysLeft < 0 && loan.status !== 'returned';
    const isDueSoon = daysLeft >= 0 && daysLeft <= 2 && loan.status !== 'returned';

    if (statusFilter === 'overdue' && !isOverdue) return false;
    if (statusFilter === 'due_soon' && !isDueSoon) return false;
    if (statusFilter === 'active' && loan.status === 'returned') return false;
    if (statusFilter === 'returned' && loan.status !== 'returned') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.studentName.toLowerCase().includes(q) ||
        loan.studentEmail.toLowerCase().includes(q) ||
        loan.studentGrade.toLowerCase().includes(q) ||
        loan.bookCategory.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const overdueCount = loans.filter(
    (l) => calculateDaysRemaining(l.dueDate) < 0 && l.status !== 'returned'
  ).length;

  const dueSoonCount = loans.filter((l) => {
    const d = calculateDaysRemaining(l.dueDate);
    return d >= 0 && d <= 2 && l.status !== 'returned';
  }).length;

  const handleSendOverdueNotice = (loan: BookLoan, daysPastDue: number) => {
    addToast({
      type: 'warning',
      title: 'Overdue Notice Dispatched 📧',
      message: `Sent automatic email reminder to ${loan.studentName} (${loan.studentEmail}) for "${loan.bookTitle}" (${daysPastDue} days overdue).`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Circulation
            </p>
            <h4 className="text-xl font-black text-[#1F3547]">
              {loans.filter((l) => l.status !== 'returned').length} Books on Loan
            </h4>
          </div>
          <div className="p-3 bg-[#2D7F9F]/10 text-[#2D7F9F] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Overdue Loans
            </p>
            <h4 className="text-xl font-black text-[#DC2626]">
              {overdueCount} Past Due
            </h4>
          </div>
          <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Expiring Within 48h
            </p>
            <h4 className="text-xl font-black text-[#D97706]">
              {dueSoonCount} Due Soon
            </h4>
          </div>
          <div className="p-3 bg-[#D97706]/10 text-[#D97706] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls: Search, Filter, Export */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search student, book title, grade, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
          />
        </div>

        {/* Filter & Export */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-[#1F3547] focus:outline-none cursor-pointer"
            >
              <option value="all">All Loans ({loans.length})</option>
              <option value="overdue">Overdue Only ({overdueCount})</option>
              <option value="due_soon">Due Soon ({dueSoonCount})</option>
              <option value="active">All Active</option>
              <option value="returned">Returned History</option>
            </select>
          </div>

          <button
            onClick={() => {
              exportLoansToCsv(filteredLoans);
              addToast({
                type: 'success',
                title: 'Shared Books CSV Exported! 📊',
                message: `Exported ${filteredLoans.length} filtered circulation records.`
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Download CSV record of shared/borrowed books"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Shared Books CSV</span>
          </button>
        </div>

      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Book Title & Category</th>
                <th className="px-5 py-3.5">Borrower Student</th>
                <th className="px-5 py-3.5">Borrow Date</th>
                <th className="px-5 py-3.5">Due Date & Overdue Status</th>
                <th className="px-5 py-3.5 text-right">Circulation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#94A3B8]">
                    No loan records match the active filter.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const daysLeft = calculateDaysRemaining(loan.dueDate);
                  const isOverdue = daysLeft < 0 && loan.status !== 'returned';
                  const daysPastDue = Math.abs(daysLeft);

                  return (
                    <tr key={loan.id} className="hover:bg-[#F8FAFC] transition-colors">
                      
                      {/* Book info */}
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-[#1F3547] line-clamp-1 max-w-xs">
                          {loan.bookTitle}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          By {loan.bookAuthor} • <span className="font-semibold">{loan.bookCategory}</span>
                        </div>
                        {loan.seriesName && (
                          <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.5 rounded mt-1 inline-block">
                            {loan.seriesName} {loan.seriesVolume ? `(Part ${loan.seriesVolume})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Student info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#1F3547] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{loan.studentName}</span>
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {loan.studentGrade}
                        </div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">
                          {loan.studentEmail}
                        </div>
                      </td>

                      {/* Borrow Date */}
                      <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                        {new Date(loan.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Due Date & Overdue Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-[#1F3547]">
                          {new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="mt-1">
                          {loan.status === 'returned' ? (
                            <Badge variant="success" size="sm">
                              Returned
                            </Badge>
                          ) : isOverdue ? (
                            <Badge variant="error" size="sm" dot>
                              ⚠️ {daysPastDue} Day{daysPastDue !== 1 ? 's' : ''} Past Due
                            </Badge>
                          ) : daysLeft <= 2 ? (
                            <Badge variant="warning" size="sm" dot>
                              Due in {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <Badge variant="info" size="sm" dot>
                              On Time ({daysLeft}d left)
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {loan.status !== 'returned' ? (
                          <div className="flex items-center justify-end gap-2">
                            {isOverdue && (
                              <button
                                onClick={() => handleSendOverdueNotice(loan, daysPastDue)}
                                className="p-2 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] rounded-xl transition-colors cursor-pointer"
                                title="Send Overdue Email Alert to Student"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => renewLoan(loan.id)}
                              disabled={loan.renewCount >= loan.maxRenewals}
                              className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] disabled:opacity-50 text-[#334155] font-bold rounded-xl transition-colors cursor-pointer"
                              title="Extend Loan (+14 Days)"
                            >
                              Renew ({loan.renewCount}/{loan.maxRenewals})
                            </button>

                            <button
                              onClick={() => returnBook(loan.id, returnNotesMap[loan.id])}
                              className="px-3.5 py-1.5 bg-[#2D7F9F] hover:bg-[#236F91] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              Check In & Return
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] italic">
                            Checked In on {loan.returnedDate ? new Date(loan.returnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Record'}
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
