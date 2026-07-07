import { ADMIN_ROLES } from "@cermont/domain";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DocumentsPage from "@/app/(dashboard)/documents/page";

const replaceMock = vi.fn();
const useDocumentsMock = vi.fn();
const documentUploaderMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	useSearchParams: () =>
		new URLSearchParams(
			"q=acta&orderId=order-1&serviceCaseId=sc-1&purpose=closing_evidence&step=step_10_client_signature&includeArchived=true",
		),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/auth/hooks/useAuth", () => ({
	useAuth: () => ({
		user: { id: "user-1", role: ADMIN_ROLES[0] },
	}),
}));

vi.mock("@/modules/orders/queries", () => ({
	useOrders: () => ({
		data: {
			items: [
				{
					_id: "order-1",
					code: "OT-0001",
					assetName: "Sistema CCTV",
					location: "Bogotá",
					createdBy: "user-1",
				},
			],
		},
		isLoading: false,
	}),
}));

vi.mock("@/modules/service-cases/queries", () => ({
	useServiceCaseList: () => ({
		data: {
			items: [{ _id: "sc-1", code: "SC-0001", clientName: "Cliente Demo" }],
		},
		isLoading: false,
	}),
}));

vi.mock("@/modules/documents/queries", () => ({
	useDocuments: (filters: Record<string, unknown>) => {
		useDocumentsMock(filters);
		return {
			data: [
				{
					_id: "doc-1",
					title: "Acta firmada",
					file_url: "/uploads/doc-1.pdf",
					order_id: "order-1",
				},
			],
			isLoading: false,
		};
	},
}));

vi.mock("@/modules/documents/ui/DocumentUploader", () => ({
	DocumentUploader: (props: Record<string, unknown>) => {
		documentUploaderMock(props);
		return <div data-testid="document-uploader">uploader</div>;
	},
}));

vi.mock("@/modules/documents/ui/DocumentGallery", () => ({
	DocumentGallery: () => <div data-testid="document-gallery">gallery</div>,
}));

describe("Documents page", () => {
	beforeEach(() => {
		replaceMock.mockClear();
		useDocumentsMock.mockClear();
		documentUploaderMock.mockClear();
	});

	test("hydrates contextual filters from search params and forwards them to query and upload defaults", async () => {
		render(<DocumentsPage />);

		expect(await screen.findByRole("heading", { name: "Gestión de documentos" })).toBeTruthy();
		expect(screen.getByLabelText("Buscar documento")).toHaveProperty("value", "acta");
		expect(screen.getByLabelText("Filtrar por OT")).toHaveProperty("value", "order-1");
		expect(screen.getByLabelText("Filtrar por caso de servicio")).toHaveProperty("value", "sc-1");
		expect(screen.getByLabelText("Filtrar por propósito documental")).toHaveProperty(
			"value",
			"closing_evidence",
		);
		expect(screen.getByLabelText("Filtrar por paso operacional")).toHaveProperty(
			"value",
			"step_10_client_signature",
		);
		expect(screen.getByLabelText("Mostrar archivados")).toHaveProperty("checked", true);

		expect(useDocumentsMock).toHaveBeenCalledWith({
			includeArchived: true,
			order_id: "order-1",
			purpose: "closing_evidence",
			serviceCaseId: "sc-1",
			stepCode: "step_10_client_signature",
		});

		expect(documentUploaderMock.mock.lastCall?.[0]).toMatchObject({
			defaultOrderId: "order-1",
			defaultPurpose: "closing_evidence",
			defaultServiceCaseId: "sc-1",
			defaultStepCode: "step_10_client_signature",
		});
	});

	test("writes the extended filter state back to the URL", async () => {
		render(<DocumentsPage />);

		expect(await screen.findByRole("heading", { name: "Gestión de documentos" })).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Buscar documento"), {
			target: { value: "factura" },
		});
		fireEvent.change(screen.getByLabelText("Filtrar por propósito documental"), {
			target: { value: "support_document" },
		});
		fireEvent.click(screen.getByLabelText("Mostrar archivados"));
		fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

		expect(replaceMock).toHaveBeenCalledWith(
			"/documents?q=factura&orderId=order-1&serviceCaseId=sc-1&purpose=support_document&step=step_10_client_signature",
		);
	});
});
