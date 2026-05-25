import { describe, expect, it } from "vitest";
import { WorkRequestListResponseSchema, WorkRequestStatusSchema } from "../../src";

const objectId = "507f1f77bcf86cd799439011";
const isoDate = "2026-05-14T00:00:00.000Z";

describe("work request contracts", () => {
	it("uses the canonical intake statuses", () => {
		expect(WorkRequestStatusSchema.options).toEqual([
			"draft",
			"submitted",
			"qualified",
			"visit_required",
			"proposal_pending",
			"cancelled",
		]);
	});

	it("parses the standard paginated list response envelope", () => {
		const parsed = WorkRequestListResponseSchema.parse({
			success: true,
			data: [
				{
					_id: objectId,
					code: "WR-2026-0001",
					status: "submitted",
					urgency: "high",
					requesterName: "Gerencia Cermont",
					clientName: "Cliente Industrial S.A.S.",
					serviceSite: "Planta norte",
					serviceType: "lineas_de_vida",
					sourceChannel: "portal_client",
					shortDescription: "Inspección de línea de vida",
					description: "Inspección inicial para calificar alcance y generar propuesta.",
					requestedDate: isoDate,
					tags: [],
					classifications: [],
					initialEvidences: [],
					requiresSiteVisit: true,
					createdBy: objectId,
					createdAt: isoDate,
					updatedAt: isoDate,
					archived: false,
				},
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 1,
				totalPages: 1,
			},
		});

		expect(parsed.data[0]?.serviceType).toBe("lineas_de_vida");
		expect(parsed.pagination.total).toBe(1);
	});
});
