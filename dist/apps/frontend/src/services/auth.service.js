import apiClient from '@/lib/api/client';
export const authService = {
    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data.data;
    },
    async forgotPassword(email) {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data.data;
    },
    async logout() {
        try {
            await apiClient.post('/auth/logout');
        }
        catch (error) {
            console.error('Error en logout:', error);
        }
        finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },
    async getCurrentUser() {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
    },
    async refreshToken(refreshToken) {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data.data;
    },
};
//# sourceMappingURL=auth.service.js.map