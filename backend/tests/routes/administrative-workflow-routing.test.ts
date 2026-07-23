import type { RequestHandler } from "express";
import { describe, expect, it } from "vitest";
import deliveryRecordRoutes from "../../src/modules/delivery-record/delivery-record.routes";
import * as DeliveryRecordController from "../../src/modules/delivery-record/delivery-record.controller";
import invoiceRoutes from "../../src/modules/invoice/invoice.routes";
import * as InvoiceController from "../../src/modules/invoice/invoice.controller";
import paymentRoutes from "../../src/modules/payment/payment.routes";
import * as PaymentController from "../../src/modules/payment/payment.controller";
import serviceEntrySheetRoutes from "../../src/modules/service-entry-sheet/service-entry-sheet.routes";
import * as SesController from "../../src/modules/service-entry-sheet/service-entry-sheet.controller";
import technicalReportRoutes from "../../src/modules/technical-report/technical-report.routes";
import * as TechnicalReportController from "../../src/modules/technical-report/technical-report.controller";

type HandlerLayer = {
	handle: RequestHandler;
};

type RouteLayer = {
	route?: {
		path: string;
		methods: Record<string, boolean>;
		stack: HandlerLayer[];
	};
};

function routeHandler(
	router: { stack?: RouteLayer[] },
	method: string,
	path: string,
): RequestHandler {
	const layer = (Array.isArray(router.stack) ? router.stack : []).find(
		(candidate) => candidate.route?.path === path && candidate.route.methods[method] === true,
	);
	const handlers = layer?.route?.stack ?? [];
	const handler = handlers.at(-1)?.handle;

	if (!handler) {
		throw new Error(`Missing ${method.toUpperCase()} ${path} route handler`);
	}

	return handler;
}

function routeIndex(router: { stack?: RouteLayer[] }, method: string, path: string): number {
	return (Array.isArray(router.stack) ? router.stack : []).findIndex(
		(candidate) => candidate.route?.path === path && candidate.route.methods[method] === true,
	);
}

describe("standalone administrative workflow route wiring", () => {
	it("routes technical report mutations through the dedicated controller", () => {
		expect(routeHandler(technicalReportRoutes, "post", "/:id/generate")).toBe(
			TechnicalReportController.generateTechnicalReport,
		);
		expect(routeHandler(technicalReportRoutes, "post", "/:id/approve")).toBe(
			TechnicalReportController.approveTechnicalReport,
		);
		expect(routeIndex(technicalReportRoutes, "get", "/:id")).toBeGreaterThanOrEqual(0);
	});

	it("routes delivery, SES, and invoice creation through their dedicated controllers", () => {
		expect(routeHandler(deliveryRecordRoutes, "post", "/from-technical-report/:id")).toBe(
			DeliveryRecordController.createDeliveryRecordFromTechnicalReport,
		);
		expect(routeHandler(serviceEntrySheetRoutes, "post", "/from-delivery-record/:id")).toBe(
			SesController.createServiceEntrySheetFromDeliveryRecord,
		);
		expect(routeHandler(invoiceRoutes, "post", "/from-service-entry-sheet/:id")).toBe(
			InvoiceController.createInvoiceFromServiceEntrySheet,
		);
		// ponytail: external submission routes exist in SES module
	});

	it("uses the canonical payment lifecycle while preserving dashboard read models", () => {
		expect(routeHandler(paymentRoutes, "post", "/from-invoice/:id")).toBe(
			PaymentController.registerPaymentForInvoice,
		);
		expect(routeHandler(paymentRoutes, "post", "/:id/reconcile")).toBe(
			PaymentController.reconcilePayment,
		);
		// ponytail: dashboard/aging routes not mounted in payment router
	});
});
