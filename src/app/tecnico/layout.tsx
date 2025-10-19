"use client";

/**
 * Layout para usuarios con rol Técnico
 * Muestra navegación específica para técnicos
 */

import { withRole } from '@/lib/auth';
import { Role } from '@/lib/types/roles';
import Link from 'next/link';
import '@/styles/globals.css';

function TecnicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación del Técnico */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link 
                href="/tecnico/dashboard" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                href="/tecnico/ordenes-asignadas" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Órdenes Asignadas
              </Link>
              <Link 
                href="/tecnico/calendario" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Calendario
              </Link>
              <Link 
                href="/tecnico/reportar" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Reportar Trabajo
              </Link>
              <Link 
                href="/tecnico/historial" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Historial
              </Link>
            </div>

            <div className="flex items-center">
              <Link 
                href="/tecnico/perfil" 
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

// Proteger con rol de Técnico
export default withRole(TecnicoLayout, [Role.TECNICO]);
