'use client';

/**
 * Component: EquipmentList
 * Lista de equipos certificados con filtros
 * 
 * @file frontend/src/features/equipment/components/EquipmentList.tsx
 */

import { useState } from 'react';
import { useEquipmentList, useDeleteEquipment } from '../hooks/useEquipment';
import type { EquipmentFilters, EquipmentCategory, EquipmentStatus } from '../types/equipment.types';
import { CATEGORY_LABELS, STATUS_CONFIG } from '../types/equipment.types';
import Badge from '@/shared/components/ui/badge/Badge';
import { Modal } from '@/shared/components/ui/modal';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/button';
import { 
  Wrench, 
  Shield, 
  Truck, 
  Gauge,
  Package,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const CATEGORY_ICONS: Record<EquipmentCategory, React.ComponentType<{ className?: string }>> = {
  TOOL: Wrench,
  EQUIPMENT: Package,
  PPE: Shield,
  VEHICLE: Truck,
  INSTRUMENT: Gauge,
};

interface EquipmentListProps {
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onAdd?: () => void;
}

export function EquipmentList({ onEdit, onView, onAdd }: EquipmentListProps) {
  const [filters, setFilters] = useState<EquipmentFilters>({ page: 1, limit: 20 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useEquipmentList(filters);
  const deleteMutation = useDeleteEquipment();

  const handleFilterChange = (key: keyof EquipmentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset page on filter change
    }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCertificationBadge = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return <Badge color="error">Vencida</Badge>;
    if (days <= 7) return <Badge color="error">Vence en {days} días</Badge>;
    if (days <= 15) return <Badge color="warning">Vence en {days} días</Badge>;
    if (days <= 30) return <Badge color="warning">Vence en {days} días</Badge>;
    return <Badge color="success">Vigente</Badge>;
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-red-600">Error al cargar equipos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Equipos Certificados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de herramientas y equipos con certificaciones
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, serial..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={filters.search || ''}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={filters.category || ''}
              onChange={e => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={filters.status || ''}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Ubicación..."
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={filters.location || ''}
              onChange={e => handleFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Equipment List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map(equipment => {
              const Icon = CATEGORY_ICONS[equipment.category];
              const statusConfig = STATUS_CONFIG[equipment.status];

              return (
                <Card key={equipment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {CATEGORY_LABELS[equipment.category]}
                        </p>
                      </div>
                    </div>
                    <Badge color={statusConfig.color as any}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Certificación:</span>
                      <span className="font-medium">{equipment.certification.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">N° Cert:</span>
                      <span className="font-medium">{equipment.certification.number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Estado Cert:</span>
                      {getCertificationBadge(equipment.certification.expiryDate)}
                    </div>
                    {equipment.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Serial:</span>
                        <span className="font-mono text-xs">{equipment.serialNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                    {onView && (
                      <button
                        onClick={() => onView(equipment.id)}
                        className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Eye className="mx-auto h-4 w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(equipment.id)}
                        className="flex-1 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <Edit className="mx-auto h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(equipment.id)}
                      className="flex-1 rounded-lg bg-red-100 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={data.meta.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {data.meta.page} de {data.meta.totalPages}
              </span>
              <button
                disabled={data.meta.page >= data.meta.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmar eliminación
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas retirar este equipo? Esta acción lo marcará como retirado.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EquipmentList;
