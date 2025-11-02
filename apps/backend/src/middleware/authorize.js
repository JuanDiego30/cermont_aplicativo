/**
 * Compatibility wrapper for authorization middleware
 * Some modules import `authorizeRoles` — re-export from rbac.js
 */
import { requireRole } from './rbac.js';

export const authorizeRoles = (...roles) => requireRole(...roles);

export default authorizeRoles;
