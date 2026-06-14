import { describe, expect, it } from "vitest";
import { assertInvoiceMatchesServiceEntrySheet } from "../../src/services/invoice-integrity.service";

const baseSes = {
	id: "507f1f77bcf86cd799439031",
	status: "approved",
	workOrderId: "507f1f77bcf86cd799439032",
	currency: "COP",
	amount: 100_000,
	taxAmount: 19_000,
	totalAmount: 119_000,
	serviceLines: [
		{
			description: "Mantenimiento preventivo",
			quantity: 1,
			unit: "servicio",
			unitPrice: 100_000,
			total: 100_000,
		},
	],
};

const baseInvoice = {
	serviceEntrySheetId: baseSes.id,
	workOrderId: baseSes.workOrderId,
	currency: "COP",
	amount: 100_000,
	taxAmount: 19_000,
	totalAmount: 119_000,
	invoiceLines: baseSes.serviceLines,
};

describe("invoice versus SES integrity", () => {
	it("accepts an invoice that exactly matches its approved SES", () => {
		expect(() => assertInvoiceMatchesServiceEntrySheet(baseInvoice, baseSes)).not.toThrow();
	});

	it("rejects amount drift from the approved SES", () => {
		expect(() =>
			assertInvoiceMatchesServiceEntrySheet({ ...baseInvoice, totalAmount: 120_000 }, baseSes),
		).toThrowError(/totalAmount/i);
	});

	it("rejects invoice lines that differ from the approved SES", () => {
		expect(() =>
			assertInvoiceMatchesServiceEntrySheet(
				{
					...baseInvoice,
					invoiceLines: [{ ...baseInvoice.invoiceLines[0], quantity: 2 }],
				},
				baseSes,
			),
		).toThrowError(/invoiceLines/i);
	});
});
