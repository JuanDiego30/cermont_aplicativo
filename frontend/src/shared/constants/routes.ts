/**
 * Application Routes
 */

export const ROUTES = {
  // Auth
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_NEW: '/orders/new',

  // Users
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  USER_NEW: '/users/new',

  // Kits
  KITS: '/kits',
  KIT_DETAIL: (id: string) => `/kits/${id}`,
  KIT_NEW: '/kits/new',

  // WorkPlans
  WORKPLANS: '/workplans',
  WORKPLAN_DETAIL: (id: string) => `/workplans/${id}`,

  // Checklists
  CHECKLISTS: '/checklists',
  CHECKLIST_DETAIL: (id: string) => `/checklists/${id}`,

  // Evidences
  EVIDENCES: '/evidences',

  // Reports
  REPORTS: '/reports',

  // Billing
  BILLING: '/billing',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.SIGNIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.ORDERS,
  ROUTES.USERS,
  ROUTES.KITS,
  ROUTES.WORKPLANS,
  ROUTES.CHECKLISTS,
  ROUTES.EVIDENCES,
  ROUTES.REPORTS,
  ROUTES.BILLING,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
];
