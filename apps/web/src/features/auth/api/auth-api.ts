import { apiClient, ApiError } from '@/lib/api-client';
import { User } from '@/types/user';

export const authApi = {
    logout: async (): Promise<void> => {
        return apiClient.post('/auth/logout');
    },

    // Future methods: login, register, etc.
    // For now migrating what is used in authStore
};
