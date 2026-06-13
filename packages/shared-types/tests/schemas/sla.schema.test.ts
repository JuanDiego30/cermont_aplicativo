import { describe, expect, it } from "vitest";
import {
	SlaConfigSchema,
	SlaTrackingQuerySchema,
	UpdateSlaConfigsSchema,
} from "../../src/schemas/sla.schema";

const validConfig = {
	serviceType: "correctivo",
	priority: "high",
	responseHours: 4,
	resolutionHours: 24,
	escalationHours: 8,
	isActive: true,
};

describe("SLA schemas", () => {
	it("accepts canonical work-request priorities", () => {
		const result = SlaConfigSchema.parse(validConfig);
		expect(result.priority).toBe("high");
	});

	it("rejects escalation after resolution", () => {
		const result = SlaConfigSchema.safeParse({
			...validConfig,
			escalationHours: 30,
		});
		expect(result.success).toBe(false);
	});

	it("requires at least one configuration on update", () => {
		const result = UpdateSlaConfigsSchema.safeParse({ configs: [] });
		expect(result.success).toBe(false);
	});

	it("accepts a supported tracking status filter", () => {
		const result = SlaTrackingQuerySchema.parse({ status: "at_risk" });
		expect(result.status).toBe("at_risk");
	});
});
