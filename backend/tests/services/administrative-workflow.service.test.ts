import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UnprocessableError } from "../../src/common/errors/AppError";

const mocks = vi.hoisted(() => ({
	invoiceFindById: vi.fn(),
	paymentFindOne: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	DeliveryRecord: { findById: vi.fn() },
	ExecutionSession: { findById: vi.fn(), findOne: vi.fn() },
	Invoice: { findById: mocks.invoiceFindById },
	Order: { findById: vi.fn() },
	Payment: Object.assign(vi.fn(), {
		findById: vi.fn(),
		findOne: mocks.paymentFindOne,
	}),
	ServiceCase: { findByIdAndUpdate: vi.fn() },
	ServiceEntrySheet: { findById: vi.fn() },
	TechnicalReport: { findById: vi.fn() },
}));

import { registerPaymentForInvoice } from "../../src/modules/order/administrative-workflow.service";

const INVOICE_ID = "507f1f77bcf86cd799439071";
const SES_ID = "507f1f77bcf86cd799439072";
const ORDER_ID = "507f1f77bcf86cd799439073";
const CLIENT_ID = "507f1f77bcf86cd799439074";
const USER_ID = "507f1f77bcf86cd799439075";

function buildInvoice(status: string) {
	return {
		_id: new Types.ObjectId(INVOICE_ID),
		serviceEntrySheetId: new Types.ObjectId(SES_ID),
		workOrderId: new Types.ObjectId(ORDER_ID),
		serviceCaseId: undefined,
		clientId: new Types.ObjectId(CLIENT_ID),
		totalAmount: 1500000,
		currency: "COP",
		status,
		save: vi.fn().mockResolvedValue(undefined),
	};
}

describe("AdministrativeWorkflowService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.paymentFindOne.mockResolvedValue(null);
	});

	it("blocks payment registration when the invoice is still draft", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("draft"));

		await expect(
			registerPaymentForInvoice(
				INVOICE_ID,
				{
					paymentReference: "PAY-2026-0001",
					paidAt: "2026-05-23T12:00:00.000Z",
					amount: 1500000,
					paymentMethod: "bank_transfer",
				},
				{ _id: USER_ID, role: "administrativo" },
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "PAYMENT_INVOICE_NOT_APPROVED",
		});
	});
});
