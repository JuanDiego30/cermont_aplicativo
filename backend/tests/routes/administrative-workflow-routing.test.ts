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

describe("standalone administrative workflow route wiring", () => {
	it("routes technical report mutations through the workflow controller", () => {
		expect(routeHandler(technicalReportRoutes, "post", "/:id/generate")).toBe(
			TechnicalReportController.generateTechnicalReport,
		);
		expect(routeHandler(technicalReportRoutes, "post", "/:id/approve")).toBe(
			TechnicalReportController.approveTechnicalReport,
		);
		expect(routeHandler(technicalReportRoutes, "get", "/auto-draft/:serviceCaseId")).toBe(
			TechnicalReportController.generateAutoDraftReport,
		);
	});

	it("routes delivery, SES, and invoice creation through the workflow controller", () => {
		expect(routeHandler(deliveryRecordRoutes, "post", "/from-technical-report/:id")).toBe(
			DeliveryRecordController.createDeliveryRecordFromTechnicalReport,
		);
		expect(routeHandler(serviceEntrySheetRoutes, "post", "/from-delivery-record/:id")).toBe(
			SesController.createServiceEntrySheetFromDeliveryRecord,
		);
		expect(routeHandler(invoiceRoutes, "post", "/from-service-entry-sheet/:id")).toBe(
			InvoiceController.createInvoiceFromServiceEntrySheet,
		);
	});

	it("routes payment lifecycle through the workflow controller", () => {
		expect(routeHandler(paymentRoutes, "post", "/from-invoice/:id")).toBe(
			PaymentController.registerPaymentForInvoice,
		);
		expect(routeHandler(paymentRoutes, "post", "/:id/reconcile")).toBe(
			PaymentController.reconcilePayment,
		);
	});
});
