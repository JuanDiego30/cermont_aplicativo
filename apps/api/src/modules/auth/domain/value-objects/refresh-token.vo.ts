/**
 * @valueObject RefreshToken
 * @description Value Object que representa un Refresh Token
 * @layer Domain
 */
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class RefreshToken {
  private static readonly TOKEN_EXPIRY_DAYS = 7;

  private constructor(
    private readonly _value: string,
    private readonly _expiresAt: Date,
    private readonly _family: string,
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
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RefreshToken.TOKEN_EXPIRY_DAYS);
    
    return new RefreshToken(
      token,
      expiresAt,
      family ?? uuidv4(),
    );
  }

  static fromExisting(
    value: string,
    expiresAt: Date,
    family: string,
  ): RefreshToken | null {
    if (!uuidValidate(value)) return null;
    if (!uuidValidate(family)) return null;
    
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
