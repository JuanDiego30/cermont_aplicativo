import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TemplatesPage from "@/app/(dashboard)/templates/page";

const templateQueryMocks = vi.hoisted(() => ({
	useTemplates: vi.fn(),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/templates/queries", () => ({
	useTemplates: templateQueryMocks.useTemplates,
}));

describe("Templates page offline rendering", () => {
	beforeEach(() => {
		templateQueryMocks.useTemplates.mockReset();
	});

	test("keeps the module rendered when offline has no local snapshot", () => {
		templateQueryMocks.useTemplates.mockReturnValue({
			data: {
				items: [],
				total: 0,
				source: {
					status: "offline_empty",
					updatedAt: "2026-06-05T12:00:00.000Z",
				},
			},
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});

		render(<TemplatesPage />);

		expect(screen.getByRole("heading", { name: "Plantillas documentales" })).toBeTruthy();
		expect(screen.getByText("Sin plantillas guardadas localmente")).toBeTruthy();
		expect(screen.getByText(/Este dispositivo todavía no tiene plantillas/)).toBeTruthy();
	});
});
