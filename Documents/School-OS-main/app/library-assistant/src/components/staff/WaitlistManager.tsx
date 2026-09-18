import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import { 
  Hourglass, 
  Search, 
  Bell, 
  CheckCircle2, 
  X, 
  BookOpen, 
  User 
} from 'lucide-react';

export const WaitlistManager: React.FC = () => {
  const { waitlist, books, leaveWaitlist, addToast } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const activeWaitlist = waitlist.filter((w) => w.status !== 'cancelled');

  const filtered = activeWaitlist.filter((w) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.bookTitle.toLowerCase().includes(q) ||
        w.studentName.toLowerCase().includes(q) ||
        w.studentEmail.toLowerCase().includes(q) ||
        w.studentGrade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group waitlist entries by book
  const groupedByBook = filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
    if (!acc[entry.bookId]) acc[entry.bookId] = [];
    acc[entry.bookId].push(entry);
    return acc;
  }, {});

  const handleNotifyStudent = (entry: (typeof waitlist)[0]) => {
    addToast({
      type: 'info',
      title: 'Pickup Notification Dispatched 🔔',
      message: `Notified ${entry.studentName} that "${entry.bookTitle}" is available for 48h pickup hold.`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search waitlist by student, book, grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
          />
        </div>

        <div className="text-xs font-bold text-[#64748B]">
          {activeWaitlist.length} Student{activeWaitlist.length !== 1 ? 's' : ''} in Reservation Queues
        </div>
      </div>

      {/* Waitlists Content */}
      {Object.keys(groupedByBook).length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          <Hourglass className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#1F3547]">No Active Waitlists</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
            When all copies of a book are checked out, student reservation requests will queue up here in priority order.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByBook).map(([bookId, entries]) => {
            const matchedBook = books.find((b) => b.id === bookId);

            return (
              <div
                key={bookId}
                className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden"
              >
                {/* Book Header */}
                <div className="p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-14 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                      style={{ backgroundColor: matchedBook?.coverColor || '#253B53' }}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1F3547]">
                        {entries[0].bookTitle}
                      </h4>
                      <p className="text-xs text-[#64748B]">
                        By {entries[0].bookAuthor} • {entries[0].category}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">
                        Call #: {matchedBook?.location.callNumber || 'N/A'} • Available Copies: <strong className={matchedBook?.availableCopies === 0 ? 'text-[#DC2626]' : 'text-[#2D7F9F]'}>{matchedBook?.availableCopies || 0} of {matchedBook?.totalCopies || 0}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 bg-[#FEF3C7] text-[#B45309] rounded-full border border-[#FDE68A] w-fit">
                    {entries.length} in Queue
                  </span>
                </div>

                {/* Queue List */}
                <div className="divide-y divide-[#F1F5F9]">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#253B53] text-white flex items-center justify-center font-extrabold text-xs">
                          #{entry.queuePosition}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#1F3547] text-xs">
                              {entry.studentName}
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              ({entry.studentGrade})
                            </span>
                            {entry.status === 'ready_for_pickup' && (
                              <Badge variant="success" size="sm" dot>
                                Ready for Pickup
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">
                            Joined queue on {new Date(entry.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {entry.studentEmail}
                          </p>
                          {entry.notes && (
                            <p className="text-[11px] text-[#475569] italic">
                              Note: "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleNotifyStudent(entry)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#E9F3F6] hover:bg-[#DCEFF4] text-[#2B7796] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notify Pickup</span>
                        </button>

                        <button
                          onClick={() => leaveWaitlist(entry.id)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                          title="Remove from queue"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
