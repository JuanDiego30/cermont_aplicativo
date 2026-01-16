/**
 * @valueObject RefreshToken
 * @description Value Object que representa un Refresh Token
 * @layer Domain
 */
import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_REGEX.test(value);

export class RefreshToken {
  private static readonly TOKEN_EXPIRY_DAYS = 7;

  private constructor(
    private readonly _value: string,
    private readonly _expiresAt: Date,
    private readonly _family: string
  ) {
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  get expiresAt(): Date {
    return new Date(this._expiresAt);
  }

  get family(): string {
    return this._family;
  }

  get isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  get daysUntilExpiry(): number {
    const diff = this._expiresAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  static create(family?: string): RefreshToken {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RefreshToken.TOKEN_EXPIRY_DAYS);

    return new RefreshToken(token, expiresAt, family ?? randomUUID());
  }

  static fromExisting(value: string, expiresAt: Date, family: string): RefreshToken | null {
    if (!isUuid(value)) return null;
    if (!isUuid(family)) return null;

    return new RefreshToken(value, expiresAt, family);
  }

  rotate(): RefreshToken {
    return RefreshToken.create(this._family);
  }

  equals(other: RefreshToken): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
