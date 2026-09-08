import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Navbar } from '../common/Navbar';
import { StudentHeroHub } from './StudentHeroHub';
import { BookStoreDesktop } from './BookStoreDesktop';
import { ReadingTrackerView } from './ReadingTrackerView';
import { MyLoansAndWaitlistView } from './MyLoansAndWaitlistView';
import { BookCartDrawer } from '../cart/BookCartDrawer';
import { FloatingCartButton } from '../cart/FloatingCartButton';
import { RequestBookPurchaseModal } from './RequestBookPurchaseModal';

export const StudentView: React.FC = () => {
  const { page } = useLibrary();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <div>
        <Navbar onRequestPurchaseOpen={() => setIsPurchaseModalOpen(true)} />

        <main>
          {page === 'student-hub' && (
            <StudentHeroHub onRequestPurchaseOpen={() => setIsPurchaseModalOpen(true)} />
          )}

          {page === 'book-store' && <BookStoreDesktop />}

          {page === 'reading-tracker' && <ReadingTrackerView />}

          {page === 'my-loans' && <MyLoansAndWaitlistView />}
        </main>
      </div>

      {/* Cart components */}
      <BookCartDrawer />
      <FloatingCartButton />

      {/* Book Acquisition Purchase Request Modal */}
      <RequestBookPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Library Assistant • School Science & Literature Management System</p>
          <p className="text-[11px] text-[#94A3B8]">
            Connected to Central Library Circulation & Requisition Catalog
          </p>
        </div>
      </footer>
    </div>
  );
};
