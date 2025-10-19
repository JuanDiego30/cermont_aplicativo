/**
 * Dashboard para Gerente
 * Vista ejecutiva con KPIs y métricas del negocio
 */

'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function GerenteDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Ejecutivo
        </h1>
        <p className="mt-2 text-gray-600">
          Visión general del desempeño operativo y financiero
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-90">Ingresos del Mes</p>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <p className="text-sm mt-2 opacity-75">↑ 0% vs mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-90">Órdenes Completadas</p>
          <p className="mt-2 text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-75">↑ 0% vs mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-90">Clientes Activos</p>
          <p className="mt-2 text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-75">Total en sistema</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-90">Tiempo Promedio</p>
          <p className="mt-2 text-3xl font-bold">0h</p>
          <p className="text-sm mt-2 opacity-75">Resolución de órdenes</p>
        </div>
      </div>

      {/* Métricas operativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Estado de Órdenes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="font-semibold text-yellow-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Progreso</span>
              <span className="font-semibold text-blue-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completadas</span>
              <span className="font-semibold text-green-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Canceladas</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Desempeño del Equipo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Técnicos Activos</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Finalización</span>
              <span className="font-semibold text-green-600">0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio por Técnico</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Satisfacción Cliente</span>
              <span className="font-semibold text-blue-600">0%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Tipos de Servicio</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mantenimiento</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reparación</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Instalación</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inspección</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            href="/gerente/reportes"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Reportes</span>
          </Link>

          <Link 
            href="/gerente/kpis"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <div className="p-3 bg-green-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">KPIs</span>
          </Link>

          <Link 
            href="/gerente/clientes"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Clientes</span>
          </Link>

          <Link 
            href="/gerente/equipo"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
          >
            <div className="p-3 bg-orange-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Personal</span>
          </Link>
        </div>
      </div>

      {/* Gráfico placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Órdenes (Últimos 30 días)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Gráfico de tendencias próximamente</p>
        </div>
      </div>
    </div>
  );
}
