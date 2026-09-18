import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Clock, 
  Layers, 
  Plus, 
  LogOut, 
  BookmarkCheck,
  ShoppingBag
} from 'lucide-react';
import { CollectionType } from '../../types/library';

interface NavbarProps {
  onRequestPurchaseOpen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRequestPurchaseOpen,
}) => {
  const {
    page,
    selectedCollection,
    setSelectedCollection,
    currentUser,
    logout,
    navigateTo,
    cart,
    setIsCartOpen
  } = useLibrary();

  if (page === 'login') return null;

  const collections: { id: CollectionType; name: string; icon: React.ReactNode }[] = [
    { id: 'academic', name: 'Academic', icon: <GraduationCap className="w-3.5 h-3.5 text-[#2B7796]" /> },
    { id: 'fiction', name: 'Fiction', icon: <Sparkles className="w-3.5 h-3.5 text-[#1E7492]" /> },
  ];

  const initials = (currentUser?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Home Link with Vector Logo */}
          <div 
            onClick={() => currentUser?.role === 'staff' ? navigateTo('staff-dashboard') : navigateTo('student-hub')}
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#253B53] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#2D7F9F]" />
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#1F3547] whitespace-nowrap">
                  Library Assistant
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] whitespace-nowrap">
                  {currentUser?.role === 'staff' ? 'Librarian Console' : 'Student Hub'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] hidden md:block whitespace-nowrap">
                School Science & Literature Hub
              </p>
            </div>
          </div>

          {/* Student Center Quick Navigation Pills - Only shown on subpages like Lab-Assistant */}
          {currentUser?.role === 'student' && page !== 'student-hub' && (
            <div className="hidden md:flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0] flex-shrink-0">
              <button
                onClick={() => navigateTo('student-hub')}
                className="px-2.5 py-1 text-xs font-semibold text-[#64748B] hover:text-[#1F3547] flex items-center gap-1 rounded-xl transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Portals</span>
              </button>

              {collections.map((col) => {
                const isActive = page === 'book-store' && selectedCollection === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      setSelectedCollection(col.id);
                      navigateTo('book-store', col.id);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2D7F9F] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1F3547]'
                    }`}
                  >
                    {col.icon}
                    <span>{col.name}</span>
                  </button>
                );
              })}

              <button
                onClick={() => navigateTo('reading-tracker')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  page === 'reading-tracker'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tracker</span>
              </button>

              <button
                onClick={() => navigateTo('my-loans')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  page === 'my-loans'
                    ? 'bg-[#236F91] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Loans</span>
              </button>
            </div>
          )}

          {/* Right Side: Requisition, Bag & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Quick Request Button for Students */}
            {currentUser?.role === 'student' && onRequestPurchaseOpen && (
              <button
                onClick={onRequestPurchaseOpen}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request</span>
              </button>
            )}

            {/* Cart Button */}
            {currentUser?.role === 'student' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#475569] hover:text-[#1F3547] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
                title="View Borrow Bag"
              >
                <ShoppingBag className="w-4 h-4 text-[#2D7F9F]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Monogram Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#253B53] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#E2E8F0] flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left flex-shrink-0">
                <p className="text-xs font-bold text-[#1F3547] leading-tight whitespace-nowrap">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-[#64748B] leading-tight whitespace-nowrap">
                  {currentUser?.grade || currentUser?.email}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer flex-shrink-0"
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
