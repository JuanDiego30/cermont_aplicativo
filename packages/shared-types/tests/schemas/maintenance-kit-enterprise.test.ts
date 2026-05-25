import { describe, expect, it } from "vitest";
import {
	CreateMaintenanceKitSchema,
	UpdateMaintenanceKitSchema,
} from "../../src/schemas/maintenanceKit.schema";

const validKit = {
	name: "Kit mantenimiento tablero electrico",
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
