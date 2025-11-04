/**
 * Route Registry Utility (TypeScript - November 2025)
 * @description Central registry of all API routes for documentation and monitoring
 */

interface RouteInfo {
  method: string;
  path: string;
  description?: string;
}

interface RoutesRegistry {
  [module: string]: RouteInfo[];
}

/**
 * Get all registered routes organized by module
 */
export const getRoutes = (): RoutesRegistry => {
  return {
    auth: [
      { method: 'POST', path: '/api/v1/auth/register', description: 'User registration' },
      { method: 'POST', path: '/api/v1/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/v1/auth/logout', description: 'User logout' },
      { method: 'POST', path: '/api/v1/auth/logout-all', description: 'Logout all sessions' },
      { method: 'POST', path: '/api/v1/auth/refresh', description: 'Refresh access token' },
      { method: 'GET', path: '/api/v1/auth/me', description: 'Get current user' },
      { method: 'PUT', path: '/api/v1/auth/me', description: 'Update current user' },
      { method: 'PUT', path: '/api/v1/auth/change-password', description: 'Change password' },
      { method: 'POST', path: '/api/v1/auth/forgot-password', description: 'Forgot password' },
      { method: 'POST', path: '/api/v1/auth/reset-password', description: 'Reset password' },
      { method: 'POST', path: '/api/v1/auth/verify-token', description: 'Verify token' },
      { method: 'GET', path: '/api/v1/auth/sessions', description: 'Get user sessions' },
      { method: 'DELETE', path: '/api/v1/auth/sessions/:id', description: 'Revoke session' },
    ],
    users: [
      { method: 'GET', path: '/api/v1/users', description: 'List users' },
      { method: 'GET', path: '/api/v1/users/:id', description: 'Get user by ID' },
      { method: 'POST', path: '/api/v1/users', description: 'Create user' },
      { method: 'PUT', path: '/api/v1/users/:id', description: 'Update user' },
      { method: 'DELETE', path: '/api/v1/users/:id', description: 'Delete user' },
      { method: 'PATCH', path: '/api/v1/users/:id/toggle-active', description: 'Toggle user active status' },
      { method: 'PUT', path: '/api/v1/users/:id/change-password', description: 'Change user password' },
      { method: 'GET', path: '/api/v1/users/role/:role', description: 'Get users by role' },
      { method: 'GET', path: '/api/v1/users/stats/summary', description: 'User statistics' },
      { method: 'GET', path: '/api/v1/users/search', description: 'Search users' },
    ],
    orders: [
      { method: 'GET', path: '/api/v1/orders', description: 'List orders' },
      { method: 'GET', path: '/api/v1/orders/:id', description: 'Get order by ID' },
      { method: 'POST', path: '/api/v1/orders', description: 'Create order' },
      { method: 'PUT', path: '/api/v1/orders/:id', description: 'Update order' },
      { method: 'DELETE', path: '/api/v1/orders/:id', description: 'Delete order' },
      { method: 'PATCH', path: '/api/v1/orders/:id/status', description: 'Change order status' },
      { method: 'POST', path: '/api/v1/orders/:id/assign', description: 'Assign users to order' },
      { method: 'POST', path: '/api/v1/orders/:id/notes', description: 'Add note to order' },
      { method: 'GET', path: '/api/v1/orders/stats/summary', description: 'Order statistics' },
      { method: 'POST', path: '/api/v1/orders/:id/archive', description: 'Archive order' },
      { method: 'POST', path: '/api/v1/orders/:id/unarchive', description: 'Unarchive order' },
    ],
    workplans: [
      { method: 'GET', path: '/api/v1/workplans/stats/summary', description: 'Workplan statistics' },
      { method: 'GET', path: '/api/v1/workplans', description: 'List workplans' },
      { method: 'GET', path: '/api/v1/workplans/order/:orderId', description: 'Get workplan by order ID' },
      { method: 'GET', path: '/api/v1/workplans/:id', description: 'Get workplan by ID' },
      { method: 'POST', path: '/api/v1/workplans', description: 'Create workplan' },
      { method: 'PUT', path: '/api/v1/workplans/:id', description: 'Update workplan' },
      { method: 'DELETE', path: '/api/v1/workplans/:id', description: 'Delete workplan' },
      { method: 'POST', path: '/api/v1/workplans/:id/approve', description: 'Approve workplan' },
      { method: 'PATCH', path: '/api/v1/workplans/:id/cronograma/:actividadId/complete', description: 'Complete activity' },
    ],
    toolkits: [
      { method: 'GET', path: '/api/v1/toolkits', description: 'List toolkits' },
      { method: 'GET', path: '/api/v1/toolkits/:id', description: 'Get toolkit by ID' },
      { method: 'GET', path: '/api/v1/toolkits/category/:category', description: 'Get toolkits by category' },
      { method: 'POST', path: '/api/v1/toolkits', description: 'Create toolkit' },
      { method: 'PUT', path: '/api/v1/toolkits/:id', description: 'Update toolkit' },
      { method: 'DELETE', path: '/api/v1/toolkits/:id', description: 'Delete toolkit' },
      { method: 'PATCH', path: '/api/v1/toolkits/:id/increment-usage', description: 'Increment toolkit usage' },
      { method: 'GET', path: '/api/v1/toolkits/stats/most-used', description: 'Most used toolkits' },
      { method: 'POST', path: '/api/v1/toolkits/:id/clone', description: 'Clone toolkit' },
      { method: 'PATCH', path: '/api/v1/toolkits/:id/toggle-active', description: 'Toggle toolkit active status' },
      { method: 'GET', path: '/api/v1/toolkits/stats/summary', description: 'Toolkit statistics' },
    ],
    reports: [
      { method: 'GET', path: '/api/v1/reports/orders', description: 'Orders report' },
      { method: 'GET', path: '/api/v1/reports/workplans', description: 'Workplans report' },
      { method: 'GET', path: '/api/v1/reports/users', description: 'Users report' },
      { method: 'GET', path: '/api/v1/reports/performance', description: 'Performance report' },
      { method: 'GET', path: '/api/v1/reports/cctv', description: 'CCTV report' },
    ],
    upload: [
      { method: 'POST', path: '/api/v1/upload/single', description: 'Upload single file' },
      { method: 'POST', path: '/api/v1/upload/multiple', description: 'Upload multiple files' },
      { method: 'POST', path: '/api/v1/upload/cctv-photos', description: 'Upload CCTV photos' },
      { method: 'DELETE', path: '/api/v1/upload/files/:filename', description: 'Delete file' },
    ],
    audit: [
      { method: 'GET', path: '/api/v1/audit/logs', description: 'Get audit logs' },
      { method: 'GET', path: '/api/v1/audit/user-activity/:userId', description: 'Get user activity' },
      { method: 'GET', path: '/api/v1/audit/security-alerts', description: 'Get security alerts' },
      { method: 'GET', path: '/api/v1/audit/stats', description: 'Audit statistics' },
    ],
    admin: [
      { method: 'GET', path: '/api/v1/admin/rate-limit-stats', description: 'Rate limit statistics' },
      { method: 'POST', path: '/api/v1/admin/block-ip', description: 'Block IP' },
      { method: 'POST', path: '/api/v1/admin/unblock-ip', description: 'Unblock IP' },
      { method: 'POST', path: '/api/v1/admin/whitelist-ip', description: 'Whitelist IP' },
      { method: 'POST', path: '/api/v1/admin/remove-from-whitelist', description: 'Remove from whitelist' },
      { method: 'POST', path: '/api/v1/admin/reset-ip-limit', description: 'Reset IP limit' },
      { method: 'GET', path: '/api/v1/admin/check-ip-status', description: 'Check IP status' },
    ],
    system: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/v1/system/info', description: 'System info' },
      { method: 'GET', path: '/api/v1/system/routes', description: 'List all routes' },
      { method: 'GET', path: '/api/v1/system/cache-stats', description: 'Cache statistics' },
      { method: 'POST', path: '/api/v1/system/cache-flush', description: 'Flush cache' },
      { method: 'GET', path: '/api/v1/system/metrics', description: 'System metrics' },
    ],
  };
};