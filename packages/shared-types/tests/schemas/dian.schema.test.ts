import { describe, expect, it } from "vitest";
import { DianConfigurationInputSchema, DianReportQuerySchema } from "../../src/schemas/dian.schema";

const validConfiguration = {
	testSetId: "test-set",
	softwareId: "software",
	softwarePin: "pin",
	technicalKey: "technical-key",
	resolutionNumber: "187640000001",
	resolutionDate: "2026-01-01T00:00:00.000Z",
	resolutionStartDate: "2026-01-01T00:00:00.000Z",
	resolutionEndDate: "2027-01-01T00:00:00.000Z",
	resolutionPrefix: "FV",
	resolutionFrom: 1,
	resolutionTo: 1000,
	environment: "test",
	isEnabled: true,
};

describe("DIAN schemas", () => {
	it("coerces valid configuration dates", () => {
		const result = DianConfigurationInputSchema.parse(validConfiguration);
		expect(result.resolutionDate).toBeInstanceOf(Date);
	});

	it("rejects an inverted authorized number range", () => {
		const result = DianConfigurationInputSchema.safeParse({
			...validConfiguration,
			resolutionFrom: 1001,
		});
		expect(result.success).toBe(false);
	});

	it("rejects an inverted report date range", () => {
		const result = DianReportQuerySchema.safeParse({
			from: "2026-06-12T00:00:00.000Z",
			to: "2026-06-11T00:00:00.000Z",
		});
		expect(result.success).toBe(false);
	});
});
