import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	UnprocessableError,
} from "../../src/common/errors/AppError";

const mocks = vi.hoisted(() => ({
	orderFindById: vi.fn(),
	orderCountDocuments: vi.fn(),
	orderFind: vi.fn(),
	userFindById: vi.fn(),
	workReportFindOne: vi.fn(),
	costGetOrderSummary: vi.fn(),
	orderConstructor: vi.fn(),
	logAudit: vi.fn(),
	createChecklist: vi.fn(),
	generateOrderCode: vi.fn(),
	formatOrderResponse: vi.fn(),
	getDefaultKitForOrderType: vi.fn(),
	generateOrderPdf: vi.fn(),
	assertProposalReadyForWorkOrder: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Order: Object.assign(mocks.orderConstructor, {
		countDocuments: mocks.orderCountDocuments,
		find: mocks.orderFind,
		findById: mocks.orderFindById,
	}),
	User: {
		findById: mocks.userFindById,
	},
	WorkReport: {
		findOne: mocks.workReportFindOne,
	},
}));

vi.mock("../../src/services/order/helpers", () => ({
	formatOrderResponse: mocks.formatOrderResponse,
	generateOrderCode: mocks.generateOrderCode,
	logAudit: mocks.logAudit,
}));

vi.mock("../../src/config/kit-templates", () => ({
	getDefaultKitForOrderType: mocks.getDefaultKitForOrderType,
}));

vi.mock("../../src/modules/checklist/checklist.service", () => ({
	createChecklist: mocks.createChecklist,
}));

vi.mock("../../src/services/pdf-generator.service", () => ({
	generateOrderPdf: mocks.generateOrderPdf,
}));

vi.mock("../../src/modules/cost/cost.service", () => ({
	getOrderSummary: mocks.costGetOrderSummary,
}));

vi.mock("../../src/modules/purchase-order/purchase-order.service", () => ({
	assertProposalReadyForWorkOrder: mocks.assertProposalReadyForWorkOrder,
}));

const closureMocks = vi.hoisted(() => ({
	assertAdministrativeClosureReady: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/modules/order/order-closure.service", () => ({
	assertAdministrativeClosureReady: closureMocks.assertAdministrativeClosureReady,
}));

import * as OrderCrudService from "../../src/modules/order/order-crud.service";
import * as OrderStateService from "../../src/modules/order/order-state.service";

const ORDER_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const CREATED_BY = "507f1f77bcf86cd799439013";

function buildMockOrder(overrides: Record<string, unknown> = {}) {
	const save = vi.fn().mockResolvedValue(undefined);

	return {
		_id: { toString: () => ORDER_ID },
		code: "OT-202604-0001",
		type: "corrective",
		priority: "medium",
		description: "Replace pump seal",
		assetId: "AST-001",
		assetName: "Pump A",
		location: "Plant 1",
		materials: [],
		status: "open",
		invoiceReady: false,
		reportGenerated: false,
		createdBy: { toString: () => CREATED_BY },
		observations: undefined,
		assignedTo: undefined,
		assignedToName: undefined,
		startedAt: undefined,
		completedAt: undefined,
		save,
		...overrides,
	};
}

function buildMockUser(overrides: Record<string, unknown> = {}) {
	return {
		_id: USER_ID,
		name: "Ana Técnico",
		email: "ana@cermont.com",
		role: "tecnico",
		isActive: true,
		...overrides,
	};
}

describe("Order services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		closureMocks.assertAdministrativeClosureReady.mockReset();
		closureMocks.assertAdministrativeClosureReady.mockResolvedValue(undefined);
		mocks.generateOrderCode.mockResolvedValue("OT-202604-0001");
		mocks.formatOrderResponse.mockImplementation((order: unknown) => order);
		mocks.getDefaultKitForOrderType.mockReturnValue(null);
		mocks.createChecklist.mockResolvedValue({} as never);
		mocks.generateOrderPdf.mockResolvedValue(Buffer.from("pdf"));
		mocks.assertProposalReadyForWorkOrder.mockResolvedValue(undefined);
		mocks.workReportFindOne.mockReturnValue({
			lean: vi.fn().mockResolvedValue(null),
		});
		mocks.costGetOrderSummary.mockResolvedValue({
			orderId: ORDER_ID,
			totalEstimated: 1000,
			totalActual: 1000,
			totalTax: 0,
			variance: 0,
			variancePercent: 0,
			hasCosts: true,
			byCategory: [],
		});
		mocks.orderConstructor.mockImplementation(function (
			this: unknown,
			doc: Record<string, unknown>,
		) {
			return buildMockOrder(doc) as never;
		});
	});

	describe("order-crud.service", () => {
		it("createOrder crea una orden con estado open", async () => {
			const order = buildMockOrder();
			mocks.orderConstructor.mockImplementationOnce(function (
				this: unknown,
				_doc: Record<string, unknown>,
			) {
				Object.assign(this, order);
				return order;
			} as never);

			const result = await OrderCrudService.createOrder(
				{
					type: "corrective" as never,
					priority: "high" as never,
					description: "Fix motor",
					assetId: "AST-100",
					assetName: "Motor 1",
					location: "Warehouse",
				},
				CREATED_BY,
			);

			expect(mocks.generateOrderCode).toHaveBeenCalledTimes(1);
			expect(mocks.orderConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					code: "OT-202604-0001",
					status: "open",
					createdBy: CREATED_BY,
				}),
			);
			expect(order.save).toHaveBeenCalledTimes(1);
			expect(mocks.logAudit).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "ORDER_CREATED",
					entity: "Order",
					userId: CREATED_BY,
				}),
			);
			expect(mocks.createChecklist).toHaveBeenCalledWith(ORDER_ID, CREATED_BY);
			expect(result).toBe(order);
		});

		it("createOrder usa kitTemplate cuando no hay materiales explícitos", async () => {
			const order = buildMockOrder();
			mocks.orderConstructor.mockImplementationOnce(function (
				this: unknown,
				_doc: Record<string, unknown>,
			) {
				Object.assign(this, order);
				return order;
			} as never);
			mocks.getDefaultKitForOrderType.mockReturnValueOnce({
				materials: [{ name: "Seal", quantity: 1, unit: "u" }],
			});

			await OrderCrudService.createOrder(
				{
					type: "corrective" as never,
					priority: "medium" as never,
					description: "Fix pump",
					assetId: "AST-200",
					assetName: "Pump B",
					location: "Zone 2",
					kitTemplate: "default",
				},
				CREATED_BY,
			);

			expect(mocks.orderConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					materials: [{ name: "Seal", quantity: 1, unit: "u" }],
				}),
			);
			expect(mocks.createChecklist).toHaveBeenCalledWith(ORDER_ID, CREATED_BY, {
				kitTemplate: "default",
			});
		});

		it("createOrder exige validación comercial cuando recibe proposalId", async () => {
			const order = buildMockOrder();
			mocks.orderConstructor.mockImplementationOnce(function (
				this: unknown,
				_doc: Record<string, unknown>,
			) {
				Object.assign(this, order);
				return order;
			} as never);

			await OrderCrudService.createOrder(
				{
					type: "corrective" as never,
					priority: "medium" as never,
					description: "Fix pump",
					assetId: "AST-200",
					assetName: "Pump B",
					location: "Zone 2",
					proposalId: "proposal-id",
				},
				CREATED_BY,
			);

			expect(mocks.assertProposalReadyForWorkOrder).toHaveBeenCalledWith("proposal-id");
			expect(mocks.orderConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					proposalId: "proposal-id",
				}),
			);
		});

		it("createOrder detiene la creación si la propuesta no tiene PO aprobada", async () => {
			mocks.assertProposalReadyForWorkOrder.mockRejectedValueOnce(
				new BadRequestError("Purchase order is required", "PURCHASE_ORDER_NOT_APPROVED"),
			);

			await expect(
				OrderCrudService.createOrder(
					{
						type: "corrective" as never,
						priority: "medium" as never,
						description: "Fix pump",
						assetId: "AST-200",
						assetName: "Pump B",
						location: "Zone 2",
						proposalId: "proposal-id",
					},
					CREATED_BY,
				),
			).rejects.toThrow("Purchase order is required");

			expect(mocks.orderConstructor).not.toHaveBeenCalled();
		});

		it("getOrderById retorna la orden encontrada", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderById(ORDER_ID);

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(result).toBe(order);
		});

		it("getOrderById lanza NotFoundError cuando no existe", async () => {
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(null) });

			await expect(OrderCrudService.getOrderById(ORDER_ID)).rejects.toThrow(NotFoundError);
		});

		it("getOrderByIdWithAuth permite acceso al propietario", async () => {
			const order = buildMockOrder({ createdBy: { toString: () => USER_ID } });
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderByIdWithAuth(ORDER_ID, buildMockUser());

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(result).toBe(order);
		});

		it("getOrderByIdWithAuth permite acceso a gerente", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderByIdWithAuth(
				ORDER_ID,
				buildMockUser({ role: "gerente" }),
			);

			expect(result).toBe(order);
		});

		it("getOrderByIdWithAuth lanza ForbiddenError cuando no hay acceso", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			await expect(
				OrderCrudService.getOrderByIdWithAuth(ORDER_ID, buildMockUser()),
			).rejects.toThrow(ForbiddenError);
		});

		it("listOrders aplica filtros y pagina resultados", async () => {
			const orders = [buildMockOrder({ _id: { toString: () => "1" } })];
			const chain = {
				skip: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				sort: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValueOnce(orders),
			};

			mocks.orderCountDocuments.mockResolvedValueOnce(1);
			mocks.orderFind.mockReturnValueOnce(chain);

			const result = await OrderCrudService.listOrders(2, 10, {
				search: "Pump 1",
				status: "open" as never,
				priority: "high" as never,
				assignedTo: USER_ID,
				role: "tecnico",
			});

			expect(mocks.orderCountDocuments).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "open",
					priority: "high",
					assignedTo: USER_ID,
					$or: expect.any(Array),
				}),
			);
			expect(chain.skip).toHaveBeenCalledWith(10);
			expect(chain.limit).toHaveBeenCalledWith(10);
			expect(result).toMatchObject({
				total: 1,
				page: 2,
				limit: 10,
				pages: 1,
				orders,
			});
		});

		it("updateOrder modifica campos editables", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockResolvedValueOnce(order);

			const result = await OrderCrudService.updateOrder(ORDER_ID, {
				description: "New description",
				location: "New location",
				priority: "low" as never,
				observations: "Updated note",
			});

			expect(order.description).toBe("New description");
			expect(order.location).toBe("New location");
			expect(order.priority).toBe("low");
			expect(order.observations).toBe("Updated note");
			expect(order.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(order);
		});

		it("updateOrder lanza NotFoundError cuando no existe", async () => {
			mocks.orderFindById.mockResolvedValueOnce(null);

			await expect(OrderCrudService.updateOrder(ORDER_ID, {})).rejects.toThrow(NotFoundError);
		});

		it("getOrderByIdWithAuth retorna orden cuando actor es dueño", async () => {
			const order = buildMockOrder({ createdBy: { toString: () => USER_ID } });
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderByIdWithAuth(ORDER_ID, {
				_id: USER_ID,
				role: "operador",
			});

			expect(mocks.orderFindById).toHaveBeenCalledWith(ORDER_ID);
			expect(result).toBe(order);
		});

		it("getOrderByIdWithAuth retorna orden cuando actor es asignado", async () => {
			const order = buildMockOrder({ assignedTo: { toString: () => USER_ID } });
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderByIdWithAuth(ORDER_ID, {
				_id: USER_ID,
				role: "tecnico",
			});

			expect(result).toBe(order);
		});

		it("getOrderByIdWithAuth retorna orden cuando actor es admin", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			const result = await OrderCrudService.getOrderByIdWithAuth(ORDER_ID, {
				_id: "999",
				role: "gerente", // ADMIN_ROLES includes 'gerente'
			});

			expect(result).toBe(order);
		});

		it("getOrderByIdWithAuth lanza ForbiddenError cuando actor no tiene acceso", async () => {
			const order = buildMockOrder(); // createdBy = CREATED_BY, assignedTo = undefined
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(order) });

			await expect(
				OrderCrudService.getOrderByIdWithAuth(ORDER_ID, {
					_id: USER_ID, // diferente a createdBy y assignedTo
					role: "operador", // no es admin
				}),
			).rejects.toThrow("You do not have access to this order");
		});

		it("getOrderByIdWithAuth lanza NotFoundError cuando no existe", async () => {
			mocks.orderFindById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce(null) });

			await expect(
				OrderCrudService.getOrderByIdWithAuth(ORDER_ID, {
					_id: USER_ID,
					role: "tecnico",
				}),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("order-state.service", () => {
		it("transiciona open → assigned → in_progress → completed → closed", async () => {
			const order = buildMockOrder();
			const user = buildMockUser();

			mocks.orderFindById
				.mockResolvedValueOnce(order)
				.mockResolvedValueOnce(order)
				.mockResolvedValueOnce(order)
				.mockResolvedValueOnce(order);
			mocks.userFindById.mockReturnValue({
				lean: vi.fn().mockResolvedValue(user),
			});

			await OrderStateService.updateOrderStatus(
				ORDER_ID,
				"assigned" as never,
				"gerente",
				CREATED_BY,
			);
			expect(order.status).toBe("assigned");

			await OrderStateService.updateOrderStatus(
				ORDER_ID,
				"in_progress" as never,
				"tecnico",
				CREATED_BY,
			);
			expect(order.status).toBe("in_progress");
			expect(order.startedAt).toBeInstanceOf(Date);

			await OrderStateService.updateOrderStatus(
				ORDER_ID,
				"completed" as never,
				"tecnico",
				CREATED_BY,
			);
			expect(order.status).toBe("completed");
			expect(order.completedAt).toBeInstanceOf(Date);

			await OrderStateService.updateOrderStatus(ORDER_ID, "closed" as never, "gerente", CREATED_BY);
			expect(order.status).toBe("closed");
			expect(order.invoiceReady).toBe(true);
			expect(order.save).toHaveBeenCalledTimes(4);
		});

		it("bloquea cierre cuando el cierre administrativo 8-14 está incompleto", async () => {
			const order = buildMockOrder({ status: "completed" });
			mocks.orderFindById.mockResolvedValueOnce(order);
			mocks.costGetOrderSummary.mockResolvedValueOnce({
				orderId: ORDER_ID,
				totalEstimated: 1000,
				totalActual: 1000,
				totalTax: 0,
				variance: 0,
				variancePercent: 0,
				hasCosts: true,
				byCategory: [],
			});
			closureMocks.assertAdministrativeClosureReady.mockRejectedValueOnce(
				new UnprocessableError(
					"No se puede cerrar la orden: faltan requisitos administrativos (ses_filing).",
					"ADMINISTRATIVE_CLOSURE_INCOMPLETE",
				),
			);

			await expect(
				OrderStateService.updateOrderStatus(ORDER_ID, "closed" as never, "gerente", CREATED_BY),
			).rejects.toThrow("faltan requisitos administrativos");

			expect(order.status).toBe("completed");
		});

		it("lanza UnprocessableError al cerrar una orden sin costos registrados", async () => {
			const order = buildMockOrder({ status: "completed" });
			mocks.orderFindById.mockResolvedValueOnce(order);
			mocks.costGetOrderSummary.mockResolvedValueOnce({
				orderId: ORDER_ID,
				totalEstimated: 0,
				totalActual: 0,
				totalTax: 0,
				variance: 0,
				variancePercent: null,
				hasCosts: false,
				byCategory: [],
			});

			await expect(
				OrderStateService.updateOrderStatus(ORDER_ID, "closed" as never, "gerente", CREATED_BY),
			).rejects.toThrow("The order cannot be closed until at least one cost is recorded");

			expect(order.status).toBe("completed");
			expect(order.invoiceReady).toBe(false);
		});

		it("lanza UnprocessableError al cerrar una orden con variance negativa", async () => {
			const order = buildMockOrder({ status: "completed" });
			mocks.orderFindById.mockResolvedValueOnce(order);
			mocks.costGetOrderSummary.mockResolvedValueOnce({
				orderId: ORDER_ID,
				totalEstimated: 1000,
				totalActual: 900,
				totalTax: 0,
				variance: -100,
				variancePercent: -0.1,
				hasCosts: true,
				byCategory: [],
			});

			await expect(
				OrderStateService.updateOrderStatus(ORDER_ID, "closed" as never, "gerente", CREATED_BY),
			).rejects.toThrow(
				"The order cannot be closed with a negative cost variance without approval",
			);

			expect(order.status).toBe("completed");
			expect(order.invoiceReady).toBe(false);
		});

		it("lanza UnprocessableError al marcar listo para facturación sin informe aprobado", async () => {
			const order = buildMockOrder({ status: "completed" });
			mocks.orderFindById.mockResolvedValueOnce(order);
			mocks.costGetOrderSummary.mockResolvedValueOnce({
				orderId: ORDER_ID,
				totalEstimated: 1000,
				totalActual: 1000,
				totalTax: 0,
				variance: 0,
				variancePercent: 0,
				hasCosts: true,
				byCategory: [],
			});
			mocks.workReportFindOne.mockReturnValueOnce({
				lean: vi.fn().mockResolvedValue(null),
			});

			await expect(
				OrderStateService.updateOrderStatus(
					ORDER_ID,
					"ready_for_invoicing" as never,
					"gerente",
					CREATED_BY,
				),
			).rejects.toThrow(
				"The order cannot be marked ready for invoicing until a work report is approved",
			);

			expect(order.status).toBe("completed");
			expect(order.invoiceReady).toBe(false);
		});

		it("assignOrder asigna usuario tecnico y mueve open a assigned", async () => {
			const order = buildMockOrder();
			const user = buildMockUser();

			mocks.orderFindById.mockResolvedValueOnce(order);
			mocks.userFindById.mockReturnValueOnce({
				lean: vi.fn().mockResolvedValue(user),
			});

			const result = await OrderStateService.assignOrder(ORDER_ID, USER_ID);

			expect(order.assignedTo).toBe(user._id);
			expect(order.assignedToName).toBe(user.name);
			expect(order.status).toBe("assigned");
			expect(result).toBe(order);
		});

		it("deleteOrder marca la orden como cancelled", async () => {
			const order = buildMockOrder();
			mocks.orderFindById.mockResolvedValueOnce(order);

			const result = await OrderStateService.deleteOrder(ORDER_ID);

			expect(order.status).toBe("cancelled");
			expect(order.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(order);
		});

		it("lanza BadRequestError para transicion inválida", async () => {
			const order = buildMockOrder({ status: "open" });
			mocks.orderFindById.mockResolvedValueOnce(order);

			await expect(
				OrderStateService.updateOrderStatus(ORDER_ID, "completed" as never, "gerente", CREATED_BY),
			).rejects.toThrow(BadRequestError);
		});

		it("lanza UnauthorizedError para rol no permitido", async () => {
			const order = buildMockOrder({ status: "open" });
			mocks.orderFindById.mockResolvedValueOnce(order);

			await expect(
				OrderStateService.updateOrderStatus(ORDER_ID, "assigned" as never, "tecnico", CREATED_BY),
			).rejects.toThrow(UnauthorizedError);
		});

		it("lanza NotFoundError cuando la orden no existe", async () => {
			mocks.orderFindById.mockResolvedValueOnce(null);

			await expect(OrderStateService.deleteOrder(ORDER_ID)).rejects.toThrow(NotFoundError);
		});
	});
});
