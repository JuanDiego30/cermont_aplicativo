import { afterEach, describe, expect, it, vi } from "vitest";
import { AutomationExecution } from "../../src/models/AutomationExecution";
import { AutomationOperationalAction } from "../../src/models/AutomationOperationalAction";
import { AutomationRule } from "../../src/models/AutomationRule";
import { ensureAutomationIndexes } from "../../src/models/automation-indexes";

describe("automation indexes", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("defines the unique indexes required for event and action deduplication", () => {
		expect(AutomationExecution.schema.indexes()).toContainEqual([
			{ ruleId: 1, eventId: 1 },
			expect.objectContaining({ unique: true }),
		]);
		expect(AutomationOperationalAction.schema.indexes()).toContainEqual([
			{ dedupeKey: 1 },
			expect.objectContaining({ unique: true }),
		]);
	});

	it("creates collections before reconciling indexes", async () => {
		const calls: string[] = [];
		const models = [AutomationRule, AutomationExecution, AutomationOperationalAction] as const;

		for (const model of models) {
			vi.spyOn(model, "createCollection").mockImplementation(async () => {
				calls.push(`collection:${model.modelName}`);
				return model.collection;
			});
			vi.spyOn(model, "createIndexes").mockImplementation(async () => {
				calls.push(`indexes:${model.modelName}`);
				return [];
			});
		}

		await expect(ensureAutomationIndexes()).resolves.toBeUndefined();
		expect(calls.slice(0, 3).every((call) => call.startsWith("collection:"))).toBe(true);
		expect(calls.slice(3).every((call) => call.startsWith("indexes:"))).toBe(true);
	});
});
