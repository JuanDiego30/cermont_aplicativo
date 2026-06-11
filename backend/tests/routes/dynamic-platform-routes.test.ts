import { readFileSync } from "node:fs";
import evidenceCollectionRoutes from "../../src/modules/evidence/evidence-collection.routes";
import kitRoutes from "../../src/modules/kit/kit.routes";
import toolRoutes from "../../src/modules/tool/tool.routes";

type RouteLayer = {
	route?: {
		path: string;
		methods: Record<string, boolean>;
	};
};

function routeIndex(router: { stack?: RouteLayer[] }, method: string, path: string): number {
	return (router.stack ?? []).findIndex(
		(layer) => layer.route?.path === path && layer.route.methods[method] === true,
	);
}

function expectRoute(router: { stack?: RouteLayer[] }, method: string, path: string): void {
	expect(routeIndex(router, method, path)).toBeGreaterThanOrEqual(0);
}

describe("dynamic platform routes", () => {
	it("exposes the planned kit endpoints", () => {
		expectRoute(kitRoutes, "get", "/");
		expectRoute(kitRoutes, "post", "/");
		expectRoute(kitRoutes, "get", "/catalog/options");
		expectRoute(kitRoutes, "get", "/:id");
		expectRoute(kitRoutes, "patch", "/:id");
		expectRoute(kitRoutes, "post", "/:id/activate");
		expectRoute(kitRoutes, "post", "/:id/archive");
		expectRoute(kitRoutes, "post", "/:id/restore");
		expectRoute(kitRoutes, "post", "/:id/duplicate");
		expectRoute(kitRoutes, "delete", "/:id");
	});

	it("exposes the planned tool endpoints", () => {
		expectRoute(toolRoutes, "get", "/");
		expectRoute(toolRoutes, "post", "/");
		expectRoute(toolRoutes, "get", "/expired-certifications");
		expectRoute(toolRoutes, "get", "/:id");
		expectRoute(toolRoutes, "put", "/:id");
		expectRoute(toolRoutes, "post", "/:id/certifications");
		expectRoute(toolRoutes, "delete", "/:id/certifications/:certId");
		expectRoute(toolRoutes, "post", "/:id/documents");
		expectRoute(toolRoutes, "delete", "/:id/documents/:docId");
	});

	it("exposes the planned evidence collection endpoints", () => {
		expectRoute(evidenceCollectionRoutes, "get", "/");
		expectRoute(evidenceCollectionRoutes, "post", "/");
		expectRoute(evidenceCollectionRoutes, "get", "/by-entity/:entityType/:entityId");
		expectRoute(evidenceCollectionRoutes, "get", "/:id");
		expectRoute(evidenceCollectionRoutes, "post", "/:id/items");
		expectRoute(evidenceCollectionRoutes, "delete", "/:id/items/:itemId");
	});

	it("keeps specific routes ahead of param routes to avoid shadowing", () => {
		expect(routeIndex(kitRoutes, "get", "/catalog/options")).toBeLessThan(
			routeIndex(kitRoutes, "get", "/:id"),
		);
		expect(routeIndex(toolRoutes, "get", "/expired-certifications")).toBeLessThan(
			routeIndex(toolRoutes, "get", "/:id"),
		);
		expect(
			routeIndex(evidenceCollectionRoutes, "get", "/by-entity/:entityType/:entityId"),
		).toBeLessThan(routeIndex(evidenceCollectionRoutes, "get", "/:id"));
	});

	it("mounts kit, tool, and evidence collection routes in the backend app", () => {
		const source = readFileSync(new URL("../../src/index.ts", import.meta.url), "utf8");
		expect(source).toContain('app.use("/api/kits", kitRoutes);');
		expect(source).toContain('app.use("/api/tools", toolRoutes);');
		expect(source).toContain('app.use("/api/evidence-collections", evidenceCollectionRoutes);');
	});
});
