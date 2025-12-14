/**
 * @deprecated Este hook está deprecado. Usa los hooks de @/features/ordenes/hooks/use-ordenes
 * 
 * Este archivo se mantiene por compatibilidad hacia atrás.
 * 
 * Migración:
 * - import { useOrdenes } from '@/hooks/useOrdenes'
 * + import { useOrdenes } from '@/features/ordenes/hooks/use-ordenes'
 */
'use client';

// Re-export desde el hook canónico
export { 
  useOrdenes, 
  useOrden,
  useCreateOrden,
  useUpdateOrden,
  useDeleteOrden,
  useChangeOrdenEstado,
  useOrdenesStats,
  ordenesKeys 
} from '@/features/ordenes/hooks/use-ordenes';

