import { Request, Response, NextFunction } from 'express';
import { EjecucionService, ejecucionService } from './ejecucion.service.js';
import type { CreateEjecucionDTO, UpdateEjecucionDTO, ActualizarTareaDTO, ListEjecucionQuery } from './ejecucion.types.js';

export class EjecucionController {
    constructor(private readonly service: EjecucionService = ejecucionService) { }

    /**
     * POST /api/ejecucion - Iniciar nueva ejecución
     */
    iniciar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req.body as CreateEjecucionDTO;
            const userId = req.user?.userId || 'system';

            const ejecucion = await this.service.iniciarEjecucion(data, userId);

            res.status(201).json({
                status: 'success',
                message: 'Ejecución iniciada exitosamente',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/ejecucion - Listar ejecuciones
     */
    listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = req.query as unknown as ListEjecucionQuery;
            const result = await this.service.listarEjecuciones(query);

            res.json({
                status: 'success',
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/ejecucion/:id - Obtener ejecución por ID
     */
    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const ejecucion = await this.service.getEjecucion(id);

            res.json({
                status: 'success',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/ejecucion/orden/:ordenId - Obtener ejecución por ID de orden
     */
    getByOrdenId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ordenId } = req.params;
            const ejecucion = await this.service.getEjecucionByOrdenId(ordenId);

            res.json({
                status: 'success',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/ejecucion/:id - Actualizar progreso
     */
    actualizarProgreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const data = req.body as UpdateEjecucionDTO;
            const userId = req.user?.userId || 'system';

            const ejecucion = await this.service.actualizarProgreso(id, data, userId);

            res.json({
                status: 'success',
                message: 'Progreso actualizado',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/ejecucion/:id/tarea - Completar tarea
     */
    completarTarea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const data = req.body as ActualizarTareaDTO;
            const userId = req.user?.userId || 'system';

            await this.service.completarTarea(id, data, userId);

            res.json({
                status: 'success',
                message: 'Tarea completada exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/ejecucion/:id/checklist/:checklistId - Actualizar checklist
     */
    actualizarChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id, checklistId } = req.params;
            const { completada } = req.body;
            const userId = req.user?.userId || 'system';

            await this.service.actualizarChecklist(id, checklistId, completada, userId);

            res.json({
                status: 'success',
                message: 'Checklist actualizado',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/ejecucion/:id/finalizar - Finalizar ejecución
     */
    finalizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || 'system';

            const ejecucion = await this.service.finalizarEjecucion(id, userId);

            res.json({
                status: 'success',
                message: 'Ejecución finalizada exitosamente',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/ejecucion/:id/pausar - Pausar ejecución
     */
    pausar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { observaciones } = req.body;
            const userId = req.user?.userId || 'system';

            const ejecucion = await this.service.pausarEjecucion(id, observaciones, userId);

            res.json({
                status: 'success',
                message: 'Ejecución pausada',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/ejecucion/:id/reanudar - Reanudar ejecución
     */
    reanudar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || 'system';

            const ejecucion = await this.service.reanudarEjecucion(id, userId);

            res.json({
                status: 'success',
                message: 'Ejecución reanudada',
                data: ejecucion,
            });
        } catch (error) {
            next(error);
        }
    };
}

export const ejecucionController = new EjecucionController();
