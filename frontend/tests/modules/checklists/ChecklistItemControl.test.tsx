import type { ChecklistItem } from "@cermont/shared-types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChecklistItemControl } from "@/modules/checklists/components/ChecklistItemControl";

vi.mock("@/modules/files/ui/ImageUploadField", () => ({
	ImageUploadField: ({ onSuccess }: { onSuccess: () => void }) => (
		<button type="button" onClick={onSuccess}>
			Adjuntar prueba
		</button>
	),
}));

const item: ChecklistItem = {
	id: "ats-1",
	category: "procedure",
	description: "ATS aprobado antes de iniciar el trabajo",
	required: true,
	isBlocking: true,
	result: "pending",
	completed: false,
	requiresPhoto: true,
	requiresSignature: true,
	evidenceAssetIds: [],
};

describe("ChecklistItemControl", () => {
	it("identifica controles bloqueantes y no permite aprobar sin foto", () => {
		render(
			<ChecklistItemControl
				item={item}
				checklistId="checklist-1"
				disabled={false}
				onResult={vi.fn()}
				onEvidenceUploaded={vi.fn()}
			/>,
		);

		expect(screen.getByText("Bloqueante")).toBeInTheDocument();
		expect(screen.getByText("Requiere foto")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Aprobar control" })).toBeDisabled();
	});

	it("habilita la aprobacion al adjuntar la evidencia requerida", () => {
		const onResult = vi.fn();
		render(
			<ChecklistItemControl
				item={item}
				checklistId="checklist-1"
				disabled={false}
				onResult={onResult}
				onEvidenceUploaded={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Adjuntar prueba" }));
		fireEvent.click(screen.getByRole("button", { name: "Aprobar control" }));

		expect(onResult).toHaveBeenCalledWith("passed", "");
	});

	it("exige descripcion antes de registrar un hallazgo", () => {
		const onResult = vi.fn();
		render(
			<ChecklistItemControl
				item={{ ...item, requiresPhoto: false }}
				checklistId="checklist-1"
				disabled={false}
				onResult={onResult}
				onEvidenceUploaded={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Reportar hallazgo" }));
		const saveButton = screen.getByRole("button", { name: "Guardar hallazgo" });
		expect(saveButton).toBeDisabled();

		fireEvent.change(screen.getByLabelText("Descripcion del hallazgo"), {
			target: { value: "Permiso vencido; detener la actividad." },
		});
		fireEvent.click(saveButton);

		expect(onResult).toHaveBeenCalledWith("failed", "Permiso vencido; detener la actividad.");
	});
});
