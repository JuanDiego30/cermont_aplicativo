/**
 * Posibles estados de una evidencia
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
 */
export enum EvidenceType {
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER',
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

/**
 * Metadatos adicionales disponibles para ciertos formatos
 */
export interface EvidenceMetadata {
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  checksum?: string;
  location?: string;
  gps?: GPSCoordinates;
  deviceId?: string;
  capturedAt?: Date;
  [key: string]: unknown;
}

/**
 * Registro generado cada vez que un usuario sube una evidencia a una orden
 */
export interface Evidence extends Record<string, unknown> {
  /** ID único del recurso */
  id: string;

  /** Orden asociada */
  orderId: string;

  /** Etapa actual de flujo (por ejemplo, 'technical_review') */
  stage: string;

  /** Tipo de evidencia */
  type: EvidenceType;

  /** Nombre original del archivo */
  fileName: string;

  /** MIME type guardado */
  mimeType: string;

  /** Tamaño en bytes */
  fileSize: number;

  /** Ruta en almacenamiento */
  filePath: string;

  /** Estado del flujo de evidencias */
  status: EvidenceStatus;

  /** Versión actual del archivo */
  version: number;

  /** IDs de las versiones anteriores */
  previousVersions: string[];

  /** Usuario que cargó la evidencia */
  uploadedBy: string;

  /** Fecha de creación */
  createdAt: Date;

  /** Última actualización */
  updatedAt: Date;

  /** Metadatos dependientes del tipo de evidencia */
  metadata?: EvidenceMetadata;

  /** Usuario que aprobó */
  approvedBy?: string;

  /** Fecha de aprobación */
  approvedAt?: Date;

  /** Comentarios del aprobador */
  approvalComments?: string;

  /** Usuario que rechazó */
  rejectedBy?: string;

  /** Fecha de rechazo */
  rejectedAt?: Date;

  /** Motivo del rechazo */
  rejectionReason?: string;
}

