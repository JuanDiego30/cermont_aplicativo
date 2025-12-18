/**
 * DynamicForm Component
 *
 * Renderiza formularios dinámicos desde JSON Schema.
 * Soporta: text, number, date, select, radio, checkbox, textarea, photo
 */
'use client';

import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';

// Types
interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'photo';
    required: boolean;
    options?: string[] | { value: string; label: string }[];
    placeholder?: string;
    min?: number;
    max?: number;
    rows?: number;
    validation?: {
        pattern?: string;
        message?: string;
    };
}

interface FormSection {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    repeatable?: boolean;
}

interface FormSchema {
    sections: FormSection[];
    reportTemplate?: string;
}

interface FormTemplate {
    id: string;
    nombre: string;
    tipo: string;
    categoria: string;
    schema: FormSchema;
    uiSchema?: Record<string, unknown>;
}

interface DynamicFormProps {
    template: FormTemplate;
    initialData?: Record<string, unknown>;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    onSaveDraft?: (data: Record<string, unknown>) => void;
    isLoading?: boolean;
    readOnly?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
    template,
    initialData = {},
    onSubmit,
    onSaveDraft,
    isLoading = false,
    readOnly = false,
}) => {
    const { control, handleSubmit, watch, formState: { errors, isDirty } } = useForm({
        defaultValues: initialData,
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFormSubmit: SubmitHandler<Record<string, unknown>> = async (data) => {
        try {
            setSubmitStatus('idle');
            await onSubmit(data);
            setSubmitStatus('success');
        } catch {
            setSubmitStatus('error');
        }
    };

    const handleSaveDraft = () => {
        const currentData = watch();
        onSaveDraft?.(currentData);
    };

    const renderField = (field: FormField) => {
        const fieldError = errors[field.id];
        const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldError ? 'border-red-500' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`;

        switch (field.type) {
            case 'text':
            case 'number':
            case 'date':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        rules={{
                            required: field.required ? `${field.label} es requerido` : false,
                            pattern: field.validation?.pattern
                                ? { value: new RegExp(field.validation.pattern), message: field.validation.message || 'Formato inválido' }
                                : undefined,
                            min: field.min !== undefined ? { value: field.min, message: `Mínimo: ${field.min}` } : undefined,
                            max: field.max !== undefined ? { value: field.max, message: `Máximo: ${field.max}` } : undefined,
                        }}
                        render={({ field: formField }) => (
                            <input
                                {...formField}
                                type={field.type}
                                placeholder={field.placeholder}
                                disabled={readOnly}
                                className={baseInputClasses}
                                value={formField.value as string | number ?? ''}
                            />
                        )}
                    />
                );

            case 'textarea':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        rules={{ required: field.required ? `${field.label} es requerido` : false }}
                        render={({ field: formField }) => (
                            <textarea
                                {...formField}
                                rows={field.rows || 4}
                                placeholder={field.placeholder}
                                disabled={readOnly}
                                className={baseInputClasses}
                                value={formField.value as string ?? ''}
                            />
                        )}
                    />
                );

            case 'select':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        rules={{ required: field.required ? `${field.label} es requerido` : false }}
                        render={({ field: { value, ...restField } }) => (
                            <select
                                {...restField}
                                value={(value as string) || ''}
                                disabled={readOnly}
                                className={baseInputClasses}
                            >
                                <option value="">Seleccionar...</option>
                                {(field.options || []).map((opt) => {
                                    const valueOption = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    return (
                                        <option key={valueOption} value={valueOption}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                );

            case 'radio':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        rules={{ required: field.required ? `${field.label} es requerido` : false }}
                        render={({ field: formField }) => (
                            <div className="flex flex-wrap gap-4">
                                {(field.options || []).map((opt) => {
                                    const value = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    return (
                                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                {...formField}
                                                value={value}
                                                checked={formField.value === value}
                                                disabled={readOnly}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm">{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    />
                );

            case 'checkbox':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        render={({ field: formField }) => (
                            <div className="space-y-2">
                                {(field.options || []).map((opt) => {
                                    const value = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    const currentValues = (formField.value as string[]) || [];
                                    return (
                                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentValues.includes(value)}
                                                disabled={readOnly}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        formField.onChange([...currentValues, value]);
                                                    } else {
                                                        formField.onChange(currentValues.filter((v) => v !== value));
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm">{label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    />
                );

            case 'photo':
                return (
                    <Controller
                        name={field.id}
                        control={control}
                        render={({ field: formField }) => (
                            <PhotoCapture
                                value={formField.value as string}
                                onChange={formField.onChange}
                                disabled={readOnly}
                            />
                        )}
                    />
                );

            default:
                return <p className="text-red-500">Tipo de campo no soportado: {field.type}</p>;
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold">{template.nombre}</h2>
                <p className="text-blue-100 mt-1">
                    {template.categoria} • {template.tipo}
                </p>
            </div>

            {/* Sections */}
            {template.schema.sections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                        {section.description && (
                            <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        {section.fields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {renderField(field)}
                                {errors[field.id] && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors[field.id]?.message as string}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Status Messages */}
            {submitStatus === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>Formulario enviado exitosamente</span>
                </div>
            )}
            {submitStatus === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>Error al enviar el formulario. Intenta de nuevo.</span>
                </div>
            )}

            {/* Actions */}
            {!readOnly && (
                <div className="flex gap-4 sticky bottom-4">
                    {onSaveDraft && (
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isLoading || !isDirty}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Guardar Borrador
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {isLoading ? 'Enviando...' : 'Enviar Formulario'}
                    </button>
                </div>
            )}
        </form>
    );
};

// Photo Capture Sub-component
interface PhotoCaptureProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ value, onChange, disabled }) => {
    const [preview, setPreview] = useState<string | null>(value || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onChange(base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-2">
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                id="photo-input"
            />
            <label
                htmlFor="photo-input"
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'
                    }`}
            >
                <Camera className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                    {preview ? 'Cambiar foto' : 'Tomar o seleccionar foto'}
                </span>
            </label>
            {preview && (
                <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                </div>
            )}
        </div>
    );
};

export default DynamicForm;
