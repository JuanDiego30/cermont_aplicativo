import { describe, expect, it } from "vitest";
import {
	CreateMaintenanceKitSchema,
	UpdateMaintenanceKitSchema,
} from "../../src/schemas/maintenanceKit.schema";

const validKit = {
	name: "Switchgear field kit",
	activityType: "electrico",
	tools: [{ name: "Multimetro", quantity: 1 }],
	equipment: [],
};

describe("MaintenanceKit enterprise schema", () => {
	it("accepts a full typical maintenance kit", () => {
		const parsed = CreateMaintenanceKitSchema.parse(validKit);
		expect(parsed.activityType).toBe("electrico");
		expect(parsed.tools).toHaveLength(1);
		expect(parsed.equipment).toStrictEqual([]);
	});

	it("keeps user-defined custom fields on tools and equipment", () => {
		const parsed = CreateMaintenanceKitSchema.parse({
			name: "Kit torque certificado",
			activityType: "mecanico",
			tools: [
				{
					name: "Torquímetro",
					quantity: 1,
					specifications: "1/2 pulgada",
					customFields: {
						serial: "TQ-8842",
						rangoNm: 340,
						aislamiento: false,
					},
				},
			],
			equipment: [
				{
					name: "Bomba de prueba",
					quantity: 1,
					certificateRequired: true,
					customFields: {
						presionMaxPsi: 5000,
						certificadoVigente: true,
					},
				},
			],
		});

		expect(parsed.tools[0].customFields).toStrictEqual({
			serial: "TQ-8842",
			rangoNm: 340,
			aislamiento: false,
		});
		expect(parsed.equipment[0].customFields).toStrictEqual({
			presionMaxPsi: 5000,
			certificadoVigente: true,
		});
	});

	it("requires at least one tool", () => {
		const result = CreateMaintenanceKitSchema.safeParse({
			...validKit,
			tools: [],
		});

		expect(result.success).toBe(false);
	});

	it("accepts partial operational updates", () => {
		const result = UpdateMaintenanceKitSchema.safeParse({
			activityType: "mecanico",
		});

		expect(result.success).toBe(true);
	});
});
