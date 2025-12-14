/**
 * ARCHIVO: KitForm.tsx
 * FUNCION: Formulario para crear kits de herramientas/materiales con items dinámicos
 * IMPLEMENTACION: Gestión CRUD de items en tabla editable con categorías configurables
 * DEPENDENCIAS: Button, Input, Textarea (UI), CreateKitInput, KitItem (types/kit)
 * EXPORTS: KitForm (componente)
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { CreateKitInput, KitItem } from '@/types/kit';

interface KitFormProps {
  onSubmit: (data: CreateKitInput) => Promise<void>;
  isLoading?: boolean;
  categorias?: string[];
}

export function KitForm({ onSubmit, isLoading, categorias = ['General', 'Herramientas', 'Materiales', 'Seguridad'] }: KitFormProps) {
  const [formData, setFormData] = useState<CreateKitInput>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'General',
    items: [],
  });
  const [newItem, setNewItem] = useState<Omit<KitItem, 'id'>>({
    nombre: '',
    cantidad: 1,
    unidad: 'unidad',
    descripcion: '',
  });
  const [error, setError] = useState('');

  const addItem = () => {
    if (newItem.nombre.trim()) {
      setFormData({
        ...formData,
        items: [...(formData.items || []), newItem],
      });
      setNewItem({ nombre: '', cantidad: 1, unidad: 'unidad', descripcion: '' });
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items?.filter((_: Omit<KitItem, 'id'>, i: number) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.codigo.trim()) {
      setError('El código es requerido');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el kit';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium mb-1">
            Código *
          </label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="KIT-001"
            required
          />
        </div>
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium mb-1">
            Categoría
          </label>
          <select
            id="categoria"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1">
          Nombre *
        </label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Nombre del kit"
          required
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={2}
        />
      </div>

      {/* Items del Kit */}
      <div>
        <label className="block text-sm font-medium mb-2">Items del Kit</label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <Input
            value={newItem.nombre}
            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
            placeholder="Nombre del item"
          />
          <Input
            type="number"
            min={1}
            value={newItem.cantidad}
            onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value) || 1 })}
          />
          <Input
            value={newItem.unidad}
            onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
            placeholder="Unidad"
          />
          <Button type="button" variant="secondary" onClick={addItem}>
            Agregar
          </Button>
        </div>
        
        {formData.items && formData.items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Cantidad</th>
                <th className="text-left py-2">Unidad</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.nombre}</td>
                  <td className="text-center py-2">{item.cantidad}</td>
                  <td className="py-2">{item.unidad}</td>
                  <td className="text-right py-2">
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : 'Crear Kit'}
      </Button>
    </form>
  );
}
