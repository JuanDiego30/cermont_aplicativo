/**
 * Costs Controller Tests
 *
 * Tests HTTP layer for cost management.
 * Mocks service layer to avoid MongoDB dependency.
 */
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockListCosts = vi.fn();
const mockGetCostsByOrderId = vi.fn();
const mockGetCostById = vi.fn();
const mockGetOrderSummary = vi.fn();
const mockGetCostDashboard = vi.fn();

vi.mock("../../src/modules/cost/cost.service", () => ({
	listCosts: mockListCosts,
	getCostsByOrderId: mockGetCostsByOrderId,
	getCostById: mockGetCostById,
	getOrderSummary: mockGetOrderSummary,
	getCostDashboard: mockGetCostDashboard,
}));

const controllerPromise = import("../../src/modules/cost/cost.controller");

function mockReq(overrides: Partial<Request> = {}): Request {
	return {
		query: {},
		params: {},
		body: {},
		...overrides,
	} as Request;
}

function mockRes(): Response {
	const res: Partial<Response> = {};
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	res.setHeader = vi.fn().mockReturnValue(res);
	return res as Response;
}

describe("CostsController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("listCosts", () => {
		it("should return paginated costs", async () => {
			const costs = [{ _id: "1", category: "materials", amount: 500000 }];
			mockListCosts.mockResolvedValue({
				costs,
				total: 1,
				page: 1,
				limit: 20,
				pages: 1,
			});

			const req = mockReq({ query: { page: "1", limit: "20" } });
			const res = mockRes();
			const { listCosts } = await controllerPromise;

			await listCosts(req, res);

			expect(mockListCosts).toHaveBeenCalled();
			expect(res.setHeader).toHaveBeenCalledWith("X-Total-Count", "1");
			expect(res.status).toHaveBeenCalledWith(200);
		}, 10_000);
	});

	describe("getCostsByOrder", () => {
		it("should return costs filtered by order", async () => {
			const costs = [{ _id: "1", orderId: "order-1", amount: 250000 }];
			mockGetCostsByOrderId.mockResolvedValue({
				costs,
				total: 1,
				page: 1,
				limit: 20,
				pages: 1,
			});

			const req = mockReq({
				params: { orderId: "order-1" },
				query: { page: "1", limit: "20" },
			});
			const res = mockRes();
			const { getCostsByOrder } = await controllerPromise;

			await getCostsByOrder(req, res);

			expect(mockGetCostsByOrderId).toHaveBeenCalledWith("order-1", 1, 20, void 0);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("getCostSummary", () => {
		it("should return cost summary by order", async () => {
			const summary = { totalBudget: 1000000, totalActual: 850000 };
			mockGetOrderSummary.mockResolvedValue(summary);

			const req = mockReq({ params: { orderId: "order-1" } });
			const res = mockRes();
			const { getCostSummary } = await controllerPromise;

			await getCostSummary(req, res);

			expect(mockGetOrderSummary).toHaveBeenCalledWith("order-1");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, data: summary }),
			);
		});
	});

	describe("getCostById", () => {
		it("should return a single cost", async () => {
			const cost = { _id: "cost-1", category: "labor", amount: 300000 };
			mockGetCostById.mockResolvedValue(cost);

			const req = mockReq({ params: { id: "cost-1" } });
			const res = mockRes();
			const { getCostById } = await controllerPromise;

			await getCostById(req, res);

			expect(mockGetCostById).toHaveBeenCalledWith("cost-1");
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});
});
