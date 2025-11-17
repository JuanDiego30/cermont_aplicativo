import apiClient from '@/lib/api/client';
import type { Evidence } from '@/lib/types/evidence';

interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
}

export const evidencesApi = {
  async listByOrder(orderId: string): Promise<Evidence[]> {
    const { data } = await apiClient.get('/evidences', {
      params: { orderId },
    });

    return data?.data ?? data?.evidences ?? [];
  },

  async getPresignedUploadUrl(params: {
    orderId: string;
    stage: string;
    type: string;
    fileName: string;
    mimeType: string;
  }): Promise<PresignedUploadResponse> {
    const { data } = await apiClient.post('/evidences/upload-url', params);
    const payload = data?.data ?? data;
    return {
      uploadUrl: payload.uploadUrl,
      key: payload.key,
    };
  },

  async completeUpload(params: {
    orderId: string;
    stage: string;
    type: string;
    key: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    metadata?: Record<string, unknown>;
  }): Promise<Evidence> {
    const { data } = await apiClient.post('/evidences/complete', params);
    const payload = data?.data ?? data;
    return payload.evidence ?? payload;
  },

  async approveEvidence(evidenceId: string): Promise<Evidence> {
    const { data } = await apiClient.post(
      `/evidences/${evidenceId}/approve`,
    );
    const payload = data?.data ?? data;
    return payload.evidence ?? payload;
  },
};
