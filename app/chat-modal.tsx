'use client';

import React, { useState, useRef } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  X,
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ChatModalProps {
  ws: any;
  form: any;
  role?: 'student' | 'teacher';
  close: () => void;
}

const EMOJIS = ['👍', '❤️', '😊', '🔥', '🎉', '📚', '💡', '✅', '👏', '🚀', '🙌', '🙏', '✨', '💯'];

const QUICK_PROMPTS = {
  student: [
    { label: '❓ Question on class', text: 'Hi! I had a quick question regarding today\'s lecture topic and wanted to clarify a few points.' },
    { label: '📝 Homework help', text: 'Hello, could you provide some guidance or hints on the latest homework assignment?' },
    { label: '⏳ Request extension', text: 'Dear teacher, I would like to respectfully request a brief deadline extension for my upcoming submission due to exceptional circumstances.' },
    { label: '📅 Book office hours', text: 'Hi teacher, are you available for a 10-minute 1-on-1 check-in during your next office hours?' },
  ],
  teacher: [
    { label: '📢 Class announcement', text: 'Hello everyone, please make note of the updated schedule and materials posted on the portal.' },
    { label: '📋 Assignment reminder', text: 'Gentle reminder that your upcoming assignment submission is due this week. Please reach out if you need assistance.' },
    { label: '🌟 Great progress', text: 'Great job on your recent class participation and coursework! Keep up the fantastic effort.' },
  ],
};

export function ChatModal({ ws, form, role = 'student', close }: ChatModalProps) {
  const isStudent = role === 'student';
  const classes = (ws?.rows || []).filter((r: any) => r.kind === 'class');
  const contacts = ws?.contacts || [];
  
  // Find initial class
  const initialClassId = form?.classId || form?.row?.id || classes[0]?.id || '';
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const selectedClass = classes.find((c: any) => c.id === selectedClassId) || classes[0];

  // Eligible recipients
  const eligibleTeachers = contacts.filter((c: any) =>
    selectedClass?.name ? c.classes?.includes(selectedClass.name) : true
  );
  
  const eligibleStudents = (ws?.rows || [])
    .filter((r: any) => r.kind === 'student')
    .map((s: any) => ({ id: s.id, name: s.name }));

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    form?.recipientId || (isStudent ? eligibleTeachers[0]?.id || '' : '')
  );

  const selectedRecipient = isStudent
    ? eligibleTeachers.find((t: any) => t.id === selectedRecipientId) || eligibleTeachers[0]
    : eligibleStudents.find((s: any) => s.id === selectedRecipientId);

  const [subject, setSubject] = useState<string>(form?.subject || form?.row?.name || '');
  const [message, setMessage] = useState<string>('');
  const [files, setFiles] = useState<any[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [messagesHistory, setMessagesHistory] = useState<any[]>([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Play subtle audio pop
  const playPop = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;
    setBusy(true);
    setError('');

    const newOutgoingMsg = {
      id: 'temp-' + Date.now(),
      senderName: ws?.member?.name || 'You',
      text: message.trim(),
      files: [...files],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sending'
    };

    setMessagesHistory((prev) => [...prev, newOutgoingMsg]);
    playPop();
    const currentMsg = message.trim();
    const currentFiles = [...files];
    setMessage('');
    setFiles([]);

    try {
      if (isStudent) {
        await ws.act({
          student: true,
          action: 'message',
          classId: selectedClassId,
          recipientId: selectedRecipientId || eligibleTeachers[0]?.id,
          name: subject || 'Direct message',
          description: currentMsg,
          attachments: currentFiles.map((f) => f.id),
          submit: true
        });
      } else {
        await ws.act({
          teaching: true,
          action: 'message',
          classId: selectedClassId,
          studentId: selectedRecipientId || undefined,
          name: subject || 'Teacher message',
          description: currentMsg,
          attachments: currentFiles.map((f) => f.id),
          submit: true
        });
      }

      setMessagesHistory((prev) =>
        prev.map((m) => (m.id === newOutgoingMsg.id ? { ...m, status: 'delivered' } : m))
      );

      // Auto close with brief confirmation or let them stay
      setTimeout(() => {
        close();
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Failed to deliver message');
      setMessagesHistory((prev) =>
        prev.map((m) => (m.id === newOutgoingMsg.id ? { ...m, status: 'error' } : m))
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      data.set('class', selectedClass?.name || 'general');
      const res = await fetch('/api/files', { method: 'POST', body: data });
      const json: any = await res.json();
      if (!res.ok) throw Error(json.error || 'Upload failed');
      setFiles((prev) => [...prev, { id: json.id, name: json.name, size: file.size }]);
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const teacherName = isStudent
    ? selectedRecipient?.name || selectedClass?.data?.teacher || 'Teacher'
    : 'Class ' + (selectedClass?.name || '');

  const partnerSubtitle = isStudent
    ? `${selectedClass?.name || 'General'} · Typically replies within a few hours`
    : `${selectedClass?.name || ''} · Direct Message`;

  const prompts = isStudent ? QUICK_PROMPTS.student : QUICK_PROMPTS.teacher;

  return (
    <DialogContent className="wa-modal-dialog p-0 w-[95vw] max-w-[840px] sm:w-[840px] overflow-hidden rounded-2xl border border-[#2d7f9f]/25 bg-white shadow-2xl">
      <DialogHeader className="sr-only">
        <DialogTitle>Chat with {teacherName}</DialogTitle>
        <DialogDescription>Direct conversational messenger interface</DialogDescription>
      </DialogHeader>

      {/* TOP MESSENGER HEADER */}
      <div className="wa-chat-header px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2d7f9f] to-[#5ba4c2] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {isStudent ? (
                teacherName.slice(0, 2).toUpperCase()
              ) : (
                <GraduationCap className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
                {teacherName}
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e2f2fa] text-[#1f668f]">
                {isStudent ? 'Instructor' : 'Student Chat'}
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {partnerSubtitle}
            </p>
          </div>
        </div>

        {/* SELECTORS / QUICK ACTIONS */}
        <div className="flex items-center gap-2.5">
          {classes.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2d7f9f]" />
                {selectedClass?.name || 'Class'}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {showClassDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                  {classes.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-[#e2f2fa] hover:text-[#1f668f] flex items-center justify-between"
                      onClick={() => {
                        setSelectedClassId(c.id);
                        setShowClassDropdown(false);
                      }}
                    >
                      {c.name}
                      {c.id === selectedClassId && <Check className="w-3.5 h-3.5 text-[#2d7f9f]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isStudent && eligibleTeachers.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-[#2d7f9f]" />
                Teacher
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {showRecipientDropdown && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                  {eligibleTeachers.map((t: any) => (
                    <button
                      key={t.id}
                      type="button"
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-[#e2f2fa] hover:text-[#1f668f] flex items-center justify-between"
                      onClick={() => {
                        setSelectedRecipientId(t.id);
                        setShowRecipientDropdown(false);
                      }}
                    >
                      {t.name}
                      {t.id === selectedRecipientId && <Check className="w-3.5 h-3.5 text-[#2d7f9f]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES CANVAS */}
      <div className="wa-messages-wallpaper relative flex-1 min-h-[440px] overflow-y-auto p-5 flex flex-col gap-4 bg-[#f0f7fa]">
        {/* DATE PILL */}
        <div className="flex justify-center">
          <span className="bg-white/85 backdrop-blur-xs text-slate-500 border border-slate-200/60 shadow-2xs text-[11px] font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Today
          </span>
        </div>

        {/* INCOMING WELCOME BUBBLE */}
        <div className="wa-bubble-wrap incoming flex items-start gap-2.5 max-w-[75%]">
          <div className="w-8 h-8 rounded-full bg-[#2d7f9f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
            {teacherName.slice(0, 1)}
          </div>
          <div className="wa-bubble incoming relative bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs text-xs leading-relaxed">
            <p className="m-0 font-normal text-slate-700">
              {isStudent
                ? `Hello ${ws?.member?.name?.split(' ')[0] || 'there'}! 👋 How can I assist you with ${selectedClass?.name || 'your coursework'} today? Feel free to ask questions about assignments, lessons, or deadlines.`
                : `Connecting to ${selectedClass?.name || 'Class'}. Send announcements or direct messages below.`}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-slate-400">
              <span>9:00 AM</span>
            </div>
          </div>
        </div>

        {/* OUTGOING / SENT MESSAGES */}
        {messagesHistory.map((msg) => (
          <div key={msg.id} className="wa-bubble-wrap outgoing flex justify-end items-end gap-1.5 w-full">
            <div className="wa-bubble outgoing relative bg-[#e2f2fa] border border-[#a7d7ec] text-slate-900 rounded-2xl rounded-tr-xs px-4 py-3 shadow-2xs text-xs leading-relaxed max-w-[75%]">
              {subject && (
                <div className="text-[11px] font-bold text-[#1f668f] mb-1.5 pb-1 border-b border-[#a7d7ec]/60">
                  📌 {subject}
                </div>
              )}
              <p className="m-0 whitespace-pre-wrap">{msg.text}</p>

              {msg.files?.length > 0 && (
                <div className="mt-2 pt-1 border-t border-[#a7d7ec]/60 flex flex-col gap-1">
                  {msg.files.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-1.5 text-[10px] text-[#1f668f] font-medium bg-white/60 px-2 py-0.5 rounded">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#1f668f]/80">
                <span>{msg.time}</span>
                {msg.status === 'delivered' ? (
                  <CheckCheck className="w-3 h-3 text-[#2d7f9f]" />
                ) : msg.status === 'sending' ? (
                  <Clock className="w-3 h-3 animate-spin text-slate-400" />
                ) : (
                  <Check className="w-3 h-3 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="px-3.5 py-2 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#2d7f9f]" /> Suggestions:
        </span>
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setMessage(p.text);
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#e2f2fa] hover:border-[#2d7f9f] hover:text-[#1f668f] transition-all shadow-2xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ATTACHMENTS PREVIEW ROW */}
      {files.length > 0 && (
        <div className="px-3 py-1.5 bg-[#f1f5f9] border-t border-slate-200 flex items-center gap-2 flex-wrap">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-xs text-slate-700 shadow-2xs"
            >
              <FileText className="w-3 h-3 text-[#2d7f9f]" />
              <span className="truncate max-w-[140px] font-medium">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                className="text-slate-400 hover:text-red-500 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* OPTIONAL SUBJECT PILL BAR */}
      {showSubjectInput ? (
        <div className="px-3.5 pt-2 pb-0 bg-white flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1f668f] flex-shrink-0">Topic / Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Homework clarification, Extension request..."
            className="w-full text-xs px-3 py-1 rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#2d7f9f]"
          />
          <button
            type="button"
            onClick={() => setShowSubjectInput(false)}
            className="text-slate-400 hover:text-slate-600 text-xs font-medium"
          >
            Hide
          </button>
        </div>
      ) : (
        <div className="px-3.5 pt-1.5 pb-0 bg-white flex justify-between items-center text-[11px] text-slate-400">
          <span>
            {subject ? (
              <span className="text-[#1f668f] font-medium">Topic: {subject}</span>
            ) : (
              'Direct chat message'
            )}
          </span>
          <button
            type="button"
            onClick={() => setShowSubjectInput(true)}
            className="text-[#2d7f9f] hover:underline font-medium"
          >
            {subject ? 'Edit Topic' : '+ Add Topic / Subject'}
          </button>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 border-t border-red-200 text-red-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BOTTOM COMPOSER PILL */}
      <div className="wa-bottom-bar p-3 bg-white border-t border-[#e2e8f0] relative flex items-center gap-2">
        {/* EMOJI BUTTON & TRAY */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#2d7f9f] hover:bg-slate-100 transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmoji && (
            <div className="wa-emoji-tray-popup absolute bottom-12 left-0 bg-white border border-slate-200 rounded-xl p-2 shadow-xl grid grid-cols-7 gap-1 z-30">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    setMessage((prev) => prev + em);
                    setShowEmoji(false);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="w-8 h-8 rounded hover:bg-slate-100 text-lg flex items-center justify-center transition-transform hover:scale-125"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INPUT PILL */}
        <div className="wa-input-pill flex-1 flex items-center bg-[#f1f5f9] border border-[#cbd5e1] rounded-full px-3.5 py-1.5 focus-within:border-[#2d7f9f] focus-within:ring-2 focus-within:ring-[#2d7f9f]/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Type a message to ${teacherName}...`}
            className="wa-chat-input w-full bg-transparent border-0 resize-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none max-h-24 overflow-y-auto leading-relaxed"
          />

          {/* ATTACHMENT CLIP */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors ml-1 flex-shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        {/* SEND BUTTON */}
        <button
          type="button"
          onClick={handleSend}
          disabled={busy || (!message.trim() && files.length === 0)}
          className="wa-send-btn w-10 h-10 rounded-full bg-[#2d7f9f] hover:bg-[#1f668f] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </DialogContent>
  );
}
