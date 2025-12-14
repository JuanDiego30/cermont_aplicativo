/**
 * @file client.tsx
 * @description Componentes client para evidencias
 */

'use client';

import { useState } from 'react';
import { Filter, Upload, Search, Camera } from 'lucide-react';
import { 
  useEvidencias, 
  EvidenciaCard,
  useUploadEvidencia,
  useDeleteEvidencia 
} from '@/features/evidencias';
import { toast } from 'sonner';

const TIPOS_EVIDENCIA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ANTES', label: 'Antes' },
  { value: 'DURANTE', label: 'Durante' },
  { value: 'DESPUES', label: 'Después' },
];

export function EvidenciasDashboard() {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  const { data, isLoading } = useEvidencias();
  const subirMutation = useUploadEvidencia();
  const eliminarMutation = useDeleteEvidencia();

  const evidencias = data?.data || [];
  
  const evidenciasFiltradas = evidencias.filter((e) => {
    if (filtroTipo && e.tipo !== filtroTipo) return false;
    if (busqueda && !e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Por ahora solo mostrar toast, la funcionalidad completa requiere modal de asignación
    toast.info(`${files.length} archivo(s) seleccionado(s). Se requiere asignar a una orden.`);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta evidencia?')) {
      eliminarMutation.mutate(id, {
        onSuccess: () => toast.success('Evidencia eliminada'),
        onError: () => toast.error('Error al eliminar'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando evidencias...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar evidencias..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
            >
              {TIPOS_EVIDENCIA.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón subir */}
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium cursor-pointer hover:bg-purple-700 transition-colors">
          <Upload className="w-4 h-4" />
          Subir Evidencia
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid de evidencias */}
      {evidenciasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500 mb-2">Sin evidencias</p>
          <p className="text-sm text-gray-400">
            {filtroTipo || busqueda 
              ? 'No hay evidencias que coincidan con los filtros' 
              : 'Sube fotografías de los trabajos realizados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {evidenciasFiltradas.map((evidencia) => (
            <EvidenciaCard
              key={evidencia.id}
              evidencia={evidencia}
              onDelete={() => handleDelete(evidencia.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
