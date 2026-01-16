/**
 * @event RoleChangedEvent
 *
 * Evento de dominio emitido cuando cambia el rol de un usuario.
 */

export class RoleChangedEvent {
  readonly occurredAt: Date;
  readonly eventName = 'RoleChangedEvent';

  constructor(
    readonly userId: string,
    readonly userEmail: string,
    readonly oldRole: string,
    readonly newRole: string,
    readonly changedBy: string
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
      oldRole: this.oldRole,
      newRole: this.newRole,
      changedBy: this.changedBy,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
