/**
 * @event OrderstadoChangedEvent
 * @description Evento de dominio emitido cuando cambia el estado de una Order
 * @layer Domain
 */
import { EstadoOrder } from '../value-objects';

export class OrderEstadoChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly numero: string,
    public readonly estadoAnterior: EstadoOrder,
    public readonly estadoNuevo: EstadoOrder,
    public readonly motivo: string,
    public readonly usuarioId?: string,
    public readonly observaciones?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
