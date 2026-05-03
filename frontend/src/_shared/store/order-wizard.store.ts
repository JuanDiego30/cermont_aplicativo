import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OrderWizardState {
	currentStep: number;
	formData: Record<string, unknown>;
	setStep: (step: number) => void;
	setFormData: (data: Partial<Record<string, unknown>>) => void;
	reset: () => void;
}

export const useOrderWizardStore = create<OrderWizardState>()(
	persist(
		(set) => ({
			currentStep: 0,
			formData: {},
			setStep: (step) => set({ currentStep: step }),
			setFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
			reset: () => set({ currentStep: 0, formData: {} }),
		}),
		{
			name: "cermont-order-wizard",
			// sessionStorage: persists across reloads within the tab, clears on tab close
			storage: createJSONStorage(() => sessionStorage),
			// Only persist step and form data, not the action functions
			partialize: (state) => ({
				currentStep: state.currentStep,
				formData: state.formData,
			}),
		},
	),
);
