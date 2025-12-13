/**
 * @event UserLoggedOut
 * @description Evento de dominio cuando un usuario cierra sesión
 * @layer Domain
 */
export class UserLoggedOutEvent {
  readonly eventName = 'auth.user.logged-out' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly ip?: string,
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }

  toJSON() {
    return {
      eventName: this.eventName,
      occurredAt: this.occurredAt.toISOString(),
      payload: {
        userId: this.userId,
        ip: this.ip,
      },
    };
  }
}
