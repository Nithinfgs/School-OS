import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookLoan } from '../../types/library';
import { LogReadingSessionModal } from './LogReadingSessionModal';
import { Badge } from '../common/Badge';
import { 
  Clock, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Star, 
  ArrowLeft,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ReadingTrackerView: React.FC = () => {
  const { 
    loans, 
    books, 
    readingLogs, 
    returnBook, 
    renewLoan, 
    currentUser, 
    navigateTo 
  } = useLibrary();

  const [selectedLoanForLog, setSelectedLoanForLog] = useState<BookLoan | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  const studentLoans = loans.filter(
    (l) => l.studentEmail === (currentUser?.email || 'rohan.verma@school.edu')
  );

  const activeLoans = studentLoans.filter(
    (l) => l.status === 'active' || l.status === 'overdue' || l.status === 'renewed'
  );

  const studentLogs = readingLogs.filter(
    (r) => r.studentEmail === (currentUser?.email || 'rohan.verma@school.edu')
  );

  // Compute stats
  const totalMinutes = studentLogs.reduce((acc, l) => acc + l.minutesRead, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedBooksCount = studentLogs.filter((l) => l.completedBook).length;

  const handleOpenLogModal = (loan?: BookLoan) => {
    setSelectedLoanForLog(loan || null);
    setIsLogModalOpen(true);
  };

  const calculateDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* Header & Breadcrumb */}
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
              My Reading Journey & Tracker ⏱️
            </h1>
            <p className="text-xs text-[#64748B]">
              Track active book deadlines, hours read, page progress & reflection logs
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenLogModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#B45309]/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Reading Session</span>
        </button>
      </div>

      {/* Reading Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#B45309]/10 text-[#B45309]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Time Read
            </p>
            <h3 className="text-2xl font-black text-[#1F3547]">
              {totalHours} <span className="text-xs font-bold text-[#64748B]">Hours</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#2D7F9F]/10 text-[#2D7F9F]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Books In Progress
            </p>
            <h3 className="text-2xl font-black text-[#1F3547]">
              {activeLoans.length} <span className="text-xs font-bold text-[#64748B]">Titles</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#2B7796]/10 text-[#2B7796]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Finished Books
            </p>
            <h3 className="text-2xl font-black text-[#1F3547]">
              {completedBooksCount} <span className="text-xs font-bold text-[#64748B]">Read</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#DC2626]/10 text-[#DC2626]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Session Logs
            </p>
            <h3 className="text-2xl font-black text-[#1F3547]">
              {studentLogs.length} <span className="text-xs font-bold text-[#64748B]">Entries</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Section 1: Active Borrowed Books & Deadlines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#1F3547] tracking-tight">
              Currently Borrowed Books & Deadlines
            </h2>
            <p className="text-xs text-[#64748B]">
              Keep track of how far along you are and when your loan expires
            </p>
          </div>
          <span className="text-xs font-bold text-[#64748B]">
            {activeLoans.length} Active Loan{activeLoans.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-10 text-center">
            <BookOpen className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#1F3547]">No Books Currently Checked Out</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
              Explore the library catalog to borrow academic textbooks or fiction sagas!
            </p>
            <button
              onClick={() => navigateTo('book-store')}
              className="px-5 py-2.5 bg-[#2D7F9F] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Browse Library Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeLoans.map((loan) => {
              const matchedBook = books.find((b) => b.id === loan.bookId);
              const daysLeft = calculateDaysRemaining(loan.dueDate);
              const isOverdue = daysLeft < 0;

              // Find latest log for this book
              const bookLogs = studentLogs.filter((l) => l.bookId === loan.bookId);
              const latestLog = bookLogs[bookLogs.length - 1];
              const highestPageRead = latestLog ? latestLog.endPage : 0;
              const totalPages = matchedBook ? matchedBook.pageCount : (latestLog ? latestLog.totalPages : 300);
              const progressPercent = Math.min(100, Math.round((highestPageRead / totalPages) * 100));

              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-md"
                        style={{ backgroundColor: loan.coverColor || '#253B53' }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        {loan.seriesName && (
                          <span className="text-[9px] font-extrabold uppercase bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-md border border-[#FDE68A] mb-1 inline-block">
                            {loan.seriesName} {loan.seriesVolume ? `• Part ${loan.seriesVolume}` : ''}
                          </span>
                        )}
                        <h3 className="text-sm font-extrabold text-[#1F3547] leading-tight line-clamp-1">
                          {loan.bookTitle}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          By {loan.bookAuthor}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          Borrowed on: {new Date(loan.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Deadline Status Badge */}
                    <div>
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
                  </div>

                  {/* Reading Progress Indicator */}
                  <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#475569]">
                        Progress: {highestPageRead} / {totalPages} pages
                      </span>
                      <span className="font-extrabold text-[#B45309]">
                        {progressPercent}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B45309] to-[#F59E0B] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#94A3B8]">
                      Due Date: <strong className="text-[#1F3547]">{new Date(loan.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => handleOpenLogModal(loan)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Log Reading</span>
                    </button>

                    <button
                      onClick={() => renewLoan(loan.id)}
                      disabled={loan.renewCount >= loan.maxRenewals}
                      className="flex items-center gap-1 py-2 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] disabled:opacity-50 text-[#334155] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      title="Extend loan (+14 days)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew ({loan.renewCount}/{loan.maxRenewals})</span>
                    </button>

                    <button
                      onClick={() => returnBook(loan.id)}
                      className="py-2 px-3 bg-[#EBF5EE] hover:bg-[#D4EDDA] text-[#2D7F9F] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      title="Return book to library"
                    >
                      Return
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Reading Session History Log */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#1F3547] tracking-tight">
            Reading Session History & Reflections
          </h2>
          <p className="text-xs text-[#64748B]">
            All recorded study sessions, time spent and chapter notes
          </p>
        </div>

        {studentLogs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 text-center text-[#64748B] text-xs">
            No reading sessions logged yet. Click "+ Log Reading Session" to record your first study sprint!
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
            {studentLogs.map((log) => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[#1F3547]">
                      {log.bookTitle}
                    </h4>
                    {log.completedBook && (
                      <span className="text-[10px] font-extrabold bg-[#EBF5EE] text-[#2D7F9F] px-2 py-0.5 rounded-full border border-[#2D7F9F]/20">
                        🎉 Completed
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Read <strong className="text-[#1F3547]">{log.minutesRead} mins</strong> • Pages {log.startPage} to {log.endPage} (of {log.totalPages})
                  </p>

                  {log.reflections && (
                    <p className="text-xs text-[#334155] italic bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] mt-1 max-w-xl">
                      "{log.reflections}"
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  <span className="text-xs text-[#94A3B8]">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {log.rating && (
                    <div className="flex items-center gap-0.5 text-xs text-[#F59E0B]">
                      {Array.from({ length: log.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#F59E0B]" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Reading Modal */}
      <LogReadingSessionModal
        initialLoan={selectedLoanForLog}
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedLoanForLog(null);
        }}
      />

    </div>
  );
};
