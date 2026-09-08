'use client';

import React, { useEffect, useState } from 'react';
import { LabProvider, useLab } from './src/context/LabContext';
import { StudentHeroHub } from './src/components/student/StudentHeroHub';
import { LabStoreDesktop } from './src/components/student/LabStoreDesktop';
import { StaffView } from './src/components/staff/StaffView';
import { ToastContainer } from './src/components/common/ToastContainer';
import { FloatingCartButton } from './src/components/cart/FloatingCartButton';
import { RequisitionCartDrawer } from './src/components/cart/RequisitionCartDrawer';
import { AnimatePresence, motion } from 'framer-motion';

type WorkspaceMember = {
  role?: string;
  name?: string;
  email?: string;
  department?: string;
  studentId?: string;
};

function LabAssistantContent({ member }: { member: WorkspaceMember }) {
  const { page, currentUser, loginAsStudent, loginAsStaff } = useLab();

  useEffect(() => {
    const staff = member.role === 'Admin' || member.role === 'Lab Assistant';
    const expectedRole = staff ? 'staff' : 'student';
    const identityMatches =
      currentUser?.role === expectedRole &&
      (!member.email || currentUser.email === member.email);
    if (identityMatches) return;
    if (staff) {
      loginAsStaff(
        member.name || 'Lab Assistant',
        member.email || 'lab.assistant@schoolos.local',
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
    return <div className="lab-assistant-loading">Loading lab workspace…</div>;
  }

  const isStaff = currentUser.role === 'staff';
  return (
    <div className="lab-assistant-embed">
      <AnimatePresence mode="wait">
        {isStaff ? (
          <motion.div key="staff" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StaffView />
          </motion.div>
        ) : page === 'lab-store' ? (
          <motion.div key="store" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <LabStoreDesktop />
          </motion.div>
        ) : (
          <motion.div key="hub" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StudentHeroHub />
          </motion.div>
        )}
      </AnimatePresence>
      {!isStaff && <><FloatingCartButton /><RequisitionCartDrawer /></>}
      <ToastContainer />
    </div>
  );
}

export function LabAssistantWorkspace({
  member,
  sharedRows = [],
}: {
  member: WorkspaceMember;
  sharedRows?: any[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) return <div className="lab-assistant-loading">Loading lab workspace…</div>;

  return (
    <LabProvider sharedRows={sharedRows}>
      <LabAssistantContent member={member} />
    </LabProvider>
  );
}
