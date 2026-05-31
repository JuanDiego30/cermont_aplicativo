import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { Document } from "@cermont/shared-types";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useArchiveDocument, useDeleteDocument } from "@/modules/documents/queries";

const mocks = vi.hoisted(() => ({
	toastError: vi.fn(),
	toastSuccess: vi.fn(),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		delete: vi.fn(),
		get: vi.fn(),
		patch: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		error: mocks.toastError,
		success: mocks.toastSuccess,
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = "DocumentsQueriesWrapper";
	return Wrapper;
}

function buildDocument(overrides: Partial<Document> = {}): Document {
	return {
		_id: "doc-1",
		title: "Acta cliente",
		file_url: "/uploads/acta-cliente.pdf",
		file_size: 4096,
		mime_type: "application/pdf",
		uploaded_by: "507f1f77bcf86cd799439031",
		associations: [],
		lifecycleStatus: "active",
		createdAt: "2026-05-27T12:00:00.000Z",
		updatedAt: "2026-05-27T12:00:00.000Z",
		...overrides,
	};
}

describe("documents queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("unwraps archive responses and reports the retention horizon", async () => {
		vi.mocked(apiClient.patch).mockResolvedValue({
			success: true,
			data: buildDocument({
				lifecycleStatus: "archived",
				retentionUntil: "2031-05-27T12:00:00.000Z",
			}),
		});

		const { result } = renderHook(() => useArchiveDocument(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({ id: "doc-1", reason: "cierre contractual" });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(apiClient.patch).toHaveBeenCalledWith("/documents/doc-1/archive", {
			reason: "cierre contractual",
		});
		expect(result.current.data).toMatchObject({
			_id: "doc-1",
			lifecycleStatus: "archived",
		});
		expect(mocks.toastSuccess).toHaveBeenCalledWith(expect.stringContaining("retencion"));
	});

	test("keeps delete requests retention-aware when backend archives protected documents", async () => {
		vi.mocked(apiClient.delete).mockResolvedValue({
			success: true,
			data: {
				status: "archived",
				documentId: "doc-1",
				retentionUntil: "2031-05-27T12:00:00.000Z",
			},
		});

		const { result } = renderHook(() => useDeleteDocument(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({ id: "doc-1", reason: "limpieza administrativa" });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(apiClient.delete).toHaveBeenCalledWith("/documents/doc-1", {
			body: JSON.stringify({ reason: "limpieza administrativa" }),
		});
		expect(result.current.data).toEqual({
			status: "archived",
			documentId: "doc-1",
			retentionUntil: "2031-05-27T12:00:00.000Z",
		});
		expect(mocks.toastSuccess).toHaveBeenCalledWith(expect.stringContaining("archivado"));
	});
});
