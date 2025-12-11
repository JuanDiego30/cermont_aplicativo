'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Download,
  ChevronRight
} from 'lucide-react';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

const reportCards: ReportCard[] = [
  {
    title: 'Reportes Financieros',
    description: 'Ingresos, egresos y utilidades por período',
    icon: <DollarSign className="w-6 h-6" />,
    href: '/dashboard/reportes/financieros',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
  },
  {
    title: 'Reportes de Órdenes',
    description: 'Estado y progreso de órdenes de trabajo',
    icon: <FileText className="w-6 h-6" />,
    href: '/dashboard/reportes/ordenes',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  {
    title: 'Reportes de Productividad',
    description: 'Rendimiento de técnicos y equipos',
    icon: <BarChart3 className="w-6 h-6" />,
    href: '/dashboard/reportes/productividad',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
  },
  {
    title: 'Análisis de Tendencias',
    description: 'Proyecciones y análisis histórico',
    icon: <TrendingUp className="w-6 h-6" />,
    href: '/dashboard/reportes/tendencias',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-500/20',
  },
];

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Centro de Reportes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Genera y descarga reportes detallados de tu operación
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            <Calendar className="w-4 h-4" />
            Último mes
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exportar Todo
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => (
          <Link
            key={report.title}
            href={report.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-600"
          >
            <div className="flex items-start justify-between">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${report.bgColor} ${report.color}`}>
                {report.icon}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {report.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumen Rápido - Este Mes
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Órdenes Completadas</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-emerald-600">$125.4M</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Técnicos Activos</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-purple-600">94%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Satisfacción</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reportes Recientes
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {[
            { name: 'Reporte Mensual - Noviembre 2024', date: '01/12/2024', type: 'Financiero' },
            { name: 'Análisis de Productividad Q3', date: '15/10/2024', type: 'Productividad' },
            { name: 'Estado de Órdenes - Octubre', date: '01/11/2024', type: 'Órdenes' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-500/20">
                  {report.type}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
