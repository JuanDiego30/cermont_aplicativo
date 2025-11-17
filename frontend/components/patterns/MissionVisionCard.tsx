// components/patterns/MissionVisionCard.tsx
import { LucideIcon } from 'lucide-react';

type MissionVisionCardProps = {
  title: string;
  content: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary';
};

export function MissionVisionCard({ title, content, icon: Icon, variant }: MissionVisionCardProps) {
  const styles = {
    primary: {
      border: 'border-primary-200 dark:border-primary-900',
      gradient: 'from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900',
      iconBg: 'from-primary-600 to-primary-500',
    },
    secondary: {
      border: 'border-secondary-200 dark:border-secondary-900',
      gradient: 'from-secondary-50 to-white dark:from-secondary-950 dark:to-neutral-900',
      iconBg: 'from-secondary-600 to-secondary-500',
    },
  }[variant];

  return (
    <div
      className={`group rounded-3xl border-2 ${styles.border} bg-gradient-to-br ${styles.gradient} p-8 transition-all hover:shadow-2xl`}
    >
      <div className="mb-6 flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${styles.iconBg} shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
      </div>
      <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">{content}</p>
    </div>
  );
}
