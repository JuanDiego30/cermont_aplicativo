'use client';

import { useChecklists } from '@/lib/hooks/useChecklists';
import { HeroStats } from '@/components/patterns/HeroStats';
import { FormCard } from '@/components/patterns/FormCard';
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { ClipboardCheck, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function ChecklistsPage() {
    const { data: templates, isLoading, isError } = useChecklists();
    const [searchTerm, setSearchTerm] = useState('');

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingState
                    message="Cargando checklists..."
                    subMessage="Obteniendo plantillas disponibles"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <ErrorState
                    title="Error al cargar checklists"
                    message="No se pudo conectar con el servidor. Por favor intenta nuevamente."
                    action={{
                        label: 'Reintentar',
                        onClick: () => window.location.reload(),
                    }}
                />
            </div>
        );
    }

    const filteredTemplates = templates?.filter((template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <HeroStats
                title="Gestión de Checklists"
                description="Administra las plantillas de inspección y verificación para tus operaciones."
                badge={{
                    icon: ClipboardCheck,
                    text: 'Control de Calidad y Seguridad',
                }}
                kpis={[
                    { title: 'Total Plantillas', value: (templates?.length || 0).toString(), hint: 'Disponibles' },
                    { title: 'Activos', value: (templates?.filter(t => t.active !== false).length || 0).toString(), hint: 'En uso' },
                ]}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar plantilla..."
                        className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-neutral-800 dark:bg-neutral-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Plantilla
                    </Button>
                </div>
            </div>

            <FormCard title="Plantillas Disponibles" description="Listado de checklists configurados en el sistema">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-primary-500 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-950">
                                    <ClipboardCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    {template.category}
                                </span>
                            </div>

                            <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                {template.name}
                            </h3>

                            <p className="mb-4 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                                {template.description || 'Sin descripción disponible'}
                            </p>

                            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <span className="text-xs text-neutral-500">
                                    {template.sections?.length || 0} secciones
                                </span>
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                    Ver detalles
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-neutral-500">No se encontraron plantillas que coincidan con tu búsqueda.</p>
                    </div>
                )}
            </FormCard>
        </div>
    );
}
