import { render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ProposalsPage from "@/app/(dashboard)/proposals/page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	useSearchParams: () => new URLSearchParams("status=sent&page=1&limit=20&search=cctv"),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/proposals/queries", () => ({
	useProposals: () => ({
		data: {
			items: [],
			total: 0,
		},
		isLoading: false,
		isError: false,
	}),
}));

describe("Proposals page search params", () => {
	beforeEach(() => {
		replaceMock.mockClear();
	});

	test("reads query parameters without unbound URLSearchParams methods", async () => {
		render(<ProposalsPage />);

		expect(await screen.findByRole("heading", { name: "Propuestas" })).toBeTruthy();
		expect(screen.getByRole("searchbox", { name: "Buscar propuestas" })).toHaveProperty(
			"value",
			"cctv",
		);
	});

	test("does not rewrite the proposals URL on initial mount", async () => {
		render(<ProposalsPage />);

		expect(await screen.findByRole("heading", { name: "Propuestas" })).toBeTruthy();
		await waitFor(() => expect(replaceMock).not.toHaveBeenCalled());
	});
});
