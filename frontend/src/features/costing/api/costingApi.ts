import apiClient from '@/core/api/client';
import type { CostBreakdownItem, CostSummary } from '../types';

export const costingApi = {
    // GET /api/work-plans/:id/cost-breakdown
    getByWorkPlan: async (workPlanId: string): Promise<CostBreakdownItem[]> => {
        return apiClient.get<CostBreakdownItem[]>(
            `/work-plans/${workPlanId}/cost-breakdown`
        );
    },

    // GET /api/work-plans/:id/cost-summary
    getSummary: async (workPlanId: string): Promise<CostSummary> => {
        return apiClient.get<CostSummary>(
            `/work-plans/${workPlanId}/cost-summary`
        );
    },

    // POST /api/work-plans/:id/cost-breakdown
    create: async (workPlanId: string, item: Partial<CostBreakdownItem>): Promise<CostBreakdownItem> => {
        return apiClient.post<CostBreakdownItem>(
            `/work-plans/${workPlanId}/cost-breakdown`,
            item
        );
    },

    // PATCH /api/cost-breakdown/:id
    update: async (id: string, updates: Partial<CostBreakdownItem>): Promise<CostBreakdownItem> => {
        return apiClient.patch<CostBreakdownItem>(
            `/cost-breakdown/${id}`,
            updates
        );
    },

    // DELETE /api/cost-breakdown/:id
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/cost-breakdown/${id}`);
    },
};
