/**
 * @event UserUpdatedEvent
 *
 * Evento de dominio emitido cuando se actualiza un usuario.
 */

export interface UserUpdateChanges {
  name?: { old: string; new: string };
  phone?: { old?: string; new?: string };
  avatar?: { old?: string; new?: string };
}

export class UserUpdatedEvent {
  readonly occurredAt: Date;
  readonly eventName = "UserUpdatedEvent";

  constructor(
    readonly userId: string,
    readonly changes: UserUpdateChanges,
    readonly updatedBy?: string,
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
      changes: this.changes,
      updatedBy: this.updatedBy,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
