// components/patterns/StatDisplay.tsx
type StatDisplayProps = {
  value: string;
  label: string;
  delay?: number;
};

export function StatDisplay({ value, label, delay = 0 }: StatDisplayProps) {
  return (
    <div className="animate-slide-up text-center" style={{ animationDelay: `${delay}s` }}>
      <div className="mb-3 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-5xl font-bold text-transparent">
        {value}
      </div>
      <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{label}</div>
    </div>
  );
}
