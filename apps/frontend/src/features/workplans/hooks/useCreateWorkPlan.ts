// src/features/workplans/hooks/useCreateWorkPlan.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkPlan } from '../services/workplans.service';
import type { CreateWorkPlanData, WorkPlan } from '@/types/workplan.types';

export const useCreateWorkPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<WorkPlan, Error, CreateWorkPlanData>({
    mutationFn: createWorkPlan,
    onSuccess: () => {
      // Invalidar y refetch de la lista de workplans
      queryClient.invalidateQueries({ queryKey: ['workplans'] });
    },
    onError: (error) => {
      console.error('Error creating workplan:', error);
      // El error será manejado por el componente que use este hook
    },
  });
};