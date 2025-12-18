/**
 * @file page.tsx
 * @description Dynamic Form Page - Renders different form types based on URL parameter
 * Supports: acta-entrega, reporte-diario, inspeccion-hes, checklist-pretrabajo, 
 *           registro-materiales, informe-cierre, evaluacion-calidad
 */
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Form configurations for all 7 types
const FORM_CONFIGS: Record<string, {
    title: string;
    description: string;
    fields: Array<{
        name: string;
        label: string;
        type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'signature';
        required?: boolean;
        options?: string[];
        placeholder?: string;
    }>
}> = {
    'acta-entrega': {
        title: 'Acta de Entrega',
        description: 'Documento de entrega de trabajo completado',
        fields: [
            { name: 'ordenId', label: 'Número de Orden', type: 'text', required: true },
            { name: 'cliente', label: 'Cliente', type: 'text', required: true },
            { name: 'ubicacion', label: 'Ubicación', type: 'text', required: true },
            { name: 'fechaEntrega', label: 'Fecha de Entrega', type: 'date', required: true },
            { name: 'trabajosRealizados', label: 'Trabajos Realizados', type: 'textarea', required: true },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'nombreClienteFirma', label: 'Nombre de quien recibe', type: 'text', required: true },
            { name: 'cedulaClienteFirma', label: 'Cédula', type: 'text', required: true },
            { name: 'firmaCliente', label: 'Firma del Cliente', type: 'signature', required: true },
            { name: 'firmaTecnico', label: 'Firma del Técnico', type: 'signature', required: true },
        ],
    },
    'reporte-diario': {
        title: 'Reporte Diario',
        description: 'Registro diario de actividades',
        fields: [
            { name: 'fecha', label: 'Fecha', type: 'date', required: true },
            { name: 'ordenId', label: 'Orden de Trabajo', type: 'text', required: true },
            { name: 'horaInicio', label: 'Hora de Inicio', type: 'text', placeholder: 'HH:MM' },
            { name: 'horaFin', label: 'Hora de Fin', type: 'text', placeholder: 'HH:MM' },
            { name: 'actividadesRealizadas', label: 'Actividades Realizadas', type: 'textarea', required: true },
            { name: 'materialesUsados', label: 'Materiales Utilizados', type: 'textarea' },
            { name: 'dificultades', label: 'Dificultades Encontradas', type: 'textarea' },
            { name: 'avanceEstimado', label: 'Avance Estimado (%)', type: 'number' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
        ],
    },
    'inspeccion-hes': {
        title: 'Inspección HES',
        description: 'Inspección de equipos de seguridad',
        fields: [
            { name: 'equipoId', label: 'Código de Equipo', type: 'text', required: true },
            { name: 'tipoEquipo', label: 'Tipo de Equipo', type: 'select', required: true, options: ['Arnés', 'Línea de vida', 'Casco', 'Gafas', 'Guantes', 'Otro'] },
            { name: 'fechaInspeccion', label: 'Fecha de Inspección', type: 'date', required: true },
            { name: 'estadoGeneral', label: 'Estado General', type: 'select', required: true, options: ['Aprobado', 'Con observaciones', 'Rechazado'] },
            { name: 'cintas', label: 'Estado de Cintas/Correas', type: 'select', options: ['Bueno', 'Regular', 'Malo', 'N/A'] },
            { name: 'costuras', label: 'Estado de Costuras', type: 'select', options: ['Bueno', 'Regular', 'Malo', 'N/A'] },
            { name: 'hebillas', label: 'Estado de Hebillas/Ganchos', type: 'select', options: ['Bueno', 'Regular', 'Malo', 'N/A'] },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'requiereAccion', label: 'Requiere Acción Correctiva', type: 'checkbox' },
            { name: 'accionCorrectiva', label: 'Descripción Acción Correctiva', type: 'textarea' },
        ],
    },
    'checklist-pretrabajo': {
        title: 'Checklist Pre-Trabajo',
        description: 'Verificación antes de iniciar labores',
        fields: [
            { name: 'ordenId', label: 'Orden de Trabajo', type: 'text', required: true },
            { name: 'fecha', label: 'Fecha', type: 'date', required: true },
            { name: 'ubicacion', label: 'Ubicación', type: 'text', required: true },
            { name: 'permisosObtenidos', label: 'Permisos de trabajo obtenidos', type: 'checkbox' },
            { name: 'areaDelimitada', label: 'Área de trabajo delimitada', type: 'checkbox' },
            { name: 'equiposVerificados', label: 'Equipos de seguridad verificados', type: 'checkbox' },
            { name: 'herramientasRevisadas', label: 'Herramientas revisadas', type: 'checkbox' },
            { name: 'condicionesClimaticas', label: 'Condiciones climáticas favorables', type: 'checkbox' },
            { name: 'comunicacionEstablecida', label: 'Comunicación con supervisor establecida', type: 'checkbox' },
            { name: 'riesgosIdentificados', label: 'Riesgos Identificados', type: 'textarea' },
            { name: 'medidasControl', label: 'Medidas de Control', type: 'textarea' },
        ],
    },
    'registro-materiales': {
        title: 'Registro de Materiales',
        description: 'Control de materiales utilizados',
        fields: [
            { name: 'ordenId', label: 'Orden de Trabajo', type: 'text', required: true },
            { name: 'fecha', label: 'Fecha', type: 'date', required: true },
            { name: 'materiales', label: 'Lista de Materiales (uno por línea)', type: 'textarea', required: true, placeholder: 'Nombre, Cantidad, Unidad' },
            { name: 'proveedor', label: 'Proveedor', type: 'text' },
            { name: 'numeroFactura', label: 'Número de Factura/Remisión', type: 'text' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
        ],
    },
    'informe-cierre': {
        title: 'Informe de Cierre',
        description: 'Informe final de orden de trabajo',
        fields: [
            { name: 'ordenId', label: 'Orden de Trabajo', type: 'text', required: true },
            { name: 'fechaInicio', label: 'Fecha de Inicio', type: 'date', required: true },
            { name: 'fechaFin', label: 'Fecha de Fin', type: 'date', required: true },
            { name: 'resumenTrabajos', label: 'Resumen de Trabajos', type: 'textarea', required: true },
            { name: 'dificultadesEncontradas', label: 'Dificultades Encontradas', type: 'textarea' },
            { name: 'solucionesAplicadas', label: 'Soluciones Aplicadas', type: 'textarea' },
            { name: 'recomendaciones', label: 'Recomendaciones', type: 'textarea' },
            { name: 'horasTotales', label: 'Horas Totales', type: 'number' },
            { name: 'costoTotal', label: 'Costo Total Estimado', type: 'number' },
            { name: 'satisfaccionCliente', label: 'Satisfacción del Cliente', type: 'select', options: ['Excelente', 'Bueno', 'Regular', 'Malo'] },
        ],
    },
    'evaluacion-calidad': {
        title: 'Evaluación de Calidad',
        description: 'Evaluación de calidad del trabajo realizado',
        fields: [
            { name: 'ordenId', label: 'Orden de Trabajo', type: 'text', required: true },
            { name: 'fechaEvaluacion', label: 'Fecha de Evaluación', type: 'date', required: true },
            { name: 'evaluador', label: 'Nombre del Evaluador', type: 'text', required: true },
            { name: 'calidadTrabajo', label: 'Calidad del Trabajo (1-10)', type: 'number', required: true },
            { name: 'cumplimientoTiempos', label: 'Cumplimiento de Tiempos (1-10)', type: 'number', required: true },
            { name: 'cumplimientoSeguridad', label: 'Cumplimiento de Seguridad (1-10)', type: 'number', required: true },
            { name: 'ordenLimpieza', label: 'Orden y Limpieza (1-10)', type: 'number', required: true },
            { name: 'documentacion', label: 'Documentación (1-10)', type: 'number', required: true },
            { name: 'aspectosPositivos', label: 'Aspectos Positivos', type: 'textarea' },
            { name: 'aspectosMejora', label: 'Aspectos a Mejorar', type: 'textarea' },
            { name: 'recomendaciones', label: 'Recomendaciones', type: 'textarea' },
        ],
    },
};

interface PageProps {
    params: Promise<{ tipo: string }>;
}

export default function DynamicFormPage({ params }: PageProps) {
    const { tipo } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const config = FORM_CONFIGS[tipo];

    if (!config) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Formulario no encontrado
                </h1>
                <p className="text-gray-500">
                    El tipo de formulario "{tipo}" no existe.
                </p>
                <button
                    onClick={() => router.push('/dashboard/formularios')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Formularios
                </button>
            </div>
        );
    }

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Submit to backend
            console.log('Form data:', formData);
            toast.success('Formulario guardado exitosamente');
            router.push('/dashboard/formularios');
        } catch (error) {
            toast.error('Error al guardar el formulario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {config.title}
                        </h1>
                        <p className="text-sm text-gray-500">{config.description}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.fields.map((field) => (
                        <div
                            key={field.name}
                            className={field.type === 'textarea' || field.type === 'signature' ? 'md:col-span-2' : ''}
                        >
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    required={field.required}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : field.type === 'checkbox' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name={field.name}
                                        checked={formData[field.name] || false}
                                        onChange={(e) => handleChange(field.name, e.target.checked)}
                                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Marcar si aplica</span>
                                </div>
                            ) : field.type === 'signature' ? (
                                <div className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                    <p className="text-gray-400 text-sm">Área de firma (próximamente)</p>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Formulario'}
                    </button>
                </div>
            </form>
        </div>
    );
}
