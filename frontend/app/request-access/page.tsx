// app/request-access/page.tsx
import Link from 'next/link';

// Universal Components
import { AnimatedBackground } from '@/components/patterns/AnimatedBackground';
import { InfoBox } from '@/components/patterns/InfoBox';

// Icons
import { UserPlus, ArrowLeft, Mail, Code } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RequestAccessPage() {
  return (
    <AnimatedBackground className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* ========================================
            SECTION: Header Card
        ========================================== */}
        <div className="mb-8 overflow-hidden rounded-3xl border-2 border-primary-200 bg-white/90 p-10 shadow-2xl backdrop-blur-xl dark:border-primary-900 dark:bg-neutral-900/90">
          {/* Icon Header */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-info-100 to-info-50 shadow-inner dark:from-info-950 dark:to-info-900">
              <UserPlus className="h-10 w-10 text-info-600 dark:text-info-400" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-1 w-1 rounded-full bg-info-500"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-info-600 dark:text-info-400">
              Acceso Supervisado
            </p>
            <div className="h-1 w-1 rounded-full bg-info-500"></div>
          </div>

          <h1 className="mb-4 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Solicitar Usuario
          </h1>

          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Los nuevos usuarios se configuran desde el módulo de administración. Si necesitas acceso,
            contacta al equipo de Sistemas o SST.
          </p>
        </div>

        {/* ========================================
            SECTION: Contact Info
        ========================================== */}
        <div className="mb-6 space-y-6">
          <InfoBox
            title="¿Cómo solicitar acceso?"
            icon={Mail}
            variant="info"
          >
            <p className="mb-3">
              Para obtener un nuevo usuario, comparte la siguiente información con el equipo de Sistemas:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-info-500"></div>
                <span>Nombre completo</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-info-500"></div>
                <span>Área o departamento</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-info-500"></div>
                <span>Rol o funciones a desempeñar</span>
              </li>
            </ul>
            <div className="mt-4 rounded-xl border-2 border-info-200 bg-info-50 p-4 dark:border-info-900 dark:bg-info-950">
              <p className="text-sm font-semibold text-info-700 dark:text-info-300">
                📧 Email: sistemas@cermont.com
              </p>
              <p className="mt-1 text-sm font-semibold text-info-700 dark:text-info-300">
                📞 Tel: +57 300 123 4567
              </p>
            </div>
          </InfoBox>

          <InfoBox
            title="Información Técnica"
            icon={Code}
            variant="neutral"
          >
            <p className="mb-3">
              El backend actual publica{' '}
              <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                POST /api/users
              </code>{' '}
              con la política{' '}
              <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                USERSCREATE
              </code>
              , por lo que solo el personal autorizado puede crear cuentas.
            </p>
            <p>
              Cuando la funcionalidad de auto-registro esté disponible, este espacio apuntará al nuevo
              flujo guiado.
            </p>
          </InfoBox>
        </div>

        {/* ========================================
            SECTION: Back Link
        ========================================== */}
        <Link
          href="/login"
          className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-6 py-4 font-semibold text-neutral-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-primary-500 dark:hover:bg-primary-950 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Regresar al inicio de sesión
        </Link>

        {/* Footer */}
        <p className="mt-6 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Sistema de Gestión ATG · CERMONT S.A.S
        </p>
      </div>
    </AnimatedBackground>
  );
}




