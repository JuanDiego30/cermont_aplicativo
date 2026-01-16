import {
  OrderPriority,
  OrderStatus,
  Order as PrismaOrder,
  User as PrismaUser,
} from '@/prisma/client';
import { OrderResponseDto } from '../../application/dto/order-response.dto';
import { OrderEntity } from '../../domain/entities/order.entity';

export class OrderMapper {
  static toDomain(
    Order: PrismaOrder & {
      creador?: Pick<PrismaUser, 'id' | 'name'> | null;
      asignado?: Pick<PrismaUser, 'id' | 'name'> | null;
    }
  ): OrderEntity {
    return OrderEntity.fromPersistence(
      {
        id: Order.id,
        numero: Order.numero,
        descripcion: Order.descripcion,
        cliente: Order.cliente,
        estado: Order.estado,
        prioridad: Order.prioridad,
        fechaInicio: Order.fechaInicio ?? undefined,
        fechaFin: Order.fechaFin ?? undefined,
        fechaFinEstimada: Order.fechaFinEstimada ?? undefined,
        presupuestoEstimado: Order.presupuestoEstimado
          ? Number(Order.presupuestoEstimado)
          : undefined,
        creadorId: Order.creadorId ?? undefined,
        asignadoId: Order.asignadoId ?? undefined,
        createdAt: Order.createdAt,
        updatedAt: Order.updatedAt,
      },
      Order.creador ? { id: Order.creador.id, name: Order.creador.name } : undefined,
      Order.asignado ? { id: Order.asignado.id, name: Order.asignado.name } : undefined
    );
  }

  static toPersistence(Order: OrderEntity) {
    return {
      id: Order.id,
      numero: Order.numero.value,
      descripcion: Order.descripcion,
      cliente: Order.cliente,
      estado: Order.estado.value as OrderStatus,
      prioridad: Order.prioridad.value as OrderPriority,
      fechaInicio: Order.fechaInicio,
      fechaFin: Order.fechaFin,
      fechaFinEstimada: Order.fechaFinEstimada,
      presupuestoEstimado: Order.presupuestoEstimado,
      creadorId: Order.creadorId,
      asignadoId: Order.asignadoId,
      createdAt: Order.createdAt,
      updatedAt: Order.updatedAt,
    };
  }

  static toResponse(
    Order: PrismaOrder & { creador?: PrismaUser; asignado?: PrismaUser }
  ): OrderResponseDto {
    return {
      id: Order.id,
      numero: Order.numero,
      descripcion: Order.descripcion,
      cliente: Order.cliente,
      estado: Order.estado as unknown as OrderResponseDto['estado'],
      prioridad: Order.prioridad as unknown as OrderResponseDto['prioridad'],
      fechaInicio: Order.fechaInicio?.toISOString(),
      fechaFin: Order.fechaFin?.toISOString(),
      fechaFinEstimada: Order.fechaFinEstimada?.toISOString(),
      presupuestoEstimado: Order.presupuestoEstimado
        ? Number(Order.presupuestoEstimado)
        : undefined,
      creador: Order.creador
        ? {
            id: Order.creador.id,
            name: Order.creador.name,
          }
        : undefined,
      asignado: Order.asignado
        ? {
            id: Order.asignado.id,
            name: Order.asignado.name,
          }
        : undefined,
      createdAt: Order.createdAt.toISOString(),
      updatedAt: Order.updatedAt.toISOString(),
    };
  }
}
