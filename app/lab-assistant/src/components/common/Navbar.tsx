import React from 'react';
import { useLab } from '../../context/LabContext';
import { 
  FlaskConical, 
  Atom, 
  Dna, 
  Layers, 
  Plus, 
  LogOut 
} from 'lucide-react';
import { LabType } from '../../types/lab';

interface NavbarProps {
  onRequestOpen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRequestOpen,
}) => {
  const {
    page,
    selectedLabPortal,
    setSelectedLabPortal,
    currentUser,
    logout,
    navigateTo
  } = useLab();

  if (page === 'login') return null;

  const labs: { id: LabType; name: string; icon: React.ReactNode }[] = [
    { id: 'chemistry', name: 'Chemistry', icon: <FlaskConical className="w-4 h-4 text-[#2D7F9F]" /> },
    { id: 'physics', name: 'Physics', icon: <Atom className="w-4 h-4 text-[#4C6073]" /> },
    { id: 'biology', name: 'Biology', icon: <Dna className="w-4 h-4 text-[#2D7F9F]" /> },
  ];

  const initials = (currentUser?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-[#DBE4EA] shadow-[0_1px_3px_rgba(31,41,51,0.04)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Hub Link with Vector Logo */}
          <div 
            onClick={() => currentUser?.role === 'staff' ? navigateTo('staff-dashboard') : navigateTo('student-hub')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#253B53] text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5 text-[#2D7F9F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#1F3547]">
                  Lab Assistant
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#F7F9FB] text-[#4C6073] border border-[#DBE4EA]">
                  {currentUser?.role === 'staff' ? 'Staff Portal' : 'Student Hub'}
                </span>
              </div>
              <p className="text-xs text-[#61728A] hidden sm:block">
                School Science Inventory & Requisition System
              </p>
            </div>
          </div>

          {/* Student Hub Lab Switcher shortcuts */}
          {currentUser?.role === 'student' && page === 'lab-store' && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#F7F9FB] p-1 rounded-2xl border border-[#DBE4EA]">
              <button
                onClick={() => navigateTo('student-hub')}
                className="px-3 py-1 text-xs font-semibold text-[#61728A] hover:text-[#1F3547] flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Portals</span>
              </button>
              {labs.map((lab) => {
                const isActive = selectedLabPortal === lab.id;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setSelectedLabPortal(lab.id);
                      navigateTo('lab-store', lab.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#2D7F9F] text-white shadow-sm'
                        : 'text-[#4C6073] hover:text-[#1F3547]'
                    }`}
                  >
                    {lab.icon}
                    <span>{lab.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Side: Requisition trigger & User Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Requisition Button for Students */}
            {currentUser?.role === 'student' && onRequestOpen && (
              <button
                onClick={onRequestOpen}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Requisition</span>
              </button>
            )}

            {/* User Profile Monogram Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#DBE4EA]">
              <div className="w-8 h-8 rounded-full bg-[#253B53] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#DBE4EA]">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#1F3547] leading-tight">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-[#61728A] leading-tight">
                  {currentUser?.grade || currentUser?.email}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-[#61728A] hover:text-[#A65D57] hover:bg-[#FAF1F0] rounded-xl transition-colors cursor-pointer"
              title="Sign Out / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
