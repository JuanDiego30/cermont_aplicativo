/**
 * ARCHIVO: DynamicFormRenderer.tsx
 * FUNCION: Renderizador de formularios dinámicos creados con FormBuilder
 * IMPLEMENTACION: Renderiza campos según tipo, maneja validación, fotos, archivos y geolocalización
 * DEPENDENCIAS: Lucide icons, FormBuilder types, Geolocation API
 * EXPORTS: DynamicFormRenderer, FormSubmission (tipo)
 */
'use client';

import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import type { FormTemplate, FormField } from './FormBuilder';

// ============================================
// TYPES
// ============================================

export interface FormSubmission {
  templateId: string;
  templateCode: string;
  templateName: string;
  data: Record<string, any>;
  evidencias: {
    fieldName: string;
    type: 'photo' | 'file';
    url: string;
    filename: string;
  }[];
  submittedAt: string;
  submittedBy: string;
  location?: {
    lat: number;
    lng: number;
  };
  ordenId?: string;
}

interface DynamicFormRendererProps {
  template: FormTemplate;
  initialData?: Record<string, any>;
  onSubmit: (submission: FormSubmission) => Promise<void>;
  onSaveDraft?: (data: Record<string, any>) => void;
  isLoading?: boolean;
  ordenId?: string;
  userId?: string;
}

// ============================================
// COMPONENT
// ============================================

export function DynamicFormRenderer({
  template,
  initialData = {},
  onSubmit,
  onSaveDraft,
  isLoading,
  ordenId,
  userId = 'current-user',
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidencias, setEvidencias] = useState<FormSubmission['evidencias']>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Actualizar campo
  const updateField = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => new Set(prev).add(name));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Validar campo
  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return 'Este campo es requerido';
    }

    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `El valor mínimo es ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `El valor máximo es ${field.validation.max}`;
      }
    }

    if ((field.type === 'text' || field.type === 'textarea') && value) {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        return `Mínimo ${field.validation.minLength} caracteres`;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        return `Máximo ${field.validation.maxLength} caracteres`;
      }
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return 'Formato inválido';
        }
      }
    }

    return null;
  }, []);

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    template.fields.forEach(field => {
      // Verificar condición showIf
      if (field.showIf) {
        const conditionValue = formData[field.showIf.field];
        if (conditionValue !== field.showIf.value) {
          return; // No validar campos ocultos
        }
      }

      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template.fields, formData, validateField]);

  // Manejar foto
  const handlePhotoCapture = useCallback(async (fieldName: string, file: File) => {
    // En producción, subir a servidor y obtener URL
    const url = URL.createObjectURL(file);
    
    setEvidencias(prev => [
      ...prev.filter(e => e.fieldName !== fieldName),
      {
        fieldName,
        type: 'photo',
        url,
        filename: file.name,
      }
    ]);
    
    updateField(fieldName, url);
  }, [updateField]);

  // Manejar archivo
  const handleFileUpload = useCallback(async (fieldName: string, file: File) => {
    const url = URL.createObjectURL(file);
    
    setEvidencias(prev => [
      ...prev.filter(e => e.fieldName !== fieldName),
      {
        fieldName,
        type: 'file',
        url,
        filename: file.name,
      }
    ]);
    
    updateField(fieldName, url);
  }, [updateField]);

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Obtener ubicación si está disponible
    let location: { lat: number; lng: number } | undefined;
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch {
        // Ubicación no disponible, continuar sin ella
      }
    }

    const submission: FormSubmission = {
      templateId: template.id,
      templateCode: template.code,
      templateName: template.name,
      data: formData,
      evidencias,
      submittedAt: new Date().toISOString(),
      submittedBy: userId,
      location,
      ordenId,
    };

    await onSubmit(submission);
  };

  // Renderizar campo
  const renderField = (field: FormField) => {
    // Verificar condición showIf
    if (field.showIf) {
      const conditionValue = formData[field.showIf.field];
      if (conditionValue !== field.showIf.value) {
        return null;
      }
    }

    const value = formData[field.name] ?? field.defaultValue ?? '';
    const error = touched.has(field.name) ? errors[field.name] : undefined;
    const hasError = !!error;

    const baseInputClasses = `w-full px-3 py-2.5 border rounded-lg text-sm transition-colors
      ${hasError 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600'
      } dark:bg-gray-700`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            name={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            className={baseInputClasses}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputClasses}
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            className={baseInputClasses}
            required={field.required}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            name={field.name}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            className={baseInputClasses}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={(e) => updateField(field.name, e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.placeholder || 'Sí'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Seleccionar...'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            onBlur={() => setTouched(prev => new Set(prev).add(field.name))}
            rows={4}
            className={baseInputClasses}
            required={field.required}
          />
        );

      case 'photo':
        return (
          <div className="space-y-3">
            {value ? (
              <div className="relative">
                <img 
                  src={value} 
                  alt="Evidencia" 
                  className="w-full max-h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateField(field.name, '');
                    setEvidencias(prev => prev.filter(e => e.fieldName !== field.name));
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800">
                <Camera className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 mb-3">Tomar foto o seleccionar imagen</p>
                <div className="flex justify-center gap-3">
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Cámara
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoCapture(field.name, file);
                      }}
                    />
                  </label>
                  <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Galería
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoCapture(field.name, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            {value ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <Check className="w-5 h-5 text-green-500" />
                <span className="flex-1 text-sm truncate">
                  {evidencias.find(e => e.fieldName === field.name)?.filename || 'Archivo seleccionado'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateField(field.name, '');
                    setEvidencias(prev => prev.filter(e => e.fieldName !== field.name));
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 bg-gray-50 dark:bg-gray-800">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">Haz clic para seleccionar archivo</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(field.name, file);
                  }}
                />
              </label>
            )}
          </div>
        );

      case 'section':
        return (
          <div className="border-t-2 pt-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {field.label}
            </h3>
            {field.helpText && (
              <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">Tipo de campo no soportado: {field.type}</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-medium mb-2">
              {template.code}
            </span>
            <h1 className="text-xl font-bold">{template.name}</h1>
            {template.description && (
              <p className="text-blue-100 text-sm mt-1">{template.description}</p>
            )}
          </div>
          {ordenId && (
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              Orden: {ordenId}
            </span>
          )}
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-5">
        {template.fields.map((field) => {
          const renderedField = renderField(field);
          if (!renderedField) return null;

          if (field.type === 'section') {
            return <div key={field.id}>{renderedField}</div>;
          }

          const error = touched.has(field.name) ? errors[field.name] : undefined;

          return (
            <div key={field.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderedField}
              {field.helpText && !error && (
                <p className="mt-1.5 text-xs text-gray-500">{field.helpText}</p>
              )}
              {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Acciones */}
      <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 p-4 -mx-4 border-t">
        {onSaveDraft && (
          <button
            type="button"
            onClick={() => onSaveDraft(formData)}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Guardar Borrador
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enviando...' : 'Enviar Formulario'}
        </button>
      </div>
    </form>
  );
}

export default DynamicFormRenderer;
