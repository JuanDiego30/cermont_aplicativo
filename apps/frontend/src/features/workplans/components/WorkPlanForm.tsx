// src/features/workplans/components/WorkPlanForm.tsx
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { workPlanSchema, type WorkPlanFormData } from '../schemas/workplan.schema';
import { BUSINESS_UNITS, SECURITY_ELEMENT_CATEGORIES } from '@/lib/constants';
import { useCreateWorkPlan } from '../hooks/useCreateWorkPlan';
import { type CreateWorkPlanData } from '@/types/workplan.types';
import { toast } from 'sonner';

interface WorkPlanFormProps {
  orderId: string;
  onSuccess?: () => void;
}

export default function WorkPlanForm({ orderId, onSuccess }: WorkPlanFormProps) {
  const createWorkPlan = useCreateWorkPlan();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
    reset,
  } = useForm<WorkPlanFormData>({
    resolver: zodResolver(workPlanSchema),
    defaultValues: {
      orderId,
      unidadNegocio: BUSINESS_UNITS.IT,
      personalRequerido: {
        electricistas: 0,
        tecnicosTelecomunicacion: 0,
        instrumentistas: 0,
        obreros: 0,
      },
    },
  });

  const watchedUnidadNegocio = useWatch({
    control,
    name: 'unidadNegocio',
  });

  const onSubmit = async (data: WorkPlanFormData) => {
    try {
      // Transform form data to API data
      const apiData: CreateWorkPlanData = {
        ...data,
        materiales: data.materiales?.map(material => ({
          ...material,
          solicitado: false,
          recibido: false,
        })),
        herramientas: data.herramientas?.map(herramienta => ({
          ...herramienta,
          disponible: true,
        })),
        equipos: data.equipos?.map(equipo => ({
          ...equipo,
          certificado: equipo.certificado ? {
            ...equipo.certificado,
            vencido: false,
          } : undefined,
        })),
        elementosSeguridad: data.elementosSeguridad?.map(elemento => ({
          ...elemento,
          categoria: elemento.categoria as keyof typeof SECURITY_ELEMENT_CATEGORIES,
        })),
        cronograma: data.cronograma?.map(actividad => ({
          ...actividad,
          completada: false,
        })),
      };

      await createWorkPlan.mutateAsync(apiData);
      toast.success('Plan de trabajo creado exitosamente');
      reset();
      onSuccess?.();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al crear el plan de trabajo';
      toast.error(message);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Plan de Trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información General</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  {...register('titulo')}
                  placeholder="Título del plan de trabajo"
                />
                {errors.titulo && (
                  <p className="text-sm text-red-600">{errors.titulo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unidad de Negocio *</label>
                <Select
                  value={watchedUnidadNegocio}
                  onValueChange={(value) => setValue('unidadNegocio', value as typeof BUSINESS_UNITS.IT)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BUSINESS_UNITS).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidadNegocio && (
                  <p className="text-sm text-red-600">{errors.unidadNegocio.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alcance *</label>
              <Textarea
                {...register('alcance')}
                placeholder="Describa el alcance del trabajo..."
                rows={4}
              />
              {errors.alcance && (
                <p className="text-sm text-red-600">{errors.alcance.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                {...register('descripcion')}
                placeholder="Descripción adicional (opcional)..."
                rows={3}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>
          </div>

          {/* Cronograma Básico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cronograma</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actividad Principal *</label>
              <Input
                {...register('cronograma.0.actividad')}
                placeholder="Descripción de la actividad principal"
              />
              {errors.cronograma?.[0]?.actividad && (
                <p className="text-sm text-red-600">{errors.cronograma[0].actividad.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Inicio *</label>
                <Input
                  {...register('cronograma.0.fechaInicio')}
                  type="date"
                />
                {errors.cronograma?.[0]?.fechaInicio && (
                  <p className="text-sm text-red-600">{errors.cronograma[0].fechaInicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Fin *</label>
                <Input
                  {...register('cronograma.0.fechaFin')}
                  type="date"
                />
                {errors.cronograma?.[0]?.fechaFin && (
                  <p className="text-sm text-red-600">{errors.cronograma[0].fechaFin.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Plan de Trabajo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}