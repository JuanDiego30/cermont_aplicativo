import apiClient from '@/core/api/client';
import type { SignatureData, SignatureRequest, SignedDocument } from '../types';

const API_BASE = '/api/signatures';

export const signaturesApi = {
  /**
   * Upload a signature for a document
   */
  async uploadSignature(
    request: SignatureRequest,
    signatureDataUrl: string
  ): Promise<SignatureData> {
    const response = await apiClient.post(`${API_BASE}`, {
      ...request,
      signatureDataUrl,
      signedAt: new Date().toISOString(),
    });
    return response;
  },

  /**
   * Get all signatures for a document
   */
  async getSignatures(
    entityType: string,
    entityId: string
  ): Promise<SignedDocument | null> {
    try {
      const response = await apiClient.get(
        `${API_BASE}/${entityType}/${entityId}`
      );
      return response;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get signature image by ID
   */
  async getSignatureImage(signatureId: string): Promise<string> {
    const response = await apiClient.get(`${API_BASE}/${signatureId}/image`);
    return response.dataUrl;
  },

  /**
   * Validate a signature
   */
  async validateSignature(signatureId: string): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const response = await apiClient.get(`${API_BASE}/${signatureId}/validate`);
    return response;
  },

  /**
   * Delete a signature (before document is finalized)
   */
  async deleteSignature(signatureId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/${signatureId}`);
  },

  /**
   * Finalize document with all signatures
   */
  async finalizeDocument(
    entityType: string,
    entityId: string
  ): Promise<SignedDocument> {
    const response = await apiClient.post(
      `${API_BASE}/${entityType}/${entityId}/finalize`
    );
    return response;
  },

  /**
   * Get pending signatures for current user
   */
  async getPendingSignatures(): Promise<SignedDocument[]> {
    const response = await apiClient.get(`${API_BASE}/pending`);
    return response;
  },
};

export default signaturesApi;
