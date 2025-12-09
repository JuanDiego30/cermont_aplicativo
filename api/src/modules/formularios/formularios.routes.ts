// ============================================
// FORMULARIOS ROUTES - Cermont FSM
// Rutas API para formularios dinámicos
// ============================================

import { Router, Request, Response } from 'express';
import { formulariosService } from './formularios.service.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  crearTemplateSchema,
  actualizarTemplateSchema,
  guardarRespuestaSchema,
} from './formularios.types.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============================================
// RUTAS DE TEMPLATES
// ============================================

/**
 * GET /api/formularios/templates
 * Listar todos los templates
 */
router.get('/templates', asyncHandler(async (req: Request, res: Response) => {
  const { activo, busqueda } = req.query;

  const templates = await formulariosService.getTemplates({
    activo: activo !== undefined ? activo === 'true' : undefined,
    busqueda: busqueda as string,
  });

  res.json({
    status: 'success',
    data: templates,
  });
}));

/**
 * GET /api/formularios/templates/:id
 * Obtener template por ID
 */
router.get('/templates/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await formulariosService.getTemplateById(id);

  res.json({
    status: 'success',
    data: template,
  });
}));

/**
 * POST /api/formularios/templates
 * Crear nuevo template
 */
router.post('/templates',
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const data = crearTemplateSchema.parse(req.body);
    const userId = req.user?.userId!;

    const template = await formulariosService.crearTemplate(data, userId);

    res.status(201).json({
      status: 'success',
      message: 'Template creado exitosamente',
      data: template,
    });
  })
);

/**
 * PUT /api/formularios/templates/:id
 * Actualizar template
 */
router.put('/templates/:id',
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = actualizarTemplateSchema.parse(req.body);
    const userId = req.user?.userId!;

    const template = await formulariosService.actualizarTemplate(id, data, userId);

    res.json({
      status: 'success',
      message: 'Template actualizado',
      data: template,
    });
  })
);

/**
 * POST /api/formularios/templates/:id/duplicar
 * Duplicar template
 */
router.post('/templates/:id/duplicar',
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const userId = req.user?.userId!;

    if (!nombre) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe proporcionar un nombre para la copia',
      });
    }

    const template = await formulariosService.duplicarTemplate(id, nombre, userId);

    res.status(201).json({
      status: 'success',
      message: 'Template duplicado exitosamente',
      data: template,
    });
  })
);

/**
 * DELETE /api/formularios/templates/:id
 * Desactivar template
 */
router.delete('/templates/:id',
  roleMiddleware(['ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await formulariosService.desactivarTemplate(id);

    res.json({
      status: 'success',
      message: 'Template desactivado',
    });
  })
);

/**
 * GET /api/formularios/templates/:id/estadisticas
 * Estadísticas de un template
 */
router.get('/templates/:id/estadisticas', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const estadisticas = await formulariosService.getEstadisticasTemplate(id);

  res.json({
    status: 'success',
    data: estadisticas,
  });
}));

// ============================================
// RUTAS DE RESPUESTAS
// ============================================

/**
 * POST /api/formularios/respuestas
 * Guardar respuesta a un formulario
 */
router.post('/respuestas', asyncHandler(async (req: Request, res: Response) => {
  const data = guardarRespuestaSchema.parse(req.body);
  const userId = req.user?.userId!;

  const respuesta = await formulariosService.guardarRespuesta(data, userId);

  res.status(201).json({
    status: 'success',
    message: 'Respuesta guardada exitosamente',
    data: respuesta,
  });
}));

/**
 * GET /api/formularios/respuestas/template/:templateId
 * Obtener respuestas de un template
 */
router.get('/respuestas/template/:templateId', asyncHandler(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { ordenId, page, limit } = req.query;

  const respuestas = await formulariosService.getRespuestasByTemplate(templateId, {
    ordenId: ordenId as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });

  res.json({
    status: 'success',
    ...respuestas,
  });
}));

/**
 * GET /api/formularios/respuestas/orden/:ordenId
 * Obtener respuestas de una orden
 */
router.get('/respuestas/orden/:ordenId', asyncHandler(async (req: Request, res: Response) => {
  const { ordenId } = req.params;
  const respuestas = await formulariosService.getRespuestasByOrden(ordenId);

  res.json({
    status: 'success',
    data: respuestas,
  });
}));

/**
 * GET /api/formularios/respuestas/:id
 * Obtener respuesta por ID
 */
router.get('/respuestas/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const respuesta = await formulariosService.getRespuestaById(id);

  res.json({
    status: 'success',
    data: respuesta,
  });
}));

/**
 * DELETE /api/formularios/respuestas/:id
 * Eliminar respuesta
 */
router.delete('/respuestas/:id',
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await formulariosService.eliminarRespuesta(id);

    res.json({
      status: 'success',
      message: 'Respuesta eliminada',
    });
  })
);

export default router;
