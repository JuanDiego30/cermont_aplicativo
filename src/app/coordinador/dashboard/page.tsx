/**
 * Dashboard para Coordinador
 * Vista general de órdenes y asignación de técnicos
 */

'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function CoordinadorDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Coordinación
        </h1>
        <p className="mt-2 text-gray-600">
          Gestiona y asigna órdenes de trabajo al equipo técnico
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Asignar</p>
              <p className="mt-2 text-3xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="mt-2 text-3xl font-bold text-green-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Técnicos Activos</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/coordinador/asignar"
            className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Asignar Técnicos</h3>
              <p className="text-sm text-gray-600">Distribuir órdenes de trabajo</p>
            </div>
          </Link>

          <Link 
            href="/coordinador/ordenes"
            className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ver Todas las Órdenes</h3>
              <p className="text-sm text-gray-600">Gestión completa</p>
            </div>
          </Link>

          <Link 
            href="/coordinador/calendario"
            className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Calendario General</h3>
              <p className="text-sm text-gray-600">Vista de todas las agendas</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Órdenes sin asignar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Órdenes Sin Asignar</h2>
          <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">
            Requieren Atención
          </span>
        </div>
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-lg">No hay órdenes pendientes de asignación</p>
        </div>
      </div>

      {/* Técnicos disponibles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Técnicos Disponibles</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Cargando información del equipo...</p>
        </div>
      </div>
    </div>
  );
}
