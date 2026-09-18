import React, { useState } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './components/auth/LoginPage';
import { StudentHeroHub } from './components/student/StudentHeroHub';
import { LabStoreDesktop } from './components/student/LabStoreDesktop';
import { StaffView } from './components/staff/StaffView';
import { RequestItemModal } from './components/student/RequestItemModal';
import { FloatingCartButton } from './components/cart/FloatingCartButton';
import { RequisitionCartDrawer } from './components/cart/RequisitionCartDrawer';
import { AnimatePresence, motion } from 'framer-motion';

const MainAppContent: React.FC = () => {
  const { page, currentUser } = useLab();
  const [isGeneralRequestOpen, setIsGeneralRequestOpen] = useState(false);

  // If on login page or not logged in
  if (page === 'login' || !currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FA] text-slate-900 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar onRequestOpen={() => setIsGeneralRequestOpen(true)} />

      {/* Main Routed Page with Soft Animation */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {currentUser.role === 'staff' ? (
            <motion.div
              key="staff-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StaffView />
            </motion.div>
          ) : page === 'lab-store' ? (
            <motion.div
              key="lab-store"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LabStoreDesktop />
            </motion.div>
          ) : (
            <motion.div
              key="student-hub"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StudentHeroHub />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom-Right Floating Cart Button */}
      <FloatingCartButton />

      {/* Full Requisition Cart Drawer */}
      <RequisitionCartDrawer />

      {/* Quick Global Custom Requisition Modal */}
      <RequestItemModal
        isOpen={isGeneralRequestOpen}
        onClose={() => setIsGeneralRequestOpen(false)}
      />

      {/* Toast Notification System */}
      <ToastContainer />

      {/* Minimalist Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Lab Assistant</span>
            <span>• Chemistry, Physics & Biology School Science Hub</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Safety & Material Tracking</span>
            <span>•</span>
            <span>Digital Lab Logbook</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainAppContent />
    </LabProvider>
  );
}
