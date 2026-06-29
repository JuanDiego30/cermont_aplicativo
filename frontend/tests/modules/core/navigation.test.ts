import { canAccessPath, INTERNAL_ROLES } from "@cermont/domain";
import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/lib/routes";
import { NAV_GROUPS } from "@/modules/core/navigation";

describe("Cermont sequential navigation", () => {
	it("groups primary routes by the 14-step operating flow", () => {
		expect(NAV_GROUPS.map((group) => group.label)).toEqual([
			NAV_GROUPS[0].label,
			NAV_GROUPS[1].label,
			NAV_GROUPS[2].label,
			NAV_GROUPS[3].label,
			NAV_GROUPS[4].label,
			NAV_GROUPS[5].label,
			NAV_GROUPS[6].label,
		]);

		expect(
			NAV_GROUPS.find((group) => group.label === "Principal")?.items.map((item) => item.to),
		).toEqual([APP_ROUTES.dashboard, APP_ROUTES.serviceCases]);
		expect(
			NAV_GROUPS.find((group) => group.label === "Comercial")?.items.map((item) => item.to),
		).toEqual([
			APP_ROUTES.customers,
			APP_ROUTES.workRequests,
			APP_ROUTES.siteVisits,
			APP_ROUTES.proposals,
			APP_ROUTES.purchaseOrders,
		]);
		expect(
			NAV_GROUPS.find((group) => group.label === "Operación de campo")?.items.map(
				(item) => item.to,
			),
		).toEqual([
			APP_ROUTES.orders,
			APP_ROUTES.planning,
			APP_ROUTES.execution,
			APP_ROUTES.evidences,
			APP_ROUTES.checklists,
			APP_ROUTES.dispatch,
			APP_ROUTES.maintenance,
			APP_ROUTES.sla,
		]);
	});

	it("exposes purchase orders as step 4 for internal roles", () => {
		expect(canAccessPath(APP_ROUTES.purchaseOrders, INTERNAL_ROLES[0])).toBe(true);
		expect(canAccessPath(APP_ROUTES.purchaseOrders, "cliente")).toBe(false);
	});

	it("exposes the audit viewer only in the administration group", () => {
		const administration = NAV_GROUPS.find((group) => group.label === "Administración");
		expect(administration?.items.map((item) => item.to)).toContain(APP_ROUTES.adminAudit);
		expect(canAccessPath(APP_ROUTES.adminAudit, "gerente")).toBe(true);
		expect(canAccessPath(APP_ROUTES.adminAudit, "tecnico")).toBe(false);
	});
});
