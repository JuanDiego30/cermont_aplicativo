import { describe, expect, it } from "vitest";
import { AuditLogRecordSchema, AuditLogsQuerySchema } from "../../src/schemas/audit.schema";

describe("AuditLogsQuerySchema", () => {
	it("accepts canonical forensic filters", () => {
		const result = AuditLogsQuerySchema.parse({
			userId: "507f1f77bcf86cd799439011",
			entity: "ServiceCase",
			entityId: "507f1f77bcf86cd799439012",
			action: "SERVICE_CASE_STEP_ADVANCED",
			from: "2026-06-01T00:00:00.000Z",
			to: "2026-06-11T23:59:59.999Z",
			page: "2",
			limit: "25",
		});

		expect(result).toEqual({
			userId: "507f1f77bcf86cd799439011",
			entity: "ServiceCase",
			entityId: "507f1f77bcf86cd799439012",
			action: "SERVICE_CASE_STEP_ADVANCED",
			from: "2026-06-01T00:00:00.000Z",
			to: "2026-06-11T23:59:59.999Z",
			page: 2,
			limit: 25,
		});
	});

	it("retains legacy aliases while clients migrate to canonical names", () => {
		const result = AuditLogsQuerySchema.parse({
			user_id: "507f1f77bcf86cd799439011",
			model_name: "Order",
		});

		expect(result.user_id).toBe("507f1f77bcf86cd799439011");
		expect(result.model_name).toBe("Order");
	});

	it("accepts UUID entity identifiers used by file assets", () => {
		const entityId = "7a817c37-5206-4fd1-a2ee-f1e642330af6";
		const result = AuditLogsQuerySchema.parse({ entityId });

		expect(result.entityId).toBe(entityId);
	});

	it("rejects inverted forensic date ranges", () => {
		const result = AuditLogsQuerySchema.safeParse({
			from: "2026-06-12T00:00:00.000Z",
			to: "2026-06-11T00:00:00.000Z",
		});

		expect(result.success).toBe(false);
	});

	it("validates immutable audit records without null-valued absence", () => {
		const result = AuditLogRecordSchema.parse({
			_id: "507f1f77bcf86cd799439011",
			entityType: "ServiceCase",
			entityId: "507f1f77bcf86cd799439012",
			action: "SERVICE_CASE_STEP_ADVANCED",
			userId: "507f1f77bcf86cd799439013",
			userEmail: "gerencia@cermont.com",
			changes: {
				before: { stepCode: "step_05_planning" },
				after: { stepCode: "step_06_execution" },
			},
			requestId: "trace-123",
			status: "success",
			createdAt: "2026-06-11T12:00:00.000Z",
		});

		expect(result.requestId).toBe("trace-123");
		expect(result.action).toBe("SERVICE_CASE_STEP_ADVANCED");
	});

	it("validates file-asset audit records with UUID identifiers", () => {
		const result = AuditLogRecordSchema.parse({
			_id: "507f1f77bcf86cd799439011",
			entityType: "FileAsset",
			entityId: "7a817c37-5206-4fd1-a2ee-f1e642330af6",
			action: "FILE_UPLOADED",
			userId: "507f1f77bcf86cd799439013",
			userEmail: "gerencia@cermont.com",
			status: "success",
			createdAt: "2026-06-11T12:00:00.000Z",
		});

		expect(result.entityId).toBe("7a817c37-5206-4fd1-a2ee-f1e642330af6");
	});
});
