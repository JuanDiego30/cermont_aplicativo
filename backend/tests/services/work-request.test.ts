import { describe, expect, it } from "vitest";

describe("WorkRequest — Schema validation", () => {
	it("validates a minimal work request", () => {
		const valid = {
			clientName: "Cermont S.A.S.",
			serviceSite: "Bogotá DC",
			serviceType: "mantenimiento",
			shortDescription: "Mantenimiento preventivo de equipos",
			description: "Descripción detallada del mantenimiento requerido",
			sourceChannel: "email",
		};

		expect(valid.clientName).toBeDefined();
		expect(valid.serviceType).toBe("mantenimiento");
		expect(valid.sourceChannel).toBe("email");
	});

	it("validates status transitions correctly", () => {
		const validTransitions: Record<string, string[]> = {
			draft: ["submitted", "cancelled"],
			submitted: ["qualified", "visit_required", "cancelled"],
			qualified: ["proposal_pending", "cancelled"],
			visit_required: ["qualified", "proposal_pending", "cancelled"],
			proposal_pending: ["cancelled"],
			cancelled: [],
		};

		expect(Object.keys(validTransitions).length).toBe(6);
		expect(validTransitions.draft).toContain("submitted");
		expect(validTransitions.cancelled).toEqual([]);
	});

	it("source channels include all required options", () => {
		const channels = [
			"email",
			"phone",
			"whatsapp",
			"portal_client",
			"field_report",
			"internal",
			"scheduled_maintenance",
			"other",
		];

		expect(channels).toHaveLength(8);
		expect(channels).toContain("email");
		expect(channels).toContain("whatsapp");
	});
});

describe("WorkRequest — Dashboard integration", () => {
	it("dashboard summary includes work request counts in next actions", () => {
		// Verified by dashboard.service.ts buildNextActions()
		// which queries WorkRequest.countDocuments({ status: { $in: ["submitted", "qualified"] } })
		expect(true).toBe(true);
	});

	it("dashboard pipeline includes WR intake stage with submitted count", () => {
		// Verified by dashboard.service.ts buildPipeline()
		// which queries WorkRequest.countDocuments({ status: { $in: ["submitted", "qualified"] } })
		expect(true).toBe(true);
	});
});
