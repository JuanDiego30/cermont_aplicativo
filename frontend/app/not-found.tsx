// app/not-found.tsx (o 404.tsx)
import Link from 'next/link';

// Universal Components
import { AnimatedBackground } from '@/components/patterns/AnimatedBackground';

// UI Components
import { Button } from '@/components/ui/Button';

// Icons
import { Home, LayoutDashboard, Mail, AlertCircle } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function NotFound() {
  return (
    <AnimatedBackground className="flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center animate-slide-up">
        {/* ========================================
            SECTION: Error Icon
        ========================================== */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-error-500 to-warning-500 opacity-20 blur-2xl"></div>
            
            {/* Error Badge */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-error-500 to-warning-500 shadow-2xl">
              <span className="text-5xl font-bold text-white">404</span>
            </div>

            {/* Alert Icon Badge */}
            <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-warning-500 to-warning-600 shadow-xl">
              <AlertCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* ========================================
            SECTION: Error Message
        ========================================== */}
        <div className="mb-10 rounded-3xl border-2 border-neutral-200 bg-white/90 p-10 shadow-2xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-1 w-1 rounded-full bg-error-500"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-error-600 dark:text-error-400">
              Página no encontrada
            </p>
            <div className="h-1 w-1 rounded-full bg-error-500"></div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            ¡Ups! Esta página no existe
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400">
            La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio
            para continuar navegando por el sistema.
          </p>
        </div>

        {/* ========================================
            SECTION: Actions
        ========================================== */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/" className="flex-1 sm:flex-none">
            <Button variant="primary" className="group w-full sm:w-auto flex items-center justify-center gap-2">
              <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="group w-full sm:w-auto flex items-center justify-center gap-2">
              <LayoutDashboard className="h-5 w-5 transition-transform group-hover:scale-110" />
              Ir al Dashboard
            </Button>
          </Link>
        </div>

        {/* ========================================
            SECTION: Help Box
        ========================================== */}
        <div className="rounded-2xl border-2 border-info-200 bg-info-50 p-6 dark:border-info-900 dark:bg-info-950">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Mail className="h-5 w-5 text-info-600 dark:text-info-400" />
            <span className="text-sm font-bold text-info-900 dark:text-info-300">
              ¿Necesitas ayuda?
            </span>
          </div>
          <p className="text-sm text-info-700 dark:text-info-400">
            Si crees que esto es un error, contacta a{' '}
            <a
              href="mailto:sistemas@cermont.com"
              className="font-bold text-info-800 underline transition-colors hover:text-info-900 dark:text-info-300 dark:hover:text-info-200"
            >
              sistemas@cermont.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Error 404 · Sistema ATG CERMONT
        </p>
      </div>
    </AnimatedBackground>
  );
}



