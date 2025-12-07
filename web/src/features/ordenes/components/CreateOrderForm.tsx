'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateOrder } from '../hooks/use-orders';
import type { CreateOrderInput, OrderPriority, OrderType } from '@/types/order';

interface CreateOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const orderTypes: { value: OrderType; label: string }[] = [
  { value: 'instalacion', label: 'Instalación' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'inspeccion', label: 'Inspección' },
];

const priorities: { value: OrderPriority; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function CreateOrderForm({ onSuccess, onCancel }: CreateOrderFormProps) {
  const { mutate: createOrder, isPending, error } = useCreateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrderInput>({
    defaultValues: {
      cliente: '',
      descripcion: '',
      tipo: 'instalacion',
      prioridad: 'media',
      ubicacion: '',
    },
  });

  const onSubmit = (data: CreateOrderInput) => {
    setServerError(null);
    createOrder(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
      onError: (err: any) => {
        setServerError(err.message || 'Error al crear la orden');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {/* Cliente */}
      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cliente *
        </label>
        <input
          type="text"
          id="cliente"
          {...register('cliente', { required: 'El cliente es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder="Nombre del cliente"
        />
        {errors.cliente && (
          <p className="mt-1 text-sm text-red-600">{errors.cliente.message}</p>
        )}
      </div>

      {/* Tipo */}
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de Orden *
        </label>
        <select
          id="tipo"
          {...register('tipo', { required: 'El tipo es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          {orderTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prioridad */}
      <div>
        <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prioridad *
        </label>
        <select
          id="prioridad"
          {...register('prioridad', { required: 'La prioridad es requerida' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ubicación
        </label>
        <input
          type="text"
          id="ubicacion"
          {...register('ubicacion')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder="Dirección o ubicación"
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          {...register('descripcion')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          placeholder="Descripción del trabajo..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Creando...' : 'Crear Orden'}
        </button>
      </div>
    </form>
  );
}
