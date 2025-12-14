/**
 * @file client.tsx
 * @description Componentes client para formularios
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search,
  LayoutGrid,
  List,
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { 
  usePlantillasFormulario,
  PlantillaCard,
  EstadoFormulario,
  ESTADO_FORMULARIO_CONFIG,
  PlantillaCardSkeleton,
} from '@/features/formularios';
import { 
  useDuplicarPlantilla, 
  useEliminarPlantilla,
  useCambiarEstadoPlantilla,
} from '@/features/formularios';
import { toast } from 'sonner';

export function FormulariosDashboard() {
  const router = useRouter();
  const [vista, setVista] = useState<'grid' | 'lista'>('grid');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFormulario | ''>('');

  const { data: plantillasData, isLoading } = usePlantillasFormulario({
    estado: filtroEstado || undefined,
    busqueda: busqueda || undefined,
  });

  const duplicarMutation = useDuplicarPlantilla();
  const eliminarMutation = useEliminarPlantilla();

  const plantillas = plantillasData?.data || [];

  // Stats
  const stats = {
    total: plantillas.length,
    activos: plantillas.filter(p => p.estado === 'ACTIVO').length,
    respuestasTotal: plantillas.reduce((acc, p) => acc + p.totalRespuestas, 0),
  };

  const handleDuplicate = (id: string) => {
    duplicarMutation.mutate(id, {
      onSuccess: () => toast.success('Formulario duplicado'),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este formulario? Esta acción no se puede deshacer.')) {
      eliminarMutation.mutate(id, {
        onSuccess: () => toast.success('Formulario eliminado'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Formularios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Respuestas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.respuestasTotal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar formulario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-64"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoFormulario | '')}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_FORMULARIO_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Toggle vista */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setVista('grid')}
              className={`p-2 ${vista === 'grid' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`p-2 ${vista === 'lista' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/formularios/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Formulario
        </button>
      </div>

      {/* Grid de plantillas */}
      {isLoading ? (
        <div className={vista === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <PlantillaCardSkeleton key={i} />
          ))}
        </div>
      ) : plantillas.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500 mb-2">Sin formularios</p>
          <p className="text-sm text-gray-400 mb-4">
            {busqueda || filtroEstado
              ? 'No hay formularios que coincidan con los filtros'
              : 'Crea tu primer formulario para comenzar'}
          </p>
          <button
            onClick={() => router.push('/dashboard/formularios/nuevo')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            <Plus className="w-4 h-4" />
            Crear Formulario
          </button>
        </div>
      ) : (
        <div className={vista === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {plantillas.map((plantilla) => (
            <PlantillaCard
              key={plantilla.id}
              plantilla={plantilla}
              onView={() => router.push(`/dashboard/formularios/${plantilla.id}`)}
              onEdit={() => router.push(`/dashboard/formularios/${plantilla.id}/editar`)}
              onDuplicate={() => handleDuplicate(plantilla.id)}
              onDelete={() => handleDelete(plantilla.id)}
              onStats={() => router.push(`/dashboard/formularios/${plantilla.id}/estadisticas`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
