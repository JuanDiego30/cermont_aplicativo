/**
 * @event OrdenEstadoChangedEvent
 * @description Evento de dominio emitido cuando cambia el estado de una orden
 * @layer Domain
 */
import { EstadoOrden } from "../value-objects";

export class OrdenEstadoChangedEvent {
  constructor(
    public readonly ordenId: string,
    public readonly numero: string,
    public readonly estadoAnterior: EstadoOrden,
    public readonly estadoNuevo: EstadoOrden,
    public readonly motivo: string,
    public readonly usuarioId?: string,
    public readonly observaciones?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
