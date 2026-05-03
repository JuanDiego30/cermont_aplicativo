import { describe, expect, it } from "vitest";

import { formatOrderResponse } from "../../src/orders/domain/helpers";

describe("order response formatter", () => {
	it("omits absent execution phase values from API output", () => {
		const orderDocument = {
			_id: { toString: () => "507f1f77bcf86cd799439011" },
			code: "OT-202604-0004",
			type: "maintenance",
			status: "assigned",
			priority: "medium",
			description: "Preventive service ready for execution",
			assetId: "PUMP-004",
			assetName: "Quaternary transfer pump",
			location: "Arauca",
			materials: [],
			planning: { supportDocumentIds: [] },
			invoiceReady: false,
			reportGenerated: false,
			billing: {
				sesStatus: "pending",
				invoiceStatus: "pending",
			},
			createdBy: { toString: () => "507f1f77bcf86cd799439013" },
			createdAt: new Date("2026-04-29T08:00:00.000Z"),
			updatedAt: new Date("2026-04-29T08:30:00.000Z"),
		} satisfies Parameters<typeof formatOrderResponse>[0];

		const response = formatOrderResponse(orderDocument);

		expect(response.executionPhase).toStrictEqual({});
	});

	it("serializes cost baseline database values for API output", () => {
		const orderDocument = {
			_id: { toString: () => "507f1f77bcf86cd799439011" },
			code: "OT-202604-0005",
			type: "maintenance",
			status: "assigned",
			priority: "medium",
			description: "Preventive service converted from proposal",
			assetId: "PUMP-005",
			assetName: "Fifth transfer pump",
			location: "Arauca",
			materials: [],
			planning: { supportDocumentIds: [] },
			invoiceReady: false,
			reportGenerated: false,
			billing: {
				sesStatus: "pending",
				invoiceStatus: "pending",
			},
			costBaseline: {
				proposalId: { toString: () => "507f1f77bcf86cd799439012" },
				proposalCode: "PROP-2026-0005",
				subtotal: 100,
				taxRate: 0.19,
				total: 119,
				items: [],
				frozenAt: new Date("2026-04-29T09:00:00.000Z"),
			},
			createdBy: { toString: () => "507f1f77bcf86cd799439013" },
			createdAt: new Date("2026-04-29T08:00:00.000Z"),
			updatedAt: new Date("2026-04-29T08:30:00.000Z"),
		} satisfies Parameters<typeof formatOrderResponse>[0];

		const response = formatOrderResponse(orderDocument);

		expect(response.costBaseline).toMatchObject({
			proposalId: "507f1f77bcf86cd799439012",
			frozenAt: "2026-04-29T09:00:00.000Z",
		});
	});
});
