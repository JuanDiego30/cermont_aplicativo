/**
 * Archives API Service
 * Connects to backend /api/archives endpoints
 */

import apiClient from '@/core/api/client';
import type { ArchivedOrder, ArchiveFilters } from '../types';

export interface ArchiveListResponse {
    data: ArchivedOrder[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const archivesApi = {
    /**
     * Get paginated list of archived orders
     */
    list: async (filters?: ArchiveFilters): Promise<ArchiveListResponse> => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.month) params.append('month', filters.month);

        const queryString = params.toString();
        const url = queryString ? `/archives?${queryString}` : '/archives';
        const response = await apiClient.get<{ data: ArchiveListResponse }>(url);
        return response.data;
    },

    /**
     * Export archives for a specific month as ZIP
     */
    export: async (month: string): Promise<Blob> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/archives/export?month=${month}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Error al exportar archivo');
        }
        return response.blob();
    },

    /**
     * Trigger manual archiving of old orders
     */
    triggerArchive: async (): Promise<{ success: boolean; archivedCount: number }> => {
        return apiClient.post<{ success: boolean; archivedCount: number }>('/archives/trigger', {});
    },
};
