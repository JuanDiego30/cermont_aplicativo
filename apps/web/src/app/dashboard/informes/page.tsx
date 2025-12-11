export default function InformesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Informes</h1>
          <p className="text-gray-500 dark:text-gray-400">Reportes y análisis</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Generar Informe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Órdenes por Estado', description: 'Resumen de órdenes por estado' },
          { title: 'Costos Mensuales', description: 'Análisis de costos por mes' },
          { title: 'Productividad', description: 'Métricas de productividad del equipo' },
          { title: 'Clientes', description: 'Órdenes por cliente' },
          { title: 'Técnicos', description: 'Rendimiento por técnico' },
          { title: 'Tendencias', description: 'Análisis de tendencias' },
        ].map((report) => (
          <div key={report.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
