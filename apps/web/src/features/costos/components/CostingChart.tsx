'use client';

import type { Costing, CostingCategory } from '@/types/costing';

interface CostingChartProps {
  costing: Costing;
}

const categoryLabels: Record<CostingCategory, string> = {
  material: 'Materiales',
  mano_obra: 'Mano de Obra',
  transporte: 'Transporte',
  equipo: 'Equipo',
  herramientas: 'Herramientas',
  subcontrato: 'Subcontrato',
  otros: 'Otros',
};

const categoryColors: Record<CostingCategory, string> = {
  material: 'bg-blue-500',
  mano_obra: 'bg-green-500',
  transporte: 'bg-yellow-500',
  equipo: 'bg-purple-500',
  herramientas: 'bg-pink-500',
  subcontrato: 'bg-indigo-500',
  otros: 'bg-gray-500',
};

export function CostingChart({ costing }: CostingChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  // Agrupar items por categoría
  const byCategory = costing.items.reduce((acc, item) => {
    const cat = item.categoria;
    acc[cat] = (acc[cat] || 0) + item.valorTotal;
    return acc;
  }, {} as Record<CostingCategory, number>);

  const totalByCategory = Object.entries(byCategory) as [CostingCategory, number][];
  const maxCategory = Math.max(...Object.values(byCategory), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(costing.subtotal)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Impuestos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(costing.impuestos)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(costing.total)}
          </p>
        </div>
      </div>

      {/* By Category */}
      <div>
        <h4 className="font-medium mb-4">Por Categoría</h4>
        <div className="space-y-3">
          {totalByCategory.map(([category, value]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span>{categoryLabels[category]}</span>
                <span className="font-medium">{formatCurrency(value)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${categoryColors[category]}`}
                  style={{
                    width: `${maxCategory > 0 ? (value / maxCategory) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
