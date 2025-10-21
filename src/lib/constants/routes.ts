/**
 * Rutas de la aplicación
 * Centraliza todas las rutas para fácil mantenimiento
 */

export const ROUTES = {
  // Públicas
  HOME: '/',
  LANDING: '/inicio',
  ACCESS_DENIED: '/acceso-denegado',

  // Autenticación
  LOGIN: '/autenticacion/login',
  REGISTER: '/autenticacion/registro',

  // Órdenes de trabajo
  WORK_ORDERS: '/ordenes',
  WORK_ORDERS_NEW: '/ordenes/nueva',
  CCTV_NEW: '/ordenes/cctv/nueva',
  CCTV_LIST: '/ordenes/cctv',
  CCTV_DETAIL: (id: string) => `/ordenes/cctv/${id}`,
  WORK_ORDER_DETAIL: (id: string) => `/ordenes/${id}`,
  WORK_ORDER_EDIT: (id: string) => `/ordenes/${id}/editar`,
  WORK_PLAN: '/ordenes/planeacion',

  // Admin y paneles por rol
  DASHBOARD: '/admin/dashboard',
  USERS: '/usuarios',
  REPORTS: '/reportes',

  ROLES: {
    CLIENTE: {
      DASHBOARD: '/cliente/dashboard',
      ORDERS: '/cliente/ordenes',
      EQUIPMENT: '/cliente/equipos',
      REQUEST_SERVICE: '/cliente/solicitar-servicio',
      PROFILE: '/cliente/perfil',
    },
    TECNICO: {
      DASHBOARD: '/tecnico/dashboard',
      ASSIGNED_ORDERS: '/tecnico/ordenes-asignadas',
      CALENDAR: '/tecnico/calendario',
      REPORT: '/tecnico/reportar',
      HISTORY: '/tecnico/historial',
      PROFILE: '/tecnico/perfil',
    },
    COORDINADOR: {
      DASHBOARD: '/coordinador/dashboard',
      ORDERS: '/coordinador/ordenes',
      ASSIGN: '/coordinador/asignar',
      TECHNICIANS: '/coordinador/tecnicos',
      CLIENTS: '/coordinador/clientes',
      CALENDAR: '/coordinador/calendario',
      PROFILE: '/coordinador/perfil',
    },
    GERENTE: {
      DASHBOARD: '/gerente/dashboard',
      REPORTS: '/gerente/reportes',
      KPIS: '/gerente/kpis',
      ORDERS: '/gerente/ordenes',
      CLIENTS: '/gerente/clientes',
      TEAM: '/gerente/equipo',
      SETTINGS: '/gerente/configuracion',
      PROFILE: '/gerente/perfil',
    },
  },

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
  ROUTES.WORK_ORDERS_NEW,
  ROUTES.CCTV_NEW,
  ROUTES.CCTV_LIST,
  ROUTES.WORK_PLAN,
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.REPORTS,
] as const;

/**
 * Rutas públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LANDING,
  ROUTES.ACCESS_DENIED,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
] as const;
