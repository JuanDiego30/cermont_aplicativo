"use client";

import { useState } from "react";
import { useArchives, useExportArchives, useTriggerArchive } from "@/features/archives";
import Link from "next/link";
import { Archive, Download, RefreshCw, Search, ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";

export default function ArchivesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data, isLoading, refetch } = useArchives({ page, limit: 10, search: searchTerm });
  const exportMutation = useExportArchives();
  const triggerMutation = useTriggerArchive();

  const archives = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleExport = () => {
    exportMutation.mutate(exportMonth);
  };

  const handleTrigger = async () => {
    if (window.confirm("¿Estás seguro de archivar las órdenes completadas hace más de 30 días?")) {
      await triggerMutation.mutateAsync();
      refetch();
    }
  };

  const getStateColor = (state?: string) => {
    const colors: Record<string, string> = {
      SOLICITUD: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      VISITA: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      PO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      PLANEACION: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      EJECUCION: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400",
      INFORME: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      ACTA: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      SES: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      FACTURA: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      PAGO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return state ? colors[state] || colors.SOLICITUD : colors.SOLICITUD;
  };

  const getStateLabel = (state?: string) => {
    const labels: Record<string, string> = {
      SOLICITUD: "Solicitud",
      VISITA: "Visita",
      PO: "PO",
      PLANEACION: "Planeación",
      EJECUCION: "En Ejecución",
      INFORME: "Informe",
      ACTA: "Acta",
      SES: "SES",
      FACTURA: "Factura",
      PAGO: "Pago",
    };
    return state ? labels[state] || state : "Solicitud";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Archive className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Archivo Histórico
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Órdenes de trabajo archivadas y respaldos mensuales
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTrigger}
            disabled={triggerMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {triggerMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Archivar Antiguas
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exportar Respaldo Mensual
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mes a exportar
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Descargar ZIP
            </button>
          </div>
        </div>
        {exportMutation.isSuccess && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">
            ✓ Archivo descargado exitosamente
          </p>
        )}
        {exportMutation.isError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            ✕ No se encontraron datos para el mes seleccionado
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por número de orden o cliente..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
        />
      </div>

      {/* Archives List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : archives.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Orden
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Cliente
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Estado Final
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Fecha Archivo
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {archives.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                          OT-{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {order.clientName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStateColor(order.state as string)}`}
                        >
                          {getStateLabel(order.state as string)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {order.updatedAt
                          ? new Date(order.updatedAt).toLocaleDateString("es-CO")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {archives.length} de {meta.total} órdenes archivadas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                  Página {meta.page} de {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Archive className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay órdenes archivadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              Las órdenes completadas se archivan automáticamente después de 30 días.
              También puedes archivar manualmente usando el botón "Archivar Antiguas".
            </p>
          </div>
        )}
      </div>

      {/* Trigger Success Message */}
      {triggerMutation.isSuccess && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <p className="text-green-700 dark:text-green-300">
            ✓ Se archivaron {triggerMutation.data?.archivedCount || 0} órdenes exitosamente.
          </p>
        </div>
      )}
    </div>
  );
}
