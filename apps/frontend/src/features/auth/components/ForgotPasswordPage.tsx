'use client';

import { CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

export default function ForgotPasswordPage() {
  const { form, globalError, success, onSubmit, isSubmitting } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (success) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center shadow-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Correo enviado</h1>
          <p className="text-gray-600">
            Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <Image src="/logo-cermont.png" alt="Cermont" width={128} height={64} className="mx-auto h-16 w-auto" />
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">¿Olvidaste tu contraseña?</h1>
          <p className="mt-2 text-sm text-gray-600">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {globalError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
              {globalError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="forgot-email-error" className="text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full" aria-busy={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
