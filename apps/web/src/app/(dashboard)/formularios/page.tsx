/**
 * FormulariosPage - Gestión de formularios dinámicos
 *
 * - Lista templates disponibles
 * - Sube PDF/Excel para generar templates
 * - Completa formularios
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Plus, FileText, CheckCircle, Clock, Edit3, Eye, ArrowLeft } from 'lucide-react';
import DynamicForm from '@/components/forms/DynamicForm';
import { useForms, FormTemplate, FormInstance } from '@/hooks/use-forms';

type ViewMode = 'templates' | 'instances' | 'fill' | 'view';

export default function FormulariosPage() {
    const {
        loading,
        error,
        fetchTemplates,
        fetchInstances,
        parseFile,
        submitForm,
    } = useForms();

    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [instances, setInstances] = useState<FormInstance[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('templates');
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
    const [selectedInstance, setSelectedInstance] = useState<FormInstance | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        const [templatesData, instancesData] = await Promise.all([
            fetchTemplates({ activo: true }),
            fetchInstances(),
        ]);
        setTemplates(templatesData);
        setInstances(instancesData);
    }, [fetchTemplates, fetchInstances]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadProgress('Analizando archivo...');
        const result = await parseFile(file);

        if (result) {
            setUploadProgress('¡Template generado exitosamente!');
            await loadData();
            setTimeout(() => setUploadProgress(null), 3000);
        } else {
            setUploadProgress('Error al procesar archivo');
        }
    };

    const handleFillForm = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setViewMode('fill');
    };

    const handleViewInstance = (instance: FormInstance) => {
        setSelectedInstance(instance);
        setViewMode('view');
    };

    const handleSubmitForm = async (data: Record<string, unknown>) => {
        if (!selectedTemplate) return;

        await submitForm({
            templateId: selectedTemplate.id,
            data,
            estado: 'completado',
        });

        setViewMode('instances');
        await loadData();
    };

    const handleSaveDraft = async (data: Record<string, unknown>) => {
        if (!selectedTemplate) return;

        await submitForm({
            templateId: selectedTemplate.id,
            data,
            estado: 'borrador',
        });
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'completado':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" /> Completado
                    </span>
                );
            case 'borrador':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        <Clock className="w-3 h-3" /> Borrador
                    </span>
                );
            case 'validado':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" /> Validado
                    </span>
                );
            default:
                return null;
        }
    };

    // Render Fill Form View
    if (viewMode === 'fill' && selectedTemplate) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completar Formulario</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTemplate.nombre}</p>
                </div>
                <button
                    onClick={() => setViewMode('templates')}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a templates
                </button>
                <DynamicForm
                    template={selectedTemplate as any}
                    onSubmit={handleSubmitForm}
                    onSaveDraft={handleSaveDraft}
                    isLoading={loading}
                />
            </div>
        );
    }

    // Render View Instance
    if (viewMode === 'view' && selectedInstance) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ver Formulario</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInstance.template?.nombre || ''}</p>
                </div>
                <button
                    onClick={() => setViewMode('instances')}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a formularios
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                Completado por: {selectedInstance.completadoPor?.name || 'N/A'}
                            </p>
                            {selectedInstance.orden && (
                                <p className="text-sm text-gray-500">
                                    Orden: {selectedInstance.orden.numero}
                                </p>
                            )}
                        </div>
                        {getEstadoBadge(selectedInstance.estado)}
                    </div>

                    <h3 className="font-semibold mb-4 dark:text-white">Respuestas:</h3>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto dark:text-gray-300">
                        {JSON.stringify(selectedInstance.data, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formularios Dinámicos</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crear, completar y gestionar formularios</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => setViewMode('templates')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'templates'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    Templates ({templates.length})
                </button>
                <button
                    onClick={() => setViewMode('instances')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'instances'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    Formularios ({instances.length})
                </button>
            </div>

            {/* Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Generar Template desde PDF o Excel
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Sube un archivo PDF o Excel y el sistema generará automáticamente un template de formulario
                        </p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                            <Plus className="w-4 h-4" />
                            Subir Archivo
                            <input
                                type="file"
                                accept=".pdf,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        {uploadProgress && (
                            <p className={`mt-2 text-sm ${uploadProgress.includes('Error') ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {uploadProgress}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : viewMode === 'templates' ? (
                /* Templates Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.nombre}</h3>
                                    <p className="text-sm text-gray-500">
                                        {template.categoria} • v{template.version}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                                    {template.tipo}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                                    {template.schema.sections.length} secciones
                                </span>
                                {template._count && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 text-xs rounded">
                                        {template._count.instancias} completados
                                    </span>
                                )}
                            </div>

                            {template.descripcion && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {template.descripcion}
                                </p>
                            )}

                            <button
                                onClick={() => handleFillForm(template)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                                Completar Formulario
                            </button>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                            No hay templates disponibles. Sube un PDF o Excel para crear uno.
                        </div>
                    )}
                </div>
            ) : (
                /* Instances List */
                <div className="space-y-4">
                    {instances.map((instance) => (
                        <div
                            key={instance.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                        {instance.template?.nombre || 'Formulario'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {instance.orden ? `Orden: ${instance.orden.numero}` : 'Sin orden asociada'}
                                        {' • '}
                                        {instance.completadoPor?.name || 'Usuario'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {getEstadoBadge(instance.estado)}
                                <button
                                    onClick={() => handleViewInstance(instance)}
                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="Ver formulario"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {instances.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No hay formularios completados aún.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
