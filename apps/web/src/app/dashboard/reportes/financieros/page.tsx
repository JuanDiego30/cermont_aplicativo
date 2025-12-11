'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface FinancialData {
  periodo: string;
  ingresos: number;
  egresos: number;
  utilidad: number;
  margen: number;
}

const mockData: FinancialData[] = [
  { periodo: 'Enero 2024', ingresos: 45000000, egresos: 32000000, utilidad: 13000000, margen: 28.9 },
  { periodo: 'Febrero 2024', ingresos: 52000000, egresos: 35000000, utilidad: 17000000, margen: 32.7 },
  { periodo: 'Marzo 2024', ingresos: 48000000, egresos: 33500000, utilidad: 14500000, margen: 30.2 },
  { periodo: 'Abril 2024', ingresos: 61000000, egresos: 41000000, utilidad: 20000000, margen: 32.8 },
  { periodo: 'Mayo 2024', ingresos: 55000000, egresos: 38000000, utilidad: 17000000, margen: 30.9 },
  { periodo: 'Junio 2024', ingresos: 67000000, egresos: 45000000, utilidad: 22000000, margen: 32.8 },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export default function ReportesFinancierosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  const totalIngresos = mockData.reduce((acc, item) => acc + item.ingresos, 0);
  const totalEgresos = mockData.reduce((acc, item) => acc + item.egresos, 0);
  const totalUtilidad = mockData.reduce((acc, item) => acc + item.utilidad, 0);
  const promedioMargen = mockData.reduce((acc, item) => acc + item.margen, 0) / mockData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/reportes"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💰 Reportes Financieros
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Análisis de ingresos, egresos y rentabilidad
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          >
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Ingresos */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-100 rounded-full dark:bg-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" />
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalIngresos)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ingresos Totales
            </p>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full dark:bg-red-500/20">
              <ArrowDownRight className="w-3 h-3" />
              +8.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalEgresos)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Egresos Totales
            </p>
          </div>
        </div>

        {/* Utilidad Neta */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-500/20">
              <ArrowUpRight className="w-3 h-3" />
              +18.3%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalUtilidad)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Utilidad Neta
            </p>
          </div>
        </div>

        {/* Margen Promedio */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-500/20">
              Estable
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {promedioMargen.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Margen Promedio
            </p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolución Financiera
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comparativa de ingresos vs egresos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Egresos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilidad</span>
            </div>
          </div>
        </div>
        
        {/* Simple Bar Chart Visualization */}
        <div className="space-y-4">
          {mockData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.periodo}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Margen: {item.margen}%
                </span>
              </div>
              <div className="flex gap-1 h-8">
                <div 
                  className="bg-emerald-500 rounded-l-lg transition-all"
                  style={{ width: `${(item.ingresos / 70000000) * 100}%` }}
                  title={`Ingresos: ${formatCurrency(item.ingresos)}`}
                />
                <div 
                  className="bg-red-400 transition-all"
                  style={{ width: `${(item.egresos / 70000000) * 100}%` }}
                  title={`Egresos: ${formatCurrency(item.egresos)}`}
                />
                <div 
                  className="bg-blue-500 rounded-r-lg transition-all"
                  style={{ width: `${(item.utilidad / 70000000) * 100}%` }}
                  title={`Utilidad: ${formatCurrency(item.utilidad)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalle por Período
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Egresos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {mockData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.periodo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
                    {formatCurrency(item.ingresos)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                    {formatCurrency(item.egresos)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
                    {formatCurrency(item.utilidad)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.margen >= 30 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20'
                    }`}>
                      {item.margen}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  TOTAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-bold">
                  {formatCurrency(totalIngresos)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-bold">
                  {formatCurrency(totalEgresos)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
                  {formatCurrency(totalUtilidad)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20">
                    {promedioMargen.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
