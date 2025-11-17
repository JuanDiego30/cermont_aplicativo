// components/patterns/ClientCard.tsx
type ClientCardProps = {
  name: string;
  icon: string;
  sector: string;
};

export function ClientCard({ name, icon, sector }: ClientCardProps) {
  return (
    <div className="group rounded-3xl border-2 border-neutral-200 bg-white p-8 text-center transition-all hover:border-primary-500 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-5xl transition-transform group-hover:scale-110 dark:from-primary-950 dark:to-primary-900">
          {icon}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-50">{name}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">{sector}</p>
    </div>
  );
}
