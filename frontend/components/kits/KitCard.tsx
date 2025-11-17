'use client';

import { useState } from 'react';
import type { Kit } from '@/lib/types/kit';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDeleteKit, useDuplicateKit } from '@/lib/hooks/useKits';

type KitCardProps = {
  kit: Kit;
  onEdit: (kit: Kit) => void;
  onView: (kit: Kit) => void;
};

const CATEGORY_COLORS = {
  ELECTRICIDAD: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
  INSTRUMENTACION: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  MECANICA: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  CIVIL: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  SEGURIDAD: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
} as const;

export function KitCard({ kit, onEdit, onView }: KitCardProps) {
  const deleteMutation = useDeleteKit();
  const duplicateMutation = useDuplicateKit();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(kit.id);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error al eliminar kit:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateMutation.mutateAsync(kit.id);
    } catch (error) {
      console.error('Error al duplicar kit:', error);
    }
  };

  const totalItems = kit.tools.length + kit.equipment.length + kit.documents.length;
  const requiredItems = [
    ...kit.tools.filter((t) => t.required),
    ...kit.equipment,
    ...kit.documents.filter((d) => d.required),
  ].length;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {kit.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {kit.description}
            </p>
          </div>
          <span
            className={`ml-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
              CATEGORY_COLORS[kit.category]
            }`}
          >
            {kit.category}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {kit.tools.length}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Herramientas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              {kit.equipment.length}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Equipos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
              {kit.documents.length}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Documentos</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span>Total: {totalItems} items</span>
          <span>�</span>
          <span>Requeridos: {requiredItems}</span>
          {!kit.active && (
            <>
              <span>�</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Inactivo</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <Button variant="primary" size="sm" onClick={() => onView(kit)} className="flex-1">
            Ver Detalles
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(kit)}>
            Editar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            title="Duplicar kit"
          >
            {duplicateMutation.isPending ? '?' : '??'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(true)}
            title="Eliminar kit"
          >
            ???
          </Button>
        </div>

        {/* Confirm Delete */}
        {showConfirm && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
              �Eliminar kit &quot;{kit.name}&quot;?
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Confirmar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

