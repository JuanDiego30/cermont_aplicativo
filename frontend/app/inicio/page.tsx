// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

// Universal Components
import { SectionHeader } from '@/components/patterns/SectionHeader';
import { StatsCard } from '@/components/patterns/StatsCard';
import { FeatureCard } from '@/components/patterns/FeatureCard';
import { BadgeCard } from '@/components/patterns/BadgeCard';

// Icons
import {
  ArrowRight,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  Wrench,
  HardHat,
  Sparkles,
  Award,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================
const TRUST_BADGES = [
  { title: 'ISO 9001', subtitle: 'Certificado', icon: <CheckCircle2 className="h-5 w-5" /> },
  { title: 'RUC', subtitle: 'Vigente', icon: <Shield className="h-5 w-5" /> },
  { title: '+15 Años', subtitle: 'Experiencia', icon: <Award className="h-5 w-5" /> },
];

const STATS_CARDS = [
  {
    label: 'Órdenes Completadas',
    value: '1000+',
    icon: FileText,
    bgColor: 'bg-primary-50 dark:bg-primary-950',
    iconColor: 'text-primary-600 dark:text-primary-400',
    borderColor: 'border-primary-200 dark:border-primary-800',
  },
  {
    label: 'Uptime Garantizado',
    value: '99.9%',
    icon: CheckCircle2,
    bgColor: 'bg-success-50 dark:bg-success-950',
    iconColor: 'text-success-600 dark:text-success-400',
    borderColor: 'border-success-200 dark:border-success-800',
  },
  {
    label: 'Soporte Técnico',
    value: '24/7',
    icon: Clock,
    bgColor: 'bg-secondary-50 dark:bg-secondary-950',
    iconColor: 'text-secondary-600 dark:text-secondary-400',
    borderColor: 'border-secondary-200 dark:border-secondary-800',
  },
  {
    label: 'Clientes Activos',
    value: '50+',
    icon: Users,
    bgColor: 'bg-info-50 dark:bg-info-950',
    iconColor: 'text-info-600 dark:text-info-400',
    borderColor: 'border-info-200 dark:border-info-800',
  },
];

const FEATURES = [
  {
    title: 'Gestión de Órdenes Técnicas',
    description:
      'Control completo del ciclo de vida de órdenes. Estados configurables, asignación automática y seguimiento en tiempo real.',
    icon: <Wrench className="h-8 w-8" />,
  },
  {
    title: 'Dashboard Ejecutivo',
    description:
      'Métricas operacionales y KPIs actualizados. Visibilidad completa del estado de proyectos y equipos.',
    icon: <TrendingUp className="h-8 w-8" />,
  },
  {
    title: 'Trabajo Offline en Campo',
    description:
      'Funciona sin conexión en sitios remotos. Sincronización automática cuando hay señal disponible.',
    icon: <Zap className="h-8 w-8" />,
  },
  {
    title: 'Control de Seguridad',
    description:
      'Autenticación robusta, roles y permisos granulares. Auditoría completa de todas las operaciones.',
    icon: <Shield className="h-8 w-8" />,
  },
  {
    title: 'Reportes Automáticos',
    description:
      'Generación de informes técnicos profesionales en PDF. Entregables listos para clientes.',
    icon: <FileText className="h-8 w-8" />,
  },
  {
    title: 'Soporte 24/7',
    description:
      'Equipo técnico disponible en todo momento. Respuesta inmediata para operaciones críticas.',
    icon: <Clock className="h-8 w-8" />,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ========================================
          SECTION: Navbar
      ========================================== */}
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
                  src="/logo-cermont.png"
                  alt="CERMONT"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  CERMONT S.A.S
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Sistema ATG</div>
              </div>
            </Link>

            {/* CTA */}
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Acceder
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================
          SECTION: Hero
      ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50 to-white px-4 py-20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 sm:py-32">
        {/* Animated Background Blobs */}
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
                <HardHat className="h-4 w-4" />
                Sector Industrial & Mantenimiento
              </div>

              <h1
                className="mb-6 animate-slide-up text-5xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl"
                style={{ animationDelay: '0.1s' }}
              >
                Gestión Técnica de{' '}
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  Órdenes de Trabajo
                </span>
              </h1>

              <p
                className="mb-8 animate-slide-up text-xl leading-relaxed text-neutral-600 dark:text-neutral-400"
                style={{ animationDelay: '0.2s' }}
              >
                Sistema integral para empresas de mantenimiento industrial. Control total de
                proyectos, ejecución en campo y reportes técnicos automáticos.
              </p>

              <div
                className="flex animate-slide-up flex-col gap-4 sm:flex-row"
                style={{ animationDelay: '0.3s' }}
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-primary-500/50"
                >
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-8 py-4 font-bold text-neutral-700 shadow-lg transition-all hover:border-primary-500 hover:bg-neutral-50 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-primary-500">
                  Ver Demo
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div
                className="mt-10 flex animate-slide-up flex-wrap gap-4"
                style={{ animationDelay: '0.4s' }}
              >
                {TRUST_BADGES.map((badge) => (
                  <div
                    key={badge.title}
                    className="flex items-center gap-2 rounded-xl border-2 border-success-200 bg-success-50 px-4 py-2 dark:border-success-900 dark:bg-success-950"
                  >
                    {badge.icon}
                    <div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        {badge.title}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {badge.subtitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {STATS_CARDS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                >
                  <StatsCard {...stat} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          SECTION: Features
      ========================================== */}
      <section className="border-t-2 border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-4 py-20 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm dark:border-primary-900 dark:bg-primary-900/40 dark:text-primary-300">
            <Sparkles className="h-4 w-4" />
            Características Principales
          </div>
          <SectionHeader
            title="Solución Completa para Mantenimiento Industrial"
            description="Herramientas diseñadas específicamente para empresas del sector con los más altos estándares de calidad"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-slide-up"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          SECTION: CTA
      ========================================== */}
      <section className="border-t-2 border-neutral-200 bg-white px-4 py-20 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border-2 border-primary-200 bg-gradient-to-r from-primary-500 to-primary-600 p-12 text-center shadow-2xl dark:border-primary-900">
            <h2 className="mb-4 text-4xl font-bold text-white">
              ¿Listo para Optimizar tus Operaciones?
            </h2>
            <p className="mb-8 text-xl text-primary-50">
              Únete a más de 50 empresas que confían en CERMONT ATG
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-primary-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                Comenzar Ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Solicitar Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          SECTION: Footer
      ========================================== */}
      <footer className="border-t-2 border-neutral-200 bg-neutral-50 px-4 py-12 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-cermont.png"
                alt="CERMONT"
                width={32}
                height={32}
                className="object-contain"
              />
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                © 2025 CERMONT S.A.S. Todos los derechos reservados.
              </div>
            </div>
            <div className="flex gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <Link
                href="/privacy"
                className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                Términos
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

































































