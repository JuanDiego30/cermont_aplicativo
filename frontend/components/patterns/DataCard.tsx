// components/patterns/DataCard.tsx
import { LucideIcon } from 'lucide-react';

type DataCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  bgColor?: string;
  iconColor?: string;
};

export function DataCard({
  label,
  value,
  icon: Icon,
  bgColor = 'bg-primary-50 dark:bg-primary-950',
  iconColor = 'text-primary-600 dark:text-primary-400',
}: DataCardProps) {
  return (
    <div className="rounded-2xl border-2 border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">{label}</label>
      </div>
      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{value || 'N/A'}</p>
    </div>
  );
}
