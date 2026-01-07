/**
 * @enum UserRole
 * @description Single Source of Truth para roles de usuario.
 * Define todos los roles disponibles en el sistema, alineados con Prisma schema.
 * @layer Shared/Common
 */
export enum UserRole {
    ADMIN = "admin",
    SUPERVISOR = "supervisor",
    TECNICO = "tecnico",
    ADMINISTRATIVO = "administrativo",
    GERENTE = "gerente",
}

export type UserRoleType = `${UserRole}`;

export const USER_ROLES = Object.values(UserRole);

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.SUPERVISOR]: "Supervisor",
    [UserRole.TECNICO]: "Técnico",
    [UserRole.ADMINISTRATIVO]: "Administrativo",
    [UserRole.GERENTE]: "Gerente",
};
