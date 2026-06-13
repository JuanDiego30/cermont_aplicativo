import { describe, expect, it } from "vitest";
import {
	AssignTechniciansInputSchema,
	DispatchGeocodeQuerySchema,
	OptimizeRouteInputSchema,
} from "../../src/schemas/dispatch.schema";

const validStop = {
	id: "stop-1",
	label: "Cliente principal",
	address: "Carrera 7 # 72-41, Bogota",
	coord: { lat: 4.656, lng: -74.059 },
	priority: "media",
	estimatedDuration: 45,
};

describe("dispatch schemas", () => {
	it("accepts valid route optimization input", () => {
		const result = OptimizeRouteInputSchema.safeParse({ stops: [validStop] });
		expect(result.success).toBe(true);
	});

	it("rejects coordinates outside geographic bounds", () => {
		const result = OptimizeRouteInputSchema.safeParse({
			stops: [{ ...validStop, coord: { lat: 120, lng: -74.059 } }],
		});
		expect(result.success).toBe(false);
	});

	it("requires technicians and stops for assignment", () => {
		const result = AssignTechniciansInputSchema.safeParse({
			technicians: [],
			stops: [validStop],
		});
		expect(result.success).toBe(false);
	});

	it("normalizes a geocoding query", () => {
		const result = DispatchGeocodeQuerySchema.parse({ q: "  Calle 80 Bogota  " });
		expect(result.q).toBe("Calle 80 Bogota");
	});
});
