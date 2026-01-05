/**
 * @entity UserEntity
 *
 * Entidad de dominio User con reglas de negocio puras.
 * No tiene dependencias de framework.
 */

import { Email, Password } from "../../../../common/domain/value-objects";
import { UserRole } from "../value-objects/user-role.vo";
import { UserId } from "../value-objects/user-id.vo";
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  RoleChangedEvent,
  UserDeactivatedEvent,
  PasswordResetEvent,
  type UserDomainEvent,
  type UserUpdateChanges,
} from "../events";
import {
  ValidationError,
  BusinessRuleViolationError,
} from "../../../../common/domain/exceptions";

export interface UserProps {
  id: UserId;
  email: Email;
  name: string;
  password: Password;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  plainPassword: string;
  role: string;
  phone?: string;
  avatar?: string;
  createdBy?: string;
}

export interface PersistenceData {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  active: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class UserEntity {
  private props: UserProps;
  private domainEvents: UserDomainEvent[] = [];

  private constructor(props: UserProps) {
    this.props = props;
    this.validate(); // Validar invariantes
  }

  // ============================================
  // FACTORY METHODS
  // ============================================

  /**
   * Crea un nuevo usuario (para registro)
   */
  static async create(data: CreateUserData): Promise<UserEntity> {
    // Validaciones de dominio
    if (!data.name || data.name.trim().length < 2) {
      throw new ValidationError(
        "Nombre debe tener al menos 2 caracteres",
        "name",
      );
    }

    if (data.name.length > 100) {
      throw new ValidationError(
        "Nombre no puede exceder 100 caracteres",
        "name",
      );
    }

    if (data.phone && !/^\+?[\d\s-]{7,20}$/.test(data.phone)) {
      throw new ValidationError(
        "Formato de teléfono inválido",
        "phone",
        data.phone,
      );
    }

    const user = new UserEntity({
      id: UserId.create(),
      email: Email.create(data.email),
      name: data.name.trim(),
      password: await Password.createFromPlainText(data.plainPassword),
      role: UserRole.create(data.role),
      phone: data.phone?.trim(),
      avatar: data.avatar?.trim(),
      active: true,
      createdAt: new Date(),
    });

    // Emitir evento de dominio
    user.addDomainEvent(
      new UserCreatedEvent(
        user.id.getValue(),
        user.email.getValue(),
        user.name,
        user.role.getValue(),
        data.createdBy,
      ),
    );

    return user;
  }

  /**
   * Reconstitución desde base de datos
   */
  static fromPersistence(data: PersistenceData): UserEntity {
    return new UserEntity({
      id: UserId.fromString(data.id),
      email: Email.create(data.email),
      name: data.name,
      password: Password.fromHash(data.passwordHash),
      role: UserRole.create(data.role),
      phone: data.phone ?? undefined,
      avatar: data.avatar ?? undefined,
      active: data.active,
      lastLogin: data.lastLogin ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? undefined,
    });
  }

  // ============================================
  // GETTERS (Read-only access)
  // ============================================

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): Password {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get isActive(): boolean {
    return this.props.active;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // ============================================
  // BUSINESS LOGIC
  // ============================================

  /**
   * Actualiza información básica del usuario
   */
  update(
    data: { name?: string; phone?: string; avatar?: string },
    updatedBy?: string,
  ): void {
    const changes: UserUpdateChanges = {};

    if (data.name !== undefined && data.name !== this.props.name) {
      if (data.name.trim().length < 2) {
        throw new ValidationError(
          "Nombre debe tener al menos 2 caracteres",
          "name",
        );
      }
      if (data.name.length > 100) {
        throw new ValidationError(
          "Nombre no puede exceder 100 caracteres",
          "name",
        );
      }
      changes.name = { old: this.props.name, new: data.name.trim() };
      this.props.name = data.name.trim();
    }

    if (data.phone !== undefined && data.phone !== this.props.phone) {
      if (data.phone && !/^\+?[\d\s-]{7,20}$/.test(data.phone)) {
        throw new ValidationError(
          "Formato de teléfono inválido",
          "phone",
          data.phone,
        );
      }
      changes.phone = { old: this.props.phone, new: data.phone || undefined };
      this.props.phone = data.phone?.trim() || undefined;
    }

    if (data.avatar !== undefined && data.avatar !== this.props.avatar) {
      changes.avatar = {
        old: this.props.avatar,
        new: data.avatar || undefined,
      };
      this.props.avatar = data.avatar?.trim() || undefined;
    }

    if (Object.keys(changes).length > 0) {
      this.props.updatedAt = new Date();
      this.addDomainEvent(
        new UserUpdatedEvent(this.props.id.getValue(), changes, updatedBy),
      );
    }
  }

  /**
   * Cambia el rol del usuario
   */
  changeRole(newRoleString: string, changedBy: string): void {
    const newRole = UserRole.create(newRoleString);

    if (this.props.role.equals(newRole)) {
      throw new BusinessRuleViolationError(
        "El usuario ya tiene ese rol",
        "ROLE_UNCHANGED",
      );
    }

    const oldRole = this.props.role.getValue();
    this.props.role = newRole;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new RoleChangedEvent(
        this.props.id.getValue(),
        this.props.email.getValue(),
        oldRole,
        newRole.getValue(),
        changedBy,
      ),
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(
    newPlainPassword: string,
    changedBy: string,
    isAdminReset: boolean = false,
  ): Promise<void> {
    this.props.password = await Password.createFromPlainText(newPlainPassword);
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PasswordResetEvent(
        this.props.id.getValue(),
        this.props.email.getValue(),
        changedBy,
        isAdminReset,
      ),
    );
  }

  /**
   * Verifica contraseña
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.props.password.matches(plainPassword);
  }

  /**
   * Activa el usuario
   */
  activate(): void {
    if (this.props.active) {
      throw new BusinessRuleViolationError(
        "El usuario ya está activo",
        "ALREADY_ACTIVE",
      );
    }
    this.props.active = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Desactiva el usuario (soft delete)
   */
  deactivate(deactivatedBy: string, reason?: string): void {
    if (!this.props.active) {
      throw new BusinessRuleViolationError(
        "El usuario ya está desactivado",
        "ALREADY_INACTIVE",
      );
    }

    this.props.active = false;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new UserDeactivatedEvent(
        this.props.id.getValue(),
        this.props.email.getValue(),
        deactivatedBy,
        reason,
      ),
    );
  }

  /**
   * Registra login exitoso
   */
  recordLogin(): void {
    this.props.lastLogin = new Date();
  }

  /**
   * Verifica si el usuario puede realizar acción sobre otro
   */
  canManageUser(targetUser: UserEntity): boolean {
    // Un usuario no puede gestionarse a sí mismo para ciertas acciones
    if (this.id.equals(targetUser.id)) {
      return false;
    }

    // Admin puede gestionar a todos
    if (this.role.isAdmin()) {
      return true;
    }

    // Supervisor puede gestionar roles inferiores
    if (this.role.isSupervisor()) {
      return !targetUser.role.isAdmin() && !targetUser.role.isSupervisor();
    }

    return false;
  }

  /**
   * Verifica si puede cambiar su propio rol
   */
  canChangeSelfRole(): boolean {
    // Nadie puede cambiarse su propio rol de admin
    return !this.role.isAdmin();
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  /**
   * Convierte a formato de persistencia
   */
  toPersistence(): PersistenceData {
    return {
      id: this.props.id.getValue(),
      email: this.props.email.getValue(),
      name: this.props.name,
      passwordHash: this.props.password.getHash(),
      role: this.props.role.getValue(),
      phone: this.props.phone ?? null,
      avatar: this.props.avatar ?? null,
      active: this.props.active,
      lastLogin: this.props.lastLogin ?? null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt ?? null,
    };
  }

  // ============================================
  // DOMAIN EVENTS
  // ============================================

  private addDomainEvent(event: UserDomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): UserDomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES DE INVARIANTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Valida invariantes de dominio
   * Se ejecuta en el constructor
   */
  private validate(): void {
    // Invariante: Un usuario ADMIN no puede estar inactivo
    if (this.props.role.isAdmin() && !this.props.active) {
      throw new BusinessRuleViolationError(
        "Un usuario ADMIN no puede estar inactivo",
        "ADMIN_MUST_BE_ACTIVE",
        { userId: this.props.id.getValue(), role: this.props.role.getValue() },
      );
    }
  }
}
