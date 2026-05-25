import { describe, expect, it } from "vitest";
import costRoutes from "../../src/modules/cost/cost.routes";
import orderAdministrativeWorkflowRoutes from "../../src/modules/order/order-administrative-workflow.routes";
import serviceCaseRoutes from "../../src/modules/service-cases/service-case.routes";

type RouteLayer = {
	route?: {
		path: string;
		methods: Record<string, boolean>;
	};
};

function hasRoute(router: { stack?: RouteLayer[] }, method: string, path: string): boolean {
	return (router.stack ?? []).some(
		(layer) => layer.route?.path === path && layer.route.methods[method] === true,
	);
}

describe("plan endpoint aliases", () => {
	it("exposes the cockpit read-model alias expected by the 14-step plans", () => {
		expect(hasRoute(serviceCaseRoutes, "get", "/:id/cockpit")).toBe(true);
	});

	it("exposes the order advance-step alias expected by the 14-step plans", () => {
		expect(hasRoute(orderAdministrativeWorkflowRoutes, "post", "/:id/advance-step")).toBe(true);
	});

	it("exposes the cost dashboard endpoint expected by the functional refactor plan", () => {
		expect(hasRoute(costRoutes, "get", "/dashboard")).toBe(true);
	});
});
