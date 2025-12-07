export default function CostosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Costos</h1>
        <p className="text-gray-500 dark:text-gray-400">Control de costos y presupuestos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Presupuestado', value: '$0', trend: 'neutral' },
          { label: 'Total Ejecutado', value: '$0', trend: 'neutral' },
          { label: 'Diferencia', value: '$0', trend: 'positive' },
          { label: 'Eficiencia', value: '0%', trend: 'neutral' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Desglose por Categoría</h2>
        <div className="text-center py-12 text-gray-500">
          Sin datos de costos
        </div>
      </div>
    </div>
  );
}
