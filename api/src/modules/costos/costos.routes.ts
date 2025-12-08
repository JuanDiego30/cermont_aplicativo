// ============================================
// COSTOS ROUTES - Cermont FSM
// ============================================

import { Router, Request, Response } from 'express';
import { costosService, registrarCostoSchema } from './costos.service.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * POST /api/costos/registrar
 * Registrar un nuevo costo
 */
router.post('/registrar', asyncHandler(async (req: Request, res: Response) => {
    const data = registrarCostoSchema.parse(req.body);
    const userId = req.user?.userId;

    const costo = await costosService.registrarCosto(data, userId!);

    res.status(201).json({
        status: 'success',
        message: 'Costo registrado exitosamente',
        data: costo,
    });
}));

/**
 * GET /api/costos/orden/:ordenId
 * Obtener costos de una orden
 */
router.get('/orden/:ordenId', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const orden = await costosService.getCostosByOrden(ordenId);

    res.json({
        status: 'success',
        data: orden,
    });
}));

/**
 * GET /api/costos/resumen/:ordenId
 * Obtener resumen de costos con comparativo
 */
router.get('/resumen/:ordenId', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const resumen = await costosService.getResumenCostos(ordenId);

    res.json({
        status: 'success',
        data: resumen,
    });
}));

/**
 * GET /api/costos/comparativo/:ordenId
 * Comparativo presupuesto vs real
 */
router.get('/comparativo/:ordenId', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const comparativo = await costosService.getComparativo(ordenId);

    res.json({
        status: 'success',
        data: comparativo,
    });
}));

/**
 * GET /api/costos/periodo
 * Resumen de costos por período
 */
router.get('/periodo', roleMiddleware('admin', 'supervisor'), asyncHandler(async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin } = req.query;

    const inicio = fechaInicio ? new Date(fechaInicio as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fin = fechaFin ? new Date(fechaFin as string) : new Date();

    const resumen = await costosService.getResumenPeriodo(inicio, fin);

    res.json({
        status: 'success',
        data: resumen,
    });
}));

/**
 * PUT /api/costos/:costoId
 * Actualizar un costo
 */
router.put('/:costoId', asyncHandler(async (req: Request, res: Response) => {
    const { costoId } = req.params;
    const costo = await costosService.actualizarCosto(costoId, req.body);

    res.json({
        status: 'success',
        message: 'Costo actualizado',
        data: costo,
    });
}));

/**
 * DELETE /api/costos/:costoId
 * Eliminar un costo
 */
router.delete('/:costoId', roleMiddleware('admin', 'supervisor'), asyncHandler(async (req: Request, res: Response) => {
    const { costoId } = req.params;
    await costosService.eliminarCosto(costoId);

    res.json({
        status: 'success',
        message: 'Costo eliminado',
    });
}));

export default router;
