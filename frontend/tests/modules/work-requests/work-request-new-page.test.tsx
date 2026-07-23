import type { CreateWorkRequestInput } from "@cermont/shared-types";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewWorkRequestPage from "@/app/(dashboard)/work-requests/new/page";

function submitForm(): void {
	const button = screen.getByRole("button", { name: /crear solicitud/i });
	const form = button.closest("form");
	if (form instanceof HTMLFormElement) {
		fireEvent.submit(form);
	}
}

interface CreatedWorkRequestResponse {
	workRequest: { _id: string };
	serviceCase: { _id: string; code: string };
}

interface MutationOptions {
	onSuccess: (created: CreatedWorkRequestResponse) => void;
}

const mocks = vi.hoisted(() => ({
	push: vi.fn(),
	safeParse: vi.fn(),
	mutate: vi.fn(
		(_payload: CreateWorkRequestInput, options: MutationOptions) =>
			options.onSuccess({
				workRequest: { _id: "work-request-42" },
				serviceCase: { _id: "service-case-9", code: "SC-009" },
			}),
	),
}));

vi.mock("@cermont/shared-types", () => ({
	CreateWorkRequestSchema: { safeParse: mocks.safeParse },
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mocks.push }),
}));

vi.mock("next/link", () => ({
	default: ({ children, href }: { children: ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

vi.mock("@/modules/work-requests/queries", () => ({
	useCreateWorkRequest: () => ({
		mutate: mocks.mutate,
		isPending: false,
		error: false,
	}),
}));

vi.mock("@/core/ui/Button", () => ({
	Button: ({ children, type }: { children: ReactNode; type: "submit" | "button" }) => (
		<button type={type}>{children}</button>
	),
}));

vi.mock("@/core/ui/CustomizableSelect", () => ({
	CustomizableSelect: ({
		label,
		name,
		value,
		onChange,
		errorMessage,
	}: {
		label: string;
		name: string;
		value: string;
		onChange: (value: string) => void;
		errorMessage?: string;
	}) => (
		<label>
			{label}
			<input name={name} value={value} onChange={(event) => onChange(event.target.value)} />
			{errorMessage ? <span>{errorMessage}</span> : false}
		</label>
	),
}));

vi.mock("@/modules/customers/ui/CustomerCombobox", () => ({
	CustomerCombobox: ({
		onChange,
	}: {
		onChange: (customer: {
			_id: string;
			name: string;
			nit: string;
			status: "active";
		}) => void;
	}) => (
		<>
			<button
				type="button"
				onClick={() =>
					onChange({ _id: "customer-1", name: "Cliente Uno", nit: "9001", status: "active" })
				}
			>
				Seleccionar Cliente Uno
			</button>
			<button
				type="button"
				onClick={() => onChange({ _id: "", name: "", nit: "", status: "active" })}
			>
				Limpiar cliente
			</button>
		</>
	),
}));

vi.mock("@/modules/customers/ui/ContactSelect", () => ({
	ContactSelect: () => <div>Selector de contacto</div>,
}));

vi.mock("@/modules/customers/ui/ServiceSiteSelect", () => ({
	ServiceSiteSelect: ({
		onChange,
	}: {
		onChange: (siteId: string, snapshot: { name: string; address: string; city: string }) => void;
	}) => (
		<button
			type="button"
			onClick={() =>
				onChange("site-1", {
					name: "Sede Norte",
					address: "Calle 1",
					city: "Bogotá",
				})
			}
		>
			Seleccionar Sede Norte
		</button>
	),
}));

vi.mock("@/modules/customers/ui/QuickCustomerModal", () => ({
	QuickCustomerModal: () => <div />,
}));

vi.mock("@/modules/documents/ui/ContextualDocumentUploadModal", () => ({
	ContextualDocumentUploadModal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("NewWorkRequestPage", () => {
	beforeEach(() => {
		mocks.push.mockReset();
		mocks.mutate.mockClear();
		mocks.safeParse.mockReset();
	});

	it("valida con el contrato antes de mutar y muestra todos los problemas por campo y de raíz", () => {
		mocks.safeParse.mockReturnValue({
			success: false,
			error: {
				issues: [
					{ path: ["requesterName"], message: "Solicitante requerido" },
					{ path: ["requesterEmail"], message: "Correo inválido" },
					{ path: ["clientName"], message: "Cliente requerido" },
					{ path: ["serviceSite"], message: "Sitio requerido" },
					{ path: ["serviceType"], message: "Servicio requerido" },
					{ path: ["shortDescription"], message: "Resumen requerido" },
					{ path: ["description"], message: "Descripción requerida" },
					{ path: ["customFields", "sourceChannelOther"], message: "Canal requerido" },
					{ path: [], message: "Revise los datos de la solicitud" },
				],
			},
		});

		render(<NewWorkRequestPage />);
		fireEvent.change(screen.getByLabelText("Canal"), { target: { value: "other" } });
		submitForm();

		for (const message of [
			"Solicitante requerido",
			"Correo inválido",
			"Cliente requerido",
			"Sitio requerido",
			"Servicio requerido",
			"Resumen requerido",
			"Descripción requerida",
			"Canal requerido",
			"Revise los datos de la solicitud",
		]) {
			expect(screen.getByText(message)).toBeVisible();
		}
		expect(mocks.safeParse).toHaveBeenCalledOnce();
		expect(mocks.mutate).not.toHaveBeenCalled();
	});

	it("impide enviar un cliente seleccionado sin sitio de servicio", () => {
		mocks.safeParse.mockReturnValue({
			success: false,
			error: { issues: [{ path: ["serviceSite"], message: "Seleccione un sitio de servicio" }] },
		});
		render(<NewWorkRequestPage />);

		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Cliente Uno" }));
		submitForm();

		expect(screen.getByText("Seleccione un sitio de servicio")).toBeVisible();
		expect(mocks.mutate).not.toHaveBeenCalled();
	});

	it("descarta el sitio manual al seleccionar un cliente y exige escoger una sede nueva", () => {
		mocks.safeParse.mockImplementation((payload: CreateWorkRequestInput) =>
			payload.serviceSite
				? { success: true, data: payload }
				: {
						success: false,
						error: {
							issues: [{ path: ["serviceSite"], message: "Seleccione una sede del cliente" }],
						},
					},
		);
		render(<NewWorkRequestPage />);

		fireEvent.change(screen.getByLabelText("Sitio de servicio"), {
			target: { value: "Bodega manual anterior" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Cliente Uno" }));
		submitForm();

		expect(screen.getByText("Seleccione una sede del cliente")).toBeVisible();
		expect(mocks.mutate).not.toHaveBeenCalled();
	});

	it("limpia el cliente seleccionado y su sitio dependiente cuando el combobox se vacía", () => {
		mocks.safeParse.mockReturnValue({ success: true, data: {} });
		render(<NewWorkRequestPage />);

		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Cliente Uno" }));
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Sede Norte" }));
		fireEvent.click(screen.getByRole("button", { name: "Limpiar cliente" }));

		expect(screen.getByLabelText("Nombre del cliente")).toHaveValue("");
		expect(screen.getByLabelText("Sitio de servicio")).toHaveValue("");
		expect(screen.queryByText("9001")).not.toBeInTheDocument();
	});

	it("muestra todos los problemas cuando un campo o la raíz tienen más de un issue", () => {
		mocks.safeParse.mockReturnValue({
			success: false,
			error: {
				issues: [
					{ path: ["requesterName"], message: "El nombre es obligatorio" },
					{ path: ["requesterName"], message: "El nombre debe ser completo" },
					{ path: [], message: "La solicitud tiene errores" },
					{ path: [], message: "Revise todos los campos" },
				],
			},
		});
		render(<NewWorkRequestPage />);

		submitForm();

		for (const issue of [
			"El nombre es obligatorio",
			"El nombre debe ser completo",
			"La solicitud tiene errores",
			"Revise todos los campos",
		]) {
			expect(screen.getByText(issue)).toBeVisible();
		}
		expect(mocks.mutate).not.toHaveBeenCalled();
	});

	it("redirige a la solicitud creada cuando la respuesta contiene solicitud y caso", () => {
		mocks.safeParse.mockImplementation((payload: CreateWorkRequestInput) => ({
			success: true,
			data: payload,
		}));
		render(<NewWorkRequestPage />);

		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Cliente Uno" }));
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar Sede Norte" }));
		fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana Solicitante" } });
		fireEvent.change(screen.getByLabelText("Tipo de servicio"), {
			target: { value: "electricidad" },
		});
		fireEvent.change(screen.getByLabelText("Resumen"), { target: { value: "Revisar tablero" } });
		fireEvent.change(screen.getByLabelText("Descripcion"), {
			target: { value: "Revisión completa del tablero eléctrico" },
		});
		submitForm();

		expect(mocks.safeParse.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.mutate.mock.invocationCallOrder[0],
		);
		expect(mocks.push).toHaveBeenCalledWith("/work-requests/work-request-42");
	});

	it("presenta dos secciones principales y un resumen contextual adaptable", () => {
		mocks.safeParse.mockReturnValue({ success: true, data: {} });
		render(<NewWorkRequestPage />);

		expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
			"Cliente y contacto",
			"Detalles del servicio",
		]);
		const summary = screen.getByTestId("work-request-context-summary");
		expect(summary).toHaveTextContent("Resumen de la solicitud");
		expect(summary).toHaveClass("lg:sticky");
	});
});
