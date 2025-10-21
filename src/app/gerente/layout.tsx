"use client";

/**
 * Layout para usuarios con rol Gerente
 * Muestra navegación específica para gerentes
 */

import { withRole } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
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
                href={ROUTES.ROLES.GERENTE.DASHBOARD} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.REPORTS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Reportes
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.KPIS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                KPIs y Métricas
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.ORDERS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Órdenes
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.CLIENTS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Clientes
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.TEAM} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Personal
              </Link>
              <Link 
                href={ROUTES.ROLES.GERENTE.SETTINGS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Configuración
              </Link>
            </div>

            <div className="flex items-center">
              <Link 
                href={ROUTES.ROLES.GERENTE.PROFILE} 
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
