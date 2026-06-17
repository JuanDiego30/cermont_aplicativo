import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import EvidencesPage from "@/app/(dashboard)/evidences/page";

const replaceMock = vi.fn();
const useQueryMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	useSearchParams: () => new URLSearchParams("orderId=order-1"),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/image", () => ({
	default: ({ alt }: { alt?: string }) => <span data-alt={alt ?? ""} data-testid="mock-image" />,
}));

vi.mock("@/lib/hooks/useOnlineStatus", () => ({
	useOnlineStatus: () => true,
}));

vi.mock("@/components/common/SyncBanner", () => ({
	SyncBanner: () => null,
}));

vi.mock("@tanstack/react-query", () => ({
	keepPreviousData: Symbol("keepPreviousData"),
	useMutation: () => ({
		mutate: () => {},
		mutateAsync: () => Promise.resolve(null),
		isPending: false,
	}),
	useQueryClient: () => ({ invalidateQueries: () => {} }),
	useQuery: (config: Record<string, unknown>) => {
		useQueryMock(config);
		return {
			data: [
				{
					_id: "ev-1",
					orderId: "order-1",
					type: "before",
					filename: "before.webp",
					url: "https://example.com/before.webp",
					mimeType: "image/webp",
					sizeBytes: 1024,
					description: "Estado inicial",
					capturedAt: "2026-05-27T12:00:00.000Z",
					uploadedAt: "2026-05-27T12:05:00.000Z",
					uploadedBy: "user-1",
					createdAt: "2026-05-27T12:05:00.000Z",
					updatedAt: "2026-05-27T12:05:00.000Z",
				},
				{
					_id: "ev-2",
					orderId: "order-1",
					type: "during",
					filename: "during.webp",
					url: "https://example.com/during.webp",
					mimeType: "image/webp",
					sizeBytes: 2048,
					description: "Trabajo en campo",
					capturedAt: "2026-05-27T13:00:00.000Z",
					uploadedAt: "2026-05-27T13:05:00.000Z",
					uploadedBy: "user-1",
					createdAt: "2026-05-27T13:05:00.000Z",
					updatedAt: "2026-05-27T13:05:00.000Z",
				},
				{
					_id: "ev-3",
					orderId: "order-1",
					type: "after",
					filename: "after.webp",
					url: "https://example.com/after.webp",
					mimeType: "image/webp",
					sizeBytes: 3072,
					description: "Resultado final",
					capturedAt: "2026-05-27T14:00:00.000Z",
					uploadedAt: "2026-05-27T14:05:00.000Z",
					uploadedBy: "user-1",
					createdAt: "2026-05-27T14:05:00.000Z",
					updatedAt: "2026-05-27T14:05:00.000Z",
				},
			],
			isLoading: false,
			error: null,
		};
	},
}));

vi.mock("@/modules/orders/queries", () => ({
	useOrders: () => ({
		data: {
			items: [{ _id: "order-1", code: "OT-001", assetName: "Compresor principal" }],
		},
		isLoading: false,
	}),
}));

describe("Evidences page", () => {
	beforeEach(() => {
		replaceMock.mockClear();
		useQueryMock.mockClear();
	});

	test("renders the gallery view for the selected order", async () => {
		render(<EvidencesPage />);

		expect(
			await screen.findByRole("heading", { name: "Evidencias del trabajo" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "OT-001 · Compresor principal" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Galería" })).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("button", { name: "Tabla" })).toHaveAttribute("aria-pressed", "false");
		expect(useQueryMock).toHaveBeenCalledWith(
			expect.objectContaining({
				enabled: true,
				queryKey: ["evidences", "order-1", 0],
			}),
		);
	});

	test("persists view mode changes into the URL", async () => {
		render(<EvidencesPage />);

		expect(
			await screen.findByRole("heading", { name: "Evidencias del trabajo" }),
		).toBeInTheDocument();

		// Click Tabla
		fireEvent.click(screen.getByRole("button", { name: "Tabla" }));
		expect(replaceMock).toHaveBeenLastCalledWith("/evidences?orderId=order-1&view=table");

		// Click Galería (back)
		fireEvent.click(screen.getByRole("button", { name: "Galería" }));
		expect(replaceMock).toHaveBeenLastCalledWith("/evidences?orderId=order-1");

		// Type search and submit
		const searchInput = screen.getByPlaceholderText("Título o descripción");
		fireEvent.change(searchInput, { target: { value: "motor" } });
		fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
		expect(replaceMock).toHaveBeenLastCalledWith("/evidences?orderId=order-1&q=motor");

		// Clear filters
		fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
		expect(replaceMock).toHaveBeenLastCalledWith("/evidences");
	});
});
