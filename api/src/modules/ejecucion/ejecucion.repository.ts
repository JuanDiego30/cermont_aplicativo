import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import type { CreateEjecucionDTO, UpdateEjecucionDTO, Ejecucion } from './ejecucion.types.js';

// Helper type for Prisma TareaEjecucion
interface PrismaTareaEjecucion {
    id: string;
    horasReales: number | null;
    completada: boolean;
}

export class EjecucionRepository {
    /**
     * Buscar ejecución por ID de orden
     */
    async findByOrdenId(ordenId: string): Promise<Ejecucion | null> {
        try {
            const result = await prisma.ejecucion.findFirst({
                where: { ordenId },
                include: {
                    tareas: true,
                    checklists: true,
                },
            });
            return result as unknown as Ejecucion | null;
        } catch (error) {
            logger.error(`Error al obtener ejecución de orden ${ordenId}:`, error);
            throw error;
        }
    }

    /**
     * Buscar ejecución por ID
     */
    async findById(id: string): Promise<Ejecucion | null> {
        try {
            const result = await prisma.ejecucion.findUnique({
                where: { id },
                include: {
                    tareas: true,
                    checklists: true,
                    orden: true,
                    planeacion: true,
                },
            });
            return result as unknown as Ejecucion | null;
        } catch (error) {
            logger.error(`Error al obtener ejecución ${id}:`, error);
            throw error;
        }
    }

    /**
     * Listar ejecuciones con paginación
     */
    async findAll(params: { page: number; limit: number; estado?: string }) {
        try {
            const { page, limit, estado } = params;
            const skip = (page - 1) * limit;

            const where = estado ? { estado: estado as any } : {};

            const [data, total] = await Promise.all([
                prisma.ejecucion.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        orden: { select: { numero: true, cliente: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.ejecucion.count({ where }),
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error('Error al listar ejecuciones:', error);
            throw error;
        }
    }

    /**
     * Crear nueva ejecución
     */
    async create(data: CreateEjecucionDTO & { horasEstimadas: number }): Promise<Ejecucion> {
        try {
            const result = await prisma.ejecucion.create({
                data: {
                    ordenId: data.ordenId,
                    planeacionId: data.planeacionId,
                    fechaInicio: data.fechaInicio,
                    horasEstimadas: data.horasEstimadas,
                    ubicacionGPS: data.ubicacionGPS as any,
                    observacionesInicio: data.observacionesInicio,
                },
                include: {
                    tareas: true,
                    checklists: true,
                },
            });
            return result as unknown as Ejecucion;
        } catch (error) {
            logger.error('Error al crear ejecución:', error);
            throw error;
        }
    }

    /**
     * Actualizar ejecución
     */
    async update(id: string, data: UpdateEjecucionDTO): Promise<Ejecucion> {
        try {
            const updateData: Record<string, any> = {};
            if (data.estado) updateData.estado = data.estado;
            if (data.avancePercentaje !== undefined) updateData.avancePercentaje = data.avancePercentaje;
            if (data.horasActuales !== undefined) updateData.horasActuales = data.horasActuales;
            if (data.observaciones) updateData.observaciones = data.observaciones;
            if (data.ubicacionGPS) updateData.ubicacionGPS = data.ubicacionGPS;

            const result = await prisma.ejecucion.update({
                where: { id },
                data: updateData,
                include: {
                    tareas: true,
                    checklists: true,
                },
            });
            return result as unknown as Ejecucion;
        } catch (error) {
            logger.error(`Error al actualizar ejecución ${id}:`, error);
            throw error;
        }
    }

    /**
     * Completar una tarea
     */
    async completarTarea(ejecucionId: string, tareaId: string, horasReales: number, observaciones?: string): Promise<void> {
        try {
            await prisma.tareaEjecucion.update({
                where: { id: tareaId },
                data: {
                    completada: true,
                    horasReales,
                    observaciones,
                    completadaEn: new Date(),
                },
            });

            // Actualizar horas totales en ejecución
            const tareas = await prisma.tareaEjecucion.findMany({
                where: { ejecucionId },
            });

            const totalHoras = tareas.reduce((sum: number, t: PrismaTareaEjecucion) => sum + (t.horasReales || 0), 0);
            const tareasCompletadas = tareas.filter((t: PrismaTareaEjecucion) => t.completada).length;
            const avance = tareas.length > 0 ? Math.round((tareasCompletadas / tareas.length) * 100) : 0;

            await prisma.ejecucion.update({
                where: { id: ejecucionId },
                data: {
                    horasActuales: totalHoras,
                    avancePercentaje: avance,
                },
            });
        } catch (error) {
            logger.error(`Error al completar tarea ${tareaId}:`, error);
            throw error;
        }
    }

    /**
     * Actualizar item de checklist
     */
    async actualizarChecklist(checklistId: string, completada: boolean, usuarioId?: string): Promise<void> {
        try {
            await prisma.checklistEjecucion.update({
                where: { id: checklistId },
                data: {
                    completada,
                    completadoPor: usuarioId,
                    completadoEn: completada ? new Date() : null,
                },
            });
        } catch (error) {
            logger.error(`Error al actualizar checklist ${checklistId}:`, error);
            throw error;
        }
    }

    /**
     * Finalizar ejecución
     */
    async finalizarEjecucion(id: string): Promise<Ejecucion> {
        try {
            const result = await prisma.ejecucion.update({
                where: { id },
                data: {
                    estado: 'COMPLETADA',
                    avancePercentaje: 100,
                    fechaTermino: new Date(),
                },
                include: {
                    tareas: true,
                    checklists: true,
                },
            });
            return result as unknown as Ejecucion;
        } catch (error) {
            logger.error(`Error al finalizar ejecución ${id}:`, error);
            throw error;
        }
    }

    /**
     * Agregar tarea a ejecución
     */
    async agregarTarea(ejecucionId: string, descripcion: string, horasEstimadas: number) {
        try {
            return await prisma.tareaEjecucion.create({
                data: {
                    ejecucionId,
                    descripcion,
                    horasEstimadas,
                },
            });
        } catch (error) {
            logger.error('Error al agregar tarea:', error);
            throw error;
        }
    }

    /**
     * Agregar item a checklist
     */
    async agregarChecklist(ejecucionId: string, item: string) {
        try {
            return await prisma.checklistEjecucion.create({
                data: {
                    ejecucionId,
                    item,
                },
            });
        } catch (error) {
            logger.error('Error al agregar checklist:', error);
            throw error;
        }
    }
}

export const ejecucionRepository = new EjecucionRepository();
