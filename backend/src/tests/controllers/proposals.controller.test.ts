/**
 * Proposals Controller Tests
 *
 * Tests HTTP layer for proposal management.
 * Mocks service layer to avoid MongoDB dependency.
 */
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateProposalService = vi.fn();
const mockFindAllProposals = vi.fn();
const mockFindProposalById = vi.fn();
const mockApproveProposalService = vi.fn();
const mockRejectProposalService = vi.fn();
const mockConvertProposalToOrderService = vi.fn();

vi.mock("../../modules/proposal/proposal.service.js", () => ({
	createProposal: mockCreateProposalService,
	findAllProposals: mockFindAllProposals,
	findProposalById: mockFindProposalById,
	approveProposal: mockApproveProposalService,
	rejectProposal: mockRejectProposalService,
	convertProposalToOrder: mockConvertProposalToOrderService,
}));

const importController = async () => import("../../modules/proposal/proposal.controller.js");

const PROPOSAL_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";
const ORDER_ID = "507f1f77bcf86cd799439041";

function mockReq(overrides: Partial<Request> = {}): Request {
	return {
		query: {},
		params: {},
		body: {},
		user: { _id: USER_ID, role: "gerente", email: "admin@cermont.com" },
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

type ProposalRecordFixture = {
	_id: string;
	code: string;
	title: string;
	clientName: string;
	clientEmail: string;
	status: string;
	validUntil: Date;
	items: {
		description: string;
		unit: string;
		quantity: number;
		unitCost: number;
		total: number;
	}[];
	subtotal: number;
	taxRate: number;
	total: number;
	notes: string;
	createdBy: string;
	generatedOrders: string[];
	approvedBy?: string;
	createdAt: Date;
	updatedAt: Date;
};

function buildProposalRecord(
	overrides: Partial<ProposalRecordFixture> = {},
): ProposalRecordFixture {
	const proposal: ProposalRecordFixture = {
		_id: PROPOSAL_ID,
		code: "PROP-2026-0001",
		title: "Mantenimiento preventivo",
		clientName: "Cliente Cermont",
		clientEmail: "cliente@cermont.com",
		status: "draft",
		validUntil: new Date("2026-12-31T00:00:00.000Z"),
		items: [
			{
				description: "Mantenimiento eléctrico",
				unit: "lote",
				quantity: 1,
				unitCost: 1000000,
				total: 1000000,
			},
		],
		subtotal: 1000000,
		taxRate: 0.19,
		total: 1190000,
		notes: "Incluye mano de obra y materiales.",
		createdBy: USER_ID,
		generatedOrders: [],
		createdAt: new Date("2026-06-01T10:00:00.000Z"),
		updatedAt: new Date("2026-06-01T10:00:00.000Z"),
	};
	return { ...proposal, ...overrides };
}

describe("ProposalsController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAllProposals", () => {
		it("should return paginated proposals", async () => {
			const proposals = [buildProposalRecord()];
			mockFindAllProposals.mockResolvedValue({
				data: proposals,
				total: 1,
			});

			const req = mockReq({ query: { page: "1", limit: "20" } });
			const res = mockRes();
			const { getAllProposals } = await importController();

			await getAllProposals(req, res);

			expect(mockFindAllProposals).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("createProposal", () => {
		it("should create a proposal successfully", async () => {
			const proposal = buildProposalRecord({ title: "Nueva propuesta Cermont" });
			mockCreateProposalService.mockResolvedValue(proposal);

			const req = mockReq({
				body: {
					title: "Nueva propuesta Cermont",
					clientName: "Cliente Cermont",
					clientEmail: "cliente@cermont.com",
					items: [
						{
							description: "Mantenimiento eléctrico",
							unit: "lote",
							quantity: 1,
							unitCost: 1000000,
						},
					],
					validUntil: "2026-12-31T00:00:00.000Z",
					notes: "Incluye mano de obra y materiales.",
				},
			});
			const res = mockRes();
			const { createProposal } = await importController();

			await createProposal(req, res);

			expect(mockCreateProposalService).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(201);
		});
	});

	describe("approveProposal", () => {
		it("should approve a proposal", async () => {
			const approved = buildProposalRecord({ status: "approved", approvedBy: USER_ID });
			mockApproveProposalService.mockResolvedValue(approved);

			const req = mockReq({
				params: { id: PROPOSAL_ID },
				body: { poNumber: "PO-001" },
			});
			const res = mockRes();
			const { approveProposal } = await importController();

			await approveProposal(req, res);

			expect(mockApproveProposalService).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
		});
	});

	describe("convertProposalToOrder", () => {
		it("should convert proposal to order", async () => {
			const order = { _id: ORDER_ID, priority: "high" };
			const proposal = buildProposalRecord({ status: "approved", generatedOrders: [ORDER_ID] });
			mockConvertProposalToOrderService.mockResolvedValue(order);
			mockFindProposalById.mockResolvedValue(proposal);

			const req = mockReq({
				params: { id: PROPOSAL_ID },
				body: {
					type: "maintenance",
					priority: "high",
					assetId: "asset-001",
					assetName: "Sistema eléctrico",
					location: "Campo Caño Limón",
					description: "Ejecución derivada de propuesta aprobada.",
				},
			});
			const res = mockRes();
			const { convertProposalToOrder } = await importController();

			await convertProposalToOrder(req, res);

			expect(mockConvertProposalToOrderService).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ order }),
				}),
			);
		});
	});
});
