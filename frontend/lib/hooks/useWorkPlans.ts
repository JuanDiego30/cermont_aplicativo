import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workplansApi } from '@/lib/api/workplans';
import type {
  WorkPlan,
  CreateWorkPlanDTO,
  UpdateWorkPlanDTO,
  ApproveWorkPlanDTO,
  RejectWorkPlanDTO,
  UpdateBudgetDTO,
} from '@/lib/types/workplan';

const WORKPLANS_QUERY_KEY = 'workplans';

/**
 * Hook para obtener todos los planes de trabajo
 */
export function useWorkPlans(filters?: { orderId?: string; status?: string }) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, filters],
    queryFn: () => workplansApi.getAll(filters),
  });
}

/**
 * Hook para obtener un plan espec�fico
 */
export function useWorkPlan(id: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, id],
    queryFn: () => workplansApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener plan por orden
 */
export function useWorkPlanByOrder(orderId: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, 'order', orderId],
    queryFn: () => workplansApi.getByOrderId(orderId),
    enabled: !!orderId,
  });
}

/**
 * Hook para crear plan
 */
export function useCreateWorkPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkPlanDTO) => workplansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para actualizar plan
 */
export function useUpdateWorkPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkPlanDTO }) =>
      workplansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para eliminar plan
 */
export function useDeleteWorkPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workplansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para aprobar plan
 */
export function useApproveWorkPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveWorkPlanDTO }) =>
      workplansApi.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para rechazar plan
 */
export function useRejectWorkPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectWorkPlanDTO }) =>
      workplansApi.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para actualizar presupuesto
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDTO }) =>
      workplansApi.updateBudget(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para comparaci�n de presupuesto
 */
export function useBudgetComparison(id: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, id, 'budget-comparison'],
    queryFn: () => workplansApi.getBudgetComparison(id),
    enabled: !!id,
  });
}

/**
 * Hook para exportar a PDF
 */
export function useExportWorkPlanPdf() {
  return useMutation({
    mutationFn: (id: string) => workplansApi.exportToPdf(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workplan-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

/**
 * Hook para completar item de checklist
 */
export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      itemId,
      completed,
      notes,
    }: {
      id: string;
      itemId: string;
      completed: boolean;
      notes?: string;
    }) => workplansApi.completeChecklistItem(id, itemId, completed, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

