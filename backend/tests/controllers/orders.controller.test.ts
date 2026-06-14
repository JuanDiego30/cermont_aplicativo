/**
 * Order Controller Tests
 *
 * Tests HTTP layer for order CRUD operations.
 * Mocks service layer to avoid MongoDB dependency.
 */
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service module before importing controller
const mockListOrders = vi.fn();
const mockCreateOrder = vi.fn();
const mockGetOrderById = vi.fn();
const mockGetOrderByIdWithAuth = vi.fn();
const mockUpdateOrder = vi.fn();
const mockDeleteOrder = vi.fn();

vi.mock("../../src/modules/order/order-crud.service", () => ({
	listOrders: mockListOrders,
	createOrder: mockCreateOrder,
	getOrderById: mockGetOrderById,
	getOrderByIdWithAuth: mockGetOrderByIdWithAuth,
	updateOrder: mockUpdateOrder,
	deleteOrder: mockDeleteOrder,
}));

// Dynamic import so mocks are applied
const importController = async () => import("../../src/modules/order/order-crud.controller");

function mockReq(overrides: Partial<Request> = {}): Request {
	return {
		query: {},
		params: {},
		body: {},
		user: { _id: "user-1", role: "gerente", email: "test@cermont.com" },
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

describe("OrderController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("listOrders", () => {
		it("should return paginated orders list", async () => {
			const orders = [{ _id: "1", title: "Test Order" }];
			mockListOrders.mockResolvedValue({
				orders,
				total: 1,
				page: 1,
				limit: 20,
				pages: 1,
			});

			const req = mockReq({ query: { page: "1", limit: "20" } });
			const res = mockRes();
			const { listOrders } = await importController();

			await listOrders(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: orders,
					meta: expect.objectContaining({ total: 1, page: 1, limit: 20, pages: 1 }),
				}),
			);
		});

		it("should handle empty order list", async () => {
			mockListOrders.mockResolvedValue({
				orders: [],
				total: 0,
				page: 1,
				limit: 20,
				pages: 0,
			});

			const req = mockReq({ query: { page: "1", limit: "20" } });
			const res = mockRes();
			const { listOrders } = await importController();

			await listOrders(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const responseData = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(responseData.data).toEqual([]);
			expect(responseData.meta.total).toBe(0);
		});
	});

	describe("createOrder", () => {
		it("should create an order successfully", async () => {
			const newOrder = {
				_id: "order-1",
				type: "correctivo",
				priority: "alta",
				description: "Test order",
			};
			mockCreateOrder.mockResolvedValue(newOrder);

			const req = mockReq({
				body: {
					type: "correctivo",
					priority: "alta",
					description: "Test order",
				},
			});
			const res = mockRes();
			const { createOrder } = await importController();

			await createOrder(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: newOrder,
				}),
			);
		});

		it("should propagate service error on failure", async () => {
			mockCreateOrder.mockRejectedValue(new Error("Order validation failed"));

			const req = mockReq({ body: { type: "invalid" } });
			const res = mockRes();
			const { createOrder } = await importController();

			await expect(createOrder(req, res)).rejects.toThrow("Order validation failed");
		});
	});

	describe("getOrder", () => {
		it("should return order by ID", async () => {
			const order = { _id: "order-1", title: "Test Order" };
			mockGetOrderByIdWithAuth.mockResolvedValue(order);

			const req = mockReq({ params: { id: "order-1" } });
			const res = mockRes();
			const { getOrder } = await importController();

			await getOrder(req, res);

			expect(mockGetOrderByIdWithAuth).toHaveBeenCalledWith("order-1", {
				_id: "user-1",
				role: "gerente",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, data: order }),
			);
		});

		it("should propagate service error when order is not found", async () => {
			mockGetOrderByIdWithAuth.mockRejectedValue(new Error("Order not found"));

			const req = mockReq({ params: { id: "nonexistent" } });
			const res = mockRes();
			const { getOrder } = await importController();

			await expect(getOrder(req, res)).rejects.toThrow("Order not found");

			expect(res.status).not.toHaveBeenCalled();
		});
	});

	describe("updateOrder", () => {
		it("should update order successfully", async () => {
			const updated = { _id: "order-1", title: "Updated Order" };
			mockUpdateOrder.mockResolvedValue(updated);

			const req = mockReq({
				params: { id: "order-1" },
				body: { title: "Updated Order" },
			});
			const res = mockRes();
			const { updateOrder } = await importController();

			await updateOrder(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, data: updated }),
			);
		});
	});
});
