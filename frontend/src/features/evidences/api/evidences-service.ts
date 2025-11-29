/**
 * Evidences API Service
 */

import apiClient from '@/core/api/client';
import type { Evidence } from '../types';

interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
}

interface EvidencesListResponse {
  data?: Evidence[];
  evidences?: Evidence[];
}

interface EvidenceResponse {
  data?: Evidence;
  evidence?: Evidence;
}

export const evidencesApi = {
  listByOrder: async (orderId: string): Promise<Evidence[]> => {
    const response = await apiClient.get<EvidencesListResponse | Evidence[]>(`/evidences/order/${orderId}`);
    if (Array.isArray(response)) return response;
    return response.data ?? response.evidences ?? [];
  },

  getPresignedUploadUrl: async (params: {
    orderId: string;
    stage: string;
    type: string;
    fileName: string;
    mimeType: string;
  }): Promise<PresignedUploadResponse> => {
    return apiClient.post<PresignedUploadResponse>('/evidences/upload-url', params);
  },

  completeUpload: async (params: {
    orderId: string;
    stage: string;
    type: string;
    key: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    metadata?: Record<string, unknown>;
  }): Promise<Evidence> => {
    const response = await apiClient.post<EvidenceResponse | Evidence>('/evidences/complete', params);
    if ('id' in response) return response as Evidence;
    return response.data ?? response.evidence ?? response as Evidence;
  },

  approveEvidence: async (evidenceId: string): Promise<Evidence> => {
    const response = await apiClient.post<EvidenceResponse | Evidence>(`/evidences/${evidenceId}/approve`);
    if ('id' in response) return response as Evidence;
    return response.data ?? response.evidence ?? response as Evidence;
  },
};
