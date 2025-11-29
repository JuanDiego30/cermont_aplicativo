import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { GetKPIsUseCase } from '../../../app/dashboard/use-cases/GetKPIs.js';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { userRepository } from '../../db/repositories/UserRepository.js';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js';
import { evidenceRepository } from '../../db/repositories/EvidenceRepository.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js'; // Asegurar importación

/**
 * Controller para dashboard y estadísticas
 */
export class DashboardController {
  private getKPIs: GetKPIsUseCase;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private metricsCache: {
    data: any;
    timestamp: number;
  } | null = null;

  constructor() {
    this.getKPIs = new GetKPIsUseCase(orderRepository);
  }

  /**
   * Obtener métricas principales (KPIs)
   * GET /api/dashboard/metrics
   */
  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Caché simple en memoria
      const now = Date.now();
      if (this.metricsCache && now - this.metricsCache.timestamp < this.CACHE_TTL) {
        res.json({
          success: true,
          data: this.metricsCache.data,
          cached: true,
        });
        return;
      }

      // Obtener métricas usando use case
      const metrics = await this.getKPIs.execute();

      // Actualizar caché
      this.metricsCache = {
        data: metrics,
        timestamp: now,
      };

      res.json({
        success: true,
        data: metrics,
        cached: false,
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
   * Obtener órdenes por estado
   * GET /api/dashboard/orders/by-state/:state
   */
  getOrdersByState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { state } = req.params;

      // Validar estado
      if (!Object.values(OrderState).includes(state as OrderState)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Estado inválido',
        });
        return;
      }

      // Usar repository optimizado
      const orders = await orderRepository.findAll({ state: state as OrderState });

      res.json({
        success: true,
        data: {
          state,
          count: orders.length,
          orders,
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
   * Obtener estadísticas generales
   * GET /api/dashboard/stats
   */
  getGeneralStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener estadísticas de múltiples entidades en paralelo
      const [orderStats, usersTotal, workPlansTotal] = await Promise.all([
        orderRepository.getDashboardStats(),
        userRepository.count({}),
        workPlanRepository.count({}),
      ]);

      res.json({
        success: true,
        data: {
          orders: orderStats,
          users: { total: usersTotal },
          workPlans: { total: workPlansTotal },
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
   * Obtener órdenes activas
   * GET /api/dashboard/orders/active
   */
  getActiveOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, page = 1 } = req.query;
      const limitNum = Number(limit);
      const pageNum = Number(page);

      const orders = await orderRepository.findAll(
        { archived: false },
        { limit: limitNum, page: pageNum, skip: (pageNum - 1) * limitNum }
      );

      const total = await orderRepository.count({ archived: false });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
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
   * Obtener work plans pendientes
   * GET /api/dashboard/work-plans/pending
   */
  getPendingWorkPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      // Usar findAll con filtro de status PENDING_APPROVAL (estado de espera de aprobación)
      const workPlans = await workPlanRepository.findAll({ status: WorkPlanStatus.PENDING_APPROVAL });

      res.json({
        success: true,
        data: {
          count: workPlans.length,
          workPlans,
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
   * Obtener estadísticas personales
   * GET /api/dashboard/my-stats
   */
  getMyStats = async (req: Request, res: Response): Promise<void> => {
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

      const [myOrders, myWorkPlans, myEvidence] = await Promise.all([
        orderRepository.findAll({ responsibleId: userId }),
        workPlanRepository.findAll({ createdBy: userId }),
        evidenceRepository.findAll({ uploadedBy: userId }),
      ]);

      res.json({
        success: true,
        data: {
          ordersCount: myOrders.length,
          workPlansCount: myWorkPlans.length,
          evidenceCount: myEvidence.length,
          orders: myOrders.slice(0, 5),
          workPlans: myWorkPlans.slice(0, 5),
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
   * Obtener actividad reciente
   * GET /api/dashboard/recent-activity
   */
  getRecentActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const limitNum = Number(limit);

      const [recentOrders, recentWorkPlans] = await Promise.all([
        orderRepository.findAll({}, { page: 1, limit: limitNum, skip: 0 }, { field: 'updatedAt', order: 'desc' }),
        workPlanRepository.findAll({}, { page: 1, limit: limitNum, skip: 0 }, { field: 'updatedAt', order: 'desc' }),
      ]);

      const activities = [
        ...recentOrders.map((o) => ({
          type: 'order',
          id: o.id,
          description: `Orden: ${o.clientName}`,
          state: o.state,
          updatedAt: o.updatedAt,
        })),
        ...recentWorkPlans.map((wp) => ({
          type: 'workplan',
          id: wp.id,
          description: `Plan de trabajo`,
          status: wp.status,
          updatedAt: wp.updatedAt,
        })),
      ]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limitNum);

      res.json({
        success: true,
        data: {
          activities,
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
   * Obtener métricas avanzadas
   */
  getAdvancedMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Métricas calculadas con Prisma nativo para eficiencia
      // 1. Cycle Time
      const completedOrders = await prisma.order.findMany({
        where: { state: 'COMPLETED', archived: false }, // Ajustar enum
        select: { createdAt: true, updatedAt: true },
      });

      let avgCycleTime = 0;
      if (completedOrders.length > 0) {
        const totalTime = completedOrders.reduce((acc, order) => {
          return acc + (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime());
        }, 0);
        avgCycleTime = totalTime / completedOrders.length / (1000 * 60 * 60 * 24);
      }

      // 2. Compliance Rate (Plan vs Actual)
      const completedWorkPlans = await prisma.workPlan.findMany({
        where: {
          status: 'APROBADO', // O COMPLETED si existe
          actualEnd: { not: null },
          plannedEnd: { not: null },
        },
        select: { actualEnd: true, plannedEnd: true },
      });

      let complianceRate = 0;
      if (completedWorkPlans.length > 0) {
        const onTimeCount = completedWorkPlans.filter((wp) => {
          return wp.actualEnd! <= wp.plannedEnd!;
        }).length;
        complianceRate = (onTimeCount / completedWorkPlans.length) * 100;
      }

      // 3. Budget Variance
      // Asumiendo campo `actualBudget` o calculándolo
      const budgetWorkPlans = await prisma.workPlan.findMany({
        where: {
          estimatedBudget: { gt: 0 },
        },
        select: { estimatedBudget: true, id: true }, // Necesitaríamos sumar `CostBreakdown`
      });
      
      // Simplificación: Usar un valor calculado o mock por ahora si no hay campo directo
      const budgetVariance = 0; 

      res.json({
        success: true,
        data: {
          cycleTime: {
            value: Number(avgCycleTime.toFixed(1)),
            unit: 'días',
            trend: 'stable',
          },
          complianceRate: {
            value: Number(complianceRate.toFixed(1)),
            unit: '%',
            trend: complianceRate > 80 ? 'up' : 'down',
          },
          budgetVariance: {
            value: Number(budgetVariance.toFixed(1)),
            unit: '%',
            status: 'good',
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
   * Limpiar caché
   */
  clearCache = async (req: Request, res: Response): Promise<void> => {
    this.metricsCache = null;
    res.json({
      success: true,
      message: 'Caché de métricas limpiado',
    });
  };
}

export const dashboardController = new DashboardController();
