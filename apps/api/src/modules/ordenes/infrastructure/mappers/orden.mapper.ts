import {
  Order as PrismaOrden,
  User as PrismaUser,
  OrderStatus,
  OrderPriority,
} from "@prisma/client";
import { OrdenResponseDto, OrdenEstado, OrdenPrioridad } from "../../application/dto/orden-response.dto";
import { OrdenEntity } from "../../domain/entities/orden.entity";

// Mapeo type-safe entre Prisma enums y DTO enums
const ESTADO_MAP: Record<OrderStatus, OrdenEstado> = {
  [OrderStatus.pendiente]: OrdenEstado.PENDIENTE,
  [OrderStatus.planeacion]: OrdenEstado.PLANEACION,
  [OrderStatus.ejecucion]: OrdenEstado.EJECUCION,
  [OrderStatus.pausada]: OrdenEstado.PAUSADA,
  [OrderStatus.completada]: OrdenEstado.COMPLETADA,
  [OrderStatus.cancelada]: OrdenEstado.CANCELADA,
};

const PRIORIDAD_MAP: Record<OrderPriority, OrdenPrioridad> = {
  [OrderPriority.baja]: OrdenPrioridad.BAJA,
  [OrderPriority.media]: OrdenPrioridad.MEDIA,
  [OrderPriority.alta]: OrdenPrioridad.ALTA,
  [OrderPriority.urgente]: OrdenPrioridad.URGENTE,
};

export class OrdenMapper {
  static toDomain(
    orden: PrismaOrden & {
      creador?: Pick<PrismaUser, "id" | "name"> | null;
      asignado?: Pick<PrismaUser, "id" | "name"> | null;
    },
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
      orden.creador
        ? { id: orden.creador.id, name: orden.creador.name }
        : undefined,
      orden.asignado
        ? { id: orden.asignado.id, name: orden.asignado.name }
        : undefined,
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
    orden: PrismaOrden & { creador?: PrismaUser; asignado?: PrismaUser },
  ): OrdenResponseDto {
    return {
      id: orden.id,
      numero: orden.numero,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: ESTADO_MAP[orden.estado],
      prioridad: PRIORIDAD_MAP[orden.prioridad],
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
