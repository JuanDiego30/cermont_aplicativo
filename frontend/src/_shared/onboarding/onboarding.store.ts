"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
	seenTours: Record<string, boolean>;
	skippedTours: Record<string, boolean>;
	markSeen: (tourId: string) => void;
	markSkipped: (tourId: string) => void;
	resetTour: (tourId: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			seenTours: {},
			skippedTours: {},
			markSeen: (tourId) =>
				set((state) => ({
					seenTours: { ...state.seenTours, [tourId]: true },
					skippedTours: { ...state.skippedTours, [tourId]: false },
				})),
			markSkipped: (tourId) =>
				set((state) => ({
					seenTours: { ...state.seenTours, [tourId]: true },
					skippedTours: { ...state.skippedTours, [tourId]: true },
				})),
			resetTour: (tourId) =>
				set((state) => {
					const nextSeen = { ...state.seenTours };
					const nextSkipped = { ...state.skippedTours };
					delete nextSeen[tourId];
					delete nextSkipped[tourId];
					return { seenTours: nextSeen, skippedTours: nextSkipped };
				}),
		}),
		{
			name: "cermont-onboarding",
		},
	),
);
