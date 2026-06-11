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
	HardHat,
	LayoutDashboard,
	ListChecks,
	Package,
	Receipt,
	TrendingUp,
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
				to: APP_ROUTES.assets,
				label: "Activos",
				icon: Building2,
			},
			{
				to: APP_ROUTES.maintenance,
				label: "Mantenimiento",
				icon: Wrench,
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
		],
	},
] satisfies NavigationGroup[];

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
