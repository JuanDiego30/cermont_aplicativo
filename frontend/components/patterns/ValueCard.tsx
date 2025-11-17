// components/patterns/ValueCard.tsx
import { Heart } from 'lucide-react';

type ValueCardProps = {
  title: string;
  description: string;
  delay?: number;
};

export function ValueCard({ title, description, delay = 0 }: ValueCardProps) {
  return (
    <div
      className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:border-primary-500 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 transition-all group-hover:scale-110 dark:from-primary-950 dark:to-primary-900 dark:text-primary-400">
        <Heart className="h-7 w-7" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}
