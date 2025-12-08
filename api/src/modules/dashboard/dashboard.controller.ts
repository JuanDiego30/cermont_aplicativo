/**
 * Controlador de dashboard para Cermont que proporciona endpoints para visualización
 * de métricas principales, órdenes agrupadas por estado/prioridad, análisis de costos,
 * órdenes próximas a vencer, actividad reciente y resumen de técnicos activos.
 * Todos los métodos son async, delegando lógica al servicio y manejando errores
 * mediante next(error) para pase al middleware de error centralizado.
 */

import { Request, Response, NextFunction } from 'express';
import { DashboardService, dashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) { }

  getMetricas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metricas = await this.service.getMetricas();

      res.json({
        status: 'success',
        data: metricas,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrdenesEstado = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getOrdenesEstado();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAnalisisCostos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getAnalisisCostos();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrdenesPorVencer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dias = parseInt(req.query.dias as string) || 3;
      const data = await this.service.getOrdenesPorVencer(dias);

      res.json({
        status: 'success',
        data,
        count: data.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getActividadReciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dias = parseInt(req.query.dias as string) || 7;
      const data = await this.service.getActividadReciente(dias);

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrdenesPorPrioridad = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getOrdenesPorPrioridad();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getResumenTecnicos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getResumenTecnicos();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();

