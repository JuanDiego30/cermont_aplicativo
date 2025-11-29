/**
 * Enumeración de estados posibles para una evidencia
 * @enum {string}
 */
export enum EvidenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Tipos de evidencia soportados por el sistema
 * @enum {string}
 */
export enum EvidenceType {
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER',
}

/**
 * Coordenadas geográficas
 * Value Object para ubicación
 */
export interface GPSCoordinates {
  lat: number;
  lng: number;
}

/**
 * Metadatos técnicos extraídos del archivo
 */
export interface EvidenceMetadata {
  duration?: number; // Segundos (Video/Audio)
  width?: number;    // Pixeles (Foto/Video)
  height?: number;   // Pixeles (Foto/Video)
  mimeType?: string;
  checksum?: string; // Hash MD5/SHA-256 para integridad
  location?: string; // Dirección legible
  gps?: GPSCoordinates;
  deviceId?: string;
  capturedAt?: Date; // Fecha original de captura (EXIF)
}

/**
 * Entidad: Evidencia
 * Representa un archivo subido asociado a una orden de trabajo
 */
export interface Evidence {
  id: string;
  orderId: string;
  
  /** Etapa del flujo donde se subió (ej: 'technical_review') */
  stage: string; 
  
  type: EvidenceType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  
  status: EvidenceStatus;
  
  /** Control de versiones (1..N) */
  version: number;
  
  /** Historial de IDs de versiones previas */
  previousVersions: string[];
  
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  /** Fecha manual o de sistema de la captura */
  capturedAt?: Date;
  
  description?: string;
  
  /** Datos técnicos extra */
  metadata?: EvidenceMetadata;

  // --- Auditoría de aprobación ---
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;

  // --- Auditoría de rechazo ---
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}


