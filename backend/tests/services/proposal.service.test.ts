import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, ForbiddenError } from "../../src/common/errors/AppError";
import {
	calculateProposalTotals,
	convertProposalToOrder,
	createProposal,
	findAllProposals,
	findProposalById,
	updateProposalStatus,
} from "../../src/modules/proposal/proposal.service";
import { mockQueryChain } from "../test-utils";

type CounterMock = { inc: ReturnType<typeof vi.fn> };

type ProposalModelMock = ReturnType<typeof vi.fn> & {
	findById: ReturnType<typeof vi.fn>;
	find: ReturnType<typeof vi.fn>;
	countDocuments: ReturnType<typeof vi.fn>;
};

const { loggerInfoMock, createOrderMock, proposalModelMock, counterMock } = vi.hoisted(() => {
	const proposalModel = Object.assign(vi.fn(), {
		findById: vi.fn(),
		find: vi.fn(),
		countDocuments: vi.fn(),
	}) as ProposalModelMock;

	return {
		loggerInfoMock: vi.fn(),
		createOrderMock: vi.fn(),
		proposalModelMock: proposalModel,
		counterMock: { inc: vi.fn() } as CounterMock,
	};
});

vi.mock("../../src/models", () => ({
	Proposal: proposalModelMock,
	Counter: counterMock,
	User: {
		find: vi.fn().mockResolvedValue([]),
	},
}));

vi.mock("../../src/modules/order/order.service", () => ({
	createOrder: createOrderMock,
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: () => ({ info: loggerInfoMock }),
}));

function buildProposalDoc(overrides: Record<string, unknown> = {}) {
	const doc: Record<string, unknown> = {
		_id: "proposal-id",
		code: "PROP-2026-0001",
		title: "Mantenimiento preventivo",
		clientName: "Cliente S.A.S.",
		clientEmail: "cliente@empresa.com",
		items: [
			{
				description: "Filtro de aire",
				unit: "und",
				quantity: 2,
				unitCost: 15000,
			},
		],
		subtotal: 30000,
		taxRate: 0.19,
		total: 35700,
		validUntil: new Date("2026-12-31T00:00:00.000Z"),
		notes: "Incluye mano de obra",
		status: "draft",
		createdBy: "user-id",
		approvedBy: undefined,
		approvedAt: undefined,
		generatedOrders: [],
		save: vi.fn().mockResolvedValue(undefined),
		populate: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};

	return doc;
}

function buildQuery(result: unknown) {
	return mockQueryChain(result);
}

describe("ProposalService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	describe("create()", () => {
		it("calculates line totals and summary values on the server", () => {
			expect(
				calculateProposalTotals([
					{ description: "A", unit: "und", quantity: 2, unitCost: 10_000 },
					{ description: "B", unit: "und", quantity: 3, unitCost: 5_000 },
				]),
			).toEqual({
				items: [
					{ description: "A", unit: "und", quantity: 2, unitCost: 10_000, total: 20_000 },
					{ description: "B", unit: "und", quantity: 3, unitCost: 5_000, total: 15_000 },
				],
				subtotal: 35_000,
				taxRate: 0.19,
				total: 41_650,
			});
		});

		it("crea una propuesta con totales y código secuencial", async () => {
			counterMock.inc.mockResolvedValue(7);
			proposalModelMock.mockImplementation(function (this: unknown, data: Record<string, unknown>) {
				return buildProposalDoc(data);
			});

			const result = await createProposal(
				{
					title: "Mantenimiento preventivo",
					clientName: "Cliente S.A.S.",
					clientEmail: "cliente@empresa.com",
					items: [{ description: "Filtro de aire", unit: "und", quantity: 2, unitCost: 15000 }],
					validUntil: new Date("2026-12-31T00:00:00.000Z"),
					notes: "Incluye mano de obra",
				},
				"user-id",
			);

			expect(counterMock.inc).toHaveBeenCalledWith("PROP-2026");
			expect(proposalModelMock).toHaveBeenCalledWith(
				expect.objectContaining({
					code: "PROP-2026-0007",
					subtotal: 30000,
					taxRate: 0.19,
					total: 35700,
					status: "draft",
					createdBy: "user-id",
					clientEmail: "cliente@empresa.com",
				}),
			);
			expect(result.save).toHaveBeenCalledTimes(1);
			expect(result.populate).toHaveBeenCalledWith(["createdBy", "approvedBy"]);
		});
	});

	describe("findById()", () => {
		it("retorna la propuesta cuando existe", async () => {
			const proposal = buildProposalDoc();
			const query = buildQuery(proposal);
			proposalModelMock.findById.mockReturnValue(query);

			const viewer = { _id: "user-id", email: "admin@cermont.com", role: "gerente" as const };
			const result = await findProposalById("proposal-id", viewer);

			expect(proposalModelMock.findById).toHaveBeenCalledWith("proposal-id");
			expect(result).toBe(proposal);
			expect(query.populate).toHaveBeenCalledWith("createdBy", "name email");
			expect(query.populate).toHaveBeenCalledWith("approvedBy", "name email");
			expect(query.populate).toHaveBeenCalledWith("generatedOrders");
		});

		it("permite a un cliente ver solo sus propuestas", async () => {
			const proposal = buildProposalDoc({ clientEmail: "cliente@empresa.com" });
			const query = buildQuery(proposal);
			proposalModelMock.findById.mockReturnValue(query);

			const viewer = { _id: "client-id", email: "cliente@empresa.com", role: "cliente" as const };
			const result = await findProposalById("proposal-id", viewer);

			expect(result).toBe(proposal);
		});

		it("bloquea a un cliente cuando la propuesta pertenece a otro correo", async () => {
			const proposal = buildProposalDoc({ clientEmail: "otro@empresa.com" });
			const query = buildQuery(proposal);
			proposalModelMock.findById.mockReturnValue(query);

			const viewer = { _id: "client-id", email: "cliente@empresa.com", role: "cliente" as const };

			await expect(findProposalById("proposal-id", viewer)).rejects.toBeInstanceOf(ForbiddenError);
		});

		it("lanza AppError si no existe", async () => {
			proposalModelMock.findById.mockReturnValue(buildQuery(null));

			const viewer = { _id: "user-id", email: "admin@cermont.com", role: "gerente" as const };
			await expect(findProposalById("missing", viewer)).rejects.toBeInstanceOf(AppError);
		});
	});

	describe("findAll()", () => {
		it("lista propuestas y total con filtros", async () => {
			const data = [buildProposalDoc({ _id: "proposal-1" })];
			const query = buildQuery(data);
			proposalModelMock.find.mockReturnValue(query);
			proposalModelMock.countDocuments.mockResolvedValue(1);

			const viewer = { _id: "user-id", email: "admin@cermont.com", role: "gerente" as const };
			const result = await findAllProposals({ status: "approved" }, viewer, 2, 10);

			expect(proposalModelMock.find).toHaveBeenCalledWith({ status: "approved" });
			expect(proposalModelMock.countDocuments).toHaveBeenCalledWith({ status: "approved" });
			expect(query.limit).toHaveBeenCalledWith(10);
			expect(query.skip).toHaveBeenCalledWith(10);
			expect(result).toEqual({ data, total: 1 });
		});

		it("limita a un cliente a sus propias propuestas", async () => {
			const data = [buildProposalDoc({ _id: "proposal-1", clientEmail: "cliente@empresa.com" })];
			const query = buildQuery(data);
			proposalModelMock.find.mockReturnValue(query);
			proposalModelMock.countDocuments.mockResolvedValue(1);

			const viewer = { _id: "client-id", email: "cliente@empresa.com", role: "cliente" as const };
			await findAllProposals({ status: "approved" }, viewer, 1, 25);

			expect(proposalModelMock.find).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "approved",
					clientEmail: expect.any(RegExp),
				}),
			);
			expect(proposalModelMock.countDocuments).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "approved",
					clientEmail: expect.any(RegExp),
				}),
			);
		});
	});

	describe("updateStatus()", () => {
		it("recalculates stale totals before approval", async () => {
			const proposal = buildProposalDoc({
				status: "sent",
				items: [
					{
						description: "Filtro",
						unit: "und",
						quantity: 2,
						unitCost: 15_000,
						total: 1,
					},
				],
				subtotal: 1,
				total: 1,
			});
			proposalModelMock.findById.mockResolvedValue(proposal);

			await updateProposalStatus("proposal-id", "approved", "approver-id");

			expect(proposal.items).toEqual([
				{
					description: "Filtro",
					unit: "und",
					quantity: 2,
					unitCost: 15_000,
					total: 30_000,
				},
			]);
			expect(proposal.subtotal).toBe(30_000);
			expect(proposal.total).toBe(35_700);
		});

		it("aprueba una propuesta y asigna aprobado por", async () => {
			const proposal = buildProposalDoc({
				status: "sent",
				approvedBy: undefined,
				approvedAt: undefined,
			});
			proposalModelMock.findById.mockResolvedValue(proposal);

			const result = await updateProposalStatus("proposal-id", "approved", "approver-id");

			expect(proposalModelMock.findById).toHaveBeenCalledWith("proposal-id");
			expect(proposal.status).toBe("approved");
			expect(proposal.approvedBy).toBe("approver-id");
			expect(proposal.approvedAt).toBeInstanceOf(Date);
			expect(proposal.save).toHaveBeenCalledTimes(1);
			expect(proposal.populate).toHaveBeenCalledWith(["createdBy", "approvedBy"]);
			expect(result).toBe(proposal);
		});

		it("lanza AppError si no existe", async () => {
			proposalModelMock.findById.mockResolvedValue(null);

			await expect(updateProposalStatus("missing", "rejected", "user-id")).rejects.toBeInstanceOf(
				AppError,
			);
		});
	});

	describe("convertToOrder()", () => {
		it("crea una orden con materiales derivados de la propuesta aprobada", async () => {
			const proposal = buildProposalDoc({
				status: "approved",
				items: [
					{ description: "Filtro de aire", unit: "und", quantity: 2, unitCost: 15000 },
					{ description: "Aceite", unit: "lt", quantity: 3, unitCost: 25000 },
				],
				generatedOrders: [],
			});
			const order = { _id: "order-id", code: "OT-001" };

			proposalModelMock.findById.mockResolvedValue(proposal);
			createOrderMock.mockResolvedValue(order);

			const result = await convertProposalToOrder(
				"proposal-id",
				{
					type: "maintenance",
					priority: "high",
					assetId: "asset-id",
					assetName: "Compresor",
					location: "Planta 1",
				},
				"user-id",
			);

			expect(createOrderMock).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "maintenance",
					priority: "high",
					description: "Mantenimiento preventivo",
					assetId: "asset-id",
					assetName: "Compresor",
					location: "Planta 1",
					proposalId: "proposal-id",
					materials: [
						{
							name: "Filtro de aire",
							quantity: 2,
							unit: "und",
							unitCost: 15000,
							delivered: false,
						},
						{
							name: "Aceite",
							quantity: 3,
							unit: "lt",
							unitCost: 25000,
							delivered: false,
						},
					],
				}),
				"user-id",
			);
			expect(proposal.generatedOrders).toContain("order-id");
			expect(proposal.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(order);
		});

		it("lanza AppError si la propuesta no está aprobada", async () => {
			proposalModelMock.findById.mockResolvedValue(buildProposalDoc({ status: "draft" }));

			await expect(
				convertProposalToOrder(
					"proposal-id",
					{
						type: "maintenance",
						priority: "high",
						assetId: "asset-id",
						assetName: "Compresor",
						location: "Planta 1",
					},
					"user-id",
				),
			).rejects.toBeInstanceOf(AppError);
			expect(createOrderMock).not.toHaveBeenCalled();
		});
	});
});
