import type { Order, OrderItem, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { OrderStatus, OrderPriority } from './ordenes.types.js';

type OrderWithRelations = Order & {
  items?: OrderItem[];
  creador?: { id: string; name: string; email: string } | null;
  asignado?: { id: string; name: string; email: string } | null;
};

export interface OrderFilters {
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  cliente?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrders {
  data: OrderWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class OrdenesRepository {
  /**
   * Buscar orden por ID con relaciones
   */
  async findById(id: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        creador: {
          select: { id: true, name: true, email: true },
        },
        asignado: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Buscar orden por número
   */
  async findByNumero(numero: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { numero } });
  }

  /**
   * Listar órdenes con filtros y paginación
   */
  async findMany(filters: OrderFilters): Promise<PaginatedOrders> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.prioridad) {
      where.prioridad = filters.prioridad;
    }

    if (filters.cliente) {
      where.cliente = { contains: filters.cliente, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { numero: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
        { cliente: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          creador: {
            select: { id: true, name: true, email: true },
          },
          asignado: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crear nueva orden
   */
  async create(data: {
    numero: string;
    descripcion: string;
    cliente: string;
    prioridad?: OrderPriority;
    fechaFinEstimada?: Date;
    creadorId?: string;
  }): Promise<Order> {
    return prisma.order.create({
      data: {
        numero: data.numero,
        descripcion: data.descripcion,
        cliente: data.cliente,
        prioridad: data.prioridad || 'media',
        fechaFinEstimada: data.fechaFinEstimada,
        creadorId: data.creadorId,
      },
    });
  }

  /**
   * Actualizar orden
   */
  async update(
    id: string,
    data: Partial<{
      numero: string;
      descripcion: string;
      cliente: string;
      estado: OrderStatus;
      prioridad: OrderPriority;
      fechaFinEstimada: Date | null;
      fechaInicio: Date | null;
      fechaFin: Date | null;
      asignadoId: string | null;
    }>
  ): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar orden
   */
  async delete(id: string): Promise<void> {
    await prisma.order.delete({ where: { id } });
  }

  /**
   * Agregar item a una orden
   */
  async addItem(
    orderId: string,
    data: { descripcion: string; cantidad?: number; notas?: string }
  ): Promise<OrderItem> {
    return prisma.orderItem.create({
      data: {
        orderId,
        descripcion: data.descripcion,
        cantidad: data.cantidad || 1,
        notas: data.notas,
      },
    });
  }

  /**
   * Actualizar item
   */
  async updateItem(
    itemId: string,
    data: Partial<{ descripcion: string; cantidad: number; completado: boolean; notas: string }>
  ): Promise<OrderItem> {
    return prisma.orderItem.update({
      where: { id: itemId },
      data,
    });
  }

  /**
   * Eliminar item
   */
  async deleteItem(itemId: string): Promise<void> {
    await prisma.orderItem.delete({ where: { id: itemId } });
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getStats(): Promise<{
    total: number;
    porEstado: Record<string, number>;
    porPrioridad: Record<string, number>;
  }> {
    const [total, porEstado, porPrioridad] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['estado'],
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['prioridad'],
        _count: true,
      }),
    ]);

    return {
      total,
      porEstado: porEstado.reduce(
        (acc: Record<string, number>, item: { estado: string; _count: number }) => ({ ...acc, [item.estado]: item._count }),
        {} as Record<string, number>
      ),
      porPrioridad: porPrioridad.reduce(
        (acc: Record<string, number>, item: { prioridad: string; _count: number }) => ({ ...acc, [item.prioridad]: item._count }),
        {} as Record<string, number>
      ),
    };
  }
}

// Export singleton instance
export const ordenesRepository = new OrdenesRepository();
