/**
 * Hooks para Reportes y Generación de PDFs
 * 
 * @file frontend/src/features/reports/hooks/useReports.ts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateActivityReport,
  generateActaEntrega,
  generateSESReport,
  generateCostsReport,
  generateDashboardReport,
  getPendingActas,
  type PendingActasResponse,
} from '../api/reports-service';

// ==========================================
// Query Keys
// ==========================================

export const reportsKeys = {
  all: ['reports'] as const,
  pendingActas: () => [...reportsKeys.all, 'pending-actas'] as const,
};

// ==========================================
// Hooks
// ==========================================

/**
 * Hook para generar informe de actividad
 */
export function useGenerateActivityReport() {
  return useMutation({
    mutationFn: generateActivityReport,
  });
}

/**
 * Hook para generar acta de entrega
 */
export function useGenerateActaEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: generateActaEntrega,
    onSuccess: () => {
      // Invalidar lista de actas pendientes
      queryClient.invalidateQueries({ queryKey: reportsKeys.pendingActas() });
    },
  });
}

/**
 * Hook para generar formato SES
 */
export function useGenerateSESReport() {
  return useMutation({
    mutationFn: generateSESReport,
  });
}

/**
 * Hook para generar reporte de costos
 */
export function useGenerateCostsReport() {
  return useMutation({
    mutationFn: generateCostsReport,
  });
}

/**
 * Hook para generar reporte del dashboard
 */
export function useGenerateDashboardReport() {
  return useMutation({
    mutationFn: generateDashboardReport,
  });
}

/**
 * Hook para obtener actas de entrega pendientes
 */
export function usePendingActas() {
  return useQuery<PendingActasResponse>({
    queryKey: reportsKeys.pendingActas(),
    queryFn: getPendingActas,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Refrescar cada 10 minutos
  });
}

// ==========================================
// Composite Hooks
// ==========================================

/**
 * Hook combinado para acciones de reportes de orden
 */
export function useOrderReports(orderId: string) {
  const activityMutation = useGenerateActivityReport();
  const actaMutation = useGenerateActaEntrega();
  const sesMutation = useGenerateSESReport();
  
  return {
    generateActivity: () => activityMutation.mutate(orderId),
    generateActa: () => actaMutation.mutate(orderId),
    generateSES: () => sesMutation.mutate(orderId),
    isGeneratingActivity: activityMutation.isPending,
    isGeneratingActa: actaMutation.isPending,
    isGeneratingSES: sesMutation.isPending,
    isGenerating: activityMutation.isPending || actaMutation.isPending || sesMutation.isPending,
  };
}

/**
 * Hook combinado para acciones de reportes de plan de trabajo
 */
export function useWorkPlanReports(workPlanId: string) {
  const costsMutation = useGenerateCostsReport();
  
  return {
    generateCosts: () => costsMutation.mutate(workPlanId),
    isGeneratingCosts: costsMutation.isPending,
  };
}
