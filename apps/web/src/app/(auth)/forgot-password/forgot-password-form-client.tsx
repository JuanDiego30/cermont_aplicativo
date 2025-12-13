/**
 * 📁 app/(auth)/forgot-password/forgot-password-form-client.tsx
 *
 * ✨ Client Component para el formulario de recuperación de contraseña
 */

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordFormClient() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    startTransition(async () => {
      try {
        // TODO: Implementar llamada a la API
        // await authApi.forgotPassword(email);
        
        // Simular delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setSuccess(true);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al enviar el correo. Por favor intenta de nuevo.';
        setError(errorMessage);
      }
    });
  };

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-success-100 dark:bg-success-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success-600 dark:text-success-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          ¡Correo enviado!
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Hemos enviado instrucciones para restablecer tu contraseña a{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {email}
          </span>
        </p>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

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
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="correo@empresa.com"
            required
            autoComplete="email"
            disabled={isPending}
            className="w-full h-12 px-4 pl-11 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
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
        disabled={isPending}
        className="w-full h-12 flex items-center justify-center gap-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-gray-900"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          'Enviar instrucciones'
        )}
      </button>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
