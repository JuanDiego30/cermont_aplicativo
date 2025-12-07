'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { WorkPlanCreate } from '@/types/workplan';

interface WorkPlanFormProps {
  ordenId: string;
  onSubmit: (data: WorkPlanCreate) => Promise<void>;
  isLoading?: boolean;
}

export function WorkPlanForm({ ordenId, onSubmit, isLoading }: WorkPlanFormProps) {
  const [formData, setFormData] = useState<WorkPlanCreate>({
    ordenId,
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      setError('Las fechas son requeridas');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el plan';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1">
          Nombre del Plan *
        </label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Nombre del plan de trabajo"
          required
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <Textarea
          id="descripcion"
          value={formData.descripcion || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
            Fecha Inicio *
          </label>
          <Input
            id="fechaInicio"
            type="datetime-local"
            value={formData.fechaInicio}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fechaInicio: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
            Fecha Fin *
          </label>
          <Input
            id="fechaFin"
            type="datetime-local"
            value={formData.fechaFin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fechaFin: e.target.value })}
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : 'Crear Plan de Trabajo'}
      </Button>
    </form>
  );
}
