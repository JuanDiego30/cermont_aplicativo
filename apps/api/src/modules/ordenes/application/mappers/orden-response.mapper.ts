import { OrdenEntity } from "../../domain/entities/orden.entity";
import {
  OrdenResponseDto,
  OrdenEstado,
  OrdenPrioridad,
} from "../dto/orden-response.dto";

export function toOrdenResponseDto(orden: OrdenEntity): OrdenResponseDto {
  return {
    id: orden.id,
    numero: orden.numero.value,
    descripcion: orden.descripcion,
    cliente: orden.cliente,
    estado: orden.estado.value as OrdenEstado,
    prioridad: orden.prioridad.value as OrdenPrioridad,
    creadorId: orden.creadorId,
    asignadoId: orden.asignadoId,
    fechaInicio: orden.fechaInicio?.toISOString(),
    fechaFin: orden.fechaFin?.toISOString(),
    fechaFinEstimada: orden.fechaFinEstimada?.toISOString(),
    presupuestoEstimado: orden.presupuestoEstimado,
    costoReal: orden.costoReal,
    createdAt: orden.createdAt.toISOString(),
    updatedAt: orden.updatedAt.toISOString(),
    creador: orden.creador,
    asignado: orden.asignado,
  };
}
