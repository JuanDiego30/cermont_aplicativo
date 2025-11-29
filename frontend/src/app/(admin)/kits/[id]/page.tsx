"use client";

import { useKits, type Kit } from "@/features/kits";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function KitDetailPage() {
  const params = useParams();
  const kitId = params.id as string;
  
  const kitsQuery = useKits();
  const kits = kitsQuery.data ?? [];
  const isLoading = kitsQuery.isLoading;
  const kit = kits.find((k: Kit) => k.id === kitId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kit no encontrado
          </h1>
          <Link
            href="/kits"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver a Kits
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            El kit que buscas no existe o fue eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {kit.name || `Kit ${kitId.slice(0, 8)}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {kit.description || "Sin descripción"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/kits"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver
          </Link>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
            Editar
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tools Section */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Herramientas
            </h3>
            {kit.tools && kit.tools.length > 0 ? (
              <div className="space-y-3">
                {kit.tools.map((tool, index) => (
                  <div
                    key={tool.id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tool.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cantidad: {tool.quantity} {tool.unit || "unidades"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${tool.required ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {tool.required ? 'Requerido' : 'Opcional'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No hay herramientas definidas</p>
            )}
          </div>

          {/* Equipment Section */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Equipos
            </h3>
            {kit.equipment && kit.equipment.length > 0 ? (
              <div className="space-y-3">
                {kit.equipment.map((equip, index) => (
                  <div
                    key={equip.id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{equip.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {equip.model ? `Modelo: ${equip.model}` : ''} 
                        {equip.serialNumber ? ` | S/N: ${equip.serialNumber}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {equip.quantity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No hay equipos definidos</p>
            )}
          </div>

          {/* Documents Section */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documentos
            </h3>
            {kit.documents && kit.documents.length > 0 ? (
              <div className="space-y-3">
                {kit.documents.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tipo: {doc.type}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${doc.required ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {doc.required ? 'Requerido' : 'Opcional'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No hay documentos definidos</p>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Kit Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {kit.category || "Sin categoría"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {(kit.tools?.length || 0) + (kit.equipment?.length || 0) + (kit.documents?.length || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creado</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {kit.createdAt 
                    ? new Date(kit.createdAt).toLocaleDateString("es-ES") 
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {kit.updatedAt 
                    ? new Date(kit.updatedAt).toLocaleDateString("es-ES") 
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                Agregar Items
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Duplicar Kit
              </button>
              <button className="w-full px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                Eliminar Kit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
