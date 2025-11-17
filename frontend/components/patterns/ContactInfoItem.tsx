// components/patterns/ContactInfoItem.tsx
import { ReactNode } from 'react';

type ContactInfoItemProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

export function ContactInfoItem({ icon, value, label }: ContactInfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
        {icon}
      </div>
      <div className="text-left">
        <div className="font-bold">{value}</div>
        <div className="text-sm opacity-80">{label}</div>
      </div>
    </div>
  );
}
