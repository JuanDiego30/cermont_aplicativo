export default function EvidenciasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidencias</h1>
          <p className="text-gray-500 dark:text-gray-400">Galería de fotos y documentos</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Subir Evidencia
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay evidencias</p>
          <p className="text-sm">Sube fotos y documentos de tus trabajos</p>
        </div>
      </div>
    </div>
  );
}
