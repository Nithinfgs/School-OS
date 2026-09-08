'use client';

import React, { useEffect, useState } from 'react';
import { LibraryProvider, useLibrary } from './src/context/LibraryContext';
import { StudentHeroHub } from './src/components/student/StudentHeroHub';
import { BookStoreDesktop } from './src/components/student/BookStoreDesktop';
import { ReadingTrackerView } from './src/components/student/ReadingTrackerView';
import { MyLoansAndWaitlistView } from './src/components/student/MyLoansAndWaitlistView';
import { StaffView } from './src/components/staff/StaffView';
import { BookCartDrawer } from './src/components/cart/BookCartDrawer';
import { FloatingCartButton } from './src/components/cart/FloatingCartButton';
import { RequestBookPurchaseModal } from './src/components/student/RequestBookPurchaseModal';
import { ToastContainer } from './src/components/common/ToastContainer';
import { AnimatePresence, motion } from 'framer-motion';

type WorkspaceMember = {
  role?: string;
  name?: string;
  email?: string;
  department?: string;
};

function LibraryAssistantContent({ member }: { member: WorkspaceMember }) {
  const { page, currentUser, loginAsStudent, loginAsStaff } = useLibrary();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    const staff = member.role === 'Admin' || member.role === 'Librarian' || member.role === 'Library Assistant';
    const expectedRole = staff ? 'staff' : 'student';
    const identityMatches =
      currentUser?.role === expectedRole &&
      (!member.email || currentUser.email === member.email);
    if (identityMatches) return;
    if (staff) {
      loginAsStaff(
        member.name || 'Library Assistant',
        member.email || 'librarian@schoolos.local',
      );
    } else {
      loginAsStudent(
        member.name || 'Student',
        member.email || 'student@schoolos.local',
        member.department || 'Student',
      );
    }
  }, [currentUser, loginAsStaff, loginAsStudent, member]);

  if (!currentUser) {
    return <div className="library-assistant-loading">Loading library workspace…</div>;
  }

  const isStaff = currentUser.role === 'staff';
  return (
    <div className="library-assistant-embed">
      <AnimatePresence mode="wait">
        {isStaff ? (
          <motion.div key="staff" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StaffView />
          </motion.div>
        ) : page === 'book-store' ? (
          <motion.div key="store" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <BookStoreDesktop />
          </motion.div>
        ) : page === 'reading-tracker' ? (
          <motion.div key="reading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ReadingTrackerView />
          </motion.div>
        ) : page === 'my-loans' ? (
          <motion.div key="loans" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <MyLoansAndWaitlistView />
          </motion.div>
        ) : (
          <motion.div key="hub" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StudentHeroHub onRequestPurchaseOpen={() => setIsPurchaseModalOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      {!isStaff && <><BookCartDrawer /><FloatingCartButton /><RequestBookPurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} /></>}
      <ToastContainer />
    </div>
  );
}

export function LibraryAssistantWorkspace({
  member,
  sharedRows = [],
}: {
  member: WorkspaceMember;
  sharedRows?: any[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) return <div className="library-assistant-loading">Loading library workspace…</div>;

  return (
    <LibraryProvider sharedRows={sharedRows} embedded>
      <LibraryAssistantContent member={member} />
    </LibraryProvider>
  );
}
