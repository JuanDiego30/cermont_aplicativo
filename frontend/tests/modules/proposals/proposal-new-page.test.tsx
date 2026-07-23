import type { ApiEnvelope, CreateProposalInput, Proposal } from "@cermont/shared-types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NewProposalPage from "@/app/(dashboard)/proposals/new/page";

const pushMock = vi.fn();
const mutateMock = vi.fn();
let mutationResult: Proposal | ApiEnvelope<Proposal>;

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/proposals/hooks/useCreateProposal", () => ({
	useCreateProposal: () => ({
		mutate: (payload: CreateProposalInput, options: { onSuccess: (result: Proposal) => void }) => {
			mutateMock(payload);
			options.onSuccess(mutationResult as Proposal);
		},
		isPending: false,
		isError: false,
	}),
}));

vi.mock("@/modules/service-cases/hooks/useServiceCaseContext", () => ({
	useServiceCaseContext: () => ({ inheritedFields: [], isLoading: false }),
}));

describe("new proposal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mutationResult = { _id: "507f1f77bcf86cd799439011" } as Proposal;
	});

	test("keeps quantity and computes subtotal, IVA and total", async () => {
		render(<NewProposalPage />);

		fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "2" } });
		fireEvent.change(screen.getByLabelText("Valor unitario (COP)"), {
			target: { value: "1000000" },
		});

		const summary = screen.getByRole("heading", { name: "Resumen de Costos" }).closest("section");
		expect(summary).not.toBeNull();
		if (!summary) {
			return;
		}
		expect(within(summary).getByText(/2\.000\.000/)).toBeTruthy();
		expect(within(summary).getByText(/^\$\s*380\.000$/)).toBeTruthy();
		expect(within(summary).getByText(/^\$\s*2\.380\.000$/)).toBeTruthy();
	});

	test("redirects to the real proposal id returned by the mutation", async () => {
		render(<NewProposalPage />);

		fireEvent.change(screen.getByRole("textbox", { name: /Cliente/ }), {
			target: { value: "Ecopetrol S.A." },
		});
		fireEvent.change(screen.getByLabelText("Descripción"), {
			target: { value: "Mantenimiento CCTV" },
		});
		fireEvent.change(screen.getByLabelText("Unidad"), { target: { value: "servicio" } });
		fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "2" } });
		fireEvent.change(screen.getByLabelText("Valor unitario (COP)"), {
			target: { value: "1000000" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Crear Propuesta" }));

		await waitFor(() =>
			expect(pushMock).toHaveBeenCalledWith("/proposals/507f1f77bcf86cd799439011"),
		);
		expect(pushMock).toHaveBeenCalledTimes(1);
		expect(mutateMock).toHaveBeenCalledWith(
			expect.objectContaining({
				items: [expect.objectContaining({ quantity: 2, unitCost: 1_000_000 })],
			}),
		);
	});

	test("redirects with an enveloped proposal response and never to undefined", async () => {
		mutationResult = {
			success: true,
			data: { _id: "507f1f77bcf86cd799439012" } as Proposal,
		};
		render(<NewProposalPage />);

		fireEvent.change(screen.getByRole("textbox", { name: /Cliente/ }), {
			target: { value: "Ecopetrol S.A." },
		});
		fireEvent.change(screen.getByLabelText("Descripci\u00f3n"), {
			target: { value: "Mantenimiento CCTV" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Crear Propuesta" }));

		await waitFor(() =>
			expect(pushMock).toHaveBeenCalledWith("/proposals/507f1f77bcf86cd799439012"),
		);
		expect(pushMock).not.toHaveBeenCalledWith("/proposals/undefined");
	});
});
