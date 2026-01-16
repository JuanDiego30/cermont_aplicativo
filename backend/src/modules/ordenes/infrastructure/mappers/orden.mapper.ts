import {
  OrderPriority,
  OrderStatus,
  Order as PrismaOrden,
  User as PrismaUser,
} from '@/prisma/client';
import { OrdenResponseDto } from '../../application/dto/orden-response.dto';
import { OrdenEntity } from '../../domain/entities/orden.entity';

export class OrdenMapper {
  static toDomain(
    orden: PrismaOrden & {
      creador?: Pick<PrismaUser, 'id' | 'name'> | null;
      asignado?: Pick<PrismaUser, 'id' | 'name'> | null;
    }
  ): OrdenEntity {
    return OrdenEntity.fromPersistence(
      {
        id: orden.id,
        numero: orden.numero,
        descripcion: orden.descripcion,
        cliente: orden.cliente,
        estado: orden.estado,
        prioridad: orden.prioridad,
        fechaInicio: orden.fechaInicio ?? undefined,
        fechaFin: orden.fechaFin ?? undefined,
        fechaFinEstimada: orden.fechaFinEstimada ?? undefined,
        presupuestoEstimado: orden.presupuestoEstimado
          ? Number(orden.presupuestoEstimado)
          : undefined,
        creadorId: orden.creadorId ?? undefined,
        asignadoId: orden.asignadoId ?? undefined,
        createdAt: orden.createdAt,
        updatedAt: orden.updatedAt,
      },
      orden.creador ? { id: orden.creador.id, name: orden.creador.name } : undefined,
      orden.asignado ? { id: orden.asignado.id, name: orden.asignado.name } : undefined
    );
  }

  static toPersistence(orden: OrdenEntity) {
    return {
      id: orden.id,
      numero: orden.numero.value,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: orden.estado.value as OrderStatus,
      prioridad: orden.prioridad.value as OrderPriority,
      fechaInicio: orden.fechaInicio,
      fechaFin: orden.fechaFin,
      fechaFinEstimada: orden.fechaFinEstimada,
      presupuestoEstimado: orden.presupuestoEstimado,
      creadorId: orden.creadorId,
      asignadoId: orden.asignadoId,
      createdAt: orden.createdAt,
      updatedAt: orden.updatedAt,
    };
  }

  static toResponse(
    orden: PrismaOrden & { creador?: PrismaUser; asignado?: PrismaUser }
  ): OrdenResponseDto {
    return {
      id: orden.id,
      numero: orden.numero,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: orden.estado as unknown as OrdenResponseDto['estado'],
      prioridad: orden.prioridad as unknown as OrdenResponseDto['prioridad'],
      fechaInicio: orden.fechaInicio?.toISOString(),
      fechaFin: orden.fechaFin?.toISOString(),
      fechaFinEstimada: orden.fechaFinEstimada?.toISOString(),
      presupuestoEstimado: orden.presupuestoEstimado
        ? Number(orden.presupuestoEstimado)
        : undefined,
      creador: orden.creador
        ? {
            id: orden.creador.id,
            name: orden.creador.name,
          }
        : undefined,
      asignado: orden.asignado
        ? {
            id: orden.asignado.id,
            name: orden.asignado.name,
          }
        : undefined,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
    };
  }
}
