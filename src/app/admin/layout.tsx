"use client";
 
/**
 * Layout para usuarios con rol Administrador
 * Muestra navegación específica para administradores del sistema
 */

import { withRole } from '@/lib/auth';
import { Role } from '@/lib/types/roles';
import Link from 'next/link';
import '@/styles/globals.css';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación del Admin */}
      <nav className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link 
                href="/admin/dashboard" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-red-500"
              >
                Dashboard Admin
              </Link>
              <Link 
                href="/admin/usuarios" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Gestión de Usuarios
              </Link>
              <Link 
                href="/admin/fallas" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Catálogo de Fallas
              </Link>
              <Link 
                href="/admin/roles" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Roles y Permisos
              </Link>
              <Link 
                href="/admin/sistema" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Configuración Sistema
              </Link>
              <Link 
                href="/admin/logs" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Logs y Auditoría
              </Link>
              <Link 
                href="/admin/backups" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Backups
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                ADMIN
              </span>
              <Link 
                href="/admin/perfil" 
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Modo Administrador:</strong> Tienes acceso completo al sistema. Usa estos privilegios con responsabilidad.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}

// Proteger con rol de Admin
export default withRole(AdminLayout, [Role.ADMIN]);
