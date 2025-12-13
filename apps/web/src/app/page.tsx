/**
 * 📁 app/page.tsx
 *
 * ✨ Landing Page - Server Component
 * Página principal de CERMONT S.A.S
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  AboutSection,
  TestimonialSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

// Metadata específica para la landing page (sobreescribe la del layout)
export const metadata: Metadata = {
  title: 'CERMONT S.A.S - Soluciones en Refrigeración Industrial',
  description:
    'Empresa colombiana con más de 15 años de experiencia en construcción, electricidad, refrigeración, montajes y suministros. Tecnología de última generación y personal altamente calificado.',
  alternates: {
    canonical: '/',
  },
};

/**
 * Landing Page Component
 * Server Component por defecto - mejor SEO y performance
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header con navegación */}
      <LandingHeader />

      {/* Main content */}
      <main>
        {/* Hero Section - Arriba del fold */}
        <HeroSection />

        {/* Features - Lazy loaded con Suspense */}
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>

        {/* About Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>

        {/* Testimonials */}
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialSection />
        </Suspense>

        {/* Call to Action */}
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

/**
 * Skeleton para secciones durante lazy loading
 */
function SectionSkeleton() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          {/* Title skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>

          {/* Content skeleton */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
