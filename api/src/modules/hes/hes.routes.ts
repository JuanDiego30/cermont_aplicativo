import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../auth/auth.middleware.js';
import { hesService } from './hes.service.js';
import { logger } from '../../config/logger.js';

const router = Router();

router.use(authMiddleware);

// Crear equipo
router.post('/equipos', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const equipo = await hesService.createEquipo(req.body);
        res.status(201).json({ status: 'success', equipo });
    } catch (error) {
        logger.error('Error creating equipment:', error);
        next(error);
    }
});

// Obtener equipos
router.get('/equipos', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tipo, estado } = req.query;
        const equipos = await hesService.getAllEquipos({
            tipo: tipo as string | undefined,
            estado: estado as string | undefined,
        });
        res.json({ status: 'success', equipos });
    } catch (error) {
        logger.error('Error fetching equipment:', error);
        next(error);
    }
});

// Crear inspección
router.post('/inspeccion', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // req.user is populated by authMiddleware (AuthRequest typically)
        // Asumimos que req.user existe y tiene id. Si no, el middleware fallaría antes.
        const inspectorId = (req as any).user?.id;
        const { equipoId, items, fotosEvidencia, ordenId } = req.body;

        if (!inspectorId) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const inspeccion = await hesService.createInspeccion({
            equipoId,
            inspectorId,
            ordenId,
            items,
            fotosEvidencia,
        });

        res.status(201).json({ status: 'success', inspeccion });
    } catch (error) {
        logger.error('Error creating inspection:', error);
        next(error);
    }
});

// Obtener inspecciones de un equipo
router.get(
    '/inspecciones/:equipoId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { equipoId } = req.params;
            const inspecciones = await hesService.getInspeccionesByEquipo(equipoId);
            res.json({ status: 'success', inspecciones });
        } catch (error) {
            logger.error('Error fetching inspections:', error);
            next(error);
        }
    }
);

// Reporte de estado
router.get(
    '/status-report',
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const report = await hesService.generateStatusReport();
            res.json({ status: 'success', report });
        } catch (error) {
            logger.error('Error generating report:', error);
            next(error);
        }
    }
);

// Asignar equipos a orden
router.post(
    '/asignar/:ordenId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ordenId } = req.params;
            const { equipos } = req.body;

            const asignaciones = await hesService.assignEquiposToOrden(
                ordenId,
                equipos
            );

            res.status(201).json({ status: 'success', asignaciones });
        } catch (error) {
            logger.error('Error assigning equipment:', error);
            next(error);
        }
    }
);

// Devolver equipos
router.post(
    '/devolver/:ordenId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ordenId } = req.params;
            const { equipos } = req.body;

            const result = await hesService.returnEquipos(ordenId, equipos);

            res.json(result);
        } catch (error) {
            logger.error('Error returning equipment:', error);
            next(error);
        }
    }
);

// ============================================
// LÍNEAS DE VIDA
// ============================================

// Obtener inspecciones de líneas de vida
router.get('/lineas-vida', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { estado } = req.query;
        const inspecciones = await hesService.getLineasVida({
            estado: estado as string | undefined,
        });
        res.json({ status: 'success', inspecciones });
    } catch (error) {
        logger.error('Error fetching lineas de vida:', error);
        next(error);
    }
});

// Obtener inspección de línea de vida por ID
router.get('/lineas-vida/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const inspeccion = await hesService.getLineaVidaById(id);

        if (!inspeccion) {
            res.status(404).json({ status: 'error', message: 'Inspección no encontrada' });
            return;
        }

        res.json({ status: 'success', inspeccion });
    } catch (error) {
        logger.error('Error fetching linea de vida:', error);
        next(error);
    }
});

// Crear inspección de línea de vida
router.post('/lineas-vida', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const inspectorId = (req as any).user?.id;

        if (!inspectorId) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const inspeccion = await hesService.createLineaVida({
            ...req.body,
            inspectorId,
        });

        res.status(201).json({ status: 'success', inspeccion });
    } catch (error) {
        logger.error('Error creating linea de vida:', error);
        next(error);
    }
});

export default router;
