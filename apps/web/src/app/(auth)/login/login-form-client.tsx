/**
 * ARCHIVO: login-form-client.tsx
 * FUNCION: Formulario de inicio de sesión con validación y manejo de errores
 * IMPLEMENTACION: Client Component con useTransition, useAuth hook y estado controlado
 * DEPENDENCIAS: react, next/navigation, lucide-react, @/hooks/useAuth
 * EXPORTS: LoginFormClient
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginFormClient() {
  const router = useRouter();
  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        await login.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Error al iniciar sesión. Verifica tus credenciales.';
        setError(errorMessage);
      }
    });
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('');
  };

  const isLoading = isPending || login.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Correo electrónico <span className="text-error-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="correo@empresa.com"
          required
          autoComplete="email"
          disabled={isLoading}
          className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Contraseña <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Ingresa tu contraseña"
            required
            autoComplete="current-password"
            disabled={isLoading}
            className="w-full h-12 px-4 pr-12 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange('rememberMe')}
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Recordarme
          </span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          role="alert"
          className="p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg text-sm dark:bg-error-900/20 dark:border-error-800 dark:text-error-400"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 flex items-center justify-center gap-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-gray-900"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3 py-2">
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          o continúa con
        </span>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* Social Login */}
      <button
        type="button"
        disabled={isLoading}
        className="w-full h-12 flex items-center justify-center gap-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span>Continuar con Google</span>
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}

/**
 * Icono de Google optimizado
 */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
