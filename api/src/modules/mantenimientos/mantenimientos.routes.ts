// ============================================
// MANTENIMIENTOS ROUTES - Cermont FSM
// Rutas API para gestión de mantenimientos
// ============================================

import { Router, Request, Response } from 'express';
import { mantenimientosService } from './mantenimientos.service.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { 
  crearMantenimientoSchema, 
  actualizarMantenimientoSchema,
  completarMantenimientoSchema,
  crearEquipoSchema,
  TipoMantenimiento,
  EstadoMantenimiento,
  PrioridadMantenimiento,
} from './mantenimientos.types.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============================================
// RUTAS DE EQUIPOS
// ============================================

/**
 * GET /api/mantenimientos/equipos
 * Listar todos los equipos
 */
router.get('/equipos', asyncHandler(async (req: Request, res: Response) => {
  const { activo, busqueda } = req.query;
  
  const equipos = await mantenimientosService.getEquipos({
    activo: activo !== undefined ? activo === 'true' : undefined,
    busqueda: busqueda as string,
  });

  res.json({
    status: 'success',
    data: equipos,
  });
}));

/**
 * GET /api/mantenimientos/equipos/:id
 * Obtener equipo por ID
 */
router.get('/equipos/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const equipo = await mantenimientosService.getEquipoById(id);

  res.json({
    status: 'success',
    data: equipo,
  });
}));

/**
 * POST /api/mantenimientos/equipos
 * Crear nuevo equipo
 */
router.post('/equipos', 
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const data = crearEquipoSchema.parse(req.body);
    const userId = req.user?.userId!;
    
    const equipo = await mantenimientosService.crearEquipo(data, userId);

    res.status(201).json({
      status: 'success',
      message: 'Equipo creado exitosamente',
      data: equipo,
    });
  })
);

/**
 * PUT /api/mantenimientos/equipos/:id
 * Actualizar equipo
 */
router.put('/equipos/:id', 
  roleMiddleware(['ADMIN', 'SUPERVISOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = crearEquipoSchema.partial().parse(req.body);
    
    const equipo = await mantenimientosService.actualizarEquipo(id, data);

    res.json({
      status: 'success',
      message: 'Equipo actualizado',
      data: equipo,
    });
  })
);

/**
 * GET /api/mantenimientos/equipos/:id/historial
 * Historial de mantenimientos del equipo
 */
router.get('/equipos/:id/historial', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const historial = await mantenimientosService.getHistorialEquipo(id);

  res.json({
    status: 'success',
    data: historial,
  });
}));

// ============================================
// RUTAS DE MANTENIMIENTOS
// ============================================

/**
 * GET /api/mantenimientos
 * Listar mantenimientos con filtros
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    equipoId, 
    tipo, 
    estado, 
    prioridad, 
    tecnicoId,
    fechaDesde,
    fechaHasta,
    busqueda,
    page,
    limit 
  } = req.query;

  const mantenimientos = await mantenimientosService.getMantenimientos({
    equipoId: equipoId as string,
    tipo: tipo as TipoMantenimiento,
    estado: estado as EstadoMantenimiento,
    prioridad: prioridad as PrioridadMantenimiento,
    tecnicoId: tecnicoId as string,
    fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
    fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
    busqueda: busqueda as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });

  res.json({
    status: 'success',
    ...mantenimientos,
  });
}));

/**
 * GET /api/mantenimientos/resumen
 * Dashboard de mantenimientos
 */
router.get('/resumen', asyncHandler(async (req: Request, res: Response) => {
  const resumen = await mantenimientosService.getResumen();

  res.json({
    status: 'success',
    data: resumen,
  });
}));

/**
 * GET /api/mantenimientos/calendario
 * Calendario de mantenimientos
 */
router.get('/calendario', asyncHandler(async (req: Request, res: Response) => {
  const { mes, año } = req.query;
  
  const hoy = new Date();
  const mesNum = mes ? parseInt(mes as string) : hoy.getMonth() + 1;
  const añoNum = año ? parseInt(año as string) : hoy.getFullYear();

  const calendario = await mantenimientosService.getCalendario(mesNum, añoNum);

  res.json({
    status: 'success',
    data: calendario,
  });
}));

/**
 * GET /api/mantenimientos/alertas
 * Alertas de equipos que necesitan mantenimiento
 */
router.get('/alertas', asyncHandler(async (req: Request, res: Response) => {
  const alertas = await mantenimientosService.getAlertasMantenimiento();

  res.json({
    status: 'success',
    data: alertas,
  });
}));

/**
 * GET /api/mantenimientos/:id
 * Obtener mantenimiento por ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const mantenimiento = await mantenimientosService.getMantenimientoById(id);

  res.json({
    status: 'success',
    data: mantenimiento,
  });
}));

/**
 * POST /api/mantenimientos
 * Crear nuevo mantenimiento
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const data = crearMantenimientoSchema.parse(req.body);
  const userId = req.user?.userId!;

  const mantenimiento = await mantenimientosService.crearMantenimiento(data, userId);

  res.status(201).json({
    status: 'success',
    message: 'Mantenimiento programado exitosamente',
    data: mantenimiento,
  });
}));

/**
 * PUT /api/mantenimientos/:id
 * Actualizar mantenimiento
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = actualizarMantenimientoSchema.parse(req.body);
  const userId = req.user?.userId!;

  const mantenimiento = await mantenimientosService.actualizarMantenimiento(id, data, userId);

  res.json({
    status: 'success',
    message: 'Mantenimiento actualizado',
    data: mantenimiento,
  });
}));

/**
 * POST /api/mantenimientos/:id/iniciar
 * Iniciar mantenimiento
 */
router.post('/:id/iniciar', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId!;

  const mantenimiento = await mantenimientosService.iniciarMantenimiento(id, userId);

  res.json({
    status: 'success',
    message: 'Mantenimiento iniciado',
    data: mantenimiento,
  });
}));

/**
 * POST /api/mantenimientos/:id/completar
 * Completar mantenimiento
 */
router.post('/:id/completar', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = completarMantenimientoSchema.parse(req.body);
  const userId = req.user?.userId!;

  const mantenimiento = await mantenimientosService.completarMantenimiento(id, data, userId);

  res.json({
    status: 'success',
    message: 'Mantenimiento completado exitosamente',
    data: mantenimiento,
  });
}));

/**
 * POST /api/mantenimientos/:id/cancelar
 * Cancelar mantenimiento
 */
router.post('/:id/cancelar', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const userId = req.user?.userId!;

  if (!motivo) {
    return res.status(400).json({
      status: 'error',
      message: 'Debe proporcionar un motivo de cancelación',
    });
  }

  const mantenimiento = await mantenimientosService.cancelarMantenimiento(id, motivo, userId);

  res.json({
    status: 'success',
    message: 'Mantenimiento cancelado',
    data: mantenimiento,
  });
}));

export default router;
