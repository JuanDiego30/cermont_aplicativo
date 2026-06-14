import type { ReminderRule } from "@cermont/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	userFind: vi.fn(),
	assetFind: vi.fn(),
	invoiceFind: vi.fn(),
	serviceCaseFind: vi.fn(),
	slaFind: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	User: { find: mocks.userFind },
	Invoice: { find: mocks.invoiceFind },
	ServiceCase: { find: mocks.serviceCaseFind },
}));

vi.mock("../../src/models/Asset", () => ({
	Asset: { find: mocks.assetFind },
}));

vi.mock("../../src/modules/sla/sla.model", () => ({
	SLATrackingModel: { find: mocks.slaFind },
}));

const { checkCertificationReminders } = await import(
	"../../src/services/reminder-checks/certification-reminder.check"
);
const { checkMaintenanceReminders } = await import(
	"../../src/services/reminder-checks/maintenance-reminder.check"
);
const { checkInvoiceReminders, checkPaymentOverdueReminders } = await import(
	"../../src/services/reminder-checks/invoice-reminder.check"
);
const { checkSlaReminders } = await import("../../src/services/reminder-checks/sla-reminder.check");
const { checkStaleCaseReminders } = await import(
	"../../src/services/reminder-checks/stale-case-reminder.check"
);

const NOW = new Date("2026-06-11T12:00:00.000Z");

function mockLeanQuery(findMock: ReturnType<typeof vi.fn>, value: object[]) {
	findMock.mockReturnValue({
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockResolvedValue(value),
		}),
	});
}

function buildRule(
	type: ReminderRule["type"],
	scheduleMode: ReminderRule["scheduleMode"],
	thresholds: number[],
): ReminderRule {
	return {
		type,
		enabled: true,
		scheduleMode,
		thresholds,
		channels: ["in_app"],
		recipientRoles: ["gerente"],
	};
}

describe("reminder checks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates certification expiry candidates at configured day thresholds", async () => {
		mockLeanQuery(mocks.userFind, [
			{
				_id: { toString: () => "user-1" },
				name: "Técnica Uno",
				certifications: [
					{
						name: "Trabajo seguro en alturas",
						expiresAt: "2026-06-18T12:00:00.000Z",
					},
				],
			},
		]);

		const result = await checkCertificationReminders(
			buildRule("certification_expiring", "days_before", [30, 15, 7, 1]),
			NOW,
		);

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: "certification_expiring",
			threshold: 7,
			templateName: "certification_expiring",
			relatedEntity: { entityType: "User", entityId: "user-1" },
		});
	});

	it("creates maintenance candidates for active assets", async () => {
		mockLeanQuery(mocks.assetFind, [
			{
				_id: { toString: () => "asset-1" },
				code: "ACT-01",
				name: "Taladro",
				nextMaintenanceAt: new Date("2026-06-14T12:00:00.000Z"),
			},
		]);

		const result = await checkMaintenanceReminders(
			buildRule("maintenance_due", "days_before", [7, 3, 1]),
			NOW,
		);

		expect(result[0]).toMatchObject({
			type: "maintenance_due",
			threshold: 3,
			templateName: "maintenance_due",
			variables: { assetName: "ACT-01 - Taladro" },
		});
	});

	it("creates invoice due candidates only for configured thresholds", async () => {
		mockLeanQuery(mocks.invoiceFind, [
			{
				_id: { toString: () => "invoice-1" },
				code: "FAC-01",
				invoiceNumber: "FE-100",
				totalAmount: 1_250_000,
				currency: "COP",
				dueDate: new Date("2026-06-12T12:00:00.000Z"),
			},
		]);

		const result = await checkInvoiceReminders(
			buildRule("invoice_due", "days_before", [7, 3, 1]),
			NOW,
		);

		expect(result[0]).toMatchObject({
			type: "invoice_due",
			threshold: 1,
			templateName: "invoice_due_reminder",
			variables: { invoiceNumber: "FE-100" },
		});
	});

	it("creates overdue payment candidates from open receivables", async () => {
		mockLeanQuery(mocks.invoiceFind, [
			{
				_id: { toString: () => "invoice-2" },
				code: "FAC-02",
				totalAmount: 800_000,
				currency: "COP",
				clientName: "Cliente Industrial",
				dueDate: new Date("2026-06-08T12:00:00.000Z"),
			},
		]);

		const result = await checkPaymentOverdueReminders(
			buildRule("payment_overdue", "days_after", [1, 3, 7]),
			NOW,
		);

		expect(result[0]).toMatchObject({
			type: "payment_overdue",
			threshold: 3,
			templateName: "payment_overdue",
			variables: { invoiceCode: "FAC-02", overdueDays: "3" },
		});
	});

	it("creates SLA warnings with the related service-case code", async () => {
		mockLeanQuery(mocks.slaFind, [
			{
				_id: { toString: () => "sla-1" },
				serviceCaseId: { toString: () => "case-1" },
				serviceType: "Mantenimiento CCTV",
				responseDeadline: new Date("2026-06-11T14:00:00.000Z"),
			},
		]);
		mockLeanQuery(mocks.serviceCaseFind, [
			{
				_id: { toString: () => "case-1" },
				code: "SC-2026-001",
			},
		]);

		const result = await checkSlaReminders(
			buildRule("sla_breach_warning", "hours_before", [2]),
			NOW,
		);

		expect(result[0]).toMatchObject({
			type: "sla_breach_warning",
			threshold: 2,
			templateName: "sla_breach_warning",
			variables: { caseCode: "SC-2026-001", remainingHours: "2" },
		});
	});

	it("creates stale-case alerts and excludes terminal stages in the query", async () => {
		mockLeanQuery(mocks.serviceCaseFind, [
			{
				_id: { toString: () => "case-2" },
				code: "SC-2026-002",
				currentStepCode: "step_05_planning",
				updatedAt: new Date("2026-05-28T12:00:00.000Z"),
			},
		]);

		const result = await checkStaleCaseReminders(
			buildRule("stale_case", "inactivity_days", [7, 14, 30]),
			NOW,
		);

		expect(mocks.serviceCaseFind).toHaveBeenCalledWith(
			expect.objectContaining({
				currentStage: { $nin: ["paid", "archived", "cancelled"] },
			}),
		);
		expect(result[0]).toMatchObject({
			type: "stale_case",
			threshold: 14,
			templateName: "stale_case_alert",
			variables: { caseCode: "SC-2026-002", daysInactive: "14" },
		});
	});
});
