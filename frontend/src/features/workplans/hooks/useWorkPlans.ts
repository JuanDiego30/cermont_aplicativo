'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workplansApi } from '../api';
import type { CreateWorkPlanDTO, UpdateWorkPlanDTO, ApproveWorkPlanDTO, RejectWorkPlanDTO, UpdateBudgetDTO } from '../types';

const WORKPLANS_QUERY_KEY = 'workplans';

export function useWorkPlans(filters?: { orderId?: string; status?: string }) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, filters],
    queryFn: () => workplansApi.getAll(filters),
  });
}

export function useWorkPlan(id: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, id],
    queryFn: () => workplansApi.getById(id),
    enabled: !!id,
  });
}

export function useWorkPlanByOrder(orderId: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, 'order', orderId],
    queryFn: () => workplansApi.getByOrderId(orderId),
    enabled: !!orderId,
  });
}

export function useCreateWorkPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkPlanDTO) => workplansApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] }); },
  });
}

export function useUpdateWorkPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkPlanDTO }) => workplansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteWorkPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workplansApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] }); },
  });
}

export function useApproveWorkPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveWorkPlanDTO }) => workplansApi.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

export function useRejectWorkPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectWorkPlanDTO }) => workplansApi.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDTO }) => workplansApi.updateBudget(id, data),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] }); },
  });
}

export function useBudgetComparison(id: string) {
  return useQuery({
    queryKey: [WORKPLANS_QUERY_KEY, id, 'budget-comparison'],
    queryFn: () => workplansApi.getBudgetComparison(id),
    enabled: !!id,
  });
}

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

export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId, completed, notes }: { id: string; itemId: string; completed: boolean; notes?: string }) =>
      workplansApi.completeChecklistItem(id, itemId, completed, notes),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: [WORKPLANS_QUERY_KEY, variables.id] }); },
  });
}
