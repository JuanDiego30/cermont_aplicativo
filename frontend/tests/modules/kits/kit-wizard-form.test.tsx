import { CreateKitSchema } from "@cermont/shared-types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KitWizardForm } from "@/modules/kits/ui/KitWizardForm";

describe("KitWizardForm", () => {
	it("submits a shared-contract payload without missing optional values", async () => {
		const onSubmit = vi.fn().mockResolvedValue({});

		render(
			<KitWizardForm
				onSubmit={onSubmit}
				activityOptions={[{ value: "electrico", label: "Eléctrico" }]}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText("Kit para intervención eléctrica en campo"), {
			target: { value: "Kit de prueba" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Herramientas" }));
		fireEvent.change(screen.getByPlaceholderText("Nombre del ítem"), {
			target: { value: "Multímetro" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Crear kit" }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

		const payload = onSubmit.mock.calls[0][0];
		expect(payload.description).toBe("");
		expect(CreateKitSchema.safeParse(payload).success).toBe(true);
	});
});
