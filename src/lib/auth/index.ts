/**
 * Barrel export para módulos de autenticación
 */

export { AuthProvider, useAuth, useRole, useHasRole } from './AuthContext';
export { usePermission, useHasAnyPermission, useHasAllPermissions, useIsAuthenticated } from './hooks';
export { withRole } from './withRole';
export { ProtectedRoute } from './ProtectedRoute';
export { Can } from './Can';
