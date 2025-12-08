import { Request, Response, NextFunction } from 'express';
import { ReportesService, reportesService } from './reportes.service.js';

export class ReportesController {
    constructor(private readonly service: ReportesService = reportesService) { }

    /**
     * GET /api/reportes/informe-tecnico/:ordenId
     */
    generarInformeTecnico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ordenId } = req.params;
            const { content, filename } = await this.service.generarInformeTecnico(ordenId);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/reportes/acta-entrega/:ordenId
     */
    generarActaEntrega = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ordenId } = req.params;
            const { content, filename } = await this.service.generarActaEntrega(ordenId);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/reportes/costos?fechaInicio=...&fechaFin=...
     */
    generarReporteCostos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const fechaInicio = new Date(req.query.fechaInicio as string || new Date().setMonth(new Date().getMonth() - 1));
            const fechaFin = new Date(req.query.fechaFin as string || Date.now());

            const { content, filename } = await this.service.generarReporteCostos(fechaInicio, fechaFin);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/reportes/productividad?fechaInicio=...&fechaFin=...
     */
    generarReporteProductividad = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const fechaInicio = new Date(req.query.fechaInicio as string || new Date().setMonth(new Date().getMonth() - 1));
            const fechaFin = new Date(req.query.fechaFin as string || Date.now());

            const { content, filename } = await this.service.generarReporteProductividad(fechaInicio, fechaFin);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/reportes/informe-tecnico/:ordenId/preview - Preview sin descargar
     */
    previewInformeTecnico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ordenId } = req.params;
            const { content } = await this.service.generarInformeTecnico(ordenId);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(content);
        } catch (error) {
            next(error);
        }
    };
}

export const reportesController = new ReportesController();
