'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costingApi } from '../api/costingApi';
import type { CostBreakdownItem } from '../types';

export function useCosting(workPlanId: string) {
    const queryClient = useQueryClient();

    const { data: items, isLoading: itemsLoading } = useQuery({
        queryKey: ['cost-breakdown', workPlanId],
        queryFn: () => costingApi.getByWorkPlan(workPlanId),
        enabled: !!workPlanId,
        refetchInterval: 15000, // Refetch cada 15s
    });

    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['cost-summary', workPlanId],
        queryFn: () => costingApi.getSummary(workPlanId),
        enabled: !!workPlanId,
        refetchInterval: 15000,
    });

    const createMutation = useMutation({
        mutationFn: (item: Partial<CostBreakdownItem>) => costingApi.create(workPlanId, item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-breakdown', workPlanId] });
            queryClient.invalidateQueries({ queryKey: ['cost-summary', workPlanId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<CostBreakdownItem> }) =>
            costingApi.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-breakdown', workPlanId] });
            queryClient.invalidateQueries({ queryKey: ['cost-summary', workPlanId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => costingApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-breakdown', workPlanId] });
            queryClient.invalidateQueries({ queryKey: ['cost-summary', workPlanId] });
        },
    });

    return {
        items,
        summary,
        isLoading: itemsLoading || summaryLoading,
        createItem: createMutation.mutate,
        updateItem: updateMutation.mutate,
        deleteItem: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
