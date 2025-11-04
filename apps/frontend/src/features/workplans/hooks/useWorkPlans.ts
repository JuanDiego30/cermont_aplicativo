// src/features/workplans/hooks/useWorkPlans.ts
import { useQuery } from '@tanstack/react-query';
import { getWorkPlans } from '../services/workplans.service';
import type { WorkPlanFilters, WorkPlansResponse } from '@/types/workplan.types';

export const useWorkPlans = (filters?: WorkPlanFilters, cursor?: string, limit = 10) => {
  return useQuery<WorkPlansResponse, Error>({
    queryKey: ['workplans', filters, cursor, limit],
    queryFn: () => getWorkPlans(filters, cursor, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};