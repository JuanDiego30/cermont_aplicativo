import type { Request, Response } from 'express';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { CreateWorkPlanUseCase } from '../../../app/workplans/use-cases/CreateWorkPlan.js';
import { UpdateWorkPlanUseCase } from '../../../app/workplans/use-cases/UpdateWorkPlan.js';
import { logger } from '../../../shared/utils/logger.js';

// Services
const auditService = new AuditService(auditLogRepository);

export class WorkPlansController {
  
  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, status, createdBy } = req.query;

      const filters = {
        status: status as WorkPlanStatus,
        createdBy: createdBy as string,
      };

      const pagination = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        skip: (Number(page || 1) - 1) * Number(limit || 10),
      };

      // Usar findAll y count refactorizados
      const [workPlans, total] = await Promise.all([
        workPlanRepository.findAll(filters, pagination),
        workPlanRepository.count(filters),
      ]);

      res.json({
        success: true,
        data: {
          workPlans,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error listing work plans:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  };

  static getMyWorkPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { page, limit, status } = req.query;

      const filters = {
        status: status as WorkPlanStatus,
        createdBy: userId,
      };

      const pagination = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        skip: (Number(page || 1) - 1) * Number(limit || 10),
      };

      const [workPlans, total] = await Promise.all([
        workPlanRepository.findAll(filters, pagination),
        workPlanRepository.count(filters),
      ]);

      res.json({
        success: true,
        data: {
          workPlans,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error getting user work plans:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const workPlan = await workPlanRepository.findById(id);

      if (!workPlan) {
        res.status(404).json({ message: 'Not Found' });
        return;
      }

      res.json({ success: true, data: workPlan });
    } catch (error: any) {
      logger.error('Error getting work plan:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const createUseCase = new CreateWorkPlanUseCase(workPlanRepository, orderRepository, auditService);
      const newWorkPlan = await createUseCase.execute({
        ...req.body,
        createdBy: userId,
      });

      await auditService.log({
        action: AuditAction.CREATE, // Corregido
        entityType: 'WorkPlan',
        entityId: newWorkPlan.id,
        userId,
        after: { status: WorkPlanStatus.DRAFT },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        reason: 'Work plan created',
      });

      res.status(201).json({ success: true, data: newWorkPlan });
    } catch (error: any) {
      logger.error('Error creating work plan:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Usar Use Case si existe, o repositorio directo
      const updated = await workPlanRepository.update(id, req.body);

      await auditService.log({
        action: AuditAction.UPDATE,
        entityType: 'WorkPlan',
        entityId: id,
        userId: userId || 'SYSTEM',
        after: req.body,
        ip: req.ip,
        reason: 'Work plan updated',
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating work plan:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  static approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { comments } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Usar update con objeto approval
      const updated = await workPlanRepository.update(id, {
        status: WorkPlanStatus.APPROVED,
        approval: {
          by: userId,
          at: new Date(),
          comments
        }
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error approving work plan:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  static reject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { reason } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Usar update con objeto rejection
      const updated = await workPlanRepository.update(id, {
        status: WorkPlanStatus.REJECTED,
        rejection: {
          by: userId,
          at: new Date(),
          reason
        }
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error rejecting work plan:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  // ... Otros métodos (delete, addMaterial, etc.) siguiendo el mismo patrón
  // Implementación simplificada:
  static delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await workPlanRepository.delete(id);
      res.status(204).send();
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting work plan', { error: msg });
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  static getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Implementar stats usando count por status
      const [draft, pendingApproval, approved, rejected, inProgress, completed, cancelled] = await Promise.all([
        workPlanRepository.count({ status: WorkPlanStatus.DRAFT }),
        workPlanRepository.count({ status: WorkPlanStatus.PENDING_APPROVAL }),
        workPlanRepository.count({ status: WorkPlanStatus.APPROVED }),
        workPlanRepository.count({ status: WorkPlanStatus.REJECTED }),
        workPlanRepository.count({ status: WorkPlanStatus.IN_PROGRESS }),
        workPlanRepository.count({ status: WorkPlanStatus.COMPLETED }),
        workPlanRepository.count({ status: WorkPlanStatus.CANCELLED }),
      ]);

      const stats = {
        byStatus: { draft, pendingApproval, approved, rejected, inProgress, completed, cancelled },
        total: draft + pendingApproval + approved + rejected + inProgress + completed + cancelled,
      };

      res.json({ success: true, data: stats });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting stats', { error: msg });
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
