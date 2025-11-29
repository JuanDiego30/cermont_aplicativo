import apiClient from '@/core/api/client';

export interface CostBreakdownItem {
    id: string;
    workPlanId: string;
    category: string;
    description: string;
    estimatedAmount: number;
    actualAmount?: number;
    quantity: number;
    unitPrice?: number;
    taxRate: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CostSummary {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercent: number;
    byCategory: {
        [key: string]: {
            estimated: number;
            actual: number;
        };
    };
}

export const costBreakdownApi = {
    /**
     * Get all cost breakdown items for a WorkPlan
     */
    list: async (workPlanId: string): Promise<CostBreakdownItem[]> => {
        return apiClient.get<CostBreakdownItem[]>(`/work-plans/${workPlanId}/cost-breakdown`);
    },

    /**
     * Get cost summary for a WorkPlan
     */
    summary: async (workPlanId: string): Promise<CostSummary> => {
        return apiClient.get<CostSummary>(`/work-plans/${workPlanId}/cost-summary`);
    },

    /**
     * Create a cost breakdown item
     */
    create: async (
        workPlanId: string,
        data: Omit<CostBreakdownItem, 'id' | 'workPlanId' | 'createdAt' | 'updatedAt'>
    ): Promise<CostBreakdownItem> => {
        return apiClient.post<CostBreakdownItem>(`/work-plans/${workPlanId}/cost-breakdown`, data);
    },

    /**
     * Update a cost breakdown item
     */
    update: async (
        id: string,
        data: Partial<Omit<CostBreakdownItem, 'id' | 'workPlanId' | 'createdAt' | 'updatedAt'>>
    ): Promise<CostBreakdownItem> => {
        return apiClient.patch<CostBreakdownItem>(`/cost-breakdown/${id}`, data);
    },

    /**
     * Delete a cost breakdown item
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/cost-breakdown/${id}`);
    },
};
