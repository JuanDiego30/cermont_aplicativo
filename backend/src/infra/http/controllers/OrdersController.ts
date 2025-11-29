import type { Request, Response } from 'express';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { CreateOrderUseCase } from '../../../app/orders/use-cases/CreateOrder.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Services
const auditService = new AuditService(auditLogRepository);

/**
 * Controller para gestión de órdenes
 */
export class OrdersController {
  /**
   * Listar órdenes
   * GET /api/orders
   */
  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, state, responsableId, archived, search } = req.query;

      const filters = {
        state: state as OrderState,
        responsibleId: responsableId as string,
        archived: archived === 'true',
        search: search as string,
      };

      const pagination = {
        page: Number(page),
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      };

      // Usar findAll y count refactorizados
      const [orders, total] = await Promise.all([
        orderRepository.findAll(filters, pagination),
        orderRepository.count(filters),
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error listing orders:', error);
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  };

  /**
   * Obtener órdenes del usuario autenticado
   * GET /api/orders/my
   */
  static getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 10, state } = req.query;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const filters = {
        state: state as OrderState,
        responsibleId: userId,
      };

      const pagination = {
        page: Number(page),
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      };

      const [orders, total] = await Promise.all([
        orderRepository.findAll(filters, pagination),
        orderRepository.count(filters),
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
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
  };

  /**
   * Obtener orden por ID
   * GET /api/orders/:id
   */
  static getById = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Crear nueva orden
   * POST /api/orders
   */
  static create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Usuario no autenticado',
      });
      return;
    }

    const createOrderUseCase = new CreateOrderUseCase(orderRepository, auditService);

    const payload = {
      clientName: req.body.clientName,
      description: req.body.description,
      location: req.body.location,
      createdBy: userId,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
      // estimatedStartDate: req.body.estimatedStartDate ? new Date(req.body.estimatedStartDate) : undefined, // Validar si existe en entidad
      // notes: req.body.notes, // Validar si existe en entidad
    };

    try {
      const newOrder = await createOrderUseCase.execute(payload);

      await auditService.log({
        entityType: 'Order',
        entityId: newOrder.id,
        action: AuditAction.CREATE_ORDER,
        userId,
        after: { ...payload, state: OrderState.SOLICITUD },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'Order created',
      });

      res.status(201).json({
        success: true,
        data: newOrder,
      });
    } catch (error: any) {
      // Manejar errores de creación de orden
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        type: `https://httpstatuses.com/${statusCode}`,
        title: error.code || 'Error',
        status: statusCode,
        detail: error.message,
      });
    }
  };

  /**
   * Actualizar orden
   * PUT /api/orders/:id
   */
  static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const updated = await orderRepository.update(id, req.body);

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
  };

  /**
   * Transición de estado
   * POST /api/orders/:id/transition
   */
  static transition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newState } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const updated = await orderRepository.update(id, { state: newState });

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
  };

  /**
   * Archivar orden
   * POST /api/orders/:id/archive
   */
  static archive = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Usar método específico del repositorio
      const updated = await orderRepository.archive(id, userId);

      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.ARCHIVE_ORDER,
        userId,
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
  };

  /**
   * Asignar responsable
   * POST /api/orders/:id/assign
   */
  static assign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId: assignedUserId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const updated = await orderRepository.update(id, { responsibleId: assignedUserId });

      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.ASSIGN_RESPONSIBLE,
        userId,
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
  };

  /**
   * Obtener estadísticas de órdenes
   * GET /api/orders/stats
   */
  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Usar método dashboard consolidado
      const stats = await orderRepository.getDashboardStats();

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
  };

  /**
   * Obtener historial de una orden
   * GET /api/orders/:id/history
   */
  static getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const history = await auditLogRepository.findAll(
        {
          entityType: 'Order',
          entityId: id,
        },
        {
          page: Number(page),
          limit: Number(limit),
          skip: (Number(page) - 1) * Number(limit),
        }
      );

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
  };

  /**
   * Eliminar orden
   * DELETE /api/orders/:id
   */
  static delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await auditService.log({
        entityType: 'Order',
        entityId: id,
        action: AuditAction.DELETE_ORDER,
        userId,
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
  };
}
