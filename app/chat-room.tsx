'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  Hash,
  User,
  Users,
  Check,
  CheckCheck,
  MoreVertical,
  Pin,
  Sparkles,
  FileText,
  Clock,
  ArrowDown,
  Info,
  X,
  Flame,
  ThumbsUp,
  Heart,
  Lightbulb,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ShieldAlert,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ChatParticipant = {
  id: string;
  name: string;
  role: 'Teacher' | 'Student' | 'Admin' | 'AI Assistant';
  avatar?: string;
  online?: boolean;
  status?: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'Teacher' | 'Student' | 'Admin' | 'AI Assistant';
  content: string;
  timestamp: string;
  attachments?: { id: string; name: string; size?: string; url?: string }[];
  reactions?: Record<string, string[]>; // emoji -> [userNames]
  replyTo?: { id: string; senderName: string; text: string };
  isPinned?: boolean;
  status?: 'sent' | 'delivered' | 'read';
};

export type ChatRoom = {
  id: string;
  type: 'space' | 'dm' | 'bot';
  name: string;
  topic?: string;
  subject?: string;
  icon?: string;
  unreadCount?: number;
  participants: ChatParticipant[];
  lastMessage?: string;
  lastMessageTime?: string;
};

// Acoustic micro-clicks for Web Audio feedback
function playMessageSfx(type: 'send' | 'receive' = 'send') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {}
}

const INITIAL_SPACES: ChatRoom[] = [
  {
    id: 'space-physics-hl',
    type: 'space',
    name: 'Physics HL · Class Space',
    subject: 'Physics HL',
    topic: 'Internal Assessment, 2D Collision Lab & Momentum Problem Sets',
    icon: '🧪',
    unreadCount: 2,
    lastMessage: 'All lab groups: please upload your photogate calibration spreadsheets before Friday.',
    lastMessageTime: '10:45 AM',
    participants: [
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true, status: 'Grading IA drafts' },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
      { id: 'student-2', name: 'Emma Wilson', role: 'Student', online: true },
      { id: 'student-3', name: 'Liam Chen', role: 'Student', online: false },
      { id: 'student-4', name: 'Sofia Martinez', role: 'Student', online: true },
      { id: 'dev:admin', name: 'Nithin Selvaraj', role: 'Admin', online: true },
    ],
  },
  {
    id: 'space-chem-hl',
    type: 'space',
    name: 'Chemistry HL · Lab Group',
    subject: 'Chemistry HL',
    topic: 'Equilibrium constants, buffer titration curves & safety protocols',
    icon: '⚗️',
    unreadCount: 0,
    lastMessage: 'Remember to wear safety goggles at all times in Lab 102.',
    lastMessageTime: 'Yesterday',
    participants: [
      { id: 'dev:david-park', name: 'David Park', role: 'Teacher', online: true, status: 'In Lab 102' },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
      { id: 'student-2', name: 'Emma Wilson', role: 'Student', online: true },
      { id: 'student-5', name: 'Noah Patel', role: 'Student', online: false },
    ],
  },
  {
    id: 'space-math-aa',
    type: 'space',
    name: 'Math AA HL · Problem Hub',
    subject: 'Math AA HL',
    topic: 'Integration by Parts, Differential Equations & Proofs',
    icon: '📐',
    unreadCount: 1,
    lastMessage: 'Check hint for Question 18 on trigonometric substitution.',
    lastMessageTime: 'Yesterday',
    participants: [
      { id: 'dev:james-wilson', name: 'James Wilson', role: 'Teacher', online: false },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
      { id: 'student-3', name: 'Liam Chen', role: 'Student', online: false },
    ],
  },
  {
    id: 'space-school-announcements',
    type: 'space',
    name: 'School Announcements & Bulletin',
    topic: 'Official Westbridge campus notices, events & schedules',
    icon: '📢',
    unreadCount: 0,
    lastMessage: 'Senior Science Museum Field Trip registration closes this Wednesday.',
    lastMessageTime: 'Sep 6',
    participants: [
      { id: 'dev:admin', name: 'Nithin Selvaraj', role: 'Admin', online: true },
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
    ],
  },
  {
    id: 'space-staff-room',
    type: 'space',
    name: 'Faculty Lounge & Department Sync',
    topic: 'Staff only: Term 1 assessment moderation & schedule reviews',
    icon: '☕',
    unreadCount: 0,
    lastMessage: 'Term 1 progress report draft templates have been updated.',
    lastMessageTime: 'Sep 5',
    participants: [
      { id: 'dev:admin', name: 'Nithin Selvaraj', role: 'Admin', online: true },
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true },
      { id: 'dev:david-park', name: 'David Park', role: 'Teacher', online: true },
      { id: 'dev:james-wilson', name: 'James Wilson', role: 'Teacher', online: false },
    ],
  },
];

const INITIAL_DMS: ChatRoom[] = [
  {
    id: 'bot-schoolos-ai',
    type: 'bot',
    name: 'SchoolOS Study Bot',
    topic: 'AI Academic Assistant · 24/7 Question Solver & Study Guide',
    icon: '🤖',
    unreadCount: 0,
    lastMessage: 'Ask me anything about physics derivations, homework formulas, or class schedules!',
    lastMessageTime: 'Just now',
    participants: [
      { id: 'bot:ai', name: 'SchoolOS Study Bot', role: 'AI Assistant', online: true, status: 'Active & Ready' },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
    ],
  },
  {
    id: 'dm-maya-iyer',
    type: 'dm',
    name: 'Maya Iyer',
    topic: 'Physics HL Teacher & Science Department Head',
    unreadCount: 0,
    lastMessage: 'Awesome! Let’s review the damping oscillator trials. Yes, 9 AM works perfectly! 👍',
    lastMessageTime: '10:18 AM',
    participants: [
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true, status: 'Office hours in Lab 101' },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
    ],
  },
  {
    id: 'dm-david-park',
    type: 'dm',
    name: 'David Park',
    topic: 'Chemistry HL Teacher',
    unreadCount: 0,
    lastMessage: 'Your buffer solution analysis has been reviewed.',
    lastMessageTime: 'Sep 6',
    participants: [
      { id: 'dev:david-park', name: 'David Park', role: 'Teacher', online: true },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
    ],
  },
  {
    id: 'dm-aarav-sharma',
    type: 'dm',
    name: 'Nithin Selvaraj',
    topic: 'Grade 11 Student · IB DP Candidate',
    unreadCount: 0,
    lastMessage: 'Thank you Ms. Iyer, I will record the preliminary trials today.',
    lastMessageTime: '9:40 AM',
    participants: [
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true },
    ],
  },
  {
    id: 'dm-nithin-selvaraj',
    type: 'dm',
    name: 'Nithin Selvaraj',
    topic: 'Head of School & Administrator',
    unreadCount: 0,
    lastMessage: 'Welcome to the new academic year! Feel free to reach out if you need anything.',
    lastMessageTime: 'Sep 1',
    participants: [
      { id: 'dev:admin', name: 'Nithin Selvaraj', role: 'Admin', online: true },
      { id: 'dev:student', name: 'Nithin Selvaraj', role: 'Student', online: true },
      { id: 'dev:teacher', name: 'Maya Iyer', role: 'Teacher', online: true },
    ],
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'dm-maya-iyer': [
    {
      id: 'msg-w-1',
      roomId: 'dm-maya-iyer',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: 'Hey! How are you doing today? 😊',
      timestamp: '2026-09-07T10:14:00Z',
      status: 'read',
    },
    {
      id: 'msg-w-2',
      roomId: 'dm-maya-iyer',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: 'I was thinking about the physics lab and the hiking field trip this weekend! 🏔️',
      timestamp: '2026-09-07T10:15:00Z',
      status: 'read',
    },
    {
      id: 'msg-w-3',
      roomId: 'dm-maya-iyer',
      senderId: 'dev:student',
      senderName: 'Nithin Selvaraj',
      senderRole: 'Student',
      content: "I'm great, thanks! Ready for the practical. Which trail for the weekend trip?",
      timestamp: '2026-09-07T10:16:00Z',
      status: 'read',
    },
    {
      id: 'msg-w-4',
      roomId: 'dm-maya-iyer',
      senderId: 'dev:student',
      senderName: 'Nithin Selvaraj',
      senderRole: 'Student',
      content: 'Are we meeting at 9 AM? 🥾',
      timestamp: '2026-09-07T10:17:00Z',
      status: 'read',
    },
    {
      id: 'msg-w-5',
      roomId: 'dm-maya-iyer',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: "Awesome! Let's do the Scenic Loop Trail. Yes, 9 AM works perfectly! 👍",
      timestamp: '2026-09-07T10:18:00Z',
      status: 'read',
      reactions: { '👍': ['Nithin Selvaraj'] },
    },
  ],
  'bot-schoolos-ai': [
    {
      id: 'msg-bot-1',
      roomId: 'bot-schoolos-ai',
      senderId: 'bot:ai',
      senderName: 'SchoolOS Study Bot',
      senderRole: 'AI Assistant',
      content: "Hi! I'm your SchoolOS Study Assistant 🤖. Ask me any questions about your homework, equations, lab protocols, or exam tips!",
      timestamp: '2026-09-07T08:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-bot-2',
      roomId: 'bot-schoolos-ai',
      senderId: 'dev:student',
      senderName: 'Nithin Selvaraj',
      senderRole: 'Student',
      content: 'Can you summarize how to calculate the damping coefficient for a spring oscillator?',
      timestamp: '2026-09-07T08:05:00Z',
      status: 'read',
    },
    {
      id: 'msg-bot-3',
      roomId: 'bot-schoolos-ai',
      senderId: 'bot:ai',
      senderName: 'SchoolOS Study Bot',
      senderRole: 'AI Assistant',
      content: 'For an underdamped oscillator, the amplitude decays as A(t) = A₀ · e^(-γt), where γ = b / (2m). To find damping coefficient b:\n1. Plot ln(A_n / A₀) against time t.\n2. The slope equals -γ = -b / (2m).\n3. Multiply slope by -2m to obtain b in kg/s! 🔬',
      timestamp: '2026-09-07T08:06:00Z',
      reactions: { '💡': ['Nithin Selvaraj'], '🔥': ['Nithin Selvaraj'] },
      status: 'read',
    },
  ],
  'space-physics-hl': [
    {
      id: 'msg-p-1',
      roomId: 'space-physics-hl',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: 'Good morning everyone! Please download the updated lab guidelines for our trolley momentum collision practical.',
      timestamp: '2026-09-07T08:30:00Z',
      attachments: [{ id: 'att-1', name: 'Physics_HL_Lab_Guidelines.pdf', size: '1.4 MB' }],
      reactions: { '👍': ['Nithin Selvaraj', 'Emma Wilson'] },
      isPinned: true,
      status: 'read',
    },
    {
      id: 'msg-p-2',
      roomId: 'space-physics-hl',
      senderId: 'student-2',
      senderName: 'Emma Wilson',
      senderRole: 'Student',
      content: 'Ms. Iyer, for trial 3 with inelastic collisions, should we calibrate photogate flags to 10 cm or 15 cm?',
      timestamp: '2026-09-07T09:15:00Z',
      status: 'read',
    },
    {
      id: 'msg-p-3',
      roomId: 'space-physics-hl',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: 'Use 10 cm flags for higher precision with the ultrasonic motion sensor. Record systematic uncertainty ±0.02 N.',
      timestamp: '2026-09-07T09:20:00Z',
      replyTo: {
        id: 'msg-p-2',
        senderName: 'Emma Wilson',
        text: 'for trial 3 with inelastic collisions, should we calibrate...',
      },
      reactions: { '💡': ['Emma Wilson', 'Nithin Selvaraj'] },
      status: 'read',
    },
    {
      id: 'msg-p-4',
      roomId: 'space-physics-hl',
      senderId: 'dev:student',
      senderName: 'Nithin Selvaraj',
      senderRole: 'Student',
      content: 'Our group finished kinetic energy loss calculations. Experimental momentum matched theory within 1.8% error! 🚀',
      timestamp: '2026-09-07T10:12:00Z',
      reactions: { '🎉': ['Maya Iyer', 'Emma Wilson'] },
      status: 'read',
    },
    {
      id: 'msg-p-5',
      roomId: 'space-physics-hl',
      senderId: 'dev:teacher',
      senderName: 'Maya Iyer',
      senderRole: 'Teacher',
      content: 'All lab groups: please upload your photogate calibration spreadsheets before Friday.',
      timestamp: '2026-09-07T10:45:00Z',
      reactions: { '✅': ['Nithin Selvaraj', 'Emma Wilson'] },
      status: 'read',
    },
  ],
  'space-chem-hl': [
    {
      id: 'msg-c-1',
      roomId: 'space-chem-hl',
      senderId: 'dev:david-park',
      senderName: 'David Park',
      senderRole: 'Teacher',
      content: 'Welcome to Chemistry HL. Please review the acid-base titration video before Tuesday’s lab session.',
      timestamp: '2026-09-06T14:00:00Z',
      attachments: [{ id: 'att-2', name: 'Titration_Protocol_Standard.pdf', size: '890 KB' }],
      reactions: { '👍': ['Nithin Selvaraj'] },
      status: 'read',
    },
    {
      id: 'msg-c-2',
      roomId: 'space-chem-hl',
      senderId: 'dev:david-park',
      senderName: 'David Park',
      senderRole: 'Teacher',
      content: 'Remember to wear safety goggles at all times in Lab 102.',
      timestamp: '2026-09-06T16:30:00Z',
      reactions: { '⚠️': ['Emma Wilson', 'Nithin Selvaraj'] },
      status: 'read',
    },
  ],
};

const SUGGESTED_CHIPS: Record<string, string[]> = {
  'dm-maya-iyer': [
    'Are we meeting at 9 AM? 🥾',
    'Uploaded my lab calculations 📄',
    'Which trail are we taking?',
    'Thank you Ms. Iyer! 👍',
  ],
  'bot-schoolos-ai': [
    'Explain Newton’s second law with formulas',
    'How do I calculate uncertainty in titration?',
    'What assignments are due this week?',
    'Give me 3 practice physics problems',
  ],
  'space-physics-hl': [
    'Uploaded lab data spreadsheet',
    'What time are office hours today?',
    'Can we verify question 4 uncertainty?',
    'Joined the study session 👍',
  ],
  default: [
    'Thank you! 👍',
    'Understood, will submit on time.',
    'Sounds great!',
    'See you in class.',
  ],
};

export function ChatRoomView({ ws, initialRoomId }: { ws: any; initialRoomId?: string }) {
  const currentMember = ws?.member || {
    id: 'dev-student-member',
    userId: 'dev:student',
    name: 'Nithin Selvaraj',
    role: 'Student',
  };

  const currentRole: 'Teacher' | 'Student' | 'Admin' =
    currentMember.role === 'Teacher'
      ? 'Teacher'
      : currentMember.role === 'Admin'
        ? 'Admin'
        : 'Student';

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'dms' | 'spaces'>('all');
  const [activeRoomId, setActiveRoomId] = useState<string>(
    initialRoomId || (currentRole === 'Teacher' ? 'dm-aarav-sharma' : 'dm-maya-iyer'),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showComposerEmoji, setShowComposerEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available rooms based on current user role
  const spaces = useMemo(() => {
    if (currentRole === 'Student') {
      return INITIAL_SPACES.filter((s) => s.id !== 'space-staff-room');
    }
    return INITIAL_SPACES;
  }, [currentRole]);

  const dms = useMemo(() => {
    let list = INITIAL_DMS;
    if (currentRole === 'Teacher') {
      list = list.filter((dm) => dm.id !== 'dm-maya-iyer');
    }
    return list;
  }, [currentRole]);

  const allRooms = useMemo(() => [...dms, ...spaces], [dms, spaces]);

  const activeRoom = useMemo(() => {
    return allRooms.find((r) => r.id === activeRoomId) || dms[0] || spaces[0];
  }, [allRooms, activeRoomId]);

  const currentMessages = useMemo(() => {
    return messagesMap[activeRoom.id] || [];
  }, [messagesMap, activeRoom.id]);

  // Filtered rooms for sidebar
  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) =>
      (s.name + ' ' + (s.topic || '')).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [spaces, searchQuery]);

  const filteredDMs = useMemo(() => {
    return dms.filter((dm) =>
      (dm.name + ' ' + (dm.topic || '')).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [dms, searchQuery]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentMessages.length]);

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    playMessageSfx('send');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: activeRoom.id,
      senderId: currentMember.userId || 'dev:user',
      senderName: currentMember.name || 'Alex Carter',
      senderRole: currentRole,
      content: text,
      timestamp: new Date().toISOString(),
      status: 'read',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.content.slice(0, 60),
          }
        : undefined,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] || []), newMsg],
    }));

    setInputText('');
    setReplyingTo(null);
    setShowComposerEmoji(false);

    // Save message via workspace mutation
    if (ws?.act) {
      ws.act({
        action: 'message',
        roomId: activeRoom.id,
        content: text,
        senderName: currentMember.name,
      }).catch(() => {});
    }

    // AI Study Bot Interactive Responses
    if (activeRoom.id === 'bot-schoolos-ai') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        playMessageSfx('receive');
        let botReply = "I've analyzed your question! Here is a step-by-step breakdown:\n\n• For kinematic derivations, always define your positive coordinate system.\n• Standard formula: v² = u² + 2as.\n• Remember to include uncertainty propagation in your final result! 🚀";
        
        const lower = text.toLowerCase();
        if (lower.includes('newton') || lower.includes('force')) {
          botReply = "Newton's Second Law states that net force equals the rate of change of momentum (F_net = dp/dt = ma). In your trolley practical, remember to account for track friction!";
        } else if (lower.includes('titration') || lower.includes('chem')) {
          botReply = "In titration analysis, buffer capacity peaks at pH = pKa. Use Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]).";
        } else if (lower.includes('assignment') || lower.includes('due')) {
          botReply = "You have 12 assignments in progress! Next due is the 'Forces and Motion investigation' due on Friday at 16:00.";
        }

        const autoBotMsg: ChatMessage = {
          id: `msg-bot-reply-${Date.now()}`,
          roomId: activeRoom.id,
          senderId: 'bot:ai',
          senderName: 'SchoolOS Study Bot',
          senderRole: 'AI Assistant',
          content: botReply,
          timestamp: new Date().toISOString(),
          status: 'read',
          reactions: { '💡': [currentMember.name] },
        };
        setMessagesMap((prev) => ({
          ...prev,
          [activeRoom.id]: [...(prev[activeRoom.id] || []), autoBotMsg],
        }));
      }, 1000);
    }
    // Interactive Simulated Teacher Reply in 1:1 or Class Space
    else if (currentRole === 'Student' && (activeRoom.id === 'dm-maya-iyer' || activeRoom.id === 'space-physics-hl')) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        playMessageSfx('receive');
        const autoReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          roomId: activeRoom.id,
          senderId: 'dev:teacher',
          senderName: 'Maya Iyer',
          senderRole: 'Teacher',
          content: `Thanks for the update, ${currentMember.name.split(' ')[0]}! I've noted this down. Let me know if you need any extra apparatus before the next period. 👍`,
          timestamp: new Date().toISOString(),
          status: 'read',
          reactions: { '👍': [currentMember.name] },
        };
        setMessagesMap((prev) => ({
          ...prev,
          [activeRoom.id]: [...(prev[activeRoom.id] || []), autoReply],
        }));
      }, 1300);
    }
  };

  // Toggle Reaction
  const handleToggleReaction = (msgId: string, emoji: string) => {
    const userName = currentMember.name || 'You';
    setMessagesMap((prev) => {
      const roomMsgs = prev[activeRoom.id] || [];
      const updated = roomMsgs.map((msg) => {
        if (msg.id !== msgId) return msg;
        const currentReactions = { ...msg.reactions };
        const users = currentReactions[emoji] || [];
        if (users.includes(userName)) {
          currentReactions[emoji] = users.filter((u) => u !== userName);
          if (currentReactions[emoji].length === 0) {
            delete currentReactions[emoji];
          }
        } else {
          currentReactions[emoji] = [...users, userName];
        }
        return { ...msg, reactions: currentReactions };
      });
      return { ...prev, [activeRoom.id]: updated };
    });
  };

  const chips = SUGGESTED_CHIPS[activeRoom.id] || SUGGESTED_CHIPS.default;

  return (
    <div className="wa-chat-app" suppressHydrationWarning>
      {/* LEFT CONVERSATION LIST SIDEBAR */}
      <aside className="wa-sidebar">
        <div className="wa-sidebar-header">
          <div className="wa-profile-row">
            <div className="wa-my-avatar">
              {currentMember.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="wa-header-titles">
              <h3>School Messages</h3>
              <span className="wa-status-hint">
                <span className="wa-online-dot" /> {currentRole} online
              </span>
            </div>
          </div>

          <div className="wa-search-bar">
            <Search size={15} className="wa-search-ico" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="wa-tab-filters">
            <button
              className={`wa-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`wa-tab-btn ${activeTab === 'dms' ? 'active' : ''}`}
              onClick={() => setActiveTab('dms')}
            >
              Chats ({dms.length})
            </button>
            <button
              className={`wa-tab-btn ${activeTab === 'spaces' ? 'active' : ''}`}
              onClick={() => setActiveTab('spaces')}
            >
              Spaces ({spaces.length})
            </button>
          </div>
        </div>

        <div className="wa-chat-list">
          {/* AI ASSISTANT / CHATBOT SPOTLIGHT */}
          {(activeTab === 'all' || activeTab === 'dms') && (
            <div className="wa-list-group">
              <div className="wa-group-title">AI STUDY ASSISTANT</div>
              {filteredDMs
                .filter((r) => r.type === 'bot')
                .map((room) => {
                  const isActive = room.id === activeRoom.id;
                  return (
                    <button
                      key={room.id}
                      className={`wa-chat-item wa-bot-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveRoomId(room.id)}
                    >
                      <div className="wa-avatar-wrap bot-avatar">
                        <Bot size={18} />
                        <span className="wa-online-dot" />
                      </div>
                      <div className="wa-chat-meta">
                        <div className="wa-name-time-row">
                          <strong className="wa-chat-name">{room.name}</strong>
                          <span className="wa-chat-time">{room.lastMessageTime}</span>
                        </div>
                        <p className="wa-last-text">{room.lastMessage || room.topic}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* DIRECT CHATS */}
          {(activeTab === 'all' || activeTab === 'dms') && (
            <div className="wa-list-group">
              <div className="wa-group-title">DIRECT MESSAGES</div>
              {filteredDMs
                .filter((r) => r.type === 'dm')
                .map((room) => {
                  const isActive = room.id === activeRoom.id;
                  const initials = room.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);
                  return (
                    <button
                      key={room.id}
                      className={`wa-chat-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveRoomId(room.id)}
                    >
                      <div className="wa-avatar-wrap">
                        <span className="wa-avatar-circle">{initials}</span>
                        <span className="wa-online-dot" />
                      </div>
                      <div className="wa-chat-meta">
                        <div className="wa-name-time-row">
                          <strong className="wa-chat-name">{room.name}</strong>
                          <span className="wa-chat-time">{room.lastMessageTime}</span>
                        </div>
                        <p className="wa-last-text">{room.lastMessage || room.topic}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* SPACES & CHANNELS */}
          {(activeTab === 'all' || activeTab === 'spaces') && (
            <div className="wa-list-group">
              <div className="wa-group-title">CLASS SPACES</div>
              {filteredSpaces.map((room) => {
                const isActive = room.id === activeRoom.id;
                return (
                  <button
                    key={room.id}
                    className={`wa-chat-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveRoomId(room.id)}
                  >
                    <div className="wa-avatar-wrap space-avatar">
                      <span className="space-emoji">{room.icon || '💬'}</span>
                    </div>
                    <div className="wa-chat-meta">
                      <div className="wa-name-time-row">
                        <strong className="wa-chat-name">{room.name}</strong>
                        <span className="wa-chat-time">{room.lastMessageTime}</span>
                      </div>
                      <p className="wa-last-text">{room.lastMessage || room.topic}</p>
                    </div>
                    {room.unreadCount ? (
                      <span className="wa-unread-pill">{room.unreadCount}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN CONVERSATION SCREEN */}
      <main className="wa-conversation">
        {/* CHAT HEADER BAR */}
        <header className="wa-conv-header">
          <div className="wa-conv-header-left">
            <div className={`wa-conv-avatar ${activeRoom.type === 'bot' ? 'bot' : ''}`}>
              {activeRoom.type === 'bot' ? (
                <Bot size={20} />
              ) : activeRoom.icon ? (
                <span>{activeRoom.icon}</span>
              ) : (
                activeRoom.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
              )}
            </div>
            <div className="wa-conv-header-info">
              <h2>{activeRoom.name}</h2>
              <span className="wa-conv-subtitle">
                {activeRoom.type === 'bot'
                  ? 'AI Study Assistant · Always Active'
                  : activeRoom.topic || 'Online'}
              </span>
            </div>
          </div>

          <div className="wa-conv-header-actions">
            <Button
              variant="ghost"
              size="sm"
              className="wa-header-icon-btn"
              onClick={() => setShowInfoSidebar(!showInfoSidebar)}
              title="View room details"
            >
              <Info size={17} />
            </Button>
          </div>
        </header>

        {/* CHAT MESSAGES STREAM (WITH WALLPAPER PATTERN) */}
        <div className="wa-messages-wallpaper">
          <div className="wa-date-chip">
            <span>TODAY</span>
          </div>

          <div className="wa-messages-stream">
            {currentMessages.map((msg, index) => {
              const isMe =
                msg.senderId === currentMember.userId ||
                msg.senderName === currentMember.name;

              const timeText = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id || index}
                  className={`wa-message-wrapper ${isMe ? 'outgoing' : 'incoming'}`}
                >
                  <div className={`wa-bubble ${isMe ? 'bubble-outgoing' : 'bubble-incoming'}`}>
                    {/* Tail SVG */}
                    {isMe ? (
                      <svg className="wa-tail wa-tail-out" viewBox="0 0 8 13" width="8" height="13">
                        <path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                        <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
                      </svg>
                    ) : (
                      <svg className="wa-tail wa-tail-in" viewBox="0 0 8 13" width="8" height="13">
                        <path opacity="0.13" d="M1.533 1H6.72v11.193L.253 3.568C-.806 2.156-.238 1 1.533 1z" />
                        <path fill="currentColor" d="M1.533 0H6.72v11.193L.253 2.568C-.806 1.156-.238 0 1.533 0z" />
                      </svg>
                    )}

                    {/* Sender Name in Group Spaces */}
                    {!isMe && activeRoom.type === 'space' && (
                      <div className={`wa-sender-tag role-${msg.senderRole.toLowerCase()}`}>
                        {msg.senderName}
                        <span className="wa-role-pill">{msg.senderRole}</span>
                      </div>
                    )}

                    {/* Reply Quote Banner */}
                    {msg.replyTo && (
                      <div className="wa-reply-quote">
                        <div className="wa-reply-bar" />
                        <div className="wa-reply-text">
                          <strong>{msg.replyTo.senderName}</strong>
                          <p>{msg.replyTo.text}</p>
                        </div>
                      </div>
                    )}

                    {/* Message Body Content */}
                    <div className="wa-bubble-content">
                      {msg.content}
                    </div>

                    {/* File Attachment Card */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="wa-attachments-list">
                        {msg.attachments.map((att) => (
                          <div key={att.id} className="wa-att-card">
                            <FileText size={18} className="wa-att-ico" />
                            <div className="wa-att-meta">
                              <strong>{att.name}</strong>
                              {att.size && <small>{att.size}</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Time + Status Checkmark */}
                    <div className="wa-bubble-footer">
                      <span className="wa-time-str" suppressHydrationWarning>{timeText}</span>
                      {isMe && (
                        <span className="wa-checks">
                          <CheckCheck size={14} className="wa-check-blue" />
                        </span>
                      )}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="wa-reactions-row">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            className="wa-reaction-chip"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            title={users.join(', ')}
                          >
                            <span>{emoji}</span>
                            {users.length > 1 && <b>{users.length}</b>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Floating Reaction Trigger on Hover */}
                    <div className="wa-bubble-hover-actions">
                      {['👍', '❤️', '💡', '🔥'].map((em) => (
                        <button
                          key={em}
                          className="wa-hover-emoji"
                          onClick={() => handleToggleReaction(msg.id, em)}
                        >
                          {em}
                        </button>
                      ))}
                      <button
                        className="wa-hover-reply"
                        onClick={() => setReplyingTo(msg)}
                        title="Reply"
                      >
                        <CornerDownRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="wa-typing-row">
                <div className="wa-bubble bubble-incoming wa-typing-bubble">
                  <span className="wa-typing-dot" />
                  <span className="wa-typing-dot" />
                  <span className="wa-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* PROMPT CHIPS / SUGGESTIONS */}
        <div className="wa-prompt-chips">
          <span className="wa-chips-title">
            <Sparkles size={12} /> Quick Prompts:
          </span>
          {chips.map((chip, idx) => (
            <button
              key={idx}
              className="wa-chip-btn"
              onClick={() => handleSendMessage(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* BOTTOM COMPOSER BAR (MATCHING THE UPLOADED DESIGN EXACTLY) */}
        <div className="wa-bottom-bar">
          {replyingTo && (
            <div className="wa-composer-reply-header">
              <CornerDownRight size={13} />
              <span>
                Replying to <b>{replyingTo.senderName}</b>: {replyingTo.content.slice(0, 60)}…
              </span>
              <button onClick={() => setReplyingTo(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className="wa-input-row">
            {/* Pill Container for Emoji + Input + Attachment */}
            <div className="wa-input-pill">
              <button
                type="button"
                className={`wa-emoji-btn ${showComposerEmoji ? 'active' : ''}`}
                onClick={() => setShowComposerEmoji(!showComposerEmoji)}
                title="Insert emoji"
              >
                <Smile size={20} />
              </button>

              <input
                ref={inputRef}
                type="text"
                className="wa-text-input"
                placeholder="Type a message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <button
                type="button"
                className="wa-attach-btn"
                title="Attach file"
                onClick={() => {
                  const demoFile = `Physics_Collision_Data_${new Date().toISOString().slice(0, 10)}.pdf`;
                  setInputText((prev) => (prev ? prev + ' ' : '') + `[Attached: ${demoFile}]`);
                }}
              >
                <Paperclip size={19} />
              </button>
            </div>

            {/* Circular Send Button */}
            <button
              type="button"
              className="wa-send-btn"
              disabled={!inputText.trim()}
              onClick={() => handleSendMessage()}
              title="Send"
            >
              <span className="wa-send-label">Send</span>
            </button>
          </div>

          {/* Emoji Tray Popup */}
          {showComposerEmoji && (
            <div className="wa-emoji-tray-popup">
              {['😊', '👍', '❤️', '💡', '🔥', '🎉', '✅', '🏔️', '🥾', '🔬', '🧪', '📐', '📚', '⭐'].map((em) => (
                <button
                  key={em}
                  type="button"
                  className="wa-emoji-pick"
                  onClick={() => {
                    setInputText((prev) => prev + em);
                    setShowComposerEmoji(false);
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR FOR SPACE INFO */}
      {showInfoSidebar && (
        <aside className="wa-info-sidebar">
          <div className="wa-info-header">
            <h3>Contact info</h3>
            <button onClick={() => setShowInfoSidebar(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="wa-info-body">
            <div className="wa-info-avatar-large">
              {activeRoom.type === 'bot' ? <Bot size={36} /> : activeRoom.icon || '💬'}
            </div>
            <h4>{activeRoom.name}</h4>
            <p className="wa-info-desc">{activeRoom.topic || 'Class messaging group'}</p>

            <div className="wa-info-participants">
              <h5>PARTICIPANTS ({activeRoom.participants.length})</h5>
              {activeRoom.participants.map((p) => (
                <div key={p.id} className="wa-part-item">
                  <span className="wa-part-avatar">
                    {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <div className="wa-part-meta">
                    <strong>{p.name}</strong>
                    <small>{p.role} {p.status ? `· ${p.status}` : ''}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
