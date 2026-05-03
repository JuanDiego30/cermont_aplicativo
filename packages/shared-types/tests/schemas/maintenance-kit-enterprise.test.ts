import { describe, expect, it } from "vitest";
import {
	CreateMaintenanceKitSchema,
	UpdateMaintenanceKitSchema,
} from "../../src/schemas/maintenanceKit.schema";

const validKit = {
	name: "Kit mantenimiento tablero electrico",
	activityType: "electrical",
	description: "Procedimiento estandar para mantenimiento de tablero electrico en campo.",
	estimatedHours: 4,
	maintenanceClassification: "preventive",
	tools: [{ name: "Multimetro", quantity: 1 }],
	equipment: [],
	procedureSteps: [
		{
			order: 1,
			description: "Registrar voltaje de entrada",
			type: "measurement",
			expectedValue: "220V +/- 5%",
			estimatedMinutes: 15,
			required: true,
		},
	],
	materials: [
		{
			name: "Alcohol isopropilico",
			estimatedQuantity: 1,
			unit: "liter",
			estimatedUnitCost: 25000,
			critical: false,
		},
	],
	safety: {
		minimumPpe: ["helmet", "safety_glasses"],
		requiredPermits: ["electrical_loto"],
		riskClassification: "high",
		specificRisks: ["electrical"],
		requiresLoto: true,
	},
};

describe("MaintenanceKit enterprise schema", () => {
	it("accepts a full enterprise kit", () => {
		const parsed = CreateMaintenanceKitSchema.parse(validKit);
		expect(parsed.procedureSteps).toHaveLength(1);
		expect(parsed.materials[0].estimatedUnitCost).toBe(25000);
	});

	it("requires expectedValue for measurement steps", () => {
		const result = CreateMaintenanceKitSchema.safeParse({
			...validKit,
			procedureSteps: [{ order: 1, description: "Medir tension", type: "measurement" }],
		});

		expect(result.success).toBe(false);
	});

	it("requires changeReason when operational fields are updated", () => {
		const result = UpdateMaintenanceKitSchema.safeParse({
			description: "Nuevo alcance operacional para el kit de mantenimiento.",
		});

		expect(result.success).toBe(false);
	});
});
