import { EjecucionRepository, ejecucionRepository } from './ejecucion.repository.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { CreateEjecucionDTO, UpdateEjecucionDTO, Ejecucion, ActualizarTareaDTO, ListEjecucionQuery } from './ejecucion.types.js';
import { prisma } from '../../config/database.js';

export class EjecucionService {
    constructor(private readonly repository: EjecucionRepository = ejecucionRepository) { }

    /**
     * Iniciar una nueva ejecución para una orden
     */
    async iniciarEjecucion(data: CreateEjecucionDTO, userId: string): Promise<Ejecucion> {
        logger.info(`Usuario ${userId} iniciando ejecución para orden ${data.ordenId}`);

        // Verificar que no exista otra ejecución para esta orden
        const existing = await this.repository.findByOrdenId(data.ordenId);
        if (existing) {
            throw AppError.badRequest('La orden ya tiene una ejecución en progreso');
        }

        // Obtener planeación para calcular horas estimadas
        const planeacion = await prisma.planeacion.findUnique({
            where: { id: data.planeacionId },
            include: { kit: true },
        });

        if (!planeacion) {
            throw AppError.notFound('Planeación');
        }

        // Calcular horas estimadas del kit
        const horasEstimadas = planeacion.kit?.duracionEstimadaHoras || 8;

        const ejecucion = await this.repository.create({
            ...data,
            horasEstimadas,
        });

        // Crear tareas basadas en el checklist del kit
        if (planeacion.kit?.checklistItems) {
            for (const item of planeacion.kit.checklistItems) {
                await this.repository.agregarChecklist(ejecucion.id, item);
            }
        }

        logger.info(`Ejecución creada: ${ejecucion.id}`);
        return ejecucion;
    }

    /**
     * Obtener ejecución por ID
     */
    async getEjecucion(id: string): Promise<Ejecucion> {
        const ejecucion = await this.repository.findById(id);

        if (!ejecucion) {
            throw AppError.notFound('Ejecución');
        }

        return ejecucion;
    }

    /**
     * Obtener ejecución por ID de orden
     */
    async getEjecucionByOrdenId(ordenId: string): Promise<Ejecucion> {
        const ejecucion = await this.repository.findByOrdenId(ordenId);

        if (!ejecucion) {
            throw AppError.notFound('Ejecución para esta orden');
        }

        return ejecucion;
    }

    /**
     * Listar ejecuciones con paginación
     */
    async listarEjecuciones(query: ListEjecucionQuery) {
        return this.repository.findAll({
            page: query.page || 1,
            limit: query.limit || 10,
            estado: query.estado,
        });
    }

    /**
     * Actualizar progreso de ejecución
     */
    async actualizarProgreso(id: string, data: UpdateEjecucionDTO, userId: string): Promise<Ejecucion> {
        logger.info(`Usuario ${userId} actualizando progreso de ejecución ${id}`);

        // Verificar que existe
        await this.getEjecucion(id);

        const ejecucion = await this.repository.update(id, data);

        return ejecucion;
    }

    /**
     * Completar una tarea de la ejecución
     */
    async completarTarea(ejecucionId: string, data: ActualizarTareaDTO, userId: string): Promise<void> {
        logger.info(`Usuario ${userId} completando tarea ${data.tareaId} de ejecución ${ejecucionId}`);

        // Verificar que existe la ejecución
        await this.getEjecucion(ejecucionId);

        await this.repository.completarTarea(
            ejecucionId,
            data.tareaId,
            data.horasReales,
            data.observaciones
        );
    }

    /**
     * Actualizar item de checklist
     */
    async actualizarChecklist(ejecucionId: string, checklistId: string, completada: boolean, userId: string): Promise<void> {
        logger.info(`Usuario ${userId} actualizando checklist ${checklistId}`);

        // Verificar que existe la ejecución
        await this.getEjecucion(ejecucionId);

        await this.repository.actualizarChecklist(checklistId, completada, userId);
    }

    /**
     * Finalizar ejecución
     */
    async finalizarEjecucion(id: string, userId: string): Promise<Ejecucion> {
        logger.info(`Usuario ${userId} finalizando ejecución ${id}`);

        const ejecucion = await this.getEjecucion(id);

        // Verificar que todas las tareas están completadas
        const tareasIncompletas = ejecucion.tareas?.filter(t => !t.completada) || [];
        if (tareasIncompletas.length > 0) {
            throw AppError.badRequest(`Hay ${tareasIncompletas.length} tareas pendientes por completar`);
        }

        // Actualizar estado de la orden a completada
        await prisma.order.update({
            where: { id: ejecucion.ordenId },
            data: { estado: 'completada' },
        });

        return this.repository.finalizarEjecucion(id);
    }

    /**
     * Agregar tarea a ejecución
     */
    async agregarTarea(ejecucionId: string, descripcion: string, horasEstimadas: number) {
        await this.getEjecucion(ejecucionId);
        return this.repository.agregarTarea(ejecucionId, descripcion, horasEstimadas);
    }

    /**
     * Pausar ejecución
     */
    async pausarEjecucion(id: string, observaciones: string, userId: string): Promise<Ejecucion> {
        logger.info(`Usuario ${userId} pausando ejecución ${id}`);

        return this.repository.update(id, {
            estado: 'PAUSADA' as any,
            observaciones,
        });
    }

    /**
     * Reanudar ejecución
     */
    async reanudarEjecucion(id: string, userId: string): Promise<Ejecucion> {
        logger.info(`Usuario ${userId} reanudando ejecución ${id}`);

        return this.repository.update(id, {
            estado: 'EN_PROGRESO' as any,
        });
    }
}

export const ejecucionService = new EjecucionService();
