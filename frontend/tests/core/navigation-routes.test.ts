/**
 * Navigation routes test — validates sidebar points to correct paths.
 */

import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/lib/routes";
import { NAV_GROUPS } from "@/modules/core/navigation";

describe("Sidebar navigation routes", () => {
	it("Visitas menu item points to /site-visits (not /visits)", () => {
		const comercial = NAV_GROUPS.find((g) => g.label === "Comercial");
		expect(comercial).toBeDefined();
		const visitas = comercial?.items.find((item) => item.label === "Visitas");
		expect(visitas).toBeDefined();
		expect(visitas?.to).toBe("/site-visits");
	});

	it("all navigation routes use APP_ROUTES constants", () => {
		for (const group of NAV_GROUPS) {
			for (const item of group.items) {
				expect(item.to).toBeDefined();
				expect(typeof item.to).toBe("string");
				expect(item.to.startsWith("/")).toBe(true);
			}
		}
	});

	it("Planeación menu item points to /planning", () => {
		const operacion = NAV_GROUPS.find((g) => g.label === "Operación de campo");
		expect(operacion).toBeDefined();
		const planning = operacion?.items.find((item) => item.label === "Planeación");
		expect(planning).toBeDefined();
		expect(planning?.to).toBe(APP_ROUTES.planning);
	});
});
