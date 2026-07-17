import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "../../src/common/errors/AppError";

const mocks = vi.hoisted(() => ({
	orderFindById: vi.fn(),
	costFind: vi.fn(),
	costCountDocuments: vi.fn(),
	costFindById: vi.fn(),
	costAggregate: vi.fn(),
	costDeleteOne: vi.fn(),
	evidenceCountDocuments: vi.fn(),
	documentCountDocuments: vi.fn(),
	invoiceFindOne: vi.fn(),
	paymentFindOne: vi.fn(),
	proposalFindById: vi.fn(),
	costBaselineFindOne: vi.fn(),
	costBaselineUpdateMany: vi.fn(),
	costBaselineSave: vi.fn(),
	serviceCaseFindById: vi.fn(),
	invoiceAggregate: vi.fn(),
}));

vi.mock("../../src/models", () => {
	const Cost = vi.fn();

	return {
		Cost: Object.assign(Cost, {
			find: mocks.costFind,
			countDocuments: mocks.costCountDocuments,
			findById: mocks.costFindById,
			aggregate: mocks.costAggregate,
			deleteOne: mocks.costDeleteOne,
		}),
		CostBaseline: Object.assign(
			class MockCostBaseline {
				_id = new Types.ObjectId();
				save = vi.fn().mockResolvedValue(undefined);
			},
			{
				findOne: mocks.costBaselineFindOne,
				updateMany: mocks.costBaselineUpdateMany,
			},
		),
		Order: {
			findById: mocks.orderFindById,
		},
		Evidence: {
			countDocuments: mocks.evidenceCountDocuments,
		},
		Document: {
			countDocuments: mocks.documentCountDocuments,
		},
		Invoice: {
			findOne: mocks.invoiceFindOne,
			aggregate: mocks.invoiceAggregate,
		},
		Payment: {
			findOne: mocks.paymentFindOne,
		},
		Proposal: {
			findById: mocks.proposalFindById,
		},
		ServiceCase: {
			findById: mocks.serviceCaseFindById,
		},
	};
});

import { Cost } from "../../src/models";
import * as CostService from "../../src/modules/cost/cost.service";

const ORDER_ID = "507f1f77bcf86cd799439011";
const COST_ID = "507f1f77bcf86cd799439021";
const USER_ID = "507f1f77bcf86cd799439031";
const SUPPORT_EVIDENCE_ID = "507f1f77bcf86cd799439051";
const SERVICE_CASE_ID = "507f1f77bcf86cd799439061";
const PROPOSAL_ID = "507f1f77bcf86cd799439071";

function buildOrder() {
	return {
		_id: new Types.ObjectId(ORDER_ID),
		status: "completed",
	};
}

function buildCostDoc(overrides: Record<string, unknown> = {}) {
	const save = vi.fn().mockResolvedValue(undefined);

	return {
		_id: new Types.ObjectId(COST_ID),
		orderId: new Types.ObjectId(ORDER_ID),
		category: "labor",
		description: "Welding work",
		estimatedAmount: 1000,
		actualAmount: 1200,
		taxAmount: 190,
		taxRate: 0.19,
		currency: "COP",
		notes: "Initial record",
		recordedBy: new Types.ObjectId(USER_ID),
		recordedAt: new Date("2026-03-23T12:00:00Z"),
		createdAt: new Date("2026-03-23T12:00:00Z"),
		updatedAt: new Date("2026-03-23T13:00:00Z"),
		supportEvidenceIds: [new Types.ObjectId(SUPPORT_EVIDENCE_ID)],
		supportDocumentIds: [],
		status: "active",
		save,
		...overrides,
	};
}

describe("CostService", () => {
	const CostModel = Cost as unknown as {
		mockImplementation: (implementation: (...args: unknown[]) => unknown) => void;
		mock: { calls: unknown[][] };
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.orderFindById.mockReturnValue({
			lean: vi.fn().mockResolvedValue(buildOrder()),
		});
		mocks.costCountDocuments.mockResolvedValue(0);
		mocks.costFind.mockReturnValue({
			sort: vi.fn().mockReturnThis(),
			skip: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([]),
		});
		mocks.costFindById.mockResolvedValue(null);
		mocks.costAggregate.mockResolvedValue([]);
		mocks.costDeleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
		mocks.evidenceCountDocuments.mockResolvedValue(1);
		mocks.documentCountDocuments.mockResolvedValue(0);
		mocks.invoiceFindOne.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(undefined),
		});
		mocks.invoiceAggregate.mockResolvedValue([]);
		mocks.paymentFindOne.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(undefined),
		});
		mocks.proposalFindById.mockReturnValue({
			lean: vi.fn().mockResolvedValue(null),
		});
		mocks.costBaselineFindOne.mockReturnValue({
			lean: vi.fn().mockResolvedValue(null),
		});
		mocks.costBaselineUpdateMany.mockResolvedValue({ modifiedCount: 0 });
		mocks.serviceCaseFindById.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(null),
		});
		CostModel.mockImplementation(function (this: unknown, doc: Record<string, unknown>) {
			return buildCostDoc(doc) as never;
		});
	});

	describe("createCost", () => {
		it("creates a cost with the canonical fields and computes variance", async () => {
			const createdCost = buildCostDoc({
				orderId: new Types.ObjectId(ORDER_ID),
				category: "materials",
				description: "Replacement seal",
				estimatedAmount: 1500,
				actualAmount: 1750,
				taxAmount: 333,
				taxRate: 0.19,
				currency: "COP",
				notes: "Urgent replacement",
				supportEvidenceIds: [new Types.ObjectId(SUPPORT_EVIDENCE_ID)],
				supportDocumentIds: [],
				recordedBy: new Types.ObjectId(USER_ID),
			});

			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.createCost(
				{
					orderId: ORDER_ID,
					category: "materials",
					description: "Replacement seal",
					estimatedAmount: 1500,
					actualAmount: 1750,
					taxAmount: 333,
					taxRate: 0.19,
					currency: "COP",
					notes: "Urgent replacement",
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
					supportDocumentIds: [],
				},
				USER_ID,
			);

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(CostModel).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: expect.any(Types.ObjectId),
					category: "materials",
					description: "Replacement seal",
					estimatedAmount: 1500,
					actualAmount: 1750,
					taxAmount: 333,
					taxRate: 0.19,
					currency: "COP",
					notes: "Urgent replacement",
					supportEvidenceIds: [expect.any(Types.ObjectId)],
					supportDocumentIds: [],
					recordedBy: expect.any(Types.ObjectId),
					recordedAt: expect.any(Date),
				}),
			);
			expect(result).toMatchObject({
				orderId: ORDER_ID,
				category: "materials",
				estimatedAmount: 1500,
				actualAmount: 1750,
				taxAmount: 333,
				supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				supportDocumentIds: [],
				variance: 250,
				variancePercent: { status: "present", value: 0.16666666666666666 },
				dataState: "ESTIMATED_AND_ACTUAL",
			});
		});

		it("rejects actual costs that do not include evidence or document support", async () => {
			await expect(
				CostService.createCost(
					{
						orderId: ORDER_ID,
						category: "materials",
						description: "Consumables purchased in field",
						estimatedAmount: 0,
						actualAmount: 500,
					},
					USER_ID,
				),
			).rejects.toThrow("Actual cost entries require at least one support evidence or document");

			expect(CostModel).not.toHaveBeenCalled();
		});

		it("rejects cost support that is not attached to the same order", async () => {
			mocks.evidenceCountDocuments.mockResolvedValueOnce(0);

			await expect(
				CostService.createCost(
					{
						orderId: ORDER_ID,
						category: "materials",
						description: "Consumables purchased in field",
						estimatedAmount: 0,
						actualAmount: 500,
						supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
					},
					USER_ID,
				),
			).rejects.toThrow("Cost support evidence must exist and belong to the order");

			const query = mocks.evidenceCountDocuments.mock.calls[0]?.[0] as {
				_id: { $in: Types.ObjectId[] };
				$or: Array<{ orderId?: Types.ObjectId; workOrderId?: Types.ObjectId }>;
			};
			expect(query._id.$in[0]?.toString()).toBe(SUPPORT_EVIDENCE_ID);
			expect(
				query.$or.map((clause) => clause.orderId?.toString() ?? clause.workOrderId?.toString()),
			).toContain(ORDER_ID);
			expect(CostModel).not.toHaveBeenCalled();
		});

		it("rejects document support that is not attached to the same order", async () => {
			mocks.documentCountDocuments.mockResolvedValueOnce(0);

			await expect(
				CostService.createCost(
					{
						orderId: ORDER_ID,
						category: "materials",
						description: "Consumables purchased in field",
						estimatedAmount: 0,
						actualAmount: 500,
						supportDocumentIds: [SUPPORT_EVIDENCE_ID],
					},
					USER_ID,
				),
			).rejects.toThrow("Cost support document must exist and belong to the order");

			const query = mocks.documentCountDocuments.mock.calls[0]?.[0] as {
				_id: { $in: Types.ObjectId[] };
				$or: Array<{ order_id?: Types.ObjectId; linkedEntityId?: Types.ObjectId }>;
			};
			expect(query._id.$in[0]?.toString()).toBe(SUPPORT_EVIDENCE_ID);
			expect(
				query.$or.map((clause) => clause.order_id?.toString() ?? clause.linkedEntityId?.toString()),
			).toContain(ORDER_ID);
			expect(CostModel).not.toHaveBeenCalled();
		});

		it("throws NotFoundError when the order does not exist", async () => {
			mocks.orderFindById.mockReturnValueOnce({
				lean: vi.fn().mockResolvedValue(null),
			});

			await expect(
				CostService.createCost(
					{
						orderId: ORDER_ID,
						category: "labor",
						description: "Labor work",
						estimatedAmount: 100,
						actualAmount: 120,
						supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
					},
					USER_ID,
				),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("listCosts", () => {
		it("filters by orderId and category with pagination", async () => {
			const chain = {
				sort: vi.fn().mockReturnThis(),
				skip: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue([
					buildCostDoc({
						_id: new Types.ObjectId("507f1f77bcf86cd799439041"),
						orderId: new Types.ObjectId(ORDER_ID),
						category: "labor",
						description: "Labor one",
						estimatedAmount: 500,
						actualAmount: 650,
						taxAmount: 124,
						recordedBy: new Types.ObjectId(USER_ID),
					}),
				]),
			};

			mocks.costCountDocuments.mockResolvedValueOnce(1);
			mocks.costFind.mockReturnValueOnce(chain as never);

			const result = await CostService.listCosts({
				orderId: ORDER_ID,
				category: "labor",
				page: 2,
				limit: 10,
			});

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(mocks.costCountDocuments).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: expect.any(Types.ObjectId),
					category: "labor",
				}),
			);

			const query = mocks.costFind.mock.calls[0]?.[0] as {
				orderId?: Types.ObjectId;
				category?: string;
			};
			expect(query.orderId?.toString()).toBe(ORDER_ID);
			expect(query.category).toBe("labor");
			expect(chain.skip).toHaveBeenCalledWith(10);
			expect(chain.limit).toHaveBeenCalledWith(10);
			expect(result).toMatchObject({
				total: 1,
				page: 2,
				limit: 10,
				pages: 1,
			});
			expect(result.costs).toHaveLength(1);
			expect(result.costs[0]).toMatchObject({
				category: "labor",
				estimatedAmount: 500,
				actualAmount: 650,
				variance: 150,
			});
		});
	});

	describe("getOrderSummary", () => {
		it("returns totals and category breakdown", async () => {
			mocks.costAggregate
				.mockResolvedValueOnce([
					{
						totalEstimated: 1000,
						totalActual: 1200,
						totalTax: 228,
					},
				])
				.mockResolvedValueOnce([
					{
						category: "labor",
						estimated: 1000,
						actual: 1200,
						tax: 228,
						variance: 200,
					},
				]);

			const result = await CostService.getOrderSummary(ORDER_ID);

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(result).toEqual({
				orderId: ORDER_ID,
				totalEstimated: 1000,
				totalActual: 1200,
				totalTax: 228,
				variance: 200,
				variancePercent: { status: "present", value: 0.2 },
				approvedBudget: { status: "absent" },
				budgetConsumptionPercent: { status: "absent" },
				budgetRisk: "not_available",
				budgetAlertThreshold: 0.8,
				actualCostWithTax: 1428,
				grossProfit: { status: "absent" },
				grossMarginPercent: { status: "absent" },
				hasCosts: true,
				dataState: "ESTIMATED_AND_ACTUAL",
				byCategory: [
					{
						category: "labor",
						estimated: 1000,
						actual: 1200,
						tax: 228,
						variance: 200,
						dataState: "ESTIMATED_AND_ACTUAL",
					},
				],
			});
		});

		it("returns hasCosts false when there are no recorded costs", async () => {
			mocks.costAggregate.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await CostService.getOrderSummary(ORDER_ID);

			expect(result).toEqual({
				orderId: ORDER_ID,
				totalEstimated: 0,
				totalActual: 0,
				totalTax: 0,
				variance: 0,
				variancePercent: { status: "absent" },
				approvedBudget: { status: "absent" },
				budgetConsumptionPercent: { status: "absent" },
				budgetRisk: "not_available",
				budgetAlertThreshold: 0.8,
				actualCostWithTax: 0,
				grossProfit: { status: "absent" },
				grossMarginPercent: { status: "absent" },
				hasCosts: false,
				dataState: "NO_DATA",
				byCategory: [],
			});
		});

		it("marks an order as PAID when it already has a payment artifact", async () => {
			mocks.costAggregate
				.mockResolvedValueOnce([
					{
						totalEstimated: 1000,
						totalActual: 1000,
						totalTax: 0,
					},
				])
				.mockResolvedValueOnce([]);
			mocks.paymentFindOne.mockReturnValueOnce({
				select: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
			});

			const result = await CostService.getOrderSummary(ORDER_ID);

			expect(result.dataState).toBe("PAID");
			expect(result.hasCosts).toBe(true);
		});
	});

	describe("updateCost", () => {
		it("throws ForbiddenError when the editor is neither the owner nor a supervisor", async () => {
			mocks.costFindById.mockResolvedValueOnce(
				buildCostDoc({
					recordedBy: new Types.ObjectId(USER_ID),
				}),
			);

			await expect(
				CostService.updateCost(
					COST_ID,
					{
						description: "Updated description",
					},
					"507f1f77bcf86cd799439099",
					"tecnico",
				),
			).rejects.toThrow(ForbiddenError);
		});
	});

	describe("deleteCost", () => {
		it("voids a cost instead of physically deleting historical cost data", async () => {
			const costDoc = buildCostDoc();
			mocks.costFindById.mockResolvedValueOnce(costDoc);

			const result = await CostService.deleteCost(COST_ID, USER_ID, "tecnico");

			expect(costDoc.status).toBe("voided");
			expect(costDoc.voidedBy?.toString()).toBe(USER_ID);
			expect(costDoc.voidedAt).toBeInstanceOf(Date);
			expect(costDoc.save).toHaveBeenCalled();
			expect(mocks.costDeleteOne).not.toHaveBeenCalled();
			expect(result).toMatchObject({
				_id: COST_ID,
				status: "voided",
			});
		});
	});

	// ═════════════════════════════════════════════════════════════════════
	// F22-T067: Baseline freeze tests
	// ═════════════════════════════════════════════════════════════════════

	describe("freezeProposalBaseline", () => {
		it("creates a cost baseline from an approved proposal", async () => {
			const proposalDoc = {
				_id: new Types.ObjectId(PROPOSAL_ID),
				code: "PROP-2026-0001",
				items: [
					{
						description: "Mano de obra soldadura",
						unit: "hora",
						quantity: 10,
						unitCost: 50000,
						total: 500000,
					},
					{
						description: "Tuberia 2 pulgadas",
						unit: "m",
						quantity: 50,
						unitCost: 25000,
						total: 1250000,
					},
				],
				subtotal: 1750000,
				taxRate: 0.19,
				total: 2082500,
				serviceCaseId: new Types.ObjectId(SERVICE_CASE_ID),
			};

			mocks.proposalFindById.mockReturnValue({
				lean: vi.fn().mockResolvedValue(proposalDoc),
			});

			const result = await CostService.freezeProposalBaseline(PROPOSAL_ID, USER_ID);

			expect(mocks.proposalFindById).toHaveBeenCalledWith(PROPOSAL_ID);
			expect(mocks.costBaselineUpdateMany).toHaveBeenCalledWith(
				{ serviceCaseId: expect.any(Types.ObjectId), status: "active" },
				{ $set: { status: "superseded", supersededAt: expect.any(Date) } },
			);
			expect(result).toHaveProperty("baselineId");
		});

		it("throws NotFoundError when proposal does not exist", async () => {
			mocks.proposalFindById.mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			});

			await expect(CostService.freezeProposalBaseline(PROPOSAL_ID, USER_ID)).rejects.toThrow(
				NotFoundError,
			);
		});
	});

	// ═════════════════════════════════════════════════════════════════════
	// F22-T068: Category-specific registration tests
	// ═════════════════════════════════════════════════════════════════════

	describe("registerLaborCost", () => {
		it("registers labor cost with hours * rate calculation", async () => {
			const createdCost = buildCostDoc({
				category: "labor",
				description: "Mano de obra — 8h × $50000/h",
				estimatedAmount: 0,
				actualAmount: 400000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerLaborCost(
				{
					orderId: ORDER_ID,
					hours: 8,
					rate: 50000,
					workerId: "worker-001",
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "labor",
				actualAmount: 400000,
			});
		});
	});

	describe("registerMaterialCost", () => {
		it("registers material cost with quantity * unitPrice", async () => {
			const createdCost = buildCostDoc({
				category: "materials",
				estimatedAmount: 0,
				actualAmount: 250000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerMaterialCost(
				{
					orderId: ORDER_ID,
					materialId: "mat-001",
					quantity: 10,
					unitPrice: 25000,
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "materials",
				actualAmount: 250000,
			});
		});
	});

	describe("registerEquipmentCost", () => {
		it("registers equipment cost with hours * rate", async () => {
			const createdCost = buildCostDoc({
				category: "equipment",
				estimatedAmount: 0,
				actualAmount: 600000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerEquipmentCost(
				{
					orderId: ORDER_ID,
					equipmentId: "eq-001",
					hours: 12,
					rate: 50000,
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "equipment",
				actualAmount: 600000,
			});
		});
	});

	describe("registerTransportCost", () => {
		it("registers transport cost with flat amount", async () => {
			const createdCost = buildCostDoc({
				category: "transport",
				estimatedAmount: 0,
				actualAmount: 150000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerTransportCost(
				{
					orderId: ORDER_ID,
					description: "Transporte de materiales a sitio",
					amount: 150000,
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "transport",
				actualAmount: 150000,
			});
		});
	});

	describe("registerSubcontractorCost", () => {
		it("registers subcontractor cost with flat amount", async () => {
			const createdCost = buildCostDoc({
				category: "subcontract",
				estimatedAmount: 0,
				actualAmount: 3000000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerSubcontractorCost(
				{
					orderId: ORDER_ID,
					description: "Subcontrato electricidad",
					amount: 3000000,
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "subcontract",
				actualAmount: 3000000,
			});
		});
	});

	describe("registerTaxCost", () => {
		it("registers tax cost with tax type and amount", async () => {
			const createdCost = buildCostDoc({
				category: "tax",
				estimatedAmount: 0,
				actualAmount: 190000,
			});
			CostModel.mockImplementationOnce(function (this: unknown) {
				return createdCost as never;
			});

			const result = await CostService.registerTaxCost(
				{
					orderId: ORDER_ID,
					taxType: "IVA",
					amount: 190000,
					description: "IVA 19% sobre materiales",
					supportEvidenceIds: [SUPPORT_EVIDENCE_ID],
				},
				USER_ID,
			);

			expect(result).toMatchObject({
				category: "tax",
				actualAmount: 190000,
			});
		});
	});

	// ═════════════════════════════════════════════════════════════════════
	// F22-T069: Variance calculation tests
	// ═════════════════════════════════════════════════════════════════════

	describe("calculateVariance", () => {
		it("returns variance report with baseline vs actual comparison", async () => {
			const serviceCaseDoc = {
				_id: new Types.ObjectId(SERVICE_CASE_ID),
				code: "SC-2026-001",
				orderIds: [new Types.ObjectId(ORDER_ID)],
			};
			mocks.serviceCaseFindById.mockReturnValue({
				select: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(serviceCaseDoc),
			});

			mocks.costBaselineFindOne.mockReturnValue({
				lean: vi.fn().mockResolvedValue({
					_id: new Types.ObjectId(),
					serviceCaseId: serviceCaseDoc._id,
					total: 2082500,
					items: [
						{
							description: "Mano de obra",
							unit: "hora",
							quantity: 10,
							unitCost: 50000,
							total: 500000,
							category: "labor",
						},
						{
							description: "Materiales",
							unit: "m",
							quantity: 50,
							unitCost: 25000,
							total: 1250000,
							category: "materials",
						},
						{
							description: "Transporte",
							unit: "viaje",
							quantity: 2,
							unitCost: 100000,
							total: 200000,
							category: "transport",
						},
						{
							description: "Subcontrato",
							unit: "glb",
							quantity: 1,
							unitCost: 132500,
							total: 132500,
							category: "subcontract",
						},
					],
				}),
			});

			mocks.costAggregate
				.mockResolvedValueOnce([{ totalEstimated: 2082500, totalActual: 2350000 }])
				.mockResolvedValueOnce([
					{ category: "labor", description: "Labor work", estimated: 500000, actual: 650000 },
					{ category: "materials", description: "Materials", estimated: 1250000, actual: 1400000 },
					{ category: "transport", description: "Transport", estimated: 200000, actual: 180000 },
					{
						category: "subcontract",
						description: "Subcontract",
						estimated: 132500,
						actual: 120000,
					},
				]);

			mocks.invoiceAggregate.mockResolvedValueOnce([
				{ totalInvoiced: 2000000, totalPaid: 1500000 },
			]);

			const result = await CostService.calculateVariance(SERVICE_CASE_ID);

			expect(result).toMatchObject({
				serviceCaseId: SERVICE_CASE_ID,
				serviceCaseCode: "SC-2026-001",
				totalBudgeted: 2082500,
			});
			expect(result.totalInvoiced).toBe(2000000);
			expect(result.totalPaid).toBe(1500000);
			expect(result.byCategory.length).toBeGreaterThan(0);
			expect(result.unregisteredCategories).toContain("tax");
			expect(result.unregisteredCategories).toContain("equipment");
		});

		it("throws NotFoundError when service case does not exist", async () => {
			mocks.serviceCaseFindById.mockReturnValue({
				select: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(null),
			});

			await expect(CostService.calculateVariance(SERVICE_CASE_ID)).rejects.toThrow(NotFoundError);
		});
	});

	describe("getServiceCaseCostDashboard", () => {
		it("returns full cost picture including baseline info", async () => {
			const serviceCaseDoc = {
				_id: new Types.ObjectId(SERVICE_CASE_ID),
				code: "SC-2026-001",
				orderIds: [new Types.ObjectId(ORDER_ID)],
			};
			mocks.serviceCaseFindById.mockReturnValue({
				select: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(serviceCaseDoc),
			});

			mocks.costBaselineFindOne.mockReturnValue({
				lean: vi.fn().mockResolvedValue({
					_id: new Types.ObjectId(),
					serviceCaseId: serviceCaseDoc._id,
					total: 2082500,
					items: [
						{
							description: "Mano de obra",
							unit: "hora",
							quantity: 10,
							unitCost: 50000,
							total: 500000,
							category: "labor",
						},
						{
							description: "Materiales",
							unit: "m",
							quantity: 50,
							unitCost: 25000,
							total: 1250000,
							category: "materials",
						},
					],
				}),
			});

			mocks.costAggregate
				.mockResolvedValueOnce([
					{ totalEstimated: 2082500, totalActual: 2350000, totalTax: 446500 },
				])
				.mockResolvedValueOnce([
					{ category: "labor", estimated: 500000, actual: 650000 },
					{ category: "materials", estimated: 1250000, actual: 1400000 },
				]);

			mocks.invoiceAggregate.mockResolvedValueOnce([
				{ totalInvoiced: 2500000, totalPaid: 1000000 },
			]);

			const result = await CostService.getServiceCaseCostDashboard(SERVICE_CASE_ID);

			expect(result).toMatchObject({
				serviceCaseId: SERVICE_CASE_ID,
				serviceCaseCode: "SC-2026-001",
				totalBudgeted: 2082500,
				totalInvoiced: 2500000,
				totalPaid: 1000000,
			});
			expect(result).toHaveProperty("baselineId");
			expect(result.byCategory.length).toBeGreaterThan(0);
		});

		it("throws NotFoundError when service case does not exist", async () => {
			mocks.serviceCaseFindById.mockReturnValue({
				select: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(null),
			});

			await expect(CostService.getServiceCaseCostDashboard(SERVICE_CASE_ID)).rejects.toThrow(
				NotFoundError,
			);
		});
	});
});
