import type { AuditLogRecord } from "@cermont/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	get: vi.fn(),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: { get: mocks.get },
}));

const { listAuditLogs } = await import("../api");

const event: AuditLogRecord = {
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
};

describe("audit API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.get.mockResolvedValue({
			success: true,
			data: [event],
			pagination: { page: 2, limit: 25, total: 30, totalPages: 2 },
		});
	});

	it("serializes canonical forensic filters and validates the response contract", async () => {
		const result = await listAuditLogs({
			page: 2,
			limit: 25,
			entity: "ServiceCase",
			entityId: "507f1f77bcf86cd799439012",
			userId: "507f1f77bcf86cd799439013",
			action: "SERVICE_CASE_STEP_ADVANCED",
			requestId: "trace-123",
			from: "2026-06-01T00:00:00.000Z",
			to: "2026-06-11T23:59:59.999Z",
		});

		const requestedUrl = String(mocks.get.mock.calls[0][0]);
		expect(requestedUrl).toContain("/audit?");
		expect(requestedUrl).toContain("entity=ServiceCase");
		expect(requestedUrl).toContain("action=SERVICE_CASE_STEP_ADVANCED");
		expect(requestedUrl).toContain("requestId=trace-123");
		expect(requestedUrl).toContain("page=2");
		expect(result.events).toEqual([event]);
		expect(result.pagination.total).toBe(30);
	});
});
