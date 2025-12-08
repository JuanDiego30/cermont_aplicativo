import { ordenesRepository, type OrderFilters } from './ordenes.repository.js';
import { NotFoundError, ValidationError } from '../../shared/errors/index.js';
import { createLogger } from '../../shared/utils/logger.js';
import type { CreateOrderDTO, UpdateOrderDTO, OrderFiltersDTO, OrderStatus } from './ordenes.types.js';
import { prisma } from '../../config/database.js';

const logger = createLogger('OrdenesService');

/**
 * State machine for order status transitions
 * Defines valid transitions from each state
 */
const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    planeacion: ['ejecucion', 'cancelada'],
    ejecucion: ['pausada', 'completada', 'cancelada'],
    pausada: ['ejecucion', 'cancelada'],
    completada: [], // Terminal state
    cancelada: ['planeacion'], // Can reopen
};

export class OrdenesService {
    /**
     * Validate if a status transition is allowed
     */
    private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
        if (currentStatus === newStatus) return; // No change

        const allowedTransitions = STATE_TRANSITIONS[currentStatus];

        if (!allowedTransitions.includes(newStatus)) {
            throw new ValidationError(
                `Transición de estado no permitida: ${currentStatus} → ${newStatus}. ` +
                `Transiciones válidas desde "${currentStatus}": ${allowedTransitions.join(', ') || 'ninguna'}`
            );
        }
    }

    async findAll(filters: OrderFiltersDTO) {
        logger.debug('Fetching orders with filters', filters);

        const repositoryFilters: OrderFilters = {
            estado: filters.estado as OrderStatus | undefined,
            prioridad: filters.prioridad as any,
            cliente: filters.cliente,
            search: filters.search,
            page: filters.page,
            limit: filters.limit,
        };

        const result = await ordenesRepository.findMany(repositoryFilters);

        return {
            data: result.data,
            meta: {
                ...result.meta,
                hasMore: result.meta.page * result.meta.limit < result.meta.total,
            },
        };
    }

    async findById(id: string) {
        const orden = await ordenesRepository.findById(id);

        if (!orden) {
            throw new NotFoundError('Orden', id);
        }

        return orden;
    }

    async create(data: CreateOrderDTO, userId: string) {
        // Generate order number
        const lastOrder = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { numero: true },
        });

        const lastNum = lastOrder?.numero ? parseInt(lastOrder.numero.replace('ORD-', '')) : 0;
        const numero = `ORD-${String(lastNum + 1).padStart(5, '0')}`;

        const orden = await ordenesRepository.create({
            numero,
            descripcion: data.descripcion,
            cliente: data.cliente,
            prioridad: data.prioridad || 'media',
            fechaFinEstimada: data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : undefined,
            creadorId: userId,
        });

        logger.info('Orden creada', { orderId: orden.id, numero: orden.numero, creadorId: userId });

        // Fetch with relations
        return this.findById(orden.id);
    }

    async update(id: string, data: UpdateOrderDTO) {
        const existing = await ordenesRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Orden', id);
        }

        // Validate state transition if estado is being changed
        if (data.estado && data.estado !== existing.estado) {
            this.validateStatusTransition(existing.estado as OrderStatus, data.estado);
        }

        const updateData: any = {};

        if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
        if (data.cliente !== undefined) updateData.cliente = data.cliente;
        if (data.estado !== undefined) updateData.estado = data.estado;
        if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;
        if (data.asignadoId !== undefined) updateData.asignadoId = data.asignadoId;
        if (data.fechaFinEstimada !== undefined) {
            updateData.fechaFinEstimada = data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : null;
        }
        if (data.fechaInicio !== undefined) {
            updateData.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : null;
        }
        if (data.fechaFin !== undefined) {
            updateData.fechaFin = data.fechaFin ? new Date(data.fechaFin) : null;
        }

        await ordenesRepository.update(id, updateData);

        logger.info('Orden actualizada', { orderId: id, changes: Object.keys(updateData) });

        return this.findById(id);
    }

    async delete(id: string) {
        const orden = await ordenesRepository.findById(id);
        if (!orden) {
            throw new NotFoundError('Orden', id);
        }

        await ordenesRepository.delete(id);
        logger.info('Orden eliminada', { orderId: id, numero: orden.numero });

        return { message: 'Orden eliminada exitosamente' };
    }

    async assignResponsable(id: string, asignadoId: string) {
        const orden = await ordenesRepository.findById(id);
        if (!orden) {
            throw new NotFoundError('Orden', id);
        }

        await ordenesRepository.update(id, { asignadoId });

        logger.info('Orden asignada', { orderId: id, asignadoId });

        return this.findById(id);
    }

    async changeStatus(id: string, newStatus: OrderStatus) {
        const orden = await ordenesRepository.findById(id);
        if (!orden) {
            throw new NotFoundError('Orden', id);
        }

        // Validate transition
        this.validateStatusTransition(orden.estado as OrderStatus, newStatus);

        const updateData: Record<string, unknown> = { estado: newStatus };

        // Set dates based on status change
        if (newStatus === 'ejecucion' && !orden.fechaInicio) {
            updateData.fechaInicio = new Date();
        }
        if (newStatus === 'completada') {
            updateData.fechaFin = new Date();
        }

        await ordenesRepository.update(id, updateData as any);

        logger.info('Estado de orden cambiado', {
            orderId: id,
            from: orden.estado,
            to: newStatus
        });

        return this.findById(id);
    }

    /**
     * Get order statistics
     */
    async getStats() {
        return ordenesRepository.getStats();
    }
}

export const ordenesService = new OrdenesService();
