import type { Request, Response } from 'express';
import { ArchivingService } from '../../../domain/services/ArchivingService.js';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { createObjectCsvStringifier } from 'csv-writer';
import archiver from 'archiver';
import { logger } from '../../../shared/utils/index.js';

// Instancia del servicio (ya que no es estático)
const archivingService = new ArchivingService();

export class ArchivesController {

  static list = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const month = req.query.month as string; // Optional filter YYYY-MM

      const result = await archivingService.listArchivedOrders(page, limit, month);

      res.json({
        success: true,
        data: {
          data: result.items,
          meta: {
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error listing archives:', { error: msg });
      res.status(500).json({ success: false, error: 'Error al listar archivos' });
    }
  };

  static export = async (req: Request, res: Response) => {
    try {
      const month = req.query.month as string; // Formato esperado YYYY-MM
      if (!month) {
        return res.status(400).json({ success: false, error: 'Mes requerido (YYYY-MM)' });
      }

      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      // Buscar órdenes archivadas en ese rango
      const archives = await orderRepository.findAll({
        archived: true,
        dateRange: { field: 'updatedAt', start: startDate, end: endDate }
      });

      if (archives.length === 0) {
        return res.status(404).json({ success: false, error: 'No hay datos para este mes' });
      }

      // Create ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });

      res.attachment(`backup-${month}.zip`);
      archive.pipe(res);

      // 1. Add CSV of orders
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'orderNumber', title: 'Orden' },
          { id: 'clientName', title: 'Cliente' },
          { id: 'description', title: 'Descripción' },
          { id: 'updatedAt', title: 'Fecha Archivo' },
        ],
      });

      // Adaptar datos para CSV (ContactInfo es objeto, se necesita aplanar si se requiere)
      const csvRecords = archives.map(a => ({
        ...a,
        clientName: a.clientName, // Asegurar tipos planos
      }));

      const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvRecords);
      archive.append(csvContent, { name: `orders-${month}.csv` });

      // 2. Add JSON dumps for each order (detail)
      for (const order of archives) {
        archive.append(JSON.stringify(order, null, 2), { name: `details/${order.orderNumber}.json` });
      }

      await archive.finalize();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error exporting archives:', { error: msg });
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Error al exportar' });
      }
    }
  };

  static triggerArchive = async (req: Request, res: Response) => {
    try {
      const { days } = req.body;
      const result = await archivingService.runArchivingJob(days || 30);
      res.json({ success: true, data: { archivedCount: result } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error triggering archive:', { error: msg });
      res.status(500).json({ success: false, error: 'Error al ejecutar archivado' });
    }
  };
}

