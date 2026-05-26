import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	DynamicFormRenderer,
	type DynamicFormSchema,
} from "@/modules/templates/ui/DynamicFormRenderer";

describe("DynamicFormRenderer", () => {
	it("renders CERMONT field types and persists custom options in the field value", () => {
		const onFieldChange = vi.fn();
		const schema: DynamicFormSchema = {
			title: "ATS de ejecucion",
			sections: [
				{
					id: "execution",
					title: "Ejecucion",
					fields: [
						{
							key: "activity_cost",
							label: "Costo de actividad",
							type: "currency",
						},
						{
							key: "ppe",
							label: "EPP requerido",
							type: "multi_select",
							options: ["Casco", "Guantes"],
							allowOtherOption: true,
							otherOptionLabel: "Personalizado",
						},
						{
							key: "risk_checklist",
							label: "Checklist de riesgos",
							type: "checklist",
							options: ["Bloqueo", "Alturas"],
						},
						{
							key: "location",
							label: "Ubicacion GPS",
							type: "gps",
						},
						{
							key: "measurements",
							label: "Mediciones",
							type: "table",
							columns: [{ key: "value", label: "Valor", type: "number" }],
						},
						{
							key: "evidence",
							label: "Evidencia fotografica",
							type: "evidence_block",
						},
					],
				},
			],
		};

		const { rerender } = render(
			<DynamicFormRenderer
				schema={schema}
				values={{}}
				errors={{}}
				onFieldChange={onFieldChange}
				formId="ats"
			/>,
		);

		expect(screen.getByLabelText(/costo de actividad/i)).toHaveAttribute("inputmode", "decimal");
		expect(screen.getByLabelText(/casco/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/bloqueo/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/ubicacion gps latitud/i)).toBeInTheDocument();
		expect(screen.getByRole("table", { name: /mediciones/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/evidencia fotografica notas/i)).toBeInTheDocument();

		fireEvent.click(screen.getByLabelText(/personalizado/i));
		expect(onFieldChange).toHaveBeenLastCalledWith("ppe", {
			selected: ["__cermont_other__"],
			otherValue: undefined,
		});

		rerender(
			<DynamicFormRenderer
				schema={schema}
				values={{ ppe: { selected: ["__cermont_other__"] } }}
				errors={{}}
				onFieldChange={onFieldChange}
				formId="ats"
			/>,
		);
		fireEvent.change(screen.getByLabelText(/epp requerido personalizado/i), {
			target: { value: "Careta dieléctrica" },
		});

		expect(onFieldChange).toHaveBeenLastCalledWith("ppe", {
			selected: ["__cermont_other__"],
			otherValue: "Careta dieléctrica",
		});
	});
});
