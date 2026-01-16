/**
 * @event UserRegistered
 * @description Evento de dominio cuando un usuario se registra
 * @layer Domain
 */
export class UserRegisteredEvent {
  readonly eventName = 'auth.user.registered' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
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
        name: this.name,
        role: this.role,
        ip: this.ip,
        userAgent: this.userAgent,
      },
    };
  }
}
