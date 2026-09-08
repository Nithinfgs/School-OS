import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Clock, 
  Hourglass, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { loginAsStudent, loginAsStaff } = useLibrary();

  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');

  // Student Form
  const [studentName, setStudentName] = useState('Rohan Verma');
  const [studentEmail, setStudentEmail] = useState('rohan.verma@school.edu');
  const [studentGrade, setStudentGrade] = useState('Grade 11 - Section A');

  // Staff Form
  const [staffName, setStaffName] = useState('Mrs. Eleanor Vance');
  const [staffEmail, setStaffEmail] = useState('e.vance@school.edu');
  const [staffPassword, setStaffPassword] = useState('••••••••');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStudent(studentName.trim(), studentEmail.trim(), studentGrade.trim());
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStaff(staffName.trim(), staffEmail.trim());
  };

  const handleQuickDevStudent = () => {
    loginAsStudent('Nithin Selvaraj', 'nithin.s@school.edu', 'Grade 11 - Section A');
  };

  const handleQuickDevStaff = () => {
    loginAsStaff('Mrs. Eleanor Vance', 'e.vance@school.edu');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#2D7F9F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#2B7796]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#253B53] text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-[#2D7F9F]/20">
          <BookOpen className="w-8 h-8 text-[#2D7F9F]" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#1F3547]">
          Library Assistant
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto">
          Academic Texts, Fiction Sagas, Reading Tracker, Overdue Alerts & Requisition Catalog
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2E8F0] shadow-xl space-y-6">
          
          {/* Dev Quick 1-Click Login Bypass */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-[#1F3547] text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-[#D97706] animate-pulse" />
              <span>Dev Quick 1-Click Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDevStudent}
                className="px-3 py-2 bg-white hover:bg-[#2D7F9F] hover:text-white text-[#1F3547] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#2D7F9F]" />
                <span>Dev Student</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDevStaff}
                className="px-3 py-2 bg-white hover:bg-[#253B53] hover:text-white text-[#1F3547] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2B7796]" />
                <span>Dev Librarian</span>
              </button>
            </div>
          </div>

          {/* Persona Switcher Tabs */}
          <div className="flex items-center p-1 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-[#1F3547] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1F3547]'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#2D7F9F]" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white text-[#1F3547] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1F3547]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#2B7796]" />
              <span>Librarian Desk</span>
            </button>
          </div>

          {/* Student Login Form */}
          {activeTab === 'student' && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStudentSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Student Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  School Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Class / Section
                </label>
                <input
                  type="text"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#2D7F9F]/25 transition-all cursor-pointer"
                >
                  <span>Enter Student Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* Staff Login Form */}
          {activeTab === 'staff' && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStaffSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Librarian / Staff Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B7796]/30 text-[#1F3547]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B7796]/30 text-[#1F3547]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Authorization Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B7796]/30 text-[#1F3547]"
                  />
                </div>
              </div>

              <div className="bg-[#E9F3F6] p-3 rounded-xl border border-[#C6E2EA] text-xs text-[#2B7796] space-y-1">
                <p className="font-bold">Librarian Access Privileges:</p>
                <p className="text-[11px] leading-relaxed">
                  ✓ Active circulation tracking & overdue notices<br/>
                  ✓ Book cataloging, shelf assignment & copy count edits<br/>
                  ✓ Waitlist auto-promotions & pickup dispatch<br/>
                  ✓ Student book request approvals & CSV exports
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2B7796] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#2B7796]/25 transition-all cursor-pointer"
                >
                  <span>Open Librarian Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

        </div>

        {/* Feature badges list */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#2B7796] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#1F3547]">Academic & DP Texts</p>
            <p className="text-[10px] text-[#64748B]">Chem, Phys, Math, Bio</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#1E7492] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#1F3547]">Fiction & Non-Fiction</p>
            <p className="text-[10px] text-[#64748B]">Series Part 1-5 & Sagas</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <Clock className="w-4 h-4 text-[#B45309] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#1F3547]">Reading Journey Log</p>
            <p className="text-[10px] text-[#64748B]">Minutes & Deadlines</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <Hourglass className="w-4 h-4 text-[#2D7F9F] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#1F3547]">Waitlist Priority</p>
            <p className="text-[10px] text-[#64748B]">Out-of-Stock Queues</p>
          </div>
        </div>

      </div>
    </div>
  );
};
