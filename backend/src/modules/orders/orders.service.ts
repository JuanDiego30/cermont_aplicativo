import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, OrderFilterDto, UpdateOrderDto } from './orders.dto';

/**
 * Simple OrdersService - Direct Prisma access
 * MVP Architecture: No DDD, no events, no mappers
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todas las órdenes con filtros opcionales
   */
  async findAll(filters?: OrderFilterDto) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.prioridad) {
      where.prioridad = filters.prioridad;
    }
    if (filters?.asignadoId) {
      where.asignadoId = filters.asignadoId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        creador: { select: { id: true, name: true, email: true } },
        asignado: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene una orden por ID
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        creador: { select: { id: true, name: true, email: true } },
        asignado: { select: { id: true, name: true, email: true } },
        items: true,
        stateHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }

    return order;
  }

  /**
   * Crea una nueva orden
   */
  async create(dto: CreateOrderDto, creadorId: string) {
    return this.prisma.order.create({
      data: {
        numero: await this.generateOrderNumber(),
        cliente: dto.cliente,
        descripcion: dto.descripcion,
        ubicacion: dto.ubicacion,
        prioridad: dto.prioridad ?? 'media',
        status: 'pendiente',
        creadorId,
        asignadoId: dto.asignadoId,
      },
      include: {
        creador: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Actualiza una orden existente
   */
  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id); // Verify exists

    return this.prisma.order.update({
      where: { id },
      data: {
        cliente: dto.cliente,
        descripcion: dto.descripcion,
        ubicacion: dto.ubicacion,
        prioridad: dto.prioridad,
        status: dto.status,
        asignadoId: dto.asignadoId,
      },
    });
  }

  /**
   * Elimina una orden
   */
  async remove(id: string) {
    await this.findOne(id); // Verify exists
    return this.prisma.order.delete({ where: { id } });
  }

  /**
   * Cambia el estado de una orden
   */
  async changeStatus(id: string, newStatus: string, userId: string, observaciones?: string) {
    const order = await this.findOne(id);
    const previousStatus = order.status;

    // Update order status
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus as Prisma.EnumOrderStatusFieldUpdateOperationsInput['set'] },
    });

    // Log state change
    await this.prisma.orderStateHistory.create({
      data: {
        ordenId: id,
        estadoAnterior: previousStatus,
        estadoNuevo: newStatus,
        usuarioId: userId,
        observaciones,
      },
    });

    this.logger.log(`Order ${id}: ${previousStatus} -> ${newStatus}`);
    return updated;
  }

  /**
   * Asigna un técnico a una orden
   */
  async assignTechnician(id: string, tecnicoId: string) {
    await this.findOne(id); // Verify exists

    return this.prisma.order.update({
      where: { id },
      data: { asignadoId: tecnicoId },
      include: {
        asignado: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Obtiene el historial de estados de una orden
   */
  async getStatusHistory(id: string) {
    await this.findOne(id); // Verify exists

    return this.prisma.orderStateHistory.findMany({
      where: { ordenId: id },
      include: {
        usuario: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Genera número de orden único
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });
    return `ORD-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
