import type { Request, Response } from 'express';
import { OrderService } from '../../../domain/services/OrderService.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { asyncHandler } from '../../../shared/middlewares/index.js';
import { AppError } from '../../../shared/errors/index.js';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Controller para gestión de órdenes
 */
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly auditLogRepository: IAuditLogRepository // For getHistory, or move to Service
  ) { }

  /**
   * Listar órdenes
   * GET /api/orders
   */
  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const { orders, total } = await this.orderService.findAll(filters, pagination);

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
  });

  /**
   * Obtener órdenes del usuario autenticado
   * GET /api/orders/my
   */
  getMyOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const { page = 1, limit = 10, state } = req.query;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
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

    const { orders, total } = await this.orderService.findAll(filters, pagination);

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
  });

  /**
   * Obtener orden por ID
   * GET /api/orders/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const order = await this.orderService.findById(id);

    res.json({
      success: true,
      data: order,
    });
  });

  /**
   * Crear nueva orden
   * POST /api/orders
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const payload = {
      clientName: req.body.clientName,
      description: req.body.description,
      location: req.body.location,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
    };

    const newOrder = await this.orderService.create(
      payload,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: newOrder,
    });
  });

  /**
   * Actualizar orden
   * PUT /api/orders/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const updated = await this.orderService.update(
      id,
      req.body,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: updated,
    });
  });

  /**
   * Transición de estado
   * POST /api/orders/:id/transition
   */
  transition = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { newState } = req.body;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const updated = await this.orderService.transition(
      id,
      newState,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: updated,
    });
  });

  /**
   * Archivar orden
   * POST /api/orders/:id/archive
   */
  archive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const updated = await this.orderService.archive(
      id,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: updated,
    });
  });

  /**
   * Asignar responsable
   * POST /api/orders/:id/assign
   */
  assign = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { userId: assignedUserId } = req.body;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const updated = await this.orderService.assign(
      id,
      assignedUserId,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: updated,
    });
  });

  /**
   * Obtener estadísticas de órdenes
   * GET /api/orders/stats
   */
  getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stats = await this.orderService.getDashboardStats();

    res.json({
      type: 'https://httpstatuses.com/200',
      title: 'OK',
      status: 200,
      data: stats,
    });
  });

  /**
   * Obtener historial de una orden
   * GET /api/orders/:id/history
   */
  getHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // TODO: Move this to OrderService or AuditService
    const history = await this.auditLogRepository.findAll(
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
  });

  /**
   * Eliminar orden
   * DELETE /api/orders/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    await this.orderService.delete(
      id,
      userId,
      req.ip,
      req.get('user-agent')
    );

    res.status(204).send();
  });
}
