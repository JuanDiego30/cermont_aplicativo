/**
 * @valueObject UserRole
 *
 * Role como Value Object con validación y jerarquía.
 */

import { ValidationError } from "../../../../common/domain/exceptions";

export const USER_ROLES = [
  "admin",
  "supervisor",
  "tecnico",
  "administrativo",
] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

/**
 * Jerarquía de roles (mayor número = más permisos)
 */
const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  admin: 4,
  supervisor: 3,
  tecnico: 2,
  administrativo: 1,
};

export class UserRole {
  private readonly value: UserRoleType;

  private constructor(role: UserRoleType) {
    this.value = role;
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Crea un rol validado
   * @throws Error si el rol es inválido
   */
  static create(role: string): UserRole {
    const normalizedRole = role?.toLowerCase().trim();

    if (!this.isValid(normalizedRole)) {
      throw new ValidationError(
        `Rol inválido: ${role}. Roles válidos: ${USER_ROLES.join(", ")}`,
        "role",
        role,
      );
    }

    return new UserRole(normalizedRole as UserRoleType);
  }

  /**
   * Valida si el rol existe
   */
  private static isValid(role: string): role is UserRoleType {
    return USER_ROLES.includes(role as UserRoleType);
  }

  /**
   * Obtiene el valor del rol
   */
  getValue(): UserRoleType {
    return this.value;
  }

  /**
   * Compara con otro rol
   */
  equals(other: UserRole): boolean {
    return this.value === other.value;
  }

  /**
   * Verifica si es admin
   */
  isAdmin(): boolean {
    return this.value === "admin";
  }

  /**
   * Verifica si es supervisor
   */
  isSupervisor(): boolean {
    return this.value === "supervisor";
  }

  /**
   * Verifica si es técnico
   */
  isTecnico(): boolean {
    return this.value === "tecnico";
  }

  /**
   * Verifica si es administrativo
   */
  isAdministrativo(): boolean {
    return this.value === "administrativo";
  }

  /**
   * Obtiene nivel jerárquico
   */
  getHierarchyLevel(): number {
    return ROLE_HIERARCHY[this.value];
  }

  /**
   * Verifica si tiene mayor jerarquía que otro rol
   */
  isHigherThan(other: UserRole): boolean {
    return this.getHierarchyLevel() > other.getHierarchyLevel();
  }

  /**
   * Verifica si tiene igual o mayor jerarquía
   */
  isHigherOrEqualTo(other: UserRole): boolean {
    return this.getHierarchyLevel() >= other.getHierarchyLevel();
  }

  /**
   * Verifica si puede asignar un rol a otro usuario
   */
  canAssignRole(targetRole: UserRole): boolean {
    // Solo admin puede asignar cualquier rol
    if (this.isAdmin()) return true;

    // Supervisor puede asignar roles menores (no admin, no supervisor)
    if (this.isSupervisor()) {
      return targetRole.getHierarchyLevel() < this.getHierarchyLevel();
    }

    // Otros no pueden asignar roles
    return false;
  }

  /**
   * Representación string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtiene todos los roles válidos
   */
  static getAllRoles(): readonly UserRoleType[] {
    return USER_ROLES;
  }

  /**
   * Verificar si puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Verificar si puede gestionar órdenes
   */
  canManageOrders(): boolean {
    return this.isAdmin() || this.isSupervisor();
  }

  /**
   * Verificar si puede ejecutar trabajos
   */
  canExecuteOrders(): boolean {
    return this.isTecnico();
  }

  /**
   * Verificar si puede ver dashboard completo
   */
  canViewFullDashboard(): boolean {
    return this.isAdmin() || this.isSupervisor();
  }

  /**
   * Serialización JSON
   */
  toJSON(): string {
    return this.value;
  }
}
