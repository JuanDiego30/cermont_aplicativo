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
import { Select } from '@/components/ui/Select';

// API & Icons
import { ordersApi } from '@/lib/api/orders';
import { FileText, Building2, MapPin, MessageSquare, ArrowLeft, Clock, AlertCircle } from 'lucide-react';

// ============================================================================
// VALIDATION
// ============================================================================
const createOrderSchema = z.object({
  clientName: z.string().min(3, 'El nombre del cliente debe tener al menos 3 caracteres.'),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimatedHours: z.number().positive('Horas estimadas deben ser positivas').optional(),
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
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: '',
      location: '',
      priority: 'MEDIUM',
      estimatedHours: undefined,
    },
  });

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const onSubmit = async (values: CreateOrderFormValues) => {
    setServerError(null);
    try {
      await ordersApi.create({
        clientName: values.clientName,
        clientEmail: values.clientEmail || undefined,
        clientPhone: values.clientPhone || undefined,
        description: values.description,
        location: values.location,
        priority: values.priority || 'MEDIUM',
        estimatedHours: values.estimatedHours,
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
        description="Registra una nueva orden de trabajo con toda la información necesaria"
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
        {/* Client Information Card */}
        <FormCard
          title="Información del Cliente"
          description="Datos de contacto y empresa"
          icon={Building2}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Input
                label="Nombre del Cliente *"
                placeholder="Ej: Sierracol Energy"
                error={errors.clientName?.message}
                {...register('clientName')}
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                placeholder="contacto@cliente.com"
                error={errors.clientEmail?.message}
                {...register('clientEmail')}
              />
            </div>

            <div>
              <Input
                label="Teléfono"
                placeholder="(+57) 300 123 4567"
                error={errors.clientPhone?.message}
                {...register('clientPhone')}
              />
            </div>

            <div>
              <Input
                label="Ubicación *"
                placeholder="Ej: Campo Caño Limón, Arauca"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>
          </div>
        </FormCard>

        {/* Order Details Card */}
        <FormCard
          title="Detalles de la Orden"
          description="Prioridad y estimación de tiempo"
          icon={Clock}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-900 dark:text-neutral-50">
                Prioridad
              </label>
              <select
                className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:ring-primary-950"
                {...register('priority')}
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div>
              <Input
                label="Horas Estimadas"
                type="number"
                placeholder="Ej: 24"
                error={errors.estimatedHours?.message}
                {...register('estimatedHours', { valueAsNumber: true })}
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
              Detalle del trabajo *
            </label>
            <textarea
              rows={6}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-medium text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:ring-primary-950 ${
                errors.description
                  ? 'border-error-500 focus:border-error-500 focus:ring-error-100 dark:focus:ring-error-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
              placeholder="Describe el alcance de la orden, contexto y objetivos. Mínimo 10 caracteres."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-2 text-sm font-bold text-error-600">
                {errors.description.message}
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




