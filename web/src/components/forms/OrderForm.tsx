'use client';

import { useState } from 'react';
import type { CreateOrderInput, OrderPriority } from '@/types/order';

interface OrderFormProps {
  onSubmit: (data: CreateOrderInput) => Promise<void>;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading }: OrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderInput>({
    numero: '',
    descripcion: '',
    cliente: '',
    prioridad: 'media',
    fechaFinEstimada: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numero = formData.numero ?? '';
    const descripcion = formData.descripcion ?? '';

    if (!numero.trim()) {
      setError('El número de orden es requerido');
      return;
    }

    if (!descripcion.trim() || descripcion.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    if (!formData.cliente.trim()) {
      setError('El cliente es requerido');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la orden';
      setError(errorMessage);
    }
  };

  const prioridades: { value: OrderPriority; label: string }[] = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Número de Orden */}
      <div>
        <label 
          htmlFor="numero" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Número de Orden <span className="text-error-500">*</span>
        </label>
        <input
          id="numero"
          type="text"
          value={formData.numero}
          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
          placeholder="ORD-001"
          required
          className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors"
        />
      </div>

      {/* Cliente */}
      <div>
        <label 
          htmlFor="cliente" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Cliente <span className="text-error-500">*</span>
        </label>
        <input
          id="cliente"
          type="text"
          value={formData.cliente}
          onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
          placeholder="Nombre del cliente"
          required
          className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors"
        />
      </div>

      {/* Descripción */}
      <div>
        <label 
          htmlFor="descripcion" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Descripción <span className="text-error-500">*</span>
        </label>
        <textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Descripción detallada del trabajo a realizar"
          rows={4}
          required
          className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors resize-none"
        />
      </div>

      {/* Prioridad y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="prioridad" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Prioridad
          </label>
          <select
            id="prioridad"
            value={formData.prioridad}
            onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as OrderPriority })}
            className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors"
          >
            {prioridades.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label 
            htmlFor="fechaFinEstimada" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Fecha Estimada de Fin
          </label>
          <input
            id="fechaFinEstimada"
            type="date"
            value={formData.fechaFinEstimada || ''}
            onChange={(e) => setFormData({ ...formData, fechaFinEstimada: e.target.value })}
            className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg text-sm dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
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
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Guardando...</span>
          </>
        ) : (
          'Crear Orden'
        )}
      </button>
    </form>
  );
}
