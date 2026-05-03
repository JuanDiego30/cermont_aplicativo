import { describe, expect, it } from "vitest";

import {
	CreateOrderSchema,
	ExecutionPhaseSchema,
	ExecutionPhaseTypeSchema,
	OrderSchema,
	OrderStatusSchema,
} from "../../src/schemas";

describe("order clean contract", () => {
	it("uses English execution phase and cost baseline fields", () => {
		const parsedOrder = OrderSchema.parse({
			_id: "507f1f77bcf86cd799439011",
			code: "OT-202604-0001",
			type: "maintenance",
			status: "open",
			priority: "medium",
			assetId: "PUMP-001",
			assetName: "Main transfer pump",
			location: "Caño Limón",
			description: "Preventive field service",
			executionPhase: {
				current: "PRE_START",
				preStartCompletedAt: "2026-04-29T10:00:00.000Z",
				inExecutionCompletedAt: "2026-04-29T11:00:00.000Z",
				closureCompletedAt: "2026-04-29T12:00:00.000Z",
			},
			costBaseline: {
				proposalId: "507f1f77bcf86cd799439012",
				proposalCode: "PROP-2026-0001",
				subtotal: 100,
				taxRate: 0.19,
				total: 119,
				items: [
					{
						description: "Filter",
						unit: "unit",
						quantity: 1,
						unitCost: 100,
						total: 100,
					},
				],
				frozenAt: "2026-04-29T09:00:00.000Z",
			},
			createdBy: "507f1f77bcf86cd799439013",
			createdAt: "2026-04-29T08:00:00.000Z",
			updatedAt: "2026-04-29T08:30:00.000Z",
		});

		expect(parsedOrder.executionPhase).toMatchObject({
			preStartCompletedAt: "2026-04-29T10:00:00.000Z",
			inExecutionCompletedAt: "2026-04-29T11:00:00.000Z",
			closureCompletedAt: "2026-04-29T12:00:00.000Z",
		});
		expect(parsedOrder).toHaveProperty("costBaseline");
		expect(parsedOrder).not.toHaveProperty("costosBaseline");
		expect(parsedOrder.executionPhase).not.toHaveProperty("preInicioCompletedAt");
		expect(parsedOrder.executionPhase).not.toHaveProperty("enEjecucionCompletedAt");
		expect(parsedOrder.executionPhase).not.toHaveProperty("cierreCompletedAt");
	});

	it("accepts clean cost baseline input for order creation", () => {
		const parsedInput = CreateOrderSchema.parse({
			type: "maintenance",
			priority: "high",
			assetId: "PUMP-002",
			assetName: "Secondary transfer pump",
			location: "Arauca",
			description: "Order converted from an approved proposal",
			costBaseline: {
				proposalId: "507f1f77bcf86cd799439012",
				proposalCode: "PROP-2026-0002",
				subtotal: 200,
				taxRate: 0.19,
				total: 238,
				items: [],
				frozenAt: "2026-04-29T09:00:00.000Z",
			},
		});

		expect(parsedInput).toHaveProperty("costBaseline");
		expect(parsedInput).not.toHaveProperty("costosBaseline");
	});

	it("rejects legacy execution phase and status aliases", () => {
		expect(() => ExecutionPhaseTypeSchema.parse("PRE_INICIO")).toThrow();
		expect(() => ExecutionPhaseTypeSchema.parse("EN_EJECUCION")).toThrow();
		expect(() => ExecutionPhaseTypeSchema.parse("CIERRE")).toThrow();
		expect(() => OrderStatusSchema.parse("in-progress")).toThrow();
		expect(() => OrderStatusSchema.parse("ready-for-invoicing")).toThrow();
	});

	it("omits absent execution phase values from public output", () => {
		expect(ExecutionPhaseSchema.parse({})).toStrictEqual({ preStartVerification: [] });

		const parsedOrder = OrderSchema.parse({
			_id: "507f1f77bcf86cd799439011",
			code: "OT-202604-0003",
			type: "inspection",
			status: "assigned",
			priority: "medium",
			assetId: "PUMP-003",
			assetName: "Tertiary transfer pump",
			location: "Arauca",
			description: "Inspection order without phase timestamps",
			createdBy: "507f1f77bcf86cd799439013",
			createdAt: "2026-04-29T08:00:00.000Z",
			updatedAt: "2026-04-29T08:30:00.000Z",
		});

		expect(parsedOrder.executionPhase).toStrictEqual({ preStartVerification: [] });
	});
});
