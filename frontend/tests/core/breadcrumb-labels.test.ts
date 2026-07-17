/**
 * Breadcrumb label mapping tests.
 * Validates that URL path segments map to human-readable Spanish labels
 * and that the formatBreadcrumbSegment function handles slugs correctly.
 */

import { describe, expect, it } from "vitest";

/**
 * Simulates the breadcrumb mapping logic from Header.tsx.
 * This tests the business logic of segment → label conversion.
 */

const BREADCRUMB_MAP: Record<string, string> = {
	dashboard: "Dashboard",
	"work-requests": "Solicitudes",
	"site-visits": "Visitas técnicas",
	"service-cases": "Casos de servicio",
	customers: "Clientes",
	proposals: "Propuestas",
	"purchase-orders": "Órdenes de compra",
	orders: "Órdenes",
	planning: "Planeación",
	execution: "Ejecución",
	evidences: "Evidencias",
	reports: "Informes",
	"delivery-records": "Actas de entrega",
	billing: "Facturación",
	ses: "SES / Ariba",
	invoices: "Facturas",
	payments: "Pagos",
	fleet: "Flota",
	resources: "Recursos",
	admin: "Administración",
	"new": "Nuevo",
};

function formatBreadcrumbSegment(segment: string, parentSegment?: string): string {
	if (!segment) {
		return "";
	}
	if (/^[0-9a-fA-F]{24}$/.test(segment)) {
		return "Detalle";
	}

	if (segment.toLowerCase() === "new" && parentSegment) {
		switch (parentSegment.toLowerCase()) {
			case "work-requests":
				return "Nueva solicitud";
			case "site-visits":
				return "Nueva visita";
			case "proposals":
				return "Nueva propuesta";
			case "purchase-orders":
				return "Nueva orden de compra";
			case "orders":
				return "Nueva orden";
			case "reports":
				return "Nuevo informe";
			case "delivery-records":
				return "Nueva acta";
			case "invoices":
				return "Nueva factura";
			case "payments":
				return "Nuevo pago";
			case "users":
				return "Nuevo usuario";
			default:
				return "Nuevo";
		}
	}

	const mapped = BREADCRUMB_MAP[segment.toLowerCase()];
	if (mapped) {
		return mapped;
	}

	return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildBreadcrumbTrail(pathname: string): string[] {
	const segments = pathname.split("/").filter(Boolean);
	return segments.map((segment, index) => {
		const parent = index > 0 ? segments[index - 1] : void 0;
		return formatBreadcrumbSegment(segment, parent);
	});
}

describe("Breadcrumb labels", () => {
	it("maps dashboard to Dashboard", () => {
		const trail = buildBreadcrumbTrail("/dashboard");
		expect(trail).toEqual(["Dashboard"]);
	});

	it("maps /work-requests to Solicitudes", () => {
		const trail = buildBreadcrumbTrail("/work-requests");
		expect(trail).toEqual(["Solicitudes"]);
	});

	it("maps /site-visits to Visitas técnicas", () => {
		const trail = buildBreadcrumbTrail("/site-visits");
		expect(trail).toEqual(["Visitas técnicas"]);
	});

	it("maps /work-requests/new to Solicitudes / Nueva solicitud", () => {
		const trail = buildBreadcrumbTrail("/work-requests/new");
		expect(trail).toEqual(["Solicitudes", "Nueva solicitud"]);
	});

	it("maps /service-cases to Casos de servicio", () => {
		const trail = buildBreadcrumbTrail("/service-cases");
		expect(trail).toEqual(["Casos de servicio"]);
	});

	it("maps /customers to Clientes", () => {
		const trail = buildBreadcrumbTrail("/customers");
		expect(trail).toEqual(["Clientes"]);
	});

	it("maps /proposals to Propuestas", () => {
		const trail = buildBreadcrumbTrail("/proposals");
		expect(trail).toEqual(["Propuestas"]);
	});

	it("maps /purchase-orders to Órdenes de compra", () => {
		const trail = buildBreadcrumbTrail("/purchase-orders");
		expect(trail).toEqual(["Órdenes de compra"]);
	});

	it("maps /orders to Órdenes", () => {
		const trail = buildBreadcrumbTrail("/orders");
		expect(trail).toEqual(["Órdenes"]);
	});

	it("maps /planning to Planeación", () => {
		const trail = buildBreadcrumbTrail("/planning");
		expect(trail).toEqual(["Planeación"]);
	});

	it("maps /execution to Ejecución", () => {
		const trail = buildBreadcrumbTrail("/execution");
		expect(trail).toEqual(["Ejecución"]);
	});

	it("maps /evidences to Evidencias", () => {
		const trail = buildBreadcrumbTrail("/evidences");
		expect(trail).toEqual(["Evidencias"]);
	});

	it("maps /reports to Informes", () => {
		const trail = buildBreadcrumbTrail("/reports");
		expect(trail).toEqual(["Informes"]);
	});

	it("maps /delivery-records to Actas de entrega", () => {
		const trail = buildBreadcrumbTrail("/delivery-records");
		expect(trail).toEqual(["Actas de entrega"]);
	});

	it("maps /billing to Facturación", () => {
		const trail = buildBreadcrumbTrail("/billing");
		expect(trail).toEqual(["Facturación"]);
	});

	it("maps /billing/ses to Facturación / SES / Ariba", () => {
		const trail = buildBreadcrumbTrail("/billing/ses");
		expect(trail).toEqual(["Facturación", "SES / Ariba"]);
	});

	it("maps /billing/invoices to Facturación / Facturas", () => {
		const trail = buildBreadcrumbTrail("/billing/invoices");
		expect(trail).toEqual(["Facturación", "Facturas"]);
	});

	it("maps /payments to Pagos", () => {
		const trail = buildBreadcrumbTrail("/payments");
		expect(trail).toEqual(["Pagos"]);
	});

	it("maps /fleet to Flota", () => {
		const trail = buildBreadcrumbTrail("/fleet");
		expect(trail).toEqual(["Flota"]);
	});

	it("maps /resources to Recursos", () => {
		const trail = buildBreadcrumbTrail("/resources");
		expect(trail).toEqual(["Recursos"]);
	});

	it("maps /admin to Administración", () => {
		const trail = buildBreadcrumbTrail("/admin");
		expect(trail).toEqual(["Administración"]);
	});

	it("handles deep paths with ObjectId as Detalle", () => {
		const trail = buildBreadcrumbTrail("/orders/507f1f77bcf86cd799439011/planning");
		expect(trail).toEqual(["Órdenes", "Detalle", "Planeación"]);
	});

	it("renders unknown slug as title case", () => {
		const trail = buildBreadcrumbTrail("/some-unknown-path");
		expect(trail).toEqual(["Some Unknown Path"]);
	});
});
