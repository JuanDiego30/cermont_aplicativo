import { describe, expect, it, vi } from "vitest";
import { DispatchService } from "../../src/modules/dispatch/dispatch.service";

describe("DispatchService", () => {
	it("orders stops deterministically without mutating the input", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("OSRM unavailable")));
		const stops = [
			{
				id: "a",
				label: "Base",
				address: "Base",
				coord: { lat: 4.711, lng: -74.072 },
				estimatedDuration: 20,
			},
			{
				id: "c",
				label: "Lejana",
				address: "Lejana",
				coord: { lat: 4.9, lng: -74.3 },
				estimatedDuration: 30,
			},
			{
				id: "b",
				label: "Cercana",
				address: "Cercana",
				coord: { lat: 4.712, lng: -74.073 },
				estimatedDuration: 15,
			},
		];
		const original = structuredClone(stops);

		const result = await DispatchService.optimizeRoute(stops);

		expect(result.orderedIds).toEqual(["a", "b", "c"]);
		expect(result.totalDistanceKm).toBeGreaterThan(0);
		expect(stops).toEqual(original);
	});

	it("returns an explicit unavailable result when geocoding fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

		const result = await DispatchService.geocode("Arauca");

		expect(result).toEqual({
			status: "unavailable",
			reason: "GEOCODING_PROVIDER_UNAVAILABLE",
		});
	});
});
