import { describe, expect, it } from "vitest";
import {
	ReminderRuleSchema,
	UpdateSystemSettingsSchema,
} from "../../src/schemas/system-config.schema";

describe("system configuration schemas", () => {
	it("accepts a configurable reminder rule", () => {
		const result = ReminderRuleSchema.parse({
			type: "invoice_due",
			enabled: true,
			scheduleMode: "days_before",
			thresholds: [7, 3, 1],
			channels: ["in_app", "email"],
			recipientRoles: ["gerente", "auxiliar_contable"],
		});
		expect(result.thresholds).toEqual([7, 3, 1]);
	});

	it("rejects duplicate reminder thresholds", () => {
		const result = ReminderRuleSchema.safeParse({
			type: "invoice_due",
			enabled: true,
			scheduleMode: "days_before",
			thresholds: [7, 7],
			channels: ["in_app"],
			recipientRoles: ["gerente"],
		});
		expect(result.success).toBe(false);
	});

	it("rejects a schedule mode that does not match the reminder type", () => {
		const result = ReminderRuleSchema.safeParse({
			type: "stale_case",
			enabled: true,
			scheduleMode: "days_before",
			thresholds: [7],
			channels: ["in_app"],
			recipientRoles: ["gerente"],
		});
		expect(result.success).toBe(false);
	});

	it("requires at least one setting to update", () => {
		const result = UpdateSystemSettingsSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
