/**
 * Safety Analysis (AST) Service Tests
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	astCreate: vi.fn(),
	astFind: vi.fn(),
	astFindById: vi.fn(),
	astFindByIdAndUpdate: vi.fn(),
	astCountDocuments: vi.fn(),
}));

vi.mock("../../src/models/SafetyAnalysis", () => ({
	SafetyAnalysisModel: {
		create: mocks.astCreate,
		find: mocks.astFind,
		findById: mocks.astFindById,
		findByIdAndUpdate: mocks.astFindByIdAndUpdate,
		countDocuments: mocks.astCountDocuments,
	},
}));

import * as SafetyAnalysisService from "../../src/modules/safety-analysis/safety-analysis.service";

const AST_ID = "507f1f77bcf86cd799439011";
const ORDER_ID = "507f1f77bcf86cd799439021";
const USER_ID = "507f1f77bcf86cd799439031";

function buildAST(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId(AST_ID),
		orderId: new Types.ObjectId(ORDER_ID),
		status: "draft",
		workDescription: "Mantenimiento CCTV torre",
		location: "Caño Limón",
		crewLeader: "Juan Técnico",
		steps: [],
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("SafetyAnalysisService", () => {
	describe("createAST", () => {
		it("creates an AST in draft status", async () => {
			const ast = buildAST();
			mocks.astCreate.mockResolvedValue(ast);

			const result = await SafetyAnalysisService.createAST(
				{
					orderId: ORDER_ID,
					workDescription: "Mantenimiento CCTV torre",
					location: "Caño Limón",
					date: new Date().toISOString(),
					crewLeader: "Juan Técnico",
					crewMembers: [],
					steps: [],
					ppeRequired: [],
				},
				USER_ID,
			);

			expect(result).toBe(ast);
			expect(mocks.astCreate).toHaveBeenCalledWith(
				expect.objectContaining({ orderId: ORDER_ID, createdBy: USER_ID }),
			);
		});
	});

	describe("transitionAST", () => {
		it("allows draft → reviewed", async () => {
			mocks.astFindById.mockResolvedValue(buildAST({ status: "draft" }));
			mocks.astFindByIdAndUpdate.mockResolvedValue(buildAST({ status: "reviewed" }));

			const result = await SafetyAnalysisService.transitionAST(AST_ID, "reviewed", USER_ID);

			expect(result.status).toBe("reviewed");
		});

		it("rejects draft → completed with INVALID_FSM_TRANSITION", async () => {
			mocks.astFindById.mockResolvedValue(buildAST({ status: "draft" }));

			await expect(
				SafetyAnalysisService.transitionAST(AST_ID, "completed", USER_ID),
			).rejects.toMatchObject({ code: "INVALID_FSM_TRANSITION" });
		});
	});

	describe("updateAST", () => {
		it("rejects editing a non-draft AST", async () => {
			mocks.astFindById.mockResolvedValue(buildAST({ status: "approved" }));

			await expect(
				SafetyAnalysisService.updateAST(AST_ID, { location: "Otra" }, USER_ID),
			).rejects.toMatchObject({ code: "AST_NOT_EDITABLE" });
		});
	});

	describe("signAST", () => {
		it("rejects review signature before elaboration signature", async () => {
			mocks.astFindById.mockResolvedValue(buildAST());

			await expect(
				SafetyAnalysisService.signAST(
					AST_ID,
					{ role: "reviewed", signedByName: "Supervisor X" },
					USER_ID,
				),
			).rejects.toMatchObject({ code: "AST_SIGNATURE_ORDER_VIOLATION" });
		});

		it("stores elaboration signature with metadata", async () => {
			mocks.astFindById.mockResolvedValue(buildAST());
			mocks.astFindByIdAndUpdate.mockResolvedValue(
				buildAST({ elaboratedBy: { signedByName: "Juan Técnico" } }),
			);

			const result = await SafetyAnalysisService.signAST(
				AST_ID,
				{ role: "elaborated", signedByName: "Juan Técnico" },
				USER_ID,
			);

			expect(result.elaboratedBy?.signedByName).toBe("Juan Técnico");
			expect(mocks.astFindByIdAndUpdate).toHaveBeenCalledWith(
				AST_ID,
				expect.objectContaining({
					elaboratedBy: expect.objectContaining({
						signatureType: "technician",
						confirmed: true,
					}),
				}),
				{ new: true },
			);
		});
	});
});
