'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { workplansApi } from '../api/workplans-service';
import Button from '@/shared/components/ui/button/Button';
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';
import {
    ClipboardList,
    Plus,
    Calendar,
    DollarSign,
    Users,
    CheckCircle,
    FileText,
} from 'lucide-react';
import type { WorkPlan, WorkPlanStatus } from '../types/workplan.types';

interface WorkPlanSectionProps {
    orderId: string;
}

const STATUS_CONFIG: Record<WorkPlanStatus, { label: string; color: string }> = {
    DRAFT: { label: 'Borrador', color: 'bg-info-50 border-info-200 text-info-700 dark:bg-info-950 dark:border-info-800 dark:text-info-300' },
    PENDING_APPROVAL: { label: 'Pendiente Aprobación', color: 'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-950 dark:border-warning-800 dark:text-warning-300' },
    APPROVED: { label: 'Aprobado', color: 'bg-success-50 border-success-200 text-success-700 dark:bg-success-950 dark:border-success-800 dark:text-success-300' },
    REJECTED: { label: 'Rechazado', color: 'bg-error-50 border-error-200 text-error-700 dark:bg-error-950 dark:border-error-800 dark:text-error-300' },
    IN_PROGRESS: { label: 'En Progreso', color: 'bg-info-50 border-info-200 text-info-700 dark:bg-info-950 dark:border-info-800 dark:text-info-300' },
    COMPLETED: { label: 'Completado', color: 'bg-success-50 border-success-200 text-success-700 dark:bg-success-950 dark:border-success-800 dark:text-success-300' },
};

export function WorkPlanSection({ orderId }: WorkPlanSectionProps) {
    const router = useRouter();
    const [workPlan, setWorkPlan] = useState<WorkPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWorkPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const loadWorkPlan = async () => {
        try {
            setIsLoading(true);
            const data = await workplansApi.getByOrderId(orderId);
            setWorkPlan(data);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            if (error.response?.status !== 404) {
                setError(error.message || 'Error al cargar el plan de trabajo');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateWorkPlan = () => {
        router.push(`/orders/${orderId}/workplan/new`);
    };

    const handleViewWorkPlan = () => {
        if (workPlan) {
            router.push(`/orders/${orderId}/workplan/${workPlan.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingState message="Cargando plan de trabajo..." />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                title="Error al cargar"
                message={error}
                action={{
                    label: 'Reintentar',
                    onClick: loadWorkPlan,
                }}
            />
        );
    }

    // No workplan exists
    if (!workPlan) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <ClipboardList className="h-12 w-12 text-neutral-500 dark:text-neutral-400" />
                </div>

                <h3 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    No hay plan de trabajo
                </h3>

                <p className="mx-auto mb-8 max-w-md text-neutral-600 dark:text-neutral-400">
                    Esta orden aún no tiene un plan de trabajo asignado. Crea uno para comenzar a planificar los recursos,
                    tareas y presupuesto.
                </p>

                <Button onClick={handleCreateWorkPlan} className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Crear Plan de Trabajo
                </Button>
            </div>
        );
    }

    // Workplan exists - show summary
    const statusConfig = STATUS_CONFIG[workPlan.status];
    const estimatedTotal = workPlan.estimatedBudget?.total || 0;
    const actualTotal = workPlan.actualBudget?.total || 0;
    const budgetVariance = actualTotal > 0 ? ((actualTotal - estimatedTotal) / estimatedTotal) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        {workPlan.title}
                    </h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        {workPlan.description}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Budget */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950">
                            <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Presupuesto</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                ${estimatedTotal.toLocaleString()}
                            </p>
                            {actualTotal > 0 && (
                                <p className={`text-xs ${budgetVariance > 0 ? 'text-error-600' : 'text-success-600'}`}>
                                    {budgetVariance > 0 ? '+' : ''}{budgetVariance.toFixed(1)}%
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-50 dark:bg-secondary-950">
                            <Users className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Equipo</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                {workPlan.assignedTechnicians?.length || 0} personas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 dark:bg-info-950">
                            <Calendar className="h-5 w-5 text-info-600 dark:text-info-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Inicio Planeado</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                {new Date(workPlan.plannedStartDate).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Checklist Progress */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-950">
                            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Checklist</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                {workPlan.checklist?.filter(item => item.completed).length || 0} / {workPlan.checklist?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={handleViewWorkPlan} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ver Detalles Completos
                </Button>
                {workPlan.status === 'DRAFT' && (
                    <Button
                        variant="secondary"
                        onClick={() => router.push(`/orders/${orderId}/workplan/${workPlan.id}/edit`)}
                    >
                        Editar
                    </Button>
                )}
            </div>
        </div>
    );
}
