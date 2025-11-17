// app/forgot-password/page.tsx

// ============================================================================
// IMPORTS
// ============================================================================
import Link from 'next/link';
import Image from 'next/image';

// Universal Components
import { AnimatedBackground } from '@/components/patterns/AnimatedBackground';
import { InfoBox } from '@/components/patterns/InfoBox';

// Icons
import { Lock, ArrowLeft, Mail, AlertCircle, HelpCircle } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ForgotPasswordPage() {
  return (
    <AnimatedBackground className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg animate-slide-up">
        {/* ========================================
            SECTION: Logo Header
        ========================================== */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary-500 bg-white p-2 shadow-xl dark:bg-neutral-900">
              <Image
                src="/logo-cermont.png"
                alt="CERMONT"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                CERMONT S.A.S
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Sistema ATG</div>
            </div>
          </Link>
        </div>

        {/* ========================================
            SECTION: Main Card
        ========================================== */}
        <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
          {/* Card Header */}
          <div className="border-b-2 border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-8 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warning-100 to-warning-50 shadow-inner dark:from-warning-950 dark:to-warning-900">
                <Lock className="h-8 w-8 text-warning-600 dark:text-warning-400" />
              </div>
            </div>

            <div className="mb-2 flex items-center justify-center gap-2">
              <div className="h-1 w-1 rounded-full bg-warning-500"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-warning-600 dark:text-warning-400">
                Seguridad
              </p>
              <div className="h-1 w-1 rounded-full bg-warning-500"></div>
            </div>

            <h1 className="mb-3 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Recuperar Contraseña
            </h1>

            <p className="text-center text-neutral-600 dark:text-neutral-400">
              Solicita asistencia para restablecer tus credenciales de acceso
            </p>
          </div>

          {/* Card Content */}
          <div className="space-y-6 p-8">
            {/* Process Info Alert */}
            <InfoBox title="Proceso en Desarrollo" icon={AlertCircle} variant="info">
              El flujo de recuperación automática está siendo coordinado con el equipo de Sistemas.
              Por ahora, el proceso requiere asistencia directa del administrador.
            </InfoBox>

            {/* Technical Info Alert */}
            <InfoBox title="Estado del Backend" icon={HelpCircle} variant="neutral">
              <p className="mb-3">
                El backend expone las rutas de{' '}
                <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                  login
                </code>
                ,{' '}
                <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                  refresh
                </code>{' '}
                y{' '}
                <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                  logout
                </code>
                , pero aún no cuenta con un endpoint público de restablecimiento.
              </p>
              <p>
                Estamos trabajando en un flujo guiado que se activará en futuras iteraciones.
              </p>
            </InfoBox>

            {/* Contact Info Card */}
            <div className="rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 dark:border-primary-900 dark:from-primary-950 dark:to-primary-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900">
                  <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-50">
                  ¿Necesitas Ayuda?
                </h3>
              </div>
              <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
                Ponte en contacto con tu administrador para solicitar un reinicio de credenciales:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                  <span className="font-medium">Email:</span>
                  <a
                    href="mailto:sistemas@cermont.com"
                    className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    sistemas@cermont.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                  <span className="font-medium">Teléfono:</span>
                  <span className="font-semibold">+57 300 123 4567</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-6 py-4 font-semibold text-neutral-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-primary-500 dark:hover:bg-primary-950 dark:hover:text-primary-400"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          ¿Tienes problemas? Contacta con{' '}
          <a
            href="mailto:soporte@cermont.com"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            soporte técnico
          </a>
        </p>
      </div>
    </AnimatedBackground>
  );
}





