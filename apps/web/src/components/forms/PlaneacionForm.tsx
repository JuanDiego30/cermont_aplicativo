'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

// Tipos para el formulario
export type TipoItem = 'MATERIAL' | 'HERRAMIENTA' | 'EQUIPO' | 'SEGURIDAD';

export interface ItemPlaneacion {
  id?: string;
  tipo: TipoItem;
  descripcion: string;
  cantidad: number;
  unidad: string;
  observaciones?: string;
}

export interface PlaneacionFormData {
  ordenId: string;
  empresa: string;
  ubicacion: string;
  fechaEstimadaInicio: string;
  fechaEstimadaFin: string;
  descripcionTrabajo: string;
  items: ItemPlaneacion[];
  observaciones: string;
}

interface PlaneacionFormProps {
  ordenId: string;
  ordenNumero?: string;
  initialData?: Partial<PlaneacionFormData>;
  onSubmit: (data: PlaneacionFormData) => Promise<void>;
  isLoading?: boolean;
}

const TIPOS_ITEM: { value: TipoItem; label: string; color: string }[] = [
  { value: 'MATERIAL', label: 'Materiales', color: 'bg-blue-100 text-blue-800' },
  { value: 'HERRAMIENTA', label: 'Herramientas', color: 'bg-green-100 text-green-800' },
  { value: 'EQUIPO', label: 'Equipos', color: 'bg-purple-100 text-purple-800' },
  { value: 'SEGURIDAD', label: 'Seguridad', color: 'bg-red-100 text-red-800' },
];

const UNIDADES = ['UND', 'M', 'KG', 'L', 'PAQ', 'ROLLO', 'PAR'];

export function PlaneacionForm({ 
  ordenId, 
  ordenNumero,
  initialData, 
  onSubmit, 
  isLoading 
}: PlaneacionFormProps) {
  const [formData, setFormData] = useState<PlaneacionFormData>({
    ordenId,
    empresa: initialData?.empresa || '',
    ubicacion: initialData?.ubicacion || '',
    fechaEstimadaInicio: initialData?.fechaEstimadaInicio || '',
    fechaEstimadaFin: initialData?.fechaEstimadaFin || '',
    descripcionTrabajo: initialData?.descripcionTrabajo || '',
    items: initialData?.items || [],
    observaciones: initialData?.observaciones || '',
  });

  const [newItem, setNewItem] = useState<ItemPlaneacion>({
    tipo: 'MATERIAL',
    descripcion: '',
    cantidad: 1,
    unidad: 'UND',
    observaciones: '',
  });

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TipoItem>('MATERIAL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.empresa.trim()) {
      setError('La empresa es requerida');
      return;
    }

    if (!formData.ubicacion.trim()) {
      setError('La ubicación es requerida');
      return;
    }

    if (!formData.fechaEstimadaInicio || !formData.fechaEstimadaFin) {
      setError('Las fechas estimadas son requeridas');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la planeación';
      setError(errorMessage);
    }
  };

  const addItem = () => {
    if (!newItem.descripcion.trim()) {
      setError('La descripción del item es requerida');
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem, id: crypto.randomUUID() }],
    });

    setNewItem({
      tipo: activeTab,
      descripcion: '',
      cantidad: 1,
      unidad: 'UND',
      observaciones: '',
    });
    setError('');
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const getItemsByType = (tipo: TipoItem) => formData.items.filter(item => item.tipo === tipo);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Planeación de Obra (OPE-001)
          </h2>
          {ordenNumero && (
            <Badge variant="info">
              Orden: {ordenNumero}
            </Badge>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Datos generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium mb-1">
              Empresa *
            </label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
              required
            />
          </div>

          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium mb-1">
              Ubicación *
            </label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ubicación del trabajo"
              required
            />
          </div>

          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
              Fecha Inicio Estimada *
            </label>
            <Input
              id="fechaInicio"
              type="datetime-local"
              value={formData.fechaEstimadaInicio}
              onChange={(e) => setFormData({ ...formData, fechaEstimadaInicio: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
              Fecha Fin Estimada *
            </label>
            <Input
              id="fechaFin"
              type="datetime-local"
              value={formData.fechaEstimadaFin}
              onChange={(e) => setFormData({ ...formData, fechaEstimadaFin: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
            Descripción del Trabajo
          </label>
          <Textarea
            id="descripcion"
            value={formData.descripcionTrabajo}
            onChange={(e) => setFormData({ ...formData, descripcionTrabajo: e.target.value })}
            placeholder="Descripción detallada del trabajo a realizar"
            rows={3}
          />
        </div>
      </Card>

      {/* Items por categoría */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Items de Planeación</h3>

        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIPOS_ITEM.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              onClick={() => {
                setActiveTab(tipo.value);
                setNewItem({ ...newItem, tipo: tipo.value });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tipo.value
                  ? tipo.color + ' ring-2 ring-offset-2 ring-gray-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tipo.label} ({getItemsByType(tipo.value).length})
            </button>
          ))}
        </div>

        {/* Formulario para agregar item */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <Input
              value={newItem.descripcion}
              onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
              placeholder="Descripción del item"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <Input
              type="number"
              min="1"
              value={newItem.cantidad}
              onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <Select
              value={newItem.unidad}
              onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
              options={UNIDADES.map(u => ({ value: u, label: u }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <Input
              value={newItem.observaciones || ''}
              onChange={(e) => setNewItem({ ...newItem, observaciones: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addItem} variant="outline" className="w-full">
              + Agregar
            </Button>
          </div>
        </div>

        {/* Lista de items por categoría activa */}
        <div className="space-y-2">
          {getItemsByType(activeTab).length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay items de {TIPOS_ITEM.find(t => t.value === activeTab)?.label.toLowerCase()} agregados
            </p>
          ) : (
            getItemsByType(activeTab).map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-3 bg-white border rounded-lg"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.descripcion}</span>
                  <span className="text-gray-500 ml-2">
                    ({item.cantidad} {item.unidad})
                  </span>
                  {item.observaciones && (
                    <span className="text-gray-400 text-sm ml-2">- {item.observaciones}</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(item.id!)}
                >
                  Eliminar
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Observaciones generales */}
      <Card className="p-4">
        <label htmlFor="observaciones" className="block text-sm font-medium mb-1">
          Observaciones Generales
        </label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          placeholder="Observaciones adicionales sobre la planeación"
          rows={3}
        />
      </Card>

      {/* Resumen y acciones */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            {TIPOS_ITEM.map((tipo) => (
              <Badge key={tipo.value} className={tipo.color}>
                {tipo.label}: {getItemsByType(tipo.value).length}
              </Badge>
            ))}
          </div>
          <Button type="submit" disabled={isLoading} variant="default">
            {isLoading ? 'Guardando...' : 'Guardar Planeación'}
          </Button>
        </div>
      </Card>
    </form>
  );
}

export default PlaneacionForm;
