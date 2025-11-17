// components/patterns/BadgeCard.tsx
import { ReactNode } from 'react';

type BadgeCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  bgColor: string;
  delay?: number;
};

export function BadgeCard({ title, subtitle, icon, bgColor, delay = 0 }: BadgeCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/80 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{title}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">{subtitle}</div>
      </div>
    </div>
  );
}
