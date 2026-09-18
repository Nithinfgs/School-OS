import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'academic' | 'fiction';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    success: 'bg-[#EBF5EE] text-[#2D7F9F] border-[#2D7F9F]/20',
    warning: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/20',
    error: 'bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]/20',
    info: 'bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]/20',
    neutral: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    academic: 'bg-[#E9F3F6] text-[#2B7796] border-[#C6E2EA]',
    fiction: 'bg-[#FDF2F8] text-[#9D174D] border-[#FBCFE8]',
  }[variant];

  const dotColors = {
    success: 'bg-[#2D7F9F]',
    warning: 'bg-[#B45309]',
    error: 'bg-[#991B1B]',
    info: 'bg-[#0369A1]',
    neutral: 'bg-[#64748B]',
    academic: 'bg-[#2B7796]',
    fiction: 'bg-[#9D174D]',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${variantStyles} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {children}
    </span>
  );
};
