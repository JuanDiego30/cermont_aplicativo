import { describe, expect, it } from "vitest";
import {
	CreateInvoiceSchema,
	CreateTechnicalReportSchema,
	RegisterPaymentSchema,
	TechnicalReportSchema,
} from "../schemas/administrative-workflow.schema";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("Administrative Workflow Schemas", () => {
	describe("TechnicalReport", () => {
		it("should validate a valid create input", () => {
			const result = CreateTechnicalReportSchema.safeParse({
				executionSessionId: VALID_OBJECT_ID,
				orderId: VALID_OBJECT_ID,
				title: "Test Report",
				description: "Test description for the technical report",
			});
			expect(result.success).toBe(true);
		});

		it("should reject missing required fields", () => {
			const result = CreateTechnicalReportSchema.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
			}
		});

		it("should reject invalid ObjectId", () => {
			const result = CreateTechnicalReportSchema.safeParse({
				executionSessionId: "not-an-object-id",
				orderId: VALID_OBJECT_ID,
				title: "Test",
				description: "Test",
			});
			expect(result.success).toBe(false);
		});

		it("should apply default status on full schema", () => {
			const result = TechnicalReportSchema.safeParse({
				_id: VALID_OBJECT_ID,
				executionSessionId: VALID_OBJECT_ID,
				orderId: VALID_OBJECT_ID,
				title: "Test Report",
				description: "Test",
				version: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe("draft");
				expect(result.data.evidenceIds).toEqual([]);
			}
		});
	});

	describe("Invoice", () => {
		it("should validate invoice with tax", () => {
			const result = CreateInvoiceSchema.safeParse({
				serviceEntrySheetId: VALID_OBJECT_ID,
				orderId: VALID_OBJECT_ID,
				invoiceNumber: "INV-2026-001",
				totalAmountCOP: 10000000,
				taxAmountCOP: 1900000,
				dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.taxAmountCOP).toBe(1900000);
			}
		});

		it("should default tax to 0", () => {
			const result = CreateInvoiceSchema.safeParse({
				serviceEntrySheetId: VALID_OBJECT_ID,
				orderId: VALID_OBJECT_ID,
				invoiceNumber: "INV-2026-002",
				totalAmountCOP: 5000000,
				dueDate: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.taxAmountCOP).toBe(0);
			}
		});
	});

	describe("Payment", () => {
		it("should validate a payment with all fields", () => {
			const result = RegisterPaymentSchema.safeParse({
				invoiceId: VALID_OBJECT_ID,
				amountCOP: 10000000,
				paymentMethod: "bank_transfer",
				referenceNumber: "REF-2026-001",
				paidAt: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
		});

		it("should reject negative amount", () => {
			const result = RegisterPaymentSchema.safeParse({
				invoiceId: VALID_OBJECT_ID,
				amountCOP: -100,
				paymentMethod: "cash",
				paidAt: new Date().toISOString(),
			});
			expect(result.success).toBe(false);
		});
	});
});
