import { describe, expect, it } from "vitest";
import {
	createInitialPlanningWizardState,
	planningWizardReducer,
} from "@/modules/planning/ui/planning-wizard.reducer";

describe("planningWizardReducer", () => {
	it("creates the state with inherited location and safe defaults", () => {
		const state = createInitialPlanningWizardState("Campo Caño Limón");

		expect(state.place).toBe("Campo Caño Limón");
		expect(state.currentStep).toBe(1);
		expect(state.materials).toEqual([]);
		expect(state.astRequired).toBe(true);
	});

	it("updates text, business, boolean, and collection fields independently", () => {
		const initial = createInitialPlanningWizardState("");
		const withText = planningWizardReducer(initial, {
			type: "SET_FIELD",
			payload: { field: "scope", value: "Inspección técnica de estructura" },
		});
		const withBusiness = planningWizardReducer(withText, {
			type: "SET_BUSINESS_UNIT",
			payload: "IT_MNT",
		});
		const withSafety = planningWizardReducer(withBusiness, {
			type: "SET_BOOLEAN",
			payload: { field: "ptwRequired", value: false },
		});

		expect(withSafety.scope).toBe("Inspección técnica de estructura");
		expect(withSafety.businessUnit).toBe("IT_MNT");
		expect(withSafety.ptwRequired).toBe(false);
	});

	it("moves between valid steps and resets the full state", () => {
		const initial = createInitialPlanningWizardState("Origen");
		const advanced = planningWizardReducer(initial, { type: "SET_STEP", payload: 5 });
		const changed = planningWizardReducer(advanced, {
			type: "SET_FIELD",
			payload: { field: "place", value: "Nuevo lugar" },
		});
		const reset = planningWizardReducer(changed, { type: "RESET" });

		expect(advanced.currentStep).toBe(5);
		expect(reset.currentStep).toBe(1);
		expect(reset.place).toBe("");
		expect(reset.scope).toBe("");
	});
});
