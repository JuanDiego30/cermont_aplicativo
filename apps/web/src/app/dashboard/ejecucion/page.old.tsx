export default function EjecucionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ejecución</h1>
        <p className="text-gray-500 dark:text-gray-400">Seguimiento de trabajos en campo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['En Progreso', 'Pausadas', 'Finalizadas Hoy'].map((status) => (
          <div key={status} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4">{status}</h3>
            <div className="text-center py-8 text-gray-500 text-sm">
              Sin órdenes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
