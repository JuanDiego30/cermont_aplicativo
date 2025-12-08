// ============================================
// INSPECCIÓN LÍNEAS DE VIDA CONTROLLER - Cermont FSM
// Formato OPE-006 - Inspección de líneas de vida verticales
// ============================================

import { Request, Response } from 'express';
import { lineasVidaService } from './lineas-vida.service.js';
import { 
    createInspeccionLineaVidaSchema, 
    updateInspeccionLineaVidaSchema, 
    inspeccionLineaVidaFiltersSchema 
} from './lineas-vida.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export class LineasVidaController {

    /**
     * GET /api/lineas-vida
     * Listar inspecciones con filtros
     */
    list = asyncHandler(async (req: Request, res: Response) => {
        const filters = inspeccionLineaVidaFiltersSchema.parse(req.query);
        const result = await lineasVidaService.findAll(filters);
        
        res.json({
            success: true,
            data: result.data,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total: result.total,
                pages: result.pages,
            }
        });
    });

    /**
     * GET /api/lineas-vida/:id
     * Obtener inspección por ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const inspeccion = await lineasVidaService.findById(id);
        
        res.json({
            success: true,
            data: inspeccion,
        });
    });

    /**
     * GET /api/lineas-vida/numero/:numeroLinea
     * Obtener inspección por número de línea
     */
    getByNumeroLinea = asyncHandler(async (req: Request, res: Response) => {
        const { numeroLinea } = req.params;
        const inspeccion = await lineasVidaService.findByNumeroLinea(numeroLinea);
        
        res.json({
            success: true,
            data: inspeccion,
        });
    });

    /**
     * GET /api/lineas-vida/template
     * Obtener template de inspección vacío
     */
    getTemplate = asyncHandler(async (_req: Request, res: Response) => {
        const template = lineasVidaService.getTemplate();
        
        res.json({
            success: true,
            data: template,
        });
    });

    /**
     * GET /api/lineas-vida/estadisticas
     * Obtener estadísticas generales
     */
    getEstadisticas = asyncHandler(async (_req: Request, res: Response) => {
        const estadisticas = await lineasVidaService.getEstadisticas();
        
        res.json({
            success: true,
            data: estadisticas,
        });
    });

    /**
     * POST /api/lineas-vida
     * Crear nueva inspección
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autenticado', 401);

        const data = createInspeccionLineaVidaSchema.parse(req.body);
        const inspeccion = await lineasVidaService.create(userId, data);
        
        res.status(201).json({
            success: true,
            message: 'Inspección de línea de vida creada exitosamente',
            data: inspeccion,
        });
    });

    /**
     * PATCH /api/lineas-vida/:id
     * Actualizar inspección
     */
    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updateInspeccionLineaVidaSchema.parse(req.body);
        const inspeccion = await lineasVidaService.update(id, data);
        
        res.json({
            success: true,
            message: 'Inspección actualizada',
            data: inspeccion,
        });
    });

    /**
     * GET /api/lineas-vida/:id/reporte
     * Generar reporte de inspección
     */
    getReporte = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const reporte = await lineasVidaService.generateReport(id);
        
        res.json({
            success: true,
            data: reporte,
        });
    });

    /**
     * DELETE /api/lineas-vida/:id
     * Eliminar inspección
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await lineasVidaService.delete(id);
        
        res.json({
            success: true,
            message: 'Inspección eliminada',
        });
    });
}

export const lineasVidaController = new LineasVidaController();
