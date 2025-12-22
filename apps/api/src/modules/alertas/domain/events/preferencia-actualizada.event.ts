/**
 * Domain Event: PreferenciaActualizadaEvent
 * 
 * Se publica cuando el usuario actualiza sus preferencias de alertas
 * 
 * @example
 * const event = new PreferenciaActualizadaEvent({
 *   usuarioId: 'user-123',
 *   cambios: {
 *     tipoAlerta: 'ORDEN_CREADA',
 *     canalesPreferidos: ['EMAIL', 'PUSH'],
 *   },
 *   timestamp: new Date(),
 * });
 */

export class PreferenciaActualizadaEvent {
  public readonly eventName = 'PREFERENCIA_ACTUALIZADA';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly usuarioId: string;
  public readonly cambios: Record<string, unknown>;

  constructor(props: {
    usuarioId: string;
    cambios: Record<string, unknown>;
    timestamp: Date;
  }) {
    this.aggregateId = props.usuarioId;
    this.usuarioId = props.usuarioId;
    this.cambios = props.cambios;
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
      usuarioId: this.usuarioId,
      cambios: this.cambios,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

