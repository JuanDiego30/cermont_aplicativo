"use client";

/**
 * Layout para usuarios con rol Coordinador
 * Muestra navegación específica para coordinadores
 */

import { withRole } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { Role } from '@/lib/types/roles';
import Link from 'next/link';
import '@/styles/globals.css';

function CoordinadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación del Coordinador */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link 
                href={ROUTES.ROLES.COORDINADOR.DASHBOARD} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                href={ROUTES.ROLES.COORDINADOR.ORDERS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Todas las Órdenes
              </Link>
              <Link 
                href={ROUTES.ROLES.COORDINADOR.ASSIGN} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Asignar Técnicos
              </Link>
              <Link 
                href={ROUTES.ROLES.COORDINADOR.TECHNICIANS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Gestión de Técnicos
              </Link>
              <Link 
                href={ROUTES.ROLES.COORDINADOR.CLIENTS} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Clientes
              </Link>
              <Link 
                href={ROUTES.ROLES.COORDINADOR.CALENDAR} 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Calendario General
              </Link>
            </div>

            <div className="flex items-center">
              <Link 
                href={ROUTES.ROLES.COORDINADOR.PROFILE} 
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

// Proteger con rol de Coordinador
export default withRole(CoordinadorLayout, [Role.COORDINADOR]);
