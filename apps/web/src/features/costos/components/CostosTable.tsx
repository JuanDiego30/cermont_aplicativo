/**
 * @file CostosTable.tsx
 * @description Table component for displaying costs
 */

import { Costo } from '../types/costos.types';
import { formatCostoCurrency, COSTO_TYPE_LABELS, COSTO_STATUS_COLORS } from '../utils/costos.utils';

interface CostosTableProps {
    costos: Costo[];
    isLoading?: boolean;
}

export function CostosTable({ costos, isLoading }: CostosTableProps) {
    if (isLoading) {
        return <div className="animate-pulse space-y-4">{/* Skeleton */}</div>;
    }

    if (!costos.length) {
        return <div className="text-center p-4 text-gray-500">No hay costos registrados</div>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {costos.map((costo) => (
                        <tr key={costo.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {costo.concepto}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {COSTO_TYPE_LABELS[costo.tipo]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                {formatCostoCurrency(costo.monto)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${COSTO_STATUS_COLORS[costo.estado]}`}>
                                    {costo.estado}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(costo.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
