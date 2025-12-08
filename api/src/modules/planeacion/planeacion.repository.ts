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
    PlaneacionConRelaciones,
    ItemPlaneacionInput
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
    },
    items: {
        orderBy: {
            tipo: 'asc' as const,
        }
    }
} as const;

export class PlaneacionRepository {

    /**
     * Crear nueva planeación con items
     */
    async create(data: CreatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        try {
            const planeacion = await prisma.$transaction(async (tx) => {
                // Crear la planeación
                const newPlaneacion = await tx.planeacion.create({
                    data: {
                        ordenId: data.ordenId,
                        kitId: data.kitId || null,
                        estado: EstadoPlaneacion.BORRADOR,
                        
                        // Campos del formulario OPE-001
                        empresa: data.empresa,
                        ubicacion: data.ubicacion,
                        fechaEstimadaInicio: data.fechaEstimadaInicio,
                        fechaEstimadaFin: data.fechaEstimadaFin,
                        descripcionTrabajo: data.descripcionTrabajo,
                        
                        cronograma: (data.cronograma || []) as Prisma.InputJsonValue,
                        manoDeObra: (data.manoDeObra || []) as Prisma.InputJsonValue,
                        herramientasAdicionales: data.herramientasAdicionales 
                            ? (data.herramientasAdicionales as Prisma.InputJsonValue) 
                            : Prisma.JsonNull,
                        documentosApoyo: data.documentosApoyo || [],
                        observaciones: data.observaciones,
                    },
                });

                // Crear items si existen
                if (data.items && data.items.length > 0) {
                    await tx.itemPlaneacion.createMany({
                        data: data.items.map(item => ({
                            planeacionId: newPlaneacion.id,
                            tipo: item.tipo,
                            descripcion: item.descripcion,
                            cantidad: item.cantidad,
                            unidad: item.unidad,
                            observaciones: item.observaciones,
                        })),
                    });
                }

                // Retornar con relaciones
                return tx.planeacion.findUnique({
                    where: { id: newPlaneacion.id },
                    include: planeacionIncludes,
                });
            });

            logger.info(`Planeación creada: ${planeacion!.id} para orden ${data.ordenId}`);
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
     * Actualizar planeación con items
     */
    async update(id: string, data: UpdatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        try {
            const planeacion = await prisma.$transaction(async (tx) => {
                const updateData: Prisma.PlaneacionUpdateInput = {};

                // Kit (puede ser null para desvincularlo)
                if (data.kitId !== undefined) {
                    if (data.kitId === null) {
                        updateData.kit = { disconnect: true };
                    } else {
                        updateData.kit = { connect: { id: data.kitId } };
                    }
                }
                
                // Campos del formulario
                if (data.empresa !== undefined) updateData.empresa = data.empresa;
                if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
                if (data.fechaEstimadaInicio !== undefined) updateData.fechaEstimadaInicio = data.fechaEstimadaInicio;
                if (data.fechaEstimadaFin !== undefined) updateData.fechaEstimadaFin = data.fechaEstimadaFin;
                if (data.descripcionTrabajo !== undefined) updateData.descripcionTrabajo = data.descripcionTrabajo;
                
                if (data.cronograma) updateData.cronograma = data.cronograma as Prisma.InputJsonValue;
                if (data.manoDeObra) updateData.manoDeObra = data.manoDeObra as Prisma.InputJsonValue;
                if (data.herramientasAdicionales !== undefined) {
                    updateData.herramientasAdicionales = data.herramientasAdicionales 
                        ? (data.herramientasAdicionales as Prisma.InputJsonValue) 
                        : Prisma.JsonNull;
                }
                if (data.documentosApoyo) updateData.documentosApoyo = data.documentosApoyo;
                if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

                // Actualizar la planeación
                await tx.planeacion.update({
                    where: { id },
                    data: updateData,
                });

                // Actualizar items si se proporcionan (reemplazar todos)
                if (data.items !== undefined) {
                    // Eliminar items existentes
                    await tx.itemPlaneacion.deleteMany({
                        where: { planeacionId: id },
                    });

                    // Crear nuevos items
                    if (data.items.length > 0) {
                        await tx.itemPlaneacion.createMany({
                            data: data.items.map(item => ({
                                planeacionId: id,
                                tipo: item.tipo,
                                descripcion: item.descripcion,
                                cantidad: item.cantidad,
                                unidad: item.unidad,
                                observaciones: item.observaciones,
                            })),
                        });
                    }
                }

                return tx.planeacion.findUnique({
                    where: { id },
                    include: planeacionIncludes,
                });
            });

            logger.info(`Planeación actualizada: ${id}`);
            return planeacion as unknown as PlaneacionConRelaciones;
        } catch (error) {
            logger.error(`Error al actualizar planeación ${id}:`, error);
            throw error;
        }
    }

    /**
     * Agregar item a planeación
     */
    async addItem(planeacionId: string, item: ItemPlaneacionInput) {
        try {
            const newItem = await prisma.itemPlaneacion.create({
                data: {
                    planeacionId,
                    tipo: item.tipo,
                    descripcion: item.descripcion,
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    observaciones: item.observaciones,
                },
            });

            logger.info(`Item agregado a planeación ${planeacionId}`);
            return newItem;
        } catch (error) {
            logger.error(`Error al agregar item a planeación ${planeacionId}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar item de planeación
     */
    async removeItem(itemId: string) {
        try {
            await prisma.itemPlaneacion.delete({
                where: { id: itemId },
            });
            logger.info(`Item ${itemId} eliminado`);
        } catch (error) {
            logger.error(`Error al eliminar item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * Obtener items por tipo
     */
    async getItemsByTipo(planeacionId: string, tipo: string) {
        try {
            return await prisma.itemPlaneacion.findMany({
                where: { planeacionId, tipo },
                orderBy: { createdAt: 'asc' },
            });
        } catch (error) {
            logger.error(`Error al obtener items de planeación ${planeacionId}:`, error);
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

    /**
     * Generar resumen de planeación para dashboard
     */
    async generateResumen(id: string) {
        try {
            const planeacion = await prisma.planeacion.findUnique({
                where: { id },
                include: {
                    items: true,
                    orden: {
                        select: {
                            numero: true,
                            descripcion: true,
                            cliente: true,
                        }
                    },
                },
            });

            if (!planeacion) return null;

            // Agrupar items por tipo
            const itemsPorTipo = {
                materiales: planeacion.items.filter(i => i.tipo === 'MATERIAL'),
                herramientas: planeacion.items.filter(i => i.tipo === 'HERRAMIENTA'),
                equipos: planeacion.items.filter(i => i.tipo === 'EQUIPO'),
                seguridad: planeacion.items.filter(i => i.tipo === 'SEGURIDAD'),
            };

            return {
                id: planeacion.id,
                orden: planeacion.orden,
                empresa: planeacion.empresa,
                ubicacion: planeacion.ubicacion,
                fechas: {
                    inicio: planeacion.fechaEstimadaInicio,
                    fin: planeacion.fechaEstimadaFin,
                },
                descripcionTrabajo: planeacion.descripcionTrabajo,
                estado: planeacion.estado,
                items: itemsPorTipo,
                totalItems: planeacion.items.length,
            };
        } catch (error) {
            logger.error(`Error al generar resumen de planeación ${id}:`, error);
            throw error;
        }
    }
}

export const planeacionRepository = new PlaneacionRepository();
