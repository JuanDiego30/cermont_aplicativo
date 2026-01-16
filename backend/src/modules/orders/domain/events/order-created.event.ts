/**
 * @event OrderCreatedEvent
 * @description Evento de dominio emitido cuando se crea una nueva Order
 * @layer Domain
 */
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly numero: string,
    public readonly descripcion: string,
    public readonly cliente: string,
    public readonly prioridad: string,
    public readonly creadorId?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
