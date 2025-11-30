'use client';

import { useState } from 'react';
import { useCosting } from '../hooks/useCosting';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/button/Button';

interface CostingDashboardProps {
    workPlanId: string;
}

const CATEGORIES = [
    { value: 'LABOR', label: 'Mano de Obra', color: 'bg-blue-100 text-blue-700' },
    { value: 'MATERIALS', label: 'Materiales', color: 'bg-green-100 text-green-700' },
    { value: 'EQUIPMENT', label: 'Equipos', color: 'bg-purple-100 text-purple-700' },
    { value: 'TRANSPORT', label: 'Transporte', color: 'bg-orange-100 text-orange-700' },
    { value: 'OTHER', label: 'Otros', color: 'bg-gray-100 text-gray-700' },
    { value: 'TAX', label: 'Impuestos', color: 'bg-red-100 text-red-700' },
];

export function CostingDashboard({ workPlanId }: CostingDashboardProps) {
    const { items, summary, isLoading, updateItem, createItem, deleteItem } = useCosting(workPlanId);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newActual, setNewActual] = useState<number>(0);
    const [showAddForm, setShowAddForm] = useState(false);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </Card>
        );
    }

    if (!summary) return null;

    const getStatusColor = () => {
        if (summary.variance < 0) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
        if (summary.variance > 0) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    };

    const handleUpdateActual = (itemId: string) => {
        updateItem({ id: itemId, updates: { actualAmount: newActual } });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">💰 Costeo en Tiempo Real</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Actualizado: {new Date().toLocaleTimeString('es-ES')}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Presupuestado</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                            ${summary.totalEstimated.toLocaleString('es-CO')}
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Real</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                            ${summary.totalActual.toLocaleString('es-CO')}
                        </p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatusColor()}`}>
                        <p className="text-sm font-medium">Variación</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold">
                                {summary.variancePercent > 0 ? '+' : ''}
                                {summary.variancePercent.toFixed(1)}%
                            </p>
                            <p className="text-lg">
                                (${Math.abs(summary.variance).toLocaleString('es-CO')})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alert */}
                {summary.variance > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                        <p className="text-sm text-red-800 dark:text-red-400">
                            <strong>⚠️ Alerta:</strong> El costo real supera el presupuesto en $
                            {summary.variance.toLocaleString('es-CO')}
                        </p>
                    </div>
                )}
            </Card>

            {/* Items List */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Desglose de Costos</h4>
                    <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary" size="sm">
                        {showAddForm ? 'Cancelar' : '+ Agregar Item'}
                    </Button>
                </div>

                {items && items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item) => {
                            const category = CATEGORIES.find((c) => c.value === item.category);

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    <div className="flex-1 mb-3 md:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded text-xs font-semibold ${category?.color}`}>
                                                {category?.label}
                                            </span>
                                            <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                                        </div>
                                        {item.notes && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">📝 {item.notes}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 items-center min-w-full md:min-w-[400px]">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Presupuestado</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">${item.estimatedAmount.toLocaleString()}</p>
                                        </div>

                                        <div className="text-right">
                                            {editingId === item.id ? (
                                                <div className="flex gap-2 justify-end">
                                                    <input
                                                        type="number"
                                                        value={newActual}
                                                        onChange={(e) => setNewActual(Number(e.target.value))}
                                                        className="w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateActual(item.id)}
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-600"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Real</p>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(item.id);
                                                            setNewActual(item.actualAmount || 0);
                                                        }}
                                                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                                                    >
                                                        ${(item.actualAmount || 0).toLocaleString()} ✏️
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Variación</p>
                                            <p
                                                className={`text-lg font-bold ${(item.actualAmount || 0) - item.estimatedAmount < 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {(item.actualAmount || 0) - item.estimatedAmount >= 0 ? '+' : ''}$
                                                {((item.actualAmount || 0) - item.estimatedAmount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No hay items de costo registrados</p>
                        <p className="text-sm">Agrega items para comenzar el seguimiento</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
