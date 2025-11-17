// components/patterns/LandingHero.tsx
import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type TrustBadge = {
  label: string;
};

type LandingHeroProps = {
  badge: {
    icon: ReactNode;
    text: string;
  };
  title: ReactNode;
  description: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA: {
    label: string;
    icon: ReactNode;
    onClick?: () => void;
  };
  trustBadges: TrustBadge[];
  statsSection: ReactNode;
};

export function LandingHero({
  badge,
  title,
  description,
  primaryCTA,
  secondaryCTA,
  trustBadges,
  statsSection,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50 to-white px-4 py-20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 sm:py-32">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-800/20"></div>
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-float rounded-full bg-secondary-300/40 blur-3xl dark:bg-secondary-800/20"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="mb-6 inline-flex w-fit animate-slide-up items-center gap-2 rounded-full border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-white px-4 py-2 text-sm font-bold text-primary-700 shadow-lg dark:border-primary-900 dark:from-primary-950 dark:to-primary-900 dark:text-primary-300">
              {badge.icon}
              {badge.text}
            </div>

            {/* Title */}
            <h1
              className="mb-6 animate-slide-up text-5xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              className="mb-8 animate-slide-up text-xl leading-relaxed text-neutral-600 dark:text-neutral-400"
              style={{ animationDelay: '0.2s' }}
            >
              {description}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex animate-slide-up flex-col gap-4 sm:flex-row"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href={primaryCTA.href}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-primary-500/50"
              >
                {primaryCTA.label}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={secondaryCTA.onClick}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-8 py-4 font-bold text-neutral-700 shadow-lg transition-all hover:border-primary-500 hover:bg-neutral-50 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-primary-500"
              >
                {secondaryCTA.label}
                {secondaryCTA.icon}
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className="mt-10 flex animate-slide-up flex-wrap items-center gap-8"
              style={{ animationDelay: '0.4s' }}
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 dark:bg-success-950">
                    <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
                  </div>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          {statsSection}
        </div>
      </div>
    </section>
  );
}
