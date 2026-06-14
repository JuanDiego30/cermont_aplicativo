import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getConfig: vi.fn(),
	userFind: vi.fn(),
	createNotificationFromTemplate: vi.fn(),
	checkCertificationReminders: vi.fn(),
	checkMaintenanceReminders: vi.fn(),
	checkPaymentOverdueReminders: vi.fn(),
	checkSlaReminders: vi.fn(),
	checkInvoiceReminders: vi.fn(),
	checkStaleCaseReminders: vi.fn(),
}));

vi.mock("../../src/modules/system-config/system-config.service", () => ({
	SystemConfigService: { getConfig: mocks.getConfig },
}));

vi.mock("../../src/models", () => ({
	User: { find: mocks.userFind },
}));

vi.mock("../../src/modules/notifications/notification.service", () => ({
	createNotificationFromTemplate: mocks.createNotificationFromTemplate,
}));

vi.mock("../../src/services/reminder-checks/certification-reminder.check", () => ({
	checkCertificationReminders: mocks.checkCertificationReminders,
}));

vi.mock("../../src/services/reminder-checks/maintenance-reminder.check", () => ({
	checkMaintenanceReminders: mocks.checkMaintenanceReminders,
}));

vi.mock("../../src/services/reminder-checks/invoice-reminder.check", () => ({
	checkInvoiceReminders: mocks.checkInvoiceReminders,
	checkPaymentOverdueReminders: mocks.checkPaymentOverdueReminders,
}));

vi.mock("../../src/services/reminder-checks/sla-reminder.check", () => ({
	checkSlaReminders: mocks.checkSlaReminders,
}));

vi.mock("../../src/services/reminder-checks/stale-case-reminder.check", () => ({
	checkStaleCaseReminders: mocks.checkStaleCaseReminders,
}));

const { runReminderCycle } = await import("../../src/services/reminder-worker.service");

describe("reminder worker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("does not execute checks when the worker is disabled", async () => {
		mocks.getConfig.mockResolvedValue({
			reminderWorkerEnabled: false,
			reminderWorkerIntervalMinutes: 15,
			reminderRules: [],
		});

		const result = await runReminderCycle(new Date("2026-06-11T12:00:00.000Z"));

		expect(result).toEqual({
			status: "disabled",
			checkedRules: 0,
			candidates: 0,
			deliveries: 0,
			nextIntervalMinutes: 15,
		});
		expect(mocks.userFind).not.toHaveBeenCalled();
	});

	it("delivers candidates to configured roles and channels with a stable dedupe key", async () => {
		const rule = {
			type: "maintenance_due",
			enabled: true,
			scheduleMode: "days_before",
			thresholds: [7, 3, 1],
			channels: ["in_app", "email"],
			recipientRoles: ["gerente", "residente"],
		};
		mocks.getConfig.mockResolvedValue({
			reminderWorkerEnabled: true,
			reminderWorkerIntervalMinutes: 5,
			reminderRules: [rule],
		});
		mocks.checkMaintenanceReminders.mockResolvedValue([
			{
				type: "maintenance_due",
				threshold: 3,
				occurrenceKey: "asset-1:2026-06-14T12:00:00.000Z",
				templateName: "maintenance_due",
				variables: { assetName: "ACT-1 - Taladro", dueDate: "14/06/2026" },
				relatedEntity: { entityType: "Asset", entityId: "507f1f77bcf86cd799439011" },
			},
		]);
		mocks.userFind.mockReturnValue({
			select: vi.fn().mockReturnValue({
				lean: vi.fn().mockResolvedValue([
					{
						_id: { toString: () => "507f1f77bcf86cd799439012" },
						role: "gerente",
						email: "gerencia@cermont.test",
					},
				]),
			}),
		});

		const result = await runReminderCycle(new Date("2026-06-11T12:00:00.000Z"));

		expect(mocks.userFind).toHaveBeenCalledWith({
			isActive: true,
			role: { $in: rule.recipientRoles },
		});
		expect(mocks.createNotificationFromTemplate).toHaveBeenCalledWith(
			"maintenance_due",
			{ assetName: "ACT-1 - Taladro", dueDate: "14/06/2026" },
			"507f1f77bcf86cd799439012",
			"gerente",
			"gerencia@cermont.test",
			undefined,
			{ entityType: "Asset", entityId: "507f1f77bcf86cd799439011" },
			["in_app", "email"],
			"reminder:maintenance_due:asset-1:2026-06-14T12:00:00.000Z:3:507f1f77bcf86cd799439012",
		);
		expect(result).toEqual({
			status: "completed",
			checkedRules: 1,
			candidates: 1,
			deliveries: 1,
			nextIntervalMinutes: 5,
		});
	});
});
