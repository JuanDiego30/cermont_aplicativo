'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCreateKit, useUpdateKit } from '@/lib/hooks/useKits';
import type { Kit, CreateKitDTO } from '@/lib/types/kit';

type KitModalProps = {
  kit: Kit | null;
  mode: 'view' | 'edit' | 'create';
  isOpen: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  { value: 'ELECTRICIDAD', label: 'Electricidad' },
  { value: 'INSTRUMENTACION', label: 'Instrumentaci�n' },
  { value: 'MECANICA', label: 'Mec�nica' },
  { value: 'CIVIL', label: 'Civil' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
];

export function KitModal({ kit, mode, isOpen, onClose }: KitModalProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'equipment' | 'documents'>('tools');
  const [formData, setFormData] = useState<Partial<CreateKitDTO>>({
    name: '',
    description: '',
    category: 'ELECTRICIDAD' as any,
    tools: [],
    equipment: [],
    documents: [],
  });

  const createMutation = useCreateKit();
  const updateMutation = useUpdateKit();

  useEffect(() => {
    if (kit && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: kit.name,
        description: kit.description,
        category: kit.category,
        tools: kit.tools,
        equipment: kit.equipment,
        documents: kit.documents,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'ELECTRICIDAD' as any,
        tools: [],
        equipment: [],
        documents: [],
      });
    }
  }, [kit, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(formData as CreateKitDTO);
      } else if (mode === 'edit' && kit) {
        await updateMutation.mutateAsync({ id: kit.id, data: formData });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar kit:', error);
    }
  };

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const title =
    mode === 'create' ? 'Crear Kit T�pico' : mode === 'edit' ? 'Editar Kit' : 'Detalles del Kit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informaci�n B�sica */}
        <Card>
          <div className="space-y-4">
            <Input
              label="Nombre del Kit"
              placeholder="Ej: Kit El�ctrico B�sico"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isReadOnly}
              required
            />
            <Input
              label="Descripci�n"
              placeholder="Describe el prop�sito y uso del kit"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isReadOnly}
              required
            />
            <Select
              label="Categor�a"
              options={CATEGORY_OPTIONS}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              disabled={isReadOnly}
              required
            />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Herramientas ({formData.tools?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'equipment'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Equipos ({formData.equipment?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Documentos ({formData.documents?.length || 0})
          </button>
        </div>

        {/* Tab Content - Placeholder */}
        <Card>
          <div className="py-8 text-center text-neutral-500">
            <p>Vista de {activeTab} en desarrollo</p>
            <p className="text-sm mt-2">
              Se completar� en la siguiente iteraci�n con react-hook-form
            </p>
          </div>
        </Card>

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Kit' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}

