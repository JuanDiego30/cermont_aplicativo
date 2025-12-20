/**
 * @file page.tsx
 * @description Página de Técnicos - Refactorizada con Server Components
 * 
 * ✨ Server Component - Fetch de datos en el servidor
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  TecnicosStats,
  TecnicosStatsSkeleton,
  TecnicosGrid,
  TecnicosGridSkeleton,
  calculateTecnicosStats,
} from '@/features/tecnicos';
import type { Tecnico, TecnicoFilters, PaginatedTecnicos } from '@/features/tecnicos';

import { tecnicosApi } from '@/features/tecnicos';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    disponible?: 'todos' | 'disponible' | 'ocupado';
    page?: string;
    estado?: string;
  }>;
}

// Función para obtener técnicos del backend
async function getTecnicos(filters: TecnicoFilters): Promise<PaginatedTecnicos> {
  try {
    return await tecnicosApi.getAll(filters);
  } catch (error) {
    console.error('Error fetching técnicos:', error);
    // Retornar datos vacíos en caso de error
    return {
      data: [],
      total: 0,
      page: filters.page || 1,
      pageSize: filters.pageSize || 12,
      totalPages: 0,
    };
  }
}

async function getStats() {
  try {
    // Obtener todos los técnicos para calcular stats
    const allTecnicos = await tecnicosApi.getAll({ pageSize: 1000 });
    return calculateTecnicosStats(allTecnicos.data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Retornar stats vacíos en caso de error
    return {
      total: 0,
      disponibles: 0,
      enServicio: 0,
      calificacionPromedio: 0,
      ordenesCompletadasTotal: 0,
    };
  }
}

export default async function TecnicosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Técnicos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión del personal técnico de campo
          </p>
        </div>
        <Link
          href="/dashboard/tecnicos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Agregar Técnico
        </Link>
      </div>

      {/* Stats con Suspense */}
      <Suspense fallback={<TecnicosStatsSkeleton />}>
        <TecnicosStatsAsync />
      </Suspense>

      {/* Grid con Suspense */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={<TecnicosGridSkeleton />}
      >
        <TecnicosGridAsync searchParams={params} />
      </Suspense>
    </div>
  );
}

// Server Component para stats
async function TecnicosStatsAsync() {
  const stats = await getStats();
  return <TecnicosStats stats={stats} />;
}

// Server Component para grid
async function TecnicosGridAsync({
  searchParams,
}: {
  searchParams: Awaited<PageProps['searchParams']>;
}) {
  const filters: TecnicoFilters = {
    search: searchParams.search,
    disponible: searchParams.disponible || 'todos',
    estado: searchParams.estado as TecnicoFilters['estado'],
    page: Number(searchParams.page) || 1,
    pageSize: 12,
  };

  const data = await getTecnicos(filters);

  return <TecnicosGrid initialData={data} initialFilters={filters} />;
}

// Metadata para SEO
export async function generateMetadata() {
  return {
    title: 'Técnicos | Cermont SAS',
    description: 'Gestión del personal técnico de campo de Cermont SAS',
  };
}
