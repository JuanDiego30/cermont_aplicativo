/**
 * @event TokenRefreshed
 * @description Evento de dominio cuando se refresca un token
 * @layer Domain
 */
export class TokenRefreshedEvent {
  readonly eventName = 'auth.token.refreshed' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly oldTokenId: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
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
        oldTokenId: this.oldTokenId,
        ip: this.ip,
        userAgent: this.userAgent,
      },
    };
  }
}
