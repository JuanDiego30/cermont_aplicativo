import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkPlan } from '../services/workplans.service';
export const useCreateWorkPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkPlan,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workplans'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            console.log('WorkPlan created successfully:', data);
        },
        onError: (error) => {
            console.error('Error creating workplan:', error);
        },
    });
};
//# sourceMappingURL=useCreateWorkPlan.js.map