'use client';

import { useWorkPlans } from '@/features/workplans';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Cost Overview Widget
 * Muestra un resumen de costos globales de todos los planes de trabajo activos
 */
export function CostOverviewWidget() {
    const { data: workPlans, isLoading } = useWorkPlans();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
            </div>
        );
    }

    // Calcular totales globales
    const totals = (workPlans || []).reduce(
        (acc, plan) => {
            const estimated = plan.estimatedBudget?.total || 0;
            const actual = plan.actualBudget?.total || 0;
            return {
                estimated: acc.estimated + estimated,
                actual: acc.actual + actual,
                plansWithBudget: acc.plansWithBudget + (estimated > 0 ? 1 : 0),
                plansOverBudget: acc.plansOverBudget + (actual > estimated && estimated > 0 ? 1 : 0),
            };
        },
        { estimated: 0, actual: 0, plansWithBudget: 0, plansOverBudget: 0 }
    );

    const variance = totals.actual - totals.estimated;
    const variancePercent = totals.estimated > 0 
        ? ((variance / totals.estimated) * 100).toFixed(1) 
        : '0';
    const isOverBudget = variance > 0;

    return (
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    Resumen de Costos
                </h2>
                <Link
                    href="/workplans"
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                >
                    Ver planes →
                </Link>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Presupuesto Estimado */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Presupuesto Total
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(totals.estimated)}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                        {totals.plansWithBudget} planes con presupuesto
                    </p>
                </div>

                {/* Costo Real */}
                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Costo Real Ejecutado
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(totals.actual)}
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                        Acumulado de ejecución
                    </p>
                </div>

                {/* Desviación */}
                <div className={`rounded-lg p-4 ${
                    isOverBudget 
                        ? 'bg-red-50 dark:bg-red-900/20' 
                        : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                    <p className={`text-sm font-medium mb-1 flex items-center gap-1 ${
                        isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                    }`}>
                        {isOverBudget ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        Desviación
                    </p>
                    <p className={`text-xl font-bold ${
                        isOverBudget 
                            ? 'text-red-900 dark:text-red-100' 
                            : 'text-green-900 dark:text-green-100'
                    }`}>
                        {isOverBudget ? '+' : ''}{formatCurrency(variance)}
                    </p>
                    <p className={`text-xs mt-1 ${
                        isOverBudget 
                            ? 'text-red-600/70 dark:text-red-400/70' 
                            : 'text-green-600/70 dark:text-green-400/70'
                    }`}>
                        {isOverBudget ? '+' : ''}{variancePercent}% del presupuesto
                    </p>
                </div>
            </div>

            {/* Alert if over budget */}
            {totals.plansOverBudget > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>{totals.plansOverBudget}</strong> plan(es) de trabajo exceden su presupuesto estimado
                    </p>
                </div>
            )}
        </div>
    );
}
