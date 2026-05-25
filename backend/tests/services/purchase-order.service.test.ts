import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, UnprocessableError } from "../../src/common/errors/AppError";
import {
	assertProposalReadyForWorkOrder,
	registerPurchaseOrder,
	validatePurchaseOrder,
} from "../../src/modules/purchase-order/purchase-order.service";
import { mockQueryChain } from "../test-utils";

const mocks = vi.hoisted(() => ({
	proposalFindById: vi.fn(),
	purchaseOrderCreate: vi.fn(),
	purchaseOrderFindById: vi.fn(),
	purchaseOrderFindOne: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Proposal: {
		findById: mocks.proposalFindById,
	},
}));

vi.mock("../../src/models/PurchaseOrder", () => ({
	PurchaseOrderModel: {
		create: mocks.purchaseOrderCreate,
		findById: mocks.purchaseOrderFindById,
		findOne: mocks.purchaseOrderFindOne,
	},
}));

function buildPurchaseOrderDoc(overrides: Record<string, unknown> = {}) {
	return {
		_id: "po-id",
		proposalId: "proposal-id",
		poNumber: "PO-001",
		serviceAccount: "SA-001",
		billingAccount: "BA-001",
		approvedAmount: 100000,
		currency: "COP",
		receivedAt: new Date("2026-05-20T00:00:00.000Z"),
		attachments: [],
		status: "pending",
		createdBy: "user-id",
		createdAt: new Date("2026-05-20T00:00:00.000Z"),
		updatedAt: new Date("2026-05-20T00:00:00.000Z"),
		validatedBy: undefined,
		rejectionReason: undefined,
		save: vi.fn().mockResolvedValue(undefined),
		toJSON: vi.fn(function (this: Record<string, unknown>) {
			return {
				_id: this._id,
				proposalId: this.proposalId,
				poNumber: this.poNumber,
				serviceAccount: this.serviceAccount,
				billingAccount: this.billingAccount,
				approvedAmount: this.approvedAmount,
				currency: this.currency,
				receivedAt: this.receivedAt,
				attachments: this.attachments,
				status: this.status,
				createdBy: this.createdBy,
				createdAt: this.createdAt,
				updatedAt: this.updatedAt,
				validatedBy: this.validatedBy,
				rejectionReason: this.rejectionReason,
			};
		}),
		...overrides,
	};
}

describe("purchase-order.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("registerPurchaseOrder rejects proposals that are not approved", async () => {
		mocks.proposalFindById.mockReturnValueOnce(
			mockQueryChain({
				_id: "proposal-id",
				status: "sent",
			}),
		);

		await expect(
			registerPurchaseOrder(
				{
					proposalId: "proposal-id",
					poNumber: "PO-001",
					serviceAccount: "SA-001",
					billingAccount: "BA-001",
					approvedAmount: 100000,
					currency: "COP",
					receivedAt: "2026-05-20T00:00:00.000Z",
					attachments: [],
				},
				"user-id",
			),
		).rejects.toBeInstanceOf(UnprocessableError);

		expect(mocks.purchaseOrderCreate).not.toHaveBeenCalled();
	});

	it("registerPurchaseOrder prevents duplicate active purchase orders for a proposal", async () => {
		mocks.proposalFindById.mockReturnValueOnce(
			mockQueryChain({
				_id: "proposal-id",
				status: "approved",
			}),
		);
		mocks.purchaseOrderFindOne.mockReturnValueOnce(
			mockQueryChain({
				_id: "existing-po-id",
			}),
		);

		await expect(
			registerPurchaseOrder(
				{
					proposalId: "proposal-id",
					poNumber: "PO-001",
					serviceAccount: "SA-001",
					billingAccount: "BA-001",
					approvedAmount: 100000,
					currency: "COP",
					receivedAt: "2026-05-20T00:00:00.000Z",
					attachments: [],
				},
				"user-id",
			),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it("assertProposalReadyForWorkOrder rejects when there is no approved purchase order", async () => {
		mocks.proposalFindById.mockReturnValueOnce(
			mockQueryChain({
				_id: "proposal-id",
				status: "approved",
			}),
		);
		mocks.purchaseOrderFindOne.mockReturnValueOnce(mockQueryChain(null));

		await expect(assertProposalReadyForWorkOrder("proposal-id")).rejects.toBeInstanceOf(
			UnprocessableError,
		);
	});

	it("validatePurchaseOrder persists canonical approved status", async () => {
		const doc = buildPurchaseOrderDoc({ status: "pending" });
		mocks.purchaseOrderFindById.mockResolvedValueOnce(doc);
		const validatorId = "507f1f77bcf86cd799439099";

		const result = await validatePurchaseOrder("po-id", validatorId);

		expect(doc.status).toBe("approved");
		expect(doc.validatedBy).toEqual(expect.objectContaining({ toString: expect.any(Function) }));
		expect(doc.validatedBy?.toString()).toBe(validatorId);
		expect(doc.save).toHaveBeenCalledTimes(1);
		expect(result.status).toBe("approved");
	});
});
