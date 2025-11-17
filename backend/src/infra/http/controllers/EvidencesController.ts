/**
 * Controller de Evidencias - NUEVO
 * Usa Use Cases para gesti�n completa de evidencias
 * 
 * @file backend/src/infra/http/controllers/EvidencesController.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { UploadEvidence } from '../../../app/evidences/use-cases/UploadEvidence';
import { ApproveEvidence } from '../../../app/evidences/use-cases/ApproveEvidence';
import { RejectEvidence } from '../../../app/evidences/use-cases/RejectEvidence';
import { GetEvidencesByOrder } from '../../../app/evidences/use-cases/GetEvidencesByOrder';
import { DeleteEvidence } from '../../../app/evidences/use-cases/DeleteEvidence';
import { SyncOfflineEvidences } from '../../../app/evidences/use-cases/SyncOfflineEvidences';
import { evidenceRepository } from '../../db/repositories/EvidenceRepository';
import { orderRepository } from '../../db/repositories/OrderRepository';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository';
import { AuditService } from '../../../domain/services/AuditService';

/**
 * Controller de evidencias
 * @class EvidencesController
 */
export class EvidencesController {
  /**
   * Subir evidencia
   * POST /api/evidences
   */
  static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      const uploadUseCase = new UploadEvidence(
        evidenceRepository,
        orderRepository
      );

      const evidence = await uploadUseCase.execute({
        ...req.body,
        uploadedBy: userId,
      });

      res.status(201).json({
        success: true,
        data: evidence,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprobar evidencia
   * POST /api/evidences/:id/approve
   */
  static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      const approveUseCase = new ApproveEvidence(
        evidenceRepository
      );

      await approveUseCase.execute({
        evidenceId: id,
        approvedBy: userId,
        comments: req.body.comments,
      });

      res.json({
        success: true,
        message: 'Evidencia aprobada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rechazar evidencia
   * POST /api/evidences/:id/reject
   */
  static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      if (!reason) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Raz�n de rechazo requerida',
        });
        return;
      }

      const rejectUseCase = new RejectEvidence(
        evidenceRepository,
        new AuditService(auditLogRepository)
      );

      await rejectUseCase.execute({
        evidenceId: id,
        rejectedBy: userId,
        reason,
      });

      res.json({
        success: true,
        message: 'Evidencia rechazada',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener evidencias por orden
   * GET /api/evidences/order/:orderId
   */
  static async getByOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const stage = req.query.stage as string | undefined;
      const status = req.query.status as string | undefined;

      const getByOrderUseCase = new GetEvidencesByOrder(evidenceRepository);

      const evidences = await getByOrderUseCase.execute({
        orderId,
        stage,
        status,
      });

      res.json({
        success: true,
        data: evidences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar evidencia
   * DELETE /api/evidences/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      if (!reason) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Raz�n de eliminaci�n requerida',
        });
        return;
      }

      const deleteUseCase = new DeleteEvidence(
        evidenceRepository,
        new AuditService(auditLogRepository)
      );

      await deleteUseCase.execute({
        evidenceId: id,
        deletedBy: userId,
        reason,
      });

      res.json({
        success: true,
        message: 'Evidencia eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sincronizar evidencias offline
   * POST /api/evidences/sync
   */
  static async syncOffline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pendingEvidences } = req.body;

      if (!Array.isArray(pendingEvidences)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'pendingEvidences debe ser un array',
        });
        return;
      }

      const syncUseCase = new SyncOfflineEvidences(evidenceRepository);

      const result = await syncUseCase.execute(pendingEvidences);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
