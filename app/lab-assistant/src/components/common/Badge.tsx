import React from 'react';
import { HazardLevel, LabType, RequestStatus } from '../../types/lab';
import { FlaskConical, Atom, Dna, AlertTriangle, ShieldCheck, Flame, Skull, ShieldAlert } from 'lucide-react';

export const LabBadge: React.FC<{ labType: LabType; size?: 'sm' | 'md' }> = ({
  labType,
  size = 'md',
}) => {
  const styles = {
    chemistry: 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30',
    physics: 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30',
    biology: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
  };

  const icons = {
    chemistry: <FlaskConical className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    physics: <Atom className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    biology: <Dna className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
  };

  const names = {
    chemistry: 'Chemistry Lab',
    physics: 'Physics Lab',
    biology: 'Biology Lab',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${styles[labType]}`}
    >
      {icons[labType]}
      <span>{names[labType]}</span>
    </span>
  );
};

export const HazardBadge: React.FC<{ level: HazardLevel; size?: 'sm' | 'md' }> = ({
  level,
  size = 'md',
}) => {
  const config = {
    safe: {
      label: 'Non-Hazardous',
      style: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#2D7F9F]" />,
    },
    caution: {
      label: 'Caution / Irritant',
      style: 'bg-[#FBF6EE] text-[#B58B4E] border-[#B58B4E]/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#B58B4E]" />,
    },
    corrosive: {
      label: 'Corrosive',
      style: 'bg-[#FBF6EE] text-[#B58B4E] border-[#B58B4E]/40',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-[#B58B4E]" />,
    },
    flammable: {
      label: 'Flammable',
      style: 'bg-[#FAF1F0] text-[#A65D57] border-[#A65D57]/30',
      icon: <Flame className="w-3.5 h-3.5 text-[#A65D57]" />,
    },
    toxic: {
      label: 'Toxic / Harmful',
      style: 'bg-[#FAF1F0] text-[#A65D57] border-[#A65D57]/40',
      icon: <Skull className="w-3.5 h-3.5 text-[#A65D57]" />,
    },
    biohazard: {
      label: 'Biohazard',
      style: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/40',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#2D7F9F]" />,
    },
    fragile: {
      label: 'Fragile Glassware',
      style: 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#2D7F9F]" />,
    },
  }[level] || {
    label: level,
    style: 'bg-[#F7F9FB] text-[#61728A] border-[#DBE4EA]',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-md ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${config.style}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const StockBadge: React.FC<{
  quantity: number;
  minThreshold: number;
  unit: string;
}> = ({ quantity, minThreshold, unit }) => {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF1F0] text-[#A65D57] border border-[#A65D57]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A65D57] animate-pulse" />
        Out of Stock
      </span>
    );
  }

  if (quantity <= minThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF6EE] text-[#B58B4E] border border-[#B58B4E]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B58B4E] animate-pulse" />
        Low: {quantity} {unit}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF6F8] text-[#2D7F9F] border border-[#2D7F9F]/30">
      <span className="w-1.5 h-1.5 rounded-full bg-[#2D7F9F]" />
      {quantity} {unit} Available
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const map: Record<RequestStatus, { label: string; style: string }> = {
    pending: { label: 'Pending Review', style: 'bg-[#FBF6EE] text-[#B58B4E] border-[#B58B4E]/30' },
    approved: { label: 'Approved', style: 'bg-[#E9F3F6] text-[#2D7F9F] border-[#2D7F9F]/30' },
    prepared: { label: 'Prepared in Lab', style: 'bg-[#EDF2F5] text-[#4C6073] border-[#4C6073]/30' },
    ready: { label: 'Ready for Pickup', style: 'bg-[#EEF6F8] text-[#2D7F9F] border-[#2D7F9F]/30' },
    rejected: { label: 'Declined', style: 'bg-[#FAF1F0] text-[#A65D57] border-[#A65D57]/30' },
    fulfilled: { label: 'Completed', style: 'bg-[#F7F9FB] text-[#61728A] border-[#DBE4EA]' },
  };

  const item = map[status] || { label: status, style: 'bg-[#F7F9FB] text-[#61728A] border-[#DBE4EA]' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.style}`}>
      {item.label}
    </span>
  );
};
