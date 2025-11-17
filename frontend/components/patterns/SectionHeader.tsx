// components/patterns/SectionHeader.tsx
type SectionHeaderProps = {
  title: string;
  description: string;
  align?: 'left' | 'center' | 'right';
};

export function SectionHeader({ title, description, align = 'center' }: SectionHeaderProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div className={`mb-16 ${alignClass}`}>
      <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h2>
      <p className="text-xl text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}
