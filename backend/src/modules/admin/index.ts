/**
 * @barrel Admin Module Exports
 *
 * Exportaciones del módulo de administración y RBAC.
 */

// Services
export { AdminService } from "./admin.service";

// Interfaces
export {
  UserRoleEnum,
  PermissionAction,
  PermissionResource,
  IPermission,
  IRolePermissions,
  ROLE_PERMISSIONS,
  hasPermission,
  getPermissionsForRole,
} from "./interfaces/permissions.interface";

// DTOs
export {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  AdminChangePasswordDto,
  ToggleUserActiveDto,
  ListUsersQueryDto,
  UserResponseDto,
  AdminActionResponseDto,
  ListUsersResponseDto,
} from "./dto/admin.dto";

// Module
export { AdminModule } from "./admin.module";
