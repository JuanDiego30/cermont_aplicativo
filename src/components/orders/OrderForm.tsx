"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TipoEquipo, TipoOrden } from '@/lib/types/database';
import { ordersAPI } from '@/lib/api/orders';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import type { PrioridadOrden, CrearOrdenInput } from '@/lib/types/database';
import { failuresAPI, type Falla } from '@/lib/api/failures';

// Schema de validación
const tipoOrdenValues = ['Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Instalación', 'Diagnóstico'] as const satisfies readonly TipoOrden[];
const tipoEquipoValues = ['CCTV', 'Radio Enlace', 'Torre', 'Otro'] as const satisfies readonly TipoEquipo[];

const orderFormSchema = z.object({
  cliente_id: z.string().min(1, 'ID de cliente es requerido'),
  equipo_id: z.string().optional(),
  tipo_orden: z.enum(tipoOrdenValues),
  // En DB tipo_equipo es NOT NULL, hacerlo requerido en el formulario
  tipo_equipo: z.enum(tipoEquipoValues),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  ubicacion: z.string().optional(),
  prioridad: z.enum(['baja', 'normal', 'alta', 'urgente']),
  fecha_programada: z.string().optional(),
});

type FormData = z.infer<typeof orderFormSchema>;

const OrderForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fallas, setFallas] = useState<Falla[]>([]);
  const [selectedFallas, setSelectedFallas] = useState<string[]>([]);
  const [loadingFallas, setLoadingFallas] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      prioridad: 'normal' as const,
      tipo_orden: 'Mantenimiento Preventivo',
      equipo_id: '',
      tipo_equipo: 'CCTV',
      ubicacion: '',
      fecha_programada: '',
    },
  });

  // Cargar fallas según tipo_equipo seleccionado
  const tipoEquipoSeleccionado = ((): TipoEquipo | undefined => {
    // Inferir dinámicamente desde el form state
    // Nota: useWatch sería ideal; como simplificación, recargamos al enviar y ofrecemos un botón manual si hace falta
    return undefined;
  })();

  const loadFallas = async (tipo?: TipoEquipo) => {
    setLoadingFallas(true);
    const res = await failuresAPI.list({ limit: 50, tipo_equipo: tipo || 'CCTV', activo: true });
    if (!res.error && res.data) {
      setFallas(res.data.data || []);
    }
    setLoadingFallas(false);
  };

  useEffect(() => {
    // Carga inicial por defecto (CCTV)
    loadFallas('CCTV');
  }, []);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);

    // Preparar datos para la API
    const orderData: CrearOrdenInput = {
      ...data,
      equipo_id: data.equipo_id || undefined,
      tipo_equipo: data.tipo_equipo,
      ubicacion: data.ubicacion || undefined,
      fecha_programada: data.fecha_programada || undefined,
    };

    // Crear orden
    const response = await ordersAPI.create(orderData);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (response.data && 'data' in response.data) {
      const order = response.data.data;
      // Asociar fallas seleccionadas si hay
      if (selectedFallas.length > 0) {
        await failuresAPI.assignToOrder(order.id, selectedFallas);
      }
      setSuccess(`Orden ${order.numero_orden} creada exitosamente`);
      reset();
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        router.push(`/ordenes/${order.id}`);
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Mensajes de éxito/error */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p className="font-semibold">✓ {success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-semibold">✗ Error al crear orden</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h2>

        {/* Cliente y Equipo */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="cliente_id"
              label="ID del Cliente"
              type="text"
              placeholder="UUID del cliente"
              error={errors.cliente_id?.message}
              required
              {...register('cliente_id')}
            />

            <Input
              id="equipo_id"
              label="ID del Equipo (Opcional)"
              type="text"
              placeholder="UUID del equipo"
              error={errors.equipo_id?.message}
              {...register('equipo_id')}
            />
          </div>
        </fieldset>

        {/* Datos de la Orden */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 mb-4">Datos de la Orden</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="tipo_orden"
              label="Tipo de Orden"
              error={errors.tipo_orden?.message}
              required
              {...register('tipo_orden')}
              options={[
                { value: 'Mantenimiento Preventivo', label: 'Mantenimiento Preventivo' },
                { value: 'Mantenimiento Correctivo', label: 'Mantenimiento Correctivo' },
                { value: 'Instalación', label: 'Instalación' },
                { value: 'Diagnóstico', label: 'Diagnóstico' },
              ]}
            />

            <Select
              id="tipo_equipo"
              label="Tipo de Equipo"
              error={errors.tipo_equipo?.message}
              required
              {...register('tipo_equipo', {
                onChange: async (e) => {
                  const v = e.target.value as TipoEquipo;
                  await loadFallas(v);
                  setSelectedFallas([]);
                },
              })}
              options={[
                { value: 'CCTV', label: 'CCTV' },
                { value: 'Radio Enlace', label: 'Radio Enlace' },
                { value: 'Torre', label: 'Torre' },
                { value: 'Otro', label: 'Otro' },
              ]}
            />
          </div>

          <Input
            id="titulo"
            label="Título de la Orden"
            type="text"
            placeholder="Ej: Mantenimiento de cámaras exteriores"
            error={errors.titulo?.message}
            required
            {...register('titulo')}
          />

          <Textarea
            id="descripcion"
            label="Descripción Detallada"
            rows={4}
            placeholder="Describe el trabajo a realizar..."
            error={errors.descripcion?.message}
            required
            {...register('descripcion')}
          />

          <Input
            id="ubicacion"
            label="Ubicación (Opcional)"
            type="text"
            placeholder="Ej: Edificio A - Piso 2"
            error={errors.ubicacion?.message}
            {...register('ubicacion')}
          />
        </fieldset>

        {/* Fallas asociadas */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 mb-2">Fallas detectadas</legend>
          <p className="text-sm text-gray-600">Selecciona una o varias fallas relacionadas. Esto ayudará a priorizar y a sugerir procedimientos.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto border rounded-md p-3 bg-gray-50">
            {loadingFallas ? (
              <div className="text-gray-500">Cargando fallas...</div>
            ) : fallas.length === 0 ? (
              <div className="text-gray-500">No hay fallas para este tipo de equipo.</div>
            ) : (
              fallas.map((f) => (
                <label key={f.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFallas.includes(f.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedFallas((prev) =>
                        checked ? [...prev, f.id] : prev.filter((x) => x !== f.id)
                      );
                    }}
                  />
                  <span>
                    <span className="font-medium">[{f.codigo}] {f.nombre}</span>
                    <span className="block text-xs text-gray-600">{f.severidad.toUpperCase()} • {f.tipo_equipo}</span>
                    {f.descripcion && (
                      <span className="block text-xs text-gray-500 mt-0.5">{f.descripcion}</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </fieldset>

        {/* Prioridad y Fecha */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 mb-4">Programación</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="prioridad"
              label="Prioridad"
              error={errors.prioridad?.message}
              {...register('prioridad')}
              options={[
                { value: 'baja', label: 'Baja' },
                { value: 'normal', label: 'Normal' },
                { value: 'alta', label: 'Alta' },
                { value: 'urgente', label: 'Urgente' },
              ]}
            />

            <Input
              id="fecha_programada"
              label="Fecha Programada (Opcional)"
              type="datetime-local"
              error={errors.fecha_programada?.message}
              {...register('fecha_programada')}
            />
          </div>
        </fieldset>

        {/* Botones */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            variant="light"
            type="button"
            onClick={() => router.push('/ordenes')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Orden'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
