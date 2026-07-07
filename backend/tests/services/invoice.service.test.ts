import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	updateMany: vi.fn(),
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: {
		create: mocks.create,
		updateMany: mocks.updateMany,
	},
}));

describe("Invoice Service", () => {
	const validId = new Types.ObjectId().toString();

	it("should create invoice from SES", async () => {
		mocks.create.mockResolvedValue({
			toObject: () => ({ _id: validId, status: "draft", totalAmountCOP: 10000000 }),
		});

		const service = await import("../../src/modules/invoice/invoice.service");
		const actor = new Types.ObjectId().toString();
		const result = await service.createInvoiceFromSES(
			{
				serviceEntrySheetId: validId,
				orderId: validId,
				invoiceNumber: "INV-001",
				totalAmountCOP: 10000000,
				dueDate: new Date().toISOString(),
			},
			actor,
		);

		expect(result).toBeDefined();
		expect(mocks.create).toHaveBeenCalled();
	});

	it("should calculate aging", async () => {
		mocks.updateMany.mockResolvedValue({ modifiedCount: 3 });

		const service = await import("../../src/modules/invoice/invoice.service");
		await service.calculateInvoiceAging();

		expect(mocks.updateMany).toHaveBeenCalled();
	});
});
