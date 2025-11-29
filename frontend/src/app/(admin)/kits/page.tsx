"use client";

import { useRouter } from "next/navigation";
import { useKits } from "@/features/kits";
import Button from "@/components/ui/button/Button";

export default function KitsPage() {
  const router = useRouter();
  const kitsQuery = useKits();
  
  // Extract data from query
  const kits = kitsQuery.data ?? [];
  const isLoading = kitsQuery.isLoading;

  const handleNewKit = () => {
    router.push("/kits/new");
  };

  const handleRowClick = (kitId: string) => {
    router.push(`/kits/${kitId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los kits de trabajo del sistema
          </p>
        </div>
        <Button onClick={handleNewKit} size="sm">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Kit
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando kits...</p>
            </div>
          </div>
        ) : kits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                No hay kits disponibles
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Crea tu primer kit para comenzar
              </p>
            </div>
            <Button onClick={handleNewKit} size="sm">
              Crear Kit
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {kits.map((kit) => (
                  <tr
                    key={kit.id}
                    onClick={() => handleRowClick(kit.id)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {kit.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {kit.description || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {(kit.tools?.length || 0) + (kit.equipment?.length || 0)} items
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
