// components/patterns/HeroStats.tsx
import { LucideIcon } from 'lucide-react';
import { Target, Activity } from 'lucide-react';

type HeroStatsProps = {
  title: string;
  description: string;
  badge?: {
    icon: LucideIcon;
    text: string;
  };
  kpis: Array<{
    title: string;
    value: string;
    hint: string;
  }>;
};

export function HeroStats({ title, description, badge, kpis }: HeroStatsProps) {
  const BadgeIcon = badge?.icon || Target;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 p-10 text-white shadow-2xl">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute right-0 top-0 h-96 w-96 animate-float rounded-full bg-white/20 blur-3xl"></div>
        <div
          className="absolute bottom-0 left-0 h-96 w-96 animate-float rounded-full bg-white/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative">
        {badge && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BadgeIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-100">
              {badge.text}
            </span>
          </div>
        )}

        <h1 className="mb-4 text-5xl font-bold">{title}</h1>
        <p className="max-w-3xl text-xl text-primary-50">{description}</p>

        {/* KPI Badges */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.title}
              className="group animate-slide-up cursor-pointer rounded-2xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/20 hover:shadow-2xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-100">
                  {kpi.title}
                </p>
                <Activity className="h-4 w-4 text-primary-100 transition-transform group-hover:scale-125" />
              </div>
              <p className="mb-1 text-4xl font-bold">{kpi.value}</p>
              <p className="text-sm text-primary-100">{kpi.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
