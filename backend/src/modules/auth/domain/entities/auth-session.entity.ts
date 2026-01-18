/**
 * @entity AuthSession
 * @description Entidad que representa una sesión de autenticación
 * @layer Domain
 */
import { RefreshToken } from '../value-objects';

export interface AuthSessionProps {
  id: string;
  userId: string;
  refreshToken: string;
  family: string;
  expiresAt: Date;
  isRevoked: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class AuthSessionEntity {
  private _domainEvents: any[] = [];

  private constructor(private props: AuthSessionProps) {}

  // Getters
  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get refreshToken(): string {
    return this.props.refreshToken;
  }
  get family(): string {
    return this.props.family;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }
  get isRevoked(): boolean {
    return this.props.isRevoked;
  }
  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }
  get userAgent(): string | undefined {
    return this.props.userAgent;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  get isValid(): boolean {
    return !this.isRevoked && !this.isExpired;
  }

  get domainEvents(): readonly any[] {
    return [...this._domainEvents];
  }

  // Factory Methods
  static create(userId: string, ipAddress?: string, userAgent?: string): AuthSessionEntity {
    const token = RefreshToken.create();

    return new AuthSessionEntity({
      id: '', // Será asignado por la base de datos
      userId,
      refreshToken: token.value,
      family: token.family,
      expiresAt: token.expiresAt,
      isRevoked: false,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: AuthSessionProps): AuthSessionEntity {
    return new AuthSessionEntity(props);
  }

  // Business Methods
  revoke(): void {
    this.props.isRevoked = true;
  }

  rotate(ipAddress?: string, userAgent?: string): AuthSessionEntity {
    const newToken = RefreshToken.create(this.props.family);

    return new AuthSessionEntity({
      id: '',
      userId: this.props.userId,
      refreshToken: newToken.value,
      family: this.props.family,
      expiresAt: newToken.expiresAt,
      isRevoked: false,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });
  }

  validate(): { valid: boolean; reason?: string } {
    if (this.isRevoked) {
      return { valid: false, reason: 'Token revocado' };
    }
    if (this.isExpired) {
      return { valid: false, reason: 'Token expirado' };
    }
    return { valid: true };
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      refreshToken: this.refreshToken,
      family: this.family,
      expiresAt: this.expiresAt.toISOString(),
      isRevoked: this.isRevoked,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
