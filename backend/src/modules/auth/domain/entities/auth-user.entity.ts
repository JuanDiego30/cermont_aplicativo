import { Email, Password } from '../value-objects';

export type UserRole = 'admin' | 'supervisor' | 'tecnico';

export interface AuthUserProps {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  active: boolean;
  lastLogin?: Date | null;

  // Seguridad (schema.prisma)
  loginAttempts?: number;
  lockedUntil?: Date | null;
  twoFactorEnabled?: boolean;
}

/**
 * Authenticated User Entity
 * Represents a user in the authentication domain
 */
export class AuthUserEntity {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    private readonly passwordHash: Password,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly phone: string | null,
    public readonly avatar: string | null,
    public readonly active: boolean,
    public readonly lastLogin: Date | null,
    public readonly loginAttempts: number,
    public readonly lockedUntil: Date | null,
    public readonly twoFactorEnabled: boolean
  ) {}

  /**
   * Reconstitute from database record
   */
  static fromDatabase(props: AuthUserProps): AuthUserEntity {
    return new AuthUserEntity(
      props.id,
      Email.create(props.email),
      Password.fromHash(props.password),
      props.name,
      props.role,
      props.phone ?? null,
      props.avatar ?? null,
      props.active,
      props.lastLogin ?? null,
      props.loginAttempts ?? 0,
      props.lockedUntil ?? null,
      props.twoFactorEnabled ?? false
    );
  }

  isLocked(now = new Date()): boolean {
    return Boolean(this.lockedUntil && this.lockedUntil.getTime() > now.getTime());
  }

  /**
   * Check if the user can login (active + password check is separate)
   */
  canLogin(): boolean {
    return this.active;
  }

  /**
   * Get the hashed password for comparison
   */
  getPasswordHash(): string {
    return this.passwordHash.getHash();
  }

  /**
   * Convert to plain object (without password) for responses
   */
  toPublicObject() {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      role: this.role,
      phone: this.phone,
      avatar: this.avatar,
    };
  }
}
