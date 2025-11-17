// app/login/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

// Universal Components
import { AnimatedBackground } from '@/components/patterns/AnimatedBackground';
import { ErrorAlert } from '@/components/patterns/ErrorAlert';

// UI Components
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Icons
import { AlertCircle, ArrowRight, Mail, Lock, Shield, CheckCircle } from 'lucide-react';

// ============================================================================
// VALIDATION
// ============================================================================
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================
const TRUST_BADGES = [
  { text: 'ISO 9001 Certificado' },
  { text: 'RUC Vigente' },
  { text: '+15 Años de Experiencia' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LoginPage() {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
    } catch (err: any) {
      setServerError(err?.response?.data?.detail ?? 'Credenciales incorrectas');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <AnimatedBackground className="flex items-center justify-center px-4">
      {/* Theme Toggle */}
      <div className="fixed right-6 top-6 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md animate-slide-up">
        {/* ========================================
            SECTION: Logo
        ========================================== */}
        <div className="mb-10 flex justify-center">
          <Link href="/" className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 blur-2xl transition-opacity group-hover:opacity-30"></div>

            {/* Logo Container */}
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-primary-500 bg-white shadow-2xl transition-transform group-hover:scale-105 dark:bg-neutral-900">
              <Image
                src="/logo-cermont.png"
                alt="CERMONT"
                width={100}
                height={100}
                className="object-contain p-4"
                priority
              />
            </div>

            {/* Badge */}
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </Link>
        </div>

        {/* ========================================
            SECTION: Header
        ========================================== */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-neutral-900 dark:text-neutral-50">
            CERMONT S.A.S
          </h1>
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Sistema de Gestión ATG · Desde 2008
          </p>
        </div>

        {/* ========================================
            SECTION: Login Card
        ========================================== */}
        <div className="overflow-hidden rounded-3xl border-2 border-primary-200 bg-white/90 p-10 shadow-2xl backdrop-blur-xl dark:border-primary-900 dark:bg-neutral-900/90">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Iniciar Sesión
            </h2>
            <p className="font-medium text-neutral-600 dark:text-neutral-400">
              Acceso seguro al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-900 dark:text-neutral-50">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-primary-500" />
                </div>
                <input
                  type="email"
                  placeholder="tu@cermont.com"
                  className={`h-14 w-full rounded-xl border-2 bg-white pl-12 pr-4 font-medium text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:ring-primary-950 ${
                    errors.email
                      ? 'border-error-500 focus:border-error-500 focus:ring-error-100 dark:focus:ring-error-950'
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-2 flex items-center gap-1 text-sm font-bold text-error-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-primary-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`h-14 w-full rounded-xl border-2 bg-white pl-12 pr-4 font-medium text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:ring-primary-950 ${
                    errors.password
                      ? 'border-error-500 focus:border-error-500 focus:ring-error-100 dark:focus:ring-error-950'
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-2 flex items-center gap-1 text-sm font-bold text-error-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <ErrorAlert title="Error de autenticación" message={serverError} />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 font-bold text-white shadow-2xl transition-all hover:scale-[1.02] hover:shadow-primary-500/50 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <span className="relative flex items-center justify-center gap-2 text-lg">
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="font-medium text-neutral-600 dark:text-neutral-400">
              ¿No tienes cuenta?{' '}
              <Link
                href="/request-access"
                className="font-bold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Solicita acceso
              </Link>
            </p>
          </div>
        </div>

        {/* ========================================
            SECTION: Trust Badges
        ========================================== */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 rounded-full border-2 border-primary-200 bg-white/70 px-5 py-2 backdrop-blur-sm transition-all hover:border-primary-500 hover:bg-white dark:border-primary-900 dark:bg-neutral-900/70"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50 dark:bg-success-950">
                <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
              </div>
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                {badge.text}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
          © 2025 CERMONT S.A.S · Fundada en 2008 · Arauca, Colombia
        </p>
      </div>
    </AnimatedBackground>
  );
}














