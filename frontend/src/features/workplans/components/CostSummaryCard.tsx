'use client';

import { useEffect, useState } from 'react';
import { costBreakdownApi, type CostSummary } from '../api/cost-breakdown-service';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface CostSummaryCardProps {
    workPlanId: string;
}

export function CostSummaryCard({ workPlanId }: CostSummaryCardProps) {
    const [summary, setSummary] = useState<CostSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workPlanId]);

    const fetchSummary = async () => {
        try {
            setIsLoading(true);
            const data = await costBreakdownApi.summary(workPlanId);
            setSummary(data);
        } catch (err) {
            console.error('Error fetching cost summary:', err);
            setError('No se pudo cargar el resumen de costos');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error || 'Error al cargar resumen'}</p>
                </div>
            </div>
        );
    }

    const isOverBudget = summary.variance > 0;
    const varianceColor = isOverBudget
        ? 'text-red-600 dark:text-red-400'
        : 'text-green-600 dark:text-green-400';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Resumen de Costos
            </h3>

            {/* Main totals */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <div className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Presupuesto Estimado
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(summary.totalEstimated)}
                    </div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/20">
                    <div className="mb-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                        Costo Real
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(summary.totalActual)}
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${isOverBudget ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20'}`}>
                    <div className={`mb-1 flex items-center gap-1 text-sm font-medium ${varianceColor}`}>
                        {isOverBudget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        Desviación
                    </div>
                    <div className={`text-2xl font-bold ${varianceColor}`}>
                        {formatCurrency(Math.abs(summary.variance))}
                    </div>
                    <div className={`text-sm ${varianceColor}`}>
                        {summary.variancePercent.toFixed(1)}% {isOverBudget ? 'sobre' : 'bajo'} presupuesto
                    </div>
                </div>
            </div>

            {/* Breakdown by category */}
            {Object.keys(summary.byCategory).length > 0 && (
                <div>
                    <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Desglose por Categoría
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(summary.byCategory).map(([category, amounts]) => {
                            const categoryVariance = amounts.actual - amounts.estimated;
                            const categoryVariancePercent =
                                amounts.estimated > 0 ? (categoryVariance / amounts.estimated) * 100 : 0;
                            const isOverBudgetCategory = categoryVariance > 0;

                            return (
                                <div
                                    key={category}
                                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {getCategoryLabel(category)}
                                        </div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Estimado: {formatCurrency(amounts.estimated)} | Real:{' '}
                                            {formatCurrency(amounts.actual)}
                                        </div>
                                    </div>
                                    <div className={`text-right ${isOverBudgetCategory ? 'text-red-600' : 'text-green-600'}`}>
                                        <div className="font-semibold">
                                            {isOverBudgetCategory ? '+' : ''}
                                            {formatCurrency(categoryVariance)}
                                        </div>
                                        <div className="text-xs">
                                            {categoryVariancePercent > 0 ? '+' : ''}
                                            {categoryVariancePercent.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        LABOR: 'Mano de Obra',
        MATERIALS: 'Materiales',
        EQUIPMENT: 'Equipos y Herramientas',
        TRANSPORT: 'Transporte',
        TAX: 'Impuestos',
        OTHER: 'Otros',
    };
    return labels[category] || category;
}
