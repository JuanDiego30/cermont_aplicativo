import { describe, expect, it } from "vitest";
import {
	AttachEntityDocumentSchema,
	CreateFormSubmissionSchema,
	CreatePrivacyRequestSchema,
	GenerateBulkQrCodesSchema,
	RunJobsSchema,
	SyncErpConnectorParamsSchema,
	SyncErpConnectorRequestSchema,
} from "../../src";

const OBJECT_ID = "507f1f77bcf86cd799439011";

describe("route request schemas", () => {
	it("accepts a valid operational form submission", () => {
		const result = CreateFormSubmissionSchema.safeParse({
			templateId: "cermont_cctv_v1",
			stepCode: "step_07_evidence",
			serviceCaseId: OBJECT_ID,
			values: { approved: true, quantity: 2, observation: "Ready" },
		});

		expect(result.success).toBe(true);
	});

	it("rejects a form submission with an invalid service case id", () => {
		const result = CreateFormSubmissionSchema.safeParse({
			templateId: "cermont_cctv_v1",
			stepCode: "step_07_evidence",
			serviceCaseId: "invalid",
			values: {},
		});

		expect(result.success).toBe(false);
	});

	it("accepts bodyless action requests without accepting extra fields", () => {
		expect(RunJobsSchema.safeParse(undefined).success).toBe(true);
		expect(SyncErpConnectorRequestSchema.safeParse(undefined).success).toBe(true);
		expect(RunJobsSchema.safeParse({ unexpected: true }).success).toBe(false);
	});

	it("validates the ERP provider route parameter", () => {
		expect(SyncErpConnectorParamsSchema.safeParse({ provider: "sap" }).success).toBe(true);
		expect(SyncErpConnectorParamsSchema.safeParse({ provider: "invalid" }).success).toBe(false);
	});

	it("requires at least one valid item for bulk QR generation", () => {
		expect(GenerateBulkQrCodesSchema.safeParse({ items: [] }).success).toBe(false);
		expect(
			GenerateBulkQrCodesSchema.safeParse({
				items: [{ entityType: "tool", entityId: OBJECT_ID, label: "Taladro" }],
			}).success,
		).toBe(true);
	});

	it("validates document attachment bodies without duplicating route params", () => {
		expect(
			AttachEntityDocumentSchema.safeParse({
				documentId: OBJECT_ID,
				label: "Manual técnico",
				type: "manual",
				required: true,
			}).success,
		).toBe(true);
		expect(AttachEntityDocumentSchema.safeParse({ documentId: OBJECT_ID }).success).toBe(false);
	});

	it("validates privacy request type and description", () => {
		expect(
			CreatePrivacyRequestSchema.safeParse({
				type: "access",
				description: "Solicito una copia de mis datos personales.",
			}).success,
		).toBe(true);
		expect(
			CreatePrivacyRequestSchema.safeParse({ type: "invalid", description: "Solicitud" }).success,
		).toBe(false);
	});
});
