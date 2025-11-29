import { orderRepository } from '../../infra/db/repositories/OrderRepository.js';
import { archiveRepository } from '../../infra/db/repositories/ArchiveRepository.js';
import { logger } from '../../shared/utils/logger.js';

const ARCHIVE_BATCH_SIZE = 100;
const DEFAULT_RETENTION_DAYS = 30;
const SYSTEM_USER_ID = 'SYSTEM';

export class ArchivingService {

  /**
   * Ejecuta el proceso de archivado de órdenes antiguas.
   * Mueve órdenes completadas/canceladas a OrderHistory y las elimina de Order.
   */
  async runArchivingJob(retentionDays = DEFAULT_RETENTION_DAYS): Promise<number> {
    const cutoffDate = this.calculateCutoffDate(retentionDays);

    logger.info(`[ArchivingService] Iniciando job. Cutoff: ${cutoffDate.toISOString()}`);

    let totalArchived = 0;
    let hasMore = true;

    while (hasMore) {
      // 1. Buscar candidatos en OrderRepository
      const candidates = await orderRepository.findArchivable(cutoffDate);

      if (candidates.length === 0) {
        hasMore = false;
        break;
      }

      for (const order of candidates) {
        try {
          // 2. Obtener datos completos (incluyendo relaciones)
          const fullOrderData = await orderRepository.getFullOrderData(order.id);

          if (!fullOrderData) {
            logger.warn(`[ArchivingService] Orden ${order.id} no encontrada al intentar archivar.`);
            continue;
          }

          // 3. Mover a OrderHistory
          await archiveRepository.moveToHistory(order, fullOrderData);

          // 4. Eliminar de Order (Hard Delete)
          await orderRepository.delete(order.id);

          // 5. Loguear acción
          await archiveRepository.createLog({
            orderId: order.id,
            orderNumber: order.orderNumber,
            action: 'ARCHIVED',
            performedBy: SYSTEM_USER_ID,
            details: `Archivado automático. Antigüedad > ${retentionDays} días.`
          });

          totalArchived++;
        } catch (error) {
          logger.error(`[ArchivingService] Fallo al archivar orden ${order.id}`, { error });
        }
      }

      // Pausa breve para no bloquear BD si hay millones
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info(`[ArchivingService] Job finalizado. Total archivados: ${totalArchived}`);
    return totalArchived;
  }

  /**
   * Alias para el controller (compatibilidad)
   */
  async archiveOrders(days: number): Promise<number> {
    return this.runArchivingJob(days);
  }

  /**
   * Listar órdenes archivadas (para el controller)
   */
  async listArchivedOrders(page: number, limit: number, month?: string): Promise<any> {
    return await archiveRepository.findArchived(page, limit, month);
  }

  private calculateCutoffDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}

export const archivingService = new ArchivingService();
