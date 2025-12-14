"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const fetchResumenPeriodo = async (fechaInicio: string, fechaFin: string) => {
  const response = await apiClient.get<any>(`/costos/periodo`, {
    fechaInicio,
    fechaFin
  });
  return response.data;
};

export default function CostosPage() {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: resumen, isLoading, refetch, isError } = useQuery({
    queryKey: ["costos-periodo", fechaInicio, fechaFin],
    queryFn: () => fetchResumenPeriodo(fechaInicio, fechaFin),
  });

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error</h3>
        <p className="text-red-600 dark:text-red-300">No se pudo cargar datos de costos.</p>
      </div>
    );
  }

  const varianzaTotal = resumen?.varianzaTotal || 0;
  const varianzaPositiva = varianzaTotal > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis de Costos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Presupuesto vs costo real</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => refetch()} className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-2 border rounded-xl" />
        <span>a</span>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-2 border rounded-xl" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5 dark:bg-gray-800">
            <p className="text-sm text-gray-500">Total Órdenes</p>
            <p className="text-2xl font-bold">{resumen?.totalOrdenes || 0}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:bg-blue-900/20">
            <p className="text-sm text-blue-600">Presupuestado</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${(resumen?.totalPresupuestado || 0).toLocaleString("es-CO")}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-600">Costo Real</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">${(resumen?.totalReal || 0).toLocaleString("es-CO")}</p>
          </div>
          <div className={`rounded-2xl border p-5 ${varianzaPositiva ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            <p className={`text-sm ${varianzaPositiva ? "text-red-600" : "text-green-600"}`}>Varianza</p>
            <div className="flex items-center gap-2">
              {varianzaPositiva ? <TrendingUp className="w-5 h-5 text-red-500" /> : <TrendingDown className="w-5 h-5 text-green-500" />}
              <p className={`text-2xl font-bold ${varianzaPositiva ? "text-red-900" : "text-green-900"}`}>
                {varianzaPositiva ? "+" : ""}${Math.abs(varianzaTotal).toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white dark:bg-gray-800">
        <div className="px-6 py-4 border-b"><h3 className="font-semibold">Detalle por Orden</h3></div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Real</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Varianza</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!resumen?.ordenes?.length ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Sin órdenes</td></tr>
            ) : resumen.ordenes.map((orden: any) => (
              <tr key={orden.ordenId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4"><Link href={`/dashboard/ordenes/${orden.ordenId}`} className="text-blue-600 hover:underline">#{orden.numero}</Link></td>
                <td className="px-6 py-4">{orden.cliente}</td>
                <td className="px-6 py-4 text-right">${orden.presupuesto?.toLocaleString("es-CO") || 0}</td>
                <td className="px-6 py-4 text-right font-medium">${orden.real?.toLocaleString("es-CO") || 0}</td>
                <td className="px-6 py-4 text-right">
                  <span className={orden.varianza > 0 ? "text-red-600" : "text-green-600"}>
                    {orden.varianza > 0 ? "+" : ""}${Math.abs(orden.varianza).toLocaleString("es-CO")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
