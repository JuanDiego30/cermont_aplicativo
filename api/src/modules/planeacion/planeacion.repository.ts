// ============================================
// PLANEACIÓN REPOSITORY - Cermont FSM
// ============================================

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import type { 
    CreatePlaneacionDTO, 
    UpdatePlaneacionDTO, 
    PlaneacionFilters,
    PlaneacionConRelaciones 
} from './planeacion.types.js';
import { EstadoPlaneacion } from './planeacion.types.js';

// Includes comunes para planeación
const planeacionIncludes = {
    orden: {
        select: {
            id: true,
            numero: true,
            descripcion: true,
            cliente: true,
            estado: true,
        }
    },
    kit: {
        select: {
            id: true,
            nombre: true,
            descripcion: true,
        }
    },
    aprobadoPor: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    }
} as const;

export class PlaneacionRepository {

    /**
     * Crear nueva planeación
     */
    async create(data: CreatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        try {
            const planeacion = await prisma.planeacion.create({
                data: {
                    ordenId: data.ordenId,
                    kitId: data.kitId,
                    estado: EstadoPlaneacion.BORRADOR,
                    cronograma: data.cronograma as Prisma.InputJsonValue,
                    manoDeObra: data.manoDeObra as Prisma.InputJsonValue,
                    herramientasAdicionales: data.herramientasAdicionales ? (data.herramientasAdicionales as Prisma.InputJsonValue) : Prisma.JsonNull,
                    documentosApoyo: data.documentosApoyo || [],
                    observaciones: data.observaciones,
                },
                include: planeacionIncludes,
            });

            logger.info(`Planeación creada: ${planeacion.id} para orden ${data.ordenId}`);
            return planeacion as unknown as PlaneacionConRelaciones;
        } catch (error) {
            logger.error('Error al crear planeación:', error);
            throw error;
        }
    }

    /**
     * Obtener planeación por ID
     */
    async findById(id: string): Promise<PlaneacionConRelaciones | null> {
        try {
            const planeacion = await prisma.planeacion.findUnique({
                where: { id },
                include: planeacionIncludes,
            });

            return planeacion as unknown as PlaneacionConRelaciones | null;
        } catch (error) {
            logger.error(`Error al obtener planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener planeación por ID de orden
     */
    async findByOrdenId(ordenId: string): Promise<PlaneacionConRelaciones | null> {
        try {
            const planeacion = await prisma.planeacion.findUnique({
                where: { ordenId },
                include: planeacionIncludes,
            });

            return planeacion as unknown as PlaneacionConRelaciones | null;
        } catch (error) {
            logger.error(`Error al obtener planeación de orden ${ordenId}:`, error);
            throw error;
        }
    }

    /**
     * Listar planeaciones con filtros y paginación
     */
    async findAll(filters: PlaneacionFilters): Promise<{
        data: PlaneacionConRelaciones[];
        total: number;
        pages: number;
    }> {
        try {
            const where: Prisma.PlaneacionWhereInput = {};

            if (filters.estado) {
                where.estado = filters.estado;
            }
            if (filters.kitId) {
                where.kitId = filters.kitId;
            }

            const [data, total] = await Promise.all([
                prisma.planeacion.findMany({
                    where,
                    include: planeacionIncludes,
                    skip: (filters.page - 1) * filters.limit,
                    take: filters.limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.planeacion.count({ where }),
            ]);

            return {
                data: data as unknown as PlaneacionConRelaciones[],
                total,
                pages: Math.ceil(total / filters.limit),
            };
        } catch (error) {
            logger.error('Error al listar planeaciones:', error);
            throw error;
        }
    }

    /**
     * Actualizar planeación
     */
    async update(id: string, data: UpdatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        try {
            const updateData: Prisma.PlaneacionUpdateInput = {};

            if (data.kitId) updateData.kit = { connect: { id: data.kitId } };
            if (data.cronograma) updateData.cronograma = data.cronograma as Prisma.InputJsonValue;
            if (data.manoDeObra) updateData.manoDeObra = data.manoDeObra as Prisma.InputJsonValue;
            if (data.herramientasAdicionales !== undefined) {
                updateData.herramientasAdicionales = data.herramientasAdicionales 
                    ? (data.herramientasAdicionales as Prisma.InputJsonValue) 
                    : Prisma.JsonNull;
            }
            if (data.documentosApoyo) updateData.documentosApoyo = data.documentosApoyo;
            if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

            const planeacion = await prisma.planeacion.update({
                where: { id },
                data: updateData,
                include: planeacionIncludes,
            });

            logger.info(`Planeación actualizada: ${id}`);
            return planeacion as unknown as PlaneacionConRelaciones;
        } catch (error) {
            logger.error(`Error al actualizar planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambiar estado de planeación
     */
    async updateEstado(id: string, estado: EstadoPlaneacion): Promise<PlaneacionConRelaciones> {
        try {
            const planeacion = await prisma.planeacion.update({
                where: { id },
                data: { estado },
                include: planeacionIncludes,
            });

            logger.info(`Estado de planeación ${id} cambiado a ${estado}`);
            return planeacion as unknown as PlaneacionConRelaciones;
        } catch (error) {
            logger.error(`Error al cambiar estado de planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Aprobar planeación
     */
    async aprobar(id: string, aprobadorId: string, observaciones?: string): Promise<PlaneacionConRelaciones> {
        try {
            const planeacion = await prisma.planeacion.update({
                where: { id },
                data: {
                    estado: EstadoPlaneacion.APROBADA,
                    aprobadoPorId: aprobadorId,
                    fechaAprobacion: new Date(),
                    observaciones: observaciones || undefined,
                },
                include: planeacionIncludes,
            });

            logger.info(`Planeación ${id} aprobada por ${aprobadorId}`);
            return planeacion as unknown as PlaneacionConRelaciones;
        } catch (error) {
            logger.error(`Error al aprobar planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar planeación (solo si está en borrador)
     */
    async delete(id: string): Promise<void> {
        try {
            await prisma.planeacion.delete({ where: { id } });
            logger.info(`Planeación eliminada: ${id}`);
        } catch (error) {
            logger.error(`Error al eliminar planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Verificar si existe planeación para una orden
     */
    async existsForOrden(ordenId: string): Promise<boolean> {
        const count = await prisma.planeacion.count({ where: { ordenId } });
        return count > 0;
    }
}

export const planeacionRepository = new PlaneacionRepository();
