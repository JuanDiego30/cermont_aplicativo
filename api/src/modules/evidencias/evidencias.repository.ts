import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import type { Evidencia, TipoEvidencia } from './evidencias.types.js';

export interface CreateEvidenciaData {
    ejecucionId: string;
    ordenId: string;
    tipo: TipoEvidencia;
    nombreArchivo: string;
    rutaArchivo: string;
    tamano: number;
    mimeType: string;
    descripcion: string;
    ubicacionGPS?: { latitud: number; longitud: number };
    tags: string[];
    subidoPor: string;
}

export class EvidenciasRepository {
    /**
     * Buscar evidencias por ID de ejecución
     */
    async findByEjecucionId(ejecucionId: string): Promise<Evidencia[]> {
        try {
            const results = await prisma.evidenciaEjecucion.findMany({
                where: { ejecucionId },
                orderBy: { createdAt: 'desc' },
            });
            return results as unknown as Evidencia[];
        } catch (error) {
            logger.error(`Error al obtener evidencias de ejecución ${ejecucionId}:`, error);
            throw error;
        }
    }

    /**
     * Buscar evidencias por ID de orden
     */
    async findByOrdenId(ordenId: string): Promise<Evidencia[]> {
        try {
            const results = await prisma.evidenciaEjecucion.findMany({
                where: { ordenId },
                orderBy: { createdAt: 'desc' },
            });
            return results as unknown as Evidencia[];
        } catch (error) {
            logger.error(`Error al obtener evidencias de orden ${ordenId}:`, error);
            throw error;
        }
    }

    /**
     * Buscar evidencia por ID
     */
    async findById(id: string): Promise<Evidencia | null> {
        try {
            const result = await prisma.evidenciaEjecucion.findUnique({
                where: { id },
            });
            return result as unknown as Evidencia | null;
        } catch (error) {
            logger.error(`Error al obtener evidencia ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear nueva evidencia
     */
    async create(data: CreateEvidenciaData): Promise<Evidencia> {
        try {
            const result = await prisma.evidenciaEjecucion.create({
                data: {
                    ejecucionId: data.ejecucionId,
                    ordenId: data.ordenId,
                    tipo: data.tipo,
                    nombreArchivo: data.nombreArchivo,
                    rutaArchivo: data.rutaArchivo,
                    tamano: data.tamano,
                    mimeType: data.mimeType,
                    descripcion: data.descripcion,
                    ubicacionGPS: data.ubicacionGPS as any,
                    tags: data.tags,
                    subidoPor: data.subidoPor,
                },
            });
            return result as unknown as Evidencia;
        } catch (error) {
            logger.error('Error al crear evidencia:', error);
            throw error;
        }
    }

    /**
     * Verificar evidencia
     */
    async verificar(id: string, userId: string): Promise<Evidencia> {
        try {
            const result = await prisma.evidenciaEjecucion.update({
                where: { id },
                data: {
                    verificada: true,
                    verificadoPor: userId,
                    verificadoEn: new Date(),
                },
            });
            return result as unknown as Evidencia;
        } catch (error) {
            logger.error(`Error al verificar evidencia ${id}:`, error);
            throw error;
        }
    }

    /**
     * Rechazar verificación
     */
    async rechazarVerificacion(id: string): Promise<Evidencia> {
        try {
            const result = await prisma.evidenciaEjecucion.update({
                where: { id },
                data: {
                    verificada: false,
                    verificadoPor: null,
                    verificadoEn: null,
                },
            });
            return result as unknown as Evidencia;
        } catch (error) {
            logger.error(`Error al rechazar verificación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar evidencia
     */
    async delete(id: string): Promise<void> {
        try {
            await prisma.evidenciaEjecucion.delete({ where: { id } });
        } catch (error) {
            logger.error(`Error al eliminar evidencia ${id}:`, error);
            throw error;
        }
    }

    /**
     * Contar evidencias por ejecución
     */
    async countByEjecucion(ejecucionId: string): Promise<number> {
        try {
            return await prisma.evidenciaEjecucion.count({
                where: { ejecucionId },
            });
        } catch (error) {
            logger.error('Error al contar evidencias:', error);
            throw error;
        }
    }

    /**
     * Listar con paginación
     */
    async findAll(params: {
        page: number;
        limit: number;
        tipo?: TipoEvidencia;
        verificada?: boolean;
        ordenId?: string;
    }) {
        try {
            const { page, limit, tipo, verificada, ordenId } = params;
            const skip = (page - 1) * limit;

            const where: any = {};
            if (tipo) where.tipo = tipo;
            if (verificada !== undefined) where.verificada = verificada;
            if (ordenId) where.ordenId = ordenId;

            const [data, total] = await Promise.all([
                prisma.evidenciaEjecucion.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.evidenciaEjecucion.count({ where }),
            ]);

            return {
                data: data as unknown as Evidencia[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error('Error al listar evidencias:', error);
            throw error;
        }
    }
}

export const evidenciasRepository = new EvidenciasRepository();
