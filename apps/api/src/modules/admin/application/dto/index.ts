/**
 * @barrel DTOs
 *
 * Exportación centralizada de DTOs.
 */

export * from "./create-user.dto";
export * from "./update-user.dto";
export * from "./change-role.dto";
export * from "./change-password.dto";
export * from "./toggle-active.dto";
export * from "./user-query.dto";
export * from "./user-response.dto";

// Legacy DTOs (class-validator) - exportar solo los que no tienen equivalente Zod
export {
  UserRoleEnum,
  UpdateUserRoleDto,
  ListUsersQueryDto,
  PaginatedUsersResponse,
  AdminChangePasswordDto,
  ToggleUserActiveDto,
  AdminActionResponseDto,
  ListUsersResponseDto,
  // Renombrar los conflictivos con sufijo Legacy
  CreateUserDto as CreateUserDtoLegacy,
  UpdateUserDto as UpdateUserDtoLegacy,
  UserResponseDto as UserResponseDtoLegacy,
} from "./admin-legacy.dto";
