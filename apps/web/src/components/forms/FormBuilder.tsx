'use client';

import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  Image, 
  FileText,
  Save,
  Eye,
  Settings,
  Copy
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime' 
  | 'checkbox' 
  | 'select' 
  | 'radio' 
  | 'textarea' 
  | 'file' 
  | 'photo'
  | 'signature'
  | 'section'
  | 'table';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  // Para tablas
  columns?: FormField[];
  // Para secciones
  fields?: FormField[];
  // Condicional
  showIf?: {
    field: string;
    value: string | boolean;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  code: string; // OPE-001, OPE-002, etc
  description: string;
  version: string;
  category: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

interface FormBuilderProps {
  template?: FormTemplate;
  onSave: (template: FormTemplate) => Promise<void>;
  isLoading?: boolean;
}

// ============================================
// FIELD TYPE CONFIG
// ============================================

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'text', label: 'Texto', icon: <Type className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  { type: 'number', label: 'Número', icon: <Hash className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  { type: 'date', label: 'Fecha', icon: <Calendar className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  { type: 'datetime', label: 'Fecha/Hora', icon: <Calendar className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  { type: 'checkbox', label: 'Casilla', icon: <CheckSquare className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
  { type: 'select', label: 'Selector', icon: <List className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700' },
  { type: 'radio', label: 'Opciones', icon: <List className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700' },
  { type: 'textarea', label: 'Área texto', icon: <FileText className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
  { type: 'photo', label: 'Foto', icon: <Image className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
  { type: 'file', label: 'Archivo', icon: <FileText className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
  { type: 'section', label: 'Sección', icon: <Settings className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' },
];

// ============================================
// COMPONENT
// ============================================

export function FormBuilder({ template, onSave, isLoading }: FormBuilderProps) {
  const [formData, setFormData] = useState<Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: template?.name || '',
    code: template?.code || 'OPE-',
    description: template?.description || '',
    version: template?.version || '1.0',
    category: template?.category || 'operativo',
    fields: template?.fields || [],
  });

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  // Generar ID único
  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Agregar campo
  const addField = useCallback((type: FieldType) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `Nuevo campo ${type}`,
      name: `campo_${Date.now()}`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'radio' ? [
        { value: 'opcion1', label: 'Opción 1' },
        { value: 'opcion2', label: 'Opción 2' },
      ] : undefined,
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedField(newField.id);
  }, []);

  // Actualizar campo
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  }, []);

  // Eliminar campo
  const removeField = useCallback((fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  }, [selectedField]);

  // Duplicar campo
  const duplicateField = useCallback((fieldId: string) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      const newField: FormField = {
        ...field,
        id: generateId(),
        name: `${field.name}_copy`,
        label: `${field.label} (copia)`,
      };
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, newField],
      }));
    }
  }, [formData.fields]);

  // Mover campo (drag & drop)
  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newFields = [...prev.fields];
      const [removed] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, removed);
      return { ...prev, fields: newFields };
    });
  }, []);

  // Guardar formulario
  const handleSave = async () => {
    const templateToSave: FormTemplate = {
      id: template?.id || generateId(),
      ...formData,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSave(templateToSave);
  };

  // Campo seleccionado
  const currentField = formData.fields.find(f => f.id === selectedField);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                placeholder="OPE-001"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Formulario</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                placeholder="Formato de Planeación de Obra"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Editar' : 'Vista Previa'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          placeholder="Descripción del formulario..."
          rows={2}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tipos de campo */}
        {!previewMode && (
          <div className="w-56 bg-gray-50 dark:bg-gray-900 border-r p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Campos Disponibles</h3>
            <div className="space-y-2">
              {FIELD_TYPES.map((fieldType) => (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border hover:border-blue-300 hover:shadow-sm transition"
                >
                  <span className={`p-1 rounded ${fieldType.color}`}>
                    {fieldType.icon}
                  </span>
                  {fieldType.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas - Lista de campos */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          <div className="max-w-2xl mx-auto space-y-3">
            {formData.fields.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed">
                <Plus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Arrastra campos desde la izquierda o haz clic para agregarlos
                </p>
              </div>
            ) : (
              formData.fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable={!previewMode}
                  onDragStart={() => setDraggedField(field.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedField && draggedField !== field.id) {
                      const fromIndex = formData.fields.findIndex(f => f.id === draggedField);
                      moveField(fromIndex, index);
                    }
                    setDraggedField(null);
                  }}
                  onClick={() => !previewMode && setSelectedField(field.id)}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 transition cursor-pointer ${
                    selectedField === field.id 
                      ? 'ring-2 ring-blue-500 border-blue-300' 
                      : 'hover:border-gray-300'
                  } ${draggedField === field.id ? 'opacity-50' : ''}`}
                >
                  {previewMode ? (
                    // Preview Mode - Render actual field
                    <FormFieldPreview field={field} />
                  ) : (
                    // Edit Mode - Show field info
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1 cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            FIELD_TYPES.find(t => t.type === field.type)?.color || 'bg-gray-100'
                          }`}>
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="text-red-500 text-xs">* Requerido</span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">{field.label}</p>
                        <p className="text-xs text-gray-500">{field.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {!previewMode && selectedField && currentField && (
          <div className="w-72 bg-white dark:bg-gray-800 border-l p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Propiedades del Campo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Etiqueta</label>
                <input
                  type="text"
                  value={currentField.label}
                  onChange={(e) => updateField(currentField.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre (ID)</label>
                <input
                  type="text"
                  value={currentField.name}
                  onChange={(e) => updateField(currentField.id, { name: e.target.value.replace(/\s/g, '_') })}
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={currentField.placeholder || ''}
                  onChange={(e) => updateField(currentField.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Texto de ayuda</label>
                <input
                  type="text"
                  value={currentField.helpText || ''}
                  onChange={(e) => updateField(currentField.id, { helpText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={currentField.required}
                  onChange={(e) => updateField(currentField.id, { required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">
                  Campo requerido
                </label>
              </div>

              {/* Opciones para select/radio */}
              {(currentField.type === 'select' || currentField.type === 'radio') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Opciones</label>
                  <div className="space-y-2">
                    {currentField.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOptions = [...(currentField.options || [])];
                            newOptions[i] = { ...newOptions[i], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s/g, '_') };
                            updateField(currentField.id, { options: newOptions });
                          }}
                          className="flex-1 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button
                          onClick={() => {
                            const newOptions = currentField.options?.filter((_, idx) => idx !== i);
                            updateField(currentField.id, { options: newOptions });
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(currentField.options || []), { value: 'nueva', label: 'Nueva opción' }];
                        updateField(currentField.id, { options: newOptions });
                      }}
                      className="w-full py-1 text-sm text-blue-600 hover:bg-blue-50 rounded border border-dashed"
                    >
                      + Agregar opción
                    </button>
                  </div>
                </div>
              )}

              {/* Validación numérica */}
              {currentField.type === 'number' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mínimo</label>
                    <input
                      type="number"
                      value={currentField.validation?.min || ''}
                      onChange={(e) => updateField(currentField.id, { 
                        validation: { ...currentField.validation, min: parseInt(e.target.value) || undefined }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Máximo</label>
                    <input
                      type="number"
                      value={currentField.validation?.max || ''}
                      onChange={(e) => updateField(currentField.id, { 
                        validation: { ...currentField.validation, max: parseInt(e.target.value) || undefined }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

function FormFieldPreview({ field }: { field: FormField }) {
  const [value, setValue] = useState<any>(field.defaultValue || '');

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        );
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => setValue(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{field.placeholder || 'Sí'}</span>
          </label>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        );
      case 'photo':
      case 'file':
        return (
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {field.type === 'photo' ? 'Tomar foto o seleccionar' : 'Seleccionar archivo'}
            </p>
            <input type="file" accept={field.type === 'photo' ? 'image/*' : undefined} className="hidden" />
          </div>
        );
      case 'section':
        return (
          <div className="border-t border-b py-2 bg-gray-50 dark:bg-gray-900 -mx-4 px-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">{field.label}</h4>
          </div>
        );
      default:
        return <p className="text-gray-500">Campo no soportado</p>;
    }
  };

  return (
    <div>
      {field.type !== 'section' && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {field.helpText && (
        <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
      )}
    </div>
  );
}

export default FormBuilder;
