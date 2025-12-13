/**
 * @interfaces Admin Permissions
 * 
 * Interfaces para sistema RBAC (Role-Based Access Control).
 * Define permisos granulares por rol para control de acceso.
 */

export enum UserRoleEnum {
    ADMIN = 'admin',
    SUPERVISOR = 'supervisor',
    TECNICO = 'tecnico',
    ADMINISTRATIVO = 'administrativo',
}

export enum PermissionAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
    APPROVE = 'approve',
    EXECUTE = 'execute',
}

export enum PermissionResource {
    USERS = 'users',
    ORDERS = 'orders',
    KITS = 'kits',
    DASHBOARD = 'dashboard',
    ARCHIVE = 'archive',
    CHECKLISTS = 'checklists',
    PLANEACION = 'planeacion',
    EJECUCION = 'ejecucion',
    EVIDENCE = 'evidence',
    CLIENTS = 'clients',
    REPORTS = 'reports',
    DOCUMENTS = 'documents',
    COSTS = 'costs',
}

export interface IPermission {
    /** Recurso al que aplica */
    resource: PermissionResource;

    /** Acciones permitidas */
    actions: PermissionAction[];
}

export interface IRolePermissions {
    /** Rol */
    role: UserRoleEnum;

    /** Descripción del rol */
    description: string;

    /** Permisos asignados */
    permissions: IPermission[];
}

/**
 * Matriz de permisos por rol.
 * Define qué puede hacer cada rol en el sistema.
 */
export const ROLE_PERMISSIONS: IRolePermissions[] = [
    {
        role: UserRoleEnum.ADMIN,
        description: 'Administrador con acceso total al sistema',
        permissions: [
            { resource: PermissionResource.USERS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.ORDERS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.KITS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.DASHBOARD, actions: [PermissionAction.READ] },
            { resource: PermissionResource.ARCHIVE, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.CHECKLISTS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.PLANEACION, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.EJECUCION, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.EVIDENCE, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.CLIENTS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.REPORTS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.DOCUMENTS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.COSTS, actions: [PermissionAction.MANAGE] },
        ],
    },
    {
        role: UserRoleEnum.SUPERVISOR,
        description: 'Supervisor de operaciones con acceso a métricas y aprobaciones',
        permissions: [
            { resource: PermissionResource.ORDERS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
            { resource: PermissionResource.DASHBOARD, actions: [PermissionAction.READ] },
            { resource: PermissionResource.CHECKLISTS, actions: [PermissionAction.APPROVE, PermissionAction.READ] },
            { resource: PermissionResource.PLANEACION, actions: [PermissionAction.APPROVE, PermissionAction.READ] },
            { resource: PermissionResource.EJECUCION, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
            { resource: PermissionResource.EVIDENCE, actions: [PermissionAction.READ] },
            { resource: PermissionResource.REPORTS, actions: [PermissionAction.READ] },
            { resource: PermissionResource.COSTS, actions: [PermissionAction.READ] },
        ],
    },
    {
        role: UserRoleEnum.TECNICO,
        description: 'Técnico de campo con capacidades de ejecución',
        permissions: [
            { resource: PermissionResource.ORDERS, actions: [PermissionAction.READ] },
            { resource: PermissionResource.CHECKLISTS, actions: [PermissionAction.READ, PermissionAction.EXECUTE] },
            { resource: PermissionResource.EJECUCION, actions: [PermissionAction.EXECUTE, PermissionAction.READ] },
            { resource: PermissionResource.EVIDENCE, actions: [PermissionAction.CREATE, PermissionAction.READ] },
        ],
    },
    {
        role: UserRoleEnum.ADMINISTRATIVO,
        description: 'Personal administrativo para gestión documental',
        permissions: [
            { resource: PermissionResource.ORDERS, actions: [PermissionAction.CREATE, PermissionAction.READ] },
            { resource: PermissionResource.CLIENTS, actions: [PermissionAction.MANAGE] },
            { resource: PermissionResource.REPORTS, actions: [PermissionAction.CREATE, PermissionAction.READ] },
            { resource: PermissionResource.DOCUMENTS, actions: [PermissionAction.CREATE, PermissionAction.READ] },
            { resource: PermissionResource.COSTS, actions: [PermissionAction.CREATE, PermissionAction.READ] },
        ],
    },
];

/**
 * Helper para verificar permisos.
 */
export function hasPermission(
    role: UserRoleEnum,
    resource: PermissionResource,
    action: PermissionAction,
): boolean {
    const roleConfig = ROLE_PERMISSIONS.find((r) => r.role === role);
    if (!roleConfig) return false;

    const permission = roleConfig.permissions.find((p) => p.resource === resource);
    if (!permission) return false;

    // MANAGE incluye todas las acciones
    if (permission.actions.includes(PermissionAction.MANAGE)) {
        return true;
    }

    return permission.actions.includes(action);
}

/**
 * Helper para obtener todos los permisos de un rol.
 */
export function getPermissionsForRole(role: UserRoleEnum): IPermission[] {
    const roleConfig = ROLE_PERMISSIONS.find((r) => r.role === role);
    return roleConfig?.permissions ?? [];
}
