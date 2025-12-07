import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { createLogger } from '../../shared/utils/logger.js';
import type { CreateOrderDTO, UpdateOrderDTO, OrderFiltersDTO } from './ordenes.types.js';

const logger = createLogger('OrdenesService');

export class OrdenesService {

    async findAll(filters: OrderFiltersDTO) {
        const { estado, prioridad, cliente, search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (estado) where.estado = estado;
        if (prioridad) where.prioridad = prioridad;
        if (cliente) where.cliente = { contains: cliente, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { numero: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                { cliente: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [ordenes, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creador: { select: { id: true, name: true, email: true } },
                    asignado: { select: { id: true, name: true, email: true } },
                    items: true,
                },
            }),
            prisma.order.count({ where }),
        ]);

        return {
            data: ordenes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        };
    }

    async findById(id: string) {
        const orden = await prisma.order.findUnique({
            where: { id },
            include: {
                creador: { select: { id: true, name: true, email: true } },
                asignado: { select: { id: true, name: true, email: true } },
                items: true,
                evidencias: true,
            },
        });

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

        const orden = await prisma.order.create({
            data: {
                numero,
                descripcion: data.descripcion,
                cliente: data.cliente,
                prioridad: data.prioridad || 'media',
                estado: 'planeacion',
                fechaFinEstimada: data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : null,
                creadorId: userId,
            },
            include: {
                creador: { select: { id: true, name: true, email: true } },
            },
        });

        logger.info('Orden creada', { orderId: orden.id, numero: orden.numero });
        return orden;
    }

    async update(id: string, data: UpdateOrderDTO) {
        const existing = await prisma.order.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Orden', id);
        }

        const updated = await prisma.order.update({
            where: { id },
            data: {
                descripcion: data.descripcion,
                cliente: data.cliente,
                estado: data.estado,
                prioridad: data.prioridad,
                asignadoId: data.asignadoId,
                fechaFinEstimada: data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : undefined,
                fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
                fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
            },
            include: {
                creador: { select: { id: true, name: true, email: true } },
                asignado: { select: { id: true, name: true, email: true } },
            },
        });

        logger.info('Orden actualizada', { orderId: id });
        return updated;
    }

    async delete(id: string) {
        const orden = await prisma.order.findUnique({ where: { id } });
        if (!orden) {
            throw new NotFoundError('Orden', id);
        }

        await prisma.order.delete({ where: { id } });
        logger.info('Orden eliminada', { orderId: id });
        return { message: 'Orden eliminada exitosamente' };
    }

    async assignResponsable(id: string, asignadoId: string) {
        const orden = await prisma.order.update({
            where: { id },
            data: { asignadoId },
            include: {
                asignado: { select: { id: true, name: true, email: true } },
            },
        });

        logger.info('Orden asignada', { orderId: id, asignadoId });
        return orden;
    }

    async changeStatus(id: string, estado: string) {
        const updateData: Record<string, unknown> = { estado };
        
        // Set dates based on status change
        if (estado === 'ejecucion' && !await this.hasStartDate(id)) {
            updateData.fechaInicio = new Date();
        }
        if (estado === 'completada') {
            updateData.fechaFin = new Date();
        }

        const orden = await prisma.order.update({
            where: { id },
            data: updateData,
        });

        logger.info('Estado de orden cambiado', { orderId: id, estado });
        return orden;
    }

    private async hasStartDate(id: string): Promise<boolean> {
        const orden = await prisma.order.findUnique({ 
            where: { id }, 
            select: { fechaInicio: true } 
        });
        return !!orden?.fechaInicio;
    }
}

export const ordenesService = new OrdenesService();
