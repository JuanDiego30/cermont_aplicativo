import type { DriveStep } from "driver.js";

export interface CermontTour {
	id: string;
	route: string;
	steps: DriveStep[];
}

const pageIntro: Record<string, string> = {
	"/dashboard":
		"This dashboard summarizes operations. Review alerts, critical work orders, and metrics before opening a module.",
	"/orders":
		"Work Orders keeps the workflow together: filter, review priority, and open each order to plan, execute, or close it.",
	"/reports":
		"Reports helps you approve field reports, review closure times, and prepare billing without changing modules.",
	"/admin/users":
		"Users controls access and roles. Review status, role, and details before creating or updating accounts.",
	"/profile":
		"Profile brings together your account data, password, and biometric sign-in. Enable passkeys only on trusted devices.",
};

function fallbackStep(route: string): DriveStep {
	return {
		element: "main",
		popover: {
			title: "Cermont AI",
			description:
				pageIntro[route] ??
				"This module groups Cermont operational actions. Start with filters, review statuses, and use the primary actions carefully.",
			side: "bottom",
			align: "start",
		},
	};
}

export const CERMONT_TOURS: CermontTour[] = [
	{
		id: "dashboard-overview",
		route: "/dashboard",
		steps: [
			fallbackStep("/dashboard"),
			{
				element: "header",
				popover: {
					title: "Module location",
					description:
						"The top bar shows the active module, notifications, and theme controls. Use it to orient yourself before making decisions.",
				},
			},
		],
	},
	{
		id: "orders-overview",
		route: "/orders",
		steps: [
			fallbackStep("/orders"),
			{
				element: "[aria-label='Order controls']",
				popover: {
					title: "Filter before acting",
					description:
						"Search by code, status, priority, technician, or date. This helps you avoid changing work orders outside your shift.",
				},
			},
			{
				element: "[aria-label='Work order list']",
				popover: {
					title: "Operational list",
					description:
						"Mobile uses cards; desktop uses a table. Open a work order to review evidence, costs, documents, and closure.",
				},
			},
		],
	},
	{
		id: "reports-overview",
		route: "/reports",
		steps: [
			fallbackStep("/reports"),
			{
				element: "[aria-label='Report views']",
				popover: {
					title: "Three working views",
					description:
						"Approval supports decisions, Analytics highlights bottlenecks, and Table supports export or audit work.",
				},
			},
			{
				element: "[aria-label='Report indicators']",
				popover: {
					title: "Closure indicators",
					description:
						"Prioritize pending items and high cycle times. Colors adapt to light and dark themes for quick scanning.",
				},
			},
		],
	},
	{
		id: "users-overview",
		route: "/admin/users",
		steps: [
			fallbackStep("/admin/users"),
			{
				element: "[aria-label='Mobile user list'], #users-table-title",
				popover: {
					title: "Account management",
					description:
						"Confirm role and status before editing. Mobile uses cards; desktop uses a table for quick comparison.",
				},
			},
		],
	},
	{
		id: "profile-security",
		route: "/profile",
		steps: [
			fallbackStep("/profile"),
			{
				element: "#passkey-settings-title",
				popover: {
					title: "Biometric sign-in",
					description:
						"Enable a passkey on this device to sign in with fingerprint, PIN, or Face ID. You can remove it when you change devices.",
				},
			},
		],
	},
];

export function getTourForPath(pathname: string): CermontTour | false {
	const exact = CERMONT_TOURS.find((tour) => tour.route === pathname);
	if (exact) {
		return exact;
	}
	return CERMONT_TOURS.find((tour) => pathname.startsWith(`${tour.route}/`)) ?? false;
}
