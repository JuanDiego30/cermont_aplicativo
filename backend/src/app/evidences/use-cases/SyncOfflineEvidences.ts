/**
 * Use Case: Sincronizar evidencias offline
 * Resuelve: Sincronización de evidencias subidas en modo offline
 * 
 * @file backend/src/app/evidences/use-cases/SyncOfflineEvidences.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import { syncQueueService, SyncEntityType, SyncOperation } from '../../../infra/services/SyncQueueService';
import { logger } from '../../../shared/utils/logger';

/**
 * Evidencia pendiente de sincronizar
 */
export interface PendingEvidence {
  tempId: string;
  orderId: string;
  stage: string;
  type: string;
  fileName: string;
  fileData: Buffer;
  uploadedBy: string;
}

/**
 * Resultado de sincronización
 */
export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ tempId: string; error: string }>;
}

/**
 * Use Case: Sincronizar Evidencias Offline
 * @class SyncOfflineEvidences
 */
export class SyncOfflineEvidences {
  constructor(private readonly evidenceRepository: IEvidenceRepository) {}

  async execute(pendingEvidences: PendingEvidence[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    logger.info('[SyncOfflineEvidences] Iniciando sincronización', {
      count: pendingEvidences.length,
    });

    for (const pendingEvidence of pendingEvidences) {
      try {
        // Agregar a la cola de sincronización
        await syncQueueService.enqueue(
          SyncEntityType.EVIDENCE,
          pendingEvidence.tempId,
          SyncOperation.CREATE,
          {
            orderId: pendingEvidence.orderId,
            stage: pendingEvidence.stage,
            type: pendingEvidence.type,
            fileName: pendingEvidence.fileName,
            uploadedBy: pendingEvidence.uploadedBy,
          }
        );

        result.synced++;

        logger.info('[SyncOfflineEvidences] Evidencia encolada', {
          tempId: pendingEvidence.tempId,
          orderId: pendingEvidence.orderId,
        });
      } catch (error) {
        result.failed++;
        result.success = false;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        result.errors.push({
          tempId: pendingEvidence.tempId,
          error: errorMessage,
        });

        logger.error('[SyncOfflineEvidences] Error encolando evidencia', {
          tempId: pendingEvidence.tempId,
          error: errorMessage,
        });
      }
    }

    logger.info('[SyncOfflineEvidences] Sincronización completada', {
      synced: result.synced,
      failed: result.failed,
    });

    return result;
  }
}
