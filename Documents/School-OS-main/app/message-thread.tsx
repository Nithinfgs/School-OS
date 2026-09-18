'use client';
import { ChatRoomView } from './chat-room';

export function MessageThread({ row, ws }: any) {
  const roomId = row?.data?.class === 'Chemistry HL'
    ? 'space-chem-hl'
    : row?.data?.class === 'Math AA HL'
      ? 'space-math-aa'
      : row?.data?.senderName?.includes('Maya') || row?.data?.recipientName?.includes('Maya')
        ? 'dm-maya-iyer'
        : 'space-physics-hl';

  return (
    <div className="embedded-chat-wrap" suppressHydrationWarning>
      <ChatRoomView ws={ws} initialRoomId={roomId} />
    </div>
  );
}
