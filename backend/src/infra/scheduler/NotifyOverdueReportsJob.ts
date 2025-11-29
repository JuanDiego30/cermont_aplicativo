import prisma from '../db/prisma.js'; // TODO: Reemplazar por NotificationRepository y OrderRepository
import { logger } from '../../shared/utils/logger.js';

// Constantes para evitar magic strings
const ORDER_STATE_COMPLETED = 'COMPLETED';
const EVIDENCE_TYPE_REPORT = 'INFORME_FINAL';
const NOTIFICATION_TYPE_WARNING = 'WARNING';

/**
 * Job to notify about overdue final reports
 * Finds completed orders without final report evidence and notifies coordinators
 */
export class NotifyOverdueReportsJob {
  private static lastRun: Date | null = null;
  private static lastResult: { notifiedOrders: number; notifiedUsers: number } | null = null;

  /**
   * Execute the job
   */
  static async run(): Promise<{ success: boolean; notifiedOrders: number; notifiedUsers: number }> {
    try {
      logger.info('[NotifyOverdueReportsJob] Starting job execution...');

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. Encontrar órdenes vencidas
      const overdueOrders = await prisma.order.findMany({
        where: {
          state: ORDER_STATE_COMPLETED,
          updatedAt: { lt: sevenDaysAgo },
          evidences: {
            none: { type: EVIDENCE_TYPE_REPORT },
          },
        },
        select: { id: true }, // Solo necesitamos el ID o count, no toda la entidad
      });

      const overdueCount = overdueOrders.length;
      logger.info(`[NotifyOverdueReportsJob] Found ${overdueCount} orders with overdue reports`);

      if (overdueCount === 0) {
        this.updateStatus(0, 0);
        return { success: true, notifiedOrders: 0, notifiedUsers: 0 };
      }

      // 2. Encontrar usuarios a notificar
      const recipients = await prisma.user.findMany({
        where: {
          role: { in: ['COORDINADOR', 'ADMIN'] },
          active: true,
        },
        select: { id: true },
      });

      if (recipients.length === 0) {
        logger.warn('[NotifyOverdueReportsJob] No admins or coordinators found to notify');
        this.updateStatus(overdueCount, 0);
        return { success: true, notifiedOrders: overdueCount, notifiedUsers: 0 };
      }

      // 3. Crear notificaciones (Batch Insert)
      // Nota: createMany es más eficiente que un loop
      const notificationsData = recipients.map((user) => ({
        userId: user.id,
        title: 'Informes Finales Atrasados',
        message: `Hay ${overdueCount} orden(es) completada(s) sin informe final (>7 días)`,
        type: NOTIFICATION_TYPE_WARNING,
        link: '/orders?filter=overdue-reports',
        read: false,
        createdAt: new Date(),
      }));

      await prisma.notification.createMany({
        data: notificationsData,
      });

      logger.info(`[NotifyOverdueReportsJob] Created notifications for ${recipients.length} users`);

      this.updateStatus(overdueCount, recipients.length);

      return {
        success: true,
        notifiedOrders: overdueCount,
        notifiedUsers: recipients.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[NotifyOverdueReportsJob] Job execution failed:', { error: errorMessage });
      throw error;
    }
  }

  private static updateStatus(orders: number, users: number) {
    this.lastRun = new Date();
    this.lastResult = { notifiedOrders: orders, notifiedUsers: users };
  }

  static getCronExpression(): string {
    return '0 8 * * *'; // Daily at 8:00 AM
  }

  static getStatus() {
    return {
      lastRun: this.lastRun,
      lastResult: this.lastResult,
    };
  }
}




