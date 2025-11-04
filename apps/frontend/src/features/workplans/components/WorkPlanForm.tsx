// src/features/workplans/components/WorkPlanForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createWorkPlanInputSchema, type CreateWorkPlanInputData } from '../schemas/workplan.schema';
import { BUSINESS_UNITS } from '@/lib/constants';
import { useCreateWorkPlan } from '../hooks/useCreateWorkPlan';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

interface WorkPlanFormProps {
  onSuccess?: () => void;
}

export default function WorkPlanForm({ onSuccess }: WorkPlanFormProps) {
  const createWorkPlan = useCreateWorkPlan();

  // Fetch orders for selection
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders');
      return response.data.data || response.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateWorkPlanInputData>({
    resolver: zodResolver(createWorkPlanInputSchema),
    defaultValues: {
      orderId: '',
      titulo: '',
      descripcion: '',
      alcance: '',
      unidadNegocio: BUSINESS_UNITS.IT,
      startDate: '',
      endDate: '',
      assignedUsers: '',
      tools: '',
      estado: 'borrador',
    },
  });

  const selectedOrderId = watch('orderId');

  const onSubmit = async (data: CreateWorkPlanInputData) => {
    try {
      // Transform data for backend
      const transformedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        assignedUsers: data.assignedUsers.split(',').map(s => s.trim()).filter(s => s.length > 0),
        tools: data.tools.split(',').map(s => s.trim()).filter(s => s.length > 0),
      };

      await createWorkPlan.mutateAsync(transformedData);
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
          {/* Selección de Orden */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selección de Orden</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Orden *</label>
              <Select
                value={selectedOrderId}
                onValueChange={(value) => setValue('orderId', value)}
                disabled={ordersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.map((order: any) => (
                    <SelectItem key={order._id} value={order.code}>
                      {order.code} - {order.numeroOrden} ({order.clienteNombre})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orderId && (
                <p className="text-sm text-red-600">{errors.orderId.message}</p>
              )}
            </div>
          </div>

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
                  value={watch('unidadNegocio')}
                  onValueChange={(value) => setValue('unidadNegocio', value as 'IT' | 'MNT' | 'SC' | 'GEN' | 'Otros')}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Inicio *</label>
                <Input
                  {...register('startDate')}
                  type="date"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Fin *</label>
                <Input
                  {...register('endDate')}
                  type="date"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Usuarios Asignados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usuarios Asignados</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuarios *</label>
              <Input
                {...register('assignedUsers')}
                placeholder="IDs de usuarios separados por coma"
              />
              {errors.assignedUsers && (
                <p className="text-sm text-red-600">{errors.assignedUsers.message}</p>
              )}
            </div>
          </div>

          {/* Herramientas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Herramientas</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Herramientas *</label>
              <Input
                {...register('tools')}
                placeholder="Herramientas separadas por coma"
              />
              {errors.tools && (
                <p className="text-sm text-red-600">{errors.tools.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creando...' : 'Crear Plan de Trabajo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}