import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderPrioridad, OrderResponseDto, Orderstado } from '../dto/order-response.dto';

export function toOrderResponseDto(Order: OrderEntity): OrderResponseDto {
  return {
    id: Order.id,
    numero: Order.numero.value,
    descripcion: Order.descripcion,
    cliente: Order.cliente,
    estado: Order.estado.value as Orderstado,
    prioridad: Order.prioridad.value as OrderPrioridad,
    creadorId: Order.creadorId,
    asignadoId: Order.asignadoId,
    fechaInicio: Order.fechaInicio?.toISOString(),
    fechaFin: Order.fechaFin?.toISOString(),
    fechaFinEstimada: Order.fechaFinEstimada?.toISOString(),
    presupuestoEstimado: Order.presupuestoEstimado,
    costoReal: Order.costoReal,
    createdAt: Order.createdAt.toISOString(),
    updatedAt: Order.updatedAt.toISOString(),
    creador: Order.creador,
    asignado: Order.asignado,
  };
}
