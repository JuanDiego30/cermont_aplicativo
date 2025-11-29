/**
 * Use Case: Sincronizar evidencias offline
 * Resuelve: Sincronización batch de evidencias subidas en modo offline
 * 
 * @file backend/src/app/evidences/use-cases/SyncOfflineEvidences.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { ISyncQueueService } from '../../../domain/services/ISyncQueueService.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { EvidenceStatus, EvidenceType } from '../../../domain/entities/Evidence.js';
import { logger } from '../../../shared/utils/logger.js';
import { generateUniqueId } from '../../../shared/utils/generateUniqueId.js';

const SYNC_CONFIG = {
  MAX_BATCH_SIZE: 50,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  CONCURRENT_UPLOADS: 5,
} as const;

const ERROR_MESSAGES = {
  EMPTY_BATCH: 'No hay evidencias para sincronizar',
  BATCH_TOO_LARGE: `El lote excede el tamaño máximo de ${SYNC_CONFIG.MAX_BATCH_SIZE} evidencias`,
  FILE_TOO_LARGE: (size: number) =>
    `Archivo excede el tamaño máximo de ${SYNC_CONFIG.MAX_FILE_SIZE} bytes (tamaño: ${size})`,
  INVALID_EVIDENCE: (field: string) => `Campo inválido: ${field}`,
  DUPLICATE_SYNC: (tempId: string) => `La evidencia ${tempId} ya fue sincronizada`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[SyncOfflineEvidencesUseCase]',
} as const;

interface PendingEvidence {
  tempId: string;
  orderId: string;
  stage: string;
  type: EvidenceType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileData: Buffer | string; // Buffer o base64 string
  uploadedBy: string;
  capturedAt?: Date;
  metadata?: Record<string, unknown>;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  total: number;
  syncedIds: string[]; // IDs reales de las evidencias creadas
  errors: Array<{
    tempId: string;
    error: string;
    code: string;
  }>;
}

interface SyncedEvidence {
  tempId: string;
  evidenceId: string;
  filePath: string;
}

export class SyncOfflineEvidencesUseCase {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly syncQueueService: ISyncQueueService,
    private readonly auditService: AuditService
  ) {}

  async execute(pendingEvidences: PendingEvidence[]): Promise<SyncResult> {
    this.validateBatch(pendingEvidences);

    logger.info(`${LOG_CONTEXT.USE_CASE} Iniciando sincronización`, {
      count: pendingEvidences.length,
    });

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      total: pendingEvidences.length,
      syncedIds: [],
      errors: [],
    };

    // Procesar en chunks para evitar sobrecarga
    const chunks = this.chunkArray(pendingEvidences, SYNC_CONFIG.CONCURRENT_UPLOADS);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map((evidence) => this.syncSingleEvidence(evidence))
      );

      this.processChunkResults(chunkResults, chunk, result);
    }

    await this.logSyncSummary(result);

    logger.info(`${LOG_CONTEXT.USE_CASE} Sincronización completada`, {
      synced: result.synced,
      failed: result.failed,
      successRate: `${((result.synced / result.total) * 100).toFixed(1)}%`,
    });

    return result;
  }

  private validateBatch(evidences: PendingEvidence[]): void {
    if (!evidences || evidences.length === 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_BATCH);
    }

    if (evidences.length > SYNC_CONFIG.MAX_BATCH_SIZE) {
      throw new Error(ERROR_MESSAGES.BATCH_TOO_LARGE);
    }

    // Validar cada evidencia
    for (const evidence of evidences) {
      this.validatePendingEvidence(evidence);
    }
  }

  private validatePendingEvidence(evidence: PendingEvidence): void {
    if (!evidence.tempId?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_EVIDENCE('tempId'));
    }

    if (!evidence.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_EVIDENCE('orderId'));
    }

    if (!evidence.uploadedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_EVIDENCE('uploadedBy'));
    }

    if (!evidence.fileName?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_EVIDENCE('fileName'));
    }

    if (evidence.fileSize > SYNC_CONFIG.MAX_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE(evidence.fileSize));
    }

    if (!evidence.fileData) {
      throw new Error(ERROR_MESSAGES.INVALID_EVIDENCE('fileData'));
    }
  }

  private async syncSingleEvidence(pending: PendingEvidence): Promise<SyncedEvidence> {
    // 1. Verificar duplicados
    await this.checkDuplicate(pending.tempId);

    // 2. Convertir fileData a Buffer si es necesario
    const fileBuffer = this.ensureBuffer(pending.fileData);

    // 3. Subir archivo a almacenamiento
    const filePath = await this.uploadFile(fileBuffer, pending);

    // 4. Crear registro en BD
    const evidenceId = await this.createEvidenceRecord(pending, filePath);

    // 5. Registrar en auditoría
    await this.logEvidenceCreation(evidenceId, pending);

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencia sincronizada`, {
      tempId: pending.tempId,
      evidenceId,
      orderId: pending.orderId,
    });

    return {
      tempId: pending.tempId,
      evidenceId,
      filePath,
    };
  }

  private async checkDuplicate(tempId: string): Promise<void> {
    const pending = await this.syncQueueService.getPending();
    const existing = pending.find(item => item.tempId === tempId);

    if (existing && existing.status === 'COMPLETED') {
      throw new Error(ERROR_MESSAGES.DUPLICATE_SYNC(tempId));
    }
  }

  private ensureBuffer(fileData: Buffer | string): Buffer {
    if (Buffer.isBuffer(fileData)) {
      return fileData;
    }

    // Convertir base64 string a Buffer
    return Buffer.from(fileData, 'base64');
  }

  private async uploadFile(buffer: Buffer, pending: PendingEvidence): Promise<string> {
    const fileName = `${pending.orderId}/${pending.stage}/${generateUniqueId()}_${pending.fileName}`;

    try {
      return await this.fileStorageService.upload(fileName, buffer, pending.mimeType);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error subiendo archivo`, {
        tempId: pending.tempId,
        fileName: pending.fileName,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async createEvidenceRecord(
    pending: PendingEvidence,
    filePath: string
  ): Promise<string> {
    const evidence = await this.evidenceRepository.create({
      orderId: pending.orderId,
      stage: pending.stage,
      type: pending.type,
      fileName: pending.fileName,
      mimeType: pending.mimeType,
      fileSize: pending.fileSize,
      filePath,
      status: EvidenceStatus.PENDING,
      version: 1,
      previousVersions: [],
      uploadedBy: pending.uploadedBy,
      metadata: {
        ...pending.metadata,
        capturedAt: pending.capturedAt,
      },
    });

    return evidence.id;
  }

  private async logEvidenceCreation(
    evidenceId: string,
    pending: PendingEvidence
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: evidenceId,
        action: AuditAction.UPLOAD_EVIDENCE,
        userId: pending.uploadedBy,
        before: null,
        after: {
          orderId: pending.orderId,
          stage: pending.stage,
          fileName: pending.fileName,
          syncedFromOffline: true,
        },
        ip: 'offline',
        userAgent: 'offline-client',
        reason: `Evidencia sincronizada desde modo offline (tempId: ${pending.tempId})`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        evidenceId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private processChunkResults(
    results: PromiseSettledResult<SyncedEvidence>[],
    chunk: PendingEvidence[],
    syncResult: SyncResult
  ): void {
    results.forEach((result, index) => {
      const pending = chunk[index];

      if (result.status === 'fulfilled') {
        syncResult.synced++;
        syncResult.syncedIds.push(result.value.evidenceId);
      } else {
        syncResult.failed++;
        syncResult.success = false;

        const errorMessage = result.reason instanceof Error 
          ? result.reason.message 
          : 'Error desconocido';

        syncResult.errors.push({
          tempId: pending.tempId,
          error: errorMessage,
          code: this.categorizeError(errorMessage),
        });

        logger.error(`${LOG_CONTEXT.USE_CASE} Error sincronizando evidencia`, {
          tempId: pending.tempId,
          orderId: pending.orderId,
          error: errorMessage,
        });
      }
    });
  }

  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('duplicada')) return 'DUPLICATE';
    if (errorMessage.includes('tamaño')) return 'FILE_TOO_LARGE';
    if (errorMessage.includes('inválido')) return 'INVALID_DATA';
    if (errorMessage.includes('no encontrado')) return 'NOT_FOUND';
    return 'SYNC_ERROR';
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async logSyncSummary(result: SyncResult): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'System',
        entityId: 'offline-sync',
        action: AuditAction.CREATE,
        userId: 'system',
        before: null,
        after: {
          total: result.total,
          synced: result.synced,
          failed: result.failed,
          syncedIds: result.syncedIds,
        },
        ip: 'system',
        userAgent: 'sync-service',
        reason: `Sincronización offline completada: ${result.synced}/${result.total} exitosas`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando resumen (no crítico)`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

