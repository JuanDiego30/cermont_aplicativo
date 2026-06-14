import { describe, expect, it } from "vitest";
import {
	compileNotificationTemplate,
	hasTemplate,
} from "../../src/services/messaging/notification-templates";

const REMINDER_TEMPLATES = [
	"certification_expiring",
	"maintenance_due",
	"payment_overdue",
	"sla_breach_warning",
	"invoice_due_reminder",
	"stale_case_alert",
] as const;

describe("reminder notification templates", () => {
	it.each(REMINDER_TEMPLATES)("compiles %s with a title and body", (templateName) => {
		const compiled = compileNotificationTemplate(templateName, {
			amount: "COP 1.000.000",
			caseCode: "SC-2026-001",
			certificationName: "Alturas",
			currentStep: "Planeación",
			daysInactive: "7",
			dueDate: "18/06/2026",
			expiryDate: "18/06/2026",
			invoiceCode: "FAC-01",
			invoiceNumber: "FE-100",
			remainingHours: "2",
			serviceType: "Mantenimiento",
			assetName: "ACT-01",
		});

		expect(hasTemplate(templateName)).toBe(true);
		expect(compiled?.title.length).toBeGreaterThan(0);
		expect(compiled?.body.length).toBeGreaterThan(0);
	});
});
