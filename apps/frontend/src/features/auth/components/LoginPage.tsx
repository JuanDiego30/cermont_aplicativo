'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';

export default function LoginPage() {
  const { form, globalError, onSubmit, isSubmitting } = useLoginForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        {/* Header con logo */}
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <Image src="/logo-cermont.png" alt="Cermont ATG" width={128} height={128} className="h-16 w-auto" priority />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bienvenido
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Trabajos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error global */}
          {globalError && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3"
            >
              <p className="text-sm text-red-800">{globalError}</p>
            </div>
          )}

          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Credenciales de prueba */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-center text-xs text-blue-700">
            <p className="font-medium">Credenciales de prueba:</p>
            <p className="mt-1 font-mono">admin@cermont.com / admin123</p>
          </div>
        )}

        <div className="pt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}