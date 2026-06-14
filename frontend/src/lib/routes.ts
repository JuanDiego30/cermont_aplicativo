export const APP_ROUTES = {
	home: "/",
	login: "/login",
	register: "/register",
	forgotPassword: "/forgot-password",
	resetPassword: "/reset-password",
	unauthorized: "/unauthorized",
	dashboard: "/dashboard",
	profile: "/profile",
	workRequests: "/work-requests",
	workRequestNew: "/work-requests/new",
	siteVisits: "/site-visits",
	siteVisitNew: "/site-visits/new",
	proposals: "/proposals",
	proposalNew: "/proposals/new",
	purchaseOrders: "/purchase-orders",
	orders: "/orders",
	orderNew: "/orders/new",
	orderKanban: "/orders/kanban",
	planning: "/planning",
	execution: "/execution",
	evidences: "/evidences",
	reports: "/reports",
	reportsAnalytics: "/reports/analytics",
	deliveryRecords: "/delivery-records",
	billing: "/billing",
	billingSes: "/billing/ses",
	billingInvoices: "/billing/invoices",
	payments: "/payments",
	costs: "/costs",
	assets: "/assets",
	inventoryScan: "/inventory/scan",
	dispatch: "/dispatch",
	sla: "/sla",
	maintenance: "/maintenance",
	documents: "/documents",
	resources: "/resources",
	resourceKits: "/resources/kits",
	templates: "/templates",
	admin: "/admin",
	adminUsers: "/admin/users",
	adminUsersNew: "/admin/users/new",
	adminCustomFields: "/admin/custom-fields",
	adminPersonnel: "/admin/personnel",
	adminBackups: "/admin/backups",
	adminAudit: "/admin/audit",
	adminSettings: "/admin/settings",
	settings: "/settings",
	serviceCases: "/service-cases",
	customers: "/customers",
	customerNew: "/customers/new",
	notifications: "/notifications",
	offlineSync: "/offline-sync",
	inventory: "/inventory",
	fleet: "/fleet",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoute = (typeof APP_ROUTES)[AppRouteKey];

export function buildAssetRoute(assetId: string): string {
	return `${APP_ROUTES.assets}/${encodeURIComponent(assetId)}`;
}

export function buildOrderRoute(orderId: string): string {
	return `${APP_ROUTES.orders}/${encodeURIComponent(orderId)}`;
}

export function buildServiceCaseRoute(serviceCaseId: string): string {
	return `${APP_ROUTES.serviceCases}/${encodeURIComponent(serviceCaseId)}`;
}
