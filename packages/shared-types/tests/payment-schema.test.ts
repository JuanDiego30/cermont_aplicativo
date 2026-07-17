import { describe, expect, it } from "vitest";
import { PaymentSchema, ReconcilePaymentSchema } from "../src/schemas/payment.schema";

const OBJECT_ID = "507f1f77bcf86cd799439011";
const TIMESTAMP = "2026-07-13T12:00:00.000Z";

describe("Payment contracts", () => {
	it("keeps reconciliation notes in both command and response contracts", () => {
		const command = ReconcilePaymentSchema.parse({ notes: "Conciliado con extracto" });
		const payment = PaymentSchema.parse({
			_id: OBJECT_ID,
			invoiceId: OBJECT_ID,
			workOrderId: OBJECT_ID,
			serviceEntrySheetId: OBJECT_ID,
			clientId: OBJECT_ID,
			paymentReference: "PAY-2026-0001",
			paidAt: TIMESTAMP,
			amount: 1500000,
			currency: "COP",
			paymentMethod: "bank_transfer",
			recordedBy: OBJECT_ID,
			recordedAt: TIMESTAMP,
			reconciledBy: OBJECT_ID,
			reconciledAt: TIMESTAMP,
			reconciliationNotes: command.notes,
			commandHistory: [],
			status: "reconciled",
			createdAt: TIMESTAMP,
			updatedAt: TIMESTAMP,
		});

		expect(payment.reconciliationNotes).toBe("Conciliado con extracto");
	});
});
