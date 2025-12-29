import { Orden as PrismaOrden, User as PrismaUser, EstadoOrden, PrioridadOrden } from '@prisma/client';
import { OrdenResponseDto } from '../../application/dto/orden-response.dto';
import { OrdenEntity } from '../../domain/entities/orden.entity';
// Assumes Orden Entity exists or maps directly to Response for now.
// Ideally should map to Domain Entity first.

export class OrdenMapper {
    static toDomain(orden: PrismaOrden & { creador?: PrismaUser | null; tecnico?: PrismaUser | null }): OrdenEntity {
        return OrdenEntity.fromPersistence(
            {
                id: orden.id,
                numero: orden.numero,
                descripcion: orden.descripcion,
                cliente: orden.cliente,
                estado: orden.estado as any,
                prioridad: orden.prioridad as any,
                fechaInicio: orden.fechaInicio ?? undefined,
                fechaFin: orden.fechaFin ?? undefined,
                fechaFinEstimada: orden.fechaFinEstimada ?? undefined,
                presupuestoEstimado: orden.presupuestoEstimado ? Number(orden.presupuestoEstimado) : undefined,
                creadorId: orden.creadorId,
                asignadoId: orden.tecnicoId, // Correctly mapped from tecnicoId
                createdAt: orden.createdAt,
                updatedAt: orden.updatedAt,
            },
            orden.creador ? { id: orden.creador.id, name: orden.creador.name } : undefined,
            orden.tecnico ? { id: orden.tecnico.id, name: orden.tecnico.name } : undefined
        );
    }

    static toPersistence(orden: OrdenEntity) {
        return {
            id: orden.id,
            numero: orden.numero.value,
            descripcion: orden.descripcion,
            cliente: orden.cliente,
            estado: orden.estado.value,
            prioridad: orden.prioridad.value,
            fechaInicio: orden.fechaInicio,
            fechaFin: orden.fechaFin,
            fechaFinEstimada: orden.fechaFinEstimada,
            presupuestoEstimado: orden.presupuestoEstimado,
            creadorId: orden.creadorId,
            tecnicoId: orden.asignadoId,
            createdAt: orden.createdAt,
            updatedAt: orden.updatedAt,
        };
    }

    static toResponse(orden: PrismaOrden & { creador?: PrismaUser; tecnico?: PrismaUser }): OrdenResponseDto {
        return {
            id: orden.id,
            numero: orden.numero,
            descripcion: orden.descripcion,
            cliente: orden.cliente,
            estado: orden.estado,
            prioridad: orden.prioridad,
            fechaInicio: orden.fechaInicio?.toISOString(),
            fechaFin: orden.fechaFin?.toISOString(),
            fechaFinEstimada: orden.fechaFinEstimada?.toISOString(),
            presupuestoEstimado: orden.presupuestoEstimado ? Number(orden.presupuestoEstimado) : undefined,
            creador: orden.creador ? {
                id: orden.creador.id,
                name: orden.creador.name,
            } : undefined,
            asignado: orden.tecnico ? {
                id: orden.tecnico.id,
                name: orden.tecnico.name,
            } : undefined,
            createdAt: orden.createdAt.toISOString(),
            updatedAt: orden.updatedAt.toISOString(),
        };
    }
}
