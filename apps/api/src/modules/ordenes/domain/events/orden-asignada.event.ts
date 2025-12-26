/**
 * @event OrdenAsignadaEvent
 * @description Evento de dominio emitido cuando se asigna un técnico a una orden
 * @layer Domain
 */
export class OrdenAsignadaEvent {
  constructor(
    public readonly ordenId: string,
    public readonly numero: string,
    public readonly tecnicoId: string,
    public readonly fechaInicio?: Date,
    public readonly instrucciones?: string,
    public readonly motivoAsignacion?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

