/**
 * @event UserDeactivatedEvent
 *
 * Evento de dominio emitido cuando se desactiva un usuario.
 */

export class UserDeactivatedEvent {
  readonly occurredAt: Date;
  readonly eventName = "UserDeactivatedEvent";

  constructor(
    readonly userId: string,
    readonly userEmail: string,
    readonly deactivatedBy: string,
    readonly reason?: string,
  ) {
    this.occurredAt = new Date();
  }

  /**
   * Serializa el evento para logging/auditoría
   */
  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      userId: this.userId,
      userEmail: this.userEmail,
      deactivatedBy: this.deactivatedBy,
      reason: this.reason,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
