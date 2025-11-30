"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders, type Order } from "@/features/orders";
import { SkeletonTable } from "@/components/common";
import Button from "@/components/ui/button/Button";

// State badge component
function StateBadge({ state }: { state: string }) {
  const stateConfig: Record<string, { label: string; color: string }> = {
    SOLICITUD: { label: "Solicitud", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
    VISITA: { label: "Visita", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
    PO: { label: "PO", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
    PLANEACION: { label: "Planeación", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
    EJECUCION: { label: "En Ejecución", color: "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300" },
    INFORME: { label: "Informe", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" },
    ACTA: { label: "Acta", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
    FACTURA: { label: "Factura", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" },
  };

  const config = stateConfig[state] || { label: state, color: "bg-gray-100 text-gray-700" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority?: string }) {
  const priorityConfig: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-green-600 dark:text-green-400" },
    MEDIUM: { label: "Media", color: "text-yellow-600 dark:text-yellow-400" },
    HIGH: { label: "Alta", color: "text-orange-600 dark:text-orange-400" },
    URGENT: { label: "Urgente", color: "text-red-600 dark:text-red-400" },
  };

  const config = priorityConfig[priority || ""] || { label: "—", color: "text-gray-500" };

  return <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>;
}

// Format date helper
function formatDate(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES");
}

const ORDERS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { orders, totalPages, isLoading } = useOrders({ page, limit: ORDERS_PER_PAGE });

  const handleNewOrder = () => {
    router.push("/orders/new");
  };

  const handleRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Órdenes de Trabajo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y visualiza todas las órdenes del sistema
          </p>
        </div>
        <Button onClick={handleNewOrder} size="sm">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={ORDERS_PER_PAGE} columns={6} hasHeader />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                No hay órdenes disponibles
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Crea tu primera orden de trabajo para comenzar
              </p>
            </div>
            <Button onClick={handleNewOrder} size="sm">
              Crear Primera Orden
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Ubicación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Prioridad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Creado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order.clientName || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {order.location || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StateBadge state={order.state} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={order.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Página <span className="font-medium text-gray-900 dark:text-white">{page}</span> de{" "}
                  <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
