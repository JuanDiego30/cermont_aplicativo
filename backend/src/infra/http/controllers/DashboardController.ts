import { Request, Response } from 'express';
import { GetKPIs } from '../../../app/dashboard/use-cases/GetKPIs.js';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { userRepository } from '../../db/repositories/UserRepository.js';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js';
import { evidenceRepository } from '../../db/repositories/EvidenceRepository.js';
import { OrderState } from '../../../domain/entities/Order.js';

/**
 * Controller para dashboard y estadísticas
 */
export class DashboardController {
  private getKPIs: GetKPIs;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private metricsCache: {
    data: any;
    timestamp: number;
  } | null = null;

  constructor() {
    this.getKPIs = new GetKPIs(orderRepository);
  }

  /**
   * Obtener métricas principales (KPIs)
   * GET /api/dashboard/metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      // ✅ Implementar caché simple (5 min)
      const now = Date.now();
      if (this.metricsCache && now - this.metricsCache.timestamp < this.CACHE_TTL) {
        res.json({
          success: true,
          data: this.metricsCache.data,
          cached: true,
        });
        return;
      }

      // ✅ Obtener métricas usando use case
      const metrics = await this.getKPIs.execute();

      // ✅ Actualizar caché
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
  }

  /**
   * Obtener órdenes por estado
   * GET /api/dashboard/orders/by-state/:state
   */
  async getOrdersByState(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.params;

      // ✅ Validar estado
      if (!Object.values(OrderState).includes(state as OrderState)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Estado inválido',
        });
        return;
      }

      // ✅ Obtener órdenes (usa repository optimizado)
      const orders = await orderRepository.findByState(state as OrderState);

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
  }

  /**
   * Obtener estadísticas generales
   * GET /api/dashboard/stats
   */
  async getGeneralStats(req: Request, res: Response): Promise<void> {
    try {
      // ✅ Obtener estadísticas de múltiples entidades en paralelo
      const [orderStats, userStats, workPlanStats] = await Promise.all([
        orderRepository.getStats(),
        userRepository.getStats(),
        workPlanRepository.getStats(),
      ]);

      res.json({
        success: true,
        data: {
          orders: orderStats,
          users: userStats,
          workPlans: workPlanStats,
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
   * Obtener órdenes activas (no archivadas)
   * GET /api/dashboard/orders/active
   */
  async getActiveOrders(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      // ✅ Usar método optimizado
      const orders = await orderRepository.findActive({
        limit: Number(limit),
      });

      const total = await orderRepository.count({ archived: false });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: Number(limit),
            skip: 0,
            hasMore: orders.length === Number(limit),
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
   * Obtener work plans pendientes de aprobación
   * GET /api/dashboard/work-plans/pending
   */
  async getPendingWorkPlans(req: Request, res: Response): Promise<void> {
    try {
      // ✅ Usar método optimizado
      const workPlans = await workPlanRepository.findPending();

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
  }

  /**
   * Obtener estadísticas del usuario autenticado
   * GET /api/dashboard/my-stats
   */
  async getMyStats(req: Request, res: Response): Promise<void> {
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

      // ✅ Obtener estadísticas del usuario en paralelo
      const [myOrders, myWorkPlans, myEvidence] = await Promise.all([
        orderRepository.findByResponsible(userId),
        workPlanRepository.findByCreator(userId),
        evidenceRepository.find({ uploadedBy: userId }),
      ]);

      res.json({
        success: true,
        data: {
          ordersCount: myOrders.length,
          workPlansCount: myWorkPlans.length,
          evidenceCount: myEvidence.length,
          orders: myOrders.slice(0, 5), // últimas 5
          workPlans: myWorkPlans.slice(0, 5), // últimos 5
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
   * Obtener resumen de actividad reciente
   * GET /api/dashboard/recent-activity
   */
  async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      // ✅ Obtener actividad reciente de múltiples entidades
      const [recentOrders, recentWorkPlans] = await Promise.all([
        orderRepository.find({ limit: Number(limit) }),
        workPlanRepository.find({ limit: Number(limit) }),
      ]);

      // ✅ Combinar y ordenar por updatedAt
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
        .slice(0, Number(limit));

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
  }

  /**
   * Limpiar caché de métricas (admin)
   * POST /api/dashboard/cache/clear
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      this.metricsCache = null;

      res.json({
        success: true,
        message: 'Caché de métricas limpiado',
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
}

export const dashboardController = new DashboardController();
