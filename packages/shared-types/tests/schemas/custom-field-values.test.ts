import { describe, expect, it } from "vitest";

import {
	CreateOrderSchema,
	CreateWorkRequestSchema,
	CustomFieldValuesSchema,
} from "../../src/schemas";

describe("custom field values", () => {
	it("accepts primitive values for dynamic fields", () => {
		const values = {
			siteCode: "CL-17",
			estimatedHours: 4,
			requiresEscort: true,
		};

		expect(CustomFieldValuesSchema.parse(values)).toStrictEqual(values);
		expect(
			CreateWorkRequestSchema.parse({
				requesterName: "Field Coordinator",
				clientName: "Cermont",
				serviceSite: "Arauca",
				serviceType: "maintenance",
				sourceChannel: "portal_client",
				shortDescription: "Pump inspection",
				description: "Inspect the main transfer pump at the client site.",
				urgency: "medium",
				customFields: values,
			}).customFields,
		).toStrictEqual(values);
		expect(
			CreateOrderSchema.parse({
				type: "maintenance",
				priority: "medium",
				assetId: "PUMP-001",
				assetName: "Main transfer pump",
				location: "Arauca",
				description: "Preventive field service",
				customFields: values,
			}).customFields,
		).toStrictEqual(values);
	});

	it("rejects nested dynamic field payloads", () => {
		expect(() => CustomFieldValuesSchema.parse({ nested: { value: "not allowed" } })).toThrow();
		expect(() => CustomFieldValuesSchema.parse({ list: ["not allowed"] })).toThrow();
	});
});
