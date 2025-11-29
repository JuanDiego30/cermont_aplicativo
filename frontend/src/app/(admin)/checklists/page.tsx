"use client";

import { useRouter } from "next/navigation";
import { useChecklists } from "@/features/checklists";
import Button from "@/components/ui/button/Button";

export default function ChecklistsPage() {
  const router = useRouter();
  const checklistsQuery = useChecklists();
  
  const checklists = checklistsQuery.data ?? [];
  const isLoading = checklistsQuery.isLoading;

  const handleNewChecklist = () => {
    router.push("/checklists/new");
  };

  const handleRowClick = (checklistId: string) => {
    router.push(`/checklists/${checklistId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Checklists
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los checklists de verificación
          </p>
        </div>
        <Button onClick={handleNewChecklist} size="sm">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Checklist
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando checklists...</p>
            </div>
          </div>
        ) : checklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                No hay checklists disponibles
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Crea tu primer checklist para comenzar
              </p>
            </div>
            <Button onClick={handleNewChecklist} size="sm">
              Crear Checklist
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
                {checklists.map((checklist) => (
                  <tr
                    key={checklist.id}
                    onClick={() => handleRowClick(checklist.id)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {checklist.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {checklist.description || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {checklist.sections?.length || 0} secciones
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
