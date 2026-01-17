/**
 * @valueObject JwtToken
 * @description Value Object que representa un JWT Token con validación
 * @layer Domain
 */

/**
 * Port interface for JWT signing/verification
 * Implementation should be in infrastructure layer
 */
export interface JwtSignerPort {
  sign(payload: Record<string, unknown>): string;
  verify<T extends Record<string, unknown> = Record<string, unknown>>(token: string): T;
}

export interface JwtPayload extends Record<string, unknown> {
  /** Standard JWT subject */
  readonly sub?: string;
  readonly userId: string;
  readonly email: string;
  readonly role: string;
  readonly iat?: number;
  readonly exp?: number;
}

export class JwtToken {
  private constructor(
    private readonly _value: string,
    private readonly _payload: JwtPayload,
  ) {
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  get payload(): JwtPayload {
    return { ...this._payload };
  }

  get userId(): string {
    return this._payload.userId;
  }

  get email(): string {
    return this._payload.email;
  }

  get role(): string {
    return this._payload.role;
  }

  get isExpired(): boolean {
    if (!this._payload.exp) return false;
    return Date.now() >= this._payload.exp * 1000;
  }

  get expiresAt(): Date | null {
    if (!this._payload.exp) return null;
    return new Date(this._payload.exp * 1000);
  }

  static create(
    jwtSigner: JwtSignerPort,
    payload: { userId: string; email: string; role: string },
  ): JwtToken {
    const enrichedPayload = { sub: payload.userId, ...payload };
    const token = jwtSigner.sign(enrichedPayload);
    return new JwtToken(token, enrichedPayload);
  }

  static fromString(jwtSigner: JwtSignerPort, token: string): JwtToken | null {
    try {
      const payload = jwtSigner.verify<JwtPayload>(token);
      return new JwtToken(token, payload);
    } catch {
      return null;
    }
  }

  static decode(token: string): JwtPayload | null {
    try {
      const [, payloadBase64] = token.split(".");
      const payload = JSON.parse(
        Buffer.from(payloadBase64, "base64").toString("utf8"),
      );
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  equals(other: JwtToken): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
