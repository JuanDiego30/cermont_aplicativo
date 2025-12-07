import Link from 'next/link';

export default function OrdenesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Órdenes de Trabajo</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona todas las órdenes de servicio</p>
        </div>
        <Link
          href="/dashboard/ordenes/nueva"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Nueva Orden
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="search"
            placeholder="Buscar órdenes..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Todos los estados</option>
            <option value="planeacion">Planeación</option>
            <option value="ejecucion">En Ejecución</option>
            <option value="pausada">Pausada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay órdenes para mostrar</p>
          <p className="text-sm">Crea una nueva orden para comenzar</p>
        </div>
      </div>
    </div>
  );
}
