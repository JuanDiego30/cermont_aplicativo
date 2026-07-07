import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	paymentFindById: vi.fn(),
	paymentCreate: vi.fn(),
	paymentFindOne: vi.fn(),
	invoiceFindByIdAndUpdate: vi.fn(),
	invoiceFindById: vi.fn(),
}));

vi.mock("../../src/models/Payment", () => ({
	Payment: {
		findById: mocks.paymentFindById,
		create: mocks.paymentCreate,
		findOne: mocks.paymentFindOne,
	},
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: {
		findByIdAndUpdate: mocks.invoiceFindByIdAndUpdate,
		findById: mocks.invoiceFindById,
	},
}));

describe("Payment Service", () => {
	const paymentId = new Types.ObjectId().toString();
	const invoiceId = new Types.ObjectId().toString();

	it("should register payment for invoice", async () => {
		mocks.invoiceFindById.mockResolvedValue({
			_id: invoiceId,
			workOrderId: new Types.ObjectId(),
			serviceEntrySheetId: new Types.ObjectId(),
			clientId: new Types.ObjectId(),
		});
		mocks.paymentCreate.mockResolvedValue({
			toObject: () => ({ _id: paymentId, invoiceId, amount: 5000000, status: "recorded" }),
		});

		const service = await import("../../src/modules/payment/payment.service");
		const actor = new Types.ObjectId().toString();
		const result = await service.registerPaymentForInvoice(
			{
				invoiceId,
				amountCOP: 5000000,
				paymentMethod: "bank_transfer",
				paidAt: new Date().toISOString(),
			},
			actor,
		);

		expect(result).toBeDefined();
		expect(mocks.paymentCreate).toHaveBeenCalled();
	});

	it("should reconcile payment", async () => {
		mocks.paymentFindById.mockResolvedValue({
			_id: new Types.ObjectId(),
			status: "completed",
			save: vi.fn().mockResolvedValue({ toObject: () => ({ status: "reconciled" }) }),
		});

		const service = await import("../../src/modules/payment/payment.service");
		const actor = new Types.ObjectId().toString();
		await service.reconcilePayment(invoiceId, actor);

		expect(mocks.paymentFindById).toHaveBeenCalled();
	});
});
