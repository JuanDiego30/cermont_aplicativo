// src/features/workplans/hooks/useCreateWorkPlan.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkPlan } from '../services/workplans.service';
import type { WorkPlan } from '@/types/workplan.types';
import type { CreateWorkPlanFormData } from '../schemas/workplan.schema';

export const useCreateWorkPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<WorkPlan, Error, CreateWorkPlanFormData>({
    mutationFn: createWorkPlan,
    onSuccess: (data) => {
      // Invalidar y refetch de la lista de workplans
      queryClient.invalidateQueries({ queryKey: ['workplans'] });
      // También invalidar queries relacionadas con orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('WorkPlan created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating workplan:', error);
      // El error será manejado por el componente que use este hook
    },
  });
};