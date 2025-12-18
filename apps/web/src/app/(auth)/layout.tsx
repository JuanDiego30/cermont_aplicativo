/**
 * 📁 app/(auth)/layout.tsx
 *
 * ✨ Layout compartido para rutas de autenticación (login, register)
 * Server Component - No requiere 'use client'
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    template: '%s | CERMONT',
    default: 'Autenticación | CERMONT',
  },
  description: 'Accede al sistema de gestión de órdenes de trabajo de CERMONT SAS',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left side - Form */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full p-6 sm:p-0">
        {/* Back link */}
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Form container */}
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {children}
        </div>
      </div>

      {/* Right side - Branding (hidden on mobile) */}
      <AuthBranding />
    </div>
  );
}

/**
 * Componente de branding para el lado derecho
 * Server Component - Renderizado estático
 */
function AuthBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-brand-950 dark:bg-white/5 items-center justify-center">
      <div className="relative flex flex-col items-center max-w-md text-center px-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.svg"
              alt="Cermont"
              fill
              className="object-contain"
              priority
              sizes="128px"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4">
          CERMONT S.A.S
        </h2>

        {/* Description */}
        <p className="text-gray-400 dark:text-white/60 leading-relaxed">
          Sistema de Gestión de Órdenes de Servicio Industrial.
          Optimiza tus procesos de mantenimiento y servicio técnico.
        </p>

        {/* Features list */}
        <ul className="mt-8 space-y-3 text-left">
          {[
            'Gestión integral de órdenes de trabajo',
            'Seguimiento en tiempo real',
            'Reportes y métricas avanzadas',
            'Soporte offline para técnicos',
          ].map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-gray-400 dark:text-white/60"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-brand-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
