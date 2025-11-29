'use client';

import { useEffect, useState } from 'react';
import { costBreakdownApi, type CostBreakdownItem } from '../api/cost-breakdown-service';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface CostBreakdownTableProps {
    workPlanId: string;
    onUpdate?: () => void;
}

const CATEGORIES = [
    { value: 'LABOR', label: 'Mano de Obra' },
    { value: 'MATERIALS', label: 'Materiales' },
    { value: 'EQUIPMENT', label: 'Equipos y Herramientas' },
    { value: 'TRANSPORT', label: 'Transporte' },
    { value: 'TAX', label: 'Impuestos' },
    { value: 'OTHER', label: 'Otros' },
];

export function CostBreakdownTable({ workPlanId, onUpdate }: CostBreakdownTableProps) {
    const [items, setItems] = useState<CostBreakdownItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<CostBreakdownItem>>({});

    useEffect(() => {
        fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workPlanId]);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const data = await costBreakdownApi.list(workPlanId);
            setItems(data);
        } catch (err) {
            console.error('Error fetching cost items:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({
            category: 'MATERIALS',
            description: '',
            estimatedAmount: 0,
            actualAmount: undefined,
            quantity: 1,
            unitPrice: 0,
            taxRate: 0.19, // Default IVA 19%
            notes: '',
        });
    };

    const handleSaveNew = async () => {
        try {
            await costBreakdownApi.create(workPlanId, formData as Omit<CostBreakdownItem, 'id' | 'workPlanId' | 'createdAt' | 'updatedAt'>);
            await fetchItems();
            setIsAdding(false);
            setFormData({});
            onUpdate?.();
        } catch (err) {
            console.error('Error creating cost item:', err);
            alert('Error al crear el ítem de costo');
        }
    };

    const handleEdit = (item: CostBreakdownItem) => {
        setEditingId(item.id);
        setFormData(item);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await costBreakdownApi.update(editingId, formData);
            await fetchItems();
            setEditingId(null);
            setFormData({});
            onUpdate?.();
        } catch (err) {
            console.error('Error updating cost item:', err);
            alert('Error al actualizar el ítem de costo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este ítem de costo?')) return;
        try {
            await costBreakdownApi.delete(id);
            await fetchItems();
            onUpdate?.();
        } catch (err) {
            console.error('Error deleting cost item:', err);
            alert('Error al eliminar el ítem de costo');
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="animate-pulse space-y-3">
                    <div className="h-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                    Desglose Detallado de Costos
                </h3>
                <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Agregar Ítem
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <tr>
                            <th className="p-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                                Categoría
                            </th>
                            <th className="p-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                                Descripción
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                Cant.
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                P. Unit.
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                Estimado
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                Real
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                IVA%
                            </th>
                            <th className="p-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                Variación
                            </th>
                            <th className="p-3 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const isEditing = editingId === item.id;
                            const variance = (item.actualAmount || 0) - item.estimatedAmount;
                            const varianceColor =
                                variance > 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : variance < 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-neutral-600';

                            return (
                                <tr
                                    key={item.id}
                                    className="border-b border-neutral-200 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/30"
                                >
                                    {isEditing ? (
                                        <>
                                            <td className="p-3">
                                                <select
                                                    value={formData.category || ''}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                >
                                                    {CATEGORIES.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    value={formData.description || ''}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={formData.quantity || 0}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                                                    }
                                                    className="w-20 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={formData.unitPrice || 0}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })
                                                    }
                                                    className="w-24 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={formData.estimatedAmount || 0}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) })
                                                    }
                                                    className="w-28 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={formData.actualAmount || 0}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, actualAmount: parseFloat(e.target.value) })
                                                    }
                                                    className="w-28 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={(formData.taxRate || 0) * 100}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, taxRate: parseFloat(e.target.value) / 100 })
                                                    }
                                                    className="w-16 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </td>
                                            <td className="p-3" />
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="rounded bg-green-600 p-1.5 text-white transition-colors hover:bg-green-700"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="rounded bg-neutral-400 p-1.5 text-white transition-colors hover:bg-neutral-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3 text-neutral-900 dark:text-neutral-100">
                                                {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                                            </td>
                                            <td className="p-3 text-neutral-700 dark:text-neutral-300">
                                                {item.description}
                                            </td>
                                            <td className="p-3 text-right text-neutral-700 dark:text-neutral-300">
                                                {item.quantity}
                                            </td>
                                            <td className="p-3 text-right text-neutral-700 dark:text-neutral-300">
                                                {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                                                {formatCurrency(item.estimatedAmount)}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                                                {item.actualAmount ? formatCurrency(item.actualAmount) : '-'}
                                            </td>
                                            <td className="p-3 text-right text-neutral-700 dark:text-neutral-300">
                                                {(item.taxRate * 100).toFixed(0)}%
                                            </td>
                                            <td className={`p-3 text-right font-semibold ${varianceColor}`}>
                                                {variance !== 0 ? formatCurrency(variance) : '-'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}

                        {/* Add new row */}
                        {isAdding && (
                            <tr className="border-b border-neutral-200 bg-blue-50 dark:border-neutral-800 dark:bg-blue-950/20">
                                <td className="p-3">
                                    <select
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Descripción..."
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        value={formData.quantity || 0}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                        className="w-20 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        value={formData.unitPrice || 0}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                                        className="w-24 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        value={formData.estimatedAmount || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) })
                                        }
                                        className="w-28 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        value={formData.actualAmount || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, actualAmount: parseFloat(e.target.value) || undefined })
                                        }
                                        className="w-28 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={(formData.taxRate || 0) * 100}
                                        onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) / 100 })}
                                        className="w-16 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </td>
                                <td className="p-3" />
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={handleSaveNew}
                                            className="rounded bg-green-600 p-1.5 text-white transition-colors hover:bg-green-700"
                                        >
                                            <Save className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="rounded bg-neutral-400 p-1.5 text-white transition-colors hover:bg-neutral-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {items.length === 0 && !isAdding && (
                    <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                        No hay ítems de costo registrados. Haz clic en &quot;Agregar Ítem&quot; para comenzar.
                    </div>
                )}
            </div>
        </div>
    );
}
