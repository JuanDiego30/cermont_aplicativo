import { useQuery } from '@tanstack/react-query';
import { getWorkPlans } from '../services/workplans.service';
export const useWorkPlans = (filters, cursor, limit = 10) => {
    return useQuery({
        queryKey: ['workplans', filters, cursor, limit],
        queryFn: () => getWorkPlans(filters, cursor, limit),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error.message.includes('4')) {
                return false;
            }
            return failureCount < 3;
        },
    });
};
//# sourceMappingURL=useWorkPlans.js.map