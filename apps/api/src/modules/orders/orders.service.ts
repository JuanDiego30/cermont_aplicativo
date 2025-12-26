import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dtos';
import type { Prisma } from '.prisma/client';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Crear nueva orden
     */
    async create(createOrderDto: CreateOrderDto, userId: string) {
        try {
            this.logger.log('Creating new order', { userId });

            // Generar número único de orden
            const orderNumber = this.generateOrderNumber();

            const order = await this.prisma.order.create({
                data: {
                    numero: orderNumber,
                    descripcion: createOrderDto.description,
                    cliente: createOrderDto.clientId,
                    estado: 'planeacion',
                    prioridad: 'media',
                    creadorId: userId,
                    asignadoId: createOrderDto.assignedTo,
                },
                include: {
                    creador: true,
                    asignado: true,
                },
            });

            this.logger.log('Order created successfully', { orderId: order.id });
            return order;
        } catch (error) {
            this.logger.error('Error creating order', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(
                `Error al crear orden: ${(error as Error).message}`
            );
        }
    }

    /**
     * Obtener todas las órdenes con paginación
     */
    async findAll(options: { page?: number; limit?: number; status?: string } = {}) {
        try {
            const { page = 1, limit = 10, status } = options;
            const skip = (page - 1) * limit;

            const where: Prisma.OrderWhereInput = {};
            if (status) {
                where.estado = status as any;
            }

            const [data, total] = await Promise.all([
                this.prisma.order.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        creador: true,
                        asignado: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.order.count({ where }),
            ]);

            return {
                data,
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.error('Error fetching orders', error);
            throw new BadRequestException(
                `Error al obtener órdenes: ${(error as Error).message}`
            );
        }
    }

    /**
     * Obtener una orden por ID
     */
    async findOne(id: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id },
                include: {
                    creador: true,
                    asignado: true,
                    evidencias: true,
                    costos: true,
                    items: true,
                },
            });

            if (!order) {
                throw new NotFoundException(`Orden con ID ${id} no encontrada`);
            }

            return order;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Error fetching order', error);
            throw new BadRequestException(
                `Error al obtener orden: ${(error as Error).message}`
            );
        }
    }

    /**
     * Actualizar una orden
     */
    async update(id: string, updateOrderDto: UpdateOrderDto) {
        try {
            // Verificar que la orden existe
            await this.findOne(id);

            const updatedOrder = await this.prisma.order.update({
                where: { id },
                data: {
                    descripcion: updateOrderDto.description,
                    asignadoId: updateOrderDto.assignedTo,
                },
                include: {
                    creador: true,
                    asignado: true,
                },
            });

            this.logger.log('Order updated successfully', { orderId: id });
            return updatedOrder;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Error updating order', error);
            throw new BadRequestException(
                `Error al actualizar orden: ${(error as Error).message}`
            );
        }
    }

    /**
     * Eliminar (cancelar) una orden
     */
    async delete(id: string) {
        try {
            const order = await this.findOne(id);

            if (order.estado === 'completada' || order.estado === 'cancelada') {
                throw new BadRequestException(
                    'No se puede cancelar una orden ya cerrada o cancelada'
                );
            }

            await this.prisma.order.update({
                where: { id },
                data: {
                    estado: 'cancelada',
                    canceladaEn: new Date(),
                },
            });

            this.logger.log('Order cancelled successfully', { orderId: id });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error('Error cancelling order', error);
            throw new BadRequestException(
                `Error al eliminar orden: ${(error as Error).message}`
            );
        }
    }

    /**
     * Generar número único de orden
     * Formato: OT-YYYYMMDD-XXXX (ej: OT-20251226-0001)
     */
    private generateOrderNumber(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        return `OT-${year}${month}${day}-${random}`;
    }

    /**
     * Obtener estadísticas de órdenes
     */
    async getStats() {
        try {
            const [
                totalOrders,
                pendingOrders,
                inProgressOrders,
                completedOrders,
                cancelledOrders,
            ] = await Promise.all([
                this.prisma.order.count(),
                this.prisma.order.count({ where: { estado: 'planeacion' } }),
                this.prisma.order.count({ where: { estado: 'ejecucion' } }),
                this.prisma.order.count({ where: { estado: 'completada' } }),
                this.prisma.order.count({ where: { estado: 'cancelada' } }),
            ]);

            return {
                totalOrders,
                pendingOrders,
                inProgressOrders,
                completedOrders,
                cancelledOrders,
            };
        } catch (error) {
            this.logger.error('Error fetching stats', error);
            throw new BadRequestException(
                `Error al obtener estadísticas: ${(error as Error).message}`
            );
        }
    }
}
