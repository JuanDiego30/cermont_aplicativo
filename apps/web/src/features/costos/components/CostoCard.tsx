/**
 * @file CostoCard.tsx
 * @description Pure card component for displaying a cost item
 */

import { Costo } from '../types/costos.types';
import { formatCostoCurrency, COSTO_TYPE_LABELS, COSTO_STATUS_COLORS } from '../utils/costos.utils';

interface CostoCardProps {
    costo: Costo;
}

export function CostoCard({ costo }: CostoCardProps) {
    return (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                        {COSTO_TYPE_LABELS[costo.tipo]}
                    </span>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate pr-2 max-w-[200px]" title={costo.concepto}>
                        {costo.concepto}
                    </h4>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${COSTO_STATUS_COLORS[costo.estado]}`}>
                    {costo.estado}
                </span>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-400">Monto</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCostoCurrency(costo.monto)}
                    </p>
                </div>
                <p className="text-xs text-gray-400">
                    {new Date(costo.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
