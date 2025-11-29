/**
 * Use Case: Subir evidencia
 * Resuelve: Validación, almacenamiento y registro de evidencias
 * 
 * @file backend/src/app/evidences/use-cases/UploadEvidence.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import { EvidenceStatus, EvidenceType } from '../../../domain/entities/Evidence.js';
import type { Evidence, EvidenceMetadata, GPSCoordinates } from '../../../domain/entities/Evidence.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import { generateUniqueId } from '../../../shared/utils/generateUniqueId.js';

const FILE_LIMITS = {
  MAX_SIZE_PHOTO: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_VIDEO: 500 * 1024 * 1024, // 500MB
  MAX_SIZE_DOCUMENT: 50 * 1024 * 1024, // 50MB
  MAX_SIZE_AUDIO: 50 * 1024 * 1024, // 50MB
  MAX_SIZE_OTHER: 100 * 1024 * 1024, // 100MB
  MAX_METADATA_SIZE: 10 * 1024, // 10KB
} as const;

const ALLOWED_MIME_TYPES: Record<EvidenceType, readonly string[]> = {
  [EvidenceType.PHOTO]: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
  [EvidenceType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  [EvidenceType.DOCUMENT]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  [EvidenceType.AUDIO]: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  [EvidenceType.OTHER]: [], // Permitir cualquier tipo
} as const;

const GPS_LIMITS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_STAGE: 'La etapa es requerida',
  MISSING_FILE: 'El archivo es requerido',
  MISSING_UPLOADED_BY: 'El ID del usuario es requerido',
  INVALID_TYPE: (validTypes: string[]) =>
    `Tipo de evidencia inválido. Tipos válidos: ${validTypes.join(', ')}`,
  INVALID_FILE_SIZE: 'El tamaño del archivo debe ser un número positivo',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  FILE_TOO_LARGE: (sizeMB: number, maxMB: number) =>
    `El archivo (${sizeMB}MB) excede el tamaño máximo de ${maxMB}MB para este tipo`,
  INVALID_FILE_TYPE: (type: EvidenceType, allowed: string[]) =>
    `Tipo de archivo no permitido para ${type}. Tipos válidos: ${allowed.join(', ')}`,
  INVALID_GPS_LAT: `Latitud inválida. Debe estar entre ${GPS_LIMITS.LAT_MIN} y ${GPS_LIMITS.LAT_MAX}`,
  INVALID_GPS_LNG: `Longitud inválida. Debe estar entre ${GPS_LIMITS.LNG_MIN} y ${GPS_LIMITS.LNG_MAX}`,
  METADATA_TOO_LARGE: `Los metadatos exceden el tamaño máximo de ${FILE_LIMITS.MAX_METADATA_SIZE} bytes`,
  INVALID_FILE_EXTENSION: (fileName: string, mimeType: string) =>
    `La extensión del archivo "${fileName}" no coincide con el tipo MIME "${mimeType}"`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UploadEvidenceUseCase]',
} as const;

interface UploadEvidenceInput {
  orderId: string;
  stage: string;
  type: EvidenceType;
  file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
  };
  uploadedBy: string;
  metadata?: EvidenceMetadata;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class UploadEvidenceUseCase {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: UploadEvidenceInput): Promise<Evidence> {
    this.validateInput(input);

    await this.validateOrder(input.orderId);

    const filePath = await this.uploadFile(input);
    const evidence = await this.createEvidenceRecord(input, filePath);

    const auditContext = this.extractAuditContext(input);
    await this.logUploadEvent(evidence, input.uploadedBy, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencia subida exitosamente`, {
      evidenceId: evidence.id,
      orderId: input.orderId,
      uploadedBy: input.uploadedBy,
      type: input.type,
      fileSize: input.file.size,
    });

    return evidence;
  }

  private validateInput(input: UploadEvidenceInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.stage?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_STAGE);
    }

    if (!input.uploadedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_UPLOADED_BY);
    }

    if (!input.file || !input.file.buffer) {
      throw new Error(ERROR_MESSAGES.MISSING_FILE);
    }

    this.validateEvidenceType(input.type);
    this.validateFile(input.file, input.type);

    if (input.metadata) {
      this.validateMetadata(input.metadata);
    }
  }

  private validateEvidenceType(type: EvidenceType): void {
    const validTypes = Object.values(EvidenceType);
    if (!validTypes.includes(type)) {
      throw new Error(ERROR_MESSAGES.INVALID_TYPE(validTypes));
    }
  }

  private validateFile(
    file: { buffer: Buffer; originalName: string; mimeType: string; size: number },
    type: EvidenceType
  ): void {
    // Validar tamaño
    if (typeof file.size !== 'number' || file.size <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_SIZE);
    }

    const maxSize = this.getMaxFileSizeForType(type);
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE(Number(sizeMB), Number(maxMB)));
    }

    // Validar MIME type
    const normalizedMimeType = file.mimeType.trim().toLowerCase();
    this.validateMimeType(normalizedMimeType, type);

    // Validar extensión coincida con MIME type
    this.validateFileExtension(file.originalName, normalizedMimeType);
  }

  private getMaxFileSizeForType(type: EvidenceType): number {
    switch (type) {
      case EvidenceType.PHOTO:
        return FILE_LIMITS.MAX_SIZE_PHOTO;
      case EvidenceType.VIDEO:
        return FILE_LIMITS.MAX_SIZE_VIDEO;
      case EvidenceType.DOCUMENT:
        return FILE_LIMITS.MAX_SIZE_DOCUMENT;
      case EvidenceType.AUDIO:
        return FILE_LIMITS.MAX_SIZE_AUDIO;
      case EvidenceType.OTHER:
        return FILE_LIMITS.MAX_SIZE_OTHER;
      default:
        return FILE_LIMITS.MAX_SIZE_OTHER;
    }
  }

  private validateMimeType(mimeType: string, type: EvidenceType): void {
    const allowedTypes = ALLOWED_MIME_TYPES[type];

    // OTHER permite cualquier tipo
    if (type === EvidenceType.OTHER && allowedTypes.length === 0) {
      return;
    }

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE(type, allowedTypes as string[]));
    }
  }

  private validateFileExtension(fileName: string, mimeType: string): void {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return;

    const mimeToExtension: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    };

    const expectedExtensions = mimeToExtension[mimeType];
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_EXTENSION(fileName, mimeType));
    }
  }

  private validateMetadata(metadata: EvidenceMetadata): void {
    // Validar tamaño de metadata
    const metadataSize = JSON.stringify(metadata).length;
    if (metadataSize > FILE_LIMITS.MAX_METADATA_SIZE) {
      throw new Error(ERROR_MESSAGES.METADATA_TOO_LARGE);
    }

    // Validar GPS si existe
    if (metadata.gps) {
      this.validateGPS(metadata.gps);
    }
  }

  private validateGPS(gps: GPSCoordinates): void {
    if (
      typeof gps.lat !== 'number' ||
      gps.lat < GPS_LIMITS.LAT_MIN ||
      gps.lat > GPS_LIMITS.LAT_MAX
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_GPS_LAT);
    }

    if (
      typeof gps.lng !== 'number' ||
      gps.lng < GPS_LIMITS.LNG_MIN ||
      gps.lng > GPS_LIMITS.LNG_MAX
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_GPS_LNG);
    }
  }

  private async validateOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden no encontrada`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }
  }

  private async uploadFile(input: UploadEvidenceInput): Promise<string> {
    const fileName = this.generateFileName(input);

    try {
      return await this.fileStorageService.upload(fileName, input.file.buffer, input.file.mimeType);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error subiendo archivo`, {
        orderId: input.orderId,
        fileName: input.file.originalName,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private generateFileName(input: UploadEvidenceInput): string {
    const uniqueId = generateUniqueId();
    const sanitizedName = this.sanitizeFileName(input.file.originalName);
    return `${input.orderId}/${input.stage}/${uniqueId}_${sanitizedName}`;
  }

  private sanitizeFileName(fileName: string): string {
    // Remover caracteres especiales peligrosos
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  private async createEvidenceRecord(
    input: UploadEvidenceInput,
    filePath: string
  ): Promise<Evidence> {
    try {
      return await this.evidenceRepository.create({
        orderId: input.orderId,
        stage: input.stage.trim(),
        type: input.type,
        fileName: input.file.originalName.trim(),
        filePath,
        fileSize: input.file.size,
        mimeType: input.file.mimeType.trim().toLowerCase(),
        status: EvidenceStatus.PENDING,
        uploadedBy: input.uploadedBy,
        version: 1,
        previousVersions: [],
        metadata: {
          ...input.metadata,
        },
        capturedAt: new Date(),
      });
    } catch (error) {
      // Si falla crear el registro, intentar eliminar el archivo subido
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error creando registro, limpiando archivo`, {
        filePath,
      });

      try {
        await this.fileStorageService.delete(filePath);
      } catch (cleanupError) {
        logger.error(`${LOG_CONTEXT.USE_CASE} Error limpiando archivo huérfano`, {
          filePath,
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown',
        });
      }

      throw error;
    }
  }

  private extractAuditContext(input: UploadEvidenceInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logUploadEvent(
    evidence: Evidence,
    uploadedBy: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: evidence.id,
        action: AuditAction.UPLOAD_EVIDENCE,
        userId: uploadedBy,
        before: null, // No hay estado anterior en un create
        after: {
          orderId: evidence.orderId,
          stage: evidence.stage,
          type: evidence.type,
          fileName: evidence.fileName,
          fileSize: evidence.fileSize,
          status: evidence.status,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Evidencia tipo ${evidence.type} subida`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        evidenceId: evidence.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}





