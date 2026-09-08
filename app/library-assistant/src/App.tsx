import React from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { LoginPage } from './components/auth/LoginPage';
import { StudentView } from './components/student/StudentView';
import { StaffView } from './components/staff/StaffView';
import { ToastContainer } from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { page, userRole } = useLibrary();

  return (
    <>
      <ToastContainer />
      {page === 'login' && <LoginPage />}
      {page !== 'login' && userRole === 'student' && <StudentView />}
      {page !== 'login' && userRole === 'staff' && <StaffView />}
    </>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
