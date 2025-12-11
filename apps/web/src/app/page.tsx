import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  AboutSection,
  TestimonialSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export const metadata = {
  title: 'CERMONT S.A.S - Soluciones en Refrigeración Industrial',
  description: 'Empresa colombiana con más de 15 años de experiencia en construcción, electricidad, refrigeración, montajes y suministros. Tecnología de última generación y personal altamente calificado.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
