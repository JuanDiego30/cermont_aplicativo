/**
 * Evidence Types
 */

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Evidence {
  id: string;
  orderId: string;
  stage: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: EvidenceStatus;
  version: number;
  previousVersions: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
