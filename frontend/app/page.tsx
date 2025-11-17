// app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  Target,
  Eye,
  CheckCircle,
  Shield,
  MapPin,
  Phone,
  Mail,
  Zap,
  Wind,
  Radio,
  Building2,
} from 'lucide-react';

// Universal Components
import { SectionHeader } from '@/components/patterns/SectionHeader';
import { BadgeCard } from '@/components/patterns/BadgeCard';
import { StatDisplay } from '@/components/patterns/StatDisplay';
import { MissionVisionCard } from '@/components/patterns/MissionVisionCard';
import { ValueCard } from '@/components/patterns/ValueCard';
import { ServiceCard } from '@/components/patterns/ServiceCard';
import { ClientCard } from '@/components/patterns/ClientCard';
import { ContactInfoItem } from '@/components/patterns/ContactInfoItem';

// ============================================================================
// CONSTANTS (INLINE - Sin archivo externo)
// ============================================================================
const BADGES = [
  {
    title: 'ISO 9001',
    subtitle: 'Certificado',
    icon: <CheckCircle className="h-5 w-5 text-success-600" />,
    bgColor: 'bg-success-100 dark:bg-success-950',
  },
  {
    title: 'RUC Vigente',
    subtitle: 'Actualizado',
    icon: <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />,
    bgColor: 'bg-primary-100 dark:bg-primary-950',
  },
  {
    title: '+15 Años',
    subtitle: 'Experiencia',
    icon: <Award className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />,
    bgColor: 'bg-secondary-100 dark:bg-secondary-950',
  },
];

const STATS = [
  { value: '2008', label: 'Fundación' },
  { value: '+500', label: 'Proyectos' },
  { value: '99%', label: 'Satisfacción' },
  { value: '24/7', label: 'Soporte' },
];

const VALORES = [
  { title: 'Calidad', description: 'Excelencia en cada proyecto' },
  { title: 'Eficiencia', description: 'Optimización de recursos' },
  { title: 'Efectividad', description: 'Resultados garantizados' },
  { title: 'Competitividad', description: 'Líderes del sector' },
  { title: 'Responsabilidad', description: 'Compromiso total' },
  { title: 'Desarrollo Humano', description: 'Talento calificado' },
  { title: 'Trabajo en Equipo', description: 'Colaboración constante' },
  { title: 'Seguridad', description: 'Prioridad número uno' },
  { title: 'Mejora Continua', description: 'Innovación permanente' },
];

const SERVICIOS = [
  {
    title: 'Construcción',
    description: 'Obras civiles y estructuras metálicas de gran escala',
    icon: <Building2 className="h-10 w-10" />,
    items: ['Obras civiles', 'Montajes', 'Estructuras'],
  },
  {
    title: 'Electricidad',
    description: 'Instalaciones eléctricas industriales y mantenimiento',
    icon: <Zap className="h-10 w-10" />,
    items: ['Subestaciones', 'Instalaciones', 'Mantenimiento'],
  },
  {
    title: 'Refrigeración',
    description: 'Sistemas HVAC y climatización industrial',
    icon: <Wind className="h-10 w-10" />,
    items: ['HVAC', 'Climatización', 'Aires acondicionados'],
  },
  {
    title: 'Telecomunicaciones',
    description: 'Infraestructura de comunicaciones profesional',
    icon: <Radio className="h-10 w-10" />,
    items: ['Cableado', 'Torres', 'Redes'],
  },
];

const CLIENTES = [
  { name: 'Ecopetrol', icon: '🛢️', sector: 'Sector Hidrocarburos' },
  { name: 'Pacific Rubiales', icon: '⚡', sector: 'Energía' },
  { name: 'Drummond', icon: '⛏️', sector: 'Minería' },
];

const CONTACT_INFO = [
  { icon: <MapPin className="h-6 w-6" />, value: 'Arauca, Colombia', label: 'Ubicación' },
  { icon: <Phone className="h-6 w-6" />, value: '+57 300 123 4567', label: 'Teléfono' },
  { icon: <Mail className="h-6 w-6" />, value: 'info@cermont.com', label: 'Email' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md transition-all dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
              <div className="rounded-xl border-2 border-primary-500 bg-white p-2 shadow-lg dark:bg-neutral-900">
                <Image
                  src="/logo-cermont.png"
                  alt="CERMONT"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  CERMONT S.A.S
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Desde 2008 · Arauca
                </div>
              </div>
            </Link>

            <Link
              href="/login"
              className="group flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary-500/50"
            >
              Acceder
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 px-6 pb-20 pt-32 dark:from-primary-950 dark:via-neutral-950 dark:to-primary-900"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-800/20"></div>
          <div
            className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-float rounded-full bg-secondary-200/40 blur-3xl dark:bg-secondary-800/20"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex animate-slide-up flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary-500 bg-primary-100 px-4 py-2 text-sm font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <Award className="h-4 w-4" />
                +15 años de experiencia en el sector
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 lg:text-6xl">
                Soluciones{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Industriales
                </span>{' '}
                Integrales
              </h1>

              <p className="mb-8 text-xl text-neutral-600 dark:text-neutral-400">
                Expertos en construcción, electricidad, refrigeración y telecomunicaciones.
              </p>

              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 font-bold text-white shadow-xl"
                >
                  Gestión ATG
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#servicios"
                  className="flex h-14 items-center justify-center rounded-xl border-2 border-neutral-300 bg-white px-8 font-bold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  Ver servicios
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {BADGES.map((badge, i) => (
                  <BadgeCard key={badge.title} {...badge} delay={i * 0.1} />
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="group relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl dark:border-neutral-800">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 via-primary-100 to-secondary-200 dark:from-primary-900 dark:via-primary-800 dark:to-secondary-900"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <StatDisplay key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-neutral-50 px-6 py-20 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Nuestro Propósito"
            description="Comprometidos con la excelencia"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <MissionVisionCard
              title="Misión"
              content="Prestar servicios eficientes en construcción, mantenimiento y montajes."
              icon={Target}
              variant="primary"
            />
            <MissionVisionCard
              title="Visión 2026"
              content="Ser una empresa rentable, sólida y en continuo crecimiento."
              icon={Eye}
              variant="secondary"
            />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Nuestros Valores" description="Principios que guían nuestro trabajo" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALORES.map((valor, i) => (
              <ValueCard key={valor.title} {...valor} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="bg-neutral-50 px-6 py-20 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Servicios Especializados" description="Soluciones integrales" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map((servicio, i) => (
              <ServiceCard key={servicio.title} {...servicio} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Clientes */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Clientes" description="Proyectos de alto impacto" />
          <div className="grid gap-8 md:grid-cols-3">
            {CLIENTES.map((cliente) => (
              <ClientCard key={cliente.name} {...cliente} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold">¿Listo para tu Próximo Proyecto?</h2>
          <p className="mb-10 text-xl opacity-90">Contáctanos para una cotización</p>
          <div className="mb-12 flex flex-wrap justify-center gap-8">
            {CONTACT_INFO.map((info) => (
              <ContactInfoItem key={info.label} {...info} />
            ))}
          </div>
          <Link
            href="/login"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-white px-8 font-bold text-primary-600 shadow-2xl"
          >
            Acceder al Sistema ATG
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-12 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6">
            <Image src="/logo-cermont.png" alt="CERMONT" width={60} height={60} />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © 2025 CERMONT S.A.S · Arauca, Colombia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}






