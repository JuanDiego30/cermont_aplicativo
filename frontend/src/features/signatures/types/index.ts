/**
 * Digital Signature Types
 * For work orders and delivery certificates
 */

export interface SignatureData {
  id: string;
  dataUrl: string; // Base64 PNG image
  signedAt: Date;
  signedBy: {
    id: string;
    name: string;
    role: string;
    document?: string; // Cedula/ID
  };
  metadata: {
    width: number;
    height: number;
    deviceInfo?: string;
    ipAddress?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SignatureRequest {
  entityType: 'order' | 'workplan' | 'acta' | 'evidence';
  entityId: string;
  signatureType: 'technician' | 'supervisor' | 'client' | 'witness';
  signedBy: {
    name: string;
    document?: string;
    role: string;
  };
}

export interface SignedDocument {
  id: string;
  entityType: string;
  entityId: string;
  signatures: SignatureData[];
  status: 'pending' | 'partial' | 'complete';
  requiredSignatures: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface SignatureValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
