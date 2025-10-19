/**
 * Rutas de la aplicación
 * Centraliza todas las rutas para fácil mantenimiento
 */

export const ROUTES = {
  // Públicas
  HOME: '/',
  
  // Autenticación
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Órdenes de trabajo
  WORK_ORDERS: '/work-orders',
  CCTV_NEW: '/work-orders/cctv/new',
  CCTV_LIST: '/work-orders/cctv',
  CCTV_DETAIL: (id: string) => `/work-orders/cctv/${id}`,
  
  // Admin
  DASHBOARD: '/dashboard',
  USERS: '/admin/users',
  SETTINGS: '/settings',
  
  // API
  API: {
    AUTH: '/api/auth',
    WORK_ORDERS: '/api/work-orders',
    USERS: '/api/users',
  },
} as const;

/**
 * Rutas protegidas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  ROUTES.WORK_ORDERS,
  ROUTES.CCTV_NEW,
  ROUTES.CCTV_LIST,
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.SETTINGS,
] as const;

/**
 * Rutas públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const;
