// components/patterns/LandingNavbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

type LandingNavbarProps = {
  logoSrc: string;
  companyName: string;
  systemName: string;
  ctaLabel: string;
  ctaHref: string;
};

export function LandingNavbar({
  logoSrc,
  companyName,
  systemName,
  ctaLabel,
  ctaHref,
}: LandingNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b-2 border-neutral-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-primary-500 bg-white p-1 shadow-lg transition-shadow group-hover:shadow-xl">
              <Image
                src={logoSrc}
                alt={companyName}
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                {companyName}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">{systemName}</div>
            </div>
          </Link>

          {/* CTA Button */}
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
