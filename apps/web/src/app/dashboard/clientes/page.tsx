/**
 * ARCHIVO: clientes/page.tsx
 * FUNCION: Pagina de directorio de clientes corporativos
 * IMPLEMENTACION: Server Component con stats y grid usando Suspense
 * DEPENDENCIAS: React Suspense, Next.js Link, features/clientes
 * EXPORTS: ClientesPage (default), metadata - Server Component
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';
import { ClientesGrid, ClientesGridSkeleton } from '@/features/clientes';

export const metadata = {
  title: 'Clientes | Cermont',
  description: 'Directorio de clientes',
};

// TODO: Implementar fetch real desde API
async function getClientesStats() {
  // const res = await fetch(`${process.env.API_URL}/clientes/stats`, { next: { revalidate: 60 } });
  // return res.json();
  return {
    total: 24,
    activos: 20,
    inactivos: 4,
  };
}

export default async function ClientesPage() {
  const stats = await getClientesStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Clientes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Directorio de clientes corporativos
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/clientes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.activos}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactivos</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactivos}</p>
        </div>
      </div>

      {/* Clientes Grid */}
      <Suspense fallback={<ClientesGridSkeleton />}>
        <ClientesGrid />
      </Suspense>
    </div>
  );
}
