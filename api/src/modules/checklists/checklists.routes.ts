// ============================================
// CHECKLISTS ROUTES - Cermont FSM
// ============================================

import { Router, Request, Response } from 'express';
import { checklistsService, crearChecklistTemplateSchema, ejecutarChecklistSchema } from './checklists.service.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/checklists/templates
 * Obtener plantillas de checklist
 */
router.get('/templates', asyncHandler(async (req: Request, res: Response) => {
    const { tipo } = req.query;
    const templates = await checklistsService.getTemplatesByTipo(tipo as string | undefined);

    res.json({
        status: 'success',
        data: templates,
    });
}));

/**
 * POST /api/checklists/templates
 * Crear nueva plantilla (solo admin/supervisor)
 */
router.post('/templates', roleMiddleware('admin', 'supervisor'), asyncHandler(async (req: Request, res: Response) => {
    const data = crearChecklistTemplateSchema.parse(req.body);
    const userId = req.user?.userId;
    const template = await checklistsService.crearTemplate(data, userId!);

    res.status(201).json({
        status: 'success',
        data: template,
    });
}));

/**
 * GET /api/checklists/orden/:ordenId
 * Obtener checklists de una orden
 */
router.get('/orden/:ordenId', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const checklists = await checklistsService.getChecklistsByOrden(ordenId);

    res.json({
        status: 'success',
        data: checklists,
    });
}));

/**
 * GET /api/checklists/orden/:ordenId/from-kit
 * Obtener items del checklist del kit asociado
 */
router.get('/orden/:ordenId/from-kit', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const items = await checklistsService.getChecklistFromKit(ordenId);

    res.json({
        status: 'success',
        data: items,
    });
}));

/**
 * POST /api/checklists/ejecutar
 * Ejecutar/guardar checklist
 */
router.post('/ejecutar', asyncHandler(async (req: Request, res: Response) => {
    const data = ejecutarChecklistSchema.parse(req.body);
    const tecnicoId = req.user?.userId;
    const ejecucion = await checklistsService.ejecutarChecklist(data, tecnicoId!);

    res.status(201).json({
        status: 'success',
        message: 'Checklist guardado exitosamente',
        data: ejecucion,
    });
}));

/**
 * GET /api/checklists/orden/:ordenId/verificar
 * Verificar si checklists están completos
 */
router.get('/orden/:ordenId/verificar', asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const resultado = await checklistsService.verificarCompletitud(ordenId);

    res.json({
        status: 'success',
        data: resultado,
    });
}));

export default router;
