// components/patterns/StatsCard.tsx
import { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  bgColor,
  iconColor,
  borderColor,
  trend,
}: StatsCardProps) {
  return (
    <div
      className={`group animate-slide-up cursor-pointer overflow-hidden rounded-3xl border-2 ${borderColor} bg-white p-8 shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-neutral-900`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} shadow-lg transition-all group-hover:scale-110`}
        >
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-bold ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <p className="text-5xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
      <p className="mt-2 font-semibold text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
