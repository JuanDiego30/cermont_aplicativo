// components/patterns/FeatureCard.tsx
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
};

export function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="group animate-slide-up overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:border-primary-500 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 shadow-lg transition-transform group-hover:scale-110 dark:from-primary-950 dark:to-primary-900 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>
      <div className="mt-4 flex items-center gap-2 font-semibold text-primary-600 dark:text-primary-400">
        Saber más
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
