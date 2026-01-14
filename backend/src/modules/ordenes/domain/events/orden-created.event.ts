/**
 * @event OrdenCreatedEvent
 * @description Evento de dominio emitido cuando se crea una nueva orden
 * @layer Domain
 */
export class OrdenCreatedEvent {
  constructor(
    public readonly ordenId: string,
    public readonly numero: string,
    public readonly descripcion: string,
    public readonly cliente: string,
    public readonly prioridad: string,
    public readonly creadorId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
