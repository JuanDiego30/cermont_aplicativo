import { EvidenciasRepository, evidenciasRepository } from './evidencias.repository.js';
import { UploadService, uploadService } from './upload.service.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { EvidenciaWithUrl, UploadEvidenciaDTO, TipoEvidencia, ListEvidenciasQuery } from './evidencias.types.js';

export class EvidenciasService {
    constructor(
        private readonly repository: EvidenciasRepository = evidenciasRepository,
        private readonly upload: UploadService = uploadService
    ) { }

    /**
     * Subir nueva evidencia
     */
    async uploadEvidencia(
        ejecucionId: string,
        ordenId: string,
        file: Express.Multer.File,
        metadata: UploadEvidenciaDTO,
        userId: string
    ): Promise<EvidenciaWithUrl> {
        logger.info(`Usuario ${userId} subiendo evidencia para ejecución ${ejecucionId}`);

        // Validar tipo de archivo según tipo de evidencia
        this.validarTipoArchivo(file, metadata.tipo);

        // Guardar archivo
        const { rutaArchivo, nombreArchivo, tamano, mimeType } = await this.upload.saveFile(file, 'evidencias');

        // Guardar registro en BD
        const evidencia = await this.repository.create({
            ejecucionId,
            ordenId,
            tipo: metadata.tipo,
            nombreArchivo,
            rutaArchivo,
            tamano,
            mimeType,
            descripcion: metadata.descripcion,
            ubicacionGPS: metadata.ubicacionGPS,
            tags: metadata.tags || [],
            subidoPor: userId,
        });

        logger.info(`Evidencia creada: ${evidencia.id}`);

        return {
            ...evidencia,
            url: this.upload.getFileUrl(rutaArchivo),
        };
    }

    /**
     * Validar tipo de archivo según tipo de evidencia
     */
    private validarTipoArchivo(file: Express.Multer.File, tipo: TipoEvidencia): void {
        const allowedMimes: Record<TipoEvidencia, string[]> = {
            FOTO: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
            DOCUMENTO: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            FIRMA: ['image/png', 'image/jpeg', 'image/svg+xml'],
            AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        };

        const allowed = allowedMimes[tipo];
        if (allowed && !allowed.includes(file.mimetype)) {
            throw AppError.badRequest(`Tipo de archivo no permitido para ${tipo}. Permitidos: ${allowed.join(', ')}`);
        }

        // Validar tamaño (máx 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw AppError.badRequest('El archivo excede el tamaño máximo de 50MB');
        }
    }

    /**
     * Obtener evidencias por ejecución
     */
    async getEvidenciasByEjecucion(ejecucionId: string): Promise<EvidenciaWithUrl[]> {
        const evidencias = await this.repository.findByEjecucionId(ejecucionId);

        return evidencias.map((e) => ({
            ...e,
            url: this.upload.getFileUrl(e.rutaArchivo),
        }));
    }

    /**
     * Obtener evidencias por orden
     */
    async getEvidenciasByOrden(ordenId: string): Promise<EvidenciaWithUrl[]> {
        const evidencias = await this.repository.findByOrdenId(ordenId);

        return evidencias.map((e) => ({
            ...e,
            url: this.upload.getFileUrl(e.rutaArchivo),
        }));
    }

    /**
     * Obtener evidencia por ID
     */
    async getEvidencia(id: string): Promise<EvidenciaWithUrl> {
        const evidencia = await this.repository.findById(id);

        if (!evidencia) {
            throw AppError.notFound('Evidencia');
        }

        return {
            ...evidencia,
            url: this.upload.getFileUrl(evidencia.rutaArchivo),
        };
    }

    /**
     * Listar evidencias con paginación
     */
    async listarEvidencias(query: ListEvidenciasQuery & { ordenId?: string }) {
        const result = await this.repository.findAll({
            page: query.page || 1,
            limit: query.limit || 20,
            tipo: query.tipo,
            verificada: query.verificada,
            ordenId: query.ordenId,
        });

        return {
            ...result,
            data: result.data.map((e) => ({
                ...e,
                url: this.upload.getFileUrl(e.rutaArchivo),
            })),
        };
    }

    /**
     * Verificar evidencia
     */
    async verificarEvidencia(id: string, userId: string): Promise<EvidenciaWithUrl> {
        logger.info(`Usuario ${userId} verificando evidencia ${id}`);

        const evidencia = await this.repository.verificar(id, userId);

        return {
            ...evidencia,
            url: this.upload.getFileUrl(evidencia.rutaArchivo),
        };
    }

    /**
     * Rechazar verificación
     */
    async rechazarVerificacion(id: string, userId: string): Promise<EvidenciaWithUrl> {
        logger.info(`Usuario ${userId} rechazando verificación de evidencia ${id}`);

        const evidencia = await this.repository.rechazarVerificacion(id);

        return {
            ...evidencia,
            url: this.upload.getFileUrl(evidencia.rutaArchivo),
        };
    }

    /**
     * Eliminar evidencia
     */
    async deleteEvidencia(id: string, userId: string): Promise<void> {
        logger.info(`Usuario ${userId} eliminando evidencia ${id}`);

        const evidencia = await this.repository.findById(id);
        if (!evidencia) {
            throw AppError.notFound('Evidencia');
        }

        // Eliminar archivo
        await this.upload.deleteFile(evidencia.rutaArchivo);

        // Eliminar registro
        await this.repository.delete(id);
    }

    /**
     * Contar evidencias
     */
    async contarEvidencias(ejecucionId: string): Promise<number> {
        return this.repository.countByEjecucion(ejecucionId);
    }
}

export const evidenciasService = new EvidenciasService();
