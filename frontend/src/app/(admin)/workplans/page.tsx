"use client";

import { useWorkPlans } from "@/features/workplans";
import Link from "next/link";

export default function WorkPlansPage() {
  const workPlansQuery = useWorkPlans();
  const workPlans = workPlansQuery.data ?? [];
  const isLoading = workPlansQuery.isLoading;

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return status ? colors[status] || colors.draft : colors.draft;
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      active: "Activo",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return status ? labels[status] || status : "Borrador";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Planes de Trabajo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los planes de trabajo y cronogramas
          </p>
        </div>
        <Link
          href="/workplans/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Plan
        </Link>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : workPlans && workPlans.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Título
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Orden
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Fecha Inicio
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Fecha Fin
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Estado
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Progreso
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {workPlans.map((plan) => (
                    <tr 
                      key={plan.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link 
                          href={`/workplans/${plan.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {plan.title || `Plan ${plan.orderCode}`}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {plan.orderCode || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {plan.plannedStartDate 
                          ? new Date(plan.plannedStartDate).toLocaleDateString("es-ES") 
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {plan.plannedEndDate 
                          ? new Date(plan.plannedEndDate).toLocaleDateString("es-ES") 
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                          {getStatusLabel(plan.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-500 rounded-full transition-all"
                              style={{ width: `${plan.status === 'COMPLETED' ? 100 : plan.status === 'IN_PROGRESS' ? 50 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                            {plan.status === 'COMPLETED' ? 100 : plan.status === 'IN_PROGRESS' ? 50 : 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/workplans/${plan.id}`}
                          className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay planes de trabajo
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Crea tu primer plan de trabajo para comenzar
            </p>
            <Link
              href="/workplans/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
