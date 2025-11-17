/**
 * Controller de Reportes - NUEVO
 * Genera reportes y PDFs autom�ticos
 * 
 * @file backend/src/infra/http/controllers/ReportsController.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { GenerateActivityReport } from '../../../app/reports/use-cases/GenerateActivityReport.js';
import { GenerateActaEntrega } from '../../../app/reports/use-cases/GenerateActaEntrega.js';
import { GenerateSES } from '../../../app/reports/use-cases/GenerateSES.js';
import { GenerateCostReport } from '../../../app/reports/use-cases/GenerateCostReport.js';
import { GenerateDashboardReport } from '../../../app/reports/use-cases/GenerateDashboardReport.js';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js';
import { evidenceRepository } from '../../db/repositories/EvidenceRepository.js';
import { userRepository } from '../../db/repositories/UserRepository.js';

/**
 * Controller de reportes
 * @class ReportsController
 */
export class ReportsController {
  /**
   * Generar informe de actividad
   * GET /api/reports/activity/:orderId
   */
  static async generateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const { observations } = req.query;

      const generateUseCase = new GenerateActivityReport(
        orderRepository,
        workPlanRepository,
        evidenceRepository,
        userRepository
      );

      const pdfBuffer = await generateUseCase.execute({
        orderId,
        observations: observations as string | undefined,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=informe-actividad-${orderId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar acta de entrega
   * POST /api/reports/acta-entrega/:orderId
   */
  static async generateActa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      const generateUseCase = new GenerateActaEntrega(
        orderRepository,
        userRepository
      );

      const pdfBuffer = await generateUseCase.execute({
        orderId,
        ...req.body,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=acta-entrega-${orderId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar formato SES
   * POST /api/reports/ses/:orderId
   */
  static async generateSES(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      const generateUseCase = new GenerateSES(
        orderRepository,
        workPlanRepository,
        userRepository
      );

      const pdfBuffer = await generateUseCase.execute({
        orderId,
        ...req.body,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ses-${orderId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte de costos
   * GET /api/reports/costs/:workPlanId
   */
  static async generateCosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workPlanId } = req.params;
      const realCost = parseFloat(req.query.realCost as string);

      if (isNaN(realCost)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'realCost debe ser un n�mero v�lido',
        });
        return;
      }

      const generateUseCase = new GenerateCostReport(workPlanRepository);

      const pdfBuffer = await generateUseCase.execute({
        workPlanId,
        realCost,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-costos-${workPlanId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte de dashboard
   * GET /api/reports/dashboard
   */
  static async generateDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const format = (req.query.format as 'JSON' | 'PDF') || 'JSON';

      const generateUseCase = new GenerateDashboardReport(orderRepository);

      const reportData = await generateUseCase.execute({
        startDate,
        endDate,
        format,
      });

      res.json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      next(error);
    }
  }
}
