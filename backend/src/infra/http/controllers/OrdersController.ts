import { Request, Response } from 'express';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { OrderState } from '../../../domain/entities/Order.js';

/**
 * Controller para gestión de órdenes
 */
class OrdersController {
  /**
   * Listar órdenes
   * GET /api/orders
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, state, responsableId, archived } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        state: state as OrderState,
        responsableId: responsableId as string,
        archived: archived === 'true',
      };

      const orders = await orderRepository.find(filters);
      const total = await orderRepository.count(filters);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Obtener órdenes del usuario autenticado
   * GET /api/orders/my
   */
  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { page = 1, limit = 10, state } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        state: state as OrderState,
        responsableId: userId,
      };

      const orders = await orderRepository.find(filters);
      const total = await orderRepository.count(filters);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Obtener orden por ID
   * GET /api/orders/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await orderRepository.findById(id);

      if (!order) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Orden no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Crear nueva orden
   * POST /api/orders
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const orderData = {
        ...req.body,
        createdBy: userId,
        state: OrderState.SOLICITUD,
      };

      const newOrder = await orderRepository.create(orderData);

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: newOrder.id,
        action: AuditAction.CREATE_ORDER,
        userId,
        after: orderData,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'Order created',
      });

      res.status(201).json({
        success: true,
        data: newOrder,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Actualizar orden
   * PUT /api/orders/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const updated = await orderRepository.update(id, req.body);

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.UPDATE_ORDER,
        userId,
        after: req.body,
        ip: req.ip || 'unknown',
        reason: 'Order updated',
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Transición de estado
   * POST /api/orders/:id/transition
   */
  async transition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newState } = req.body;
      const userId = (req as any).user?.userId;

      // Usar update en lugar de transitionState
      const updated = await orderRepository.update(id, { state: newState });

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.TRANSITION_ORDER_STATE,
        userId,
        after: { state: newState },
        ip: req.ip || 'unknown',
        reason: `Order transitioned to ${newState}`,
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Archivar orden
   * POST /api/orders/:id/archive
   */
  async archive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Usar update en lugar de archive
      const updated = await orderRepository.update(id, { archived: true });

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.ARCHIVE_ORDER,
        userId: (req as any).user?.userId,
        after: { archived: true },
        ip: req.ip || 'unknown',
        reason: 'Order archived',
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Asignar responsable
   * POST /api/orders/:id/assign
   */
  async assign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId: assignedUserId } = req.body;

      // Usar update en lugar de assignToUser
      const updated = await orderRepository.update(id, { responsibleId: assignedUserId });

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.ASSIGN_RESPONSIBLE,
        userId: (req as any).user?.userId,
        after: { responsibleId: assignedUserId },
        ip: req.ip || 'unknown',
        reason: 'Order assigned to user',
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de órdenes
   * GET /api/orders/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Implementación básica de estadísticas
      const total = await orderRepository.count({});
      const active = await orderRepository.count({ archived: false });
      const archived = total - active;

      const stats = {
        total,
        active,
        archived,
        byState: {} as any, // Implementar si es necesario
      };

      res.json({
        type: 'https://httpstatuses.com/200',
        title: 'OK',
        status: 200,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Obtener historial de una orden
   * GET /api/orders/:id/history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const history = await auditLogRepository.find({
        entityType: 'Order',
        entityId: id,
        limit: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      res.json({
        type: 'https://httpstatuses.com/200',
        title: 'OK',
        status: 200,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Eliminar orden
   * DELETE /api/orders/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.DELETE_ORDER,
        userId: (req as any).user?.userId,
        before: { deleted: false },
        after: { deleted: true },
        ip: req.ip || 'unknown',
        reason: 'Order deleted',
      });

      await orderRepository.delete(id);

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }
}

export const ordersController = new OrdersController();
