import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NewWorkRequestPage from "@/app/(dashboard)/work-requests/new/page";

function submitNewForm(): void {
	const button = screen.getByRole("button", { name: "Crear solicitud" });
	const form = button.closest("form");
	if (form instanceof HTMLFormElement) {
		fireEvent.submit(form);
	}
}

const mocks = vi.hoisted(() => ({
	mutate: vi.fn(),
	push: vi.fn(),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>{children}</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/modules/work-requests/queries", () => ({
	useCreateWorkRequest: () => ({
		mutate: mocks.mutate,
		isPending: false,
		error: null,
	}),
}));

vi.mock("@/modules/customers/ui/CustomerCombobox", () => ({
	CustomerCombobox: ({ onChange, error }: {
		onChange: (customer: {
			_id: string;
			name: string;
			nit: string;
			status: string;
			contactName: string;
			email: string;
			phone: string;
		}) => void;
		error?: string;
	}) => (
		<div>
			<button type="button" onClick={() => onChange({
				_id: "507f1f77bcf86cd799439011",
				name: "Cliente Prueba",
				nit: "900123456-7",
				status: "active",
				contactName: "Ana Cliente",
				email: "ana@example.com",
				phone: "3001234567",
			})}>Seleccionar cliente prueba</button>
			{error ? <p>{error}</p> : null}
		</div>
	),
}));

vi.mock("@/modules/customers/ui/ContactSelect", () => ({
	ContactSelect: ({ onChange }: {
		onChange: (id: string, snapshot: { name: string; email: string; phone: string }) => void;
	}) => (
		<button type="button" onClick={() => onChange(
			"507f1f77bcf86cd799439012",
			{ name: "Ana Cliente", email: "ana@example.com", phone: "3001234567" },
		)}>Seleccionar contacto prueba</button>
	),
}));

vi.mock("@/modules/customers/ui/ServiceSiteSelect", () => ({
	ServiceSiteSelect: ({ onChange, error }: {
		onChange: (id: string, snapshot: { name: string; address: string; city: string }) => void;
		error?: string;
	}) => (
		<div>
			<button type="button" onClick={() => onChange(
				"507f1f77bcf86cd799439013",
				{ name: "Sede Norte", address: "Calle 1", city: "Bogotá" },
			)}>Seleccionar sede prueba</button>
			{error ? <p>{error}</p> : null}
		</div>
	),
}));

vi.mock("@/modules/customers/ui/QuickCustomerModal", () => ({
	QuickCustomerModal: () => <></>,
}));

vi.mock("@/modules/documents/ui/ContextualDocumentUploadModal", () => ({
	ContextualDocumentUploadModal: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/core/ui/CustomizableSelect", () => ({
	CustomizableSelect: ({ onChange, errorMessage }: {
		onChange: (value: string) => void;
		errorMessage?: string;
	}) => (
		<div>
			<label htmlFor="serviceType">Tipo de servicio</label>
			<select id="serviceType" onChange={(event) => onChange(event.target.value)} defaultValue="">
				<option value="">Seleccione</option>
				<option value="mantenimiento">Mantenimiento</option>
			</select>
			{errorMessage ? <p>{errorMessage}</p> : null}
		</div>
	),
}));

describe("New work request stabilization", () => {
	beforeEach(() => {
		mocks.mutate.mockReset();
		mocks.push.mockReset();
	});

	test("groups the single-page form and blocks an invalid payload with all field issues", () => {
		render(<NewWorkRequestPage />);

		expect(screen.getByRole("heading", { name: "Cliente y contacto" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Detalles del servicio" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Resumen de la solicitud" })).toBeInTheDocument();

		submitNewForm();

		expect(mocks.mutate).not.toHaveBeenCalled();
		expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos obligatorios");
		for (const message of [
			"Ingresa el nombre del solicitante",
			"Selecciona un cliente",
			"Selecciona o ingresa el sitio del servicio",
			"Selecciona el tipo de servicio",
			"El resumen debe tener al menos 5 caracteres",
			"La descripción debe tener al menos 10 caracteres",
		]) {
			expect(screen.getByText(message)).toBeInTheDocument();
		}
	});

	test("shows the other-channel issue and routes to the returned work request id after success", async () => {
		mocks.mutate.mockImplementation((_payload, options: { onSuccess: (created: {
			workRequest: { _id: string };
			serviceCase: { _id: string; code: string };
		}) => void }) => {
			options.onSuccess({
				workRequest: { _id: "507f1f77bcf86cd799439099" },
				serviceCase: { _id: "507f1f77bcf86cd799439088", code: "SC-2026-0001" },
			});
		});

		render(<NewWorkRequestPage />);
		fireEvent.change(screen.getByLabelText("Canal"), { target: { value: "other" } });
		submitNewForm();
		expect(screen.getByText("Especifica el canal de origen")).toBeInTheDocument();
		expect(mocks.mutate).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Seleccionar cliente prueba" }));
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar contacto prueba" }));
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar sede prueba" }));
		fireEvent.change(screen.getByLabelText("Tipo de servicio"), { target: { value: "mantenimiento" } });
		fireEvent.change(screen.getByLabelText("Resumen"), { target: { value: "Falla eléctrica" } });
		fireEvent.change(screen.getByLabelText("Descripcion"), { target: { value: "La instalación presenta una falla eléctrica." } });
		fireEvent.change(screen.getByLabelText("Especificar canal"), { target: { value: "Chat corporativo" } });
		submitNewForm();

		await waitFor(() => {
			expect(mocks.mutate).toHaveBeenCalledTimes(1);
			expect(mocks.push).toHaveBeenCalledWith("/work-requests/507f1f77bcf86cd799439099");
		});
		expect(mocks.mutate.mock.calls[0][0].requesterName).toBe("Ana Cliente");
	});
});
