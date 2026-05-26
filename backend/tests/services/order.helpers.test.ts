import { OrderSchema } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";
import { formatOrderResponse } from "../../src/services/order/helpers";

describe("formatOrderResponse", () => {
	it("returns an order payload that satisfies the shared order schema", () => {
		const response = formatOrderResponse({
			_id: { toString: () => "507f1f77bcf86cd799439011" },
			code: "OT-202604-0001",
			type: "maintenance",
			status: "open",
			priority: "medium",
			description: "Replace pump seal in line 4",
			assetId: "AST-001",
			assetName: "Pump A",
			location: "Plant 1",
			gpsLocation: {
				lat: 6.25184,
				lng: -75.56359,
				capturedAt: new Date("2026-04-12T10:15:30.000Z"),
			},
			maintenanceKitId: { toString: () => "507f1f77bcf86cd799439012" },
			assignedTo: { toString: () => "507f1f77bcf86cd799439013" },
			assignedToName: "Carlos Díaz",
			supervisedBy: { toString: () => "507f1f77bcf86cd799439014" },
			materials: [{ name: "Seal", quantity: 1, unit: "unit", delivered: false }],
			incidentType: "breakdown",
			causeCode: "wear",
			resolutionCode: "repaired",
			followUpWorkOrderId: { toString: () => "507f1f77bcf86cd799439015" },
			requestedBy: "Operations lead",
			contactPhone: "+573001234567",
			siteAccessInstructions: "Report at gate B",
			safetyRequirements: "Wear PPE",
			estimatedDuration: 90,
			actualDuration: 95,
			travelTime: 20,
			waitTime: 5,
			customerSignature: "signed-by-client",
			customerFeedback: "Good service",
			workPerformed: "Replaced seal and verified pressure",
			startedAt: new Date("2026-04-12T10:30:00.000Z"),
			completedAt: new Date("2026-04-12T12:05:00.000Z"),
			dueDate: new Date("2026-04-13T00:00:00.000Z"),
			slaDueDate: new Date("2026-04-13T06:00:00.000Z"),
			slaStatus: "on_track",
			observations: "No anomalies",
			invoiceReady: false,
			reportGenerated: false,
			proposalId: { toString: () => "507f1f77bcf86cd799439016" },
			createdBy: { toString: () => "507f1f77bcf86cd799439017" },
			createdAt: new Date("2026-04-12T10:00:00.000Z"),
			updatedAt: new Date("2026-04-12T12:30:00.000Z"),
		} as never);

		expect(response).toMatchObject({
			followUpWorkOrderId: "507f1f77bcf86cd799439015",
			gpsLocation: {
				capturedAt: "2026-04-12T10:15:30.000Z",
			},
			createdAt: "2026-04-12T10:00:00.000Z",
			updatedAt: "2026-04-12T12:30:00.000Z",
		});

		expect(OrderSchema.safeParse(response).success).toBe(true);
	});
});
