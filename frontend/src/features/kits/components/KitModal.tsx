'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import Input from '@/shared/components/form/input/InputField';
import Select from '@/shared/components/form/Select';
import { FormField } from '@/shared/components/form/FormField';
import Button from '@/shared/components/ui/button/Button';
import { Card } from '@/shared/components/ui/Card';
import { useCreateKit, useUpdateKit } from '../hooks/useKits';
import type { Kit, CreateKitDTO, ToolItem, EquipmentItem, DocumentItem } from '../types/kit.types';
import { v4 as uuidv4 } from 'uuid';

type KitModalProps = {
  kit: Kit | null;
  mode: 'view' | 'edit' | 'create';
  isOpen: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  { value: 'ELECTRICIDAD', label: 'Electricidad' },
  { value: 'INSTRUMENTACION', label: 'Instrumentación' },
  { value: 'MECANICA', label: 'Mecánica' },
  { value: 'CIVIL', label: 'Civil' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
  { value: 'OTROS', label: 'Otros' },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'AST', label: 'AST' },
  { value: 'PROCEDIMIENTO', label: 'Procedimiento' },
  { value: 'INSTRUCTIVO', label: 'Instructivo' },
  { value: 'FORMATO', label: 'Formato' },
];

export function KitModal({ kit, mode, isOpen, onClose }: KitModalProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'equipment' | 'documents'>('tools');
  const [formData, setFormData] = useState<Partial<CreateKitDTO>>({
    name: '',
    description: '',
    category: 'ELECTRICIDAD',
    tools: [],
    equipment: [],
    documents: [],
  });

  // Estados para nuevos items
  const [newTool, setNewTool] = useState<Partial<ToolItem>>({
    name: '',
    quantity: 1,
    unit: 'unid',
    required: true,
    certificationRequired: false,
  });

  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentItem>>({
    name: '',
    quantity: 1,
    certificationRequired: false,
  });

  const [newDocument, setNewDocument] = useState<Partial<DocumentItem>>({
    name: '',
    type: 'AST',
    required: true,
  });

  const createMutation = useCreateKit();
  const updateMutation = useUpdateKit();

  useEffect(() => {
    if (kit && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: kit.name,
        description: kit.description,
        category: kit.category,
        tools: kit.tools || [],
        equipment: kit.equipment || [],
        documents: kit.documents || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'ELECTRICIDAD',
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

  const handleAddTool = () => {
    if (!newTool.name) return;
    const tool: ToolItem = {
      id: uuidv4(),
      name: newTool.name,
      quantity: newTool.quantity || 1,
      unit: newTool.unit || 'unid',
      required: newTool.required || false,
      certificationRequired: newTool.certificationRequired || false,
    };
    setFormData({ ...formData, tools: [...(formData.tools || []), tool] });
    setNewTool({ name: '', quantity: 1, unit: 'unid', required: true, certificationRequired: false });
  };

  const handleRemoveTool = (id: string) => {
    setFormData({ ...formData, tools: formData.tools?.filter((t) => t.id !== id) });
  };

  const handleAddEquipment = () => {
    if (!newEquipment.name) return;
    const equipment: EquipmentItem = {
      id: uuidv4(),
      name: newEquipment.name,
      quantity: newEquipment.quantity || 1,
      certificationRequired: newEquipment.certificationRequired || false,
      model: newEquipment.model,
      serialNumber: newEquipment.serialNumber,
    };
    setFormData({ ...formData, equipment: [...(formData.equipment || []), equipment] });
    setNewEquipment({ name: '', quantity: 1, certificationRequired: false, model: '', serialNumber: '' });
  };

  const handleRemoveEquipment = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment?.filter((e) => e.id !== id) });
  };

  const handleAddDocument = () => {
    if (!newDocument.name) return;
    const doc: DocumentItem = {
      id: uuidv4(),
      name: newDocument.name,
      type: newDocument.type || 'AST',
      required: newDocument.required || false,
    };
    setFormData({ ...formData, documents: [...(formData.documents || []), doc] });
    setNewDocument({ name: '', type: 'AST', required: true });
  };

  const handleRemoveDocument = (id: string) => {
    setFormData({ ...formData, documents: formData.documents?.filter((d) => d.id !== id) });
  };

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const title =
    mode === 'create' ? 'Crear Kit Típico' : mode === 'edit' ? 'Editar Kit' : 'Detalles del Kit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <div className="space-y-4">
            <FormField label="Nombre del Kit" required>
              <Input
                placeholder="Ej: Kit Eléctrico Básico"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Descripción" required>
              <Input
                placeholder="Describe el propósito y uso del kit"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
              />
            </FormField>
            <FormField label="Categoría" required>
              <Select
                options={CATEGORY_OPTIONS}
                defaultValue={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value as CreateKitDTO['category'] })}
                className={isReadOnly ? 'pointer-events-none opacity-70' : ''}
              />
            </FormField>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'tools'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
          >
            Herramientas ({formData.tools?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'equipment'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
          >
            Equipos ({formData.equipment?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'documents'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
          >
            Documentos ({formData.documents?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <Card>
          <div className="space-y-4">
            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                {!isReadOnly && (
                  <div className="grid grid-cols-12 gap-2 items-end p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <div className="col-span-5">
                      <FormField label="Nombre">
                        <Input
                          placeholder="Ej: Destornillador"
                          value={newTool.name}
                          onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-2">
                      <FormField label="Cant.">
                        <Input
                          type="number"
                          min="1"
                          value={newTool.quantity?.toString()}
                          onChange={(e) => setNewTool({ ...newTool, quantity: parseInt(e.target.value) })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-3">
                      <FormField label="Unidad">
                        <Input
                          placeholder="unid"
                          value={newTool.unit}
                          onChange={(e) => setNewTool({ ...newTool, unit: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-2">
                      <Button type="button" onClick={handleAddTool} disabled={!newTool.name} className="w-full">
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {formData.tools?.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-sm text-neutral-500">
                          {tool.quantity} {tool.unit} • {tool.required ? 'Requerido' : 'Opcional'}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTool(tool.id)} className="text-red-500 hover:text-red-600">
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.tools?.length === 0 && (
                    <p className="text-center text-neutral-500 py-4">No hay herramientas agregadas</p>
                  )}
                </div>
              </div>
            )}

            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="space-y-4">
                {!isReadOnly && (
                  <div className="grid grid-cols-12 gap-2 items-end p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <div className="col-span-4">
                      <FormField label="Nombre">
                        <Input
                          placeholder="Ej: Multímetro"
                          value={newEquipment.name}
                          onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-3">
                      <FormField label="Modelo">
                        <Input
                          placeholder="Opcional"
                          value={newEquipment.model}
                          onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-2">
                      <FormField label="Cant.">
                        <Input
                          type="number"
                          min="1"
                          value={newEquipment.quantity?.toString()}
                          onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-3">
                      <Button type="button" onClick={handleAddEquipment} disabled={!newEquipment.name} className="w-full">
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {formData.equipment?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-neutral-500">
                          {item.quantity} unid. {item.model ? `• Modelo: ${item.model}` : ''}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEquipment(item.id)} className="text-red-500 hover:text-red-600">
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.equipment?.length === 0 && (
                    <p className="text-center text-neutral-500 py-4">No hay equipos agregados</p>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {!isReadOnly && (
                  <div className="grid grid-cols-12 gap-2 items-end p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <div className="col-span-5">
                      <FormField label="Nombre">
                        <Input
                          placeholder="Ej: AST Eléctrico"
                          value={newDocument.name}
                          onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-4">
                      <FormField label="Tipo">
                        <Select
                          options={DOCUMENT_TYPE_OPTIONS}
                          defaultValue={newDocument.type}
                          onChange={(value) => setNewDocument({ ...newDocument, type: value as DocumentItem['type'] })}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-3">
                      <Button type="button" onClick={handleAddDocument} disabled={!newDocument.name} className="w-full">
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {formData.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-neutral-500">
                          {doc.type} • {doc.required ? 'Requerido' : 'Opcional'}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-600">
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.documents?.length === 0 && (
                    <p className="text-center text-neutral-500 py-4">No hay documentos agregados</p>
                  )}
                </div>
              </div>
            )}
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
