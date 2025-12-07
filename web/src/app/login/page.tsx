'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import { useInitializeTheme } from '@/stores/uiStore';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/components/icons';

export default function LoginPage() {
  // Initialize theme on mount
  useInitializeTheme();

  return (
    <div className="relative min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left side - Form */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full p-6 sm:p-0">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
        
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
      
      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-950 dark:bg-white/5 items-center justify-center">
        <div className="relative flex flex-col items-center max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            CERMONT
          </h2>
          
          <p className="text-gray-400 dark:text-white/60">
            Sistema de Gestión de Órdenes de Servicio Industrial. 
            Optimiza tus procesos de mantenimiento y servicio técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
