/**
 * @event PasswordResetEvent
 * 
 * Evento de dominio emitido cuando se resetea una contraseña.
 */

export class PasswordResetEvent {
  readonly occurredAt: Date;
  readonly eventName = 'PasswordResetEvent';

  constructor(
    readonly userId: string,
    readonly userEmail: string,
    readonly resetBy: string,
    readonly isAdminReset: boolean = false,
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
      resetBy: this.resetBy,
      isAdminReset: this.isAdminReset,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
