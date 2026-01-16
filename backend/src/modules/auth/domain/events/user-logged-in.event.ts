/**
 * @event UserLoggedIn
 * @description Evento de dominio cuando un usuario inicia sesión
 * @layer Domain
 */
export class UserLoggedInEvent {
  readonly eventName = 'auth.user.logged-in' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip?: string,
    public readonly userAgent?: string
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
        email: this.email,
        ip: this.ip,
        userAgent: this.userAgent,
      },
    };
  }
}
