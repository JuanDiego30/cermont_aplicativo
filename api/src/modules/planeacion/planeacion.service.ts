// ============================================
// PLANEACIÓN SERVICE - Cermont FSM
// ============================================

import { PlaneacionRepository, planeacionRepository } from './planeacion.repository.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import { EstadoPlaneacion } from './planeacion.types.js';
import type { 
    CreatePlaneacionDTO, 
    UpdatePlaneacionDTO, 
    PlaneacionFilters,
    PlaneacionConRelaciones,
    AprobarPlaneacionDTO
} from './planeacion.types.js';

export class PlaneacionService {
    constructor(private readonly repository: PlaneacionRepository = planeacionRepository) {}

    /**
     * Crear nueva planeación para una orden
     */
    async create(data: CreatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        logger.info(`Creando planeación para orden ${data.ordenId}`);

        // Verificar que no exista planeación para esta orden
        const exists = await this.repository.existsForOrden(data.ordenId);
        if (exists) {
            throw new AppError('Ya existe una planeación para esta orden', 409);
        }

        // Validar coherencia de fechas en cronograma
        this.validarCronograma(data.cronograma);

        return await this.repository.create(data);
    }

    /**
     * Obtener planeación por ID
     */
    async findById(id: string): Promise<PlaneacionConRelaciones> {
        const planeacion = await this.repository.findById(id);
        if (!planeacion) {
            throw new AppError('Planeación no encontrada', 404);
        }
        return planeacion;
    }

    /**
     * Obtener planeación de una orden
     */
    async findByOrdenId(ordenId: string): Promise<PlaneacionConRelaciones> {
        const planeacion = await this.repository.findByOrdenId(ordenId);
        if (!planeacion) {
            throw new AppError('Esta orden no tiene planeación', 404);
        }
        return planeacion;
    }

    /**
     * Listar planeaciones con filtros
     */
    async findAll(filters: PlaneacionFilters) {
        return await this.repository.findAll(filters);
    }

    /**
     * Actualizar planeación
     */
    async update(id: string, data: UpdatePlaneacionDTO): Promise<PlaneacionConRelaciones> {
        logger.info(`Actualizando planeación ${id}`);

        const planeacion = await this.findById(id);

        // Solo se puede editar si está en borrador o en revisión
        if (![EstadoPlaneacion.BORRADOR, EstadoPlaneacion.EN_REVISION].includes(planeacion.estado as EstadoPlaneacion)) {
            throw new AppError('Solo se pueden editar planeaciones en borrador o revisión', 400);
        }

        // Validar cronograma si se actualiza
        if (data.cronograma) {
            this.validarCronograma(data.cronograma);
        }

        return await this.repository.update(id, data);
    }

    /**
     * Enviar a revisión
     */
    async enviarARevision(id: string): Promise<PlaneacionConRelaciones> {
        logger.info(`Enviando planeación ${id} a revisión`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.BORRADOR) {
            throw new AppError('Solo planeaciones en borrador pueden enviarse a revisión', 400);
        }

        return await this.repository.updateEstado(id, EstadoPlaneacion.EN_REVISION);
    }

    /**
     * Aprobar planeación
     */
    async aprobar(id: string, aprobadorId: string, data?: AprobarPlaneacionDTO): Promise<PlaneacionConRelaciones> {
        logger.info(`Aprobando planeación ${id} por usuario ${aprobadorId}`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.EN_REVISION) {
            throw new AppError('Solo planeaciones en revisión pueden aprobarse', 400);
        }

        return await this.repository.aprobar(id, aprobadorId, data?.observaciones);
    }

    /**
     * Rechazar planeación (devolver a borrador)
     */
    async rechazar(id: string, observaciones?: string): Promise<PlaneacionConRelaciones> {
        logger.info(`Rechazando planeación ${id}`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.EN_REVISION) {
            throw new AppError('Solo planeaciones en revisión pueden rechazarse', 400);
        }

        // Actualizar con observaciones y volver a borrador
        if (observaciones) {
            await this.repository.update(id, { observaciones });
        }

        return await this.repository.updateEstado(id, EstadoPlaneacion.BORRADOR);
    }

    /**
     * Iniciar ejecución de planeación
     */
    async iniciarEjecucion(id: string): Promise<PlaneacionConRelaciones> {
        logger.info(`Iniciando ejecución de planeación ${id}`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.APROBADA) {
            throw new AppError('Solo planeaciones aprobadas pueden iniciarse', 400);
        }

        return await this.repository.updateEstado(id, EstadoPlaneacion.EN_EJECUCION);
    }

    /**
     * Completar planeación
     */
    async completar(id: string): Promise<PlaneacionConRelaciones> {
        logger.info(`Completando planeación ${id}`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.EN_EJECUCION) {
            throw new AppError('Solo planeaciones en ejecución pueden completarse', 400);
        }

        return await this.repository.updateEstado(id, EstadoPlaneacion.COMPLETADA);
    }

    /**
     * Cancelar planeación
     */
    async cancelar(id: string): Promise<PlaneacionConRelaciones> {
        logger.info(`Cancelando planeación ${id}`);

        const planeacion = await this.findById(id);

        // No se puede cancelar si ya está completada
        if (planeacion.estado === EstadoPlaneacion.COMPLETADA) {
            throw new AppError('No se puede cancelar una planeación completada', 400);
        }

        return await this.repository.updateEstado(id, EstadoPlaneacion.CANCELADA);
    }

    /**
     * Eliminar planeación (solo borradores)
     */
    async delete(id: string): Promise<void> {
        logger.info(`Eliminando planeación ${id}`);

        const planeacion = await this.findById(id);

        if (planeacion.estado !== EstadoPlaneacion.BORRADOR) {
            throw new AppError('Solo se pueden eliminar planeaciones en borrador', 400);
        }

        await this.repository.delete(id);
    }

    /**
     * Validar coherencia del cronograma
     */
    private validarCronograma(cronograma: Array<{ fechaInicio: Date; fechaFin: Date }>): void {
        for (const actividad of cronograma) {
            if (new Date(actividad.fechaFin) < new Date(actividad.fechaInicio)) {
                throw new AppError('La fecha de fin no puede ser anterior a la fecha de inicio', 400);
            }
        }
    }
}

export const planeacionService = new PlaneacionService();
