import { Request, Response, NextFunction } from 'express';
import { DashboardService, dashboardService } from './dashboard.service.js';

export class DashboardController {
    constructor(private readonly service: DashboardService = dashboardService) { }

    /**
     * GET /api/dashboard/metricas - Métricas principales
     */
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

    /**
     * GET /api/dashboard/ordenes-estado - Órdenes por estado
     */
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

    /**
     * GET /api/dashboard/analisis-costos - Análisis de costos
     */
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

    /**
     * GET /api/dashboard/ordenes-vencer - Órdenes próximas a vencer
     */
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

    /**
     * GET /api/dashboard/actividad - Actividad reciente
     */
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

    /**
     * GET /api/dashboard/ordenes-prioridad - Órdenes por prioridad
     */
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

    /**
     * GET /api/dashboard/tecnicos - Resumen de técnicos
     */
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
