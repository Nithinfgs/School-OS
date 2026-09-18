import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { 
  GraduationCap, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Zap,
  Sparkles,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { loginAsStudent, loginAsStaff } = useLab();

  const [role, setRole] = useState<'student' | 'staff'>('student');
  
  // Student inputs
  const [studentName, setStudentName] = useState('Rohan Verma');
  const [studentEmail, setStudentEmail] = useState('rohan.verma@school.edu');
  
  // Staff inputs
  const [staffName, setStaffName] = useState('Dr. Sarah Jenkins');
  const [staffEmail, setStaffEmail] = useState('s.jenkins@school.edu');
  const [staffPassword, setStaffPassword] = useState('••••••••');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStudent(studentName.trim(), studentEmail.trim());
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStaff(staffName.trim(), staffEmail.trim());
  };

  const handleQuickDevStudent = () => {
    loginAsStudent('Nithin Selvaraj', 'nithin.s@school.edu');
  };

  const handleQuickDevStaff = () => {
    loginAsStaff('Dr. Sarah Jenkins', 's.jenkins@school.edu');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F9FB] text-[#1F3547] font-sans relative overflow-hidden">
      
      {/* Background Soft Tint Glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#2D7F9F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#4C6073]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Vector Logo */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#253B53] text-white flex items-center justify-center shadow-xs">
            <FlaskConical className="w-5 h-5 text-[#2D7F9F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#1F3547]">
                Lab Assistant
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#E9F3F6] text-[#2D7F9F] border border-[#2D7F9F]/30">
                School Science Portal
              </span>
            </div>
            <p className="text-xs text-[#61728A] hidden sm:block">
              Chemistry • Physics • Biology Material & Requisition Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#4C6073] bg-white px-3 py-1.5 rounded-xl border border-[#DBE4EA] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#2D7F9F]" />
          <span>Academic Edition</span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white border border-[#DBE4EA] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#253B53]/5 relative"
        >
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1F3547]">
              Sign in to School Labs
            </h1>
            <p className="text-xs text-[#61728A] mt-1.5">
              Access the inventory store, browse apparatus, and submit material requisitions.
            </p>
          </div>

          {/* Dev Quick Login Bypass */}
          <div className="mb-6 p-3.5 bg-[#F7F9FB] border border-[#DBE4EA] rounded-2xl">
            <div className="flex items-center gap-1.5 text-[#1F3547] text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-[#B58B4E] animate-pulse" />
              <span>Dev Quick 1-Click Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDevStudent}
                className="px-3 py-2 bg-white hover:bg-[#2D7F9F] hover:text-white text-[#1F3547] border border-[#DBE4EA] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#2D7F9F]" />
                <span>Dev Student</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDevStaff}
                className="px-3 py-2 bg-white hover:bg-[#253B53] hover:text-white text-[#1F3547] border border-[#DBE4EA] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#4C6073]" />
                <span>Dev Staff</span>
              </button>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F7F9FB] rounded-2xl mb-5 border border-[#DBE4EA]">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'student'
                  ? 'bg-white text-[#1F3547] shadow-xs border border-[#DBE4EA]'
                  : 'text-[#61728A] hover:text-[#1F3547]'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#2D7F9F]" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'staff'
                  ? 'bg-white text-[#1F3547] shadow-xs border border-[#DBE4EA]'
                  : 'text-[#61728A] hover:text-[#1F3547]'
              }`}
            >
              <Wrench className="w-4 h-4 text-[#4C6073]" />
              <span>Lab Assistant</span>
            </button>
          </div>

          {/* Student Form */}
          <AnimatePresence mode="wait">
            {role === 'student' ? (
              <motion.form
                key="student-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleStudentSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1F3547] mb-1.5">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rohan Verma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F3547] mb-1.5">
                    School Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
                    <input
                      type="email"
                      required
                      placeholder="student@school.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer"
                >
                  <span>Enter Student Portals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-[#61728A] pt-1">
                  Redirects to Chemistry, Physics & Biology Portals
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="staff-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleStaffSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1F3547] mb-1.5">
                    Lab Instructor / Attendant Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#253B53]/30 text-[#1F3547] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F3547] mb-1.5">
                    Staff School Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#253B53]/30 text-[#1F3547] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F3547] mb-1.5">
                    Authorization Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61728A]" />
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#253B53]/30 text-[#1F3547] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#253B53] hover:bg-[#1F3547] text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-[#2D7F9F]" />
                  <span>Open Lab Assistant Dashboard</span>
                </button>

                <p className="text-[11px] text-center text-[#61728A] pt-1">
                  Access live inventory control, practical consumption logger & approvals
                </p>
              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-[#61728A]">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2D7F9F]" />
          <span>School Laboratory Safety & Material Requisition System</span>
        </div>
      </footer>

    </div>
  );
};
