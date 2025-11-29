import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/logger.js';

// Tipado para request autenticado
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

type LogMetadata = Record<string, unknown> | undefined;

export class BillingController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await prisma.order.groupBy({
        by: ['billingState'],
        _count: {
          billingState: true,
        },
        where: {
          state: 'COMPLETADO', // Only completed orders enter billing (Ajustar si OrderState enum difiere)
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
      const metadata: LogMetadata = error instanceof Error ? { error: error.message } : undefined;
      logger.error('Error getting billing stats:', metadata);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  static async listByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, orders] = await prisma.$transaction([
        prisma.order.count({
          where: {
            billingState: state,
            state: 'COMPLETADO',
            archived: false,
          },
        }),
        prisma.order.findMany({
          where: {
            billingState: state,
            state: 'COMPLETADO',
            archived: false,
          },
          // Include relaciones si existen. Si no, select campos directos.
          // Ajustar según schema.prisma real.
          select: {
            id: true,
            orderNumber: true,
            clientName: true,
            billingState: true,
            updatedAt: true,
            // responsible: { select: { name: true } } // Descomentar si existe relación
          },
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      res.json({
        success: true,
        data: orders,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      const metadata: LogMetadata = error instanceof Error ? { error: error.message } : undefined;
      logger.error('Error listing billing orders:', metadata);
      res.status(500).json({ success: false, error: 'Error al listar órdenes' });
    }
  }

  static async updateState(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newState, details } = req.body;

      const allowedStates = ['PENDING_ACTA', 'ACTA_SIGNED', 'SES_SENT', 'INVOICED', 'PAID'];
      if (!allowedStates.includes(newState)) {
        return res.status(400).json({ success: false, error: 'Estado inválido' });
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          billingState: newState,
          // billingDetails: details ? details : undefined, // Descomentar si existe campo JSON en DB
        },
      });

      res.json({ success: true, data: order });
    } catch (error) {
      const metadata: LogMetadata = error instanceof Error ? { error: error.message } : undefined;
      logger.error('Error updating billing state:', metadata);
      res.status(500).json({ success: false, error: 'Error al actualizar estado' });
    }
  }
}

