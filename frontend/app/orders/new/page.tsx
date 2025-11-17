// app/orders/new/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

// Universal Components
import { PageHeader } from '@/components/patterns/PageHeader';
import { FormCard } from '@/components/patterns/FormCard';
import { ErrorAlert } from '@/components/patterns/ErrorAlert';

// UI Components
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// API & Icons
import { ordersApi } from '@/lib/api/orders';
import { FileText, Building2, MapPin, MessageSquare, ArrowLeft } from 'lucide-react';

// ============================================================================
// VALIDATION
// ============================================================================
const createOrderSchema = z.object({
  cliente: z.string().min(3, 'El nombre del cliente debe tener al menos 3 caracteres.'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  ubicacion: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres.'),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function NewOrderPage() {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      cliente: '',
      descripcion: '',
      ubicacion: '',
    },
  });

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const onSubmit = async (values: CreateOrderFormValues) => {
    setServerError(null);
    try {
      await ordersApi.create({
        cliente: values.cliente,
        descripcion: values.descripcion,
        ubicacion: values.ubicacion,
      });
      router.push('/orders');
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ?? 'No se pudo crear la orden. Intenta nuevamente.';
      setServerError(detail);
    }
  };

  const handleCancel = () => {
    router.push('/orders');
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================
          SECTION: Page Header
      ========================================== */}
      <PageHeader
        icon={FileText}
        title="Nueva Orden de Trabajo"
        description="Registra una nueva orden de trabajo con los campos mínimos requeridos"
        badge={{ text: 'Crear Orden', variant: 'primary' }}
        action={
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      {/* ========================================
          SECTION: Form
      ========================================== */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Information Card */}
        <FormCard
          title="Información de la Orden"
          description="Datos básicos del cliente y ubicación"
          icon={Building2}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Input
                label="Cliente"
                placeholder="Ej: Sierracol Energy"
                error={errors.cliente?.message}
                {...register('cliente')}
              />
            </div>

            <div>
              <Input
                label="Ubicación"
                placeholder="Ej: Campo Caño Limón"
                error={errors.ubicacion?.message}
                {...register('ubicacion')}
              />
            </div>
          </div>
        </FormCard>

        {/* Description Card */}
        <FormCard
          title="Descripción del Trabajo"
          description="Detalle del alcance, contexto y objetivos"
          icon={MessageSquare}
        >
          <div>
            <label className="mb-3 block text-sm font-bold text-neutral-900 dark:text-neutral-50">
              Detalle del trabajo
            </label>
            <textarea
              rows={6}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-medium text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:ring-primary-950 ${
                errors.descripcion
                  ? 'border-error-500 focus:border-error-500 focus:ring-error-100 dark:focus:ring-error-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
              placeholder="Describe el alcance de la orden, contexto y objetivos..."
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="mt-2 text-sm font-bold text-error-600">
                {errors.descripcion.message}
              </p>
            )}
          </div>
        </FormCard>

        {/* Server Error */}
        {serverError && <ErrorAlert title="Error al crear orden" message={serverError} />}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Creando...
              </>
            ) : (
              'Crear Orden'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}



