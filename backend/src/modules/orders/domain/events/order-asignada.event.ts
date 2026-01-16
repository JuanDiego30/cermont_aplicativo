/**
 * @event OrderAsignadaEvent
 * @description Evento de dominio emitido cuando se asigna un técnico a una Order
 * @layer Domain
 */
export class OrderAsignadaEvent {
  constructor(
    public readonly orderId: string,
    public readonly numero: string,
    public readonly tecnicoId: string,
    public readonly fechaInicio?: Date,
    public readonly instrucciones?: string,
    public readonly motivoAsignacion?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
