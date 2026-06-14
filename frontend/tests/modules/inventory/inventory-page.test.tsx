import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import InventoryPage from "@/app/(dashboard)/inventory/page";

const createItemMock = vi.fn();
const registerMovementMock = vi.fn();
const useInventoryItemsMock = vi.fn();

vi.mock("@/modules/inventory/queries", () => ({
	useCreateInventoryItem: () => ({
		isPending: false,
		mutateAsync: createItemMock,
	}),
	useInventoryItems: (filters: Record<string, string | number | boolean>) =>
		useInventoryItemsMock(filters),
	useRegisterStockMovement: () => ({
		isPending: false,
		mutateAsync: registerMovementMock,
	}),
}));

describe("InventoryPage", () => {
	beforeEach(() => {
		createItemMock.mockReset().mockResolvedValue({});
		registerMovementMock.mockReset().mockResolvedValue({});
		useInventoryItemsMock.mockReset().mockReturnValue({
			data: {
				data: [],
				pagination: { page: 1, totalPages: 1, total: 0, limit: 20 },
			},
			error: false,
			isLoading: false,
			refetch: vi.fn(),
		});
	});

	test("creates an item through a semantic form submission", async () => {
		render(<InventoryPage />);

		fireEvent.click(screen.getByRole("button", { name: "Nuevo item" }));
		fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Cable UTP" } });
		fireEvent.submit(screen.getByRole("form", { name: "Nuevo item de inventario" }));

		await waitFor(() => {
			expect(createItemMock).toHaveBeenCalledWith({
				category: "material",
				initialStock: 0,
				minStock: 0,
				name: "Cable UTP",
				unit: "unidad",
			});
		});
	});

	test("registers a stock movement through a semantic form submission", async () => {
		useInventoryItemsMock.mockReturnValue({
			data: {
				data: [
					{
						_id: "item-1",
						category: "material",
						currentStock: 12,
						minStock: 2,
						name: "Cable UTP",
						unit: "metro",
					},
				],
				pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
			},
			error: false,
			isLoading: false,
			refetch: vi.fn(),
		});

		render(<InventoryPage />);

		fireEvent.click(screen.getByRole("button", { name: "Movimiento" }));
		fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "OT-2026-0012" } });
		fireEvent.submit(screen.getByRole("form", { name: "Movimiento de stock para Cable UTP" }));

		await waitFor(() => {
			expect(registerMovementMock).toHaveBeenCalledWith({
				input: {
					quantity: 1,
					reason: "OT-2026-0012",
					type: "salida",
				},
				itemId: "item-1",
			});
		});
	});
});
