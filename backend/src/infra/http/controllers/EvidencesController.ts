import type { Request, Response, NextFunction } from 'express';
import { ApproveEvidenceUseCase } from '../../../app/evidences/use-cases/ApproveEvidence.js';
import { RejectEvidenceUseCase } from '../../../app/evidences/use-cases/RejectEvidence.js';
import { GetEvidencesByOrderUseCase } from '../../../app/evidences/use-cases/GetEvidencesByOrder.js';
import { evidenceRepository } from '../../db/repositories/EvidenceRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { EvidenceStatus } from '../../../domain/entities/Evidence.js';

const auditService = new AuditService(auditLogRepository);

export class EvidencesController {
  
  static upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      // TODO: Implement file upload with proper file handling
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Evidence upload not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  };

  static approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      const approveUseCase = new ApproveEvidenceUseCase(evidenceRepository, auditService);

      const approved = await approveUseCase.execute({
        evidenceId: id,
        approvedBy: userId,
        comments: req.body.comments,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ success: true, message: 'Evidencia aprobada exitosamente', data: approved });
    } catch (error) {
      next(error);
    }
  };

  static reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;

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
          detail: 'Razón de rechazo requerida',
        });
        return;
      }

      const rejectUseCase = new RejectEvidenceUseCase(evidenceRepository, auditService);

      const rejected = await rejectUseCase.execute({
        evidenceId: id,
        rejectedBy: userId,
        reason,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ success: true, message: 'Evidencia rechazada', data: rejected });
    } catch (error) {
      next(error);
    }
  };

  static getByOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      const stage = req.query.stage as string | undefined;
      const status = req.query.status as EvidenceStatus | undefined;

      const getByOrderUseCase = new GetEvidencesByOrderUseCase(evidenceRepository);

      const evidences = await getByOrderUseCase.execute({ orderId, stage, status });

      res.json({ success: true, data: evidences });
    } catch (error) {
      next(error);
    }
  };

  static remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;

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
          detail: 'Razón de eliminación requerida',
        });
        return;
      }

      // TODO: Implement delete evidence with proper dependencies
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Evidence deletion not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  };

  static syncOffline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // TODO: Implement sync offline evidences
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Offline evidence sync not yet implemented',
      });
    } catch (error) {
      next(error);
    }
  };
}
