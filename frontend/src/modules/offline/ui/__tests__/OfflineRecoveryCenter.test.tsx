import type { OfflineOutboxItem } from "@cermont/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveConflictMock = vi.fn(async () => undefined);
const retryMock = vi.fn(async () => undefined);
const discardMock = vi.fn(async () => undefined);
const retryUploadMock = vi.fn(async () => undefined);
const discardUploadMock = vi.fn(async () => undefined);

const conflictItem: OfflineOutboxItem = {
	localId: "conflict-1",
	entityType: "work_order",
	operation: "update",
	payload: { status: "in_progress" },
	status: "conflict",
	attempts: 2,
	lastError: "El servidor cambio primero.",
	createdAt: "2026-06-11T10:00:00.000Z",
	updatedAt: "2026-06-11T11:00:00.000Z",
	idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
	schemaVersion: "offline.v1",
	userId: "user-1",
	conflict: {
		reason: "El servidor cambio primero.",
		serverVersion: 2,
		localVersion: 1,
		serverState: "approved",
		localState: "draft",
	},
};

vi.mock("@/lib/offline/offline-recovery", () => ({
	listOfflineRecoverySnapshot: vi.fn(async () => ({
		items: [conflictItem],
		uploads: [
			{
				id: "blob-1",
				blob: new Blob(["image"], { type: "image/jpeg" }),
				originalName: "evidencia-campo.jpg",
				mimeType: "image/jpeg",
				sizeBytes: 1024,
				entityType: "evidence",
				entityId: "order-1",
				category: "progress",
				clientMutationId: "client-1",
				createdAt: 1_765_454_400_000,
				retryCount: 5,
				status: "dead_letter",
				lastError: "No se pudo subir el archivo.",
			},
		],
	})),
	resolveOfflineConflict: resolveConflictMock,
	retryOfflineRecoveryItem: retryMock,
	discardOfflineRecoveryItem: discardMock,
	retryOfflineUpload: retryUploadMock,
	discardOfflineUpload: discardUploadMock,
}));

vi.mock("@/lib/offline/use-sync-status", () => ({
	useSyncStatus: () => ({
		isOnline: true,
		pendingCount: 0,
		failedCount: 0,
		conflictCount: 1,
		isSyncing: false,
		lastSyncError: "",
		lastSyncAt: "",
	}),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const { OfflineRecoveryCenter } = await import("../OfflineRecoveryCenter");

function renderCenter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<OfflineRecoveryCenter />
		</QueryClientProvider>,
	);
}

describe("OfflineRecoveryCenter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows conflict context and lets the user choose the server version", async () => {
		renderCenter();

		expect(
			await screen.findByRole("heading", { name: "Recuperación de sincronización" }),
		).toBeTruthy();
		expect(screen.getByText("approved")).toBeTruthy();
		expect(screen.getByText("draft")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Usar versión del servidor" }));

		await waitFor(() => {
			expect(resolveConflictMock).toHaveBeenCalledWith("conflict-1", "keep_server");
		});
	});

	it("lets the user retry the local conflict version", async () => {
		renderCenter();
		await screen.findByText("El servidor cambio primero.");

		fireEvent.click(screen.getByRole("button", { name: "Reintentar versión local" }));

		await waitFor(() => {
			expect(resolveConflictMock).toHaveBeenCalledWith("conflict-1", "retry_local");
		});
	});

	it("exposes dead-letter file uploads for recovery", async () => {
		renderCenter();
		expect(await screen.findByText("evidencia-campo.jpg")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Reintentar archivo" }));

		await waitFor(() => {
			expect(retryUploadMock).toHaveBeenCalledWith("blob-1");
		});
	});
});
