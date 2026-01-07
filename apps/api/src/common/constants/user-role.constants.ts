/**
 * @constants UserRole
 * @description Re-export from canonical source
 * @layer Common/Constants
 *
 * @deprecated Import directly from common/enums/user-role.enum instead
 * This file is kept for backwards compatibility only.
 */

// Re-export everything from canonical source
export {
  UserRole,
  ALL_USER_ROLES as USER_ROLES,
  isValidUserRole,
  USER_ROLE_LABELS,
  USER_ROLE_DESCRIPTIONS,
  ADMIN_ROLES,
  SUPERVISOR_ROLES,
  OPERATIVE_ROLES,
} from "../enums/user-role.enum";

// Type alias for backwards compatibility
import { UserRole } from "../enums/user-role.enum";
export type UserRoleType = `${UserRole}`;
