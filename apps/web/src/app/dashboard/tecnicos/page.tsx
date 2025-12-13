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

// Mock data - Será reemplazado por fetch al backend
const mockTecnicos: Tecnico[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    cargo: 'Técnico Senior',
    especialidad: 'Mantenimiento Industrial',
    certificaciones: ['Trabajo en Alturas', 'Espacios Confinados', 'Rescate Vertical'],
    telefono: '+57 300 123 4567',
    email: 'juan.perez@cermont.co',
    estado: 'activo',
    ubicacion: 'Barrancabermeja',
    ordenesCompletadas: 156,
    calificacion: 4.8,
    disponible: true,
  },
  {
    id: '2',
    nombre: 'María García',
    cargo: 'Técnico de Campo',
    especialidad: 'Inspección de Equipos',
    certificaciones: ['Trabajo en Alturas', 'Inspector de Líneas de Vida'],
    telefono: '+57 301 234 5678',
    email: 'maria.garcia@cermont.co',
    estado: 'activo',
    ubicacion: 'Cartagena',
    ordenesCompletadas: 89,
    calificacion: 4.9,
    disponible: false,
  },
  {
    id: '3',
    nombre: 'Carlos López',
    cargo: 'Técnico Senior',
    especialidad: 'Montaje Industrial',
    certificaciones: ['Trabajo en Alturas', 'Izaje de Cargas', 'Soldadura TIG'],
    telefono: '+57 302 345 6789',
    email: 'carlos.lopez@cermont.co',
    estado: 'activo',
    ubicacion: 'Bogotá',
    ordenesCompletadas: 234,
    calificacion: 4.7,
    disponible: true,
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    cargo: 'Supervisor HES',
    especialidad: 'Seguridad Industrial',
    certificaciones: ['Auditor ISO 45001', 'Trabajo en Alturas', 'Primeros Auxilios'],
    telefono: '+57 303 456 7890',
    email: 'ana.rodriguez@cermont.co',
    estado: 'activo',
    ubicacion: 'Medellín',
    ordenesCompletadas: 67,
    calificacion: 5.0,
    disponible: true,
  },
  {
    id: '5',
    nombre: 'Pedro Martínez',
    cargo: 'Técnico de Campo',
    especialidad: 'Mantenimiento Preventivo',
    certificaciones: ['Trabajo en Alturas'],
    telefono: '+57 304 567 8901',
    email: 'pedro.martinez@cermont.co',
    estado: 'inactivo',
    ubicacion: 'Cúcuta',
    ordenesCompletadas: 45,
    calificacion: 4.3,
    disponible: false,
  },
  {
    id: '6',
    nombre: 'Laura Sánchez',
    cargo: 'Técnico Senior',
    especialidad: 'Diagnóstico Eléctrico',
    certificaciones: ['Electricidad Industrial', 'Trabajo en Alturas', 'Bloqueo y Etiquetado'],
    telefono: '+57 305 678 9012',
    email: 'laura.sanchez@cermont.co',
    estado: 'activo',
    ubicacion: 'Bucaramanga',
    ordenesCompletadas: 178,
    calificacion: 4.9,
    disponible: true,
  },
];

interface PageProps {
  searchParams: Promise<{
    search?: string;
    disponible?: 'todos' | 'disponible' | 'ocupado';
    page?: string;
    estado?: string;
  }>;
}

// Función para simular fetch de datos
async function getTecnicos(filters: TecnicoFilters): Promise<PaginatedTecnicos> {
  // TODO: Reemplazar con fetch al backend
  // const response = await fetch(`${process.env.API_URL}/api/tecnicos?${params}`, {
  //   cache: 'no-store',
  //   next: { revalidate: 30, tags: ['tecnicos'] },
  // });
  
  let filteredData = [...mockTecnicos];

  // Aplicar filtro de búsqueda
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(
      (t) =>
        t.nombre.toLowerCase().includes(searchLower) ||
        t.especialidad.toLowerCase().includes(searchLower) ||
        t.ubicacion.toLowerCase().includes(searchLower)
    );
  }

  // Aplicar filtro de disponibilidad
  if (filters.disponible && filters.disponible !== 'todos') {
    const isDisponible = filters.disponible === 'disponible';
    filteredData = filteredData.filter((t) => t.disponible === isDisponible);
  }

  // Aplicar filtro de estado
  if (filters.estado) {
    filteredData = filteredData.filter((t) => t.estado === filters.estado);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredData.length / pageSize),
  };
}

async function getStats() {
  // TODO: Reemplazar con fetch al backend
  return calculateTecnicosStats(mockTecnicos);
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
