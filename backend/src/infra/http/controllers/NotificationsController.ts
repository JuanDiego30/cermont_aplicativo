import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/logger.js';

export class NotificationsController {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, read: false },
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching notifications', { error: msg });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications',
      });
    }
  };

  /**
   * Mark notification as read
   * PATCH /api/notifications/:id/read
   */
  static markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await prisma.notification.updateMany({
        where: {
          id,
          userId,
        },
        data: {
          read: true,
        },
      });

      res.json({ success: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error marking notification as read', { error: msg });
      res.status(500).json({
        success: false,
        error: 'Failed to update notification',
      });
    }
  };

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  static markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      res.json({ success: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error marking all notifications as read', { error: msg });
      res.status(500).json({
        success: false,
        error: 'Failed to update notifications',
      });
    }
  };
}
