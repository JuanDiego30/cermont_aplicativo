import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ResourcesPage from "@/app/(dashboard)/resources/page";

const resourcesMocks = vi.hoisted(() => ({
	useDeleteResource: vi.fn(),
	useResourceList: vi.fn(),
	deleteResource: vi.fn(),
}));

vi.mock("@/modules/resources/hooks/useResources", () => ({
	useDeleteResource: resourcesMocks.useDeleteResource,
	useResourceList: resourcesMocks.useResourceList,
}));

vi.mock("@/modules/resources/ui/ResourceForm", () => ({
	ResourceForm: () => null,
}));

vi.mock("@/app/(dashboard)/resources/ResourceCard", () => ({
	ResourceCard: ({ resource }: { resource: { name: string } }) => <p>{resource.name}</p>,
}));

describe("ResourcesPage", () => {
	beforeEach(() => {
		resourcesMocks.deleteResource.mockReset();
		resourcesMocks.useDeleteResource.mockReturnValue({
			isPending: false,
			mutateAsync: resourcesMocks.deleteResource,
		});
		resourcesMocks.useResourceList.mockReturnValue({
			data: {
				data: [
					{
						_id: "resource-1",
						name: "Multímetro",
						active: true,
						status: "available",
					},
				],
			},
			isError: false,
			isLoading: false,
			refetch: vi.fn(),
		});
	});

	test("shows a structured error when deleting a resource fails", async () => {
		resourcesMocks.deleteResource.mockRejectedValue(new Error("Permiso insuficiente"));

		render(<ResourcesPage />);
		fireEvent.click(screen.getByRole("button", { name: "Eliminar Multímetro" }));

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(
				"No se pudo eliminar el recurso: Permiso insuficiente",
			);
		});
	});

	test("keeps the empty-state kit CTA on the canonical route", () => {
		resourcesMocks.useResourceList.mockReturnValue({
			data: { data: [] },
			isError: false,
			isLoading: false,
			refetch: vi.fn(),
		});

		render(<ResourcesPage />);

		expect(screen.getByRole("link", { name: "Nuevo kit" })).toHaveAttribute(
			"href",
			"/resources/kits/new",
		);
	});
});
