import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ContactSelect } from "@/modules/customers/ui/ContactSelect";

const mocks = vi.hoisted(() => ({
	contacts: vi.fn(),
	mutate: vi.fn(),
}));

vi.mock("@/modules/customers/queries", () => ({
	useCustomerContacts: () => mocks.contacts(),
	useCreateCustomerContact: () => ({ mutate: mocks.mutate, isPending: false }),
}));

function ContactHarness({
	legacyContact,
}: {
	legacyContact?: { name: string; email?: string; phone?: string };
}) {
	const [value, setValue] = useState<string>();
	const [selectedName, setSelectedName] = useState("");
	return (
		<>
			<ContactSelect
				customerId="507f1f77bcf86cd799439011"
				value={value}
				legacyContact={legacyContact}
				onChange={(id, snapshot) => {
					setValue(id);
					setSelectedName(snapshot.name);
				}}
				onCreated={(id) => setValue(id)}
			/>
			<output aria-label="Contacto seleccionado">{selectedName}</output>
		</>
	);
}

describe("ContactSelect", () => {
	beforeEach(() => {
		mocks.contacts.mockReset();
		mocks.mutate.mockReset();
	});

	test("selects the actual primary nested contact once when contacts load", async () => {
		mocks.contacts.mockReturnValue({
			data: [{
				_id: "507f1f77bcf86cd799439012",
				name: "Ana Cliente",
				email: "ana@example.com",
				isPrimary: true,
				isActive: true,
			}],
			isLoading: false,
			isError: false,
		});

		render(<ContactHarness />);

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Seleccionar contacto" })).toHaveTextContent(
				"Ana Cliente (principal)",
			),
		);
		expect(screen.queryByText("Ana ClienteAna Cliente")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Contacto seleccionado")).toHaveTextContent("Ana Cliente");
	});

	test("adapts and selects the inherited primary contact of legacy customers", async () => {
		mocks.contacts.mockReturnValue({ data: [], isLoading: false, isError: false });
		render(
			<ContactHarness
				legacyContact={{
					name: "Contacto Heredado",
					email: "heredado@example.com",
					phone: "3007654321",
				}}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Seleccionar contacto" })).toHaveTextContent(
				"Contacto Heredado",
			);
			expect(screen.getByLabelText("Contacto seleccionado")).toHaveTextContent(
				"Contacto Heredado",
			);
		});
	});

	test("shows empty state when no contacts exist", async () => {
		mocks.contacts.mockReturnValue({ data: [], isLoading: false, isError: false });
		render(<ContactHarness />);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Seleccionar contacto" })).toHaveTextContent("Seleccionar contacto");
		});
	});

	test("immediately selects a newly created contact", async () => {
		mocks.contacts.mockReturnValue({ data: [], isLoading: false, isError: false });
		mocks.mutate.mockImplementation((_variables, options: { onSuccess: (contact: {
			_id: string;
			name: string;
			isPrimary: boolean;
			isActive: boolean;
		}) => void }) => options.onSuccess({
			_id: "507f1f77bcf86cd799439099",
			name: "Contacto Nuevo",
			isPrimary: false,
			isActive: true,
		}));

		render(<ContactHarness />);
		fireEvent.click(screen.getByRole("button", { name: "Seleccionar contacto" }));
		fireEvent.click(screen.getByRole("button", { name: "Crear contacto nuevo" }));
		fireEvent.change(screen.getByLabelText("Nombre del contacto"), { target: { value: "Contacto Nuevo" } });
		fireEvent.click(screen.getByRole("button", { name: "Crear" }));

		await waitFor(() => expect(screen.getByRole("button", { name: "Seleccionar contacto" })).toHaveTextContent("Contacto Nuevo"));
	});
});
