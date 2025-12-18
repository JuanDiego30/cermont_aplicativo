
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export type UserRole = 'admin' | 'supervisor' | 'tecnico';

export interface AuthUserProps {
    id: string;
    email: string;
    password: string;  // hashed
    name: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string | null;
    active: boolean;
    lastLogin?: Date | null;
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
    ) { }

    /**
     * Reconstitute from database record
     */
    static fromDatabase(props: AuthUserProps): AuthUserEntity {
        return new AuthUserEntity(
            props.id,
            Email.create(props.email),
            Password.fromHashed(props.password),
            props.name,
            props.role,
            props.phone ?? null,
            props.avatar ?? null,
            props.active,
            props.lastLogin ?? null,
        );
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
        return this.passwordHash.getValue();
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
