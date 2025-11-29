import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/logger.js';

export class CostBreakdownController {
  /**
   * Get all cost breakdown items for a WorkPlan
   * GET /api/work-plans/:id/cost-breakdown
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const items = await prisma.costBreakdownItem.findMany({
        where: { workPlanId: id },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ success: true, data: items });
    } catch (error: any) {
      logger.error('Error fetching cost breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cost breakdown',
      });
    }
  }

  /**
   * Get cost summary for a WorkPlan
   * GET /api/work-plans/:id/cost-summary
   */
  async summary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const items = await prisma.costBreakdownItem.findMany({
        where: { workPlanId: id },
      });

      // Calculate totals
      const totalEstimated = items.reduce((sum, item) => sum + item.estimatedAmount, 0);
      const totalActual = items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      const variance = totalActual - totalEstimated;
      const variancePercent = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;

      // Group by category
      const byCategory = items.reduce((acc: Record<string, any>, item) => {
        if (!acc[item.category]) {
          acc[item.category] = {
            estimated: 0,
            actual: 0,
          };
        }
        acc[item.category].estimated += item.estimatedAmount;
        acc[item.category].actual += item.actualAmount || 0;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          totalEstimated,
          totalActual,
          variance,
          variancePercent,
          byCategory,
        },
      });
    } catch (error: any) {
      logger.error('Error calculating cost summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate cost summary',
      });
    }
  }

  /**
   * Create a cost breakdown item
   * POST /api/work-plans/:id/cost-breakdown
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        category,
        description,
        estimatedAmount,
        actualAmount,
        quantity,
        unitPrice,
        taxRate,
        notes,
      } = req.body;

      const item = await prisma.costBreakdownItem.create({
        data: {
          workPlanId: id,
          category,
          description,
          estimatedAmount,
          actualAmount,
          quantity,
          unitPrice,
          taxRate: taxRate || 0,
          notes,
        },
      });

      res.json({ success: true, data: item });
    } catch (error: any) {
      logger.error('Error creating cost breakdown item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create cost breakdown item',
      });
    }
  }

  /**
   * Update a cost breakdown item
   * PATCH /api/cost-breakdown/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        category,
        description,
        estimatedAmount,
        actualAmount,
        quantity,
        unitPrice,
        taxRate,
        notes,
      } = req.body;

      const item = await prisma.costBreakdownItem.update({
        where: { id },
        data: {
          category,
          description,
          estimatedAmount,
          actualAmount,
          quantity,
          unitPrice,
          taxRate,
          notes,
        },
      });

      res.json({ success: true, data: item });
    } catch (error: any) {
      logger.error('Error updating cost breakdown item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update cost breakdown item',
      });
    }
  }

  /**
   * Delete a cost breakdown item
   * DELETE /api/cost-breakdown/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.costBreakdownItem.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting cost breakdown item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete cost breakdown item',
      });
    }
  }
}

export const costBreakdownController = new CostBreakdownController();
