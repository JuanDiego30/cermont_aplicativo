import { canAccessPath, type UserRole } from "@cermont/domain";
import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	Bot,
	Building2,
	Camera,
	ClipboardList,
	CreditCard,
	FileBadge,
	FileSpreadsheet,
	FileText,
	Gauge,
	HardHat,
	LayoutDashboard,
	ListChecks,
	MapPinned,
	Package,
	Plug,
	Receipt,
	ScanLine,
	ScrollText,
	Settings2,
	TrendingUp,
	Truck,
	Users,
	Wallet,
	Wrench,
} from "lucide-react";
import { APP_ROUTES, type AppRoute } from "@/lib/routes";

export type NavigationItem = {
	to: AppRoute;
	label: string;
	icon: LucideIcon;
	badge?: number;
	iconColor?: string;
};

export type NavigationGroup = {
	label: string;
	items: NavigationItem[];
};

export const NAV_GROUPS = [
	{
		label: "Principal",
		items: [
			{
				to: APP_ROUTES.dashboard,
				label: "Dashboard",
				icon: LayoutDashboard,
			},
			{
				to: APP_ROUTES.serviceCases,
				label: "Casos de Servicio",
				icon: LayoutDashboard,
			},
		],
	},
	{
		label: "Comercial",
		items: [
			{
				to: APP_ROUTES.customers,
				label: "Clientes",
				icon: Building2,
			},
			{
				to: APP_ROUTES.workRequests,
				label: "Solicitudes",
				icon: FileText,
			},
			{
				to: APP_ROUTES.siteVisits,
				label: "Visitas",
				icon: ClipboardList,
			},
			{
				to: APP_ROUTES.proposals,
				label: "Propuestas",
				icon: FileBadge,
			},
			{
				to: APP_ROUTES.purchaseOrders,
				label: "PO aprobada",
				icon: Receipt,
			},
		],
	},
	{
		label: "Operación de campo",
		items: [
			{
				to: APP_ROUTES.orders,
				label: "Órdenes",
				icon: ClipboardList,
			},
			{
				to: APP_ROUTES.planning,
				label: "Planeación",
				icon: ListChecks,
			},
			{
				to: APP_ROUTES.execution,
				label: "Ejecución",
				icon: HardHat,
			},
			{
				to: APP_ROUTES.evidences,
				label: "Evidencias",
				icon: Camera,
			},
			{
				to: APP_ROUTES.checklists,
				label: "Checklists",
				icon: ListChecks,
			},
			{
				to: APP_ROUTES.dispatch,
				label: "Despacho",
				icon: MapPinned,
			},
			{
				to: APP_ROUTES.maintenance,
				label: "Mantenimiento",
				icon: Wrench,
			},
			{
				to: APP_ROUTES.sla,
				label: "SLA",
				icon: Gauge,
			},
		],
	},
	{
		label: "Cierre técnico",
		items: [
			{
				to: APP_ROUTES.reports,
				label: "Informes",
				icon: BarChart3,
			},
			{
				to: APP_ROUTES.reportsAnalytics,
				label: "Analitica",
				icon: TrendingUp,
			},
			{
				to: APP_ROUTES.deliveryRecords,
				label: "Actas",
				icon: FileSpreadsheet,
			},
		],
	},
	{
		label: "Cierre administrativo",
		items: [
			{
				to: APP_ROUTES.billing,
				label: "Cierre",
				icon: FileSpreadsheet,
			},
			{
				to: APP_ROUTES.billingSes,
				label: "SES / Ariba",
				icon: Receipt,
			},
			{
				to: APP_ROUTES.billingInvoices,
				label: "Facturas",
				icon: CreditCard,
			},
			{
				to: APP_ROUTES.payments,
				label: "Pagos",
				icon: Wallet,
			},
			{
				to: APP_ROUTES.costs,
				label: "Costos",
				icon: TrendingUp,
			},
		],
	},
	{
		label: "Transversales",
		items: [
			{
				to: APP_ROUTES.documents,
				label: "Documentos",
				icon: FileText,
			},
			{
				to: APP_ROUTES.templates,
				label: "Formularios",
				icon: FileBadge,
			},
			{
				to: APP_ROUTES.resources,
				label: "Recursos & Kits",
				icon: Package,
			},
			{
				to: APP_ROUTES.inventory,
				label: "Inventario",
				icon: Package,
			},
			{
				to: APP_ROUTES.inventoryScan,
				label: "Escanear activos",
				icon: ScanLine,
			},
			{
				to: APP_ROUTES.fleet,
				label: "Vehículos",
				icon: Truck,
			},
			{
				to: APP_ROUTES.assets,
				label: "Activos",
				icon: Building2,
			},
			{
				to: APP_ROUTES.businessDocuments,
				label: "Documentos de negocio",
				icon: FileText,
			},
		],
	},
	{
		label: "Administración",
		items: [
			{
				to: APP_ROUTES.adminUsers,
				label: "Usuarios",
				icon: Users,
			},
			{
				to: APP_ROUTES.adminCustomFields,
				label: "Campos personalizados",
				icon: ListChecks,
			},
			{
				to: APP_ROUTES.adminPersonnel,
				label: "Personal y certificaciones",
				icon: HardHat,
			},
			{
				to: APP_ROUTES.adminBackups,
				label: "Respaldos",
				icon: FileSpreadsheet,
			},
			{
				to: APP_ROUTES.adminAudit,
				label: "Auditoría",
				icon: ScrollText,
			},
			{
				to: APP_ROUTES.adminSettings,
				label: "Configuracion",
				icon: Settings2,
			},
			{
				to: APP_ROUTES.erpConnectors,
				label: "Conectores ERP",
				icon: Plug,
			},
		],
	},
] satisfies NavigationGroup[];

export const SIDEBAR_ICON_COLORS: Record<string, string> = {
	"PRINCIPAL": "text-brand-blue",
	"COMERCIAL": "text-brand-blue-light",
	"OPERACIÓN DE CAMPO": "text-brand-annotate",
	"CIERRE TÉCNICO": "text-brand-warn",
	"CIERRE ADMINISTRATIVO": "text-emerald-400",
	"TRANSVERSALES": "text-slate-400",
	"ADMINISTRACIÓN": "text-brand-blue-deep",
};

export const AI_ASSISTANT_ICON = Bot;

export function getVisibleNavigationGroups(userRole: UserRole | string) {
	const visibleGroups: NavigationGroup[] = [];

	for (const group of NAV_GROUPS) {
		const items = group.items.filter((item) => canAccessPath(item.to, userRole));
		if (items.length > 0) {
			visibleGroups.push({ ...group, items });
		}
	}

	return visibleGroups;
}
