import { Request, Response } from 'express';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';

/**
 * Controller para gesti�n de planes de trabajo
 */
export class WorkPlansController {
  /**
   * Listar planes de trabajo con filtros y paginaci�n
   * GET /api/workplans
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status, createdBy } = req.query;

      const filters = {
        skip: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 10) : 0,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as WorkPlanStatus,
        createdBy: createdBy as string,
      };

      const workPlans = await workPlanRepository.find(filters);
      const total = await workPlanRepository.count(filters);

      res.json({
        success: true,
        data: {
          workPlans,
          pagination: {
            page: page ? parseInt(page as string) : 1,
            limit: filters.limit,
            total,
            pages: Math.ceil(total / filters.limit),
          },
        },
      });
    } catch (error) {
      console.error('Error listing work plans:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Obtener planes de trabajo del usuario autenticado
   * GET /api/workplans/my
   */
  static async getMyWorkPlans(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      const { page, limit, status } = req.query;

      const filters = {
        skip: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 10) : 0,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as WorkPlanStatus,
        createdBy: userId,
      };

      const workPlans = await workPlanRepository.find(filters);
      const total = await workPlanRepository.count(filters);

      res.json({
        success: true,
        data: {
          workPlans,
          pagination: {
            page: page ? parseInt(page as string) : 1,
            limit: filters.limit,
            total,
            pages: Math.ceil(total / filters.limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting user work plans:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Obtener plan de trabajo por ID
   * GET /api/workplans/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const workPlan = await workPlanRepository.findById(id);
      if (!workPlan) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Plan de trabajo no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: workPlan,
      });
    } catch (error) {
      console.error('Error getting work plan by ID:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Crear un nuevo plan de trabajo
   * POST /api/workplans
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      const body = req.body;

      // Crear plan de trabajo
      const newWorkPlan = await workPlanRepository.create({
        ...body,
        createdBy: userId,
        status: WorkPlanStatus.DRAFT,
        checklists: body.checklists || [],
      });

      // Registrar auditor�a
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.CREATE,
        entityType: 'WorkPlan',
        entityId: newWorkPlan.id,
        userId,
        after: { status: WorkPlanStatus.DRAFT },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || '',
        reason: 'Work plan created',
      });

      res.status(201).json({
        success: true,
        data: newWorkPlan,
      });
    } catch (error) {
      console.error('Error creating work plan:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Actualizar un plan de trabajo
   * PUT /api/workplans/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const updated = await workPlanRepository.update(id, req.body);

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.UPDATE,
        entityType: 'WorkPlan',
        entityId: id,
        userId: userId || 'SYSTEM',
        after: req.body,
        ip: req.ip || 'unknown',
        reason: 'Work plan updated',
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error updating work plan:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Aprobar plan de trabajo
   * POST /api/workplans/:id/approve
   */
  static async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const { comments } = req.body;

      const updated = await workPlanRepository.approve(id, userId, comments);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error approving work plan:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Rechazar plan de trabajo
   * POST /api/workplans/:id/reject
   */
  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const { reason } = req.body;

      const updated = await workPlanRepository.reject(id, userId, reason);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error rejecting work plan:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Agregar material
   * POST /api/workplans/:id/materials
   */
  static async addMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = req.body;

      const updated = await workPlanRepository.addMaterial(id, material);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error adding material:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Agregar item de checklist
   * POST /api/workplans/:id/checklist
   */
  static async addChecklistItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { item } = req.body;

      const updated = await workPlanRepository.addChecklistItem(id, item);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error adding checklist item:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Toggle checklist item
   * PUT /api/workplans/:id/checklist/:index
   */
  static async toggleChecklistItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, index } = req.params;

      const updated = await workPlanRepository.toggleChecklistItem(id, parseInt(index));

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Eliminar plan de trabajo
   * DELETE /api/workplans/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await workPlanRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting work plan:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }

  /**
   * Obtener estad�sticas
   * GET /api/workplans/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await workPlanRepository.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  }
}