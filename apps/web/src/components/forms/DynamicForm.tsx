'use client';

/**
 * ARCHIVO: DynamicForm.tsx
 * FUNCION: Componente renderizador de formularios dinámicos
 * IMPLEMENTACION: Genera campos UI basados en FormSchema con validación
 * DEPENDENCIAS: form-schemas.ts, react-hook-form, UI components
 * EXPORTS: DynamicForm
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { FormSchema, FormField as FormFieldType } from '@/lib/form-schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import {
    AlertCircle,
    CheckCircle,
    Upload,
    Camera,
    FileSignature,
    Loader2,
} from 'lucide-react';

interface DynamicFormProps {
    schema: FormSchema;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    initialData?: Record<string, unknown>;
    className?: string;
}

/**
 * Renders a single field based on its type
 */
function FormFieldRenderer({
    field,
    control,
    errors,
}: {
    field: FormFieldType;
    control: any;
    errors: Record<string, any>;
}) {
    const error = errors[field.id];

    return (
        <div className="space-y-2">
            <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.helpText && (
                <p className="text-xs text-gray-500">{field.helpText}</p>
            )}

            <Controller
                name={field.id}
                control={control}
                rules={{
                    required: field.required ? `${field.label} es requerido` : false,
                    ...(field.validation?.minLength && {
                        minLength: {
                            value: field.validation.minLength,
                            message: `Mínimo ${field.validation.minLength} caracteres`,
                        },
                    }),
                    ...(field.validation?.maxLength && {
                        maxLength: {
                            value: field.validation.maxLength,
                            message: `Máximo ${field.validation.maxLength} caracteres`,
                        },
                    }),
                    ...(field.validation?.pattern && {
                        pattern: {
                            value: new RegExp(field.validation.pattern),
                            message: 'Formato inválido',
                        },
                    }),
                }}
                render={({ field: formField }) => {
                    switch (field.type) {
                        case 'text':
                        case 'email':
                        case 'tel':
                        case 'number':
                            return (
                                <Input
                                    id={field.id}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...formField}
                                    className={cn(error && 'border-red-500')}
                                />
                            );

                        case 'date':
                        case 'time':
                        case 'datetime':
                            return (
                                <Input
                                    id={field.id}
                                    type={field.type === 'datetime' ? 'datetime-local' : field.type}
                                    {...formField}
                                    className={cn(error && 'border-red-500')}
                                />
                            );

                        case 'textarea':
                            return (
                                <textarea
                                    id={field.id}
                                    placeholder={field.placeholder}
                                    rows={4}
                                    {...formField}
                                    className={cn(
                                        'w-full px-3 py-2 border rounded-lg transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                        'dark:bg-gray-800 dark:text-white dark:border-gray-600',
                                        error ? 'border-red-500' : 'border-gray-300'
                                    )}
                                />
                            );

                        case 'select':
                            return (
                                <Select
                                    id={field.id}
                                    options={field.options || []}
                                    {...formField}
                                />
                            );

                        case 'checkbox':
                            return (
                                <div className="space-y-2">
                                    {field.options?.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                value={opt.value}
                                                checked={(formField.value || []).includes(opt.value)}
                                                onChange={(e) => {
                                                    const current = formField.value || [];
                                                    if (e.target.checked) {
                                                        formField.onChange([...current, opt.value]);
                                                    } else {
                                                        formField.onChange(
                                                            current.filter((v: string) => v !== opt.value)
                                                        );
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            );

                        case 'radio':
                            return (
                                <div className="space-y-2">
                                    {field.options?.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                value={opt.value}
                                                checked={formField.value === opt.value}
                                                onChange={(e) => formField.onChange(e.target.value)}
                                                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            );

                        case 'file':
                            return (
                                <div className="space-y-2">
                                    <label
                                        htmlFor={field.id}
                                        className={cn(
                                            'flex flex-col items-center justify-center w-full h-32',
                                            'border-2 border-dashed rounded-lg cursor-pointer',
                                            'hover:bg-gray-50 dark:hover:bg-gray-700',
                                            error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {field.acceptedFileTypes?.includes('image/*') ? (
                                                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            )}
                                            <p className="text-sm text-gray-500">
                                                Clic para subir o arrastra el archivo
                                            </p>
                                            {field.multiple && (
                                                <p className="text-xs text-gray-400">
                                                    Múltiples archivos permitidos
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            id={field.id}
                                            type="file"
                                            accept={field.acceptedFileTypes?.join(',')}
                                            multiple={field.multiple}
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                formField.onChange(files);
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    {formField.value && (
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            {formField.value.length || 1} archivo(s) seleccionado(s)
                                        </p>
                                    )}
                                </div>
                            );

                        case 'signature':
                            return (
                                <div
                                    className={cn(
                                        'w-full h-40 border-2 border-dashed rounded-lg',
                                        'flex items-center justify-center cursor-pointer',
                                        'hover:bg-gray-50 dark:hover:bg-gray-700',
                                        error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    )}
                                >
                                    <div className="flex flex-col items-center text-gray-400">
                                        <FileSignature className="w-8 h-8 mb-2" />
                                        <span className="text-sm">Toque para firmar</span>
                                    </div>
                                </div>
                            );

                        default:
                            return (
                                <Input
                                    id={field.id}
                                    type="text"
                                    placeholder={field.placeholder}
                                    {...formField}
                                />
                            );
                    }
                }}
            />

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error.message}
                </p>
            )}
        </div>
    );
}

/**
 * Main DynamicForm component
 */
export function DynamicForm({
    schema,
    onSubmit,
    initialData = {},
    className,
}: DynamicFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: initialData,
    });

    const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);

    const handleFormSubmit = async (data: Record<string, unknown>) => {
        try {
            setIsSubmitting(true);
            setSubmitSuccess(false);
            await onSubmit(data);
            setSubmitSuccess(true);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className={cn('space-y-6', className)}
        >
            {/* Header */}
            <div className="border-b pb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {schema.codigo}
                    </span>
                    <span>v{schema.version}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {schema.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {schema.description}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">
                {sortedFields.map((field) => (
                    <FormFieldRenderer
                        key={field.id}
                        field={field}
                        control={control}
                        errors={errors}
                    />
                ))}
            </div>

            {/* Signatures Section */}
            {(schema.requiresSignatures.tecnico ||
                schema.requiresSignatures.supervisor ||
                schema.requiresSignatures.cliente) && (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Firmas Requeridas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {schema.requiresSignatures.tecnico && (
                                <div className="border rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Técnico</p>
                                    <div className="h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                                        <FileSignature className="w-6 h-6" />
                                    </div>
                                </div>
                            )}
                            {schema.requiresSignatures.supervisor && (
                                <div className="border rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Supervisor</p>
                                    <div className="h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                                        <FileSignature className="w-6 h-6" />
                                    </div>
                                </div>
                            )}
                            {schema.requiresSignatures.cliente && (
                                <div className="border rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Cliente</p>
                                    <div className="h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                                        <FileSignature className="w-6 h-6" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                {submitSuccess && (
                    <p className="text-green-600 flex items-center gap-1 mr-auto">
                        <CheckCircle className="w-5 h-5" />
                        Formulario guardado exitosamente
                    </p>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-32"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Guardando...
                        </>
                    ) : (
                        'Guardar Formulario'
                    )}
                </Button>
            </div>
        </form>
    );
}

export default DynamicForm;
