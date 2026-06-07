import type { Document } from "@cermont/shared-types";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { DocumentGallery } from "@/modules/documents/ui/DocumentGallery";

const archiveMutateMock = vi.fn();
const deleteMutateMock = vi.fn();
const signMutateMock = vi.fn();

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/documents/queries", () => ({
	useArchiveDocument: () => ({
		isPending: false,
		mutate: archiveMutateMock,
	}),
	useDeleteDocument: () => ({
		isPending: false,
		mutate: deleteMutateMock,
	}),
	useSignDocument: () => ({
		isPending: false,
		mutate: signMutateMock,
	}),
}));

function buildDocument(overrides: Partial<Document> = {}): Document {
	return {
		_id: "doc-1",
		title: "Acta de cierre",
		file_url: "/uploads/acta-cierre.pdf",
		file_size: 2048,
		mime_type: "application/pdf",
		uploaded_by: "507f1f77bcf86cd799439031",
		associations: [],
		lifecycleStatus: "active",
		createdAt: "2026-05-27T12:00:00.000Z",
		updatedAt: "2026-05-27T12:00:00.000Z",
		...overrides,
	};
}

describe("DocumentGallery", () => {
	beforeEach(() => {
		archiveMutateMock.mockReset();
		deleteMutateMock.mockReset();
		signMutateMock.mockReset();
	});

	test("marks protected closeout documents and turns delete into retention-aware removal", () => {
		render(
			<DocumentGallery
				documents={[
					buildDocument({
						purpose: "closing_evidence",
						targetStepCode: "step_09_client_signature",
					}),
				]}
			/>,
		);

		expect(screen.getByText("Protegido")).toBeTruthy();
		expect(screen.getAllByText("Closeout evidence").length).toBeGreaterThan(0);
		expect(screen.getByText("Closeout protection")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Eliminar documento" }).textContent).toContain(
			"Retirar",
		);

		fireEvent.click(screen.getByRole("button", { name: "Eliminar documento" }));

		expect(screen.getByRole("heading", { name: "Retirar documento protegido" })).toBeTruthy();
		expect(screen.getByText(/archives it with retention/i)).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Motivo (opcional)"), {
			target: { value: "depurado por version final" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Archivar por retencion" }));

		expect(deleteMutateMock).toHaveBeenCalledWith(
			{ id: "doc-1", reason: "depurado por version final" },
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	test("shows archived retention metadata and hides destructive controls", () => {
		render(
			<DocumentGallery
				documents={[
					buildDocument({
						_id: "doc-2",
						lifecycleStatus: "archived",
						archivedAt: "2026-05-20T08:00:00.000Z",
						archiveReason: "Firmado por cliente",
						retentionUntil: "2031-05-20T08:00:00.000Z",
						signed: true,
					}),
				]}
			/>,
		);

		expect(screen.getByText("Archivado")).toBeTruthy();
		expect(screen.getByText(/Retencion hasta/i)).toBeTruthy();
		expect(screen.getByText(/Motivo: Firmado por cliente/i)).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Archivar documento" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Eliminar documento" })).toBeNull();
	});
});
