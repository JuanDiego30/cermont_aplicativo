// components/patterns/ServiceCard.tsx
import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

type ServiceCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  items: string[];
  delay?: number;
};

export function ServiceCard({ title, description, icon, items, delay = 0 }: ServiceCardProps) {
  return (
    <div
      className="group rounded-3xl border-2 border-neutral-200 bg-white p-8 transition-all hover:border-primary-500 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 transition-all group-hover:scale-110 group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white dark:from-primary-950 dark:to-primary-900 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="mb-4 text-neutral-600 dark:text-neutral-400">{description}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <CheckCircle className="h-4 w-4 text-success-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
