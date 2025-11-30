import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/index.js';

// ============================================================================
// Types
// ============================================================================

interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

type LogMetadata = Record<string, unknown> | undefined;

// ============================================================================
// Constants
// ============================================================================

const BILLING_STATES = [
  'PENDING_ACTA',
  'ACTA_SIGNED',
  'SES_SENT',
  'INVOICED',
  'PAID',
] as const;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const COMPLETED_STATE = 'COMPLETADO';

// ============================================================================
// Helpers
// ============================================================================

function createLogMetadata(error: unknown): LogMetadata {
  return error instanceof Error ? { error: error.message } : undefined;
}

function getPaginationParams(query: Record<string, any>) {
  const page = Number(query.page) || DEFAULT_PAGE;
  const limit = Number(query.limit) || DEFAULT_LIMIT;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function isBillingStateValid(state: string): boolean {
  return BILLING_STATES.includes(state as typeof BILLING_STATES[number]);
}

// ============================================================================
// Controller
// ============================================================================

export class BillingController {
  /**
   * Get billing statistics grouped by state
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await prisma.order.groupBy({
        by: ['billingState'],
        _count: {
          billingState: true,
        },
        where: {
          state: COMPLETED_STATE,
          archived: false,
        },
      });

      const formattedStats = stats.reduce((acc, curr) => {
        const state = curr.billingState || 'UNKNOWN';
        acc[state] = curr._count.billingState;
        return acc;
      }, {} as Record<string, number>);

      res.json({ success: true, data: formattedStats });
    } catch (error) {
      const metadata = createLogMetadata(error);
      logger.error('Error getting billing stats:', metadata);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * List orders by billing state with pagination
   */
  static async listByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, any>);

      const [total, orders] = await prisma.$transaction([
        prisma.order.count({
          where: {
            billingState: state,
            state: COMPLETED_STATE,
            archived: false,
          },
        }),
        prisma.order.findMany({
          where: {
            billingState: state,
            state: COMPLETED_STATE,
            archived: false,
          },
          select: {
            id: true,
            orderNumber: true,
            clientName: true,
            billingState: true,
            updatedAt: true,
          },
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      res.json({
        success: true,
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      const metadata = createLogMetadata(error);
      logger.error('Error listing billing orders:', metadata);
      res.status(500).json({ success: false, error: 'Error al listar órdenes' });
    }
  }

  /**
   * Update billing state for an order
   */
  static async updateState(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newState, details } = req.body;

      if (!isBillingStateValid(newState)) {
        return res.status(400).json({ success: false, error: 'Estado inválido' });
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          billingState: newState,
        },
      });

      res.json({ success: true, data: order });
    } catch (error) {
      const metadata = createLogMetadata(error);
      logger.error('Error updating billing state:', metadata);
      res.status(500).json({ success: false, error: 'Error al actualizar estado' });
    }
  }
}

