import type { AuditLogRecord } from "@cermont/shared-types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOfflineStore } from "@/store/offline.store";

const mocks = vi.hoisted(() => ({
	useAuditLogsQuery: vi.fn(),
}));

vi.mock("@/modules/audit/queries", () => ({
	useAuditLogsQuery: mocks.useAuditLogsQuery,
}));

const event: AuditLogRecord = {
	_id: "507f1f77bcf86cd799439011",
	entityType: "ServiceCase",
	entityId: "507f1f77bcf86cd799439012",
	action: "SERVICE_CASE_STEP_ADVANCED",
	userId: "507f1f77bcf86cd799439013",
	userEmail: "gerencia@cermont.com",
	changes: {
		before: { stepCode: "step_05_planning", stage: "planning" },
		after: { stepCode: "step_06_execution", stage: "in_execution" },
	},
	metadata: { command: "ADVANCE_STEP" },
	requestId: "trace-123",
	ipAddress: "127.0.0.1",
	status: "success",
	createdAt: "2026-06-11T12:00:00.000Z",
};

const { AuditLogViewer } = await import("../AuditLogViewer");

describe("AuditLogViewer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useOfflineStore.setState({ isOnline: true });
		mocks.useAuditLogsQuery.mockReturnValue({
			data: {
				events: [event],
				pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
			},
			isLoading: false,
			error: false,
			refetch: vi.fn(),
		});
	});

	it("renders forensic actor, resource, request correlation, and details", () => {
		render(<AuditLogViewer />);

		expect(screen.getByRole("heading", { name: "Registro de auditoría" })).toBeTruthy();
		expect(screen.getByText("gerencia@cermont.com")).toBeTruthy();
		expect(screen.getByText("Request: trace-123")).toBeTruthy();
		expect(screen.getAllByText("Service Case Step Advanced")).toHaveLength(2);
		expect(screen.getByText("gerencia@cermont.com").closest("article")?.className).toContain(
			"border-[var(--color-info)]/30",
		);

		fireEvent.click(screen.getByText("Ver cambios y contexto"));
		expect(screen.getByText(/step_05_planning/)).toBeTruthy();
		expect(screen.getByText(/ADVANCE_STEP/)).toBeTruthy();
	});

	it("applies action and date filters through the query hook", async () => {
		render(<AuditLogViewer />);

		fireEvent.change(screen.getByLabelText("Acción"), {
			target: { value: "SERVICE_CASE_STEP_ADVANCED" },
		});
		fireEvent.change(screen.getByLabelText("Desde"), {
			target: { value: "2026-06-01" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));

		await waitFor(() => {
			expect(mocks.useAuditLogsQuery).toHaveBeenLastCalledWith(
				expect.objectContaining({
					action: "SERVICE_CASE_STEP_ADVANCED",
					from: "2026-06-01T00:00:00.000Z",
					page: 1,
				}),
			);
		});
	});

	it("shows the required empty state", () => {
		mocks.useAuditLogsQuery.mockReturnValue({
			data: {
				events: [],
				pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
			},
			isLoading: false,
			error: false,
			refetch: vi.fn(),
		});

		render(<AuditLogViewer />);
		expect(screen.getByText("Sin eventos para estos filtros")).toBeTruthy();
	});
});
