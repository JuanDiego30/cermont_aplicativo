/**
 * Domain Event: AlertaEnviadaEvent
 *
 * Se publica cuando una alerta se envía exitosamente por un canal
 *
 * @example
 * const event = new AlertaEnviadaEvent({
 *   alertaId: '123e4567-...',
 *   canal: 'EMAIL',
 *   destinatarioId: 'user-123',
 *   timestamp: new Date(),
 * });
 */

export class AlertaEnviadaEvent {
  public readonly eventName = "ALERTA_ENVIADA";
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly canal: string;
  public readonly destinatarioId: string;

  constructor(props: {
    alertaId: string;
    canal: string;
    destinatarioId: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.alertaId;
    this.canal = props.canal;
    this.destinatarioId = props.destinatarioId;
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
      canal: this.canal,
      destinatarioId: this.destinatarioId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
