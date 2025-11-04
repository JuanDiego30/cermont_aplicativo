import apiClient from '../lib/api/client';
export const workplansService = {
    async createWorkPlan(data) {
        const { data: response } = await apiClient.post('/workplans', data);
        return response.data;
    },
    async getWorkPlans(filters, cursor, limit = 10) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        if (cursor)
            params.append('cursor', cursor);
        params.append('limit', limit.toString());
        const { data } = await apiClient.get(`/workplans?${params}`);
        return data.data;
    },
    async getWorkPlanById(id) {
        const { data } = await apiClient.get(`/workplans/${id}`);
        return data.data;
    },
    async updateWorkPlan(id, data) {
        const { data: response } = await apiClient.put(`/workplans/${id}`, data);
        return response.data;
    },
    async deleteWorkPlan(id) {
        await apiClient.delete(`/workplans/${id}`);
    },
    async approveWorkPlan(id, comentarios) {
        const { data } = await apiClient.post(`/workplans/${id}/approve`, { comentarios });
        return data.data;
    },
};
export const createWorkPlan = workplansService.createWorkPlan;
export const getWorkPlans = workplansService.getWorkPlans;
export const getWorkPlanById = workplansService.getWorkPlanById;
//# sourceMappingURL=workplans.service.js.map