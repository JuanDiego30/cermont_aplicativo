// ============================================
// PLANEACIÓN CONTROLLER - Cermont FSM
// ============================================

import { Request, Response } from 'express';
import { planeacionService } from './planeacion.service.js';
import { 
    createPlaneacionSchema, 
    updatePlaneacionSchema, 
    aprobarPlaneacionSchema,
    planeacionFiltersSchema 
} from './planeacion.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export class PlaneacionController {

    /**
     * GET /api/planeacion
     * Listar planeaciones con filtros
     */
    list = asyncHandler(async (req: Request, res: Response) => {
        const filters = planeacionFiltersSchema.parse(req.query);
        const result = await planeacionService.findAll(filters);
        
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
     * GET /api/planeacion/:id
     * Obtener planeación por ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const planeacion = await planeacionService.findById(id);
        
        res.json({
            success: true,
            data: planeacion,
        });
    });

    /**
     * GET /api/planeacion/orden/:ordenId
     * Obtener planeación de una orden específica
     */
    getByOrdenId = asyncHandler(async (req: Request, res: Response) => {
        const { ordenId } = req.params;
        const planeacion = await planeacionService.findByOrdenId(ordenId);
        
        res.json({
            success: true,
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion
     * Crear nueva planeación
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const data = createPlaneacionSchema.parse(req.body);
        const planeacion = await planeacionService.create(data);
        
        res.status(201).json({
            success: true,
            message: 'Planeación creada exitosamente',
            data: planeacion,
        });
    });

    /**
     * PATCH /api/planeacion/:id
     * Actualizar planeación
     */
    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updatePlaneacionSchema.parse(req.body);
        const planeacion = await planeacionService.update(id, data);
        
        res.json({
            success: true,
            message: 'Planeación actualizada',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/enviar-revision
     * Enviar planeación a revisión
     */
    enviarARevision = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const planeacion = await planeacionService.enviarARevision(id);
        
        res.json({
            success: true,
            message: 'Planeación enviada a revisión',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/aprobar
     * Aprobar planeación
     */
    aprobar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autenticado', 401);

        const data = aprobarPlaneacionSchema.parse(req.body);
        const planeacion = await planeacionService.aprobar(id, userId, data);
        
        res.json({
            success: true,
            message: 'Planeación aprobada',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/rechazar
     * Rechazar planeación
     */
    rechazar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { observaciones } = req.body;
        const planeacion = await planeacionService.rechazar(id, observaciones);
        
        res.json({
            success: true,
            message: 'Planeación rechazada y devuelta a borrador',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/iniciar
     * Iniciar ejecución de planeación
     */
    iniciarEjecucion = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const planeacion = await planeacionService.iniciarEjecucion(id);
        
        res.json({
            success: true,
            message: 'Ejecución iniciada',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/completar
     * Completar planeación
     */
    completar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const planeacion = await planeacionService.completar(id);
        
        res.json({
            success: true,
            message: 'Planeación completada',
            data: planeacion,
        });
    });

    /**
     * POST /api/planeacion/:id/cancelar
     * Cancelar planeación
     */
    cancelar = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const planeacion = await planeacionService.cancelar(id);
        
        res.json({
            success: true,
            message: 'Planeación cancelada',
            data: planeacion,
        });
    });

    /**
     * DELETE /api/planeacion/:id
     * Eliminar planeación (solo borradores)
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await planeacionService.delete(id);
        
        res.json({
            success: true,
            message: 'Planeación eliminada',
        });
    });
}

export const planeacionController = new PlaneacionController();
