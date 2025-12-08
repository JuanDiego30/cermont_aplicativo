import { Request, Response, NextFunction } from 'express';
import { EvidenciasService, evidenciasService } from './evidencias.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { UploadEvidenciaDTO, ListEvidenciasQuery } from './evidencias.types.js';

export class EvidenciasController {
    constructor(private readonly service: EvidenciasService = evidenciasService) { }

    /**
     * POST /api/evidencias/:ejecucionId/:ordenId/upload - Subir evidencia
     */
    upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw AppError.badRequest('Archivo requerido');
            }

            const { ejecucionId, ordenId } = req.params;

            // Parsear metadata del body
            let metadata: UploadEvidenciaDTO;
            try {
                metadata = JSON.parse(req.body.metadata || '{}');
            } catch {
                throw AppError.badRequest('Metadata inválida');
            }

            const userId = req.user?.userId || 'system';

            const evidencia = await this.service.uploadEvidencia(
                ejecucionId,
                ordenId,
                req.file,
                metadata,
                userId
            );

            res.status(201).json({
                status: 'success',
                message: 'Evidencia subida exitosamente',
                data: evidencia,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/evidencias/ejecucion/:ejecucionId - Obtener por ejecución
     */
    getByEjecucion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ejecucionId } = req.params;

            const evidencias = await this.service.getEvidenciasByEjecucion(ejecucionId);

            res.json({
                status: 'success',
                data: evidencias,
                count: evidencias.length,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/evidencias/orden/:ordenId - Obtener por orden
     */
    getByOrden = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ordenId } = req.params;

            const evidencias = await this.service.getEvidenciasByOrden(ordenId);

            res.json({
                status: 'success',
                data: evidencias,
                count: evidencias.length,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/evidencias/:id - Obtener por ID
     */
    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const evidencia = await this.service.getEvidencia(id);

            res.json({
                status: 'success',
                data: evidencia,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/evidencias - Listar con paginación
     */
    listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = req.query as unknown as ListEvidenciasQuery & { ordenId?: string };

            const result = await this.service.listarEvidencias(query);

            res.json({
                status: 'success',
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/evidencias/:id/verificar - Verificar evidencia
     */
    verificar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || 'system';

            const evidencia = await this.service.verificarEvidencia(id, userId);

            res.json({
                status: 'success',
                message: 'Evidencia verificada',
                data: evidencia,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/evidencias/:id/rechazar - Rechazar verificación
     */
    rechazar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || 'system';

            const evidencia = await this.service.rechazarVerificacion(id, userId);

            res.json({
                status: 'success',
                message: 'Verificación rechazada',
                data: evidencia,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/evidencias/:id - Eliminar evidencia
     */
    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || 'system';

            await this.service.deleteEvidencia(id, userId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

export const evidenciasController = new EvidenciasController();
