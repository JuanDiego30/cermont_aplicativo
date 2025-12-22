/**
 * Domain Event: AlertaFallidaEvent
 * 
 * Se publica cuando falla el envío de una alerta
 * 
 * @example
 * const event = new AlertaFallidaEvent({
 *   alertaId: '123e4567-...',
 *   destinatarioId: 'user-123',
 *   intentos: 2,
 *   error: 'Connection timeout',
 *   timestamp: new Date(),
 * });
 */

export class AlertaFallidaEvent {
  public readonly eventName = 'ALERTA_FALLIDA';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly error: string;
  public readonly intentos: number;
  public readonly destinatarioId: string;

  constructor(props: {
    alertaId: string;
    destinatarioId: string;
    intentos: number;
    error: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.alertaId;
    this.destinatarioId = props.destinatarioId;
    this.intentos = props.intentos;
    this.error = props.error;
    this.timestamp = props.timestamp;
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Serialización para logging/auditoría
   */
  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      destinatarioId: this.destinatarioId,
      intentos: this.intentos,
      error: this.error,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

