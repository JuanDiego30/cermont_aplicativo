import { describe, expect, it } from "vitest";
import {
	mapSlaRiskRows,
	type SlaRiskSourceRow,
} from "../../src/modules/dashboard/dashboard-sla.service";

const NOW = new Date("2026-07-04T12:00:00.000Z");

function row(overrides: Partial<SlaRiskSourceRow>): SlaRiskSourceRow {
	return {
		serviceCaseId: "665f1f77bcf86cd799439011",
		code: "SC-2026-0001",
		clientName: "Sierracol Energy",
		currentStepCode: "step_06_execution",
		deadline: new Date("2026-07-05T12:00:00.000Z"),
		...overrides,
	};
}

describe("mapSlaRiskRows", () => {
	it("classifies an overdue deadline as critical with negative hours", () => {
		const [result] = mapSlaRiskRows([row({ deadline: new Date("2026-07-03T12:00:00.000Z") })], NOW);

		expect(result?.riskLevel).toBe("critical");
		expect(result?.hoursRemaining).toBe(-24);
	});

	it("classifies under 24h remaining as critical and under 72h as warning", () => {
		const results = mapSlaRiskRows(
			[
				row({ code: "SC-CRIT", deadline: new Date("2026-07-04T20:00:00.000Z") }),
				row({ code: "SC-WARN", deadline: new Date("2026-07-06T12:00:00.000Z") }),
			],
			NOW,
		);

		const critical = results.find((item) => item.code === "SC-CRIT");
		const warning = results.find((item) => item.code === "SC-WARN");
		expect(critical?.riskLevel).toBe("critical");
		expect(warning?.riskLevel).toBe("warning");
	});

	it("sorts by remaining time ascending so the most urgent case is first", () => {
		const results = mapSlaRiskRows(
			[
				row({ code: "SC-LATER", deadline: new Date("2026-07-06T12:00:00.000Z") }),
				row({ code: "SC-SOONER", deadline: new Date("2026-07-04T18:00:00.000Z") }),
			],
			NOW,
		);

		expect(results.map((item) => item.code)).toEqual(["SC-SOONER", "SC-LATER"]);
	});

	it("resolves the 14-step number from the canonical step code", () => {
		const [result] = mapSlaRiskRows([row({ currentStepCode: "step_06_execution" })], NOW);

		expect(result?.currentStep).toBe(6);
	});

	it("omits clientName when the source row has no client", () => {
		const [result] = mapSlaRiskRows([row({ clientName: void 0 })], NOW);

		expect(result && "clientName" in result).toBe(false);
	});
});
