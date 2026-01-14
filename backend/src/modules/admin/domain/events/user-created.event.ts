/**
 * @event UserCreatedEvent
 *
 * Evento de dominio emitido cuando se crea un usuario.
 */

export class UserCreatedEvent {
  readonly occurredAt: Date;
  readonly eventName = "UserCreatedEvent";

  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string,
    readonly role: string,
    readonly createdBy?: string,
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
      email: this.email,
      name: this.name,
      role: this.role,
      createdBy: this.createdBy,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
