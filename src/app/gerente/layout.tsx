"use client";

/**
 * Layout para usuarios con rol Gerente
 * Muestra navegación específica para gerentes
 */

import { withRole } from '@/lib/auth';
import { Role } from '@/lib/types/roles';
import Link from 'next/link';
import '@/styles/globals.css';

function GerenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación del Gerente */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link 
                href="/gerente/dashboard" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                href="/gerente/reportes" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Reportes
              </Link>
              <Link 
                href="/gerente/kpis" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                KPIs y Métricas
              </Link>
              <Link 
                href="/gerente/ordenes" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Órdenes
              </Link>
              <Link 
                href="/gerente/clientes" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Clientes
              </Link>
              <Link 
                href="/gerente/equipo" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Personal
              </Link>
              <Link 
                href="/gerente/configuracion" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Configuración
              </Link>
            </div>

            <div className="flex items-center">
              <Link 
                href="/gerente/perfil" 
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Mi Perfil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Proteger con rol de Gerente
export default withRole(GerenteLayout, [Role.GERENTE]);
